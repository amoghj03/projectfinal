using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services
{
    public class ComplaintService
    {
        private readonly ApplicationDbContext _context;

        public ComplaintService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ComplaintDto>> GetEmployeeComplaints(long employeeId)
        {
            var complaints = await _context.Complaints
                .Include(c => c.Employee)
                .Where(c => c.EmployeeId == employeeId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new ComplaintDto
                {
                    Id = c.Id,
                    ComplaintNumber = c.ComplaintNumber,
                    Title = c.Subject,
                    Description = c.Description,
                    Category = c.Category,
                    Priority = c.Priority,
                    Status = c.Status,
                    SubmittedDate = c.CreatedAt,
                    SubmittedBy = c.Employee.FullName,
                    LastUpdate = c.UpdatedAt,
                    Resolution = c.ResolutionNotes,
                    ClosingComments = c.ResolutionNotes
                })
                .ToListAsync();

            return complaints;
        }

        public async Task<ComplaintDto?> CreateComplaint(long tenantId, long employeeId, CreateComplaintRequest request)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                return null;
            }

            // Generate complaint number
            var count = await _context.Complaints.Where(c => c.TenantId == tenantId).CountAsync();
            var complaintNumber = $"CMP-{count + 1:D3}";
            var requireApproval = await _context.Settings
                .Where(s => s.TenantId == tenantId && s.Key == "RequireComplaintApproval")
                .Select(s => s.Value)
                .FirstOrDefaultAsync();
            var complaint = new Complaint
            {
                TenantId = tenantId,
                ComplaintNumber = complaintNumber,
                EmployeeId = employeeId,
                Category = request.Category,
                Subject = request.Title,
                Description = request.Description,
                Priority = request.Priority,
                Status = "Open",
                RequiresApproval = requireApproval?.ToLower() == "true",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Complaints.Add(complaint);
            await _context.SaveChangesAsync();

            return new ComplaintDto
            {
                Id = complaint.Id,
                ComplaintNumber = complaint.ComplaintNumber,
                Title = complaint.Subject,
                Description = complaint.Description,
                Category = complaint.Category,
                Priority = complaint.Priority,
                Status = complaint.Status,
                SubmittedDate = complaint.CreatedAt,
                SubmittedBy = employee.FullName,
                LastUpdate = complaint.UpdatedAt
            };
        }
    }
}
