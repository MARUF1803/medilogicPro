using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface IPartyService
    {
        Task<IEnumerable<Party>> GetAllPartiesAsync();
        Task<Party> GetPartyByIdAsync(int id);
        Task<Party> CreatePartyAsync(Party party);
        Task UpdatePartyAsync(Party party);
        Task DeletePartyAsync(int id);
    }
}