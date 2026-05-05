using Microsoft.AspNetCore.Authentication.Cookies;
using MediLogic.Security.Interfaces;
using MediLogic.Security.Services;
using MediLogicPro.Auth.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Register TokenService for JWT generation
builder.Services.AddScoped<ITokenService, TokenService>();

// Configure cookie authentication (JWT stored in HttpOnly cookie)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
    });

// HttpClient for calling the backend API
builder.Services.AddHttpClient("MediLogicAPI", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiSettings:BaseUrl"]!);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// Session support for storing temp data
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseStaticFiles();
app.UseRouting();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<JwtCookieMiddleware>();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Account}/{action=Login}/{id?}");

// Serve SPA for direct loads
app.MapFallbackToController("Setup", "Dashboard", "setup");
app.MapFallbackToController("Angular", "Dashboard", "angular");

app.Run();
