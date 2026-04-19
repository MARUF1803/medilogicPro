using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class UomService : IUomService
    {
        private readonly IUomRepository _repo;

        public UomService(IUomRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Uom>> GetAllUomsAsync() => await _repo.GetAllAsync();
        public async Task<Uom> GetUomByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<Uom> CreateUomAsync(Uom uom) => await _repo.AddAsync(uom);
        public async Task UpdateUomAsync(Uom uom) => await _repo.UpdateAsync(uom);
        public async Task DeleteUomAsync(int id) => await _repo.DeleteAsync(id);
    }
}