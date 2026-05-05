using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class BatchStockRepository : IBatchStockRepository
    {
        private readonly ApplicationDbContext _context;

        public BatchStockRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task UpdateStockAsync(int productId, int branchId, string batchNumber, decimal quantity, decimal purchasePrice, decimal mrp, DateOnly expiryDate)
        {
            var stock = _context.BatchStocks.Local
                .FirstOrDefault(s => s.ProductId == productId && s.BranchId == branchId && s.BatchNumber == batchNumber);

            if (stock == null)
            {
                stock = await _context.BatchStocks
                    .FirstOrDefaultAsync(s => s.ProductId == productId && s.BranchId == branchId && s.BatchNumber == batchNumber);
            }

            try
            {
                if (stock != null)
                {
                    stock.CurrentBalance += quantity;
                    stock.PurchasePrice = purchasePrice;
                    stock.Mrp = mrp;
                    stock.LastUpdated = DateTime.Now;
                    stock.ExpiryDate = expiryDate;
                }
                else
                {
                    var newStock = new BatchStock
                    {
                        ProductId = productId,
                        BranchId = branchId,
                        BatchNumber = batchNumber,
                        ExpiryDate = expiryDate,
                        PurchasePrice = purchasePrice,
                        Mrp = mrp,
                        CurrentBalance = quantity,
                        LastUpdated = DateTime.Now
                    };
                    await _context.BatchStocks.AddAsync(newStock);
                }
            }
            catch (DbUpdateConcurrencyException ex)
            {
                var entry = ex.Entries.Single();
                var databaseValues = await entry.GetDatabaseValuesAsync();

                if (databaseValues == null)
                {
                    throw new Exception("Stock record was deleted by another user.");
                }

                throw new Exception("Concurrency conflict detected. The stock was updated by someone else. Please refresh and try again.");
            }
        }

        public async Task<IEnumerable<BatchStock>> GetStockByProductAsync(int productId, int branchId)
        {
            return await _context.BatchStocks
                .Where(s => s.ProductId == productId && s.BranchId == branchId && s.CurrentBalance > 0)
                .OrderBy(s => s.ExpiryDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<BatchStock>> GetAllAsync()
        {
            return await _context.BatchStocks.Include(s => s.Product).Include(s => s.Branch).ToListAsync();
        }

        public async Task SyncMissingStockFromPurchasesAsync()
        {
            var purchaseDetails = await _context.PurchaseDetails.Include(pd => pd.Purchase).ToListAsync();

            foreach (var item in purchaseDetails)
            {
                var branchId = item.Purchase?.BranchId ?? 0;
                var existingStock = await _context.BatchStocks
                    .FirstOrDefaultAsync(s => s.ProductId == item.ProductId && s.BranchId == branchId && s.BatchNumber == item.BatchNumber);

                if (existingStock == null)
                {
                    await _context.BatchStocks.AddAsync(new BatchStock
                    {
                        ProductId = item.ProductId,
                        BranchId = branchId,
                        BatchNumber = item.BatchNumber ?? "N/A",
                        ExpiryDate = item.ExpiryDate ?? DateOnly.FromDateTime(DateTime.Now.AddYears(1)),
                        PurchasePrice = item.UnitPrice,
                        Mrp = item.UnitPrice * 1.2m,
                        CurrentBalance = item.Quantity,
                        LastUpdated = DateTime.Now
                    });
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task AdjustStockAsync(StockAdjustment adjustment)
        {
            var stock = await _context.BatchStocks
                .FirstOrDefaultAsync(s => s.ProductId == adjustment.ProductId && s.BranchId == adjustment.BranchId && s.BatchNumber == adjustment.BatchNumber);

            if (stock == null) throw new Exception("Stock record not found for adjustment.");

            // Update Stock Balance
            stock.CurrentBalance += adjustment.AdjustedQuantity;
            stock.LastUpdated = DateTime.Now;

            // Log Adjustment
            await _context.StockAdjustments.AddAsync(adjustment);
            await _context.SaveChangesAsync();
        }
    }
}