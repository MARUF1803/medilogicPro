using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class BatchStockService : IBatchStockService
    {
        private readonly IBatchStockRepository _repo;
        private readonly ICurrentBranchService _currentBranchService;

        public BatchStockService(IBatchStockRepository repo, ICurrentBranchService currentBranchService)
        {
            _repo = repo;
            _currentBranchService = currentBranchService;
        }

        public async Task<IEnumerable<BatchStock>> GetAllStocksAsync()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var allStocks = await _repo.GetAllAsync();
            return allStocks.Where(s => s.BranchId == branchId);
        }

        public async Task UpdateStockEntryAsync(int productId, int branchId, string batchNumber, decimal quantity, decimal purchasePrice, decimal mrp, DateOnly expiryDate)
        {
            await _repo.UpdateStockAsync(productId, branchId, batchNumber, quantity, purchasePrice, mrp, expiryDate);
        }

        public async Task AdjustStockAsync(StockAdjustment adjustment)
        {
            await _repo.AdjustStockAsync(adjustment);
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

        public async Task<object> GetExpiryStatsAsync()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var allStocks = (await _repo.GetAllAsync()).Where(s => s.BranchId == branchId).ToList();
            var now = DateOnly.FromDateTime(DateTime.Now);
            var thirtyDays = now.AddDays(30);
            var sixtyDays = now.AddDays(60);
            var ninetyDays = now.AddDays(90);

            var highRisk = allStocks.Where(s => s.ExpiryDate <= thirtyDays && s.CurrentBalance > 0).ToList();
            var mediumRisk = allStocks.Where(s => s.ExpiryDate > thirtyDays && s.ExpiryDate <= sixtyDays && s.CurrentBalance > 0).ToList();
            var lowRisk = allStocks.Where(s => s.ExpiryDate > sixtyDays && s.ExpiryDate <= ninetyDays && s.CurrentBalance > 0).ToList();

            return new
            {
                HighRiskCount = highRisk.Count,
                MediumRiskCount = mediumRisk.Count,
                LowRiskCount = lowRisk.Count,
                HighRiskValue = highRisk.Sum(s => s.CurrentBalance * s.PurchasePrice),
                TotalRiskCount = highRisk.Count + mediumRisk.Count + lowRisk.Count
            };
        }

        public async Task<IEnumerable<object>> GetProductWiseStockAsync()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var allStocks = await _repo.GetAllAsync();

            return allStocks
                .Where(s => s.BranchId == branchId)
                .GroupBy(s => new { s.ProductId, ProductName = s.Product?.ProductName, GenericName = s.Product?.GenericName, Strength = s.Product?.Strength })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName ?? "Unknown Product",
                    GenericName = g.Key.GenericName ?? "—",
                    Strength = g.Key.Strength ?? "—",
                    TotalBalance = g.Sum(s => s.CurrentBalance),
                    BatchCount = g.Count(),
                    AvgPurchasePrice = g.Count() > 0 ? g.Average(s => s.PurchasePrice) : 0,
                    MaxMrp = g.Count() > 0 ? g.Max(s => s.Mrp) : 0,
                    LatestExpiry = g.Count() > 0 ? g.Max(s => s.ExpiryDate) : default
                })
                .OrderBy(p => p.ProductName);
        }
    }
}