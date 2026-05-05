using MediLogic.Data.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Linq;

namespace MediLogicPro.Services;

public class CurrentBranchService : ICurrentBranchService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentBranchService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? GetCurrentBranchId()
    {
        var context = _httpContextAccessor.HttpContext;
        if (context == null) return null;

        // 1. Try to get from Headers (case-insensitive)
        var branchHeader = context.Request.Headers.FirstOrDefault(h => 
            h.Key.Equals("X-Branch-ID", StringComparison.OrdinalIgnoreCase)).Value.FirstOrDefault();

        if (int.TryParse(branchHeader, out var headerBranchId))
        {
            return headerBranchId;
        }

        // 2. Fallback: Try to get from JWT Claims
        var branchClaim = context.User.FindFirst("branchId")?.Value ?? 
                         context.User.FindFirst("BranchId")?.Value;

        if (int.TryParse(branchClaim, out var claimBranchId))
        {
            return claimBranchId;
        }

        return null;
    }
}
