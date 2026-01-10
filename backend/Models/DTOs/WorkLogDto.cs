namespace BankAPI.Models.DTOs;

public class WorkLogDto
{
    public long Id { get; set; }
    public string Date { get; set; } = string.Empty;
    public string TaskName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Hours { get; set; }
    public string? Category { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateWorkLogRequest
{
    public string TaskName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Hours { get; set; }
    public string? Category { get; set; }
}

public class WorkLogSummaryDto
{
    public decimal TotalHours { get; set; }
    public int TotalTasks { get; set; }
    public List<WorkLogDto> WorkLogs { get; set; } = new();
}
