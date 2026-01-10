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
    }
}
