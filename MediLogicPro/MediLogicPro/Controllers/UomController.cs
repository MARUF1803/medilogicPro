using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UomController : ControllerBase
    {
        private readonly IUomService _service;

        public UomController(IUomService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllUomsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var uom = await _service.GetUomByIdAsync(id);
            return uom == null ? NotFound() : Ok(uom);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Uom uom)
        {
            var created = await _service.CreateUomAsync(uom);
            return CreatedAtAction(nameof(Get), new { id = created.UomId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Uom uom)
        {
            if (id != uom.UomId) return BadRequest("ID Mismatch");
            await _service.UpdateUomAsync(uom);
            return Ok(new { message = "UOM Updated Successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteUomAsync(id);
            return Ok(new { message = "UOM Deleted Successfully" });
        }
    }
}