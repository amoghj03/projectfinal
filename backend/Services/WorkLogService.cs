using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services
{
    public class WorkLogService
    {
        private readonly ApplicationDbContext _context;

        public WorkLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<WorkLogDto> CreateWorkLog(long employeeId, CreateWorkLogRequest request)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var now = DateTime.UtcNow;

            var employee = await _context.Employees.FindAsync(employeeId);
            var workLog = new WorkLog
            {
                TenantId = employee?.TenantId ?? 0,
                EmployeeId = employeeId,
                Date = today,
                TaskName = request.TaskName,
                Description = request.Description,
                Hours = request.Hours,
                Category = request.Category,
                Status = "Completed",
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.WorkLogs.Add(workLog);
            await _context.SaveChangesAsync();

            return new WorkLogDto
            {
                Id = workLog.Id,
                Date = workLog.Date.ToString("yyyy-MM-dd"),
                TaskName = workLog.TaskName,
                Description = workLog.Description,
                Hours = workLog.Hours,
                Category = workLog.Category,
                Status = workLog.Status,
                CreatedAt = workLog.CreatedAt.ToString("yyyy-MM-dd HH:mm")
            };
        }

        public async Task<WorkLogSummaryDto> GetTodayWorkLogs(long employeeId)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var workLogs = await _context.WorkLogs
                .Where(w => w.EmployeeId == employeeId && w.Date == today)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new WorkLogDto
                {
                    Id = w.Id,
                    Date = w.Date.ToString("yyyy-MM-dd"),
                    TaskName = w.TaskName,
                    Description = w.Description,
                    Hours = w.Hours,
                    Category = w.Category,
                    Status = w.Status,
                    CreatedAt = w.CreatedAt.ToString("yyyy-MM-dd HH:mm")
                })
                .ToListAsync();

            var totalHours = workLogs.Sum(w => w.Hours);

            return new WorkLogSummaryDto
            {
                TotalHours = totalHours,
                TotalTasks = workLogs.Count,
                WorkLogs = workLogs
            };
        }

        public async Task<List<WorkLogDto>> GetWorkLogHistory(long employeeId, int days = 30)
        {
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));

            var workLogs = await _context.WorkLogs
                .Where(w => w.EmployeeId == employeeId && w.Date >= startDate)
                .OrderByDescending(w => w.Date)
                .ThenByDescending(w => w.CreatedAt)
                .Select(w => new WorkLogDto
                {
                    Id = w.Id,
                    Date = w.Date.ToString("yyyy-MM-dd"),
                    TaskName = w.TaskName,
                    Description = w.Description,
                    Hours = w.Hours,
                    Category = w.Category,
                    Status = w.Status,
                    CreatedAt = w.CreatedAt.ToString("yyyy-MM-dd HH:mm")
                })
                .ToListAsync();

            return workLogs;
        }
    }
}