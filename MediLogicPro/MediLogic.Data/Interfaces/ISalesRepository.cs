using MediLogic.Models;

namespace MediLogic.Data.Interfaces
{
    public interface ISalesRepository
    {
        Task<SalesMaster> AddAsync(SalesMaster sale);
        Task<SalesMaster?> GetByIdAsync(int id);
        Task<IEnumerable<SalesMaster>> GetAllAsync();
        Task DeleteAsync(SalesMaster sale);
        Task SaveChangesAsync();

        Task<SalesMaster?> GetByInvoiceWithDetailsAsync(string invoiceNo);
        Task AddReturnAsync(SalesReturnMaster returnMaster);
        Task<IEnumerable<SalesReturnMaster>> GetAllReturnsAsync();
    }
}