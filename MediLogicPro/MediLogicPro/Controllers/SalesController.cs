using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MediLogicPro.Controllers
{
    [Route("api/SalesHistory")]
    [ApiController]
   // [Authorize]//
    public class SalesController : ControllerBase
    {
        private readonly ISalesService _salesService;

        public SalesController(ISalesService salesService)
        {
            _salesService = salesService;
        }

        #region Sales Actions

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var result = await _salesService.GetSaleByIdAsync(id);
                if (result == null) return NotFound("Invoice not found.");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _salesService.GetAllSalesAsync();
            return Ok(data);
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] SalesMaster sale)
        {
            ModelState.Remove("Branch");
            ModelState.Remove("Party");
            ModelState.Remove("User");

            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim != null)
                {
                    sale.UserId = int.Parse(userIdClaim);
                }

                var result = await _salesService.CreateSaleAsync(sale);
                return Ok(new { message = "Sale successful", salesId = result.SalesId, invoice = result.InvoiceNo });
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException?.Message ?? ex.Message;
                return Conflict(new { error = msg });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _salesService.DeleteSaleAsync(id);
                return Ok(new { message = "Invoice deleted and stock restored successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("AddPayment/{salesId}")]
        public async Task<IActionResult> AddPayment(int salesId, [FromBody] List<SalesPayment> payments)
        {
            if (payments == null || !payments.Any()) return BadRequest("No payments provided.");
            try
            {
                await _salesService.AddPaymentsAsync(salesId, payments);
                return Ok(new { message = "Payment recorded successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        #endregion

        #region Sales Return Actions

        // 1. Search Invoice for Return
        [HttpGet("SearchInvoice/{invoiceNo}")]
        public async Task<IActionResult> SearchInvoice(string invoiceNo)
        {
            try
            {
                var result = await _salesService.SearchInvoiceForReturnAsync(invoiceNo);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpGet("GetReturn/{id}")]
        public async Task<IActionResult> GetReturnById(int id)
        {
            try
            {
                var result = await _salesService.GetReturnByIdAsync(id);
                if (result == null) return NotFound("Return record not found.");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // 2. Create Sales Return
        [HttpPost("CreateReturn")]
        public async Task<IActionResult> CreateReturn([FromBody] SalesReturnMaster returnMaster)
        {
            // Validations to ignore navigation properties during request
            ModelState.Remove("Branch");
            ModelState.Remove("Sales");

            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _salesService.CreateSalesReturnAsync(returnMaster);
                return Ok(new { message = "Return processed successfully", returnNo = result.ReturnNo, salesReturnId = result.SalesReturnId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // 3. Get All Returns
        [HttpGet("GetAllReturns")]
        public async Task<IActionResult> GetAllReturns()
        {
            var data = await _salesService.GetAllReturnsAsync();
            return Ok(data);
        }

        #endregion
    }
}