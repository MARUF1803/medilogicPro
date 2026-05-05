using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly ApplicationDbContext _context;

        public CompanyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Company>> GetAllAsync() => await _context.Companies.ToListAsync();

        public async Task<Company> GetByIdAsync(int id) => (await _context.Companies.FindAsync(id))!;

        public async Task<Company> AddAsync(Company company)
        {
            
            company.CreatedDate = DateTime.Now;
            await _context.Companies.AddAsync(company);
            await _context.SaveChangesAsync();
            return company;
        }

        public async Task UpdateAsync(Company company)
        {
            var existing = await _context.Companies.FindAsync(company.CompanyId);
            if (existing != null)
            {
                
                existing.CompanyName = company.CompanyName;
                existing.CompanyCode = company.CompanyCode;
                existing.Address = company.Address;
                existing.RegistrationNumber = company.RegistrationNumber;

                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company != null)
            {
                _context.Companies.Remove(company);
                await _context.SaveChangesAsync();
            }
        }
    }
}