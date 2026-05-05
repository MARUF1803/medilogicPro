using MediLogic.Data;
using MediLogic.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MediLogicPro.Data
{
    public static class PharmaDataSeeder
    {
        public static void SeedAll(ApplicationDbContext context)
        {
            Console.WriteLine("DEBUG: Starting PharmaDataSeeder.SeedAll...");
            try
            {
                // --- 1. Seed Company ---
                var company = context.Companies.OrderBy(c => c.CompanyId).FirstOrDefault();
                if (company == null)
                {
                    company = new Company
                    {
                        CompanyName = "MediLogic Solutions Ltd",
                        CompanyCode = "ML-CORP",
                        Address = "123 Healthcare Plaza, Dhaka",
                        RegistrationNumber = "REG-2026-001",
                        CreatedDate = DateTime.Now
                    };
                    context.Companies.Add(company);
                    context.SaveChanges();
                }

                // --- 2. Seed Branches ---
                var mainBranch = context.Branches.OrderBy(b => b.BranchId).FirstOrDefault(b => b.BranchCode == "BR-MAIN");
                if (mainBranch == null)
                {
                    mainBranch = new Branch 
                    { 
                        BranchName = "Main Pharmacy", 
                        BranchCode = "BR-MAIN", 
                        IsActive = true,
                        CompanyId = company.CompanyId,
                        Address = "Ground Floor, Med Tower",
                        AddedDate = DateTime.Now
                    };
                    context.Branches.Add(mainBranch);
                }

                var northBranch = context.Branches.OrderBy(b => b.BranchId).FirstOrDefault(b => b.BranchCode == "BR-NORTH");
                if (northBranch == null)
                {
                    northBranch = new Branch 
                    { 
                        BranchName = "North Branch", 
                        BranchCode = "BR-NORTH", 
                        IsActive = true,
                        CompanyId = company.CompanyId,
                        Address = "Sector 7, Uttara",
                        AddedDate = DateTime.Now
                    };
                    context.Branches.Add(northBranch);
                }
                context.SaveChanges();

                // --- 3. Seed Default Admin User & Roles ---
                var adminUser = context.Users.FirstOrDefault(u => u.UserName == "admin");
                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        UserName = "admin",
                        FullName = "System Administrator",
                        Email = "admin@medilogicpro.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        UserType = "SuperAdmin",
                        CreatedAt = DateTime.Now,
                        IsActive = true,
                        BranchId = mainBranch.BranchId
                    };
                    context.Users.Add(adminUser);
                    context.SaveChanges();
                }
                else
                {
                    adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
                    context.SaveChanges();
                }

                // --- Add Maruf1803 User ---
                var marufUser = context.Users.FirstOrDefault(u => u.UserName == "Maruf1803");
                if (marufUser == null)
                {
                    marufUser = new User
                    {
                        UserName = "Maruf1803",
                        FullName = "Maruf Hossain",
                        Email = "maruf@medilogicpro.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Maruf@123"),
                        UserType = "Admin",
                        CreatedAt = DateTime.Now,
                        IsActive = true,
                        BranchId = mainBranch.BranchId
                    };
                    context.Users.Add(marufUser);
                    context.SaveChanges();
                }
                else
                {
                    // Enforce Admin role and reset password for development stability
                    marufUser.UserType = "Admin";
                    marufUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Maruf@123");
                    context.SaveChanges();
                }

                var adminRole = context.Roles.FirstOrDefault(r => r.RoleName == "SuperAdmin");
                if (adminRole == null)
                {
                    adminRole = new Role { RoleName = "SuperAdmin" };
                    context.Roles.Add(adminRole);
                    context.SaveChanges();
                }

                var officeRole = context.Roles.FirstOrDefault(r => r.RoleName == "Admin");
                if (officeRole == null)
                {
                    officeRole = new Role { RoleName = "Admin" };
                    context.Roles.Add(officeRole);
                    context.SaveChanges();
                }

                // Assign SuperAdmin to admin if not already assigned
                if (!context.AssignRoles.Any(ar => ar.UserId == adminUser.UserId && ar.RoleId == adminRole.RoleId))
                {
                    context.AssignRoles.Add(new AssignRole
                    {
                        UserId = adminUser.UserId,
                        RoleId = adminRole.RoleId,
                        AssignedDate = DateTime.Now,
                        IsActive = true
                    });
                    context.SaveChanges();
                }

                // Assign Admin to Maruf if not already assigned
                var existingMarufRole = context.AssignRoles.FirstOrDefault(ar => ar.UserId == marufUser.UserId);
                if (existingMarufRole == null)
                {
                    context.AssignRoles.Add(new AssignRole
                    {
                        UserId = marufUser.UserId,
                        RoleId = officeRole.RoleId,
                        AssignedDate = DateTime.Now,
                        IsActive = true
                    });
                    context.SaveChanges();
                }
                else if (existingMarufRole.RoleId != officeRole.RoleId)
                {
                    // Update role to Admin
                    existingMarufRole.RoleId = officeRole.RoleId;
                    context.SaveChanges();
                }

                // --- 4. Seed Categories ---
                var categoryMap = new Dictionary<string, Category>();
                var standardCategories = new[]
                {
                    new { Name = "Tablet", Code = "TAB" },
                    new { Name = "Capsule", Code = "CAP" },
                    new { Name = "Syrup", Code = "SYR" },
                    new { Name = "Suspension", Code = "SUS" },
                    new { Name = "Injection (IV/IM)", Code = "INJ" },
                    new { Name = "Suppository", Code = "SUP" },
                    new { Name = "Ointment/Cream/Gel", Code = "OINT" },
                    new { Name = "Drop (Eye/Ear)", Code = "DRP" },
                    new { Name = "Inhaler/Rotacap", Code = "INH" },
                    new { Name = "Saline", Code = "SAL" }
                };

                foreach (var sc in standardCategories)
                {
                    if (!context.Categories.Any(c => c.CategoryName == sc.Name))
                    {
                        context.Categories.Add(new Category { CategoryName = sc.Name, CategoryCode = sc.Code });
                    }
                }
                context.SaveChanges();
                foreach (var c in context.Categories) { categoryMap[c.CategoryName] = c; }

                // --- 5. Seed UOMs ---
                var uomMap = new Dictionary<string, Uom>();
                var standardUoms = new[] { "Piece (PCS)", "Box", "Strip", "Bottle", "Vial", "Ampoule", "Tube" };
                foreach (var su in standardUoms)
                {
                    if (!context.Uoms.Any(u => u.UomName == su))
                    {
                        context.Uoms.Add(new Uom { UomName = su });
                    }
                }
                context.SaveChanges();
                foreach (var u in context.Uoms) { uomMap[u.UomName] = u; }

                // --- 6. Seed Taxes ---
                var taxMap = new Dictionary<string, Tax>();
                var standardTaxes = new[]
                {
                    new { Name = "Exempt", Code = "VAT-0", Rate = 0m },
                    new { Name = "Standard VAT", Code = "VAT-5", Rate = 5.0m }
                };
                foreach (var st in standardTaxes)
                {
                    if (!context.Taxes.Any(t => t.TaxCode == st.Code))
                    {
                        context.Taxes.Add(new Tax { TaxName = st.Name, TaxCode = st.Code, VatRate = st.Rate });
                    }
                }
                context.SaveChanges();
                foreach (var t in context.Taxes) { if (t.TaxCode != null) taxMap[t.TaxCode] = t; }

                // --- 7. Seed Parties ---
                var suppliers = new[] { "Square Pharma", "Beximco Pharma", "Incepta" };
                foreach (var s in suppliers)
                {
                    if (!context.Parties.Any(p => p.FullName == s && p.PartyType == "Supplier"))
                    {
                        context.Parties.Add(new Party { FullName = s, PartyType = "Supplier", PhoneNumber = "017", IsActive = true, BranchId = mainBranch.BranchId, CreatedAt = DateTime.Now });
                    }
                }

                var customers = new[] { "Walking Customer", "Regular John" };
                foreach (var c in customers)
                {
                    if (!context.Parties.Any(p => p.FullName == c && p.PartyType == "Customer"))
                    {
                        context.Parties.Add(new Party { FullName = c, PartyType = "Customer", PhoneNumber = "018", IsActive = true, BranchId = mainBranch.BranchId, CreatedAt = DateTime.Now, CurrentBalance = 0, CreditBalance = 0 });
                    }
                }
                context.SaveChanges();

                // --- 8. Seed Products ---
                if (!context.Products.Any())
                {
                    var taxId = taxMap.ContainsKey("VAT-0") ? taxMap["VAT-0"].TaxId : null as int?;
                    var pieceUomId = uomMap.ContainsKey("Piece (PCS)") ? uomMap["Piece (PCS)"].UomId : null as int?;
                    
                    var medicines = new List<Product>
                    {
                        new Product { ProductName = "Napa Extra", GenericName = "Paracetamol", Strength = "500 mg", ProductCode = "PRD-NAPA-X", CategoryId = categoryMap["Tablet"].CategoryId, UomId = pieceUomId, TaxId = taxId, PurchasePrice = 1.8m, SalePrice = 2.5m, BranchId = mainBranch.BranchId, IsDeleted = false },
                        new Product { ProductName = "Seclo 20", GenericName = "Omeprazole", Strength = "20 mg", ProductCode = "PRD-SECLO-20", CategoryId = categoryMap["Capsule"].CategoryId, UomId = pieceUomId, TaxId = taxId, PurchasePrice = 3.5m, SalePrice = 5.0m, BranchId = mainBranch.BranchId, IsDeleted = false }
                    };
                    context.Products.AddRange(medicines);
                    context.SaveChanges();
                }

                // --- 9. Seed BatchStock ---
                if (!context.BatchStocks.Any())
                {
                    var products = context.Products.ToList();
                    var branches = context.Branches.ToList();
                    foreach (var b in branches)
                    {
                        foreach (var p in products)
                        {
                            context.BatchStocks.Add(new BatchStock
                            {
                                ProductId = p.ProductId,
                                BranchId = b.BranchId,
                                BatchNumber = $"BCH-{b.BranchCode}-{DateTime.Now:yyMM}-{p.ProductId}",
                                ExpiryDate = System.DateOnly.FromDateTime(DateTime.Now.AddYears(2)),
                                PurchasePrice = p.PurchasePrice ?? 0,
                                Mrp = p.SalePrice ?? 0,
                                CurrentBalance = 1000,
                                LastUpdated = DateTime.Now
                            });
                        }
                    }
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                System.IO.File.WriteAllText("seed_error.txt", ex.ToString());
            }
        }
    }
}
