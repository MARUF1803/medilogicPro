using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartyController : ControllerBase
    {
        private readonly IPartyService _service;

        public PartyController(IPartyService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllPartiesAsync());

        // New Endpoint: Get only Customers
        [HttpGet("Customers")]
        public async Task<IActionResult> GetCustomers()
        {
            var data = await _service.GetAllPartiesAsync();
            var customers = data.Where(p => p.PartyType != null &&
                                           p.PartyType.Equals("Customer", StringComparison.OrdinalIgnoreCase) &&
                                           (p.IsActive ?? true));
            return Ok(customers);
        }

        // New Endpoint: Get only Suppliers
        [HttpGet("Suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            var data = await _service.GetAllPartiesAsync();
            var suppliers = data.Where(p => p.PartyType != null &&
                                            p.PartyType.Equals("Supplier", StringComparison.OrdinalIgnoreCase) &&
                                            (p.IsActive ?? true));
            return Ok(suppliers);
        }

        [HttpGet("Search/{term}")]
        public async Task<IActionResult> Search(string term)
        {
            var result = await _service.SearchPartyAsync(term);
            return Ok(result);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var party = await _service.GetPartyByIdAsync(id);
            if (party == null) return NotFound();
            return Ok(party);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Party party)
        {
            try
            {
                // Ensure default values if needed
                party.CreatedAt = DateTime.Now;
                party.IsActive = party.IsActive ?? true;

                var created = await _service.CreatePartyAsync(party);
                return CreatedAtAction(nameof(Get), new { id = created.PartyId }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Party party)
        {
            if (id != party.PartyId) return BadRequest("ID Mismatch");
            try
            {
                await _service.UpdatePartyAsync(party);
                return Ok(new { message = "Party details updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeletePartyAsync(id);
                return Ok(new { message = "Party deactivated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}