using System.Threading.Tasks;
using MediLogic.Logic.Services;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardAnalytics()
        {
            var data = await _analyticsService.GetDashboardAnalyticsAsync();
            return Ok(data);
        }

        [HttpGet("profit")]
        public async Task<IActionResult> GetNetProfit()
        {
            var data = await _analyticsService.GetNetProfitAsync();
            return Ok(data);
        }

        [HttpGet("top-selling")]
        public async Task<IActionResult> GetTopSellingProducts()
        {
            var data = await _analyticsService.GetTopSellingProductsAsync();
            return Ok(data);
        }

        [HttpGet("branch-performance")]
        public async Task<IActionResult> GetBranchPerformance()
        {
            var data = await _analyticsService.GetBranchPerformanceAsync();
            return Ok(data);
        }

        [HttpGet("red-zone")]
        public async Task<IActionResult> GetRedZoneAlerts()
        {
            var data = await _analyticsService.GetRedZoneAlertsAsync();
            return Ok(data);
        }
    }
}
