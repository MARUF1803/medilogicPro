using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class SalesRepository : ISalesRepository
    {
        private readonly ApplicationDbContext _context;

        public SalesRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- Sales Section ---

        public async Task<SalesMaster> AddAsync(SalesMaster sale)
        {
            await _context.SalesMasters.AddAsync(sale);
            return sale;
        }

        public async Task<SalesMaster?> GetByIdAsync(int id)
        {
            return await _context.SalesMasters
                .Include(s => s.SalesDetails)
                .FirstOrDefaultAsync(s => s.SalesId == id);
        }

        public async Task<IEnumerable<SalesMaster>> GetAllAsync()
        {
            return await _context.SalesMasters
                .Include(s => s.Party)
                .Include(s => s.Branch)
                .OrderByDescending(s => s.SalesDate)
                .ToListAsync();
        }

        public async Task DeleteAsync(SalesMaster sale)
        {
            _context.SalesDetails.RemoveRange(sale.SalesDetails);
            _context.SalesMasters.Remove(sale);
            await Task.CompletedTask;
        }

        // --- Sales Return Section ---

        public async Task<SalesMaster?> GetByInvoiceWithDetailsAsync(string invoiceNo)
        {
            return await _context.SalesMasters
                .Include(s => s.Party)
                .Include(s => s.SalesDetails).ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(s => s.InvoiceNo == invoiceNo);
        }

        public async Task AddReturnAsync(SalesReturnMaster returnMaster)
        {
            await _context.SalesReturnMasters.AddAsync(returnMaster);
        }

        public async Task<IEnumerable<SalesReturnMaster>> GetAllReturnsAsync()
        {
            return await _context.SalesReturnMasters
                .Include(r => r.Sales)
                .OrderByDescending(r => r.ReturnDate)
                .ToListAsync();
        }

        // --- Shared ---

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}