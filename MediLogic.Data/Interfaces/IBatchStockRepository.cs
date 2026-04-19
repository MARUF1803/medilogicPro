using MediLogic.Models;

namespace MediLogic.Data.Interfaces
{
    public interface IBatchStockRepository
    {
        Task UpdateStockAsync(int productId, int branchId, string batchNumber, decimal quantity, decimal purchasePrice, decimal mrp, DateOnly expiryDate);
        Task<IEnumerable<BatchStock>> GetStockByProductAsync(int productId, int branchId);
        Task<IEnumerable<BatchStock>> GetAllAsync();
        Task SyncMissingStockFromPurchasesAsync();
    }
}