using System.Threading.Tasks;
using MediLogic.Logic.Services;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BarcodeController : ControllerBase
    {
        private readonly IProductService _productService;

        public BarcodeController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet("{code}")]
        public async Task<IActionResult> GetByBarcode(string code, [FromQuery] int branchId)
        {
            var product = await _productService.GetProductByBarcodeAsync(code, branchId);
            if (product == null) return NotFound(new { message = "Product not found for this barcode." });
            return Ok(product);
        }
    }
}
