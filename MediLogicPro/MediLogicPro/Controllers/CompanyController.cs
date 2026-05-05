using MediLogic.Logic.Services;
using MediLogic.Models;
using Microsoft.AspNetCore.Mvc;

namespace MediLogicPro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyService _service;

        public CompanyController(ICompanyService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllCompaniesAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var company = await _service.GetCompanyByIdAsync(id);
            if (company == null) return NotFound();
            return Ok(company);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Company company)
        {
            var created = await _service.CreateCompanyAsync(company);
            return CreatedAtAction(nameof(Get), new { id = created.CompanyId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Company company)
        {
            if (id != company.CompanyId) return BadRequest("ID Mismatch");
            await _service.UpdateCompanyAsync(company);
            return Ok("Updated Successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteCompanyAsync(id);
            return Ok("Deleted Successfully");
        }
    }
}