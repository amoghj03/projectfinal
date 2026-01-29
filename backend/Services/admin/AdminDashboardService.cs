using BankAPI.Data;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services.Admin
{
    public class AdminDashboardService
    {
        private readonly ApplicationDbContext _context;

        public AdminDashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardStatsDto> GetAdminDashboardStatsAsync(long employeeId, string? branch = null)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;

            // Get tenant ID from employee
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            var tenantId = employee.TenantId;

            // Get tenant subscription end date
            var tenant = await _context.Tenants.FindAsync(tenantId);
            var subscriptionEndDate = tenant?.SubscriptionExpiresAt;

            // Build query for employees, filtering by branch if provided
            var employeesQuery = _context.Employees
                .Where(e => e.TenantId == tenantId && e.Status == "Active");

            if (!string.IsNullOrEmpty(branch))
            {
                var branchEntity = await _context.Branches
                    .FirstOrDefaultAsync(b => b.TenantId == tenantId && b.Name == branch);

                if (branchEntity != null)
                {
                    employeesQuery = employeesQuery.Where(e => e.BranchId == branchEntity.Id);
                }
            }

            var employees = await employeesQuery.ToListAsync();
            var employeeIds = employees.Select(e => e.Id).ToList();
            var totalEmployees = employees.Count;

            // Get today's attendance
            var todayAttendance = await _context.Attendances
                .Where(a => a.TenantId == tenantId &&
                           employeeIds.Contains(a.EmployeeId) &&
                           a.Date == today)
                .ToListAsync();

            var presentToday = todayAttendance.Count(a => a.Status == "Present" || a.Status == "Late");
            var absentToday = todayAttendance.Count(a => a.Status == "Absent");

            // Calculate attendance rate for the month
            var monthAttendance = await _context.Attendances
                .Where(a => a.TenantId == tenantId &&
                           employeeIds.Contains(a.EmployeeId) &&
                           a.Date.Month == currentMonth &&
                           a.Date.Year == currentYear)
                .ToListAsync();

            var attendanceRate = monthAttendance.Count > 0
                ? Math.Round((decimal)monthAttendance.Count(a => a.Status == "Present" || a.Status == "Late") / monthAttendance.Count * 100, 1)
                : 0;

            // Get open complaints (only "Open" status, not "In Progress")
            var openComplaints = await _context.Complaints
                .Where(c => c.TenantId == tenantId &&
                           c.Status == "Open")
                .CountAsync();

            // Get pending tech issues
            var techIssuesPending = await _context.TechIssues
                .Where(ti => ti.TenantId == tenantId &&
                            ti.Status == "Approval Pending")
                .CountAsync();

            // Get pending leave requests
            var leaveRequestsPending = await _context.LeaveRequests
                .Where(lr => lr.TenantId == tenantId &&
                            lr.Status == "Pending")
                .CountAsync();

            // Calculate monthly test average
            var monthlyTests = await _context.EmployeeSkillTests
                .Where(est => est.TenantId == tenantId &&
                             employeeIds.Contains(est.EmployeeId) &&
                             est.AttemptedAt.Month == currentMonth &&
                             est.AttemptedAt.Year == currentYear)
                .ToListAsync();

            var monthlyTestAvg = monthlyTests.Any()
                ? Math.Round((decimal)monthlyTests.Average(t => t.Score), 1)
                : 0;

            var pendingApprovals = techIssuesPending + leaveRequestsPending;

            return new AdminDashboardStatsDto
            {
                Branch = branch ?? "All Branches",
                TotalEmployees = totalEmployees,
                PresentToday = presentToday,
                AbsentToday = absentToday,
                OpenComplaints = openComplaints,
                PendingApprovals = pendingApprovals,
                MonthlyTestAvg = monthlyTestAvg,
                LeaveRequestsPending = leaveRequestsPending,
                TechIssuesPending = techIssuesPending,
                AttendanceRate = attendanceRate,
                SubscriptionEndDate = subscriptionEndDate
            };
        }
    }
}
