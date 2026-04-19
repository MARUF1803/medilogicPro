using MediLogic.Logic.Services;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BatchStockController : ControllerBase
    {
        private readonly IBatchStockService _service;

        public BatchStockController(IBatchStockService service)
        {
            _service = service;
        }

        public class StockUpdateRequest
        {
            public int ProductId { get; set; }
            public int BranchId { get; set; }
            public string BatchNumber { get; set; } = null!;
            public decimal Quantity { get; set; }
            public decimal PurchasePrice { get; set; }
            public decimal Mrp { get; set; }
            public DateOnly ExpiryDate { get; set; }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllStocksAsync());

        [HttpGet("GetFifoBatch/{productId}/{branchId}")]
        public async Task<IActionResult> GetFifo(int productId, int branchId)
        {
            var result = await _service.GetFifoBatchInfoAsync(productId, branchId);
            if (result == null) return NotFound(new { message = "No stock found!" });
            return Ok(result);
        }

        [HttpGet("GetProductBatches/{productId}/{branchId}")]
        public async Task<IActionResult> GetBatches(int productId, int branchId)
        {
            var result = await _service.GetProductBatchesAsync(productId, branchId);
            return Ok(result);
        }

        [HttpPost("UpdateStock")]
        public async Task<IActionResult> UpdateStock([FromBody] StockUpdateRequest request)
        {
            try
            {
                await _service.UpdateStockEntryAsync(request.ProductId, request.BranchId, request.BatchNumber, request.Quantity, request.PurchasePrice, request.Mrp, request.ExpiryDate);
                return Ok(new { message = "Stock updated successfully!" });
            }
            catch (Exception ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPost("SyncOldData")]
        public async Task<IActionResult> Sync()
        {
            try
            {
                await _service.SyncOldDataAsync();
                return Ok(new { message = "All previous purchase data synced to stock!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}