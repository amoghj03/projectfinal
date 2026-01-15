namespace BankAPI.Models.DTOs;

public class TenantEmployeeCreateDto
{
    public string? EmployeeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Gender { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string Department { get; set; } = "General";
    public string? JobRole { get; set; } = "Employee";
    public string Status { get; set; } = "Active";
    public DateOnly? JoinDate { get; set; }
    public decimal? Salary { get; set; }
    public long BranchId { get; set; }
    public List<string>? Roles { get; set; }
}
