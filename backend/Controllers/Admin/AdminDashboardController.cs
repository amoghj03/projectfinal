using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin
{
    [Route("admin/[controller]")]
    [ApiController]
    public class AdminDashboardController : BaseApiController
    {
        private readonly AdminDashboardService _adminDashboardService;

        public AdminDashboardController(AdminDashboardService adminDashboardService, ApplicationDbContext context) : base(context)
        {
            _adminDashboardService = adminDashboardService;
        }

        /// <summary>
        /// Get admin dashboard statistics with branch filtering
        /// </summary>
        /// <param name="branch">Optional branch filter</param>
        /// <returns>Admin dashboard statistics</returns>
        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAdminDashboardStats([FromQuery] string? branch = null)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var stats = await _adminDashboardService.GetAdminDashboardStatsAsync(employeeId, branch);

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving admin dashboard statistics", error = ex.Message });
            }
        }
    }
}
