using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace BankAPI.Services.Admin
{
    public class AdminAttendanceService
    {
        private readonly ApplicationDbContext _context;

        public AdminAttendanceService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get daily attendance for all employees or filtered by parameters
        /// </summary>
        public async Task<List<DailyAttendanceDto>> GetDailyAttendance(DailyAttendanceRequest request)
        {
            // Parse date or use today
            var targetDate = string.IsNullOrEmpty(request.Date)
                ? DateOnly.FromDateTime(DateTime.UtcNow)
                : DateOnly.Parse(request.Date);

            // Start with employees filtered by tenant
            var query = _context.Employees
                .Include(e => e.Branch)
                .Where(e => e.TenantId == request.TenantId && e.Status == "Active");

            // Apply branch filter
            if (!string.IsNullOrEmpty(request.Branch))
            {
                query = query.Where(e => e.Branch != null && e.Branch.Name == request.Branch);
            }

            // Apply department filter
            if (!string.IsNullOrEmpty(request.Department))
            {
                query = query.Where(e => e.Department == request.Department);
            }

            // Apply employee filter
            if (!string.IsNullOrEmpty(request.EmployeeId))
            {
                query = query.Where(e => e.EmployeeId == request.EmployeeId);
            }

            var employees = await query.ToListAsync();

            // Get attendance records for the target date
            var attendances = await _context.Attendances
                .Where(a => a.Date == targetDate)
                .ToDictionaryAsync(a => a.EmployeeId, a => a);

            // Get worklogs for the target date
            var workLogs = await _context.WorkLogs
                .Where(w => w.Date == targetDate)
                .ToDictionaryAsync(w => w.EmployeeId, w => w);

            // Build the result
            var result = employees.Select(emp =>
            {
                var attendance = attendances.GetValueOrDefault(emp.Id);
                var workLog = workLogs.GetValueOrDefault(emp.Id);

                string status = "absent";
                if (attendance != null && attendance.CheckInTime.HasValue)
                {
                    // Check if late (assuming 9:00 AM as standard time)
                    var checkInTime = attendance.CheckInTime.Value;
                    var standardTime = new DateTime(checkInTime.Year, checkInTime.Month, checkInTime.Day, 9, 0, 0);

                    if (checkInTime > standardTime.AddMinutes(15))
                    {
                        status = "late";
                    }
                    else
                    {
                        status = "present";
                    }
                }

                string? notes = null;
                if (workLog != null)
                {
                    var taskPart = workLog.TaskName;
                    var descPart = !string.IsNullOrEmpty(workLog.Description) ? workLog.Description : "";
                    var hoursPart = $"{workLog.Hours}h";

                    if (!string.IsNullOrEmpty(descPart))
                    {
                        notes = $"Task: {taskPart} - {descPart} ({hoursPart})";
                    }
                    else
                    {
                        notes = $"Task: {taskPart} ({hoursPart})";
                    }
                }

                return new DailyAttendanceDto
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
                    Date = targetDate.ToString("yyyy-MM-dd"),
                    ProductivityRating = attendance?.ProductivityRating
                };
            }).ToList();

            return result;
        }

        /// <summary>
        /// Get monthly attendance summary for all employees or filtered by parameters
        /// </summary>
        public async Task<MonthlyAttendanceResponse> GetMonthlyAttendance(MonthlyAttendanceRequest request)
        {
            // Parse month or use current month
            DateTime targetMonth;
            if (string.IsNullOrEmpty(request.Month))
            {
                targetMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            }
            else
            {
                var parts = request.Month.Split('-');
                targetMonth = new DateTime(int.Parse(parts[0]), int.Parse(parts[1]), 1);
            }

            var startDate = DateOnly.FromDateTime(targetMonth);
            var endDate = DateOnly.FromDateTime(targetMonth.AddMonths(1).AddDays(-1));

            // Calculate total working days up to today if current month, otherwise full month
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var lastDayToCount = endDate;

            // If the requested month is the current month, only count up to today
            if (targetMonth.Year == DateTime.UtcNow.Year && targetMonth.Month == DateTime.UtcNow.Month)
            {
                lastDayToCount = today;
            }

            long tenantId = request.TenantId;

            // Check if organization works on weekends
            var noWeekendsSetting = await _context.Settings
                .FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Key == "No weekends" && s.Value.ToLower() == "true");
            bool includeWeekends = noWeekendsSetting != null;

            // Calculate total working days (excluding weekends unless setting says otherwise)
            int totalWorkingDays = 0;
            for (var date = startDate; date <= lastDayToCount; date = date.AddDays(1))
            {
                if (includeWeekends)
                {
                    // Count all days if no weekends setting is enabled
                    totalWorkingDays++;
                }
                else
                {
                    // Exclude weekends
                    var dayOfWeek = date.DayOfWeek;
                    if (dayOfWeek != DayOfWeek.Saturday && dayOfWeek != DayOfWeek.Sunday)
                    {
                        totalWorkingDays++;
                    }
                }
            }

            // Start with employees filtered by tenant
            var query = _context.Employees
                .Include(e => e.Branch)
                .Where(e => e.TenantId == tenantId && e.Status == "Active");

            // Apply branch filter
            if (!string.IsNullOrEmpty(request.Branch))
            {
                query = query.Where(e => e.Branch != null && e.Branch.Name == request.Branch);
            }

            // Apply department filter
            if (!string.IsNullOrEmpty(request.Department))
            {
                query = query.Where(e => e.Department == request.Department);
            }

            // Apply employee filter
            if (!string.IsNullOrEmpty(request.EmployeeId))
            {
                query = query.Where(e => e.EmployeeId == request.EmployeeId);
            }

            var employees = await query.ToListAsync();

            // Get all attendance records for the month (up to today if current month) - filtered by tenant
            var attendances = await _context.Attendances
                .Where(a => a.TenantId == tenantId && a.Date >= startDate && a.Date <= lastDayToCount)
                .ToListAsync();

            // Group attendances by employee
            var attendancesByEmployee = attendances
                .GroupBy(a => a.EmployeeId)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Calculate monthly summary for each employee
            var result = employees.Select(emp =>
            {
                var empAttendances = attendancesByEmployee.GetValueOrDefault(emp.Id, new List<Attendance>());

                int presentDays = 0;
                int lateDays = 0;
                decimal totalHours = 0;

                foreach (var att in empAttendances)
                {
                    if (att.CheckInTime.HasValue)
                    {
                        // Check if late
                        var checkInTime = att.CheckInTime.Value;
                        var standardTime = new DateTime(checkInTime.Year, checkInTime.Month, checkInTime.Day, 9, 0, 0);

                        if (checkInTime > standardTime.AddMinutes(15))
                        {
                            lateDays++;
                        }
                        else
                        {
                            presentDays++;
                        }

                        if (att.WorkHours.HasValue)
                        {
                            totalHours += att.WorkHours.Value;
                        }
                    }
                }

                int absentDays = totalWorkingDays - presentDays - lateDays;
                decimal avgHours = (presentDays + lateDays) > 0 ? totalHours / (presentDays + lateDays) : 0;
                decimal attendancePercentage = totalWorkingDays > 0
                    ? Math.Round((decimal)(presentDays + lateDays) / totalWorkingDays * 100, 1)
                    : 0;

                return new MonthlyAttendanceDto
                {
                    EmployeeId = emp.EmployeeId,
                    EmployeeName = emp.FullName,
                    Department = emp.Department,
                    Branch = emp.Branch?.Name,
                    TotalDays = totalWorkingDays,
                    PresentDays = presentDays,
                    LateDays = lateDays,
                    AbsentDays = absentDays,
                    AvgHours = Math.Round(avgHours, 1),
                    AttendancePercentage = attendancePercentage
                };
            }).ToList();

            return new MonthlyAttendanceResponse
            {
                Data = result,
                IncludeWeekends = includeWeekends
            };
        }

        /// <summary>
        /// Get attendance details for a specific employee
        /// </summary>
        public async Task<object> GetEmployeeAttendanceDetails(string employeeId, int days = 30)
        {
            var employee = await _context.Employees
                .Include(e => e.Branch)
                .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);

            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));

            var attendances = await _context.Attendances
                .Where(a => a.EmployeeId == employee.Id && a.Date >= startDate)
                .OrderByDescending(a => a.Date)
                .Select(a => new
                {
                    Date = a.Date.ToString("yyyy-MM-dd"),
                    CheckInTime = a.CheckInTime.HasValue ? a.CheckInTime.Value.ToString("hh:mm tt") : null,
                    CheckOutTime = a.CheckOutTime.HasValue ? a.CheckOutTime.Value.ToString("hh:mm tt") : null,
                    Status = a.Status,
                    WorkHours = a.WorkHours,
                    Location = a.Location,
                    Notes = a.Notes,
                    ProductivityRating = a.ProductivityRating
                })
                .ToListAsync();

            return new
            {
                Employee = new
                {
                    employee.EmployeeId,
                    employee.FullName,
                    employee.Department,
                    Branch = employee.Branch?.Name,
                    employee.Email,
                    employee.Phone
                },
                Attendances = attendances
            };
        }

        public async Task<(bool Success, string? Message)> DeclareHolidayAsync(DeclareHolidayDto dto)
        {
            // Improved duplicate check:
            bool exists;
            if (dto.BranchId == null)
            {
                // Declaring for all branches: block if any holiday exists for this tenant/date (any branch)
                exists = await _context.Holidays.AnyAsync(h => h.TenantId == dto.TenantId && h.Date == dto.Date.Date);
                if (exists)
                    return (false, "Holiday already declared for this date (all branches or a specific branch).");
            }
            else
            {
                // Declaring for a specific branch: block if a holiday exists for this tenant/date for this branch or for all branches
                exists = await _context.Holidays.AnyAsync(h => h.TenantId == dto.TenantId && h.Date == dto.Date.Date && (h.BranchId == null || h.BranchId == dto.BranchId));
                if (exists)
                    return (false, "Holiday already declared for this date (all branches or this branch).");
            }


            var holiday = new BankAPI.Models.Holiday
            {
                TenantId = dto.TenantId,
                BranchId = dto.BranchId,
                Date = dto.Date.Date,
                Name = dto.Name,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Holidays.Add(holiday);
            await _context.SaveChangesAsync();
            return (true, null);
        }

        /// <summary>
        /// Get holidays for a tenant and (optionally) a branch
        /// </summary>
        public async Task<List<HolidayDto>> GetHolidaysAsync(long tenantId, long? branchId = null, string? month = null)
        {
            var query = _context.Holidays.AsQueryable();
            query = query.Where(h => h.TenantId == tenantId);
            if (branchId.HasValue)
            {
                // Get holidays for this branch or for all branches (branchId == null)
                query = query.Where(h => h.BranchId == null || h.BranchId == branchId);
            }
            if (!string.IsNullOrEmpty(month))
            {
                // month format: "YYYY-MM"
                if (DateTime.TryParseExact(month + "-01", "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.AssumeUniversal | System.Globalization.DateTimeStyles.AdjustToUniversal, out var firstDay))
                {
                    firstDay = DateTime.SpecifyKind(firstDay, DateTimeKind.Utc);
                    var lastDay = firstDay.AddMonths(1).AddDays(-1);
                    lastDay = DateTime.SpecifyKind(lastDay, DateTimeKind.Utc);
                    query = query.Where(h => h.Date >= firstDay && h.Date <= lastDay);
                }
            }
            var holidays = await query.ToListAsync();
            return holidays.Select(h => new HolidayDto
            {
                HolidayId = (int)h.Id,
                TenantId = (int)h.TenantId,
                BranchId = (int?)h.BranchId,
                Date = h.Date,
                Name = h.Name,
                CreatedAt = h.CreatedAt
            }).ToList();
        }

        /// <summary>
        /// Get holidays for a specific month and optional branch
        /// </summary>
        public async Task<HolidayCalendarDto> GetHolidaysByBranchNameAsync(int year, int month, int tenantId, int? branchId = null)
        {
            // // Ensure dates are UTC
            var startDate = DateTime.SpecifyKind(new DateTime(year, month, 1), DateTimeKind.Utc);
            var endDate = DateTime.SpecifyKind(startDate.Date.AddMonths(1), DateTimeKind.Utc);
            // var startDate = new DateTime(year, month, 1);
            // var startDate = new DateTime(year, month, 1);
            // var endDate = startDate.AddMonths(1);

            var query = _context.Holidays
                .Include(h => h.Branch)
                .Include(h => h.CreatedByEmployee)
                .Where(h => h.TenantId == tenantId &&
                           h.Date >= startDate &&
                           h.Date < endDate);

            // Apply branch filter
            if (branchId.HasValue)
            {
                query = query.Where(h => h.BranchId == branchId || h.BranchId == null);
            }
            else
            {
                query = query.Where(h => h.BranchId == null);
            }

            var holidays = await query.OrderBy(h => h.Date).ToListAsync();

            var result = new HolidayCalendarDto
            {
                Year = year,
                Month = month,
                MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),
                Holidays = holidays.Select(h => new HolidayDto
                {
                    HolidayId = (int)h.Id,
                    Date = h.Date,
                    Name = h.Name,
                    Description = h.Description,
                    BranchId = (int?)h.BranchId,
                    BranchName = h.Branch?.Name,
                    TenantId = (int)h.TenantId,
                    CreatedBy = (int?)h.CreatedBy,
                    CreatedByName = h.CreatedByEmployee?.FullName,
                    CreatedAt = h.CreatedAt
                }).ToList()
            };

            return result;
        }

        /// <summary>
        /// Create a new holiday
        /// </summary>
        public async Task<HolidayDto> CreateHolidayAsync(CreateHolidayDto createHolidayDto, int tenantId, int createdBy)
        {
            // Ensure date is UTC
            var utcDate = DateTime.SpecifyKind(createHolidayDto.Date.Date, DateTimeKind.Utc);

            // Check if holiday already exists for this date, branch, and tenant
            var existingHoliday = await _context.Holidays
                .FirstOrDefaultAsync(h => h.Date.Date == utcDate &&
                                        h.BranchId == createHolidayDto.BranchId &&
                                        h.TenantId == tenantId);

            if (existingHoliday != null)
            {
                throw new InvalidOperationException("A holiday already exists for this date and branch.");
            }

            var holiday = new Holiday
            {
                Date = utcDate,
                Name = createHolidayDto.Name,
                Description = createHolidayDto.Description,
                BranchId = createHolidayDto.BranchId,
                TenantId = tenantId,
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Holidays.Add(holiday);
            await _context.SaveChangesAsync();

            // Fetch the created holiday with related data
            var createdHoliday = await _context.Holidays
                .Include(h => h.Branch)
                .Include(h => h.CreatedByEmployee)
                .FirstAsync(h => h.Id == holiday.Id);

            return new HolidayDto
            {
                HolidayId = (int)createdHoliday.Id,
                Date = createdHoliday.Date,
                Name = createdHoliday.Name,
                Description = createdHoliday.Description,
                BranchId = (int?)createdHoliday.BranchId,
                BranchName = createdHoliday.Branch?.Name,
                TenantId = (int)createdHoliday.TenantId,
                CreatedBy = (int?)createdHoliday.CreatedBy,
                CreatedByName = createdHoliday.CreatedByEmployee?.FullName,
                CreatedAt = createdHoliday.CreatedAt
            };
        }

        /// <summary>
        /// Delete a holiday
        /// </summary>
        public async Task<bool> DeleteHolidayAsync(int holidayId, int tenantId)
        {
            var holiday = await _context.Holidays
                .FirstOrDefaultAsync(h => h.Id == holidayId && h.TenantId == tenantId);

            if (holiday == null)
                return false;

            _context.Holidays.Remove(holiday);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Get holidays for a date range
        /// </summary>
        public async Task<List<HolidayDto>> GetHolidaysForDateRangeAsync(DateTime startDate, DateTime endDate, int tenantId, int? branchId = null)
        {
            // Ensure dates are UTC
            var utcStartDate = DateTime.SpecifyKind(startDate.Date, DateTimeKind.Utc);
            var utcEndDate = DateTime.SpecifyKind(endDate.Date, DateTimeKind.Utc);

            var query = _context.Holidays
                .Include(h => h.Branch)
                .Include(h => h.CreatedByEmployee)
                .Where(h => h.TenantId == tenantId &&
                           h.Date >= utcStartDate &&
                           h.Date <= utcEndDate);

            if (branchId.HasValue)
            {
                query = query.Where(h => h.BranchId == branchId || h.BranchId == null);
            }

            var holidays = await query.OrderBy(h => h.Date).ToListAsync();

            return holidays.Select(h => new HolidayDto
            {
                HolidayId = (int)h.Id,
                Date = h.Date,
                Name = h.Name,
                Description = h.Description,
                BranchId = (int?)h.BranchId,
                BranchName = h.Branch?.Name,
                TenantId = (int)h.TenantId,
                CreatedBy = (int?)h.CreatedBy,
                CreatedByName = h.CreatedByEmployee?.FullName,
                CreatedAt = h.CreatedAt
            }).ToList();
        }
    }
}