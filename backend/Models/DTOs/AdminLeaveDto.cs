namespace BankAPI.Models.DTOs;

/// <summary>
/// DTO for admin leave request details
/// </summary>
public class AdminLeaveRequestDto
{
    public long Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Branch { get; set; } = string.Empty;
    public string LeaveType { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public decimal Days { get; set; }
    public bool IsHalfDay { get; set; }
    public string? HalfDayPeriod { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string AppliedDate { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public string? ApprovedDate { get; set; }
    public string? ApprovalRemark { get; set; }
    public string? RejectedBy { get; set; }
    public string? RejectedDate { get; set; }
    public string? RejectionReason { get; set; }
}

/// <summary>
/// DTO for admin leave action request (approve/reject)
/// </summary>
public class AdminLeaveActionRequest
{
    public string? Remark { get; set; }
}

/// <summary>
/// DTO for admin leave action response
/// </summary>
public class AdminLeaveActionResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// DTO for leave statistics in admin dashboard
/// </summary>
public class AdminLeaveStatsDto
{
    public int TotalRequests { get; set; }
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
}
