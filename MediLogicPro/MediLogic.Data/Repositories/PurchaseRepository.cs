using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class PurchaseRepository : IPurchaseRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IBatchStockRepository _batchStockRepo; // New Dependency Injection

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
                purchase.Discount ??= 0;
                if (purchase.NetAmount == null || purchase.NetAmount == 0)
                {
                    purchase.NetAmount = purchase.TotalAmount - (purchase.Discount ?? 0);
                }

                if (string.IsNullOrEmpty(purchase.PurchaseNo))
                {
                    purchase.PurchaseNo = "PO-" + DateTime.Now.ToString("yyyyMMddHHmmss");
                }

                // 2. Map root PaymentMethod to PurchasePayments if missing (e.g. from React UI)
                if ((purchase.PurchasePayments == null || !purchase.PurchasePayments.Any()) && !string.IsNullOrEmpty(purchase.PaymentMethod) && purchase.PaymentMethod != "Pending")
                {
                    purchase.PurchasePayments = new List<PurchasePayment>
                    {
                        new PurchasePayment
                        {
                            PaymentMethod = purchase.PaymentMethod,
                            Amount = purchase.NetAmount ?? purchase.TotalAmount,
                            PaymentStatus = "Paid",
                            TransactionId = purchase.PaymentReference,
                            PaymentDate = purchase.PurchaseDate ?? DateTime.Now
                        }
                    };
                }

                // 3. Save Purchase Master and Details
                decimal totalPaid = purchase.PurchasePayments?.Sum(p => p.Amount) ?? 0m;
                
                // Determine Status (Calculated on-the-fly in UI since PurchaseMaster lacks PaymentStatus field)
                // purchase.PaymentStatus = totalPaid >= purchase.TotalAmount ? "Paid" : (totalPaid > 0 ? "Partial" : "Pending");
                
                await _context.PurchaseMasters.AddAsync(purchase);
                await _context.SaveChangesAsync();

                // 3. Update Inventory (BatchStock) for each item
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

                // 4. Create Ledger Entry for the Purchase itself (Liability)
                var purchaseLedgerEntry = new Ledger
                {
                    TransactionDate = DateTime.Now,
                    TransactionType = "Purchase",
                    ReferenceNo = purchase.PurchaseNo,
                    Debit = 0m, 
                    Credit = purchase.NetAmount ?? purchase.TotalAmount, // Total liability after discount
                    PartyId = purchase.SupplierId,
                    RelatedId = purchase.PurchaseId,
                    BranchId = purchase.BranchId,
                    Description = $"Purchase Invoice: {purchase.PurchaseNo}"
                };
                await _context.Ledgers.AddAsync(purchaseLedgerEntry);

                // 4.1 Create Ledger Entries for each Payment Method
                if (purchase.PurchasePayments != null)
                {
                    foreach (var payment in purchase.PurchasePayments)
                    {
                        await _context.Ledgers.AddAsync(new Ledger
                        {
                            TransactionDate = DateTime.Now,
                            TransactionType = $"Purchase Payment - {payment.PaymentMethod}",
                            ReferenceNo = purchase.PurchaseNo,
                            Debit = payment.Amount,
                            Credit = 0m,
                            PartyId = purchase.SupplierId,
                            RelatedId = purchase.PurchaseId,
                            BranchId = purchase.BranchId,
                            Description = $"Payment via {payment.PaymentMethod}",
                            PaymentStatus = "Paid",
                            PaymentMode = purchase.PaymentMethod
                        });
                    }
                }

                // 4.2 Create Ledger Entry for Change Return if any
                if (purchase.ChangeAmount > 0)
                {
                    await _context.Ledgers.AddAsync(new Ledger
                    {
                        TransactionDate = DateTime.Now,
                        TransactionType = "Change Return - Supplier",
                        ReferenceNo = purchase.PurchaseNo,
                        Debit = 0m,
                        Credit = purchase.ChangeAmount ?? 0m, // Supplier gave us cash back
                        PartyId = purchase.SupplierId,
                        RelatedId = purchase.PurchaseId,
                        BranchId = purchase.BranchId,
                        Description = $"Change Returned for Purchase: {purchase.PurchaseNo}"
                    });
                }

                // 5. Update Party Balance (Supplier)
                if (purchase.SupplierId.HasValue)
                {
                    var supplier = await _context.Parties.FindAsync(purchase.SupplierId);
                    if (supplier != null)
                    {
                        // Special case for Supplier Credit (Balance they gave us previously)
                        var creditPayment = purchase.PurchasePayments?.FirstOrDefault(p => p.PaymentMethod == "Supplier Credit");
                        if (creditPayment != null)
                        {
                            if ((supplier.CreditBalance ?? 0m) < creditPayment.Amount)
                                throw new Exception("Insufficient Supplier Credit Balance.");
                            
                            supplier.CreditBalance -= creditPayment.Amount;
                        }

                        // Increase what we owe them by net amount, decrease by net exact amount paid
                        decimal actualTotal = purchase.NetAmount ?? purchase.TotalAmount;
                        supplier.CurrentBalance = (supplier.CurrentBalance ?? 0m) + actualTotal - (totalPaid - (purchase.ChangeAmount ?? 0m));

                        // Automated Old Due Adjustment for Suppliers
                        decimal surplus = totalPaid - purchase.TotalAmount;
                        if (supplier.PartyType == "Supplier" && supplier.FullName?.ToLower() != "walking supplier" && surplus > 0)
                        {
                            var allPurchases = await _context.PurchaseMasters
                                .Include(p => p.PurchasePayments)
                                .Where(p => p.SupplierId == purchase.SupplierId && p.PurchaseId != purchase.PurchaseId)
                                .OrderBy(p => p.PurchaseDate)
                                .ToListAsync();

                            var outstandingPurchases = allPurchases.Where(p => (p.PurchasePayments?.Sum(py => py.Amount) ?? 0m) < p.TotalAmount).ToList();

                            foreach (var oldPurchase in outstandingPurchases)
                            {
                                if (surplus <= 0) break;

                                decimal oldPurchasePaid = oldPurchase.PurchasePayments?.Sum(p => p.Amount) ?? 0m;
                                decimal oldPurchaseDue = oldPurchase.TotalAmount - oldPurchasePaid;

                                if (oldPurchaseDue > 0)
                                {
                                    decimal applyAmount = Math.Min(surplus, oldPurchaseDue);
                                    
                                    oldPurchase.PurchasePayments!.Add(new PurchasePayment
                                    {
                                        PurchaseId = oldPurchase.PurchaseId,
                                        PaymentMethod = "Due Adjustment",
                                        Amount = applyAmount,
                                        PaymentMode = "System",
                                        PaymentStatus = "Paid",
                                        PaymentNote = $"Paid on {DateTime.Now:yyyy-MM-dd} via {purchase.PurchaseNo}",
                                        PaymentDate = DateTime.Now
                                    });

                                    // Cross-reference on current invoice
                                    purchase.PaymentReference = string.IsNullOrEmpty(purchase.PaymentReference)
                                        ? $"Applied to Due: {oldPurchase.PurchaseNo} (৳{applyAmount})"
                                        : $"{purchase.PaymentReference}, {oldPurchase.PurchaseNo} (৳{applyAmount})";

                                    if (oldPurchasePaid + applyAmount >= oldPurchase.TotalAmount)
                                    {
                                        // Status is calculated on-the-fly in UI
                                    }

                                    surplus -= applyAmount;
                                }
                            }
                        }
                    }
                }
                
                await _context.SaveChangesAsync();
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
                .Include(p => p.PurchasePayments)
                .ToListAsync();
        }

        public async Task<PurchaseMaster> GetByIdAsync(int id)
        {
            return (await _context.PurchaseMasters
                .Include(p => p.Supplier)
                .Include(p => p.Branch)
                .Include(p => p.PurchaseDetails)
                    .ThenInclude(d => d.Product)
                .Include(p => p.PurchasePayments)
                .FirstOrDefaultAsync(p => p.PurchaseId == id))!;
        }
    }
}