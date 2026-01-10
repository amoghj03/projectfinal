namespace BankAPI.Models.DTOs
{
    public class AdminComplaintDto
    {
        public long Id { get; set; }
        public string ComplaintId { get; set; } = string.Empty;
        public long EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime SubmittedDate { get; set; }
        public DateTime LastUpdate { get; set; }
        public string? Resolution { get; set; }
        public string? ResolvedBy { get; set; }
        public DateTime? ResolvedDate { get; set; }
    }

    public class AdminComplaintStatsDto
    {
        public int Total { get; set; }
        public int Open { get; set; }
        public int ApprovalPending { get; set; }
        public int Resolved { get; set; }
        public int HighPriority { get; set; }
    }

    public class ResolveComplaintRequest
    {
        public string Resolution { get; set; } = string.Empty;
        public string AdminComment { get; set; } = string.Empty;
    }
}
