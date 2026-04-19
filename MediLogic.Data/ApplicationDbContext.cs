using MediLogic.Models;
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AssignRole> AssignRoles { get; set; }
    public virtual DbSet<BatchStock> BatchStocks { get; set; }
    public virtual DbSet<Branch> Branches { get; set; }
    public virtual DbSet<Category> Categories { get; set; }
    public virtual DbSet<Company> Companies { get; set; }
    public virtual DbSet<Party> Parties { get; set; }
    public virtual DbSet<Product> Products { get; set; }
    public virtual DbSet<ProductMaster> ProductMasters { get; set; }
    public virtual DbSet<PurchaseDetail> PurchaseDetails { get; set; }
    public virtual DbSet<PurchaseMaster> PurchaseMasters { get; set; }
    public virtual DbSet<PurchaseReturnDetail> PurchaseReturnDetails { get; set; }
    public virtual DbSet<PurchaseReturnMaster> PurchaseReturnMasters { get; set; }
    public virtual DbSet<Role> Roles { get; set; }
    public virtual DbSet<SalesDetail> SalesDetails { get; set; }
    public virtual DbSet<SalesMaster> SalesMasters { get; set; }
    public virtual DbSet<SalesReturnDetail> SalesReturnDetails { get; set; }
    public virtual DbSet<SalesReturnMaster> SalesReturnMasters { get; set; }
    public virtual DbSet<Tax> Taxes { get; set; }
    public virtual DbSet<Uom> Uoms { get; set; }
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<UserRefreshToken> UserRefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AssignRole>(entity =>
        {
            entity.HasKey(e => e.AssignRoleId).HasName("PK__AssignRo__1BFA36ED90FCDC73");
            entity.ToTable("AssignRole");
            entity.Property(e => e.AssignedDate).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.HasOne(d => d.Role).WithMany(p => p.AssignRoles).HasForeignKey(d => d.RoleId).HasConstraintName("FK__AssignRol__RoleI__18EBB532");
            entity.HasOne(d => d.User).WithMany(p => p.AssignRoles).HasForeignKey(d => d.UserId).HasConstraintName("FK__AssignRol__UserI__17F790F9");
        });

        modelBuilder.Entity<BatchStock>(entity =>
        {
            entity.HasKey(e => e.StockId).HasName("PK__BatchSto__2C83A9C2E2988BA6");
            entity.ToTable("BatchStock");
            entity.Property(e => e.BatchNumber).HasMaxLength(100);
            entity.Property(e => e.CurrentBalance).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.LastUpdated).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.Mrp).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.PurchasePrice).HasColumnType("decimal(18, 2)");

            // Concurrency Token Configuration
            entity.Property(e => e.RowVersion).IsRowVersion();

            entity.HasOne(d => d.Branch).WithMany(p => p.BatchStocks).HasForeignKey(d => d.BranchId).HasConstraintName("FK__BatchStoc__Branc__10566F31");
            entity.HasOne(d => d.Product).WithMany(p => p.BatchStocks).HasForeignKey(d => d.ProductId).HasConstraintName("FK__BatchStoc__Produ__0F624AF8");
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.BranchId).HasName("PK__Branch__A1682FC5E1FC5723");
            entity.ToTable("Branch");
            entity.Property(e => e.AddedDate).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.BranchCode).HasMaxLength(50);
            entity.Property(e => e.BranchName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.HasOne(d => d.Company).WithMany(p => p.Branches).HasForeignKey(d => d.CompanyId).HasConstraintName("FK__Branch__CompanyI__4CA06362");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Category__19093A0BD7CBA2D9");
            entity.ToTable("Category");
            entity.Property(e => e.CategoryCode).HasMaxLength(50);
            entity.Property(e => e.CategoryName).HasMaxLength(100);
        });

        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasKey(e => e.CompanyId).HasName("PK__Company__2D971CAC68F1D077");
            entity.ToTable("Company");
            entity.Property(e => e.CompanyCode).HasMaxLength(50);
            entity.Property(e => e.CompanyName).HasMaxLength(200);
            entity.Property(e => e.CreatedDate).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.RegistrationNumber).HasMaxLength(100);
        });

        modelBuilder.Entity<Party>(entity =>
        {
            entity.HasKey(e => e.PartyId).HasName("PK__Party__1640CD336C264D8D");
            entity.ToTable("Party");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.CurrentBalance).HasDefaultValue(0m).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PartyCode).HasMaxLength(50);
            entity.Property(e => e.PartyType).HasMaxLength(50);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.HasOne(d => d.Branch).WithMany(p => p.Parties).HasForeignKey(d => d.BranchId).HasConstraintName("FK__Party__BranchId__656C112C");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Product__B40CC6CDC9D6A7C6");
            entity.ToTable("Product");
            entity.Property(e => e.GenericName).HasMaxLength(200);
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            entity.Property(e => e.ProductCode).HasMaxLength(50);
            entity.Property(e => e.ProductName).HasMaxLength(200);
            entity.Property(e => e.PurchasePrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SalePrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Strength).HasMaxLength(50);
            entity.HasOne(d => d.Category).WithMany(p => p.Products).HasForeignKey(d => d.CategoryId).HasConstraintName("FK__Product__Categor__59063A47");
            entity.HasOne(d => d.Tax).WithMany(p => p.Products).HasForeignKey(d => d.TaxId).HasConstraintName("FK__Product__TaxId__5AEE82B9");
            entity.HasOne(d => d.Uom).WithMany(p => p.Products).HasForeignKey(d => d.UomId).HasConstraintName("FK__Product__UomId__59FA5E80");
        });

        modelBuilder.Entity<ProductMaster>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ProductM__3214EC07BC4DF48E");
            entity.ToTable("ProductMaster");
            entity.Property(e => e.OpeningQuantity).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OpeningValue).HasColumnType("decimal(18, 2)");
            entity.HasOne(d => d.Branch).WithMany(p => p.ProductMasters).HasForeignKey(d => d.BranchId).HasConstraintName("FK__ProductMa__Branc__151B244E");
            entity.HasOne(d => d.Product).WithMany(p => p.ProductMasters).HasForeignKey(d => d.ProductId).HasConstraintName("FK__ProductMa__Produ__14270015");
        });

        modelBuilder.Entity<PurchaseDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Purchase__3214EC07E08C2096");
            entity.ToTable("PurchaseDetail");
            entity.Property(e => e.BatchNumber).HasMaxLength(100);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");
            entity.HasOne(d => d.Product).WithMany(p => p.PurchaseDetails).HasForeignKey(d => d.ProductId).HasConstraintName("FK__PurchaseD__Produ__70DDC3D8");
            entity.HasOne(d => d.Purchase).WithMany(p => p.PurchaseDetails).HasForeignKey(d => d.PurchaseId).HasConstraintName("FK__PurchaseD__Purch__6FE99F9F");
        });

        modelBuilder.Entity<PurchaseMaster>(entity =>
        {
            entity.HasKey(e => e.PurchaseId).HasName("PK__Purchase__6B0A6BBE6DDA33B8");
            entity.ToTable("PurchaseMaster");
            entity.Property(e => e.PurchaseDate).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.PurchaseNo).HasMaxLength(100);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");
            entity.HasOne(d => d.Branch).WithMany(p => p.PurchaseMasters).HasForeignKey(d => d.BranchId).HasConstraintName("FK__PurchaseM__Branc__6C190EBB");
            entity.HasOne(d => d.Supplier).WithMany(p => p.PurchaseMasters).HasForeignKey(d => d.SupplierId).HasConstraintName("FK__PurchaseM__Suppl__6B24EA82");
        });

        modelBuilder.Entity<PurchaseReturnDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Purchase__3214EC07142FF02F");
            entity.ToTable("PurchaseReturnDetail");
            entity.Property(e => e.BatchNumber).HasMaxLength(100);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");
            entity.HasOne(d => d.Product).WithMany(p => p.PurchaseReturnDetails).HasForeignKey(d => d.ProductId).HasConstraintName("FK__PurchaseR__Produ__0C85DE4D");
            entity.HasOne(d => d.PurchaseReturn).WithMany(p => p.PurchaseReturnDetails).HasForeignKey(d => d.PurchaseReturnId).HasConstraintName("FK__PurchaseR__Purch__0B91BA14");
        });

        modelBuilder.Entity<PurchaseReturnMaster>(entity =>
        {
            entity.HasKey(e => e.PurchaseReturnId).HasName("PK__Purchase__2C33C6E885AB0107");
            entity.ToTable("PurchaseReturnMaster");
            entity.Property(e => e.ReturnDate).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.ReturnNo).HasMaxLength(100);
            entity.Property(e => e.TotalReturnAmount).HasColumnType("decimal(18, 2)");
            entity.HasOne(d => d.Branch).WithMany(p => p.PurchaseReturnMasters).HasForeignKey(d => d.BranchId).HasConstraintName("FK__PurchaseR__Branc__07C12930");
            entity.HasOne(d => d.Purchase).WithMany(p => p.PurchaseReturnMasters).HasForeignKey(d => d.PurchaseId).HasConstraintName("FK__PurchaseR__Purch__05D8E0BE");
            entity.HasOne(d => d.Supplier).WithMany(p => p.PurchaseReturnMasters).HasForeignKey(d => d.SupplierId).HasConstraintName("FK__PurchaseR__Suppl__06CD04F7");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__8AFACE1A268FF442");
            entity.ToTable("Role");
            entity.Property(e => e.RoleName).HasMaxLength(100);
        });

        modelBuilder.Entity<SalesDetail>(entity =>
        {
            entity.HasKey(e => e.DetailId).HasName("PK__SalesDet__135C316D2C5BA50E");
            entity.ToTable("SalesDetail");
            entity.Property(e => e.BatchNumber).HasMaxLength(100);
            entity.Property(e => e.PurchasePriceAtTime).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Quantity).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");
            entity.HasOne(d => d.Product).WithMany(p => p.SalesDetails).HasForeignKey(d => d.ProductId).HasConstraintName("FK__SalesDeta__Produ__7A672E12");
            entity.HasOne(d => d.Sales).WithMany(p => p.SalesDetails).HasForeignKey(d => d.SalesId).HasConstraintName("FK__SalesDeta__Sales__797309D9");
        });

        modelBuilder.Entity<SalesMaster>(entity =>
        {
            entity.HasKey(e => e.SalesId).HasName("PK__SalesMas__C952FB32D57AA681");
            entity.ToTable("SalesMaster");
            entity.Property(e => e.Discount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.InvoiceNo).HasMaxLength(100);
            entity.Property(e => e.NetAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SalesDate).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");
            entity.HasOne(d => d.Branch).WithMany(p => p.SalesMasters).HasForeignKey(d => d.BranchId).HasConstraintName("FK__SalesMast__Branc__73BA3083");
            entity.HasOne(d => d.Party).WithMany(p => p.SalesMasters).HasForeignKey(d => d.PartyId).HasConstraintName("FK__SalesMast__Party__75A278F5");
            entity.HasOne(d => d.User).WithMany(p => p.SalesMasters).HasForeignKey(d => d.UserId).HasConstraintName("FK__SalesMast__UserI__74AE54BC");
        });

        modelBuilder.Entity<SalesReturnDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__SalesRet__3214EC07B33CC08D");
            entity.ToTable("SalesReturnDetail");
            entity.Property(e => e.BatchNumber).HasMaxLength(100);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");
            entity.HasOne(d => d.Product).WithMany(p => p.SalesReturnDetails).HasForeignKey(d => d.ProductId).HasConstraintName("FK__SalesRetu__Produ__02FC7413");
            entity.HasOne(d => d.SalesReturn).WithMany(p => p.SalesReturnDetails).HasForeignKey(d => d.SalesReturnId).HasConstraintName("FK__SalesRetu__Sales__02084FDA");
        });

        modelBuilder.Entity<SalesReturnMaster>(entity =>
        {
            entity.HasKey(e => e.SalesReturnId).HasName("PK__SalesRet__E0906C38A4E7D075");
            entity.ToTable("SalesReturnMaster");
            entity.Property(e => e.ReturnDate).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.ReturnNo).HasMaxLength(100);
            entity.Property(e => e.TotalRefundAmount).HasColumnType("decimal(18, 2)");
            entity.HasOne(d => d.Branch).WithMany(p => p.SalesReturnMasters).HasForeignKey(d => d.BranchId).HasConstraintName("FK__SalesRetu__Branc__7E37BEF6");
            entity.HasOne(d => d.Sales).WithMany(p => p.SalesReturnMasters).HasForeignKey(d => d.SalesId).HasConstraintName("FK__SalesRetu__Sales__7D439ABD");
        });

        modelBuilder.Entity<Tax>(entity =>
        {
            entity.HasKey(e => e.TaxId).HasName("PK__Tax__711BE0AC39DFDB5F");
            entity.ToTable("Tax");
            entity.Property(e => e.TaxCode).HasMaxLength(50);
            entity.Property(e => e.TaxName).HasMaxLength(100);
            entity.Property(e => e.VatRate).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<Uom>(entity =>
        {
            entity.HasKey(e => e.UomId).HasName("PK__Uom__F6F8D47E5FEDF8B5");
            entity.ToTable("Uom");
            entity.Property(e => e.UomName).HasMaxLength(50);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__1788CC4C842C4899");
            entity.ToTable("User");
            entity.HasIndex(e => e.UserName, "UQ__User__C9F28456AD12E391").IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.UserName).HasMaxLength(100);
            entity.Property(e => e.UserType).HasMaxLength(50);
            entity.HasOne(d => d.Branch).WithMany(p => p.Users).HasForeignKey(d => d.BranchId).HasConstraintName("FK__User__BranchId__5FB337D6");
        });

        modelBuilder.Entity<UserRefreshToken>(entity =>
        {
            entity.HasKey(e => e.TokenId).HasName("PK__UserRefr__658FEEEA41C5CF7D");
            entity.ToTable("UserRefreshToken");
            entity.Property(e => e.AddedDate).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.ExpiryDate).HasColumnType("datetime");
            entity.Property(e => e.IsRevoked).HasDefaultValue(false);
            entity.Property(e => e.IsUsed).HasDefaultValue(false);
            entity.Property(e => e.JwtId).HasMaxLength(200);
            entity.HasOne(d => d.User).WithMany(p => p.UserRefreshTokens).HasForeignKey(d => d.UserId).HasConstraintName("FK__UserRefre__UserI__1DB06A4F");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}