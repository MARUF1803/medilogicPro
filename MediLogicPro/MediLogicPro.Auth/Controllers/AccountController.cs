using MediLogicPro.Auth.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Net;
using System.Text;
using System.Text.Json;

namespace MediLogicPro.Auth.Controllers;

public class AccountController : Controller
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public AccountController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    // ==================== LOGIN ====================

    [HttpGet]
    public IActionResult Login(string? returnUrl = null, string? expired = null)
    {
        if (expired == "true")
        {
            ViewBag.ErrorMessage = "Your session has expired. Please sign in again.";
        }
        ViewBag.ReturnUrl = returnUrl;
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
    {
        if (!ModelState.IsValid)
            return View(model);

        try
        {
            var client = _httpClientFactory.CreateClient("MediLogicAPI");

            var payload = new { userName = model.UserName, password = model.Password };
            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync("Auth/login", content);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"DEBUG: Auth API failed with status {response.StatusCode}. Content: {json}");
                ViewBag.ErrorMessage = response.StatusCode == System.Net.HttpStatusCode.Unauthorized 
                    ? "Invalid username or password." 
                    : "Backend server error. Please check API logs.";
                return View(model);
            }

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var authResult = JsonSerializer.Deserialize<AuthApiResponse>(json, options);

            if (authResult == null || string.IsNullOrEmpty(authResult.Token))
            {
                ViewBag.ErrorMessage = "Authentication failed. Please try again.";
                return View(model);
            }

            // Successful authentication – set JWT token in HttpOnly cookie
            var token = authResult.Token;
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // Changed to false for local development (HTTP)
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_config["Jwt:DurationInMinutes"]))
            };
            Response.Cookies.Append("JwtToken", token, cookieOptions);

            // --- Encode auth data for the SPA Callback ---
            var serializeOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var authPayload = JsonSerializer.Serialize(authResult, serializeOptions);
            var encodedAuth = Convert.ToBase64String(Encoding.UTF8.GetBytes(authPayload));

            // Determine redirect destination (Always go through auth-callback)
            var callbackUrl = GetCallbackUrl(authResult.Roles);
            
            // Append auth data and returnUrl to the callback URL
            var finalUrl = Microsoft.AspNetCore.WebUtilities.QueryHelpers.AddQueryString(callbackUrl, new Dictionary<string, string?>
            {
                { "auth", encodedAuth },
                { "returnUrl", returnUrl }
            });

            return Redirect(finalUrl);
        }
        catch (HttpRequestException)
        {
            ViewBag.ErrorMessage = "Unable to connect to the server. Please try again later.";
            return View(model);
        }
    }

    // ==================== REGISTER ====================

    [HttpGet]
    public IActionResult Register()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        try
        {
            var client = _httpClientFactory.CreateClient("MediLogicAPI");

            var payload = new
            {
                fullName = model.FullName,
                userName = model.UserName,
                email = model.Email,
                password = model.Password,
                userType = "Salesman" // Default role for self-registration
            };

            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync("Users/Register", content);

            if (response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = "Account created successfully! Please sign in.";
                return RedirectToAction("Login");
            }

            var error = await response.Content.ReadAsStringAsync();
            ViewBag.ErrorMessage = "Registration failed. Username may already exist.";
            return View(model);
        }
        catch (HttpRequestException)
        {
            ViewBag.ErrorMessage = "Unable to connect to the server. Please try again later.";
            return View(model);
        }
    }

    // ==================== FORGOT PASSWORD ====================

    [HttpGet]
    public IActionResult ForgotPassword()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult ForgotPassword(ForgotPasswordViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        // Stub - password reset not yet implemented on backend
        TempData["SuccessMessage"] = "If an account with that email exists, a password reset link has been sent.";
        return RedirectToAction("Login");
    }

    // ==================== LOGOUT ====================

    [HttpGet]
    public IActionResult Logout()
    {
        // Remove JWT cookie
        Response.Cookies.Delete("JwtToken");
        // Clear session data
        HttpContext.Session.Clear();
        return RedirectToAction("Login");
    }

    // ==================== HELPERS ====================

    private string GetCallbackUrl(List<string> roles)
    {
        // Determine role categories
        var isAdmin = roles.Any(r => r.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
                                    r.Equals("Manager", StringComparison.OrdinalIgnoreCase) ||
                                    r.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase));

        // Get configured paths
        var setupBase = _config["FrontendUrls:ReactSetup"] ?? "http://localhost:5173";
        var angularBase = _config["FrontendUrls:AngularPOS"] ?? "http://localhost:4200";

        var setupPath = setupBase.TrimEnd('/') + "/auth-callback";
        var angularPath = angularBase.TrimEnd('/') + "/auth-callback";

        // Default role-based redirection
        return isAdmin ? setupPath : angularPath;
    }
}
