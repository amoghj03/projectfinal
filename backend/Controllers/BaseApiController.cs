using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected readonly ApplicationDbContext _context;

    protected BaseApiController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Helper method to extract employee ID from authorization token
    /// In production, this should decode JWT token and extract employee ID from claims
    /// </summary>
    protected long GetEmployeeIdFromAuth()
    {
        try
        {
            // Get token from Authorization header
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return 0;
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();

            // Decode token (simplified - in production use proper JWT validation)
            var tokenBytes = Convert.FromBase64String(token);
            var tokenData = System.Text.Encoding.UTF8.GetString(tokenBytes);
            var parts = tokenData.Split(':');

            if (parts.Length < 2)
            {
                return 0;
            }

            var userId = long.Parse(parts[0]);

            // Get employee ID from user ID
            var employee = _context.Employees.FirstOrDefault(e => e.UserId == userId);
            return employee?.Id ?? 0;
        }
        catch
        {
            return 0;
        }
    }

    /// <summary>
    /// Helper method to extract tenant ID from authorization token
    /// </summary>
    protected long GetTenantIdFromAuth()
    {
        try
        {
            // Get token from Authorization header
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return 0;
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();

            // Decode token (simplified - in production use proper JWT validation)
            var tokenBytes = Convert.FromBase64String(token);
            var tokenData = System.Text.Encoding.UTF8.GetString(tokenBytes);
            var parts = tokenData.Split(':');

            if (parts.Length < 2)
            {
                return 0;
            }

            var userId = long.Parse(parts[0]);

            // Get tenant ID from user
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            return user?.TenantId ?? 0;
        }
        catch
        {
            return 0;
        }
    }
}
