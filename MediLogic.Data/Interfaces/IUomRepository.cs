using MediLogic.Models;

namespace MediLogic.Data.Interfaces
{
    public interface IUomRepository
    {
        Task<IEnumerable<Uom>> GetAllAsync();
        Task<Uom> GetByIdAsync(int id);
        Task<Uom> AddAsync(Uom uom);
        Task UpdateAsync(Uom uom);
        Task DeleteAsync(int id);
    }
}