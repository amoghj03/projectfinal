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

            // Get employee and tenantId
            var employee = await _context.Employees.FindAsync(employeeId);
            var tenantId = employee?.TenantId ?? 0;

            // Check if today is a holiday for the tenant (global or branch-specific)
            var todayDateTimeUtc = DateTime.SpecifyKind(today.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var branchId = employee?.BranchId;
            bool isHoliday = await _context.Holidays.AnyAsync(h =>
                h.TenantId == tenantId &&
                h.Date == todayDateTimeUtc &&
                (
                    h.BranchId == null || // Global holiday
                    (branchId != null && h.BranchId == branchId) // Branch-specific holiday
                )
            );

            var attendance = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date == today)
                .FirstOrDefaultAsync();

            if (attendance == null)
            {
                return new TodayAttendanceDto
                {
                    CheckedIn = false,
                    CheckedOut = false,
                    IsHoliday = isHoliday
                };
            }

            return new TodayAttendanceDto
            {
                CheckedIn = attendance.CheckInTime.HasValue,
                CheckedOut = attendance.CheckOutTime.HasValue,
                CheckInTime = attendance.CheckInTime?.ToString("hh:mm tt"),
                CheckOutTime = attendance.CheckOutTime?.ToString("hh:mm tt"),
                Status = attendance.Status,
                WorkHours = attendance.WorkHours,
                ProductivityRating = attendance.ProductivityRating,
                IsHoliday = isHoliday
            };
        }

        public async Task<AttendanceDto> CheckIn(long employeeId, CheckInRequest request)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Get employee and tenantId
            var employee = await _context.Employees.FindAsync(employeeId);
            var tenantId = employee?.TenantId ?? 0;

            // Check if today is a holiday for the tenant (global or branch-specific)
            var todayDateTimeUtc = DateTime.SpecifyKind(today.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var branchId = employee?.BranchId;
            bool isHoliday = await _context.Holidays.AnyAsync(h =>
                h.TenantId == tenantId &&
                h.Date == todayDateTimeUtc &&
                (
                    h.BranchId == null || // Global holiday
                    (branchId != null && h.BranchId == branchId) // Branch-specific holiday
                )
            );
            if (isHoliday)
            {
                throw new InvalidOperationException("Check-in is not allowed on a holiday.");
            }

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

            // Get check-in setting for tenant (default 9:00 AM if not set)
            var checkInSetting = await _context.Settings.FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Key == "checkIn");
            TimeSpan standardCheckIn = new TimeSpan(9, 0, 0);
            {
                if (TimeSpan.TryParse(checkInSetting.Value, out var parsedTime))
                {
                    standardCheckIn = parsedTime;
                }
                else if (DateTime.TryParse(checkInSetting.Value, out var parsedDateTime))
                {
                    standardCheckIn = parsedDateTime.TimeOfDay;
                }
            }
            // Convert check-in time to local and compare
            var localCheckIn = TimeZoneInfo.ConvertTimeFromUtc(checkInTime, TimeZoneInfo.Local);
            var checkInTimeOfDay = localCheckIn.TimeOfDay;
            // Allow 15 min grace
            bool isLate = checkInTimeOfDay > standardCheckIn.Add(new TimeSpan(0, 15, 0));
            var status = isLate ? "Late" : "Present";

            if (existingAttendance == null)
            {
                existingAttendance = new Attendance
                {
                    TenantId = tenantId,
                    EmployeeId = employeeId,
                    Date = today,
                    CheckInTime = checkInTime.AddHours(5).AddMinutes(30), // Convert to IST
                    Status = status,
                    Location = request.Location,
                    Notes = request.Notes,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                _context.Attendances.Add(existingAttendance);
            }
            else
            {
                existingAttendance.CheckInTime = checkInTime.AddHours(5).AddMinutes(30);
                existingAttendance.Status = status;
                existingAttendance.Location = request.Location;
                existingAttendance.Notes = request.Notes;
                existingAttendance.UpdatedAt = now;
            }

            await _context.SaveChangesAsync();

            return new AttendanceDto
            {
                Id = existingAttendance.Id,
                Date = existingAttendance.Date.ToString("yyyy-MM-dd"),
                CheckInTime = existingAttendance.CheckInTime?.AddHours(5).AddMinutes(30).ToString("hh:mm tt"),
                CheckOutTime = existingAttendance.CheckOutTime?.AddHours(5).AddMinutes(30).ToString("hh:mm tt"),
                Status = existingAttendance.Status,
                WorkHours = existingAttendance.WorkHours,
                Location = existingAttendance.Location,
                Notes = existingAttendance.Notes
            };
        }

        public async Task<AttendanceDto> CheckOut(long employeeId, CheckOutRequest request)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Get employee and tenantId
            var employee = await _context.Employees.FindAsync(employeeId);
            var tenantId = employee?.TenantId ?? 0;

            // Check if today is a holiday for the tenant (global or branch-specific)
            var todayDateTimeUtc = DateTime.SpecifyKind(today.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var branchId = employee?.BranchId;
            bool isHoliday = await _context.Holidays.AnyAsync(h =>
                h.TenantId == tenantId &&
                h.Date == todayDateTimeUtc &&
                (
                    h.BranchId == null || // Global holiday
                    (branchId != null && h.BranchId == branchId) // Branch-specific holiday
                )
            );
            if (isHoliday)
            {
                throw new InvalidOperationException("Check-out is not allowed on a holiday.");
            }

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
            attendance.CheckOutTime = now.AddHours(5).AddMinutes(30);

            // Calculate work hours
            if (attendance.CheckInTime.HasValue)
            {
                var workDuration = now.AddHours(5).AddMinutes(30) - attendance.CheckInTime.Value;
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

        public async Task<List<AttendanceDto>> GetAttendanceHistory(long employeeId, int days = 5)
        {
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-(days)));
            var endDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

            // Get employee and tenantId
            var employee = await _context.Employees.FindAsync(employeeId);
            var tenantId = employee?.TenantId ?? 0;

            // Get all holidays for the tenant in the range (global or branch-specific)
            var startDateTimeUtc = DateTime.SpecifyKind(startDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var endDateTimeUtc = DateTime.SpecifyKind(endDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var branchId = employee?.BranchId;
            var holidays = await _context.Holidays
                .Where(h =>
                    h.TenantId == tenantId &&
                    h.Date >= startDateTimeUtc && h.Date <= endDateTimeUtc &&
                    (
                        h.BranchId == null || // Global holiday
                        (branchId != null && h.BranchId == branchId) // Branch-specific holiday
                    )
                )
                .Select(h => DateOnly.FromDateTime(h.Date))
                .ToListAsync();

            // Get all attendance records in range
            var attendanceDict = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date >= startDate && a.Date <= endDate)
                .ToDictionaryAsync(a => a.Date);

            // Get all approved leave requests for this employee in the range
            var approvedLeaves = await _context.LeaveRequests
                .Where(lr => lr.EmployeeId == employeeId && lr.Status == "Approved" &&
                    lr.StartDate <= endDate && lr.EndDate >= startDate)
                .ToListAsync();

            // Build a set of all leave dates
            var leaveDates = new HashSet<DateOnly>();
            foreach (var leave in approvedLeaves)
            {
                var leaveStart = leave.StartDate < startDate ? startDate : leave.StartDate;
                var leaveEnd = leave.EndDate > endDate ? endDate : leave.EndDate;
                for (var d = leaveStart; d <= leaveEnd; d = d.AddDays(1))
                {
                    leaveDates.Add(d);
                }
            }

            var result = new List<AttendanceDto>();
            for (var date = endDate; date >= startDate; date = date.AddDays(-1))
            {
                if (holidays.Contains(date))
                {
                    result.Add(new AttendanceDto
                    {
                        Id = 0,
                        Date = date.ToString("yyyy-MM-dd"),
                        Status = "Holiday",
                        WorkHours = 0,
                        CheckInTime = null,
                        CheckOutTime = null,
                        Location = null,
                        Notes = null,
                        ProductivityRating = null
                    });
                    continue;
                }

                if (attendanceDict.TryGetValue(date, out var attendance))
                {
                    result.Add(new AttendanceDto
                    {
                        Id = attendance.Id,
                        Date = attendance.Date.ToString("yyyy-MM-dd"),
                        CheckInTime = attendance.CheckInTime.HasValue ? attendance.CheckInTime.Value.ToString("hh:mm tt") : null,
                        CheckOutTime = attendance.CheckOutTime.HasValue ? attendance.CheckOutTime.Value.ToString("hh:mm tt") : null,
                        Status = attendance.Status,
                        WorkHours = attendance.WorkHours,
                        Location = attendance.Location,
                        Notes = attendance.Notes,
                        ProductivityRating = attendance.ProductivityRating
                    });
                }
                else if (leaveDates.Contains(date))
                {
                    result.Add(new AttendanceDto
                    {
                        Id = 0,
                        Date = date.ToString("yyyy-MM-dd"),
                        Status = "Leave",
                        WorkHours = 0,
                        CheckInTime = null,
                        CheckOutTime = null,
                        Location = null,
                        Notes = null,
                        ProductivityRating = null
                    });
                }
                else
                {
                    result.Add(new AttendanceDto
                    {
                        Id = 0,
                        Date = date.ToString("yyyy-MM-dd"),
                        Status = "Absent",
                        WorkHours = 0,
                        CheckInTime = null,
                        CheckOutTime = null,
                        Location = null,
                        Notes = null,
                        ProductivityRating = null
                    });
                }
            }

            return result;
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
            // Get check-in and check-out settings for tenant (default 9:00 AM and 18:00 PM if not set)
            TimeSpan standardCheckIn = new TimeSpan(9, 0, 0);
            TimeSpan standardCheckOut = new TimeSpan(18, 0, 0);
            var checkInSetting = await _context.Settings.FirstOrDefaultAsync(s => s.TenantId == employee.TenantId && s.Key == "checkIn");
            if (checkInSetting != null && TimeSpan.TryParse(checkInSetting.Value, out var parsedCheckIn))
                standardCheckIn = parsedCheckIn;
            var checkOutSetting = await _context.Settings.FirstOrDefaultAsync(s => s.TenantId == employee.TenantId && s.Key == "checkOut");
            if (checkOutSetting != null && TimeSpan.TryParse(checkOutSetting.Value, out var parsedCheckOut))
                standardCheckOut = parsedCheckOut;

            // Set check-in and check-out time based on config
            var localCheckIn = new DateTime(dateObj.Year, dateObj.Month, dateObj.Day, standardCheckIn.Hours, standardCheckIn.Minutes, 0, DateTimeKind.Local);
            var checkInDateTime = localCheckIn.ToUniversalTime();
            var localCheckOut = new DateTime(dateObj.Year, dateObj.Month, dateObj.Day, standardCheckOut.Hours, standardCheckOut.Minutes, 0, DateTimeKind.Local);
            var checkOutDateTime = localCheckOut.ToUniversalTime();
            if (attendance == null)
            {
                attendance = new Attendance
                {
                    TenantId = employee.TenantId,
                    EmployeeId = employee.Id,
                    Date = dateObj,
                    Status = "Present", // Force status to Present
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
                attendance.Status = "Present"; // Force status to Present
                attendance.WorkHours = workHours;
                attendance.CheckInTime = checkInDateTime.AddHours(5).AddMinutes(30);
                attendance.CheckOutTime = checkOutDateTime.AddHours(5).AddMinutes(30);
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
        public async Task<AttendanceDto> UpdateProductivityRating(long employeeId, int rating)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Get employee and tenantId
            var employee = await _context.Employees.FindAsync(employeeId);
            var tenantId = employee?.TenantId ?? 0;

            // Check if today is a holiday for the tenant (global or branch-specific)
            var todayDateTimeUtc = DateTime.SpecifyKind(today.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var branchId = employee?.BranchId;
            bool isHoliday = await _context.Holidays.AnyAsync(h =>
                h.TenantId == tenantId &&
                h.Date == todayDateTimeUtc &&
                (
                    h.BranchId == null || // Global holiday
                    (branchId != null && h.BranchId == branchId) // Branch-specific holiday
                )
            );
            if (isHoliday)
            {
                throw new InvalidOperationException("Productivity rating cannot be submitted on a holiday.");
            }

            var attendance = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date == today)
                .FirstOrDefaultAsync();
            if (attendance == null)
            {
                throw new InvalidOperationException("Please mark your attendance before submitting the rating.");
            }
            attendance.ProductivityRating = rating;
            attendance.UpdatedAt = DateTime.UtcNow;
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
                Notes = attendance.Notes,
                ProductivityRating = attendance.ProductivityRating
            };
        }
    }
}