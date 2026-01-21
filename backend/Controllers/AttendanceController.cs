using BankAPI.Models.DTOs;
using BankAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Controllers;

[Route("[controller]")]
public class AttendanceController : BaseApiController
{
    private readonly AttendanceService _attendanceService;

    public AttendanceController(AttendanceService attendanceService, ApplicationDbContext context)
            : base(context)
    {
        _attendanceService = attendanceService;
    }

    [HttpGet("current-status")]
    public async Task<IActionResult> GetCurrentAttendanceStatus()
    {
        try
        {
            var employeeId = GetEmployeeIdFromAuth();
            var attendance = await _attendanceService.GetTodayAttendance(employeeId);

            return Ok(new
            {
                success = true,
                data = attendance
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

    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
    {
        try
        {
            var employeeId = GetEmployeeIdFromAuth();
            var attendance = await _attendanceService.CheckIn(employeeId, request);

            return Ok(new
            {
                success = true,
                message = "Checked in successfully",
                data = attendance
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
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

    [HttpPost("check-out")]
    public async Task<IActionResult> CheckOut([FromBody] CheckOutRequest request)
    {
        try
        {
            var employeeId = GetEmployeeIdFromAuth();
            var attendance = await _attendanceService.CheckOut(employeeId, request);

            return Ok(new
            {
                success = true,
                message = "Checked out successfully",
                data = attendance
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
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
    public async Task<IActionResult> GetAttendanceHistory([FromQuery] int days = 30)
    {
        try
        {
            var employeeId = GetEmployeeIdFromAuth();
            var history = await _attendanceService.GetAttendanceHistory(employeeId, days);

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

    [HttpPost("manual-mark")]
    public async Task<IActionResult> ManualMarkAttendance([FromBody] ManualMarkAttendanceRequest request)
    {
        try
        {
            var result = await _attendanceService.ManualMarkAttendance(request.EmployeeId, request.Date, request.Status, request.WorkHours);
            return Ok(new { success = true, message = "Attendance marked successfully", data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}
