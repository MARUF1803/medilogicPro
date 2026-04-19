using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .Where(p => p.IsDeleted != true)
                .Include(p => p.Category)
                .Include(p => p.Tax)
                .Include(p => p.Uom)
                .ToListAsync();
        }

        public async Task<Product> GetByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Tax)
                .Include(p => p.Uom)
                .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task<Product> AddAsync(Product product)
        {
            product.IsDeleted = false;
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            var existing = await _context.Products.FindAsync(product.ProductId);
            if (existing != null)
            {
                existing.ProductCode = product.ProductCode;
                existing.ProductName = product.ProductName;
                existing.GenericName = product.GenericName;
                existing.Strength = product.Strength;
                existing.CategoryId = product.CategoryId;
                existing.UomId = product.UomId;
                existing.TaxId = product.TaxId;
                existing.PurchasePrice = product.PurchasePrice;
                existing.SalePrice = product.SalePrice;
                // Note: ReOrderLevel is not in your current Product model properties, 
                // if it's in another table or added later, we will include it then.

                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                product.IsDeleted = true; // Soft Delete
                await _context.SaveChangesAsync();
            }
        }
        public async Task<IEnumerable<Product>> SearchProductsAsync(string term)
        {
            return await _context.Products
                .Where(p => p.IsDeleted != true &&
                           (p.ProductName.Contains(term) || p.ProductCode.Contains(term)))
                .Include(p => p.Category)
                .ToListAsync();
        }
    }
}