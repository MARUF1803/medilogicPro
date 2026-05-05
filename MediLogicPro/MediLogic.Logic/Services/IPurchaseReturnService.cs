using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface IPurchaseReturnService
    {
        Task<PurchaseReturnMaster?> GetReturnByIdAsync(int id);
        Task<PurchaseReturnMaster> ProcessReturnAsync(PurchaseReturnMaster returnData);
        Task<IEnumerable<PurchaseReturnMaster>> GetAllReturnsAsync();
    }
}