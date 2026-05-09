using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediLogic.Logic.Services
{
    public class PurchaseService : IPurchaseService
    {
        private readonly IPurchaseRepository _repo;
        private readonly ICurrentBranchService _currentBranchService;
        private readonly ApplicationDbContext _context;

        public PurchaseService(IPurchaseRepository repo, ICurrentBranchService currentBranchService, ApplicationDbContext context)
        {
            _repo = repo;
            _currentBranchService = currentBranchService;
            _context = context;
        }

        public async Task<PurchaseMaster> CreatePurchaseAsync(PurchaseMaster purchase) => await _repo.CreateAsync(purchase);
        public async Task<IEnumerable<object>> GetAllPurchasesAsync()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var purchases = await _context.PurchaseMasters
                .IgnoreQueryFilters()
                .Where(p => p.BranchId == branchId)
                .Include(p => p.Supplier)
                .Include(p => p.Branch)
                .Include(p => p.PurchaseDetails).ThenInclude(d => d.Product)
                .Include(p => p.PurchasePayments)
                .OrderByDescending(p => p.PurchaseDate)
                .ToListAsync();

            return purchases.Select(p => new {
                p.PurchaseId,
                p.PurchaseNo,
                p.PurchaseDate,
                p.SupplierId,
                SupplierName = p.Supplier?.FullName ?? "Unknown Supplier",
                p.BranchId,
                BranchName = p.Branch?.BranchName ?? "Unknown Branch",
                p.TotalAmount,
                p.Discount,
                p.NetAmount,
                p.PaymentMethod,
                p.PaymentReference,
                p.PaymentProvider,
                PurchaseDetails = p.PurchaseDetails.Select(d => new {
                    d.Id,
                    d.ProductId,
                    ProductName = _context.Products.IgnoreQueryFilters().FirstOrDefault(pr => pr.ProductId == d.ProductId)?.ProductName ?? "Unknown Product",
                    d.BatchNumber,
                    d.Quantity,
                    d.UnitPrice,
                    d.ExpiryDate
                }),
                purchasePayments = p.PurchasePayments
            });
        }
        
        public async Task<object> GetPurchaseByIdAsync(int id)
        {
            var p = await _context.PurchaseMasters
                .IgnoreQueryFilters()
                .Include(p => p.Supplier)
                .Include(p => p.Branch)
                .Include(p => p.PurchaseDetails).ThenInclude(d => d.Product)
                .Include(p => p.PurchasePayments)
                .FirstOrDefaultAsync(p => p.PurchaseId == id);

            if (p == null) return null;

            return new {
                p.PurchaseId,
                p.PurchaseNo,
                p.PurchaseDate,
                p.SupplierId,
                SupplierName = p.Supplier?.FullName ?? "Unknown Supplier",
                p.BranchId,
                BranchName = p.Branch?.BranchName ?? "Unknown Branch",
                p.TotalAmount,
                p.Discount,
                p.NetAmount,
                p.PaymentMethod,
                p.PaymentReference,
                p.PaymentProvider,
                PurchaseDetails = p.PurchaseDetails.Select(d => new {
                    d.Id,
                    d.ProductId,
                    ProductName = _context.Products.IgnoreQueryFilters().FirstOrDefault(pr => pr.ProductId == d.ProductId)?.ProductName ?? "Unknown Product",
                    d.BatchNumber,
                    d.Quantity,
                    d.UnitPrice,
                    d.ExpiryDate
                }),
                purchasePayments = p.PurchasePayments
            };
        }

        public async Task AddPaymentsAsync(int purchaseId, List<PurchasePayment> payments)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var purchase = await _context.PurchaseMasters
                    .Include(p => p.PurchasePayments)
                    .FirstOrDefaultAsync(p => p.PurchaseId == purchaseId);

                if (purchase == null) throw new Exception("Purchase not found.");

                foreach (var payment in payments)
                {
                    payment.PurchaseId = purchaseId;
                    payment.PaymentDate = DateTime.Now;
                    payment.PaymentStatus = "Paid";
                    await _context.PurchasePayments.AddAsync(payment);

                    // Update Ledger for each payment
                    await _context.Ledgers.AddAsync(new Ledger
                    {
                        TransactionDate = DateTime.Now,
                        TransactionType = "Purchase Payment",
                        ReferenceNo = purchase.PurchaseNo,
                        Debit = payment.Amount,
                        Credit = 0,
                        PartyId = purchase.SupplierId,
                        RelatedId = purchase.PurchaseId,
                        BranchId = purchase.BranchId,
                        Description = $"Partial Payment for Purchase Invoice: {purchase.PurchaseNo} via {payment.PaymentMethod}"
                    });

                    // Update Party Balance (Supplier)
                    if (purchase.SupplierId.HasValue)
                    {
                        var supplier = await _context.Parties.FindAsync(purchase.SupplierId);
                        if (supplier != null)
                        {
                            supplier.CurrentBalance = (supplier.CurrentBalance ?? 0m) - payment.Amount;

                            if (payment.PaymentMethod == "Supplier Credit")
                            {
                                if ((supplier.CreditBalance ?? 0m) < payment.Amount)
                                    throw new Exception("Insufficient Supplier Credit Balance.");
                                supplier.CreditBalance -= payment.Amount;
                            }
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}