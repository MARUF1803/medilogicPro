using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseReturnController : ControllerBase
    {
        private readonly IPurchaseReturnService _service;
        public PurchaseReturnController(IPurchaseReturnService service) => _service = service;

        [HttpPost]
        public async Task<IActionResult> CreateReturn([FromBody] PurchaseReturnMaster returnData)
        {
            try
            {
                var result = await _service.ProcessReturnAsync(returnData);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllReturnsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReturnById(int id)
        {
            var data = await _service.GetReturnByIdAsync(id);
            if (data == null) return NotFound("Return record not found.");
            return Ok(data);
        }
    }
}