
namespace BankAPI.Models.DTOs;

public class ManualMarkAttendanceRequest
{
    public string EmployeeId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public string Status { get; set; } = string.Empty;
    public decimal WorkHours { get; set; }
}

public class AttendanceDto
{
    public long Id { get; set; }
    public string Date { get; set; } = string.Empty;
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public string? Status { get; set; }
    public decimal? WorkHours { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public int? ProductivityRating { get; set; }
}

public class CheckInRequest
{
    public string? Location { get; set; }
    public string? Notes { get; set; }
}

public class CheckOutRequest
{
    public string? Notes { get; set; }
}

public class TodayAttendanceDto
{
    public bool CheckedIn { get; set; }
    public bool CheckedOut { get; set; }
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public string? Status { get; set; }
    public decimal? WorkHours { get; set; }
    public int? ProductivityRating { get; set; }
}
