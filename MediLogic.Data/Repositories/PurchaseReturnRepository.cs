using MediLogic.Data;
using MediLogic.Data.Interfaces;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

namespace MediLogic.Data.Repositories
{
    public class PurchaseReturnRepository : IPurchaseReturnRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IBatchStockRepository _batchStockRepo;

        public PurchaseReturnRepository(ApplicationDbContext context, IBatchStockRepository batchStockRepo)
        {
            _context = context;
            _batchStockRepo = batchStockRepo;
        }

        public async Task<PurchaseReturnMaster> CreateReturnAsync(PurchaseReturnMaster returnMaster)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                returnMaster.ReturnDate = DateTime.Now;
                returnMaster.ReturnNo = "RET-" + DateTime.Now.Ticks; 

                await _context.PurchaseReturnMasters.AddAsync(returnMaster);
                await _context.SaveChangesAsync();

                
                foreach (var item in returnMaster.PurchaseReturnDetails)
                {
                    
                    await _batchStockRepo.UpdateStockAsync(
                        item.ProductId ?? 0,
                        returnMaster.BranchId ?? 0,
                        item.BatchNumber ?? "N/A",
                        -item.Quantity, 
                        0, 0, DateOnly.FromDateTime(DateTime.Now) 
                    );
                }

                await transaction.CommitAsync();
                return returnMaster;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Return failed: " + ex.Message);
            }
        }

        public async Task<IEnumerable<PurchaseReturnMaster>> GetAllReturnsAsync()
        {
            return await _context.PurchaseReturnMasters
                .Include(r => r.Supplier)
                .Include(r => r.Purchase)
                .Include(r => r.PurchaseReturnDetails)
                .ToListAsync();
        }
    }
}