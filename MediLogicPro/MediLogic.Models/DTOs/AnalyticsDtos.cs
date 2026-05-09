using System;
using System.Collections.Generic;

namespace MediLogic.Models.DTOs
{
    public class NetProfitDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalCost { get; set; }
        public decimal TotalDiscounts { get; set; }
        public decimal NetProfit => TotalRevenue - TotalCost - TotalDiscounts;
    }

    public class TopSellingProductDto
    {
        public string ProductName { get; set; }
        public int QuantitySold { get; set; }
        public string Supplier { get; set; }
    }

    public class BranchSalesDto
    {
        public string BranchName { get; set; }
        public decimal TotalSales { get; set; }
    }

    public class SalesOfficerPerformanceDto
    {
        public string OfficerName { get; set; }
        public decimal TotalSales { get; set; }
    }

    public class RedZoneAlertDto
    {
        public string MedicineName { get; set; }
        public int Stock { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string AlertType { get; set; } // "Low Stock" or "Near Expiry"
    }

    public class DashboardAnalyticsDto
    {
        public NetProfitDto ProfitMetrics { get; set; }
        public List<TopSellingProductDto> TopSellingProducts { get; set; }
        public List<string> TopSuppliers { get; set; }
        public List<BranchSalesDto> BranchPerformance { get; set; }
        public List<SalesOfficerPerformanceDto> OfficerPerformance { get; set; }
        public List<RedZoneAlertDto> RedZoneAlerts { get; set; }
    }
}
