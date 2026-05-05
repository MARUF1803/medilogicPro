using MediLogic.Models;

namespace MediLogic.Data.Interfaces
{
    public interface IPurchaseRepository
    {
        Task<PurchaseMaster> CreateAsync(PurchaseMaster purchase);
        Task<IEnumerable<PurchaseMaster>> GetAllAsync();
        Task<PurchaseMaster> GetByIdAsync(int id);
    }
}