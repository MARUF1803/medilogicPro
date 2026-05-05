using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Auth.Controllers;

[Authorize]
public class DashboardController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    [Route("setup/{*url}")]
    public IActionResult Setup(string url)
    {
        // This serves the React SPA index.html for any /setup path
        return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "setup", "index.html"), "text/html");
    }

    [Route("angular/{*url}")]
    public IActionResult Angular(string url)
    {
        // This serves the Angular SPA index.html for any /angular path
        return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "angular", "index.html"), "text/html");
    }
}
