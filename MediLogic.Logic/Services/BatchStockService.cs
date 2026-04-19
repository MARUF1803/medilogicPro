using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class BatchStockService : IBatchStockService
    {
        private readonly IBatchStockRepository _repo;

        public BatchStockService(IBatchStockRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<BatchStock>> GetAllStocksAsync() => await _repo.GetAllAsync();

        public async Task UpdateStockEntryAsync(int productId, int branchId, string batchNumber, decimal quantity, decimal purchasePrice, decimal mrp, DateOnly expiryDate)
        {
            await _repo.UpdateStockAsync(productId, branchId, batchNumber, quantity, purchasePrice, mrp, expiryDate);
        }

        public async Task<object?> GetFifoBatchInfoAsync(int productId, int branchId)
        {
            var stocks = await _repo.GetStockByProductAsync(productId, branchId);
            if (stocks == null || !stocks.Any()) return null;

            var firstBatch = stocks.First();
            return new
            {
                firstBatch.BatchNumber,
                SellingPrice = firstBatch.Mrp,
                firstBatch.PurchasePrice,
                firstBatch.CurrentBalance,
                TotalBalance = stocks.Sum(s => s.CurrentBalance)
            };
        }

        public async Task<IEnumerable<object>> GetProductBatchesAsync(int productId, int branchId)
        {
            var stocks = await _repo.GetStockByProductAsync(productId, branchId);
            return stocks.Select(s => new { s.BatchNumber, s.CurrentBalance, s.Mrp });
        }

        public async Task SyncOldDataAsync() => await _repo.SyncMissingStockFromPurchasesAsync();
    }
}