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

            // Get holidays for the target date (global and branch-specific)
            var holidayDate = DateTime.SpecifyKind(targetDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var holidaysForDate = await _context.Holidays
                .Where(h => h.TenantId == request.TenantId && h.Date.Date == holidayDate.Date)
                .ToListAsync();

            // Get approved leave requests for the target date
            var leaveRequests = await _context.LeaveRequests
                .Where(lr => lr.Status == "Approved" && lr.StartDate <= targetDate && lr.EndDate >= targetDate)
                .ToListAsync();

            // Build the result
            var result = employees.Select(emp =>
            {
                var attendance = attendances.GetValueOrDefault(emp.Id);
                var workLog = workLogs.GetValueOrDefault(emp.Id);

                string status = "absent";

                // Check if today is a holiday for this employee (global or their branch)
                bool empHoliday = holidaysForDate.Any(h => h.BranchId == null || (emp.BranchId != null && h.BranchId == emp.BranchId));

                if (empHoliday)
                {
                    status = "Holiday";
                }
                else
                {
                    // Check if employee is on approved leave for this date
                    bool onLeave = leaveRequests.Any(lr => lr.EmployeeId == emp.Id);
                    if (onLeave)
                    {
                        status = "Leave";
                    }
                    else if (attendance != null && !string.IsNullOrEmpty(attendance.Status))
                    {
                        // Use status from DB (e.g., "Present", "Late")
                        status = attendance.Status;
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

            // Calculate total working days by excluding holidays (global and branch-specific)
            // Get all holidays for the tenant and (optionally) branch in the date range
            // Ensure all DateTime values are UTC for PostgreSQL compatibility
            var holidayStartDate = DateTime.SpecifyKind(startDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var holidayEndDate = DateTime.SpecifyKind(lastDayToCount.ToDateTime(TimeOnly.MaxValue), DateTimeKind.Utc);
            var holidayQuery = _context.Holidays.Where(h => h.TenantId == tenantId && h.Date >= holidayStartDate && h.Date <= holidayEndDate);
            if (!string.IsNullOrEmpty(request.Branch))
            {
                // Find branchId for the branch name
                var branch = await _context.Branches.FirstOrDefaultAsync(b => b.Name == request.Branch && b.TenantId == tenantId);
                if (branch != null)
                {
                    var branchId = branch.Id;
                    // Holidays for this branch or global holidays
                    holidayQuery = holidayQuery.Where(h => h.BranchId == null || h.BranchId == branchId);
                }
            }
            else
            {
                // Only global holidays (BranchId == null)
                holidayQuery = holidayQuery.Where(h => h.BranchId == null);
            }
            var holidays = await holidayQuery.ToListAsync();
            var holidayDates = new HashSet<DateOnly>(holidays.Select(h => DateOnly.FromDateTime(h.Date)));

            int totalWorkingDays = 0;
            for (var date = startDate; date <= lastDayToCount; date = date.AddDays(1))
            {
                if (!holidayDates.Contains(date))
                {
                    totalWorkingDays++;
                }
            }
            // For compatibility, set includeWeekends to true (all days are considered, but holidays are excluded)
            bool includeWeekends = true;

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

            // Pre-fetch all approved leave requests for the month for all employees
            var leaveRequests = await _context.LeaveRequests
                .Where(lr => lr.Status == "Approved" && lr.StartDate <= lastDayToCount && lr.EndDate >= startDate)
                .ToListAsync();

            var result = employees.Select(emp =>
            {
                var empAttendances = attendancesByEmployee.GetValueOrDefault(emp.Id, new List<Attendance>());

                // Count Present and Late days directly from attendance.Status
                int presentDays = empAttendances.Count(a => a.Status == "Present");
                int lateDays = empAttendances.Count(a => a.Status == "Late");
                decimal totalHours = empAttendances.Where(a => a.Status == "Present" || a.Status == "Late").Sum(a => a.WorkHours ?? 0);

                // Calculate leave taken (approved leaves, excluding holidays)
                var empLeaves = leaveRequests.Where(lr => lr.EmployeeId == emp.Id);
                int leaveTaken = 0;
                foreach (var lr in empLeaves)
                {
                    var leaveStart = lr.StartDate < startDate ? startDate : lr.StartDate;
                    var leaveEnd = lr.EndDate > lastDayToCount ? lastDayToCount : lr.EndDate;
                    for (var d = leaveStart; d <= leaveEnd; d = d.AddDays(1))
                    {
                        if (!holidayDates.Contains(d))
                        {
                            leaveTaken++;
                        }
                    }
                }

                int absentDays = totalWorkingDays - presentDays - lateDays - leaveTaken;
                decimal avgHours = (presentDays + lateDays) > 0 ? totalHours / (presentDays + lateDays) : 0;
                decimal attendancePercentage = totalWorkingDays > 0
                    ? Math.Round((decimal)(presentDays + lateDays) / totalWorkingDays * 100, 1)
                    : 0;

                return new MonthlyAttendanceDto
                {
                    EmployeeId = emp.EmployeeId,
                    EmployeeName = emp.FullName,
                    Branch = emp.Branch?.Name,
                    TotalDays = totalWorkingDays,
                    PresentDays = presentDays,
                    LateDays = lateDays,
                    AbsentDays = absentDays,
                    LeaveTaken = leaveTaken,
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
        /// Get attendance details for a specific employee for a specific month
        /// </summary>
        public async Task<object> GetEmployeeAttendanceDetails(string employeeId, EmployeeAttendanceRequest request)
        {
            var employee = await _context.Employees
                .Include(e => e.Branch)
                .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);

            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            // Parse month from YYYY-MM format
            var parts = request.Month.Split('-');
            if (parts.Length != 2 || !int.TryParse(parts[0], out int year) || !int.TryParse(parts[1], out int month))
            {
                throw new Exception("Invalid month format. Expected YYYY-MM");
            }

            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            // Fetch all attendances for the employee in the month
            var attendancesRaw = await _context.Attendances
                .Where(a => a.EmployeeId == employee.Id && a.Date >= startDate && a.Date <= endDate)
                .ToListAsync();

            // Get all holidays for the employee's tenant and branch in the month
            var branchId = employee.BranchId;
            var startDateTime = DateTime.SpecifyKind(startDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var endDateTime = DateTime.SpecifyKind(endDate.ToDateTime(TimeOnly.MaxValue), DateTimeKind.Utc);
            var holidays = await _context.Holidays
                .Where(h => h.TenantId == employee.TenantId && h.Date >= startDateTime && h.Date <= endDateTime && (h.BranchId == null || (branchId != null && h.BranchId == branchId)))
                .ToListAsync();

            // Get all approved leave requests for the employee in the month
            var leaveRequests = await _context.LeaveRequests
                .Where(lr => lr.EmployeeId == employee.Id && lr.Status == "Approved" && lr.StartDate <= endDate && lr.EndDate >= startDate)
                .ToListAsync();

            // Build attendance list for each day in the month (chronological order)
            var attendances = new List<object>();
            for (var d = startDate; d <= endDate; d = d.AddDays(1))
            {
                var attendance = attendancesRaw.FirstOrDefault(a => a.Date == d);
                var holiday = holidays.FirstOrDefault(h => h.Date.Date == DateTime.SpecifyKind(d.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc).Date && (h.BranchId == null || (branchId != null && h.BranchId == branchId)));
                var onLeave = leaveRequests.Any(lr => lr.StartDate <= d && lr.EndDate >= d);

                string status = null;
                if (holiday != null)
                {
                    status = "Holiday";
                }
                else if (onLeave)
                {
                    status = "Leave";
                }
                else if (attendance != null && !string.IsNullOrEmpty(attendance.Status))
                {
                    status = attendance.Status;
                }

                // Only add if status is not null (i.e., not Absent)
                if (!string.IsNullOrEmpty(status))
                {
                    attendances.Add(new
                    {
                        Date = d.ToString("yyyy-MM-dd"),
                        CheckInTime = attendance?.CheckInTime.HasValue == true ? attendance.CheckInTime.Value.ToString("hh:mm tt") : null,
                        CheckOutTime = attendance?.CheckOutTime.HasValue == true ? attendance.CheckOutTime.Value.ToString("hh:mm tt") : null,
                        Status = status,
                        WorkHours = attendance?.WorkHours,
                        Location = attendance?.Location,
                        Notes = attendance?.Notes,
                        ProductivityRating = attendance?.ProductivityRating
                    });
                }
            }

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
                Month = request.Month,
                StartDate = startDate.ToString("yyyy-MM-dd"),
                EndDate = endDate.ToString("yyyy-MM-dd"),
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