using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllProductsAsync();
        Task<Product> GetProductByIdAsync(int id);
        Task<Product> CreateProductAsync(Product product);
        Task UpdateProductAsync(Product product);
        Task DeleteProductAsync(int id);

        // NEW: Method definition for POS Search
        Task<IEnumerable<object>> SearchInventoryAsync(string term, int branchId);
    }
}