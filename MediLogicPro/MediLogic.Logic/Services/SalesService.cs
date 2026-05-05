using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediLogic.Logic.Services
{
    public class SalesService : ISalesService
    {
        private readonly ISalesRepository _salesRepo;
        private readonly IBatchStockService _stockService;
        private readonly ICurrentBranchService _currentBranchService;
        private readonly ApplicationDbContext _context;

        public SalesService(ISalesRepository salesRepo, IBatchStockService stockService, ICurrentBranchService currentBranchService, ApplicationDbContext context)
        {
            _salesRepo = salesRepo;
            _stockService = stockService;
            _currentBranchService = currentBranchService;
            _context = context;
        }

        // --- Sales Management ---

        public async Task<SalesMaster> CreateSaleAsync(SalesMaster sale)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                sale.InvoiceNo = "INV-" + DateTime.Now.ToString("yyyyMMddHHmmss");
                sale.SalesDate = DateTime.Now;

                // Determine Payment Status and Mode
                decimal netAmt = sale.NetAmount ?? 0m;
                decimal totalPaid = sale.SalesPayments?.Sum(p => p.Amount) ?? 0m;
                
                // Rule: Walk-in customers must pay in full
                bool isWalkIn = !sale.PartyId.HasValue;
                if (!isWalkIn)
                {
                    var party = await _context.Parties.FindAsync(sale.PartyId);
                    if (party != null && party.FullName.ToLower().Contains("walking")) isWalkIn = true;
                }

                if (isWalkIn && totalPaid < netAmt)
                {
                    throw new Exception("Walk-in customers must pay the full amount. Partial payments are only allowed for registered customers.");
                }

                sale.PaymentStatus = totalPaid >= netAmt ? "Paid" : "Pending";
                sale.PaymentMode = "Manual";

                // 1. Deduct Stock for all sales (This might split SalesDetails, so do it BEFORE tracking)
                await DeductStockForSale(sale);

                // 2. Add Sale to context (IDs will be generated on final save)
                await _context.SalesMasters.AddAsync(sale);

                // 3. Create Ledger Entry for the Sale itself (Revenue)
                var saleLedgerEntry = new Ledger
                {
                    TransactionDate = DateTime.Now,
                    TransactionType = "Sale",
                    ReferenceNo = sale.InvoiceNo,
                    Debit = sale.NetAmount ?? 0m,
                    Credit = 0m, 
                    PartyId = sale.PartyId,
                    BranchId = sale.BranchId,
                    Description = $"Sales Invoice: {sale.InvoiceNo} ({sale.PaymentStatus})",
                    PaymentStatus = sale.PaymentStatus,
                    PaymentMode = sale.PaymentMode
                };
                await _context.Ledgers.AddAsync(saleLedgerEntry);

                // 3.1 Create Ledger Entries for each Payment
                if (sale.SalesPayments != null)
                {
                    foreach (var payment in sale.SalesPayments)
                    {
                        await _context.Ledgers.AddAsync(new Ledger
                        {
                            TransactionDate = DateTime.Now,
                            TransactionType = $"Sale Payment - {payment.PaymentMethod}",
                            ReferenceNo = sale.InvoiceNo,
                            Debit = 0m,
                            Credit = payment.Amount,
                            PartyId = sale.PartyId,
                            BranchId = sale.BranchId,
                            Description = $"Payment via {payment.PaymentMethod}",
                            PaymentStatus = "Paid",
                            PaymentMode = sale.PaymentMode
                        });
                    }
                }

                // 3.2 Create Ledger Entry for Change Return if any
                if (sale.ChangeAmount > 0)
                {
                    await _context.Ledgers.AddAsync(new Ledger
                    {
                        TransactionDate = DateTime.Now,
                        TransactionType = "Change Return",
                        ReferenceNo = sale.InvoiceNo,
                        Debit = sale.ChangeAmount ?? 0m, // We gave cash back (Debit our Cash/Credit Customer)
                        Credit = 0m,
                        PartyId = sale.PartyId,
                        BranchId = sale.BranchId,
                        Description = $"Change Returned for Invoice: {sale.InvoiceNo}",
                        PaymentStatus = "Paid",
                        PaymentMode = sale.PaymentMode
                    });
                }

                // 4. Update Party Balance
                if (sale.PartyId.HasValue)
                {
                    var party = await _context.Parties.FindAsync(sale.PartyId);
                    if (party != null && party.FullName.ToLower() != "walking customer")
                    {
                        decimal netAmount = sale.NetAmount ?? 0m;
                        decimal changeAmount = sale.ChangeAmount ?? 0m;
                        decimal actualPaid = totalPaid - changeAmount;

                        party.CurrentBalance = (party.CurrentBalance ?? 0m) + netAmount;
                        party.CurrentBalance = (party.CurrentBalance ?? 0m) - actualPaid;

                        // Wallet handling
                        var walletPayment = sale.SalesPayments?.FirstOrDefault(p => p.PaymentMethod == "Customer Credit");
                        if (walletPayment != null)
                        {
                            if ((party.CreditBalance ?? 0m) < walletPayment.Amount)
                                throw new Exception("Insufficient Customer Credit Balance.");
                            party.CreditBalance = (party.CreditBalance ?? 0m) - walletPayment.Amount;
                        }

                        // Due Adjustment
                        decimal surplus = totalPaid - netAmount;
                        if (party.PartyType == "Customer" && surplus > 0)
                        {
                            var outstandingSales = await _context.SalesMasters
                                .Include(s => s.SalesPayments)
                                .Where(s => s.PartyId == sale.PartyId && s.PaymentStatus != "Paid")
                                .OrderBy(s => s.SalesDate)
                                .ToListAsync();

                            foreach (var oldSale in outstandingSales)
                            {
                                if (surplus <= 0) break;
                                decimal oldSalePaid = oldSale.SalesPayments?.Sum(p => p.Amount) ?? 0m;
                                decimal oldSaleDue = (oldSale.NetAmount ?? 0m) - oldSalePaid;

                                if (oldSaleDue > 0)
                                {
                                    decimal applyAmount = Math.Min(surplus, oldSaleDue);
                                    oldSale.SalesPayments!.Add(new SalesPayment
                                    {
                                        PaymentMethod = "Due Adjustment",
                                        Amount = applyAmount,
                                        PaymentMode = "System",
                                        PaymentStatus = "Paid",
                                        PaymentNote = $"Paid via surplus from {sale.InvoiceNo}",
                                        PaymentDate = DateTime.Now
                                    });
                                    surplus -= applyAmount;
                                }
                            }
                        }
                    }
                }

                await _context.SaveChangesAsync();
                
                // Set RelatedId for Ledgers after IDs are generated
                var ledgersToUpdate = await _context.Ledgers.Where(l => l.ReferenceNo == sale.InvoiceNo && l.RelatedId == null).ToListAsync();
                foreach(var l in ledgersToUpdate) l.RelatedId = sale.SalesId;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return sale;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception(ex.InnerException?.Message ?? ex.Message);
            }
        }

        private async Task DeductStockForSale(SalesMaster sale)
        {
            var newDetailsList = new List<SalesDetail>();

            foreach (var item in sale.SalesDetails.ToList())
            {
                decimal remainingQty = item.Quantity ?? 0m;

                var query = _context.BatchStocks
                    .Where(s => s.ProductId == item.ProductId 
                             && s.BranchId == sale.BranchId 
                             && s.CurrentBalance > 0);

                if (!string.IsNullOrWhiteSpace(item.BatchNumber) && item.BatchNumber != "N/A")
                {
                    query = query.Where(s => s.BatchNumber == item.BatchNumber);
                }

                var batches = await query.OrderBy(s => s.ExpiryDate).ToListAsync();

                var availableBalance = batches.Sum(s => s.CurrentBalance);
                if (availableBalance < remainingQty)
                    throw new Exception($"Stock Out: Insufficient stock for Product ID {item.ProductId}. Available: {availableBalance}, Requested: {remainingQty}");

                bool isFirstBatch = true;

                foreach (var batch in batches)
                {
                    if (remainingQty <= 0) break;

                    decimal takeFromBatch = Math.Min(batch.CurrentBalance, remainingQty);

                    if (isFirstBatch)
                    {
                        item.BatchNumber = batch.BatchNumber;
                        item.PurchasePriceAtTime = batch.PurchasePrice;
                        item.Quantity = takeFromBatch;
                        newDetailsList.Add(item);
                        isFirstBatch = false;
                    }
                    else
                    {
                        var splitItem = new SalesDetail
                        {
                            ProductId = item.ProductId,
                            BatchNumber = batch.BatchNumber,
                            PurchasePriceAtTime = batch.PurchasePrice,
                            Quantity = takeFromBatch,
                            UnitPrice = item.UnitPrice
                        };
                        newDetailsList.Add(splitItem);
                    }

                    batch.CurrentBalance -= takeFromBatch;
                    batch.LastUpdated = DateTime.Now;
                    
                    _context.BatchStocks.Update(batch);
                    remainingQty -= takeFromBatch;
                }
            }

            sale.SalesDetails.Clear();
            foreach (var detail in newDetailsList)
            {
                sale.SalesDetails.Add(detail);
            }
        }

        public async Task ConfirmPaymentAsync(int salesId, string transactionId, string provider)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var sale = await _context.SalesMasters
                    .Include(s => s.SalesDetails)
                    .Include(s => s.SalesPayments)
                    .FirstOrDefaultAsync(s => s.SalesId == salesId);

                if (sale == null) throw new Exception("Sale not found.");
                if (sale.PaymentStatus == "Paid") return; // Already confirmed

                // Update payments status
                foreach (var payment in sale.SalesPayments.Where(p => p.PaymentStatus == "Pending"))
                {
                    payment.PaymentStatus = "Paid";
                    payment.TransactionId = transactionId;
                    payment.PaymentProvider = provider;
                }

                sale.PaymentStatus = "Paid";
                
                // NOW deduct stock
                await DeductStockForSale(sale);

                // Update Ledger
                var ledger = await _context.Ledgers.FirstOrDefaultAsync(l => l.RelatedId == salesId && l.TransactionType == "Sale");
                if (ledger != null)
                {
                    ledger.PaymentStatus = "Paid";
                    ledger.TransactionId = transactionId;
                    ledger.Credit = sale.NetAmount ?? 0m; // Mark as fully paid
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task AddPaymentsAsync(int salesId, List<SalesPayment> payments)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var sale = await _context.SalesMasters
                    .Include(s => s.SalesPayments)
                    .FirstOrDefaultAsync(s => s.SalesId == salesId);

                if (sale == null) throw new Exception("Sale not found.");

                foreach (var payment in payments)
                {
                    payment.SalesId = salesId;
                    payment.PaymentDate = DateTime.Now;
                    payment.PaymentStatus = "Paid";
                    await _context.SalesPayments.AddAsync(payment);
                    
                    // Update Ledger for each payment
                    await _context.Ledgers.AddAsync(new Ledger
                    {
                        TransactionDate = DateTime.Now,
                        TransactionType = "Sales Payment",
                        ReferenceNo = sale.InvoiceNo,
                        Debit = 0,
                        Credit = payment.Amount,
                        PartyId = sale.PartyId,
                        RelatedId = sale.SalesId,
                        BranchId = sale.BranchId,
                        Description = $"Partial Payment for Sales Invoice: {sale.InvoiceNo} via {payment.PaymentMethod}"
                    });

                    // Update Party Balance
                    if (sale.PartyId.HasValue)
                    {
                        var party = await _context.Parties.FindAsync(sale.PartyId);
                        if (party != null)
                        {
                            party.CurrentBalance = (party.CurrentBalance ?? 0m) - payment.Amount;
                            
                            if (payment.PaymentMethod == "Customer Credit")
                            {
                                if ((party.CreditBalance ?? 0m) < payment.Amount)
                                    throw new Exception("Insufficient Customer Credit Balance.");
                                party.CreditBalance -= payment.Amount;
                            }
                        }
                    }
                }

                // Update Sale Status
                decimal totalPaid = (sale.SalesPayments?.Sum(p => p.Amount) ?? 0) + payments.Sum(p => p.Amount);
                sale.PaymentStatus = totalPaid >= (sale.NetAmount ?? 0m) ? "Paid" : "Partial";

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task DeleteSaleAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var sale = await _context.SalesMasters
                    .Include(s => s.SalesDetails)
                    .FirstOrDefaultAsync(s => s.SalesId == id);

                if (sale == null) throw new Exception("Sale record not found.");

                // 1. Reverse Stock
                foreach (var item in sale.SalesDetails)
                {
                    var stockBatch = await _context.BatchStocks
                        .FirstOrDefaultAsync(s => s.ProductId == item.ProductId && s.BranchId == sale.BranchId && s.BatchNumber == item.BatchNumber);

                    await _stockService.UpdateStockEntryAsync(
                        item.ProductId ?? 0,
                        sale.BranchId ?? 0,
                        item.BatchNumber ?? "N/A",
                        item.Quantity ?? 0m,
                        item.PurchasePriceAtTime ?? 0m,
                        item.UnitPrice ?? 0m,
                        stockBatch?.ExpiryDate ?? DateOnly.FromDateTime(DateTime.Now.AddYears(1))
                    );
                }

                // 2. Reverse Ledger Entries for this Invoice
                var relatedLedgers = await _context.Ledgers
                    .Where(l => l.ReferenceNo == sale.InvoiceNo && l.BranchId == sale.BranchId)
                    .ToListAsync();
                
                if (relatedLedgers.Any()) {
                    _context.Ledgers.RemoveRange(relatedLedgers);
                }

                // 3. Create a Reversal Ledger (Optional but recommended for audit)
                await _context.Ledgers.AddAsync(new Ledger {
                    TransactionDate = DateTime.Now,
                    TransactionType = "Sale Deletion",
                    ReferenceNo = sale.InvoiceNo,
                    Debit = 0,
                    Credit = sale.NetAmount ?? 0m,
                    PartyId = sale.PartyId,
                    BranchId = sale.BranchId,
                    Description = $"REVERSAL: Deleted Sales Invoice {sale.InvoiceNo}"
                });

                // 4. Update Party Balance (Decrease receivable)
                if (sale.PartyId.HasValue)
                {
                    var party = await _context.Parties.FindAsync(sale.PartyId);
                    if (party != null)
                    {
                        party.CurrentBalance = (party.CurrentBalance ?? 0m) - (sale.NetAmount ?? 0m);
                    }
                }

                await _salesRepo.DeleteAsync(sale);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Deletion failed: " + ex.Message);
            }
        }

        public async Task<SalesMaster?> GetSaleByIdAsync(int id)
        {
            return await _context.SalesMasters
                .Include(s => s.Party)
                .Include(s => s.Branch)
                .Include(s => s.SalesDetails)
                    .ThenInclude(d => d.Product)
                .Include(s => s.SalesPayments)
                .FirstOrDefaultAsync(s => s.SalesId == id);
        }

        public async Task<IEnumerable<object>> GetAllSalesAsync()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var data = await _context.SalesMasters
                .IgnoreQueryFilters() // Bypass filter to get branch names, but filter manually next
                .Where(s => s.BranchId == branchId)
                .Include(s => s.Branch)
                .Include(s => s.Party)
                .Include(s => s.SalesDetails).ThenInclude(d => d.Product)
                .Include(s => s.SalesPayments)
                .OrderByDescending(s => s.SalesDate)
                .ToListAsync();

            return data.Select(s => new
            {
                s.SalesId,
                s.InvoiceNo,
                s.SalesDate,
                s.BranchId,
                BranchName = s.Branch?.BranchName ?? "Gulshan Branch",
                s.PartyId,
                Party = new { s.Party?.FullName, s.Party?.PhoneNumber },
                s.TotalAmount,
                Discount = s.Discount ?? 0m,
                s.NetAmount,
                s.ChangeAmount,
                PaidAmount = s.SalesPayments.Sum(p => p.Amount),
                DueAmount = (s.NetAmount ?? 0m) - s.SalesPayments.Sum(p => p.Amount),
                SalesDetails = s.SalesDetails.Select(d => new {
                    d.DetailId,
                    d.ProductId,
                    Product = new { d.Product?.ProductName },
                    d.Quantity,
                    d.UnitPrice
                }),
                SalesPayments = s.SalesPayments.Select(p => new {
                    p.PaymentId,
                    p.PaymentDate,
                    p.Amount,
                    p.PaymentMethod,
                    p.TransactionId
                })
            });
        }

        // --- Sales Return Management ---

        public async Task<object> SearchInvoiceForReturnAsync(string invoiceNo)
        {
            // We search globally by InvoiceNo to ensure we find it even if branch context is tricky
            var sale = await _context.SalesMasters
                .IgnoreQueryFilters() 
                .Include(s => s.Branch)
                .Include(s => s.Party)
                .Include(s => s.SalesDetails).ThenInclude(d => d.Product)
                .Include(s => s.SalesPayments)
                .FirstOrDefaultAsync(s => s.InvoiceNo == invoiceNo);
            
            if (sale == null) throw new Exception("Invoice not found!");

            var salesDetails = new List<object>();
            foreach(var d in sale.SalesDetails) {
                var batch = await _context.BatchStocks.FirstOrDefaultAsync(b => b.ProductId == d.ProductId && b.BatchNumber == d.BatchNumber && b.BranchId == sale.BranchId);
                salesDetails.Add(new {
                    salesDetailId = d.DetailId,
                    productId = d.ProductId,
                    productName = d.Product?.ProductName ?? "Unknown Product",
                    batchNumber = d.BatchNumber,
                    expiryDate = batch?.ExpiryDate,
                    quantity = d.Quantity, 
                    alreadyReturnedQty = d.ReturnedQuantity ?? 0m,
                    availableForReturn = (d.Quantity ?? 0m) - (d.ReturnedQuantity ?? 0m),
                    unitPrice = d.UnitPrice
                });
            }

            return new
            {
                salesId = sale.SalesId,
                branchId = sale.BranchId,
                branchName = sale.Branch?.BranchName ?? "Main Branch",
                salesDate = sale.SalesDate, 
                invoiceNo = sale.InvoiceNo,
                customerId = sale.PartyId, 
                customerName = sale.Party?.FullName ?? "Walk-In Customer",
                totalAmount = sale.TotalAmount ?? 0m,
                discountAmount = sale.Discount ?? 0m,
                netAmount = sale.NetAmount ?? 0m,
                paidAmount = sale.SalesPayments?.Sum(p => p.Amount) ?? 0m,
                paymentStatus = sale.PaymentStatus,
                salesDetails = salesDetails
            };
        }

        public async Task<SalesReturnMaster> CreateSalesReturnAsync(SalesReturnMaster returnMaster)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var sale = await _context.SalesMasters
                    .Include(s => s.SalesDetails)
                    .FirstOrDefaultAsync(s => s.SalesId == returnMaster.SalesId);

                if (sale == null) throw new Exception("Original sale record not found.");

                returnMaster.ReturnNo = "SR-" + DateTime.Now.ToString("yyyyMMddHHmmss");
                returnMaster.ReturnDate = DateTime.Now;

                await _salesRepo.AddReturnAsync(returnMaster);
                await _salesRepo.SaveChangesAsync();

                foreach (var item in returnMaster.SalesReturnDetails)
                {
                    // Find original sale detail to get original prices
                    var detail = sale.SalesDetails.FirstOrDefault(d => d.ProductId == item.ProductId && d.BatchNumber == item.BatchNumber);
                    if (detail == null) continue; // Skip if not found (shouldn't happen with validation)

                    // Update detail's record of returned quantity
                    detail.ReturnedQuantity = (detail.ReturnedQuantity ?? 0m) + item.Quantity;

                    // Get batch to preserve its specific properties (like Mrp/Expiry)
                    var originalBatch = await _context.BatchStocks
                        .FirstOrDefaultAsync(s => s.ProductId == item.ProductId && s.BatchNumber == item.BatchNumber && s.BranchId == returnMaster.BranchId);
                    
                    decimal purchasePrice = detail.PurchasePriceAtTime ?? originalBatch?.PurchasePrice ?? 0m;
                    decimal mrp = originalBatch?.Mrp ?? (detail.UnitPrice ?? 0m);
                    var expiry = originalBatch?.ExpiryDate ?? DateOnly.FromDateTime(DateTime.Now.AddYears(1));

                    // RAISE STOCK (positive quantity)
                    await _stockService.UpdateStockEntryAsync(
                        item.ProductId ?? 0,
                        returnMaster.BranchId ?? 0,
                        item.BatchNumber ?? "N/A",
                        item.Quantity,
                        purchasePrice,
                        mrp,
                        expiry
                    );
                }

                // Create Ledger Entry for Return
                var ledgerEntry = new Ledger
                {
                    TransactionDate = DateTime.Now,
                    TransactionType = "Sales Return",
                    ReferenceNo = returnMaster.ReturnNo,
                    Debit = 0,
                    Credit = returnMaster.TotalRefundAmount ?? 0m,
                    PartyId = sale.PartyId,
                    RelatedId = returnMaster.SalesReturnId,
                    BranchId = returnMaster.BranchId,
                    Description = $"Sales Return: {returnMaster.ReturnNo} for Invoice: {sale.InvoiceNo}"
                };
                await _context.Ledgers.AddAsync(ledgerEntry);

                // Update Party Balance
                if (sale.PartyId.HasValue)
                {
                    var party = await _context.Parties.FindAsync(sale.PartyId);
                    if (party != null)
                    {
                        // The user can choose to add to Credit Balance OR deduct from CurrentBalance (AR)
                        // For now, let's assume if it's "Refund to Wallet", we add to CreditBalance.
                        // I'll add a flag or just use CreditBalance as requested.
                        // 1. Credit to wallet
                        party.CreditBalance = (party.CreditBalance ?? 0m) + (returnMaster.TotalRefundAmount ?? 0m);
                        
                        // 2. Decrease Receivable (Amount customer owes us decreases)
                        party.CurrentBalance = (party.CurrentBalance ?? 0m) - (returnMaster.TotalRefundAmount ?? 0m);
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

        // --- missing code added to match ISalesService interface ---
        public async Task<SalesReturnMaster?> GetReturnByIdAsync(int id)
        {
            return await _context.SalesReturnMasters
                .Include(r => r.Sales).ThenInclude(s => s.Party)
                .Include(r => r.SalesReturnDetails).ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(r => r.SalesReturnId == id);
        }

        public async Task<IEnumerable<object>> GetAllReturnsAsync()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var data = await _context.SalesReturnMasters
                .IgnoreQueryFilters()
                .Where(r => r.BranchId == branchId)
                .Include(r => r.Sales).ThenInclude(s => s.Party)
                .Include(r => r.SalesReturnDetails)
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();

            return data.Select(r => new {
                r.SalesReturnId,
                r.ReturnNo,
                r.ReturnDate,
                r.SalesId,
                InvoiceNo = r.Sales?.InvoiceNo,
                CustomerName = r.Sales?.Party?.FullName ?? "Walk-in Customer",
                TotalReturnAmount = r.TotalRefundAmount ?? r.SalesReturnDetails?.Sum(d => d.Quantity * d.UnitPrice) ?? 0m,
                r.Reason,
                SalesReturnDetails = r.SalesReturnDetails.Select(d => new {
                    SalesReturnDetailId = d.Id,
                    d.ProductId,
                    ProductName = _context.Products.IgnoreQueryFilters().FirstOrDefault(p => p.ProductId == d.ProductId)?.ProductName ?? "Unknown Product",
                    d.Quantity,
                    d.UnitPrice,
                    d.BatchNumber
                })
            });
        }
    }
}