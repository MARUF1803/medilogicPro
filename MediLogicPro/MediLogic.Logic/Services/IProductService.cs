using MediLogic.Models;
using MediLogic.Models.DTOs;

namespace MediLogic.Logic.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(ProductDto productDto);
        Task UpdateProductAsync(ProductDto productDto);
        Task DeleteProductAsync(int id);

        // NEW: Method definition for POS Search
        Task<IEnumerable<object>> SearchInventoryAsync(string term, int branchId);
        Task<object?> GetProductByBarcodeAsync(string barcode, int branchId);
    }
}