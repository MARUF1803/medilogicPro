using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface IPurchaseService
    {
        Task<PurchaseMaster> CreatePurchaseAsync(PurchaseMaster purchase);
        Task<IEnumerable<PurchaseMaster>> GetAllPurchasesAsync();
        Task<PurchaseMaster> GetPurchaseByIdAsync(int id);
    }
}