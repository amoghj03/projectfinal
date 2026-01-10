namespace BankAPI.Models.DTOs
{
    public class ComplaintDto
    {
        public long Id { get; set; }
        public string ComplaintNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime SubmittedDate { get; set; }
        public string SubmittedBy { get; set; } = string.Empty;
        public DateTime LastUpdate { get; set; }
        public string? Resolution { get; set; }
        public string? ClosingComments { get; set; }
    }

    public class CreateComplaintRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
    }
}
