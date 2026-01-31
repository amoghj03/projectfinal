namespace BankAPI.Models.DTOs;

/// <summary>
/// DTO for daily attendance record with employee information
/// </summary>
public class DailyAttendanceDto
{
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string? Branch { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CheckInTime { get; set; }
    public string? CheckOutTime { get; set; }
    public decimal? WorkHours { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public string Date { get; set; } = string.Empty;
    public int? ProductivityRating { get; set; }
}

/// <summary>
/// DTO for monthly attendance summary with employee information
/// </summary>
public class MonthlyAttendanceDto
{
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string? Branch { get; set; }
    public int TotalDays { get; set; }
    public int PresentDays { get; set; }
    public int LateDays { get; set; }
    public int AbsentDays { get; set; }
    public int LeaveTaken { get; set; }
    public decimal AvgHours { get; set; }
    public decimal AttendancePercentage { get; set; }
    public double? ProductivityRating { get; set; }
}

/// <summary>
/// Request DTO for fetching daily attendance
/// </summary>
public class DailyAttendanceRequest
{
    public string? Date { get; set; }
    public string? Branch { get; set; }
    public string? Department { get; set; }
    public string? EmployeeId { get; set; }
    public long TenantId { get; set; }
}

/// <summary>
/// Request DTO for fetching monthly attendance
/// </summary>
public class MonthlyAttendanceRequest
{
    public string? Month { get; set; } // Format: YYYY-MM
    public string? Branch { get; set; }
    public string? Department { get; set; }
    public string? EmployeeId { get; set; }
    public long TenantId { get; set; }
}

/// <summary>
/// Request DTO for fetching employee attendance details
/// </summary>
public class EmployeeAttendanceRequest
{
    public string Month { get; set; } = string.Empty; // Format: YYYY-MM
    public long TenantId { get; set; }
}

/// <summary>
/// Response wrapper for monthly attendance data that includes settings
/// </summary>
public class MonthlyAttendanceResponse
{
    public List<MonthlyAttendanceDto> Data { get; set; } = new();
    public bool IncludeWeekends { get; set; }
}

/// <summary>
/// Response wrapper for admin attendance data
/// </summary>
public class AdminAttendanceResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public object? Data { get; set; }
}
