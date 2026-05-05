using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseController : ControllerBase
    {
        private readonly IPurchaseService _service;

        public PurchaseController(IPurchaseService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllPurchasesAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var data = await _service.GetPurchaseByIdAsync(id);
            if (data == null) return NotFound("Invoice not found.");
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseMaster purchase)
        {
            try
            {
                var result = await _service.CreatePurchaseAsync(purchase);
                return CreatedAtAction(nameof(Get), new { id = result.PurchaseId }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("AddPayment/{purchaseId}")]
        public async Task<IActionResult> AddPayment(int purchaseId, [FromBody] List<PurchasePayment> payments)
        {
            if (payments == null || !payments.Any()) return BadRequest("No payments provided.");
            try
            {
                await _service.AddPaymentsAsync(purchaseId, payments);
                return Ok(new { message = "Payment recorded successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}