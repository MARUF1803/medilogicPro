using MediLogic.Models;

namespace MediLogic.Data.Interfaces
{
    public interface IPurchaseReturnRepository
    {
        Task<PurchaseReturnMaster?> GetByIdAsync(int id);
        Task<PurchaseReturnMaster> CreateReturnAsync(PurchaseReturnMaster returnMaster);
        Task<IEnumerable<PurchaseReturnMaster>> GetAllReturnsAsync();
    }
}