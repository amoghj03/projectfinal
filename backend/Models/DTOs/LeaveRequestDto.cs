namespace BankAPI.Models.DTOs;

public class LeaveRequestDto
{
    public long Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
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
    public string? RejectedBy { get; set; }
    public string? RejectedDate { get; set; }
    public string? RejectionReason { get; set; }
}

public class SubmitLeaveRequest
{
    public string LeaveType { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public bool IsHalfDay { get; set; }
    public string? HalfDayPeriod { get; set; }
}

public class LeaveBalanceDto
{
    public string LeaveType { get; set; } = string.Empty;
    public decimal TotalAllocated { get; set; }
    public decimal Used { get; set; }
    public decimal Pending { get; set; }
    public decimal Available { get; set; }
}

public class LeaveBalanceSummaryDto
{
    public decimal CasualLeave { get; set; }
    public decimal SickLeave { get; set; }
    public decimal AnnualLeave { get; set; }
    public decimal TotalAvailable { get; set; }
    public decimal TotalTaken { get; set; }
    public decimal Pending { get; set; }
    public List<LeaveBalanceDto> DetailedBalances { get; set; } = new();
}

public class LeaveRequestResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public LeaveRequestDto? Data { get; set; }
}

public class LeaveRequestsResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<LeaveRequestDto> Data { get; set; } = new();
}

public class LeaveBalanceResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public LeaveBalanceSummaryDto? Data { get; set; }
}
