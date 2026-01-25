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

            // Check if tenant is active
            if (user.Tenant != null && !user.Tenant.IsActive)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Your tenant account has been deactivated. Please contact support."
                };
            }

            // Check if tenant subscription has expired or is not set
            if (user.Tenant != null && (!user.Tenant.SubscriptionExpiresAt.HasValue || DateTime.UtcNow > user.Tenant.SubscriptionExpiresAt.Value))
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Your subscription has expired or is not active. Please renew your subscription to continue."
                };
            }

            // Decode base64 password from frontend
            string decodedPassword;
            try
            {
                var base64EncodedBytes = System.Convert.FromBase64String(request.Password);
                decodedPassword = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
            }
            catch
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Invalid password encoding."
                };
            }

            // In production, use proper password hashing (BCrypt, etc.)
            // For now, we'll do a simple check (matching the init_db.sql pattern)
            // Note: In init_db.sql, passwords are stored as '$2a$11$hashed_password_here'
            // For demo purposes, we'll accept 'password123' for all users
            if (user.PasswordHash != decodedPassword)
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

            if (roles.Any(r => r.Name == "SuperAdmin"))
            {
                adminRole = "superadmin";
            }
            else if (roles.Any(r => r.Name == "Admin"))
            {
                adminRole = "admin";
            }

            // Get all permissions from user's roles
            var allPermissions = roles
                .SelectMany(r => r.RolePermissions)
                .Select(rp => rp.Permission)
                .Distinct()
                .ToList();

            // Build permissions dictionary for admin
            var adminPermissions = new Dictionary<string, bool>();
            if (hasAdminAccess)
            {
                // Map permissions to frontend permission keys
                adminPermissions["dashboard"] = allPermissions.Any(p => p.Name.Contains("dashboard"));
                adminPermissions["employeeManagement"] = allPermissions.Any(p => p.Name.Contains("employee.manage"));
                adminPermissions["roleManagement"] = allPermissions.Any(p => p.Name == "role.manage");
                adminPermissions["attendance"] = allPermissions.Any(p => p.Name.Contains("attendance"));
                adminPermissions["leaveManagement"] = allPermissions.Any(p => p.Name.Contains("leave.approve"));
                adminPermissions["skillReports"] = allPermissions.Any(p => p.Name == "skill.report.view");
                adminPermissions["complaints"] = allPermissions.Any(p => p.Name.Contains("complaint"));
                adminPermissions["techIssues"] = allPermissions.Any(p => p.Name.Contains("tech") || p.Name.Contains("issue"));
                adminPermissions["reports"] = allPermissions.Any(p => p.Name == "report.download");
                adminPermissions["payslip"] = allPermissions.Any(p => p.Name.Contains("payslip") || p.Name == "payslip.generate");
                adminPermissions["tenantOnboarding"] = allPermissions.Any(p => p.Name == "tenantOnboarding");
                adminPermissions["tenantSettings"] = allPermissions.Any(p => p.Name == "tenant.settings");
            }

            // Build permissions dictionary for employee
            var employeePermissions = new Dictionary<string, bool>
            {
                ["dashboard"] = allPermissions.Any(p => p.Name == "dashboard.view"),
                ["attendance"] = allPermissions.Any(p => p.Name == "employee.view"),
                ["leaveRequest"] = allPermissions.Any(p => p.Name == "leave.request"),
                ["skillManagement"] = allPermissions.Any(p => p.Name == "skill.manage"),
                ["complaints"] = allPermissions.Any(p => p.Name == "complaint.create"),
                ["techIssues"] = allPermissions.Any(p => p.Name == "techissue.create")
            };

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
                    AdminPermissions = hasAdminAccess ? adminPermissions : null,
                    EmployeePermissions = employeePermissions,
                    TenantId = user.TenantId,
                    TenantName = user.Tenant?.Name ?? "Organization"
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
