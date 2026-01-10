using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services
{
    public class TechIssueService
    {
        private readonly ApplicationDbContext _context;

        public TechIssueService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TechIssueDto>> GetEmployeeTechIssues(long employeeId)
        {
            var techIssues = await _context.TechIssues
                .Include(t => t.Employee)
                .Where(t => t.EmployeeId == employeeId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TechIssueDto
                {
                    Id = t.Id,
                    IssueNumber = t.IssueNumber,
                    Title = t.Title,
                    Description = t.Description,
                    Category = t.Category,
                    Impact = t.Priority,
                    Status = t.Status,
                    SubmittedDate = t.CreatedAt,
                    SubmittedBy = t.Employee.FullName,
                    LastUpdate = t.UpdatedAt,
                    StepsToReproduce = null, // Not stored in current schema
                    ExpectedBehavior = null, // Not stored in current schema
                    ActualBehavior = null, // Not stored in current schema
                    AssignedTo = null,
                    Resolution = t.ResolutionNotes,
                    ClosingComments = t.ResolutionNotes
                })
                .ToListAsync();

            return techIssues;
        }

        public async Task<TechIssueDto?> CreateTechIssue(long tenantId, long employeeId, CreateTechIssueRequest request)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                return null;
            }

            // Generate issue number
            var count = await _context.TechIssues.Where(t => t.TenantId == tenantId).CountAsync();
            var issueNumber = $"TECH{count + 1:D3}";

            // Check if tech issue requires approval from settings
            var requireApproval = await _context.Settings
                .Where(s => s.TenantId == tenantId && s.Key == "TechIssueApproval")
                .Select(s => s.Value)
                .FirstOrDefaultAsync();

            var techIssue = new TechIssue
            {
                TenantId = tenantId,
                IssueNumber = issueNumber,
                EmployeeId = employeeId,
                Category = request.Category,
                Title = request.Title,
                Description = request.Description,
                Priority = request.Impact,
                Status = "Open",
                RequiresApproval = requireApproval?.ToLower() == "true",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TechIssues.Add(techIssue);
            await _context.SaveChangesAsync();

            return new TechIssueDto
            {
                Id = techIssue.Id,
                IssueNumber = techIssue.IssueNumber,
                Title = techIssue.Title,
                Description = techIssue.Description,
                Category = techIssue.Category,
                Impact = techIssue.Priority,
                Status = techIssue.Status,
                SubmittedDate = techIssue.CreatedAt,
                SubmittedBy = employee.FullName,
                LastUpdate = techIssue.UpdatedAt,
                StepsToReproduce = request.StepsToReproduce,
                ExpectedBehavior = request.ExpectedBehavior,
                ActualBehavior = request.ActualBehavior
            };
        }

        public async Task<TechIssueDto?> CloseTechIssue(long employeeId, long issueId, string closingComments)
        {
            var techIssue = await _context.TechIssues
                .Include(t => t.Employee)
                .FirstOrDefaultAsync(t => t.Id == issueId && t.EmployeeId == employeeId);

            if (techIssue == null)
            {
                return null;
            }

            // Check if requires approval
            if (techIssue.RequiresApproval)
            {
                techIssue.Status = "Approval Pending";
            }
            else
            {
                techIssue.Status = "Closed";
                techIssue.ResolvedAt = DateTime.UtcNow;
            }

            techIssue.ResolutionNotes = closingComments;
            techIssue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new TechIssueDto
            {
                Id = techIssue.Id,
                IssueNumber = techIssue.IssueNumber,
                Title = techIssue.Title,
                Description = techIssue.Description,
                Category = techIssue.Category,
                Impact = techIssue.Priority,
                Status = techIssue.Status,
                SubmittedDate = techIssue.CreatedAt,
                SubmittedBy = techIssue.Employee.FullName,
                LastUpdate = techIssue.UpdatedAt,
                Resolution = techIssue.ResolutionNotes,
                ClosingComments = techIssue.ResolutionNotes
            };
        }
    }
}
