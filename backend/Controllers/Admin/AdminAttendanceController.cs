using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin;

[Route("admin/[controller]")]
public class AdminAttendanceController : BaseApiController
{
    private readonly AdminAttendanceService _adminAttendanceService;

    public AdminAttendanceController(AdminAttendanceService adminAttendanceService, ApplicationDbContext context)
        : base(context)
    {
        _adminAttendanceService = adminAttendanceService;
    }

    /// <summary>
    /// Get daily attendance for all employees with optional filters
    /// </summary>
    /// <param name="date">Date in YYYY-MM-DD format (optional, defaults to today)</param>
    /// <param name="branch">Branch name filter (optional)</param>
    /// <param name="department">Department filter (optional)</param>
    /// <param name="employeeId">Employee ID filter (optional)</param>
    [HttpGet("daily")]
    public async Task<IActionResult> GetDailyAttendance(
        [FromQuery] string? date = null,
        [FromQuery] string? branch = null,
        [FromQuery] string? department = null,
        [FromQuery] string? employeeId = null)
    {
        try
        {
            var employeeIdFromAuth = GetEmployeeIdFromAuth();
            if (employeeIdFromAuth == 0)
            {
                return Unauthorized(new { message = "Invalid authentication token" });
            }

            // Get tenant ID from authenticated employee
            var employee = await _context.Employees.FindAsync(employeeIdFromAuth);
            if (employee == null)
            {
                return Unauthorized(new { message = "Employee not found" });
            }

            var request = new DailyAttendanceRequest
            {
                Date = date,
                Branch = branch,
                Department = department,
                EmployeeId = employeeId,
                TenantId = employee.TenantId
            };

            var data = await _adminAttendanceService.GetDailyAttendance(request);

            return Ok(new
            {
                success = true,
                data = data,
                count = data.Count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Get monthly attendance summary for all employees with optional filters
    /// </summary>
    /// <param name="month">Month in YYYY-MM format (optional, defaults to current month)</param>
    /// <param name="branch">Branch name filter (optional)</param>
    /// <param name="department">Department filter (optional)</param>
    /// <param name="employeeId">Employee ID filter (optional)</param>
    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlyAttendance(
        [FromQuery] string? month = null,
        [FromQuery] string? branch = null,
        [FromQuery] string? department = null,
        [FromQuery] string? employeeId = null)
    {
        try
        {
            var employeeIdFromAuth = GetEmployeeIdFromAuth();
            if (employeeIdFromAuth == 0)
            {
                return Unauthorized(new { message = "Invalid authentication token" });
            }

            // Get tenant ID from authenticated employee
            var employee = await _context.Employees.FindAsync(employeeIdFromAuth);
            if (employee == null)
            {
                return Unauthorized(new { message = "Employee not found" });
            }

            var request = new MonthlyAttendanceRequest
            {
                Month = month,
                Branch = branch,
                Department = department,
                EmployeeId = employeeId,
                TenantId = employee.TenantId
            };

            var response = await _adminAttendanceService.GetMonthlyAttendance(request);

            return Ok(new
            {
                success = true,
                data = response.Data,
                count = response.Data.Count,
                includeWeekends = response.IncludeWeekends
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Get detailed attendance history for a specific employee
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <param name="days">Number of days to fetch (default 30)</param>
    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetEmployeeAttendanceDetails(string employeeId, [FromQuery] int days = 30)
    {
        try
        {
            var data = await _adminAttendanceService.GetEmployeeAttendanceDetails(employeeId, days);

            return Ok(new
            {
                success = true,
                data = data
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = ex.Message
            });
        }
    }
}
