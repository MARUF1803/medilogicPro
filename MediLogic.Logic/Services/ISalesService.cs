using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface ISalesService
    {
        // Sales methods
        Task<SalesMaster> CreateSaleAsync(SalesMaster sale);
        Task DeleteSaleAsync(int id);
        Task<IEnumerable<SalesMaster>> GetAllSalesAsync();

        // Sales Return methods
        Task<object> SearchInvoiceForReturnAsync(string invoiceNo);
        Task<SalesReturnMaster> CreateSalesReturnAsync(SalesReturnMaster returnMaster);
        Task<IEnumerable<SalesReturnMaster>> GetAllReturnsAsync();
    }
}