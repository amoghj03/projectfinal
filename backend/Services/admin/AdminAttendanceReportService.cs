using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services.Admin
{
    public class AdminAttendanceReportService
    {
        private readonly ApplicationDbContext _context;
        public AdminAttendanceReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get attendance report for a date range (inclusive)
        /// </summary>
        public async Task<List<DailyAttendanceDto>> GetAttendanceRangeReport(AttendanceRangeRequest request)
        {
            var from = DateOnly.Parse(request.FromDate);
            var to = DateOnly.Parse(request.ToDate);
            var result = new List<DailyAttendanceDto>();

            // Get employees filtered by tenant and optional filters
            var query = _context.Employees
                .Include(e => e.Branch)
                .Where(e => e.TenantId == request.TenantId && e.Status == "Active");
            if (!string.IsNullOrEmpty(request.Branch) && request.Branch != "All Branches")
                query = query.Where(e => e.Branch != null && e.Branch.Name == request.Branch);
            if (!string.IsNullOrEmpty(request.Department))
                query = query.Where(e => e.Department == request.Department);
            if (!string.IsNullOrEmpty(request.EmployeeId))
                query = query.Where(e => e.EmployeeId == request.EmployeeId);
            var employees = await query.ToListAsync();

            // For each date in range, fetch attendance
            for (var date = from; date <= to; date = date.AddDays(1))
            {
                var attendances = await _context.Attendances
                    .Where(a => a.Date == date)
                    .GroupBy(a => a.EmployeeId)
                    .Select(g => g.OrderByDescending(a => a.CheckInTime).FirstOrDefault())
                    .ToDictionaryAsync(a => a.EmployeeId, a => a);
                var workLogs = await _context.WorkLogs
                    .Where(w => w.Date == date)
                    .GroupBy(w => w.EmployeeId)
                    .Select(g => g.OrderByDescending(w => w.Id).FirstOrDefault())
                    .ToDictionaryAsync(w => w.EmployeeId, w => w);
                foreach (var emp in employees)
                {
                    var attendance = attendances.GetValueOrDefault(emp.Id);
                    var workLog = workLogs.GetValueOrDefault(emp.Id);
                    string status = "absent";
                    if (attendance != null && attendance.CheckInTime.HasValue)
                    {
                        var checkInTime = attendance.CheckInTime.Value;
                        var standardTime = new DateTime(checkInTime.Year, checkInTime.Month, checkInTime.Day, 9, 0, 0);
                        if (checkInTime > standardTime.AddMinutes(15))
                            status = "late";
                        else
                            status = "present";
                    }
                    string? notes = null;
                    if (workLog != null)
                    {
                        var taskPart = workLog.TaskName;
                        var descPart = !string.IsNullOrEmpty(workLog.Description) ? workLog.Description : "";
                        var hoursPart = $"{workLog.Hours}h";
                        notes = !string.IsNullOrEmpty(descPart)
                            ? $"Task: {taskPart} - {descPart} ({hoursPart})"
                            : $"Task: {taskPart} ({hoursPart})";
                    }
                    result.Add(new DailyAttendanceDto
                    {
                        EmployeeId = emp.EmployeeId,
                        EmployeeName = emp.FullName,
                        Department = emp.Department,
                        Branch = emp.Branch?.Name,
                        Status = status,
                        CheckInTime = attendance?.CheckInTime?.ToString("hh:mm tt"),
                        CheckOutTime = attendance?.CheckOutTime?.ToString("hh:mm tt"),
                        WorkHours = attendance?.WorkHours,
                        Location = attendance?.Location,
                        Notes = notes,
                        Date = date.ToString("yyyy-MM-dd"),
                        ProductivityRating = attendance?.ProductivityRating
                    });
                }
            }
            return result;
        }

        /// <summary>
        /// Get complaint summary report for a date range (inclusive)
        /// </summary>
        public async Task<List<AdminComplaintDto>> GetComplaintSummaryRangeReport(string fromDate, string toDate, string? branch, string? department, string? employeeId, long tenantId)
        {
            var from = DateTime.SpecifyKind(DateTime.Parse(fromDate), DateTimeKind.Utc);
            var to = DateTime.SpecifyKind(DateTime.Parse(toDate).AddDays(1).AddTicks(-1), DateTimeKind.Utc); // inclusive end of day
            var query = _context.Complaints
                .Include(c => c.Employee)
                .Include(c => c.Employee.Branch)
                .Where(c => c.TenantId == tenantId && c.CreatedAt >= from && c.CreatedAt <= to);
            if (!string.IsNullOrEmpty(branch) && branch != "All Branches")
                query = query.Where(c => c.Employee.Branch != null && c.Employee.Branch.Name == branch);
            if (!string.IsNullOrEmpty(department))
                query = query.Where(c => c.Employee.Department == department);
            if (!string.IsNullOrEmpty(employeeId))
                query = query.Where(c => c.Employee.EmployeeId == employeeId);
            var complaints = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
            return complaints.Select(c => new AdminComplaintDto
            {
                Id = c.Id,
                ComplaintId = c.ComplaintNumber,
                EmployeeId = c.EmployeeId,
                EmployeeName = c.Employee?.FullName ?? "Unknown",
                Department = c.Employee?.Department ?? "N/A",
                Branch = c.Employee?.Branch != null ? c.Employee.Branch.Name : "N/A",
                Subject = c.Subject,
                Description = c.Description,
                Category = c.Category.ToLower(),
                Priority = c.Priority.ToLower(),
                Status = c.Status,
                SubmittedDate = c.CreatedAt,
                LastUpdate = c.UpdatedAt,
                Resolution = c.ResolutionNotes,
                ResolvedBy = c.Employee?.FullName ?? "Unknown",//should be changed later for review
                ResolvedDate = c.ResolvedAt
            }).ToList();
        }

        /// <summary>
        /// Get tech issues report for a date range (inclusive)
        /// </summary>
        public async Task<List<AdminTechIssueDto>> GetTechIssuesRangeReport(string fromDate, string toDate, string? branch, string? department, string? employeeId, long tenantId)
        {
            var from = DateTime.SpecifyKind(DateTime.Parse(fromDate), DateTimeKind.Utc);
            var to = DateTime.SpecifyKind(DateTime.Parse(toDate).AddDays(1).AddTicks(-1), DateTimeKind.Utc); // inclusive end of day
            var query = _context.TechIssues
                .Include(t => t.Employee)
                .Include(t => t.Employee.Branch)
                .Where(t => t.TenantId == tenantId && t.CreatedAt >= from && t.CreatedAt <= to);
            if (!string.IsNullOrEmpty(branch) && branch != "All Branches")
                query = query.Where(t => t.Employee.Branch != null && t.Employee.Branch.Name == branch);
            if (!string.IsNullOrEmpty(department))
                query = query.Where(t => t.Employee.Department == department);
            if (!string.IsNullOrEmpty(employeeId))
                query = query.Where(t => t.Employee.EmployeeId == employeeId);
            var techIssues = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
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
                Category = t.Category,
                Impact = t.Priority,
                Status = t.Status,
                SubmittedDate = t.CreatedAt,
                LastUpdate = t.UpdatedAt,
                EmployeeResolution = t.ResolutionNotes,
                // Approval info (if available)
                ApprovedBy = t.ApprovedByEmployee?.FullName,
                ApprovedDate = t.ApprovedAt,
            }).ToList();
        }

        // AttendanceRangeRequest moved to DTOs/AttendanceRangeRequest.cs
    }
}
