using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class PurchaseService : IPurchaseService
    {
        private readonly IPurchaseRepository _repo;

        public PurchaseService(IPurchaseRepository repo)
        {
            _repo = repo;
        }

        public async Task<PurchaseMaster> CreatePurchaseAsync(PurchaseMaster purchase) => await _repo.CreateAsync(purchase);
        public async Task<IEnumerable<PurchaseMaster>> GetAllPurchasesAsync() => await _repo.GetAllAsync();
        public async Task<PurchaseMaster> GetPurchaseByIdAsync(int id) => await _repo.GetByIdAsync(id);
    }
}