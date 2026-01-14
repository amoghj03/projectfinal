using System.ComponentModel.DataAnnotations;

namespace BankAPI.Models.DTOs;

public class TenantOnboardingDto
{
    [Required]
    public TenantCreateDto Tenant { get; set; } = null!;

    [Required]
    [MinLength(1, ErrorMessage = "At least one branch is required")]
    public List<BranchCreateDto> Branches { get; set; } = new();

    [Required]
    public AdminUserCreateDto AdminUser { get; set; } = null!;

    public List<RoleSetupDto> Roles { get; set; } = new();

    public List<LeaveTypeSetupDto> LeaveTypes { get; set; } = new();

    public Dictionary<string, string> Settings { get; set; } = new();
}

public class TenantCreateDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "Slug must contain only lowercase letters, numbers, and hyphens")]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Domain { get; set; }

    [MaxLength(100)]
    public string? Subdomain { get; set; }

    public string? LogoUrl { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string ContactEmail { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? ContactPhone { get; set; }

    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? State { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    [MaxLength(100)]
    public string Timezone { get; set; } = "UTC";

    [MaxLength(10)]
    public string Currency { get; set; } = "USD";

    [MaxLength(50)]
    public string SubscriptionPlan { get; set; } = "basic";

    [MaxLength(50)]
    public string SubscriptionStatus { get; set; } = "trial";

    public DateTime? SubscriptionExpiresAt { get; set; }

    [Range(1, 10000)]
    public int MaxEmployees { get; set; } = 50;

    [Range(1, 1000)]
    public int MaxBranches { get; set; } = 5;
}

public class BranchCreateDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Code { get; set; }

    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? State { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? Email { get; set; }

    public bool IsHeadOffice { get; set; } = false;
}

public class AdminUserCreateDto
{
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(50)]
    public string? Gender { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    [Required]
    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string JobRole { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Salary { get; set; } = 0;

    public long BranchId { get; set; } // Index of branch in branches array (0-based)
}

public class RoleSetupDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsSystem { get; set; } = false;

    public List<long> PermissionIds { get; set; } = new();
}

public class LeaveTypeSetupDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Range(0, 365)]
    public int MaxDaysPerYear { get; set; } = 0;

    public bool RequiresApproval { get; set; } = true;

    public bool IsPaid { get; set; } = true;
}

public class TenantOnboardingResponseDto
{
    public bool Success { get; set; }
    public long TenantId { get; set; }
    public long AdminEmployeeId { get; set; }
    public string AdminEmail { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
}
