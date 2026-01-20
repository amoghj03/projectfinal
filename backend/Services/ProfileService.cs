using System.Threading.Tasks;
using BankAPI.Models.DTOs;
using BankAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services
{
    public interface IProfileService
    {
        Task<ResetPasswordResponse> ResetPasswordAsync(long employeeId, ResetPasswordRequest request);
        Task<EmployeeDto?> GetProfileAsync(long employeeId);
    }

    public class ProfileService : IProfileService
    {
        private readonly ApplicationDbContext _context;
        public ProfileService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<EmployeeDto?> GetProfileAsync(long employeeId)
        {
            var employee = await _context.Employees
                .Include(e => e.User)
                .Include(e => e.Branch)
                .Include(e => e.EmployeeRoles)
                    .ThenInclude(er => er.Role)
                .FirstOrDefaultAsync(e => e.Id == employeeId);
            if (employee == null || employee.User == null)
                return null;

            return new EmployeeDto
            {
                Id = employee.Id,
                EmployeeId = employee.EmployeeId,
                FullName = employee.FullName,
                Email = employee.User.Email,
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

        public async Task<ResetPasswordResponse> ResetPasswordAsync(long employeeId, ResetPasswordRequest request)
        {
            var employee = await _context.Employees.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == employeeId);
            if (employee == null || employee.User == null)
            {
                return new ResetPasswordResponse { Success = false, Message = "Employee not found." };
            }
            // For demo: compare plain text (replace with hash check in production)
            if (employee.User.PasswordHash != request.CurrentPassword)
            {
                return new ResetPasswordResponse { Success = false, Message = "Current password is incorrect." };
            }
            // For demo: set plain text (replace with hash in production)
            employee.User.PasswordHash = request.NewPassword;
            employee.User.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return new ResetPasswordResponse { Success = true, Message = "Password reset successful." };
        }
    }
}
