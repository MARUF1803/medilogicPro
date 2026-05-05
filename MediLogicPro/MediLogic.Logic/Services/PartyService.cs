using MediLogic.Data.Interfaces;
using MediLogic.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MediLogic.Logic.Services
{
    public class PartyService : IPartyService
    {
        private readonly IPartyRepository _repo;
        private readonly ICurrentBranchService _currentBranchService;

        public PartyService(IPartyRepository repo, ICurrentBranchService currentBranchService)
        {
            _repo = repo;
            _currentBranchService = currentBranchService;
        }

        public async Task<IEnumerable<Party>> GetAllPartiesAsync()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var parties = await _repo.GetAllAsync();
            return parties.Where(p => p.BranchId == branchId || p.BranchId == null); // Allow global if applicable, but mostly branch-based
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

        public async Task<IEnumerable<Party>> SearchPartyAsync(string term)
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var parties = await _repo.SearchAsync(term);
            return parties.Where(p => p.BranchId == branchId || p.BranchId == null);
        }
    }
}