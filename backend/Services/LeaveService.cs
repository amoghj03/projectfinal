using Microsoft.EntityFrameworkCore;
using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;

namespace BankAPI.Services;

public interface ILeaveService
{
    Task<LeaveRequestResponse> SubmitLeaveRequestAsync(long employeeId, SubmitLeaveRequest request);
    Task<LeaveRequestsResponse> GetLeaveRequestsAsync(long employeeId);
    Task<LeaveBalanceResponse> GetLeaveBalanceAsync(long employeeId);
    Task<LeaveRequestResponse> GetLeaveRequestByIdAsync(long employeeId, long leaveRequestId);
}

public class LeaveService : ILeaveService
{
    private readonly ApplicationDbContext _context;

    public LeaveService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LeaveRequestResponse> SubmitLeaveRequestAsync(long employeeId, SubmitLeaveRequest request)
    {
        try
        {
            // Validate employee
            var employee = await _context.Employees
                .Include(e => e.Branch)
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null)
            {
                return new LeaveRequestResponse
                {
                    Success = false,
                    Message = "Employee not found."
                };
            }

            // Validate dates
            if (!DateTime.TryParse(request.StartDate, out var startDate) ||
                !DateTime.TryParse(request.EndDate, out var endDate))
            {
                return new LeaveRequestResponse
                {
                    Success = false,
                    Message = "Invalid date format."
                };
            }

            if (startDate > endDate)
            {
                return new LeaveRequestResponse
                {
                    Success = false,
                    Message = "Start date cannot be after end date."
                };
            }

            // Find leave type
            var leaveType = await _context.LeaveTypes
                .FirstOrDefaultAsync(lt => lt.Name == request.LeaveType &&
                                          lt.TenantId == employee.TenantId &&
                                          lt.IsActive);

            if (leaveType == null)
            {
                return new LeaveRequestResponse
                {
                    Success = false,
                    Message = "Invalid leave type."
                };
            }

            // Check if any date in the range is a holiday
            var startDateOnly = DateOnly.FromDateTime(startDate);
            var endDateOnly = DateOnly.FromDateTime(endDate);
            var holidays = await _context.Holidays
                .Where(h => h.TenantId == employee.TenantId && h.Date >= DateTime.SpecifyKind(startDateOnly.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc) && h.Date <= DateTime.SpecifyKind(endDateOnly.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc))
                .ToListAsync();
            if (holidays.Any())
            {
                return new LeaveRequestResponse
                {
                    Success = false,
                    Message = "Cannot submit leave request: one or more days in the requested range are holidays."
                };
            }

            // Calculate days
            decimal totalDays;
            if (request.IsHalfDay)
            {
                totalDays = 0.5m;
            }
            else
            {
                totalDays = (decimal)(endDate - startDate).TotalDays + 1;
            }

            // Check leave balance
            var currentYear = DateTime.UtcNow.Year;
            var leaveBalance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmployeeId == employeeId &&
                                          lb.LeaveTypeId == leaveType.Id &&
                                          lb.Year == currentYear);

            if (leaveBalance != null)
            {
                var availableLeave = leaveBalance.TotalAllocated - leaveBalance.Used - leaveBalance.Pending;
                if (totalDays > availableLeave)
                {
                    return new LeaveRequestResponse
                    {
                        Success = false,
                        Message = $"Insufficient leave balance. Available: {availableLeave} days, Requested: {totalDays} days."
                    };
                }
            }

            // Create leave request
            var leaveRequest = new LeaveRequest
            {
                TenantId = employee.TenantId,
                EmployeeId = employeeId,
                LeaveTypeId = leaveType.Id,
                StartDate = DateOnly.FromDateTime(startDate),
                EndDate = DateOnly.FromDateTime(endDate),
                TotalDays = totalDays,
                IsHalfDay = request.IsHalfDay,
                HalfDayPeriod = request.HalfDayPeriod,
                Reason = request.Reason,
                Status = "Pending",
                AppliedAt = DateTime.UtcNow
            };

            _context.LeaveRequests.Add(leaveRequest);

            // Update pending balance
            if (leaveBalance != null)
            {
                leaveBalance.Pending += totalDays;
            }

            await _context.SaveChangesAsync();

            // Return created leave request
            var result = MapToDto(leaveRequest, employee, leaveType);

            return new LeaveRequestResponse
            {
                Success = true,
                Message = "Leave request submitted successfully.",
                Data = result
            };
        }
        catch (Exception ex)
        {
            return new LeaveRequestResponse
            {
                Success = false,
                Message = $"An error occurred: {ex.Message}"
            };
        }
    }

    public async Task<LeaveRequestsResponse> GetLeaveRequestsAsync(long employeeId)
    {
        try
        {
            var employee = await _context.Employees
                .Include(e => e.Branch)
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null)
            {
                return new LeaveRequestsResponse
                {
                    Success = false,
                    Message = "Employee not found."
                };
            }

            var leaveRequests = await _context.LeaveRequests
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ReviewedByEmployee)
                .Where(lr => lr.EmployeeId == employeeId)
                .OrderByDescending(lr => lr.AppliedAt)
                .ToListAsync();

            var result = leaveRequests.Select(lr => MapToDto(lr, employee, lr.LeaveType)).ToList();

            return new LeaveRequestsResponse
            {
                Success = true,
                Message = "Leave requests retrieved successfully.",
                Data = result
            };
        }
        catch (Exception ex)
        {
            return new LeaveRequestsResponse
            {
                Success = false,
                Message = $"An error occurred: {ex.Message}"
            };
        }
    }

    public async Task<LeaveBalanceResponse> GetLeaveBalanceAsync(long employeeId)
    {
        try
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null)
            {
                return new LeaveBalanceResponse
                {
                    Success = false,
                    Message = "Employee not found."
                };
            }

            var currentYear = DateTime.UtcNow.Year;
            var leaveBalances = await _context.LeaveBalances
                .Include(lb => lb.LeaveType)
                .Where(lb => lb.EmployeeId == employeeId && lb.Year == currentYear)
                .ToListAsync();

            var detailedBalances = leaveBalances.Select(lb => new LeaveBalanceDto
            {
                LeaveType = lb.LeaveType.Name,
                TotalAllocated = lb.TotalAllocated,
                Used = lb.Used,
                Pending = lb.Pending,
                Available = lb.TotalAllocated - lb.Used - lb.Pending
            }).ToList();

            var casualLeave = leaveBalances.FirstOrDefault(lb => lb.LeaveType.Name == "Casual Leave");
            var sickLeave = leaveBalances.FirstOrDefault(lb => lb.LeaveType.Name == "Sick Leave");
            var annualLeave = leaveBalances.FirstOrDefault(lb => lb.LeaveType.Name == "Annual Leave");

            var summary = new LeaveBalanceSummaryDto
            {
                CasualLeave = casualLeave != null ? (casualLeave.TotalAllocated - casualLeave.Used - casualLeave.Pending) : 0,
                SickLeave = sickLeave != null ? (sickLeave.TotalAllocated - sickLeave.Used - sickLeave.Pending) : 0,
                AnnualLeave = annualLeave != null ? (annualLeave.TotalAllocated - annualLeave.Used - annualLeave.Pending) : 0,
                TotalAvailable = leaveBalances.Sum(lb => lb.TotalAllocated), // Total allocated (doesn't change)
                TotalTaken = leaveBalances.Sum(lb => lb.Used),
                Pending = leaveBalances.Sum(lb => lb.Pending),
                DetailedBalances = detailedBalances
            };

            return new LeaveBalanceResponse
            {
                Success = true,
                Message = "Leave balance retrieved successfully.",
                Data = summary
            };
        }
        catch (Exception ex)
        {
            return new LeaveBalanceResponse
            {
                Success = false,
                Message = $"An error occurred: {ex.Message}"
            };
        }
    }

    public async Task<LeaveRequestResponse> GetLeaveRequestByIdAsync(long employeeId, long leaveRequestId)
    {
        try
        {
            var employee = await _context.Employees
                .Include(e => e.Branch)
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null)
            {
                return new LeaveRequestResponse
                {
                    Success = false,
                    Message = "Employee not found."
                };
            }

            var leaveRequest = await _context.LeaveRequests
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ReviewedByEmployee)
                .FirstOrDefaultAsync(lr => lr.Id == leaveRequestId && lr.EmployeeId == employeeId);

            if (leaveRequest == null)
            {
                return new LeaveRequestResponse
                {
                    Success = false,
                    Message = "Leave request not found."
                };
            }

            var result = MapToDto(leaveRequest, employee, leaveRequest.LeaveType);

            return new LeaveRequestResponse
            {
                Success = true,
                Message = "Leave request retrieved successfully.",
                Data = result
            };
        }
        catch (Exception ex)
        {
            return new LeaveRequestResponse
            {
                Success = false,
                Message = $"An error occurred: {ex.Message}"
            };
        }
    }

    private LeaveRequestDto MapToDto(LeaveRequest lr, Employee employee, LeaveType leaveType)
    {
        return new LeaveRequestDto
        {
            Id = lr.Id,
            EmployeeId = employee.EmployeeId,
            EmployeeName = employee.FullName,
            LeaveType = leaveType.Name,
            StartDate = lr.StartDate.ToString("yyyy-MM-dd"),
            EndDate = lr.EndDate.ToString("yyyy-MM-dd"),
            Days = lr.TotalDays,
            IsHalfDay = lr.IsHalfDay,
            HalfDayPeriod = lr.HalfDayPeriod,
            Reason = lr.Reason,
            Status = lr.Status,
            AppliedDate = lr.AppliedAt.ToString("yyyy-MM-dd"),
            ApprovedBy = lr.Status == "Approved" ? lr.ReviewedByEmployee?.FullName : null,
            ApprovedDate = lr.Status == "Approved" && lr.ReviewedAt.HasValue ? lr.ReviewedAt.Value.ToString("yyyy-MM-dd") : null,
            RejectedBy = lr.Status == "Rejected" ? lr.ReviewedByEmployee?.FullName : null,
            RejectedDate = lr.Status == "Rejected" && lr.ReviewedAt.HasValue ? lr.ReviewedAt.Value.ToString("yyyy-MM-dd") : null,
            RejectionReason = lr.Status == "Rejected" ? lr.ReviewRemarks : null
        };
    }
}
