using BankAPI.Data;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services
{
    public class DashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(long employeeId)
        {
            var attendanceStats = await GetAttendanceStatsAsync(employeeId);
            var taskStats = await GetTaskStatsAsync(employeeId);
            var skillStats = await GetSkillStatsAsync(employeeId);
            var recentActivities = await GetRecentActivitiesAsync(employeeId);

            return new DashboardStatsDto
            {
                AttendanceStats = attendanceStats,
                TaskStats = taskStats,
                SkillStats = skillStats,
                RecentActivities = recentActivities
            };
        }

        private async Task<AttendanceStatsDto> GetAttendanceStatsAsync(long employeeId)
        {
            var now = DateTime.UtcNow;
            var currentMonth = now.Month;
            var currentYear = now.Year;

            // Get all attendance records for the employee for the current month
            var currentAttendance = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId &&
                           a.Date.Month == currentMonth &&
                           a.Date.Year == currentYear)
                .ToListAsync();

            var presentDays = currentAttendance.Count(a => a.Status == "Present" || a.Status == "Late");
            var absentDays = currentAttendance.Count(a => a.Status == "Absent");

            // Get the tenant_id for the employee
            var employee = await _context.Employees
                .Where(e => e.Id == employeeId)
                .Select(e => new { e.TenantId })
                .FirstOrDefaultAsync();

            long? tenantId = employee?.TenantId;

            // Get the 'No weekends' setting for the tenant from the settings table
            var noWeekendsSetting = await _context.Settings
                .Where(s => s.Key == "No weekends" && s.TenantId == tenantId)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            bool noWeekends = false;
            if (noWeekendsSetting != null &&
                (noWeekendsSetting.Value?.ToLower() == "true" || noWeekendsSetting.Value == "1"))
            {
                noWeekends = true;
            }

            int today = now.Day;
            int totalWorkingDays;
            if (noWeekends)
            {
                // Consider all days from 1st to today (including weekends)
                totalWorkingDays = today;
            }
            else
            {
                // Exclude weekends
                totalWorkingDays = Enumerable.Range(1, today)
                    .Select(day => new DateTime(currentYear, currentMonth, day))
                    .Count(date => date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday);
            }

            var attendanceRate = totalWorkingDays > 0
                ? Math.Round((decimal)presentDays / totalWorkingDays * 100, 1)
                : 0;

            return new AttendanceStatsDto
            {
                AttendanceRate = attendanceRate,
                TotalDays = totalWorkingDays,
                PresentDays = presentDays,
                AbsentDays = absentDays
            };
        }

        private async Task<TaskStatsDto> GetTaskStatsAsync(long employeeId)
        {
            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;

            // Current month work logs
            var currentWorkLogs = await _context.WorkLogs
                .Where(w => w.EmployeeId == employeeId &&
                           w.Date.Month == currentMonth &&
                           w.Date.Year == currentYear)
                .ToListAsync();

            var tasksCompleted = currentWorkLogs.Count;
            var totalHours = currentWorkLogs.Sum(w => w.Hours);

            return new TaskStatsDto
            {
                TasksCompleted = tasksCompleted,
                TotalHours = totalHours
            };
        }

        private async Task<SkillStatsDto> GetSkillStatsAsync(long employeeId)
        {
            var skillTests = await _context.EmployeeSkillTests
                .Where(est => est.EmployeeId == employeeId)
                .OrderByDescending(est => est.AttemptedAt)
                .ToListAsync();

            if (!skillTests.Any())
            {
                return new SkillStatsDto
                {
                    AverageScore = 0,
                    TestsTaken = 0,
                    TestsPassed = 0
                };
            }

            var testsTaken = skillTests.Count;
            var testsPassed = skillTests.Count(st => st.Score >= 60);
            var averageScore = Math.Round(skillTests.Average(st => (double)st.Score), 1);

            return new SkillStatsDto
            {
                AverageScore = (decimal)averageScore,
                TestsTaken = testsTaken,
                TestsPassed = testsPassed
            };
        }

        private async Task<List<RecentActivityDto>> GetRecentActivitiesAsync(long employeeId)
        {
            var activities = new List<RecentActivityDto>();

            // Get recent leaves
            var recentLeaves = await _context.LeaveRequests
                .Where(lr => lr.EmployeeId == employeeId)
                .OrderByDescending(lr => lr.CreatedAt)
                .Take(3)
                .Select(lr => new RecentActivityDto
                {
                    Type = "Leave",
                    Title = $"Leave - {lr.Status}",
                    Description = $"{lr.StartDate:MMM dd} - {lr.EndDate:MMM dd}",
                    Status = lr.Status,
                    Date = lr.CreatedAt
                })
                .ToListAsync();

            activities.AddRange(recentLeaves);

            // Get recent complaints
            var recentComplaints = await _context.Complaints
                .Where(c => c.EmployeeId == employeeId)
                .OrderByDescending(c => c.CreatedAt)
                .Take(2)
                .Select(c => new RecentActivityDto
                {
                    Type = "Complaint",
                    Title = c.Subject,
                    Description = c.Description.Length > 100
                        ? c.Description.Substring(0, 100) + "..."
                        : c.Description,
                    Status = c.Status,
                    Date = c.CreatedAt
                })
                .ToListAsync();

            activities.AddRange(recentComplaints);

            // Get recent tech issues
            var recentIssues = await _context.TechIssues
                .Where(ti => ti.EmployeeId == employeeId)
                .OrderByDescending(ti => ti.CreatedAt)
                .Take(2)
                .Select(ti => new RecentActivityDto
                {
                    Type = "Tech Issue",
                    Title = ti.Title,
                    Description = ti.Description.Length > 100
                        ? ti.Description.Substring(0, 100) + "..."
                        : ti.Description,
                    Status = ti.Status,
                    Date = ti.CreatedAt
                })
                .ToListAsync();

            activities.AddRange(recentIssues);

            // Sort all activities by date and return top 5
            return activities
                .OrderByDescending(a => a.Date)
                .Take(5)
                .ToList();
        }
    }
}
