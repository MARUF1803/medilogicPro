using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface IBatchStockService
    {
        Task<IEnumerable<BatchStock>> GetAllStocksAsync();
        Task<object?> GetFifoBatchInfoAsync(int productId, int branchId);
        Task<IEnumerable<object>> GetProductBatchesAsync(int productId, int branchId);
        Task SyncOldDataAsync();
        Task UpdateStockEntryAsync(int productId, int branchId, string batchNumber, decimal quantity, decimal purchasePrice, decimal mrp, DateOnly expiryDate);
    }
}