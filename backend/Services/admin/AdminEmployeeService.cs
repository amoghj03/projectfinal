using BankAPI.Data;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services.Admin
{
    public class AdminEmployeeService
    {
        private readonly ApplicationDbContext _context;

        public AdminEmployeeService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get list of employees with optional branch filtering
        /// </summary>
        /// <param name="employeeId">Admin employee ID</param>
        /// <param name="branch">Optional branch filter</param>
        /// <returns>List of employees with their details</returns>
        public async Task<EmployeeListResponseDto> GetEmployeesAsync(long employeeId, string? branch = null)
        {
            // Get tenant ID from employee
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            var tenantId = employee.TenantId;

            // Build query for employees
            var employeesQuery = _context.Employees
                .Where(e => e.TenantId == tenantId)
                .Include(e => e.Branch)
                .Include(e => e.EmployeeRoles)
                    .ThenInclude(er => er.Role)
                .AsQueryable();

            // Apply branch filter if provided
            if (!string.IsNullOrEmpty(branch))
            {
                var branchEntity = await _context.Branches
                    .FirstOrDefaultAsync(b => b.TenantId == tenantId && b.Name == branch);

                if (branchEntity != null)
                {
                    employeesQuery = employeesQuery.Where(e => e.BranchId == branchEntity.Id);
                }
            }

            // Get employees with their details
            var employees = await employeesQuery
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            // Map to DTOs
            var employeeDtos = employees.Select(e => new EmployeeDto
            {
                Id = e.Id,
                EmployeeId = e.EmployeeId,
                FullName = e.FullName,
                Email = e.Email,
                Phone = e.Phone,
                Gender = e.Gender,
                DateOfBirth = e.DateOfBirth,
                PhotoUrl = e.PhotoUrl,
                Department = e.Department,
                JobRole = e.JobRole,
                Status = e.Status,
                JoinDate = e.JoinDate,
                Salary = e.Salary,
                Address = e.Address,
                EmergencyContact = e.EmergencyContact,
                BranchName = e.Branch?.Name,
                Roles = e.EmployeeRoles.Select(er => er.Role.Name).ToList()
            }).ToList();

            return new EmployeeListResponseDto
            {
                Employees = employeeDtos,
                TotalCount = employeeDtos.Count,
                Branch = branch
            };
        }

        /// <summary>
        /// Get a single employee by ID
        /// </summary>
        /// <param name="adminEmployeeId">Admin employee ID</param>
        /// <param name="targetEmployeeId">Target employee ID to retrieve</param>
        /// <returns>Employee details</returns>
        public async Task<EmployeeDto?> GetEmployeeByIdAsync(long adminEmployeeId, long targetEmployeeId)
        {
            // Get tenant ID from admin employee
            var adminEmployee = await _context.Employees.FindAsync(adminEmployeeId);
            if (adminEmployee == null)
            {
                throw new Exception("Admin employee not found");
            }

            var tenantId = adminEmployee.TenantId;

            // Get target employee
            var employee = await _context.Employees
                .Where(e => e.TenantId == tenantId && e.Id == targetEmployeeId)
                .Include(e => e.Branch)
                .Include(e => e.EmployeeRoles)
                    .ThenInclude(er => er.Role)
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return null;
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
                PhotoUrl = employee.PhotoUrl,
                Department = employee.Department,
                JobRole = employee.JobRole,
                Status = employee.Status,
                JoinDate = employee.JoinDate,
                Salary = employee.Salary,
                Address = employee.Address,
                EmergencyContact = employee.EmergencyContact,
                BranchName = employee.Branch?.Name,
                Roles = employee.EmployeeRoles.Select(er => er.Role.Name).ToList()
            };
        }

        /// <summary>
        /// Create a new employee
        /// </summary>
        /// <param name="adminEmployeeId">Admin employee ID</param>
        /// <param name="employeeDto">Employee data</param>
        /// <returns>Created employee</returns>
        public async Task<EmployeeDto> CreateEmployeeAsync(long adminEmployeeId, EmployeeDto employeeDto)
        {
            // Get tenant ID from admin employee
            var adminEmployee = await _context.Employees.FindAsync(adminEmployeeId);
            if (adminEmployee == null)
            {
                throw new Exception("Admin employee not found");
            }

            var tenantId = adminEmployee.TenantId;

            // Validate employee ID is unique
            var existingEmployee = await _context.Employees
                .AnyAsync(e => e.TenantId == tenantId && e.EmployeeId == employeeDto.EmployeeId);

            if (existingEmployee)
            {
                throw new ArgumentException("Employee ID already exists");
            }

            // Get branch
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.TenantId == tenantId && b.Name == employeeDto.BranchName);

            if (branch == null)
            {
                throw new ArgumentException("Branch not found");
            }

            // Create new employee
            var employee = new Models.Employee
            {
                TenantId = tenantId,
                EmployeeId = employeeDto.EmployeeId,
                FullName = employeeDto.FullName,
                Email = employeeDto.Email,
                Phone = employeeDto.Phone,
                Gender = employeeDto.Gender,
                DateOfBirth = employeeDto.DateOfBirth,
                PhotoUrl = employeeDto.PhotoUrl,
                Department = employeeDto.Department,
                JobRole = employeeDto.JobRole ?? "Employee",
                Status = employeeDto.Status,
                JoinDate = employeeDto.JoinDate,
                Salary = employeeDto.Salary,
                Address = employeeDto.Address,
                EmergencyContact = employeeDto.EmergencyContact,
                BranchId = branch.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            // Assign roles if provided
            if (employeeDto.Roles != null && employeeDto.Roles.Count > 0)
            {
                var roles = await _context.Roles
                    .Where(r => r.TenantId == tenantId && employeeDto.Roles.Contains(r.Name))
                    .ToListAsync();

                foreach (var role in roles)
                {
                    _context.EmployeeRoles.Add(new Models.EmployeeRole
                    {
                        EmployeeId = employee.Id,
                        RoleId = role.Id,
                        AssignedAt = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
            }

            // Return created employee
            return await GetEmployeeByIdAsync(adminEmployeeId, employee.Id)
                ?? throw new Exception("Failed to retrieve created employee");
        }

        /// <summary>
        /// Update an existing employee
        /// </summary>
        /// <param name="adminEmployeeId">Admin employee ID</param>
        /// <param name="targetEmployeeId">Target employee ID to update</param>
        /// <param name="employeeDto">Updated employee data</param>
        /// <returns>Updated employee</returns>
        public async Task<EmployeeDto?> UpdateEmployeeAsync(long adminEmployeeId, long targetEmployeeId, EmployeeDto employeeDto)
        {
            // Get tenant ID from admin employee
            var adminEmployee = await _context.Employees.FindAsync(adminEmployeeId);
            if (adminEmployee == null)
            {
                throw new Exception("Admin employee not found");
            }

            var tenantId = adminEmployee.TenantId;

            // Get target employee
            var employee = await _context.Employees
                .Where(e => e.TenantId == tenantId && e.Id == targetEmployeeId)
                .Include(e => e.EmployeeRoles)
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return null;
            }

            // Get branch
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.TenantId == tenantId && b.Name == employeeDto.BranchName);

            if (branch == null)
            {
                throw new ArgumentException("Branch not found");
            }

            // Update employee details
            employee.FullName = employeeDto.FullName;
            employee.Email = employeeDto.Email;
            employee.Phone = employeeDto.Phone;
            employee.Gender = employeeDto.Gender;
            employee.DateOfBirth = employeeDto.DateOfBirth;
            employee.PhotoUrl = employeeDto.PhotoUrl;
            employee.Department = employeeDto.Department;
            employee.JobRole = employeeDto.JobRole ?? "Employee";
            employee.Status = employeeDto.Status;
            employee.JoinDate = employeeDto.JoinDate;
            employee.Salary = employeeDto.Salary;
            employee.Address = employeeDto.Address;
            employee.EmergencyContact = employeeDto.EmergencyContact;
            employee.BranchId = branch.Id;
            employee.UpdatedAt = DateTime.UtcNow;

            // Update roles if provided
            if (employeeDto.Roles != null)
            {
                // Remove existing roles
                _context.EmployeeRoles.RemoveRange(employee.EmployeeRoles);

                // Add new roles
                var roles = await _context.Roles
                    .Where(r => r.TenantId == tenantId && employeeDto.Roles.Contains(r.Name))
                    .ToListAsync();

                foreach (var role in roles)
                {
                    _context.EmployeeRoles.Add(new Models.EmployeeRole
                    {
                        EmployeeId = employee.Id,
                        RoleId = role.Id,
                        AssignedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();

            // Return updated employee
            return await GetEmployeeByIdAsync(adminEmployeeId, employee.Id);
        }

        /// <summary>
        /// Get available roles for assignment
        /// </summary>
        /// <param name="adminEmployeeId">Admin employee ID</param>
        /// <returns>List of available roles</returns>
        public async Task<List<object>> GetAvailableRolesAsync(long adminEmployeeId)
        {
            // Get tenant ID from admin employee
            var adminEmployee = await _context.Employees.FindAsync(adminEmployeeId);
            if (adminEmployee == null)
            {
                throw new Exception("Admin employee not found");
            }

            var tenantId = adminEmployee.TenantId;

            // Get all roles with permissions
            var roles = await _context.Roles
                .Where(r => r.TenantId == tenantId)
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .ToListAsync();

            return roles.Select(r => new
            {
                id = r.Id,
                name = r.Name,
                description = r.Description ?? $"Role: {r.Name}",
                permissions = r.RolePermissions.Select(rp => rp.Permission.Name).ToList()
            }).ToList<object>();
        }
    }
}
