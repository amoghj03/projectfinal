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
            // Calculate subscription expiration date based on input days
            var subscriptionExpiresAt = DateTime.UtcNow.AddDays(request.Tenant.SubscriptionDays);

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
                SubscriptionExpiresAt = subscriptionExpiresAt,
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

    public async Task<List<object>> GetAllTenantsAsync()
    {
        return await _context.Set<Tenant>()
            .Where(t => t.IsActive)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Slug,
                t.ContactEmail,
                t.ContactPhone,
                t.City,
                t.State,
                t.Country,
                t.SubscriptionPlan,
                t.SubscriptionStatus,
                t.MaxEmployees,
                t.MaxBranches,
                t.IsActive,
                t.OnboardedAt
            })
            .ToListAsync<object>();
    }

    public async Task<List<Permission>> GetAllPermissionsAsync()
    {
        return await _context.Set<Permission>()
            .OrderBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<Branch> AddBranchToTenantAsync(long tenantId, BranchDto branchData)
    {
        // Validate tenant exists
        var tenant = await _context.Set<Tenant>()
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive);

        if (tenant == null)
        {
            throw new ArgumentException($"Tenant with ID {tenantId} not found or inactive");
        }

        // Check if branch code is unique within tenant (if provided)
        if (!string.IsNullOrEmpty(branchData.Code))
        {
            var existingBranch = await _context.Set<Branch>()
                .FirstOrDefaultAsync(b => b.TenantId == tenantId &&
                                         b.Code.ToUpper() == branchData.Code.ToUpper() &&
                                         b.IsActive);

            if (existingBranch != null)
            {
                throw new ArgumentException($"Branch with code '{branchData.Code}' already exists for this tenant");
            }
        }

        // Create the branch
        var branch = new Branch
        {
            TenantId = tenantId,
            Name = branchData.Name,
            Code = string.IsNullOrEmpty(branchData.Code) ? GenerateBranchCode(tenant.Slug) : branchData.Code,
            Address = branchData.Address,
            City = branchData.City,
            State = branchData.State,
            Country = branchData.Country,
            Phone = branchData.Phone,
            Email = branchData.Email,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Set<Branch>().Add(branch);
        await _context.SaveChangesAsync();

        // Return branch data without circular references
        return new Branch
        {
            Id = branch.Id,
            TenantId = branch.TenantId,
            Name = branch.Name,
            Code = branch.Code,
            Address = branch.Address,
            City = branch.City,
            State = branch.State,
            Country = branch.Country,
            Phone = branch.Phone,
            Email = branch.Email,
            IsActive = branch.IsActive,
            CreatedAt = branch.CreatedAt,
            UpdatedAt = branch.UpdatedAt
        };
    }

    public async Task<EmployeeDto> AddEmployeeToTenantAsync(long tenantId, TenantEmployeeCreateDto employeeData)
    {
        var tenant = await _context.Set<Tenant>()
            .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive);

        if (tenant == null)
        {
            throw new ArgumentException($"Tenant with ID {tenantId} not found or inactive");
        }

        var branch = await _context.Set<Branch>()
            .FirstOrDefaultAsync(b => b.Id == employeeData.BranchId && b.TenantId == tenantId && b.IsActive);

        if (branch == null)
        {
            throw new ArgumentException("Branch not found for the selected tenant");
        }

        var totalEmployees = await _context.Set<Employee>()
            .CountAsync(e => e.TenantId == tenantId);

        var employeeId = string.IsNullOrWhiteSpace(employeeData.EmployeeId)
            ? GenerateEmployeeId(tenant.Slug, totalEmployees + 1)
            : employeeData.EmployeeId;

        // Check if a user with the given email already exists
        var user = await _context.Set<User>()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == employeeData.Email.ToLower() && u.TenantId == tenantId);

        if (user == null)
        {
            // Create a new user for the employee
            user = new User
            {
                TenantId = tenantId,
                Email = employeeData.Email,
                PasswordHash = "changeme", // Set a default or random password, or require reset
                Role = "employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Set<User>().Add(user);
            await _context.SaveChangesAsync();
        }

        var employee = new Employee
        {
            TenantId = tenantId,
            UserId = user.Id,
            EmployeeId = employeeId,
            FullName = employeeData.FullName,
            Email = employeeData.Email,
            Phone = employeeData.Phone,
            Gender = employeeData.Gender,
            DateOfBirth = employeeData.DateOfBirth,
            Department = employeeData.Department,
            JobRole = employeeData.JobRole ?? "Employee",
            Status = string.IsNullOrWhiteSpace(employeeData.Status) ? "Active" : employeeData.Status,
            JoinDate = employeeData.JoinDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            Salary = employeeData.Salary,
            BranchId = branch.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        if (employeeData.Roles != null && employeeData.Roles.Count > 0)
        {
            var roles = await _context.Roles
                .Where(r => r.TenantId == tenantId && employeeData.Roles.Contains(r.Name))
                .ToListAsync();

            foreach (var role in roles)
            {
                _context.EmployeeRoles.Add(new EmployeeRole
                {
                    EmployeeId = employee.Id,
                    RoleId = role.Id,
                    AssignedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
        }

        return new EmployeeDto
        {
            Id = employee.Id,
            EmployeeId = employee.EmployeeId,
            FullName = employee.FullName,
            Email = employee.Email,
            Phone = employee.Phone,
            Gender = employee.Gender,
            DateOfBirth = employee.DateOfBirth,
            Department = employee.Department,
            JobRole = employee.JobRole,
            Status = employee.Status,
            JoinDate = employee.JoinDate,
            Salary = employee.Salary,
            BranchName = branch.Name,
            Roles = employeeData.Roles ?? new List<string>()
        };
    }

    private string GenerateBranchCode(string tenantSlug)
    {
        var prefix = tenantSlug.ToUpper().Replace("-", "").Substring(0, Math.Min(3, tenantSlug.Length));
        var random = new Random().Next(100, 999);
        return $"{prefix}-BR{random}";
    }

    private string GenerateEmployeeId(string tenantSlug, int sequence)
    {
        var cleanSlug = tenantSlug.ToUpper().Replace("-", "");
        var prefix = cleanSlug.Length >= 2 ? cleanSlug.Substring(0, 2) : cleanSlug;
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

    /// <summary>
    /// Get tenant by ID with all details
    /// </summary>
    public async Task<object?> GetTenantByIdAsync(long tenantId)
    {
        var tenant = await _context.Set<Tenant>()
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null)
            return null;

        // Get branches separately without the tenant reference
        var branches = await _context.Set<Branch>()
            .Where(b => b.TenantId == tenantId)
            .AsNoTracking()
            .Select(b => new
            {
                b.Id,
                b.TenantId,
                b.Name,
                b.Code,
                b.Address,
                b.City,
                b.State,
                b.Country,
                b.Phone,
                b.Email,
                b.IsActive,
                b.CreatedAt,
                b.UpdatedAt
            })
            .ToListAsync();

        // Return anonymous object with tenant data and branches without circular reference
        return new
        {
            tenant.Id,
            tenant.Name,
            tenant.Slug,
            tenant.Domain,
            tenant.Subdomain,
            tenant.LogoUrl,
            tenant.ContactEmail,
            tenant.ContactPhone,
            tenant.Address,
            tenant.City,
            tenant.State,
            tenant.Country,
            tenant.Timezone,
            tenant.Currency,
            tenant.Settings,
            tenant.SubscriptionPlan,
            tenant.SubscriptionStatus,
            tenant.SubscriptionExpiresAt,
            tenant.MaxEmployees,
            tenant.MaxBranches,
            tenant.IsActive,
            tenant.OnboardedAt,
            tenant.CreatedAt,
            tenant.UpdatedAt,
            Branches = branches,
            Users = new List<object>()
        };
    }

    /// <summary>
    /// Renew tenant subscription or update limits
    /// </summary>
    public async Task<TenantOnboardingResponseDto> RenewTenantSubscriptionAsync(long tenantId, TenantRenewalDto request)
    {
        var response = new TenantOnboardingResponseDto();

        try
        {
            var tenant = await _context.Set<Tenant>()
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                response.Success = false;
                response.Message = "Tenant not found";
                return response;
            }

            var utcNow = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);

            var updateBuilder = _context.Set<Tenant>()
                .Where(t => t.Id == tenantId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(t => t.MaxEmployees, request.MaxEmployees)
                    .SetProperty(t => t.MaxBranches, request.MaxBranches)
                    .SetProperty(t => t.UpdatedAt, utcNow)
                );

            string message = "";

            // Only extend subscription if subscriptionDays > 0
            if (request.SubscriptionDays > 0)
            {
                var currentExpiration = tenant.SubscriptionExpiresAt ?? DateTime.UtcNow;
                var newExpirationDate = currentExpiration.AddDays(request.SubscriptionDays);

                // Ensure the new expiration date is UTC
                if (newExpirationDate.Kind != DateTimeKind.Utc)
                {
                    newExpirationDate = DateTime.SpecifyKind(newExpirationDate, DateTimeKind.Utc);
                }

                // Update subscription details as well
                updateBuilder = _context.Set<Tenant>()
                    .Where(t => t.Id == tenantId)
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(t => t.MaxEmployees, request.MaxEmployees)
                        .SetProperty(t => t.MaxBranches, request.MaxBranches)
                        .SetProperty(t => t.SubscriptionPlan, request.SubscriptionPlan ?? tenant.SubscriptionPlan)
                        .SetProperty(t => t.SubscriptionStatus, "active")
                        .SetProperty(t => t.SubscriptionExpiresAt, newExpirationDate)
                        .SetProperty(t => t.UpdatedAt, utcNow)
                    );

                message = $"Subscription renewed until {newExpirationDate:yyyy-MM-dd}. ";
            }

            await updateBuilder;

            message += $"Max employees updated to {request.MaxEmployees}, max branches updated to {request.MaxBranches}.";

            response.Success = true;
            response.TenantId = tenantId;
            response.Message = message;

            return response;
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = "An error occurred while updating tenant";
            var errorMessage = ex.Message;

            // Get inner exception details if available
            if (ex.InnerException != null)
            {
                errorMessage += " - " + ex.InnerException.Message;
            }

            response.Errors = new List<string> { errorMessage };
            return response;
        }
    }
}
