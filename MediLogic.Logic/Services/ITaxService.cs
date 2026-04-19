using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface ITaxService
    {
        Task<IEnumerable<Tax>> GetAllTaxesAsync();
        Task<Tax> GetTaxByIdAsync(int id);
        Task<Tax> CreateTaxAsync(Tax tax);
        Task UpdateTaxAsync(Tax tax);
        Task DeleteTaxAsync(int id);
    }
}