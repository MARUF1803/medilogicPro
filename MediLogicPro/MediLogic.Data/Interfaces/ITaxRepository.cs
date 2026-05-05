using MediLogic.Models;

namespace MediLogic.Data.Interfaces
{
    public interface ITaxRepository
    {
        Task<IEnumerable<Tax>> GetAllAsync();
        Task<Tax> GetByIdAsync(int id);
        Task<Tax> AddAsync(Tax tax);
        Task UpdateAsync(Tax tax);
        Task DeleteAsync(int id);
    }
}