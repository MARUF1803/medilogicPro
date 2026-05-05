using MediLogic.Data.Interfaces;
using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;

        public CategoryService(ICategoryRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync() => await _repo.GetAllAsync();
        public async Task<Category> GetCategoryByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<Category> CreateCategoryAsync(Category category) => await _repo.AddAsync(category);
        public async Task UpdateCategoryAsync(Category category) => await _repo.UpdateAsync(category);
        public async Task DeleteCategoryAsync(int id) => await _repo.DeleteAsync(id);
    }
}