using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class PurchaseReturnService : IPurchaseReturnService
    {
        private readonly IPurchaseReturnRepository _repo;
        public PurchaseReturnService(IPurchaseReturnRepository repo) => _repo = repo;

        public async Task<PurchaseReturnMaster> ProcessReturnAsync(PurchaseReturnMaster returnData)
            => await _repo.CreateReturnAsync(returnData);

        public async Task<IEnumerable<PurchaseReturnMaster>> GetAllReturnsAsync()
            => await _repo.GetAllReturnsAsync();
    }
}