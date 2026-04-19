using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _service;

        public ProductController(IProductService service)
        {
            _service = service;
        }

        // --- NEW: Added for React POS Search ---
        // URL: GET api/Product/SearchInventory/{term}/{branchId}
        [HttpGet("SearchInventory/{term}/{branchId}")]
        public async Task<IActionResult> SearchInventory(string term, int branchId)
        {
            try
            {
                var result = await _service.SearchInventoryAsync(term, branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllProductsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var product = await _service.GetProductByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            var created = await _service.CreateProductAsync(product);
            return CreatedAtAction(nameof(Get), new { id = created.ProductId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Product product)
        {
            if (id != product.ProductId) return BadRequest("ID Mismatch");
            await _service.UpdateProductAsync(product);
            return Ok(new { message = "Product updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteProductAsync(id);
            return Ok(new { message = "Product deleted successfully" });
        }
    }
}