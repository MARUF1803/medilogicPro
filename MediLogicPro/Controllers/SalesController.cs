using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _salesService.GetAllSalesAsync();
            return Ok(data);
        }

        [Authorize(Roles = "Salesman,Admin")]
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
                return Ok(new { message = "Sale successful", invoice = result.InvoiceNo });
            }
            catch (Exception ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
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

        // 2. Create Sales Return
        [Authorize(Roles = "Salesman,Admin")]
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
                return Ok(new { message = "Return processed successfully", returnNo = result.ReturnNo });
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