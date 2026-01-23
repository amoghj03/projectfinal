using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin;


[Route("admin/[controller]")]
public class AdminAttendanceReportController : BaseApiController
{
    private readonly AdminAttendanceReportService _reportService;

    public AdminAttendanceReportController(AdminAttendanceReportService reportService, ApplicationDbContext context)
        : base(context)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// Get attendance report for a date range (inclusive)
    /// </summary>
    /// <param name="fromDate">Start date (YYYY-MM-DD)</param>
    /// <param name="toDate">End date (YYYY-MM-DD)</param>
    /// <param name="branch">Branch filter (optional)</param>
    /// <param name="department">Department filter (optional)</param>
    /// <param name="employeeId">Employee ID filter (optional)</param>
    [HttpGet("range")]
    public async Task<IActionResult> GetAttendanceRange(
        [FromQuery] string fromDate,
        [FromQuery] string toDate,
        [FromQuery] string? branch = null,
        [FromQuery] string? department = null,
        [FromQuery] string? employeeId = null)
    {
        try
        {
            var employeeIdFromAuth = GetEmployeeIdFromAuth();
            if (employeeIdFromAuth == 0)
                return Unauthorized(new { message = "Invalid authentication token" });
            var employee = await _context.Employees.FindAsync(employeeIdFromAuth);
            if (employee == null)
                return Unauthorized(new { message = "Employee not found" });

            var request = new AttendanceRangeRequest
            {
                FromDate = fromDate,
                ToDate = toDate,
                Branch = branch,
                Department = department,
                EmployeeId = employeeId,
                TenantId = employee.TenantId
            };
            var data = await _reportService.GetAttendanceRangeReport(request);
            return Ok(new { success = true, data, count = data.Count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Get complaint summary report for a date range (inclusive)
    /// </summary>
    /// <param name="fromDate">Start date (YYYY-MM-DD)</param>
    /// <param name="toDate">End date (YYYY-MM-DD)</param>
    /// <param name="branch">Branch filter (optional)</param>
    /// <param name="department">Department filter (optional)</param>
    /// <param name="employeeId">Employee ID filter (optional)</param>
    [HttpGet("complaints-range")]
    public async Task<IActionResult> GetComplaintSummaryRange(
        [FromQuery] string fromDate,
        [FromQuery] string toDate,
        [FromQuery] string? branch = null,
        [FromQuery] string? department = null,
        [FromQuery] string? employeeId = null)
    {
        try
        {
            var employeeIdFromAuth = GetEmployeeIdFromAuth();
            if (employeeIdFromAuth == 0)
                return Unauthorized(new { message = "Invalid authentication token" });
            var employee = await _context.Employees.FindAsync(employeeIdFromAuth);
            if (employee == null)
                return Unauthorized(new { message = "Employee not found" });

            var data = await _reportService.GetComplaintSummaryRangeReport(fromDate, toDate, branch, department, employeeId, employee.TenantId);
            return Ok(new { success = true, data, count = data.Count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}
