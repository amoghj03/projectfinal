using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace BankAPI.Services.Admin;

public class AdminTenantService
{
    private readonly ApplicationDbContext _context;

    public AdminTenantService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TenantOnboardingResponseDto> OnboardTenantAsync(TenantOnboardingDto request, long superAdminEmployeeId)
    {
        var response = new TenantOnboardingResponseDto();
        var errors = new List<string>();

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Step 1: Validate tenant slug uniqueness
            var existingTenant = await _context.Set<Tenant>()
                .FirstOrDefaultAsync(t => t.Slug.ToLower() == request.Tenant.Slug.ToLower());

            if (existingTenant != null)
            {
                errors.Add($"Tenant with slug '{request.Tenant.Slug}' already exists");
            }

            // Step 2: Validate branch codes uniqueness
            var branchCodes = request.Branches.Where(b => !string.IsNullOrEmpty(b.Code)).Select(b => b.Code!.ToUpper()).ToList();
            if (branchCodes.Count != branchCodes.Distinct().Count())
            {
                errors.Add("Branch codes must be unique within the tenant");
            }

            // Step 3: Validate email uniqueness
            var existingUser = await _context.Set<User>()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.AdminUser.Email.ToLower());

            if (existingUser != null)
            {
                errors.Add($"User with email '{request.AdminUser.Email}' already exists");
            }

            if (errors.Any())
            {
                response.Success = false;
                response.Errors = errors;
                response.Message = "Validation failed";
                return response;
            }

            // Step 4: Create Tenant
            var tenant = new Tenant
            {
                Name = request.Tenant.Name,
                Slug = request.Tenant.Slug.ToLower(),
                Domain = request.Tenant.Domain,
                Subdomain = string.IsNullOrEmpty(request.Tenant.Subdomain)
                    ? request.Tenant.Slug.ToLower()
                    : request.Tenant.Subdomain,
                LogoUrl = request.Tenant.LogoUrl,
                ContactEmail = request.Tenant.ContactEmail,
                ContactPhone = request.Tenant.ContactPhone,
                Address = request.Tenant.Address,
                City = request.Tenant.City,
                State = request.Tenant.State,
                Country = request.Tenant.Country,
                Timezone = request.Tenant.Timezone,
                Currency = request.Tenant.Currency,
                SubscriptionPlan = request.Tenant.SubscriptionPlan,
                SubscriptionStatus = request.Tenant.SubscriptionStatus,
                SubscriptionExpiresAt = request.Tenant.SubscriptionExpiresAt,
                MaxEmployees = request.Tenant.MaxEmployees,
                MaxBranches = request.Tenant.MaxBranches,
                IsActive = true,
                OnboardedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Set<Tenant>().Add(tenant);
            await _context.SaveChangesAsync();

            // Step 5: Create Branches
            var branches = new List<Branch>();
            int branchCounter = 1;

            foreach (var branchDto in request.Branches)
            {
                var branch = new Branch
                {
                    TenantId = tenant.Id,
                    Name = branchDto.Name,
                    Code = string.IsNullOrEmpty(branchDto.Code)
                        ? $"BR{branchCounter:D3}"
                        : branchDto.Code.ToUpper(),
                    Address = branchDto.Address,
                    City = branchDto.City,
                    State = branchDto.State,
                    Country = branchDto.Country,
                    Phone = branchDto.Phone,
                    Email = branchDto.Email,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                branches.Add(branch);
                branchCounter++;
            }

            _context.Set<Branch>().AddRange(branches);
            await _context.SaveChangesAsync();

            // Determine which branch the admin should be assigned to
            var adminBranchIndex = (int)request.AdminUser.BranchId;
            if (adminBranchIndex < 0 || adminBranchIndex >= branches.Count)
            {
                adminBranchIndex = 0; // Default to first branch
            }
            var adminBranch = branches[adminBranchIndex];

            // Step 6: Create Admin User
            // Note: In production, use proper password hashing (BCrypt, etc.)
            // For now, storing password directly for simplicity
            var hashedPassword = request.AdminUser.Password;

            var adminUser = new User
            {
                TenantId = tenant.Id,
                Email = request.AdminUser.Email,
                PasswordHash = hashedPassword,
                Role = "superadmin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Set<User>().Add(adminUser);
            await _context.SaveChangesAsync();

            // Step 7: Create Employee record for Admin User
            var employeeId = GenerateEmployeeId(tenant.Slug, 1);

            var adminEmployee = new Employee
            {
                TenantId = tenant.Id,
                UserId = adminUser.Id,
                EmployeeId = employeeId,
                FullName = request.AdminUser.FullName,
                Email = request.AdminUser.Email,
                Phone = request.AdminUser.Phone,
                Gender = request.AdminUser.Gender,
                DateOfBirth = request.AdminUser.DateOfBirth,
                Department = request.AdminUser.Department,
                JobRole = request.AdminUser.JobRole,
                Salary = request.AdminUser.Salary,
                BranchId = adminBranch.Id,
                JoinDate = DateOnly.FromDateTime(DateTime.UtcNow),
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Set<Employee>().Add(adminEmployee);
            await _context.SaveChangesAsync();

            // Step 8: Create Roles
            var createdRoles = new List<Role>();

            // If no roles provided, create default roles
            if (!request.Roles.Any())
            {
                request.Roles = GetDefaultRoles();
            }

            foreach (var roleDto in request.Roles)
            {
                var role = new Role
                {
                    TenantId = tenant.Id,
                    Name = roleDto.Name,
                    Description = roleDto.Description,
                    IsSystem = roleDto.IsSystem,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Set<Role>().Add(role);
                await _context.SaveChangesAsync();

                // Assign permissions to role
                if (roleDto.PermissionIds.Any())
                {
                    var rolePermissions = roleDto.PermissionIds.Select(permId => new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permId,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();

                    _context.Set<RolePermission>().AddRange(rolePermissions);
                    await _context.SaveChangesAsync();
                }

                createdRoles.Add(role);
            }

            // Step 9: Assign SuperAdmin role to the admin employee
            var adminRole = createdRoles.FirstOrDefault(r => r.Name.ToLower() == "superadmin");
            if (adminRole != null)
            {
                var employeeRole = new EmployeeRole
                {
                    EmployeeId = adminEmployee.Id,
                    RoleId = adminRole.Id,
                    AssignedBy = adminEmployee.Id,
                    AssignedAt = DateTime.UtcNow
                };

                _context.Set<EmployeeRole>().Add(employeeRole);
                await _context.SaveChangesAsync();
            }

            // Step 10: Create Leave Types
            if (!request.LeaveTypes.Any())
            {
                request.LeaveTypes = GetDefaultLeaveTypes();
            }

            var leaveTypes = request.LeaveTypes.Select(ltDto => new LeaveType
            {
                TenantId = tenant.Id,
                Name = ltDto.Name,
                Description = ltDto.Description,
                MaxDaysPerYear = ltDto.MaxDaysPerYear,
                RequiresApproval = ltDto.RequiresApproval,
                IsPaid = ltDto.IsPaid,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.Set<LeaveType>().AddRange(leaveTypes);
            await _context.SaveChangesAsync();

            // Step 11: Initialize Leave Balances for Admin Employee
            var currentYear = DateTime.UtcNow.Year;
            var leaveBalances = leaveTypes.Select(lt => new LeaveBalance
            {
                TenantId = tenant.Id,
                EmployeeId = adminEmployee.Id,
                LeaveTypeId = lt.Id,
                Year = currentYear,
                TotalAllocated = (decimal)(lt.MaxDaysPerYear ?? 0),
                Used = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }).ToList();

            _context.Set<LeaveBalance>().AddRange(leaveBalances);
            await _context.SaveChangesAsync();

            // Step 12: Create Settings
            if (request.Settings.Any())
            {
                var settings = request.Settings.Select(kvp => new Setting
                {
                    TenantId = tenant.Id,
                    Key = kvp.Key,
                    Value = kvp.Value,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();

                _context.Set<Setting>().AddRange(settings);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Create default settings
                var defaultSettings = new List<Setting>
                {
                    new Setting { TenantId = tenant.Id, Key = "RequireComplaintApproval", Value = "true", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Setting { TenantId = tenant.Id, Key = "TechIssueApproval", Value = "true", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
                };

                _context.Set<Setting>().AddRange(defaultSettings);
                await _context.SaveChangesAsync();
            }

            // Step 13: Create Audit Log
            var auditLog = new AuditLog
            {
                TenantId = tenant.Id,
                EmployeeId = superAdminEmployeeId,
                Action = "TENANT_ONBOARDED",
                EntityType = "Tenant",
                EntityId = tenant.Id,
                Changes = $"{{\"message\": \"Tenant '{tenant.Name}' onboarded with {branches.Count} branches, admin user '{adminUser.Email}', {createdRoles.Count} roles, and {leaveTypes.Count} leave types\"}}",
                IpAddress = "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<AuditLog>().Add(auditLog);
            await _context.SaveChangesAsync();

            // Commit transaction
            await transaction.CommitAsync();

            response.Success = true;
            response.TenantId = tenant.Id;
            response.AdminEmployeeId = adminEmployee.Id;
            response.AdminEmail = adminUser.Email;
            response.Message = $"Tenant '{tenant.Name}' onboarded successfully";

            return response;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            response.Success = false;
            response.Message = "An error occurred during tenant onboarding";
            response.Errors.Add(ex.Message);
            return response;
        }
    }

    public async Task<bool> IsSlugAvailableAsync(string slug)
    {
        var exists = await _context.Set<Tenant>()
            .AnyAsync(t => t.Slug.ToLower() == slug.ToLower());

        return !exists;
    }

    public async Task<List<Tenant>> GetAllTenantsAsync()
    {
        return await _context.Set<Tenant>()
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Permission>> GetAllPermissionsAsync()
    {
        return await _context.Set<Permission>()
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    private string GenerateEmployeeId(string tenantSlug, int sequence)
    {
        var prefix = tenantSlug.ToUpper().Replace("-", "").Substring(0, Math.Min(4, tenantSlug.Length));
        return $"EMP-{prefix}-{sequence:D3}";
    }

    private List<RoleSetupDto> GetDefaultRoles()
    {
        return new List<RoleSetupDto>
        {
            new RoleSetupDto
            {
                Name = "Admin",
                Description = "Full system administrator access",
                IsSystem = true,
                PermissionIds = new List<long>() // All permissions
            },
            new RoleSetupDto
            {
                Name = "Manager",
                Description = "Department manager with approval rights",
                IsSystem = true,
                PermissionIds = new List<long>()
            },
            new RoleSetupDto
            {
                Name = "Employee",
                Description = "Regular employee with basic access",
                IsSystem = true,
                PermissionIds = new List<long>()
            }
        };
    }

    private List<LeaveTypeSetupDto> GetDefaultLeaveTypes()
    {
        return new List<LeaveTypeSetupDto>
        {
            new LeaveTypeSetupDto
            {
                Name = "Sick Leave",
                Description = "Medical leave for illness or injury",
                MaxDaysPerYear = 10,
                RequiresApproval = true,
                IsPaid = true
            },
            new LeaveTypeSetupDto
            {
                Name = "Casual Leave",
                Description = "Casual or personal leave",
                MaxDaysPerYear = 12,
                RequiresApproval = true,
                IsPaid = true
            },
            new LeaveTypeSetupDto
            {
                Name = "Annual Leave",
                Description = "Annual vacation leave",
                MaxDaysPerYear = 15,
                RequiresApproval = true,
                IsPaid = true
            },
            new LeaveTypeSetupDto
            {
                Name = "Unpaid Leave",
                Description = "Leave without pay",
                MaxDaysPerYear = 30,
                RequiresApproval = true,
                IsPaid = false
            }
        };
    }
}
