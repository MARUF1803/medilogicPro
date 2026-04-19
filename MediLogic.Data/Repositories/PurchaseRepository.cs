using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class PurchaseRepository : IPurchaseRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IBatchStockRepository _batchStockRepo; // নতুন ইনজেকশন

        public PurchaseRepository(ApplicationDbContext context, IBatchStockRepository batchStockRepo)
        {
            _context = context;
            _batchStockRepo = batchStockRepo;
        }

        public async Task<PurchaseMaster> CreateAsync(PurchaseMaster purchase)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Duplicate Invoice Check
                bool exists = await _context.PurchaseMasters
                    .AnyAsync(p => p.PurchaseNo == purchase.PurchaseNo && p.SupplierId == purchase.SupplierId);

                if (exists) throw new Exception("Duplicate Purchase Invoice Number for this supplier.");

                purchase.PurchaseDate = DateTime.Now;

                // 2. Save Purchase Master and Details
                await _context.PurchaseMasters.AddAsync(purchase);
                await _context.SaveChangesAsync();

                // 3. Update Inventory (BatchStock) for each item
                foreach (var item in purchase.PurchaseDetails)
                {
                    // Logic: If batch exists, it adds quantity. If not, it creates a new record.
                    await _batchStockRepo.UpdateStockAsync(
                        item.ProductId ?? 0,
                        purchase.BranchId ?? 0,
                        item.BatchNumber ?? "N/A",
                        item.Quantity,
                        item.UnitPrice,
                        item.UnitPrice * 1.2m, // Example: MRP is 20% more than purchase price
                        item.ExpiryDate ?? DateOnly.FromDateTime(DateTime.Now.AddYears(1))
                    );
                }

                await transaction.CommitAsync();
                return purchase;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<PurchaseMaster>> GetAllAsync()
        {
            return await _context.PurchaseMasters
                .Include(p => p.Supplier)
                .Include(p => p.Branch)
                .Include(p => p.PurchaseDetails)
                    .ThenInclude(d => d.Product)
                .ToListAsync();
        }

        public async Task<PurchaseMaster> GetByIdAsync(int id)
        {
            return await _context.PurchaseMasters
                .Include(p => p.Supplier)
                .Include(p => p.Branch)
                .Include(p => p.PurchaseDetails)
                    .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(p => p.PurchaseId == id);
        }
    }
}