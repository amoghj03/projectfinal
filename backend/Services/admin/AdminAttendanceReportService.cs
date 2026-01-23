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
    }

    // AttendanceRangeRequest moved to DTOs/AttendanceRangeRequest.cs
}
