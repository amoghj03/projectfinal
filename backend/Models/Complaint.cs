using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankAPI.Models;

[Table("complaints")]
public class Complaint
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("tenant_id")]
    public long TenantId { get; set; }

    [Required]
    [Column("complaint_number")]
    [MaxLength(50)]
    public string ComplaintNumber { get; set; } = string.Empty;

    [Column("employee_id")]
    public long EmployeeId { get; set; }

    [Required]
    [Column("category")]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Column("subject")]
    [MaxLength(255)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("priority")]
    [MaxLength(50)]
    public string Priority { get; set; } = "Medium";

    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = "Open";

    [Column("assigned_to")]
    public long? AssignedTo { get; set; }

    [Column("resolved_at")]
    public DateTime? ResolvedAt { get; set; }

    [Column("resolution_notes")]
    public string? ResolutionNotes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("requires_approval")]
    public bool RequiresApproval { get; set; } = true;

    // Navigation properties
    [ForeignKey("TenantId")]
    public virtual Tenant Tenant { get; set; } = null!;

    [ForeignKey("EmployeeId")]
    public virtual Employee Employee { get; set; } = null!;

    [ForeignKey("AssignedTo")]
    public virtual Employee? AssignedToEmployee { get; set; }
}
