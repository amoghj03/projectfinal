namespace BankAPI.Models.DTOs;

public class EmployeeDto
{
    public long Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Gender { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? PhotoUrl { get; set; }
    public string Department { get; set; } = string.Empty;
    public string? JobRole { get; set; }
    public string Status { get; set; } = "Active";
    public DateOnly JoinDate { get; set; }
    public decimal? Salary { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public string? BranchName { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
}

public class EmployeeListResponseDto
{
    public List<EmployeeDto> Employees { get; set; } = new List<EmployeeDto>();
    public int TotalCount { get; set; }
    public string? Branch { get; set; }
}
