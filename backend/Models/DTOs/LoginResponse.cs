namespace BankAPI.Models.DTOs;

public class LoginResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public UserData? User { get; set; }
}

public class UserData
{
    public long Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Branch { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool HasAdminAccess { get; set; }
    public string? AdminRole { get; set; }
    public Dictionary<string, bool>? AdminPermissions { get; set; }
    public Dictionary<string, bool>? EmployeePermissions { get; set; }
    public long TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
}
