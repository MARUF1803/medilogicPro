using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class TaxRepository : ITaxRepository
    {
        private readonly ApplicationDbContext _context;

        public TaxRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tax>> GetAllAsync() => await _context.Taxes.ToListAsync();

        public async Task<Tax> GetByIdAsync(int id) => (await _context.Taxes.FindAsync(id))!;

        public async Task<Tax> AddAsync(Tax tax)
        {
            await _context.Taxes.AddAsync(tax);
            await _context.SaveChangesAsync();
            return tax;
        }

        public async Task UpdateAsync(Tax tax)
        {
            var existing = await _context.Taxes.FindAsync(tax.TaxId);
            if (existing != null)
            {
                existing.TaxCode = tax.TaxCode;
                existing.TaxName = tax.TaxName;
                existing.VatRate = tax.VatRate;
                existing.Remarks = tax.Remarks;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var tax = await _context.Taxes.FindAsync(id);
            if (tax != null)
            {
                _context.Taxes.Remove(tax);
                await _context.SaveChangesAsync();
            }
        }
    }
}