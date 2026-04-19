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
    }
}