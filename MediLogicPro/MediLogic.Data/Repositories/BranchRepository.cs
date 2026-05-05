using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class BranchRepository : IBranchRepository
    {
        private readonly ApplicationDbContext _context;

        public BranchRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Branch>> GetAllAsync()
        {
            return await _context.Branches
                .Where(b => b.IsActive != false)
                .Include(b => b.Company)
                .ToListAsync();
        }

        public async Task<Branch> GetByIdAsync(int id)
        {
            return (await _context.Branches
                .Include(b => b.Company)
                .FirstOrDefaultAsync(b => b.BranchId == id))!;
        }

        public async Task<Branch> AddAsync(Branch branch)
        {
            branch.IsActive = true;
            branch.AddedDate = DateTime.Now;
            await _context.Branches.AddAsync(branch);
            await _context.SaveChangesAsync();
            return branch;
        }

        public async Task UpdateAsync(Branch branch)
        {
            var existing = await _context.Branches.FindAsync(branch.BranchId);
            if (existing != null)
            {
                existing.BranchCode = branch.BranchCode;
                existing.BranchName = branch.BranchName;
                existing.Address = branch.Address;
                existing.CompanyId = branch.CompanyId;
                existing.IsActive = branch.IsActive;

                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch != null)
            {
                branch.IsActive = false; // Soft Delete
                await _context.SaveChangesAsync();
            }
        }
    }
}