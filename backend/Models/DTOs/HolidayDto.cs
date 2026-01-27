using System.ComponentModel.DataAnnotations;

namespace BankAPI.Models.DTOs
{
    public class HolidayDto
    {
        public int HolidayId { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? BranchId { get; set; }
        public string? BranchName { get; set; }
        public int TenantId { get; set; }
        public int? CreatedBy { get; set; }
        public string? CreatedByName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateHolidayDto
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        public int? BranchId { get; set; }
    }

    public class HolidayCalendarDto
    {
        public List<HolidayDto> Holidays { get; set; } = new List<HolidayDto>();
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
    }

    public class DeclareHolidayDto
    {
        [Required]
        public long TenantId { get; set; }

        public long? BranchId { get; set; }

        public string? BranchName { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }
    }
}
