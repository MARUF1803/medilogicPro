using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ISalesService _salesService;
        private readonly IPurchaseService _purchaseService;

        public PaymentController(ISalesService salesService, IPurchaseService purchaseService)
        {
            _salesService = salesService;
            _purchaseService = purchaseService;
        }

        [HttpPost("Confirm")]
        public async Task<IActionResult> ConfirmPayment([FromBody] PaymentConfirmationDto dto)
        {
            try
            {
                await _salesService.ConfirmPaymentAsync(dto.SalesId, dto.TransactionId, dto.Provider);
                return Ok(new { message = "Payment confirmed and stock updated." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // --- Split Payment Endpoints ---

        [HttpPost("Sales")]
        public async Task<IActionResult> AddSalesPayments([FromBody] SplitPaymentRequest<SalesPayment> request)
        {
            try
            {
                await _salesService.AddPaymentsAsync(request.Id, request.Payments);
                return Ok(new { message = "Sales payments processed successfully." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("SupplierPayment")]
        public async Task<IActionResult> AddPurchasePayments([FromBody] SplitPaymentRequest<PurchasePayment> request)
        {
            try
            {
                await _purchaseService.AddPaymentsAsync(request.Id, request.Payments);
                return Ok(new { message = "Supplier payments processed successfully." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Mock Endpoint for Automated Payment (Simulating your custom API)
        [HttpPost("MockAutoPayment")]
        public async Task<IActionResult> MockAutoPayment([FromBody] PaymentConfirmationDto dto)
        {
            // Simulate an external API call
            await Task.Delay(1000); 

            // If "fail" is in the provider name, mock a failure
            if (dto.Provider.ToLower().Contains("fail"))
            {
                return BadRequest(new { error = "External API: Payment verification failed." });
            }

            // Otherwise succeed
            await _salesService.ConfirmPaymentAsync(dto.SalesId, dto.TransactionId, dto.Provider);
            return Ok(new { message = "Automated Payment successful!", trxId = "AUTO-" + System.Guid.NewGuid().ToString().Substring(0, 8) });
        }
    }

    public class PaymentConfirmationDto
    {
        public int SalesId { get; set; }
        public required string TransactionId { get; set; }
        public required string Provider { get; set; }
    }

    public class SplitPaymentRequest<T>
    {
        public int Id { get; set; } // SalesId or PurchaseId
        public List<T> Payments { get; set; } = new();
    }
}
