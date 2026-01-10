namespace BankAPI.Models.DTOs
{
    public class AdminTechIssueDto
    {
        public long Id { get; set; }
        public string IssueId { get; set; } = string.Empty;
        public long EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Impact { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime SubmittedDate { get; set; }
        public DateTime LastUpdate { get; set; }
        public string? StepsToReproduce { get; set; }
        public string? ExpectedBehavior { get; set; }
        public string? ActualBehavior { get; set; }
        public string? EmployeeResolution { get; set; }
        public string? AdminComment { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? RejectedBy { get; set; }
        public DateTime? RejectedDate { get; set; }
    }

    public class AdminTechIssueStatsDto
    {
        public int Total { get; set; }
        public int Open { get; set; }
        public int PendingApproval { get; set; }
        public int Approved { get; set; }
        public int Rejected { get; set; }
        public int HighImpact { get; set; }
    }

    public class ApproveTechIssueRequest
    {
        public string AdminComment { get; set; } = string.Empty;
    }

    public class RejectTechIssueRequest
    {
        public string AdminComment { get; set; } = string.Empty;
    }
}
