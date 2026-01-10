using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services.Admin
{
    public class AdminComplaintService
    {
        private readonly ApplicationDbContext _context;

        public AdminComplaintService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all complaints for admin with optional branch filtering
        /// </summary>
        public async Task<List<AdminComplaintDto>> GetAllComplaintsAsync(long employeeId, string? branch = null)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            var tenantId = employee.TenantId;

            // Build query for complaints
            var query = _context.Complaints
                .Include(c => c.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(c => c.AssignedToEmployee)
                .Where(c => c.TenantId == tenantId);

            // Filter by branch if provided and not "All Branches"
            if (!string.IsNullOrEmpty(branch) && branch != "All Branches")
            {
                query = query.Where(c => c.Employee.Branch != null && c.Employee.Branch.Name == branch);
            }

            var complaints = await query
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return complaints.Select(c => new AdminComplaintDto
            {
                Id = c.Id,
                ComplaintId = c.ComplaintNumber,
                EmployeeId = c.EmployeeId,
                EmployeeName = c.Employee?.FullName ?? "Unknown",
                Department = c.Employee?.Department ?? "N/A",
                Branch = c.Employee?.Branch?.Name ?? "N/A",
                Subject = c.Subject,
                Description = c.Description,
                Category = c.Category.ToLower(),
                Priority = c.Priority.ToLower(),
                Status = MapStatus(c.Status),
                SubmittedDate = c.CreatedAt,
                LastUpdate = c.UpdatedAt,
                Resolution = c.ResolutionNotes,
                ResolvedBy = c.Status == "Resolved" ? c.AssignedToEmployee?.FullName : null,
                ResolvedDate = c.Status == "Resolved" ? c.ResolvedAt : null
            }).ToList();
        }

        /// <summary>
        /// Get complaint statistics
        /// </summary>
        public async Task<AdminComplaintStatsDto> GetComplaintStatsAsync(long employeeId, string? branch = null)
        {
            var complaints = await GetAllComplaintsAsync(employeeId, branch);

            return new AdminComplaintStatsDto
            {
                Total = complaints.Count,
                Open = complaints.Count(c => c.Status == "open"),
                ApprovalPending = complaints.Count(c => c.Status == "approval_pending"),
                Resolved = complaints.Count(c => c.Status == "resolved"),
                HighPriority = complaints.Count(c => c.Priority == "high")
            };
        }

        /// <summary>
        /// Resolve a complaint
        /// </summary>
        public async Task<bool> ResolveComplaintAsync(long complaintId, long adminId, string resolution, string adminComment)
        {
            var complaint = await _context.Complaints.FindAsync(complaintId);
            if (complaint == null)
            {
                throw new Exception("Complaint not found");
            }

            complaint.Status = "Resolved";
            complaint.AssignedTo = adminId;
            complaint.ResolvedAt = DateTime.UtcNow;
            complaint.ResolutionNotes = resolution;
            complaint.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Assign complaint to In Progress status
        /// </summary>
        public async Task<bool> TakeActionOnComplaintAsync(long complaintId, long adminId, string comment)
        {
            var complaint = await _context.Complaints.FindAsync(complaintId);
            if (complaint == null)
            {
                throw new Exception("Complaint not found");
            }

            complaint.Status = "In Progress";
            complaint.AssignedTo = adminId;
            complaint.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Reject a complaint (mark as Open with rejection comment)
        /// </summary>
        public async Task<bool> RejectComplaintAsync(long complaintId, long adminId, string rejectionComment)
        {
            var complaint = await _context.Complaints.FindAsync(complaintId);
            if (complaint == null)
            {
                throw new Exception("Complaint not found");
            }

            complaint.Status = "Open";
            complaint.ResolutionNotes = rejectionComment;
            complaint.AssignedTo = adminId;
            complaint.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Get a single complaint by ID
        /// </summary>
        public async Task<AdminComplaintDto?> GetComplaintByIdAsync(long complaintId, long employeeId)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            var complaint = await _context.Complaints
                .Include(c => c.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(c => c.AssignedToEmployee)
                .FirstOrDefaultAsync(c => c.Id == complaintId && c.TenantId == employee.TenantId);

            if (complaint == null)
            {
                return null;
            }

            return new AdminComplaintDto
            {
                Id = complaint.Id,
                ComplaintId = complaint.ComplaintNumber,
                EmployeeId = complaint.EmployeeId,
                EmployeeName = complaint.Employee?.FullName ?? "Unknown",
                Department = complaint.Employee?.Department ?? "N/A",
                Branch = complaint.Employee?.Branch?.Name ?? "N/A",
                Subject = complaint.Subject,
                Description = complaint.Description,
                Category = complaint.Category.ToLower(),
                Priority = complaint.Priority.ToLower(),
                Status = MapStatus(complaint.Status),
                SubmittedDate = complaint.CreatedAt,
                LastUpdate = complaint.UpdatedAt,
                Resolution = complaint.ResolutionNotes,
                ResolvedBy = complaint.Status == "Resolved" ? complaint.AssignedToEmployee?.FullName : null,
                ResolvedDate = complaint.Status == "Resolved" ? complaint.ResolvedAt : null
            };
        }

        private string MapStatus(string dbStatus)
        {
            // Map to frontend format (lowercase with underscores)
            return dbStatus.ToLower().Replace(" ", "_");
        }
    }
}
