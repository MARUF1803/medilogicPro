using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class PurchaseReturnService : IPurchaseReturnService
    {
        private readonly IPurchaseReturnRepository _repo;
        private readonly ICurrentBranchService _currentBranchService;

        public PurchaseReturnService(IPurchaseReturnRepository repo, ICurrentBranchService currentBranchService)
        {
            _repo = repo;
            _currentBranchService = currentBranchService;
        }

        public async Task<PurchaseReturnMaster> ProcessReturnAsync(PurchaseReturnMaster returnData)
            => await _repo.CreateReturnAsync(returnData);

        public async Task<PurchaseReturnMaster?> GetReturnByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<IEnumerable<PurchaseReturnMaster>> GetAllReturnsAsync()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var data = await _repo.GetAllReturnsAsync();
            return data.Where(r => r.BranchId == branchId);
        }
    }
}