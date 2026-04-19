using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Data.Repositories;
using MediLogic.Logic.Services;
using MediLogic.Security.Interfaces;
using MediLogic.Security.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- NEW: CORS Configuration ---
// This allows your React app to talk to this API
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => 
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5176")
              .AllowAnyMethod()
              .AllowAnyHeader()
    );
});

// 1. Add controllers with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// 2. Database Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// 3. Register Repositories and Services (Dependency Injection)
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IBranchRepository, BranchRepository>();
builder.Services.AddScoped<IBranchService, BranchService>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IUomRepository, UomRepository>();
builder.Services.AddScoped<IUomService, UomService>();
builder.Services.AddScoped<ITaxRepository, TaxRepository>();
builder.Services.AddScoped<ITaxService, TaxService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IPartyRepository, PartyRepository>();
builder.Services.AddScoped<IPartyService, PartyService>();
builder.Services.AddScoped<IPurchaseRepository, PurchaseRepository>();
builder.Services.AddScoped<IPurchaseService, PurchaseService>();
builder.Services.AddScoped<IBatchStockRepository, BatchStockRepository>();
builder.Services.AddScoped<IBatchStockService, BatchStockService>();
builder.Services.AddScoped<IPurchaseReturnRepository, PurchaseReturnRepository>();
builder.Services.AddScoped<IPurchaseReturnService, PurchaseReturnService>();
builder.Services.AddScoped<ISalesRepository, SalesRepository>();
builder.Services.AddScoped<ISalesService, SalesService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

// Security Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// 4. JWT Authentication Configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddOpenApi();

var app = builder.Build();

// 5. Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// --- CRITICAL ORDER ---
// 1. CORS first
app.UseCors("AllowFrontend");

// 2. Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 6. Seed Data (Sales, Product, Customer, User, Inventory)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();

        // ১. Seed Users
        if (!context.Users.Any())
        {
            context.Users.Add(new MediLogic.Models.User
            {
                FullName = "Admin User",
                Email = "admin@example.com",
                PhoneNumber = "01700000000",
                UserName = "admin", // এটি বাধ্যতামূলক হতে পারে
                IsActive = true
            });
        }

        // ২. Seed Categories & Products
        if (!context.Categories.Any())
        {
            var category = new MediLogic.Models.Category
            {
                CategoryName = "Electronics",
                CategoryCode = "CAT-001"
            };
            context.Categories.Add(category);
            context.SaveChanges();

            if (!context.Products.Any())
            {
                context.Products.Add(new MediLogic.Models.Product
                {
                    ProductName = "Sample Smartphone",
                    ProductCode = "PROD-001",
                    CategoryId = category.CategoryId
                });
            }
        }

        // ৩. Seed Parties
        if (!context.Parties.Any())
        {
            context.Parties.Add(new MediLogic.Models.Party
            {
                FullName = "Sample Customer",
                PartyType = "Customer",
                Email = "customer@example.com",
                PhoneNumber = "01800000000",
                IsActive = true
            });
        }

        context.SaveChanges();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}
app.Run();