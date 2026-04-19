using MediLogic.Data.Interfaces;
using MediLogic.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MediLogic.Logic.Services
{
    public class PartyService : IPartyService
    {
        private readonly IPartyRepository _repo;

        public PartyService(IPartyRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Party>> GetAllPartiesAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<Party> GetPartyByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<Party> CreatePartyAsync(Party party)
        {
            return await _repo.AddAsync(party);
        }

        public async Task UpdatePartyAsync(Party party)
        {
            await _repo.UpdateAsync(party);
        }

        public async Task DeletePartyAsync(int id)
        {
            // Usually, we don't hard delete parties to maintain transaction history
            await _repo.DeleteAsync(id);
        }
    }
}