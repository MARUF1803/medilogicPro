using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface IPurchaseService
    {
        Task<PurchaseMaster> CreatePurchaseAsync(PurchaseMaster purchase);
        Task<IEnumerable<object>> GetAllPurchasesAsync();
        Task<object> GetPurchaseByIdAsync(int id);
        Task AddPaymentsAsync(int purchaseId, List<PurchasePayment> payments);
    }
}