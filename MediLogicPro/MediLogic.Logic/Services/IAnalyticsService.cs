using System.Collections.Generic;
using System.Threading.Tasks;
using MediLogic.Models.DTOs;

namespace MediLogic.Logic.Services
{
    public interface IAnalyticsService
    {
        Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync();
        Task<NetProfitDto> GetNetProfitAsync();
        Task<List<TopSellingProductDto>> GetTopSellingProductsAsync();
        Task<List<BranchSalesDto>> GetBranchPerformanceAsync();
        Task<List<RedZoneAlertDto>> GetRedZoneAlertsAsync();
    }
}
