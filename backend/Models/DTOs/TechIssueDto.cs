namespace BankAPI.Models.DTOs
{
    public class TechIssueDto
    {
        public long Id { get; set; }
        public string IssueNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Impact { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime SubmittedDate { get; set; }
        public string SubmittedBy { get; set; } = string.Empty;
        public DateTime LastUpdate { get; set; }
        public string? StepsToReproduce { get; set; }
        public string? ExpectedBehavior { get; set; }
        public string? ActualBehavior { get; set; }
        public string? AssignedTo { get; set; }
        public string? Resolution { get; set; }
        public string? ClosingComments { get; set; }
    }

    public class CreateTechIssueRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Impact { get; set; } = string.Empty;
        public string? StepsToReproduce { get; set; }
        public string? ExpectedBehavior { get; set; }
        public string? ActualBehavior { get; set; }
    }

    public class CloseTechIssueRequest
    {
        public string ClosingComments { get; set; } = string.Empty;
    }
}
