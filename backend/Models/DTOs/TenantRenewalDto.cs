using System.ComponentModel.DataAnnotations;

namespace BankAPI.Models.DTOs;

public class TenantRenewalDto
{
    [MaxLength(50)]
    public string? SubscriptionPlan { get; set; }

    [Range(0, 365, ErrorMessage = "Subscription days must be between 0 and 365 (0 means no renewal)")]
    public int SubscriptionDays { get; set; } = 0;

    [Range(1, int.MaxValue, ErrorMessage = "Max employees must be greater than 0")]
    public int MaxEmployees { get; set; } = 50;

    [Range(1, int.MaxValue, ErrorMessage = "Max branches must be greater than 0")]
    public int MaxBranches { get; set; } = 5;
}

