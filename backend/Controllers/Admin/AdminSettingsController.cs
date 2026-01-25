using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;
using BankAPI.Services.Admin;
using BankAPI.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Controllers.Admin
{

    [Route("admin/[controller]")]
    [ApiController]
    public class AdminSettingsController : BaseApiController
    {
        private readonly AdminSettingsService _settingsService;

        public AdminSettingsController(ApplicationDbContext context, AdminSettingsService settingsService) : base(context)
        {
            _settingsService = settingsService;
        }


        // GET: api/admin/settings
        [HttpGet]
        public async Task<IActionResult> GetAllSettings()
        {
            var employeeId = GetEmployeeIdFromAuth();
            if (employeeId == 0)
                return Unauthorized(new { message = "Invalid authentication token" });

            // Get tenantId for this employee
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
                return Unauthorized(new { message = "Employee not found" });

            var settings = await _settingsService.GetSettingsForTenant(employee.TenantId);
            return Ok(settings);
        }

        // PUT: api/admin/settings/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSetting(int id, [FromBody] Setting updatedSetting)
        {
            var employeeId = GetEmployeeIdFromAuth();
            if (employeeId == 0)
                return Unauthorized(new { message = "Invalid authentication token" });

            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
                return Unauthorized(new { message = "Employee not found" });

            var result = await _settingsService.UpdateSetting(id, employee.TenantId, updatedSetting.Key, updatedSetting.Value);
            if (result == null)
                return NotFound();
            return Ok(result);
        }
    }
}
