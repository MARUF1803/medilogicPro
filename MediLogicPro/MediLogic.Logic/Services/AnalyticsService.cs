using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediLogic.Data;
using MediLogic.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Logic.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync()
        {
            return new DashboardAnalyticsDto
            {
                ProfitMetrics = await GetNetProfitAsync(),
                TopSellingProducts = await GetTopSellingProductsAsync(),
                BranchPerformance = await GetBranchPerformanceAsync(),
                RedZoneAlerts = await GetRedZoneAlertsAsync(),
                OfficerPerformance = await GetOfficerPerformanceAsync(),
                TopSuppliers = await GetTopSuppliersAsync()
            };
        }

        public async Task<NetProfitDto> GetNetProfitAsync()
        {
            var sales = await _context.SalesMasters
                .Include(s => s.SalesDetails)
                .ToListAsync();

            decimal totalRevenue = sales.Sum(s => s.TotalAmount ?? 0m);
            decimal totalDiscounts = sales.Sum(s => s.Discount ?? 0m);
            decimal totalCost = sales.Sum(s => s.SalesDetails.Sum(d => (d.Quantity ?? 0m) * (d.PurchasePriceAtTime ?? 0m)));

            return new NetProfitDto
            {
                TotalRevenue = totalRevenue,
                TotalCost = totalCost,
                TotalDiscounts = totalDiscounts
            };
        }

        public async Task<List<TopSellingProductDto>> GetTopSellingProductsAsync()
        {
            var topSales = await _context.SalesDetails
                .Include(d => d.Product)
                .Where(d => d.Product != null)
                .GroupBy(d => d.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    ProductName = g.FirstOrDefault() != null && g.FirstOrDefault().Product != null ? g.FirstOrDefault().Product.ProductName : "Unknown Product",
                    QuantitySold = (int)g.Sum(d => d.Quantity ?? 0m)
                })
                .OrderByDescending(p => p.QuantitySold)
                .Take(10)
                .ToListAsync();

            var result = new List<TopSellingProductDto>();
            foreach (var s in topSales)
            {
                var supplier = await _context.PurchaseDetails
                    .Include(pd => pd.Purchase)
                    .ThenInclude(p => p.Supplier)
                    .Where(pd => pd.ProductId == s.ProductId)
                    .OrderByDescending(pd => pd.Purchase.PurchaseDate)
                    .Select(pd => pd.Purchase.Supplier.FullName)
                    .FirstOrDefaultAsync() ?? "Unknown Supplier";

                result.Add(new TopSellingProductDto
                {
                    ProductName = s.ProductName,
                    QuantitySold = s.QuantitySold,
                    Supplier = supplier
                });
            }

            return result;
        }

        public async Task<List<BranchSalesDto>> GetBranchPerformanceAsync()
        {
            return await _context.SalesMasters
                .Include(s => s.Branch)
                .Where(s => s.Branch != null)
                .GroupBy(s => s.BranchId)
                .Select(g => new BranchSalesDto
                {
                    BranchName = g.FirstOrDefault() != null && g.FirstOrDefault().Branch != null ? g.FirstOrDefault().Branch.BranchName : "Main Branch",
                    TotalSales = g.Sum(s => s.TotalAmount ?? 0m)
                })
                .OrderByDescending(b => b.TotalSales)
                .ToListAsync();
        }

        public async Task<List<RedZoneAlertDto>> GetRedZoneAlertsAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var thirtyDaysFromNow = today.AddDays(30);

            var batchAlerts = await _context.BatchStocks
                .Include(b => b.Product)
                .Where(b => b.CurrentBalance < 10 || b.ExpiryDate < thirtyDaysFromNow)
                .OrderBy(b => b.ExpiryDate)
                .Take(20)
                .Select(b => new
                {
                    MedicineName = b.Product != null ? b.Product.ProductName : "Unknown Product",
                    Stock = (int)b.CurrentBalance,
                    b.ExpiryDate,
                    AlertType = b.CurrentBalance < 10 ? "Low Stock" : "Near Expiry"
                })
                .ToListAsync();

            return batchAlerts.Select(a => new RedZoneAlertDto
            {
                MedicineName = a.MedicineName,
                Stock = a.Stock,
                ExpiryDate = a.ExpiryDate.ToDateTime(TimeOnly.MinValue),
                AlertType = a.AlertType
            }).ToList();
        }

        private async Task<List<SalesOfficerPerformanceDto>> GetOfficerPerformanceAsync()
        {
            return await _context.SalesMasters
                .Include(s => s.User)
                .Where(s => s.User != null)
                .GroupBy(s => s.UserId)
                .Select(g => new SalesOfficerPerformanceDto
                {
                    OfficerName = g.FirstOrDefault() != null && g.FirstOrDefault().User != null ? g.FirstOrDefault().User.FullName : "Unknown Officer",
                    TotalSales = g.Sum(s => s.TotalAmount ?? 0m)
                })
                .OrderByDescending(o => o.TotalSales)
                .Take(5)
                .ToListAsync();
        }

        private async Task<List<string>> GetTopSuppliersAsync()
        {
            var salesByProduct = await _context.SalesDetails
                .GroupBy(d => d.ProductId)
                .Select(g => new { ProductId = g.Key, TotalSold = g.Sum(d => d.Quantity ?? 0m) })
                .ToListAsync();

            var supplierSales = new Dictionary<string, decimal>();

            foreach (var item in salesByProduct)
            {
                var supplier = await _context.PurchaseDetails
                    .Include(pd => pd.Purchase)
                    .ThenInclude(p => p.Supplier)
                    .Where(pd => pd.ProductId == item.ProductId)
                    .OrderByDescending(pd => pd.Purchase.PurchaseDate)
                    .Select(pd => pd.Purchase.Supplier.FullName)
                    .FirstOrDefaultAsync() ?? "Unknown Supplier";

                if (supplierSales.ContainsKey(supplier))
                    supplierSales[supplier] += item.TotalSold;
                else
                    supplierSales[supplier] = item.TotalSold;
            }

            return supplierSales.OrderByDescending(x => x.Value).Select(x => x.Key).Take(5).ToList();
        }
    }
}
