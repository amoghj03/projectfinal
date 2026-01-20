
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;
using BankAPI.Models.DTOs;
using BankAPI.Services;

namespace BankAPI.Controllers;

[Route("[controller]")]

public class ProfileController : BaseApiController
{
    private readonly IProfileService _profileService;
    public ProfileController(IProfileService profileService, ApplicationDbContext context) : base(context)
    {
        _profileService = profileService;
    }

    /// <summary>
    /// Get profile details for the authenticated employee
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var employeeId = GetEmployeeIdFromAuth();
            if (employeeId == 0)
            {
                return Unauthorized(new { success = false, message = "Unauthorized access." });
            }
            var profile = await _profileService.GetProfileAsync(employeeId);
            if (profile == null)
                return NotFound(new { success = false, message = "Employee not found." });
            return Ok(new { success = true, data = profile });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = $"An error occurred: {ex.Message}" });
        }
    }

    /// <summary>
    /// Reset password for the authenticated employee
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            var employeeId = GetEmployeeIdFromAuth();
            if (employeeId == 0)
            {
                return Unauthorized(new { success = false, message = "Unauthorized access." });
            }

            var result = await _profileService.ResetPasswordAsync(employeeId, request);
            if (!result.Success)
            {
                if (result.Message == "Employee not found.")
                    return NotFound(result);
                if (result.Message == "Current password is incorrect.")
                    return BadRequest(result);
                return BadRequest(result);
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = $"An error occurred: {ex.Message}" });
        }
    }
}
