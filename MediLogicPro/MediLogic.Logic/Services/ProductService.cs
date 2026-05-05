using MediLogic.Data.Interfaces;
using MediLogic.Models;
using MediLogic.Models.DTOs;
using MediLogic.Logic.Extensions;

namespace MediLogic.Logic.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;
        private readonly ICurrentBranchService _branchService;

        public ProductService(IProductRepository repo, ICurrentBranchService branchService)
        {
            _repo = repo;
            _branchService = branchService;
        }

        public async Task<IEnumerable<object>> SearchInventoryAsync(string term, int branchId)
        {
            // Call the search method we just added to the repository
            var products = await _repo.SearchProductsAsync(term);

            // Fetch all stock for these products in this branch to join
            var productIds = products.Select(p => p.ProductId).ToList();
            
            // We need access to BatchStock information here. 
            // In a real app, I'd add a method to IBatchStockRepository for this.
            // For now, I'll use the repository's internal context if available, 
            // but the cleaner way is to just do a projection in a new method.
            
            // For this fix, I'll assume I have to return the stock. 
            // I'll use a slightly more expensive join for accuracy.
            return products.Select(p => new
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductCode = p.ProductCode,
                Strength = p.Strength,
                Mrp = p.SalePrice, // Mapping SalePrice to MRP for POS
                CategoryName = p.Category?.CategoryName,
                // We'll calculate this dynamically for now. 
                // Note: In production, this should be a single optimized query in the data layer.
                TotalStock = p.BatchStocks?
                    .Where(bs => bs.BranchId == branchId)
                    .Sum(bs => (decimal?)bs.CurrentBalance) ?? 0m
            });
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync() 
        {
            var products = await _repo.GetAllAsync();
            return products.Select(p => {
                var dto = p.ToDto();
                // Batch-wise Pricing Logic: Override default prices with the latest active batch price
                var latestBatch = p.BatchStocks?.OrderByDescending(b => b.ExpiryDate).FirstOrDefault();
                if (latestBatch != null) {
                    dto.SalePrice = latestBatch.Mrp > 0 ? latestBatch.Mrp : dto.SalePrice;
                    dto.PurchasePrice = latestBatch.PurchasePrice > 0 ? latestBatch.PurchasePrice : dto.PurchasePrice;
                }
                return dto;
            })!;
        }
        public async Task<ProductDto> GetProductByIdAsync(int id) 
        {
            var product = await _repo.GetByIdAsync(id);
            return product?.ToDto()!;
        }
        public async Task<ProductDto> CreateProductAsync(ProductDto productDto) 
        {
            var product = productDto.ToEntity();
            if (product == null) throw new ArgumentNullException(nameof(productDto));

            // Check if product with same name/generic/strength already exists globally
            var existing = (await _repo.GetAllAsync()).FirstOrDefault(p => 
                p.ProductName.Equals(product.ProductName, StringComparison.OrdinalIgnoreCase) && 
                (p.GenericName ?? "").Equals(product.GenericName ?? "", StringComparison.OrdinalIgnoreCase) &&
                (p.Strength ?? "").Equals(product.Strength ?? "", StringComparison.OrdinalIgnoreCase)
            );

            if (existing != null)
            {
                throw new Exception($"Product '{product.ProductName}' with this generic/strength already exists in the common catalog.");
            }

            // DO NOT assign current branch ID anymore - make it common/global
            product.BranchId = null; 
            
            var created = await _repo.AddAsync(product);
            return created.ToDto()!;
        }
        public async Task UpdateProductAsync(ProductDto productDto) 
        {
            var product = productDto.ToEntity();
            if (product == null) throw new ArgumentNullException(nameof(productDto));
            
            // Ensure product remains/becomes global on update
            product.BranchId = null;
            
            await _repo.UpdateAsync(product);
        }
        public async Task DeleteProductAsync(int id) => await _repo.DeleteAsync(id);
    }
}