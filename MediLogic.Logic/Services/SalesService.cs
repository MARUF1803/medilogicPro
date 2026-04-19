using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediLogic.Logic.Services
{
    public class SalesService : ISalesService
    {
        private readonly ISalesRepository _salesRepo;
        private readonly IBatchStockService _stockService;
        private readonly ApplicationDbContext _context;

        public SalesService(ISalesRepository salesRepo, IBatchStockService stockService, ApplicationDbContext context)
        {
            _salesRepo = salesRepo;
            _stockService = stockService;
            _context = context;
        }

        // --- Sales Management ---

        public async Task<SalesMaster> CreateSaleAsync(SalesMaster sale)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                sale.InvoiceNo = "INV-" + DateTime.Now.ToString("yyyyMMddHHmmss");
                sale.SalesDate = DateTime.Now;

                var requestedItems = sale.SalesDetails.ToList();
                sale.SalesDetails.Clear();

                var allStocks = await _stockService.GetAllStocksAsync();

                foreach (var item in requestedItems)
                {
                    decimal remainingQty = item.Quantity ?? 0;

                    var stocks = allStocks
                        .Where(s => s.ProductId == item.ProductId && s.BranchId == sale.BranchId && s.CurrentBalance > 0)
                        .OrderBy(s => s.ExpiryDate)
                        .ToList();

                    if (stocks.Sum(s => s.CurrentBalance) < remainingQty)
                        throw new Exception($"Insufficient stock for Product ID: {item.ProductId}");

                    foreach (var stock in stocks)
                    {
                        if (remainingQty <= 0) break;

                        decimal takeFromBatch = Math.Min(stock.CurrentBalance, remainingQty);

                        sale.SalesDetails.Add(new SalesDetail
                        {
                            ProductId = item.ProductId,
                            BatchNumber = stock.BatchNumber,
                            Quantity = takeFromBatch,
                            UnitPrice = item.UnitPrice,
                            PurchasePriceAtTime = stock.PurchasePrice
                        });

                        await _stockService.UpdateStockEntryAsync(
                            item.ProductId ?? 0,
                            sale.BranchId ?? 0,
                            stock.BatchNumber,
                            -takeFromBatch,
                            stock.PurchasePrice,
                            stock.Mrp,
                            stock.ExpiryDate
                        );

                        remainingQty -= takeFromBatch;
                    }
                }

                var result = await _salesRepo.AddAsync(sale);
                await _salesRepo.SaveChangesAsync();
                await transaction.CommitAsync();
                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception(ex.InnerException?.Message ?? ex.Message);
            }
        }

        public async Task DeleteSaleAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var sale = await _salesRepo.GetByIdAsync(id);
                if (sale == null) throw new Exception("Sale record not found.");

                foreach (var item in sale.SalesDetails)
                {
                    await _stockService.UpdateStockEntryAsync(
                        item.ProductId ?? 0,
                        sale.BranchId ?? 0,
                        item.BatchNumber ?? "N/A",
                        item.Quantity ?? 0,
                        item.PurchasePriceAtTime ?? 0,
                        item.UnitPrice ?? 0,
                        DateOnly.FromDateTime(DateTime.Now)
                    );
                }

                await _salesRepo.DeleteAsync(sale);
                await _salesRepo.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Deletion failed: " + ex.Message);
            }
        }

        public async Task<IEnumerable<SalesMaster>> GetAllSalesAsync() => await _salesRepo.GetAllAsync();

        // --- Sales Return Management ---

        public async Task<object> SearchInvoiceForReturnAsync(string invoiceNo)
        {
            var sale = await _salesRepo.GetByInvoiceWithDetailsAsync(invoiceNo);
            if (sale == null) throw new Exception("Invoice not found!");

            var items = sale.SalesDetails.Select(d => new
            {
                d.ProductId,
                ProductName = d.Product?.ProductName,
                d.BatchNumber,
                SoldQty = d.Quantity,
                AlreadyReturnedQty = _context.SalesReturnDetails
                    .Where(rd => rd.SalesReturn != null && rd.SalesReturn.SalesId == sale.SalesId && rd.ProductId == d.ProductId)
                    .Sum(rd => (decimal?)rd.Quantity) ?? 0,
                d.UnitPrice
            }).Select(i => new
            {
                i.ProductId,
                i.ProductName,
                i.BatchNumber,
                i.SoldQty,
                i.AlreadyReturnedQty,
                AvailableForReturn = i.SoldQty - i.AlreadyReturnedQty,
                i.UnitPrice
            }).ToList();

            return new
            {
                sale.SalesId,
                sale.BranchId,
                InvoiceNo = sale.InvoiceNo,
                CustomerName = sale.Party?.FullName ?? "Walking Customer",
                Items = items
            };
        }

        public async Task<SalesReturnMaster> CreateSalesReturnAsync(SalesReturnMaster returnMaster)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                returnMaster.ReturnNo = "SR-" + DateTime.Now.ToString("yyyyMMddHHmmss");
                returnMaster.ReturnDate = DateTime.Now;

                await _salesRepo.AddReturnAsync(returnMaster);
                await _salesRepo.SaveChangesAsync();

                foreach (var item in returnMaster.SalesReturnDetails)
                {
                    await _stockService.UpdateStockEntryAsync(
                        item.ProductId ?? 0,
                        returnMaster.BranchId ?? 0,
                        item.BatchNumber ?? "N/A",
                        item.Quantity,
                        0,
                        0,
                        DateOnly.FromDateTime(DateTime.Now)
                    );
                }

                await transaction.CommitAsync();
                return returnMaster;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Return failed: " + ex.Message);
            }
        }

        // --- missing code added to match ISalesService interface ---
        public async Task<IEnumerable<SalesReturnMaster>> GetAllReturnsAsync()
        {
            return await _salesRepo.GetAllReturnsAsync();
        }
    }
}