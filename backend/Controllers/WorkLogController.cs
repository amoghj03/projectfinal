using BankAPI.Models.DTOs;
using BankAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Controllers;

[Route("[controller]")]
public class WorkLogController : BaseApiController
{
    private readonly WorkLogService _workLogService;

    public WorkLogController(WorkLogService workLogService, ApplicationDbContext context)
            : base(context)
    {
        _workLogService = workLogService;
    }

    [HttpGet("daily-logs")]
    public async Task<IActionResult> GetDailyWorkLogs()
    {
        try
        {
            var employeeId = GetEmployeeIdFromAuth();
            var summary = await _workLogService.GetTodayWorkLogs(employeeId);

            return Ok(new
            {
                success = true,
                data = summary
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

    [HttpPost]
    public async Task<IActionResult> CreateWorkLog([FromBody] CreateWorkLogRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.TaskName))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Task name is required"
                });
            }

            if (request.Hours <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Hours must be greater than 0"
                });
            }

            var employeeId = GetEmployeeIdFromAuth();
            var workLog = await _workLogService.CreateWorkLog(employeeId, request);

            return Ok(new
            {
                success = true,
                message = "Work log created successfully",
                data = workLog
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

    [HttpGet("history")]
    public async Task<IActionResult> GetWorkLogHistory([FromQuery] int days = 30)
    {
        try
        {
            var employeeId = GetEmployeeIdFromAuth();
            var history = await _workLogService.GetWorkLogHistory(employeeId, days);

            return Ok(new
            {
                success = true,
                data = history
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
