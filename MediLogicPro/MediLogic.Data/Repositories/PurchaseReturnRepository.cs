using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class PurchaseReturnRepository : IPurchaseReturnRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IBatchStockRepository _batchStockRepo;

        public PurchaseReturnRepository(ApplicationDbContext context, IBatchStockRepository batchStockRepo)
        {
            _context = context;
            _batchStockRepo = batchStockRepo;
        }

        public async Task<PurchaseReturnMaster> CreateReturnAsync(PurchaseReturnMaster returnMaster)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                returnMaster.ReturnDate = DateTime.Now;
                returnMaster.ReturnNo = "PR-" + DateTime.Now.ToString("yyyyMMddHHmmss"); 

                // 1. Get original purchase details for price restoration
                var purchase = await _context.PurchaseMasters
                    .Include(p => p.PurchaseDetails)
                    .FirstOrDefaultAsync(p => p.PurchaseId == returnMaster.PurchaseId);

                await _context.PurchaseReturnMasters.AddAsync(returnMaster);
                await _context.SaveChangesAsync();

                // 2. Update Inventory and Tracking
                foreach (var item in returnMaster.PurchaseReturnDetails)
                {
                    var originalDetail = purchase?.PurchaseDetails
                        .FirstOrDefault(d => d.ProductId == item.ProductId && d.BatchNumber == item.BatchNumber);
                    
                    if (originalDetail != null)
                    {
                        // Update detail's record of returned quantity
                        originalDetail.ReturnedQuantity = (originalDetail.ReturnedQuantity ?? 0m) + item.Quantity;
                    }

                    // Get current batch to preserve prices
                    var originalBatch = await _context.BatchStocks
                        .FirstOrDefaultAsync(s => s.ProductId == item.ProductId && s.BatchNumber == item.BatchNumber && s.BranchId == returnMaster.BranchId);

                    decimal purchasePrice = originalBatch?.PurchasePrice ?? item.UnitPrice;
                    decimal mrp = originalBatch?.Mrp ?? (item.UnitPrice * 1.2m);
                    var expiry = originalBatch?.ExpiryDate ?? DateOnly.FromDateTime(DateTime.Now.AddYears(1));

                    // REDUCE STOCK (negative quantity)
                    await _batchStockRepo.UpdateStockAsync(
                        item.ProductId ?? 0,
                        returnMaster.BranchId ?? 0,
                        item.BatchNumber ?? "N/A",
                        -item.Quantity, 
                        purchasePrice, 
                        mrp, 
                        expiry
                    );
                }

                // 3. Create Ledger Entry for Return
                var ledgerEntry = new Ledger
                {
                    TransactionDate = DateTime.Now,
                    TransactionType = "Purchase Return",
                    ReferenceNo = returnMaster.ReturnNo,
                    Debit = returnMaster.TotalReturnAmount ?? 0m,
                    Credit = 0,
                    PartyId = returnMaster.SupplierId,
                    RelatedId = returnMaster.PurchaseReturnId,
                    BranchId = returnMaster.BranchId,
                    Description = $"Purchase Return: {returnMaster.ReturnNo} for Purchase: {purchase?.PurchaseNo}"
                };
                await _context.Ledgers.AddAsync(ledgerEntry);

                // 4. Update Party Balance
                if (returnMaster.SupplierId.HasValue)
                {
                    var supplier = await _context.Parties.FindAsync(returnMaster.SupplierId);
                    if (supplier != null)
                    {
                        // 1. Credit to wallet (or prepayments)
                        supplier.CreditBalance = (supplier.CreditBalance ?? 0m) + (returnMaster.TotalReturnAmount ?? 0m);

                        // 2. Decrease Payable (Amount we owe them decreases)
                        supplier.CurrentBalance = (supplier.CurrentBalance ?? 0m) - (returnMaster.TotalReturnAmount ?? 0m);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return returnMaster;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Return failed: " + ex.Message);
            }
        }

        public async Task<PurchaseReturnMaster?> GetByIdAsync(int id)
        {
            return await _context.PurchaseReturnMasters
                .Include(r => r.Supplier)
                .Include(r => r.Purchase)
                .Include(r => r.PurchaseReturnDetails).ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(r => r.PurchaseReturnId == id);
        }

        public async Task<IEnumerable<PurchaseReturnMaster>> GetAllReturnsAsync()
        {
            var data = await _context.PurchaseReturnMasters
                .Include(r => r.Supplier)
                .Include(r => r.Purchase)
                .Include(r => r.PurchaseReturnDetails)
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();

            // Fallback for legacy records
            foreach (var r in data)
            {
                if (r.TotalReturnAmount == null || r.TotalReturnAmount == 0)
                {
                    r.TotalReturnAmount = r.PurchaseReturnDetails?.Sum(d => d.Quantity * d.UnitPrice) ?? 0m;
                }
            }

            return data;
        }
    }
}