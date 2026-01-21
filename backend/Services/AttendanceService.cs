using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services
{
    public class AttendanceService
    {
        private readonly ApplicationDbContext _context;

        public AttendanceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TodayAttendanceDto> GetTodayAttendance(long employeeId)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var attendance = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date == today)
                .FirstOrDefaultAsync();

            if (attendance == null)
            {
                return new TodayAttendanceDto
                {
                    CheckedIn = false,
                    CheckedOut = false
                };
            }

            return new TodayAttendanceDto
            {
                CheckedIn = attendance.CheckInTime.HasValue,
                CheckedOut = attendance.CheckOutTime.HasValue,
                CheckInTime = attendance.CheckInTime?.ToString("hh:mm tt"),
                CheckOutTime = attendance.CheckOutTime?.ToString("hh:mm tt"),
                Status = attendance.Status,
                WorkHours = attendance.WorkHours
            };
        }

        public async Task<AttendanceDto> CheckIn(long employeeId, CheckInRequest request)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Check if already checked in today
            var existingAttendance = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date == today)
                .FirstOrDefaultAsync();

            if (existingAttendance != null && existingAttendance.CheckInTime.HasValue)
            {
                throw new InvalidOperationException("Already checked in today");
            }

            var now = DateTime.UtcNow;
            var checkInTime = now;

            if (existingAttendance == null)
            {
                var employee = await _context.Employees.FindAsync(employeeId);
                existingAttendance = new Attendance
                {
                    TenantId = employee?.TenantId ?? 0,
                    EmployeeId = employeeId,
                    Date = today,
                    CheckInTime = checkInTime,
                    Status = "Present",
                    Location = request.Location,
                    Notes = request.Notes,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                _context.Attendances.Add(existingAttendance);
            }
            else
            {
                existingAttendance.CheckInTime = checkInTime;
                existingAttendance.Status = "Present";
                existingAttendance.Location = request.Location;
                existingAttendance.Notes = request.Notes;
                existingAttendance.UpdatedAt = now;
            }

            await _context.SaveChangesAsync();

            return new AttendanceDto
            {
                Id = existingAttendance.Id,
                Date = existingAttendance.Date.ToString("yyyy-MM-dd"),
                CheckInTime = existingAttendance.CheckInTime?.ToString("hh:mm tt"),
                CheckOutTime = existingAttendance.CheckOutTime?.ToString("hh:mm tt"),
                Status = existingAttendance.Status,
                WorkHours = existingAttendance.WorkHours,
                Location = existingAttendance.Location,
                Notes = existingAttendance.Notes
            };
        }

        public async Task<AttendanceDto> CheckOut(long employeeId, CheckOutRequest request)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var attendance = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date == today)
                .FirstOrDefaultAsync();

            if (attendance == null || !attendance.CheckInTime.HasValue)
            {
                throw new InvalidOperationException("Must check in before checking out");
            }

            if (attendance.CheckOutTime.HasValue)
            {
                throw new InvalidOperationException("Already checked out today");
            }

            var now = DateTime.UtcNow;
            attendance.CheckOutTime = now;

            // Calculate work hours
            if (attendance.CheckInTime.HasValue)
            {
                var workDuration = now - attendance.CheckInTime.Value;
                attendance.WorkHours = (decimal)workDuration.TotalHours;
            }

            if (!string.IsNullOrEmpty(request.Notes))
            {
                attendance.Notes = string.IsNullOrEmpty(attendance.Notes)
                    ? request.Notes
                    : attendance.Notes + " | " + request.Notes;
            }

            attendance.UpdatedAt = now;

            await _context.SaveChangesAsync();

            return new AttendanceDto
            {
                Id = attendance.Id,
                Date = attendance.Date.ToString("yyyy-MM-dd"),
                CheckInTime = attendance.CheckInTime?.ToString("hh:mm tt"),
                CheckOutTime = attendance.CheckOutTime?.ToString("hh:mm tt"),
                Status = attendance.Status,
                WorkHours = attendance.WorkHours,
                Location = attendance.Location,
                Notes = attendance.Notes
            };
        }

        public async Task<List<AttendanceDto>> GetAttendanceHistory(long employeeId, int days = 30)
        {
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));

            var attendances = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date >= startDate)
                .OrderByDescending(a => a.Date)
                .Select(a => new AttendanceDto
                {
                    Id = a.Id,
                    Date = a.Date.ToString("yyyy-MM-dd"),
                    CheckInTime = a.CheckInTime.HasValue ? a.CheckInTime.Value.ToString("hh:mm tt") : null,
                    CheckOutTime = a.CheckOutTime.HasValue ? a.CheckOutTime.Value.ToString("hh:mm tt") : null,
                    Status = a.Status,
                    WorkHours = a.WorkHours,
                    Location = a.Location,
                    Notes = a.Notes
                })
                .ToListAsync();

            return attendances;
        }

        public async Task<AttendanceDto> ManualMarkAttendance(string employeeId, string date, string status, decimal workHours)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
            if (employee == null) throw new Exception("Employee not found");
            var dateObj = DateOnly.Parse(date);
            if (dateObj > DateOnly.FromDateTime(DateTime.UtcNow))
                throw new Exception("Cannot mark attendance for a future date.");
            var attendance = await _context.Attendances.FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.Date == dateObj);
            var now = DateTime.UtcNow;
            // Set default check-in time to 9:00 AM local time, then convert to UTC
            var localCheckIn = new DateTime(dateObj.Year, dateObj.Month, dateObj.Day, 9, 0, 0, DateTimeKind.Local);
            var checkInDateTime = localCheckIn.ToUniversalTime();
            // Calculate check-out time based on workHours, then convert to UTC
            var localCheckOut = localCheckIn.AddHours((double)workHours);
            var checkOutDateTime = localCheckOut.ToUniversalTime();
            if (attendance == null)
            {
                attendance = new Attendance
                {
                    TenantId = employee.TenantId,
                    EmployeeId = employee.Id,
                    Date = dateObj,
                    Status = status,
                    WorkHours = workHours,
                    CheckInTime = checkInDateTime,
                    CheckOutTime = checkOutDateTime,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                _context.Attendances.Add(attendance);
            }
            else
            {
                attendance.Status = status;
                attendance.WorkHours = workHours;
                attendance.CheckInTime = checkInDateTime;
                attendance.CheckOutTime = checkOutDateTime;
                attendance.UpdatedAt = now;
            }
            await _context.SaveChangesAsync();
            return new AttendanceDto
            {
                Id = attendance.Id,
                Date = attendance.Date.ToString("yyyy-MM-dd"),
                Status = attendance.Status,
                WorkHours = attendance.WorkHours
            };
        }
    }
}