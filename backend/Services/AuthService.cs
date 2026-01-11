using Microsoft.EntityFrameworkCore;
using BankAPI.Data;
using BankAPI.Models.DTOs;

namespace BankAPI.Services;

public interface IAuthService
{
    Task<LoginResponse> AuthenticateAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse> AuthenticateAsync(LoginRequest request)
    {
        try
        {
            // Find user by email
            var user = await _context.Users
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.IsActive);

            if (user == null)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Invalid credentials. Please check your email and password."
                };
            }

            // In production, use proper password hashing (BCrypt, etc.)
            // For now, we'll do a simple check (matching the init_db.sql pattern)
            // Note: In init_db.sql, passwords are stored as '$2a$11$hashed_password_here'
            // For demo purposes, we'll accept 'password123' for all users
            if (user.PasswordHash != request.Password)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Invalid credentials. Please check your email and password."
                };
            }

            // Get employee details
            var employee = await _context.Employees
                .Include(e => e.Branch)
                .Include(e => e.EmployeeRoles)
                    .ThenInclude(er => er.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(e => e.UserId == user.Id);

            if (employee == null)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Employee record not found."
                };
            }

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Determine admin access and roles
            var roles = employee.EmployeeRoles.Select(er => er.Role).ToList();
            var hasAdminAccess = roles.Any(r => r.Name == "Admin" || r.Name == "SuperAdmin");
            string? adminRole = null;

            if (roles.Any(r => r.Name == "Admin" || r.Name == "SuperAdmin"))
            {
                // Check if super admin (CEO) or regular admin
                adminRole = employee.JobRole?.ToLower().Contains("ceo") == true ? "superadmin" : "admin";
            }
            else if (roles.Any(r => r.Name == "HR"))
            {
                adminRole = "admin";
            }

            // Build permissions dictionary
            var permissions = new Dictionary<string, bool>();
            if (hasAdminAccess)
            {
                var allPermissions = roles
                    .SelectMany(r => r.RolePermissions)
                    .Select(rp => rp.Permission)
                    .Distinct()
                    .ToList();

                // Map permissions to frontend permission keys
                permissions["dashboard"] = allPermissions.Any(p => p.Name.Contains("dashboard"));
                permissions["employeeManagement"] = allPermissions.Any(p => p.Name.Contains("employee.manage"));
                permissions["attendance"] = allPermissions.Any(p => p.Name.Contains("attendance"));
                permissions["leaveManagement"] = allPermissions.Any(p => p.Name.Contains("leave.approve"));
                permissions["skillReports"] = allPermissions.Any(p => p.Name.Contains("skill") || p.Name.Contains("report"));
                permissions["complaints"] = allPermissions.Any(p => p.Name.Contains("complaint"));
                permissions["techIssues"] = allPermissions.Any(p => p.Name.Contains("tech") || p.Name.Contains("issue"));
                permissions["reports"] = allPermissions.Any(p => p.Name.Contains("report"));
                permissions["payslip"] = allPermissions.Any(p => p.Name.Contains("payslip") || p.Name.Contains("payroll"));

                // Super admin gets all permissions
                if (adminRole == "superadmin")
                {
                    permissions = permissions.ToDictionary(k => k.Key, v => true);
                }
            }

            // Generate JWT token (simplified - in production use proper JWT)
            var token = GenerateToken(user.Id, user.Email);

            return new LoginResponse
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = new UserData
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = employee.FullName,
                    EmployeeId = employee.EmployeeId,
                    Department = employee.Department,
                    Branch = employee.Branch?.Name ?? "No Branch",
                    Role = roles.FirstOrDefault()?.Name ?? "Employee",
                    HasAdminAccess = hasAdminAccess,
                    AdminRole = adminRole,
                    AdminPermissions = hasAdminAccess ? permissions : null,
                    TenantId = user.TenantId
                }
            };
        }
        catch (Exception ex)
        {
            return new LoginResponse
            {
                Success = false,
                Message = $"An error occurred during login: {ex.Message}"
            };
        }
    }

    private string GenerateToken(long userId, string email)
    {
        // Simplified token generation
        // In production, use proper JWT with Microsoft.IdentityModel.Tokens
        var tokenData = $"{userId}:{email}:{DateTime.UtcNow:O}";
        var tokenBytes = System.Text.Encoding.UTF8.GetBytes(tokenData);
        return Convert.ToBase64String(tokenBytes);
    }
}
