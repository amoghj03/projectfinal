using Microsoft.EntityFrameworkCore;
using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;

namespace BankAPI.Services.Admin
{
    public class AdminLeaveService
    {
        private readonly ApplicationDbContext _context;

        public AdminLeaveService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all leave requests with optional filtering
        /// </summary>
        public async Task<List<AdminLeaveRequestDto>> GetLeaveRequestsAsync(
            long adminEmployeeId,
            string? branch = null,
            string? status = null,
            string? employeeName = null,
            string? leaveType = null)
        {
            // Verify admin has permission
            var admin = await _context.Employees
                .Include(e => e.Branch)
                .Include(e => e.EmployeeRoles)
                    .ThenInclude(er => er.Role)
                .FirstOrDefaultAsync(e => e.Id == adminEmployeeId);

            if (admin == null)
            {
                throw new UnauthorizedAccessException("Admin not found");
            }

            var isSuperAdmin = admin.EmployeeRoles.Any(er => er.Role.Name == "Super Admin");

            // Start with base query
            var query = _context.LeaveRequests
                .Include(lr => lr.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(lr => lr.Employee)
                    .ThenInclude(e => e.EmployeeRoles)
                        .ThenInclude(er => er.Role)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ReviewedByEmployee)
                .AsQueryable();

            // Filter by branch if not super admin
            if (!isSuperAdmin && !string.IsNullOrEmpty(admin.Branch?.Name))
            {
                query = query.Where(lr => lr.Employee.Branch != null &&
                                         lr.Employee.Branch.Name == admin.Branch.Name);
            }
            else if (!string.IsNullOrEmpty(branch))
            {
                query = query.Where(lr => lr.Employee.Branch != null &&
                                         lr.Employee.Branch.Name == branch);
            }

            // Apply filters
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(lr => lr.Status == status);
            }

            if (!string.IsNullOrEmpty(employeeName))
            {
                query = query.Where(lr =>
                    lr.Employee.FullName.ToLower().Contains(employeeName.ToLower()));
            }

            if (!string.IsNullOrEmpty(leaveType))
            {
                query = query.Where(lr => lr.LeaveType.Name == leaveType);
            }

            // Get results and map to DTO
            var leaveRequests = await query
                .OrderByDescending(lr => lr.CreatedAt)
                .ToListAsync();

            return leaveRequests.Select(lr => new AdminLeaveRequestDto
            {
                Id = lr.Id,
                EmployeeId = $"EMP{lr.EmployeeId:D3}",
                EmployeeName = lr.Employee.FullName,
                Department = lr.Employee.Department ?? "N/A",
                Branch = lr.Employee.Branch?.Name ?? "N/A",
                LeaveType = lr.LeaveType?.Name ?? "Unknown",
                StartDate = lr.StartDate.ToString("yyyy-MM-dd"),
                EndDate = lr.EndDate.ToString("yyyy-MM-dd"),
                Days = lr.TotalDays,
                IsHalfDay = lr.IsHalfDay,
                HalfDayPeriod = lr.HalfDayPeriod,
                Reason = lr.Reason,
                Status = lr.Status,
                AppliedDate = lr.CreatedAt.ToString("yyyy-MM-dd"),
                ApprovedBy = lr.Status == "Approved" && lr.ReviewedByEmployee != null
                    ? lr.ReviewedByEmployee.FullName
                    : null,
                ApprovedDate = lr.Status == "Approved" ? lr.ReviewedAt?.ToString("yyyy-MM-dd") : null,
                ApprovalRemark = lr.Status == "Approved" ? lr.ReviewRemarks : null,
                RejectedBy = lr.Status == "Rejected" && lr.ReviewedByEmployee != null
                    ? lr.ReviewedByEmployee.FullName
                    : null,
                RejectedDate = lr.Status == "Rejected" ? lr.ReviewedAt?.ToString("yyyy-MM-dd") : null,
                RejectionReason = lr.Status == "Rejected" ? lr.ReviewRemarks : null
            }).ToList();
        }

        /// <summary>
        /// Get leave request by ID
        /// </summary>
        public async Task<AdminLeaveRequestDto?> GetLeaveRequestByIdAsync(long adminEmployeeId, long leaveRequestId)
        {
            // Verify admin has permission
            var admin = await _context.Employees
                .Include(e => e.Branch)
                .Include(e => e.EmployeeRoles)
                    .ThenInclude(er => er.Role)
                .FirstOrDefaultAsync(e => e.Id == adminEmployeeId);

            if (admin == null)
            {
                throw new UnauthorizedAccessException("Admin not found");
            }

            var isSuperAdmin = admin.EmployeeRoles.Any(er => er.Role.Name == "Super Admin");

            var leaveRequest = await _context.LeaveRequests
                .Include(lr => lr.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(lr => lr.Employee)
                    .ThenInclude(e => e.EmployeeRoles)
                        .ThenInclude(er => er.Role)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ReviewedByEmployee)
                .FirstOrDefaultAsync(lr => lr.Id == leaveRequestId);

            if (leaveRequest == null)
            {
                return null;
            }

            // Check if admin has access to this leave request's branch
            if (!isSuperAdmin &&
                leaveRequest.Employee.Branch?.Name != admin.Branch?.Name)
            {
                throw new UnauthorizedAccessException("No access to this leave request");
            }

            return new AdminLeaveRequestDto
            {
                Id = leaveRequest.Id,
                EmployeeId = $"EMP{leaveRequest.EmployeeId:D3}",
                EmployeeName = leaveRequest.Employee.FullName,
                Department = leaveRequest.Employee.Department ?? "N/A",
                Branch = leaveRequest.Employee.Branch?.Name ?? "N/A",
                LeaveType = leaveRequest.LeaveType?.Name ?? "Unknown",
                StartDate = leaveRequest.StartDate.ToString("yyyy-MM-dd"),
                EndDate = leaveRequest.EndDate.ToString("yyyy-MM-dd"),
                Days = leaveRequest.TotalDays,
                IsHalfDay = leaveRequest.IsHalfDay,
                HalfDayPeriod = leaveRequest.HalfDayPeriod,
                Reason = leaveRequest.Reason,
                Status = leaveRequest.Status,
                AppliedDate = leaveRequest.CreatedAt.ToString("yyyy-MM-dd"),
                ApprovedBy = leaveRequest.Status == "Approved" && leaveRequest.ReviewedByEmployee != null
                    ? leaveRequest.ReviewedByEmployee.FullName
                    : null,
                ApprovedDate = leaveRequest.Status == "Approved" ? leaveRequest.ReviewedAt?.ToString("yyyy-MM-dd") : null,
                ApprovalRemark = leaveRequest.Status == "Approved" ? leaveRequest.ReviewRemarks : null,
                RejectedBy = leaveRequest.Status == "Rejected" && leaveRequest.ReviewedByEmployee != null
                    ? leaveRequest.ReviewedByEmployee.FullName
                    : null,
                RejectedDate = leaveRequest.Status == "Rejected" ? leaveRequest.ReviewedAt?.ToString("yyyy-MM-dd") : null,
                RejectionReason = leaveRequest.Status == "Rejected" ? leaveRequest.ReviewRemarks : null
            };
        }

        /// <summary>
        /// Approve a leave request
        /// </summary>
        public async Task<AdminLeaveActionResponse> ApproveLeaveRequestAsync(
            long adminEmployeeId,
            long leaveRequestId,
            string? remark = null)
        {
            // Verify admin has permission
            var admin = await _context.Employees
                .Include(e => e.Branch)
                .Include(e => e.EmployeeRoles)
                    .ThenInclude(er => er.Role)
                .FirstOrDefaultAsync(e => e.Id == adminEmployeeId);

            if (admin == null)
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = "Admin not found"
                };
            }

            var isSuperAdmin = admin.EmployeeRoles.Any(er => er.Role.Name == "Super Admin");

            var leaveRequest = await _context.LeaveRequests
                .Include(lr => lr.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(lr => lr.LeaveType)
                .FirstOrDefaultAsync(lr => lr.Id == leaveRequestId);

            if (leaveRequest == null)
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = "Leave request not found"
                };
            }

            // Prevent self-approval
            if (leaveRequest.EmployeeId == adminEmployeeId)
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = "You cannot approve your own leave request"
                };
            }

            // Check if admin has access to this leave request's branch
            if (!isSuperAdmin &&
                leaveRequest.Employee.Branch?.Name != admin.Branch?.Name)
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = "No access to approve this leave request"
                };
            }

            if (leaveRequest.Status != "Pending")
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = $"Leave request is already {leaveRequest.Status.ToLower()}"
                };
            }

            // Check leave balance
            var currentYear = DateTime.UtcNow.Year;
            var leaveBalance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb =>
                    lb.EmployeeId == leaveRequest.EmployeeId &&
                    lb.LeaveTypeId == leaveRequest.LeaveTypeId &&
                    lb.Year == currentYear);

            var daysRequested = leaveRequest.TotalDays;

            if (leaveBalance != null && leaveBalance.Available < daysRequested)
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = $"Insufficient leave balance. Available: {leaveBalance.Available} days, Requested: {daysRequested} days"
                };
            }

            // Update leave request
            leaveRequest.Status = "Approved";
            leaveRequest.ReviewedBy = adminEmployeeId;
            leaveRequest.ReviewedAt = DateTime.UtcNow;
            leaveRequest.ReviewRemarks = remark;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            // Update leave balance - move from pending to used
            if (leaveBalance != null)
            {
                leaveBalance.Pending -= daysRequested; // Remove from pending
                leaveBalance.Used += daysRequested;    // Add to used
                leaveBalance.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return new AdminLeaveActionResponse
            {
                Success = true,
                Message = "Leave request approved successfully"
            };
        }

        /// <summary>
        /// Reject a leave request
        /// </summary>
        public async Task<AdminLeaveActionResponse> RejectLeaveRequestAsync(
            long adminEmployeeId,
            long leaveRequestId,
            string reason)
        {
            // Verify admin has permission
            var admin = await _context.Employees
                .Include(e => e.Branch)
                .Include(e => e.EmployeeRoles)
                    .ThenInclude(er => er.Role)
                .FirstOrDefaultAsync(e => e.Id == adminEmployeeId);

            if (admin == null)
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = "Admin not found"
                };
            }

            var isSuperAdmin = admin.EmployeeRoles.Any(er => er.Role.Name == "Super Admin");

            var leaveRequest = await _context.LeaveRequests
                .Include(lr => lr.Employee)
                    .ThenInclude(e => e.Branch)
                .FirstOrDefaultAsync(lr => lr.Id == leaveRequestId);

            if (leaveRequest == null)
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = "Leave request not found"
                };
            }

            // Prevent self-rejection
            if (leaveRequest.EmployeeId == adminEmployeeId)
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = "You cannot reject your own leave request"
                };
            }

            // Check if admin has access to this leave request's branch
            if (!isSuperAdmin &&
                leaveRequest.Employee.Branch?.Name != admin.Branch?.Name)
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = "No access to reject this leave request"
                };
            }

            if (leaveRequest.Status != "Pending")
            {
                return new AdminLeaveActionResponse
                {
                    Success = false,
                    Message = $"Leave request is already {leaveRequest.Status.ToLower()}"
                };
            }

            // Update leave request
            leaveRequest.Status = "Rejected";
            leaveRequest.ReviewedBy = adminEmployeeId;
            leaveRequest.ReviewedAt = DateTime.UtcNow;
            leaveRequest.ReviewRemarks = reason;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            // Restore leave balance - remove from pending
            var currentYear = DateTime.UtcNow.Year;
            var leaveBalance = await _context.LeaveBalances
                .FirstOrDefaultAsync(lb =>
                    lb.EmployeeId == leaveRequest.EmployeeId &&
                    lb.LeaveTypeId == leaveRequest.LeaveTypeId &&
                    lb.Year == currentYear);

            if (leaveBalance != null)
            {
                leaveBalance.Pending -= leaveRequest.TotalDays; // Remove from pending to restore available
                leaveBalance.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return new AdminLeaveActionResponse
            {
                Success = true,
                Message = "Leave request rejected successfully"
            };
        }

        /// <summary>
        /// Get leave statistics
        /// </summary>
        public async Task<AdminLeaveStatsDto> GetLeaveStatsAsync(long adminEmployeeId, string? branch = null)
        {
            // Verify admin has permission
            var admin = await _context.Employees
                .Include(e => e.Branch)
                .Include(e => e.EmployeeRoles)
                    .ThenInclude(er => er.Role)
                .FirstOrDefaultAsync(e => e.Id == adminEmployeeId);

            if (admin == null)
            {
                throw new UnauthorizedAccessException("Admin not found");
            }

            var isSuperAdmin = admin.EmployeeRoles.Any(er => er.Role.Name == "Super Admin");

            // Start with base query
            var query = _context.LeaveRequests
                .Include(lr => lr.Employee)
                    .ThenInclude(e => e.Branch)
                .AsQueryable();

            // Filter by branch if not super admin
            if (!isSuperAdmin && !string.IsNullOrEmpty(admin.Branch?.Name))
            {
                query = query.Where(lr => lr.Employee.Branch != null &&
                                         lr.Employee.Branch.Name == admin.Branch.Name);
            }
            else if (!string.IsNullOrEmpty(branch))
            {
                query = query.Where(lr => lr.Employee.Branch != null &&
                                         lr.Employee.Branch.Name == branch);
            }

            var allRequests = await query.ToListAsync();

            return new AdminLeaveStatsDto
            {
                TotalRequests = allRequests.Count,
                PendingCount = allRequests.Count(lr => lr.Status == "Pending"),
                ApprovedCount = allRequests.Count(lr => lr.Status == "Approved"),
                RejectedCount = allRequests.Count(lr => lr.Status == "Rejected")
            };
        }
    }
}
