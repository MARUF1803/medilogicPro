using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;

        public ProductService(IProductRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<object>> SearchInventoryAsync(string term, int branchId)
        {
            // Call the search method we just added to the repository
            var products = await _repo.SearchProductsAsync(term);

            // Shape the data for React to match your UI needs
            return products.Select(p => new
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductCode = p.ProductCode,
                Mrp = p.SalePrice, // Mapping SalePrice to MRP for POS
                CategoryName = p.Category?.CategoryName
            });
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync() => await _repo.GetAllAsync();
        public async Task<Product> GetProductByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<Product> CreateProductAsync(Product product) => await _repo.AddAsync(product);
        public async Task UpdateProductAsync(Product product) => await _repo.UpdateAsync(product);
        public async Task DeleteProductAsync(int id) => await _repo.DeleteAsync(id);
    }
}