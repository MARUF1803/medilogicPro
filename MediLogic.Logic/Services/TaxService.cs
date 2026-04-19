using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class TaxService : ITaxService
    {
        private readonly ITaxRepository _repo;

        public TaxService(ITaxRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Tax>> GetAllTaxesAsync() => await _repo.GetAllAsync();
        public async Task<Tax> GetTaxByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<Tax> CreateTaxAsync(Tax tax) => await _repo.AddAsync(tax);
        public async Task UpdateTaxAsync(Tax tax) => await _repo.UpdateAsync(tax);
        public async Task DeleteTaxAsync(int id) => await _repo.DeleteAsync(id);
    }
}