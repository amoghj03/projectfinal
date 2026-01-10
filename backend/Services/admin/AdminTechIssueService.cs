using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services.Admin
{
    public class AdminTechIssueService
    {
        private readonly ApplicationDbContext _context;

        public AdminTechIssueService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all tech issues for admin with optional branch filtering
        /// </summary>
        public async Task<List<AdminTechIssueDto>> GetAllTechIssuesAsync(long employeeId, string? branch = null)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            var tenantId = employee.TenantId;

            // Build query for tech issues
            var query = _context.TechIssues
                .Include(t => t.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(t => t.ApprovedByEmployee)
                .Where(t => t.TenantId == tenantId);

            // Filter by branch if provided and not "All Branches"
            if (!string.IsNullOrEmpty(branch) && branch != "All Branches")
            {
                query = query.Where(t => t.Employee.Branch != null && t.Employee.Branch.Name == branch);
            }

            var techIssues = await query
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return techIssues.Select(t => new AdminTechIssueDto
            {
                Id = t.Id,
                IssueId = t.IssueNumber,
                EmployeeId = t.EmployeeId,
                EmployeeName = t.Employee?.FullName ?? "Unknown",
                Department = t.Employee?.Department ?? "N/A",
                Branch = t.Employee?.Branch?.Name ?? "N/A",
                Title = t.Title,
                Description = t.Description,
                Category = t.Category.ToLower(),
                Impact = t.Priority.ToLower(),
                Status = MapStatus(t.Status),
                SubmittedDate = t.CreatedAt,
                LastUpdate = t.UpdatedAt,
                StepsToReproduce = t.Description, // Using description as placeholder
                ExpectedBehavior = "Expected behavior details", // Placeholder
                ActualBehavior = "Actual behavior details", // Placeholder
                EmployeeResolution = t.ResolutionNotes,
                AdminComment = t.ResolutionNotes,
                ApprovedBy = t.ApprovedByEmployee?.FullName,
                ApprovedDate = (t.Status == "Approved" || t.Status == "Resolved") ? t.ApprovedAt : null,
                RejectedBy = t.Status == "Rejected" ? t.ApprovedByEmployee?.FullName : null,
                RejectedDate = t.Status == "Rejected" ? t.ApprovedAt : null
            }).ToList();
        }

        /// <summary>
        /// Get tech issue statistics
        /// </summary>
        public async Task<AdminTechIssueStatsDto> GetTechIssueStatsAsync(long employeeId, string? branch = null)
        {
            var issues = await GetAllTechIssuesAsync(employeeId, branch);

            return new AdminTechIssueStatsDto
            {
                Total = issues.Count,
                Open = issues.Count(i => i.Status == "open"),
                PendingApproval = issues.Count(i => i.Status == "approval_pending"),
                Approved = issues.Count(i => i.Status == "resolved"), // Resolved = Approved by admin
                Rejected = 0, // We don't have rejected status anymore, rejected issues go back to Open
                HighImpact = issues.Count(i => i.Impact == "high")
            };
        }

        /// <summary>
        /// Approve a tech issue - marks it as Resolved
        /// </summary>
        public async Task<bool> ApproveTechIssueAsync(long issueId, long adminId, string adminComment)
        {
            var issue = await _context.TechIssues.FindAsync(issueId);
            if (issue == null)
            {
                throw new Exception("Tech issue not found");
            }

            // Prevent self-approval
            if (issue.EmployeeId == adminId)
            {
                throw new Exception("You cannot approve your own issue");
            }

            issue.Status = "Resolved"; // Resolved so employee sees it as closed/resolved
            issue.ApprovedBy = adminId;
            issue.ApprovedAt = DateTime.UtcNow;
            issue.ResolutionNotes = adminComment;
            issue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Reject a tech issue - marks it back as Open so employee can fix and resubmit
        /// </summary>
        public async Task<bool> RejectTechIssueAsync(long issueId, long adminId, string adminComment)
        {
            var issue = await _context.TechIssues.FindAsync(issueId);
            if (issue == null)
            {
                throw new Exception("Tech issue not found");
            }

            // Prevent self-rejection
            if (issue.EmployeeId == adminId)
            {
                throw new Exception("You cannot reject your own issue");
            }

            issue.Status = "Open"; // Set back to Open so employee can work on it again
            issue.ApprovedBy = adminId;
            issue.ApprovedAt = DateTime.UtcNow;
            issue.ResolutionNotes = adminComment; // Store admin's rejection feedback
            issue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Get a single tech issue by ID
        /// </summary>
        public async Task<AdminTechIssueDto?> GetTechIssueByIdAsync(long issueId, long employeeId)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            var issue = await _context.TechIssues
                .Include(t => t.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(t => t.ApprovedByEmployee)
                .FirstOrDefaultAsync(t => t.Id == issueId && t.TenantId == employee.TenantId);

            if (issue == null)
            {
                return null;
            }

            return new AdminTechIssueDto
            {
                Id = issue.Id,
                IssueId = issue.IssueNumber,
                EmployeeId = issue.EmployeeId,
                EmployeeName = issue.Employee?.FullName ?? "Unknown",
                Department = issue.Employee?.Department ?? "N/A",
                Branch = issue.Employee?.Branch?.Name ?? "N/A",
                Title = issue.Title,
                Description = issue.Description,
                Category = issue.Category.ToLower(),
                Impact = issue.Priority.ToLower(),
                Status = MapStatus(issue.Status),
                SubmittedDate = issue.CreatedAt,
                LastUpdate = issue.UpdatedAt,
                StepsToReproduce = issue.Description,
                ExpectedBehavior = "Expected behavior details",
                ActualBehavior = "Actual behavior details",
                EmployeeResolution = issue.ResolutionNotes,
                AdminComment = issue.ResolutionNotes,
                ApprovedBy = issue.ApprovedByEmployee?.FullName,
                ApprovedDate = (issue.Status == "Approved" || issue.Status == "Resolved") ? issue.ApprovedAt : null,
                RejectedBy = issue.Status == "Rejected" ? issue.ApprovedByEmployee?.FullName : null,
                RejectedDate = issue.Status == "Rejected" ? issue.ApprovedAt : null
            };
        }

        private string MapStatus(string dbStatus)
        {
            // Map to frontend format (lowercase with underscores)
            return dbStatus.ToLower().Replace(" ", "_");
        }
    }
}
