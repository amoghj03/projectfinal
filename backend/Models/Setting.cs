using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankAPI.Models;

[Table("settings")]
public class Setting
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [Column("tenant_id")]
    public long TenantId { get; set; }


    [Required]
    [Column("key")]
    [MaxLength(150)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [Column("value")]
    [MaxLength(255)]
    public string Value { get; set; } = string.Empty;


    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("TenantId")]
    public Tenant? Tenant { get; set; }
}
