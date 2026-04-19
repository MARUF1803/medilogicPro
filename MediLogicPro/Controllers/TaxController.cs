using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaxController : ControllerBase
    {
        private readonly ITaxService _service;

        public TaxController(ITaxService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllTaxesAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var tax = await _service.GetTaxByIdAsync(id);
            return tax == null ? NotFound() : Ok(tax);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Tax tax)
        {
            var created = await _service.CreateTaxAsync(tax);
            return CreatedAtAction(nameof(Get), new { id = created.TaxId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Tax tax)
        {
            if (id != tax.TaxId) return BadRequest("ID Mismatch");
            await _service.UpdateTaxAsync(tax);
            return Ok(new { message = "Tax Updated Successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteTaxAsync(id);
            return Ok(new { message = "Tax Deleted Successfully" });
        }
    }
}