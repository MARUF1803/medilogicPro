using System.Collections.Generic;
using System.Threading.Tasks;
using MediLogic.Models;

namespace MediLogic.Logic.Services;

public interface IDocumentService
{
    byte[] GenerateSalesInvoice(SalesMaster sale);
    byte[] GenerateSalesReturnMemo(SalesReturnMaster salesReturn);
    byte[] GeneratePurchaseReturnMemo(PurchaseReturnMaster purchaseReturn);
    byte[] GenerateStockReport(IEnumerable<BatchStock> stocks);
}
