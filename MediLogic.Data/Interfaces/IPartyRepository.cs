using MediLogic.Models;

namespace MediLogic.Data.Interfaces
{
    public interface IPartyRepository
    {
        Task<IEnumerable<Party>> GetAllAsync();
        Task<Party> GetByIdAsync(int id);
        Task<Party> AddAsync(Party party);
        Task UpdateAsync(Party party);
        Task DeleteAsync(int id);
    }
}