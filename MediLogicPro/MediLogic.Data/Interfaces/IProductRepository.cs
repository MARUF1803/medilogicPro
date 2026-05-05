using MediLogic.Models;

namespace MediLogic.Data.Interfaces
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllAsync();
        Task<Product> GetByIdAsync(int id);

        // NEW: Method for POS searching
        Task<IEnumerable<Product>> SearchProductsAsync(string term);

        Task<Product> AddAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(int id);
    }
}