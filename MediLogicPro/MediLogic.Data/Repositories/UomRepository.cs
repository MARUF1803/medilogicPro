using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class UomRepository : IUomRepository
    {
        private readonly ApplicationDbContext _context;

        public UomRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Uom>> GetAllAsync() => await _context.Uoms.ToListAsync();

        public async Task<Uom> GetByIdAsync(int id) => (await _context.Uoms.FindAsync(id))!;

        public async Task<Uom> AddAsync(Uom uom)
        {
            await _context.Uoms.AddAsync(uom);
            await _context.SaveChangesAsync();
            return uom;
        }

        public async Task UpdateAsync(Uom uom)
        {
            var existing = await _context.Uoms.FindAsync(uom.UomId);
            if (existing != null)
            {
                existing.UomName = uom.UomName;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var uom = await _context.Uoms.FindAsync(id);
            if (uom != null)
            {
                _context.Uoms.Remove(uom);
                await _context.SaveChangesAsync();
            }
        }
    }
}