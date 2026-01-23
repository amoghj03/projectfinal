namespace BankAPI.Models.DTOs;

public class AttendanceRangeRequest
{
    public string FromDate { get; set; } = string.Empty;
    public string ToDate { get; set; } = string.Empty;
    public string? Branch { get; set; }
    public string? Department { get; set; }
    public string? EmployeeId { get; set; }
    public long TenantId { get; set; }
}
