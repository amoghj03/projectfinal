using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services.Admin
{
    public class AdminPayslipService
    {
        private readonly ApplicationDbContext _context;

        public AdminPayslipService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetEmployeesForPayslipAsync(long requestingEmployeeId, string? branch)
        {
            try
            {
                // Get requesting employee to check tenant
                var requestingEmployee = await _context.Employees
                    .Include(e => e.Branch)
                    .FirstOrDefaultAsync(e => e.Id == requestingEmployeeId);

                if (requestingEmployee == null)
                {
                    return new { success = false, message = "Employee not found" };
                }

                // Query employees
                var query = _context.Employees
                    .Include(e => e.Branch)
                    .Where(e => e.TenantId == requestingEmployee.TenantId && e.Status == "Active");

                // Apply branch filter if provided
                if (!string.IsNullOrWhiteSpace(branch) && branch != "All Branches")
                {
                    query = query.Where(e => e.Branch != null && e.Branch.Name == branch);
                }

                var employees = await query
                    .Select(e => new
                    {
                        id = e.Id,
                        employeeId = e.EmployeeId,
                        fullName = e.FullName,
                        email = e.Email,
                        department = e.Department,
                        jobRole = e.JobRole,
                        branch = e.Branch != null ? e.Branch.Name : "N/A",
                        salary = e.Salary ?? 0
                    })
                    .OrderBy(e => e.fullName)
                    .ToListAsync();

                return new { success = true, data = employees };
            }
            catch (Exception ex)
            {
                return new { success = false, message = "Error fetching employees", error = ex.Message };
            }
        }

        public async Task<object> GeneratePayslipAsync(long requestingEmployeeId, PayslipGenerateDto request)
        {
            try
            {
                // Get requesting employee to check tenant
                var requestingEmployee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Id == requestingEmployeeId);

                if (requestingEmployee == null)
                {
                    return new { success = false, message = "Employee not found" };
                }

                // Get target employee
                var targetEmployee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Id == request.EmployeeId && e.TenantId == requestingEmployee.TenantId);

                if (targetEmployee == null)
                {
                    return new { success = false, message = "Target employee not found" };
                }

                // Check if payslip already exists
                var existingPayslip = await _context.Payslips
                    .FirstOrDefaultAsync(p =>
                        p.EmployeeId == request.EmployeeId &&
                        p.Month == request.Month &&
                        p.Year == request.Year);

                if (existingPayslip != null)
                {
                    return new { success = false, message = "Payslip already exists for this month and year" };
                }

                // Calculate totals
                var grossSalary = request.BasicSalary + request.Hra + request.TransportAllowance +
                                 request.MedicalAllowance + request.SpecialAllowance + request.OtherEarnings;

                var totalDeductions = request.ProvidentFund + request.ProfessionalTax +
                                     request.IncomeTax + request.OtherDeductions;

                var netSalary = grossSalary - totalDeductions;

                // Create payslip
                var payslip = new Payslip
                {
                    TenantId = requestingEmployee.TenantId,
                    EmployeeId = request.EmployeeId,
                    Month = request.Month,
                    Year = request.Year,
                    BasicSalary = request.BasicSalary,
                    Allowances = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        hra = request.Hra,
                        transportAllowance = request.TransportAllowance,
                        medicalAllowance = request.MedicalAllowance,
                        specialAllowance = request.SpecialAllowance,
                        otherEarnings = request.OtherEarnings
                    }),
                    Deductions = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        providentFund = request.ProvidentFund,
                        professionalTax = request.ProfessionalTax,
                        incomeTax = request.IncomeTax,
                        otherDeductions = request.OtherDeductions
                    }),
                    GrossSalary = grossSalary,
                    NetSalary = netSalary,
                    WorkingDays = request.WorkingDays,
                    PresentDays = request.PresentDays,
                    GeneratedAt = DateTime.UtcNow,
                    GeneratedBy = requestingEmployeeId
                };

                _context.Payslips.Add(payslip);
                await _context.SaveChangesAsync();

                return new
                {
                    success = true,
                    message = "Payslip generated successfully",
                    data = new
                    {
                        id = payslip.Id,
                        employeeId = payslip.EmployeeId,
                        month = payslip.Month,
                        year = payslip.Year,
                        netSalary = payslip.NetSalary
                    }
                };
            }
            catch (Exception ex)
            {
                return new { success = false, message = "Error generating payslip", error = ex.Message };
            }
        }
    }
}
