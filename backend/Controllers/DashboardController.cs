using BankAPI.Models.DTOs;
using BankAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BankAPI.Data;


namespace BankAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : BaseApiController
    {
        private readonly DashboardService _dashboardService;
        public DashboardController(DashboardService dashboardService, ApplicationDbContext context) : base(context)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Get dashboard statistics for the authenticated employee
        /// </summary>
        /// <returns>Dashboard statistics including attendance, tasks, and skills</returns>
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }
                var stats = await _dashboardService.GetDashboardStatsAsync(employeeId);

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving dashboard statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a quick summary for mobile or compact views
        /// </summary>
        /// <returns>Quick summary of key metrics</returns>
        [HttpGet("summary")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetQuickSummary()
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var stats = await _dashboardService.GetDashboardStatsAsync(employeeId);

                var summary = new
                {
                    attendanceRate = $"{stats.AttendanceStats.AttendanceRate}%",
                    tasksCompleted = stats.TaskStats.TasksCompleted,
                    skillScore = $"{stats.SkillStats.AverageScore}/10",
                    recentActivityCount = stats.RecentActivities.Count
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving dashboard summary", error = ex.Message });
            }
        }
    }
}
