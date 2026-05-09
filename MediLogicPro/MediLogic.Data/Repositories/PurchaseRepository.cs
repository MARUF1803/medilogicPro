using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class PurchaseRepository : IPurchaseRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IBatchStockRepository _batchStockRepo;

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
                // 1. Initial Setup & Validation
                if (string.IsNullOrEmpty(purchase.PurchaseNo))
                {
                    purchase.PurchaseNo = "PO-" + DateTime.Now.ToString("yyyyMMddHHmmss");
                }
                purchase.PurchaseDate ??= DateTime.Now;
                purchase.Discount ??= 0;
                purchase.NetAmount ??= purchase.TotalAmount - (purchase.Discount ?? 0);
                purchase.BranchId ??= 1;
                purchase.ChangeAmount ??= 0;

                if (!purchase.SupplierId.HasValue) throw new Exception("Supplier is required.");
                var supplier = await _context.Parties.FindAsync(purchase.SupplierId);
                if (supplier == null) throw new Exception("Supplier not found.");

                // CRITICAL: Ensure Payments collection is not empty before tracking
                decimal totalPaidInput = 0m;
                if (purchase.PurchasePayments != null)
                {
                    totalPaidInput = purchase.PurchasePayments.Sum(p => p.Amount);
                }

                // 2. Save Master record (EF will handle Details and Payments navigation properties automatically)
                await _context.PurchaseMasters.AddAsync(purchase);
                // Save initially to get ID for Ledger references
                await _context.SaveChangesAsync();

                // 3. Update Inventory (BatchStock)
                foreach (var item in purchase.PurchaseDetails)
                {
                    await _batchStockRepo.UpdateStockAsync(
                        item.ProductId ?? 0,
                        purchase.BranchId ?? 0,
                        item.BatchNumber ?? "N/A",
                        item.Quantity,
                        item.UnitPrice,
                        item.UnitPrice * 1.2m,
                        item.ExpiryDate ?? DateOnly.FromDateTime(DateTime.Now.AddYears(1))
                    );
                }

                // 4. Create Ledger Entry for the Purchase itself (Total Liability)
                var purchaseLedger = new Ledger
                {
                    TransactionDate = DateTime.Now,
                    TransactionType = "Purchase Invoice",
                    ReferenceNo = purchase.PurchaseNo,
                    RelatedId = purchase.PurchaseId,
                    Debit = 0m,
                    Credit = purchase.NetAmount ?? purchase.TotalAmount,
                    PartyId = purchase.SupplierId,
                    BranchId = purchase.BranchId,
                    Description = $"Procurement Invoice: {purchase.PurchaseNo}"
                };
                await _context.Ledgers.AddAsync(purchaseLedger);

                // 5. Create Ledger Entries for each Payment
                decimal totalPaidSaved = 0m;
                if (purchase.PurchasePayments != null && purchase.PurchasePayments.Any())
                {
                    foreach (var payment in purchase.PurchasePayments)
                    {
                        totalPaidSaved += payment.Amount;
                        await _context.Ledgers.AddAsync(new Ledger
                        {
                            TransactionDate = DateTime.Now,
                            TransactionType = $"Purchase Payment - {payment.PaymentMethod}",
                            ReferenceNo = purchase.PurchaseNo,
                            RelatedId = purchase.PurchaseId,
                            Debit = payment.Amount,
                            Credit = 0m,
                            PartyId = purchase.SupplierId,
                            BranchId = purchase.BranchId,
                            Description = $"Payment via {payment.PaymentMethod}",
                            PaymentStatus = "Paid"
                        });
                    }
                }

                // 6. Handle Change Return (Supplier pays us back change)
                decimal changeAmt = purchase.ChangeAmount ?? 0m;
                if (changeAmt > 0)
                {
                    await _context.Ledgers.AddAsync(new Ledger
                    {
                        TransactionDate = DateTime.Now,
                        TransactionType = "Change Return",
                        ReferenceNo = purchase.PurchaseNo,
                        RelatedId = purchase.PurchaseId,
                        Debit = 0m,
                        Credit = changeAmt,
                        PartyId = purchase.SupplierId,
                        BranchId = purchase.BranchId,
                        Description = $"Change received back for {purchase.PurchaseNo}"
                    });
                }

                // 7. Update Supplier Balance
                // Net Amount = 2500, Total Paid = 500, Change = 0 -> Net Due = 2000
                decimal netAmount = purchase.NetAmount ?? purchase.TotalAmount;
                decimal actualPaidValue = totalPaidSaved - changeAmt;
                
                // Increase what we owe by net invoice, decrease by what we paid
                supplier.CurrentBalance = (supplier.CurrentBalance ?? 0m) + (netAmount - actualPaidValue);

                // 8. Final Commit
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return purchase;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                var msg = ex.InnerException?.Message ?? ex.Message;
                throw new Exception($"Purchase Error: {msg}");
            }
        }

        public async Task<IEnumerable<PurchaseMaster>> GetAllAsync()
        {
            return await _context.PurchaseMasters
                .Include(p => p.Supplier)
                .Include(p => p.Branch)
                .Include(p => p.PurchaseDetails).ThenInclude(d => d.Product)
                .Include(p => p.PurchasePayments)
                .ToListAsync();
        }

        public async Task<PurchaseMaster> GetByIdAsync(int id)
        {
            return (await _context.PurchaseMasters
                .Include(p => p.Supplier)
                .Include(p => p.Branch)
                .Include(p => p.PurchaseDetails).ThenInclude(d => d.Product)
                .Include(p => p.PurchasePayments)
                .FirstOrDefaultAsync(p => p.PurchaseId == id))!;
        }
    }
}