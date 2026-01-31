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
    /// Get detailed attendance history for a specific employee for a specific month
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <param name="month">Month in YYYY-MM format (required)</param>
    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetEmployeeAttendanceDetails(string employeeId, [FromQuery] string month)
    {
        try
        {
            var employeeIdFromAuth = GetEmployeeIdFromAuth();
            if (employeeIdFromAuth == 0)
            {
                return Unauthorized(new { message = "Invalid authentication token" });
            }

            var employee = await _context.Employees.FindAsync(employeeIdFromAuth);
            if (employee == null)
            {
                return Unauthorized(new { message = "Employee not found" });
            }

            var request = new EmployeeAttendanceRequest
            {
                Month = month,
                TenantId = employee.TenantId
            };

            var data = await _adminAttendanceService.GetEmployeeAttendanceDetails(employeeId, request);

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

    /// <summary>
    /// Declare a holiday (admin)
    /// </summary>
    [HttpPost("declare-holiday")]
    public async Task<IActionResult> DeclareHoliday([FromBody] DeclareHolidayDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || dto.TenantId <= 0 || dto.Date == default)
            return BadRequest("Invalid data");

        try
        {
            var result = await _adminAttendanceService.DeclareHolidayAsync(dto);
            if (result.Success)
                return Ok(new { success = true });
            else
                return Conflict(new { success = false, message = result.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
    /// <summary>
    /// Get holiday calendar for a specific month and optional branch
    /// </summary>
    [HttpGet("holidays/calendar")]
    public async Task<IActionResult> GetHolidayCalendar([FromQuery] int year, [FromQuery] int month, [FromQuery] int? branchId = null)
    {
        try
        {
            var employeeIdFromAuth = GetEmployeeIdFromAuth();
            if (employeeIdFromAuth == 0)
                return Unauthorized(new { message = "Invalid authentication token" });

            var employee = await _context.Employees.FindAsync(employeeIdFromAuth);
            if (employee == null)
                return Unauthorized(new { message = "Employee not found" });

            var data = await _adminAttendanceService.GetHolidaysByBranchNameAsync(year, month, (int)employee.TenantId, branchId);
            return Ok(new { success = true, data });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Create a new holiday
    /// </summary>
    [HttpPost("holidays")]
    public async Task<IActionResult> CreateHoliday([FromBody] CreateHolidayDto holidayDto)
    {
        try
        {
            var employeeIdFromAuth = GetEmployeeIdFromAuth();
            if (employeeIdFromAuth == 0)
                return Unauthorized(new { message = "Invalid authentication token" });

            var employee = await _context.Employees.FindAsync(employeeIdFromAuth);
            if (employee == null)
                return Unauthorized(new { message = "Employee not found" });

            var createdHoliday = await _adminAttendanceService.CreateHolidayAsync(holidayDto, (int)employee.TenantId, (int)employeeIdFromAuth);
            return Ok(new { success = true, data = createdHoliday });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a holiday
    /// </summary>
    [HttpDelete("holidays/{holidayId}")]
    public async Task<IActionResult> DeleteHoliday(int holidayId)
    {
        try
        {
            var employeeIdFromAuth = GetEmployeeIdFromAuth();
            if (employeeIdFromAuth == 0)
                return Unauthorized(new { message = "Invalid authentication token" });

            var employee = await _context.Employees.FindAsync(employeeIdFromAuth);
            if (employee == null)
                return Unauthorized(new { message = "Employee not found" });

            var result = await _adminAttendanceService.DeleteHolidayAsync(holidayId, (int)employee.TenantId);
            return Ok(new { success = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get holidays for a date range
    /// </summary>
    [HttpGet("holidays/daterange")]
    public async Task<IActionResult> GetHolidaysForDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? branchId = null)
    {
        try
        {
            var employeeIdFromAuth = GetEmployeeIdFromAuth();
            if (employeeIdFromAuth == 0)
                return Unauthorized(new { message = "Invalid authentication token" });

            var employee = await _context.Employees.FindAsync(employeeIdFromAuth);
            if (employee == null)
                return Unauthorized(new { message = "Employee not found" });

            var data = await _adminAttendanceService.GetHolidaysForDateRangeAsync(startDate, endDate, (int)employee.TenantId, branchId);
            return Ok(new { success = true, data });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}
