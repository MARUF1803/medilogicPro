using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface IUomService
    {
        Task<IEnumerable<Uom>> GetAllUomsAsync();
        Task<Uom> GetUomByIdAsync(int id);
        Task<Uom> CreateUomAsync(Uom uom);
        Task UpdateUomAsync(Uom uom);
        Task DeleteUomAsync(int id);
    }
}