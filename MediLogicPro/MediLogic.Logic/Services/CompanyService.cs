using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository _repo;

        public CompanyService(ICompanyRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Company>> GetAllCompaniesAsync() => await _repo.GetAllAsync();
        public async Task<Company> GetCompanyByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<Company> CreateCompanyAsync(Company company) => await _repo.AddAsync(company);
        public async Task UpdateCompanyAsync(Company company) => await _repo.UpdateAsync(company);
        public async Task DeleteCompanyAsync(int id) => await _repo.DeleteAsync(id);
    }
}