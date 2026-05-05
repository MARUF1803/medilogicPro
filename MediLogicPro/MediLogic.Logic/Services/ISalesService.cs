using MediLogic.Models;

namespace MediLogic.Logic.Services
{
    public interface ISalesService
    {
        // Sales methods
        Task<SalesMaster> CreateSaleAsync(SalesMaster sale);
        Task DeleteSaleAsync(int id);
        Task<SalesMaster?> GetSaleByIdAsync(int id);
        Task<IEnumerable<object>> GetAllSalesAsync();
        Task ConfirmPaymentAsync(int salesId, string transactionId, string provider);
        Task AddPaymentsAsync(int salesId, List<SalesPayment> payments);

        // Sales Return methods
        Task<SalesReturnMaster?> GetReturnByIdAsync(int id);
        Task<object> SearchInvoiceForReturnAsync(string invoiceNo);
        Task<SalesReturnMaster> CreateSalesReturnAsync(SalesReturnMaster returnMaster);
        Task<IEnumerable<object>> GetAllReturnsAsync();
    }
}