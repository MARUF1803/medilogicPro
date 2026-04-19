using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class PartyRepository : IPartyRepository
    {
        private readonly ApplicationDbContext _context;

        public PartyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Party>> GetAllAsync()
        {
            return await _context.Parties
                .Where(p => p.IsActive != false)
                .Include(p => p.Branch)
                .ToListAsync();
        }

        public async Task<Party> GetByIdAsync(int id)
        {
            return await _context.Parties
                .Include(p => p.Branch)
                .FirstOrDefaultAsync(p => p.PartyId == id);
        }

        public async Task<Party> AddAsync(Party party)
        {
            party.IsActive = true;
            party.CreatedAt = DateTime.Now;
            party.CurrentBalance ??= 0; // Default balance 0 if null

            await _context.Parties.AddAsync(party);
            await _context.SaveChangesAsync();
            return party;
        }

        public async Task UpdateAsync(Party party)
        {
            var existing = await _context.Parties.FindAsync(party.PartyId);
            if (existing != null)
            {
                existing.PartyCode = party.PartyCode;
                existing.FullName = party.FullName;
                existing.PhoneNumber = party.PhoneNumber;
                existing.Email = party.Email;
                existing.PartyType = party.PartyType;
                existing.BranchId = party.BranchId;
                existing.CurrentBalance = party.CurrentBalance;
                existing.IsActive = party.IsActive;

                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var party = await _context.Parties.FindAsync(id);
            if (party != null)
            {
                party.IsActive = false; // Soft delete
                await _context.SaveChangesAsync();
            }
        }
    }
}