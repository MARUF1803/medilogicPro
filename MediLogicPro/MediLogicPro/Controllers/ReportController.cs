using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Logic.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _docService;
        private readonly IBatchStockService _stockService;
        private readonly ICurrentBranchService _currentBranchService;

        public ReportController(ApplicationDbContext context, IDocumentService docService, IBatchStockService stockService, ICurrentBranchService currentBranchService)
        {
            _context = context;
            _docService = docService;
            _stockService = stockService;
            _currentBranchService = currentBranchService;
        }

        [HttpGet("DownloadInvoice/{id}")]
        public async Task<IActionResult> DownloadInvoice(int id)
        {
            var sale = await _context.SalesMasters
                .Include(s => s.Party)
                .Include(s => s.Branch)
                .Include(s => s.SalesDetails)
                    .ThenInclude(d => d.Product)
                .OrderBy(s => s.SalesId)
                .FirstOrDefaultAsync(s => s.SalesId == id);

            if (sale == null) return NotFound();

            var pdf = _docService.GenerateSalesInvoice(sale);
            return File(pdf, "application/pdf", $"Invoice_{sale.InvoiceNo}.pdf");
        }

        [HttpGet("DownloadSalesReturn/{id}")]
        public async Task<IActionResult> DownloadSalesReturn(int id)
        {
            var salesReturn = await _context.SalesReturnMasters
                .Include(r => r.Sales).ThenInclude(s => s!.Party)
                .Include(r => r.Branch)
                .Include(r => r.SalesReturnDetails).ThenInclude(d => d.Product)
                .OrderBy(r => r.SalesReturnId)
                .FirstOrDefaultAsync(r => r.SalesReturnId == id);

            if (salesReturn == null) return NotFound();

            var pdf = _docService.GenerateSalesReturnMemo(salesReturn);
            return File(pdf, "application/pdf", $"SalesReturn_{salesReturn.ReturnNo}.pdf");
        }

        [HttpGet("DownloadPurchaseReturn/{id}")]
        public async Task<IActionResult> DownloadPurchaseReturn(int id)
        {
            var purchaseReturn = await _context.PurchaseReturnMasters
                .Include(r => r.Supplier)
                .Include(r => r.Purchase)
                .Include(r => r.Branch)
                .Include(r => r.PurchaseReturnDetails).ThenInclude(d => d.Product)
                .OrderBy(r => r.PurchaseReturnId)
                .FirstOrDefaultAsync(r => r.PurchaseReturnId == id);

            if (purchaseReturn == null) return NotFound();

            var pdf = _docService.GeneratePurchaseReturnMemo(purchaseReturn);
            return File(pdf, "application/pdf", $"PurchaseReturn_{purchaseReturn.ReturnNo}.pdf");
        }

        [HttpGet("DownloadStockPdf")]
        public async Task<IActionResult> DownloadStockPdf()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var stocks = await _context.BatchStocks
                .Include(s => s.Product)
                .Where(s => s.CurrentBalance > 0 && s.BranchId == branchId)
                .ToListAsync();

            var pdf = _docService.GenerateStockReport(stocks);
            return File(pdf, "application/pdf", "StockReport.pdf");
        }

        [HttpGet("StockReport")]
        public async Task<IActionResult> GetStockReport()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var report = await _context.BatchStocks
                .Where(s => s.BranchId == branchId)
                .Include(s => s.Product)
                .GroupBy(s => new { s.ProductId, ProductName = s.Product != null ? s.Product.ProductName : "Unknown", ProductCode = s.Product != null ? s.Product.ProductCode : "N/A" })
                .Select(g => new
                {
                    g.Key.ProductId,
                    g.Key.ProductName,
                    g.Key.ProductCode,
                    TotalStock = g.Sum(s => s.CurrentBalance),
                    ValueAtPurchasePrice = g.Sum(s => s.CurrentBalance * s.PurchasePrice),
                    ValueAtMrp = g.Sum(s => s.CurrentBalance * s.Mrp)
                })
                .ToListAsync();

            return Ok(report);
        }

        [HttpGet("SalesReport")]
        public async Task<IActionResult> GetSalesReport(DateTime? fromDate, DateTime? toDate)
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var query = _context.SalesMasters.Where(s => s.BranchId == branchId).AsQueryable();

            if (fromDate.HasValue) query = query.Where(s => s.SalesDate >= fromDate);
            if (toDate.HasValue) query = query.Where(s => s.SalesDate <= toDate);

            var report = await query
                .Include(s => s.Party)
                .Select(s => new
                {
                    s.SalesId,
                    s.InvoiceNo,
                    s.SalesDate,
                    CustomerName = s.Party != null ? s.Party.FullName : "Walking Customer",
                    s.TotalAmount,
                    s.Discount,
                    s.NetAmount
                })
                .OrderByDescending(s => s.SalesDate)
                .ToListAsync();

            return Ok(report);
        }

        [HttpGet("PurchaseReport")]
        public async Task<IActionResult> GetPurchaseReport(DateTime? fromDate, DateTime? toDate)
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var query = _context.PurchaseMasters.Where(p => p.BranchId == branchId).AsQueryable();

            if (fromDate.HasValue) query = query.Where(p => p.PurchaseDate >= fromDate);
            if (toDate.HasValue) query = query.Where(p => p.PurchaseDate <= toDate);

            var report = await query
                .Include(p => p.Supplier)
                .Select(p => new
                {
                    p.PurchaseId,
                    p.PurchaseNo,
                    p.PurchaseDate,
                    SupplierName = p.Supplier != null ? p.Supplier.FullName : "Unknown",
                    p.TotalAmount
                })
                .OrderByDescending(p => p.PurchaseDate)
                .ToListAsync();

            return Ok(report);
        }

        [HttpGet("PartyLedger/{partyId}")]
        public async Task<IActionResult> GetPartyLedger(int partyId)
        {
            var ledger = await _context.Ledgers
                .Where(l => l.PartyId == partyId)
                .OrderByDescending(l => l.TransactionDate)
                .ToListAsync();

            return Ok(ledger);
        }

        [HttpGet("PartyTransactions/{partyId}")]
        public async Task<IActionResult> GetPartyTransactions(int partyId)
        {
            var sales = await _context.SalesMasters
                .Where(s => s.PartyId == partyId)
                .Include(s => s.SalesDetails).ThenInclude(d => d.Product)
                .Select(s => new {
                    Id = s.SalesId,
                    ReferenceNo = s.InvoiceNo,
                    Date = s.SalesDate,
                    Type = "Sale",
                    TotalAmount = s.TotalAmount,
                    NetAmount = s.NetAmount,
                    Details = s.SalesDetails.Select(d => new {
                        ProductName = d.Product != null ? d.Product.ProductName : "Product",
                        Quantity = d.Quantity,
                        UnitPrice = d.UnitPrice,
                        Subtotal = d.Quantity * d.UnitPrice
                    })
                })
                .ToListAsync();

            var purchases = await _context.PurchaseMasters
                .Where(p => p.SupplierId == partyId)
                .Include(p => p.PurchaseDetails).ThenInclude(d => d.Product)
                .Select(p => new {
                    Id = p.PurchaseId,
                    ReferenceNo = p.PurchaseNo,
                    Date = p.PurchaseDate,
                    Type = "Purchase",
                    TotalAmount = p.TotalAmount,
                    NetAmount = p.TotalAmount, // Net is same for purchase here
                    Details = p.PurchaseDetails.Select(d => new {
                        ProductName = d.Product != null ? d.Product.ProductName : "Product",
                        Quantity = d.Quantity,
                        UnitPrice = d.UnitPrice,
                        Subtotal = d.Quantity * d.UnitPrice
                    })
                })
                .ToListAsync();

            var payments = await _context.Ledgers
                .Where(l => l.PartyId == partyId && l.TransactionType.Contains("Payment"))
                .Select(l => new {
                    Id = l.LedgerId,
                    ReferenceNo = l.ReferenceNo ?? "PAY",
                    Date = l.TransactionDate,
                    Type = "Payment",
                    TotalAmount = l.Credit > 0 ? l.Credit : l.Debit,
                    NetAmount = l.Credit > 0 ? l.Credit : l.Debit,
                    Details = new[] { new {
                        ProductName = l.Description ?? "Payment",
                        Quantity = 1m,
                        UnitPrice = l.Credit > 0 ? l.Credit : l.Debit,
                        Subtotal = l.Credit > 0 ? l.Credit : l.Debit
                    }}
                })
                .ToListAsync();

            var result = sales.Cast<object>().Concat(purchases.Cast<object>()).Concat(payments.Cast<object>())
                .OrderByDescending(x => (DateTime?)((dynamic)x).Date)
                .ToList();

            return Ok(result);
        }

        [HttpGet("FullLedger")]
        public async Task<IActionResult> GetFullLedger()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var ledger = await _context.Ledgers
                .Where(l => l.BranchId == branchId)
                .Include(l => l.Party)
                .OrderByDescending(l => l.TransactionDate)
                .ToListAsync();

            return Ok(ledger);
        }
        
        [HttpGet("DashboardStats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var totalSales = await _context.SalesMasters.Where(s => s.BranchId == branchId).SumAsync(s => s.NetAmount) ?? 0m;
            var totalPurchases = await _context.PurchaseMasters.Where(p => p.BranchId == branchId).SumAsync(p => p.TotalAmount); // Non-nullable sum
            var totalStockValue = await _context.BatchStocks.Where(s => s.BranchId == branchId).SumAsync(s => s.CurrentBalance * s.PurchasePrice);
            var activeParties = await _context.Parties.CountAsync(p => p.IsActive == true && p.BranchId == branchId);
            
            // Profit & Loss calculation
            var totalCogs = await _context.SalesDetails
                .Include(sd => sd.Sales)
                .Where(sd => sd.Sales!.BranchId == branchId)
                .SumAsync(sd => sd.Quantity * sd.PurchasePriceAtTime) ?? 0m;
            var grossProfit = totalSales - totalCogs;

            return Ok(new
            {
                TotalSales = totalSales,
                TotalPurchases = totalPurchases,
                TotalStockValue = totalStockValue,
                ActiveParties = activeParties,
                TotalCogs = totalCogs,
                GrossProfit = grossProfit,
                ProfitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0
            });
        }

        [HttpGet("SalesTrend")]
        public async Task<IActionResult> GetSalesTrend()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var startDate = DateTime.Today.AddDays(-29);
            var trend = await _context.SalesMasters
                .Where(s => s.SalesDate >= startDate && s.BranchId == branchId)
                .GroupBy(s => (s.SalesDate ?? DateTime.Today).Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Amount = g.Sum(s => s.NetAmount) ?? 0m,
                    Count = g.Count()
                })
                .OrderBy(g => g.Date)
                .ToListAsync();

            return Ok(trend);
        }

        [HttpGet("TopProducts")]
        public async Task<IActionResult> GetTopProducts()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var top = await _context.SalesDetails
                .Include(d => d.Product)
                .Include(d => d.Sales)
                .Where(d => d.Sales!.BranchId == branchId)
                .GroupBy(d => new { d.ProductId, ProductName = d.Product != null ? d.Product.ProductName : "Unknown Product" })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    TotalQuantity = g.Sum(d => d.Quantity),
                    TotalRevenue = g.Sum(d => d.Quantity * d.UnitPrice)
                })
                .OrderByDescending(g => g.TotalRevenue)
                .Take(5)
                .ToListAsync();

            return Ok(top);
        }

        [HttpGet("Ledger")]
        public async Task<IActionResult> GetLedger([FromQuery] int? partyId)
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var query = _context.Ledgers.AsQueryable();
            
            if (branchId > 0) query = query.Where(l => l.BranchId == branchId);
            if (partyId.HasValue) query = query.Where(l => l.PartyId == partyId);

            var rawEntries = await query.OrderBy(l => l.TransactionDate).ThenBy(l => l.LedgerId).ToListAsync();
            
            decimal runningBalance = 0;
            var result = rawEntries.Select(e => {
                runningBalance += (e.Debit - e.Credit);
                return new {
                    e.LedgerId,
                    e.TransactionDate,
                    e.Description,
                    e.TransactionType,
                    e.ReferenceNo,
                    DebitAmount = e.Debit,
                    CreditAmount = e.Credit,
                    Balance = runningBalance
                };
            }).OrderByDescending(e => e.TransactionDate).ThenByDescending(e => e.LedgerId).ToList();

            return Ok(result);
        }

        [HttpGet("SalesBySalesman")]
        public async Task<IActionResult> GetSalesBySalesman()
        {
            var branchId = _currentBranchService.GetCurrentBranchId();
            var stats = await _context.SalesMasters
                .Where(s => s.BranchId == branchId)
                .Include(s => s.User)
                .GroupBy(s => new { s.UserId, UserName = s.User != null ? s.User.FullName : "System / Unknown" })
                .Select(g => new
                {
                    UserName = g.Key.UserName,
                    TotalSales = g.Sum(s => s.NetAmount) ?? 0m,
                    OrderCount = g.Count()
                })
                .OrderByDescending(g => g.TotalSales)
                .ToListAsync();

            return Ok(stats);
        }

        [HttpGet("SalesByBranch")]
        public async Task<IActionResult> GetSalesByBranch()
        {
            // Note: In a real multi-tenant app, this might be restricted to SuperAdmins
            var stats = await _context.SalesMasters
                .Include(s => s.Branch)
                .GroupBy(s => new { s.BranchId, BranchName = s.Branch != null ? s.Branch.BranchName : "Main Branch" })
                .Select(g => new
                {
                    BranchName = g.Key.BranchName,
                    TotalSales = g.Sum(s => s.NetAmount) ?? 0m,
                    OrderCount = g.Count()
                })
                .OrderByDescending(g => g.TotalSales)
                .ToListAsync();

            return Ok(stats);
        }
    }
}
