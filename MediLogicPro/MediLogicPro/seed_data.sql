-- SQL Seed Data for MediLogicPro
-- This script bypasses C# seeder blocks and populates the database directly via sqlcmd.

USE SmartPharmaDB;
GO

-- 1. Ensure Columns exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Party') AND name = 'CreditBalance')
BEGIN
    ALTER TABLE Party ADD CreditBalance decimal(18,2) DEFAULT 0;
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SalesDetail') AND name = 'ReturnedQuantity')
BEGIN
    ALTER TABLE SalesDetail ADD ReturnedQuantity decimal(18,2) DEFAULT 0;
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PurchaseDetail') AND name = 'ReturnedQuantity')
BEGIN
    ALTER TABLE PurchaseDetail ADD ReturnedQuantity decimal(18,2) DEFAULT 0;
END
GO

-- 2. Seed Company
IF NOT EXISTS (SELECT * FROM Company WHERE CompanyCode = 'ML-CORP')
BEGIN
    INSERT INTO Company (CompanyName, CompanyCode, Address, RegistrationNumber, CreatedDate)
    VALUES ('MediLogic Solutions Ltd', 'ML-CORP', '123 Healthcare Plaza, Dhaka', 'REG-2026-001', GETDATE());
END
GO

-- 3. Seed Branches, Categories, UOMs, Taxes
-- (Using a single batch to maintain variables or looking them up inline)
DECLARE @CompanyId INT = (SELECT TOP 1 CompanyId FROM Company WHERE CompanyCode = 'ML-CORP');

IF NOT EXISTS (SELECT * FROM Branch WHERE BranchCode = 'BR-MAIN')
    INSERT INTO Branch (BranchName, BranchCode, IsActive, CompanyId, Address, AddedDate)
    VALUES ('Main Pharmacy', 'BR-MAIN', 1, @CompanyId, 'Ground Floor, Med Tower', GETDATE());

IF NOT EXISTS (SELECT * FROM Branch WHERE BranchCode = 'BR-NORTH')
    INSERT INTO Branch (BranchName, BranchCode, IsActive, CompanyId, Address, AddedDate)
    VALUES ('North Branch', 'BR-NORTH', 1, @CompanyId, 'Sector 7, Uttara', GETDATE());

IF NOT EXISTS (SELECT * FROM Category WHERE CategoryCode = 'TAB') INSERT INTO Category (CategoryName, CategoryCode) VALUES ('Tablet', 'TAB');
IF NOT EXISTS (SELECT * FROM Category WHERE CategoryCode = 'CAP') INSERT INTO Category (CategoryName, CategoryCode) VALUES ('Capsule', 'CAP');

IF NOT EXISTS (SELECT * FROM Uom WHERE UomName = 'Piece (PCS)') INSERT INTO Uom (UomName) VALUES ('Piece (PCS)');

IF NOT EXISTS (SELECT * FROM Tax WHERE TaxCode = 'VAT-0') INSERT INTO Tax (TaxName, TaxCode, VatRate) VALUES ('Exempt', 'VAT-0', 0.0);

DECLARE @MainBranchId INT = (SELECT BranchId FROM Branch WHERE BranchCode = 'BR-MAIN');

IF NOT EXISTS (SELECT * FROM Party WHERE FullName = 'Walking Customer' AND PartyType = 'Customer')
    INSERT INTO Party (FullName, PartyType, PhoneNumber, IsActive, BranchId, CreatedAt, CurrentBalance, CreditBalance)
    VALUES ('Walking Customer', 'Customer', '01800000000', 1, @MainBranchId, GETDATE(), 0, 0);

DECLARE @TabId INT = (SELECT CategoryId FROM Category WHERE CategoryCode = 'TAB');
DECLARE @CapId INT = (SELECT CategoryId FROM Category WHERE CategoryCode = 'CAP');
DECLARE @UomId INT = (SELECT UomId FROM Uom WHERE UomName = 'Piece (PCS)');
DECLARE @TaxId INT = (SELECT TaxId FROM Tax WHERE TaxCode = 'VAT-0');

IF NOT EXISTS (SELECT * FROM Product WHERE ProductCode = 'PRD-NAPA-X')
    INSERT INTO Product (ProductName, GenericName, Strength, ProductCode, CategoryId, UomId, TaxId, PurchasePrice, SalePrice, BranchId, IsDeleted)
    VALUES ('Napa Extra', 'Paracetamol', '500 mg', 'PRD-NAPA-X', @TabId, @UomId, @TaxId, 1.8, 2.5, @MainBranchId, 0);

IF NOT EXISTS (SELECT * FROM Product WHERE ProductCode = 'PRD-SECLO-20')
    INSERT INTO Product (ProductName, GenericName, Strength, ProductCode, CategoryId, UomId, TaxId, PurchasePrice, SalePrice, BranchId, IsDeleted)
    VALUES ('Seclo 20', 'Omeprazole', '20 mg', 'PRD-SECLO-20', @CapId, @UomId, @TaxId, 3.5, 5.0, @MainBranchId, 0);

DECLARE @Prod1 INT = (SELECT ProductId FROM Product WHERE ProductCode = 'PRD-NAPA-X');
DECLARE @Prod2 INT = (SELECT ProductId FROM Product WHERE ProductCode = 'PRD-SECLO-20');
DECLARE @Br2 INT = (SELECT BranchId FROM Branch WHERE BranchCode = 'BR-NORTH');

IF NOT EXISTS (SELECT * FROM BatchStock WHERE ProductId = @Prod1 AND BranchId = @MainBranchId)
    INSERT INTO BatchStock (ProductId, BranchId, BatchNumber, ExpiryDate, PurchasePrice, Mrp, CurrentBalance, LastUpdated)
    VALUES (@Prod1, @MainBranchId, 'BCH-MAIN-2026-NAPA', DATEADD(YEAR, 2, GETDATE()), 1.8, 2.5, 1000, GETDATE());

IF NOT EXISTS (SELECT * FROM BatchStock WHERE ProductId = @Prod2 AND BranchId = @Br2)
    INSERT INTO BatchStock (ProductId, BranchId, BatchNumber, ExpiryDate, PurchasePrice, Mrp, CurrentBalance, LastUpdated)
    VALUES (@Prod2, @Br2, 'BCH-NORTH-2026-SECLO', DATEADD(YEAR, 2, GETDATE()), 3.5, 5.0, 500, GETDATE());

GO

PRINT 'Database seeding complete.';
GO
