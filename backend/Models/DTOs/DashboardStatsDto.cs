namespace BankAPI.Models.DTOs
{
    public class DashboardStatsDto
    {
        public string EmployeeName { get; set; } = string.Empty;
        public string EmployeeId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string JobRole { get; set; } = string.Empty;
        public AttendanceStatsDto AttendanceStats { get; set; } = new();
        public TaskStatsDto TaskStats { get; set; } = new();
        public SkillStatsDto SkillStats { get; set; } = new();
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
    }

    public class AttendanceStatsDto
    {
        public decimal AttendanceRate { get; set; }
        public int TotalDays { get; set; }
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
    }

    public class TaskStatsDto
    {
        public int TasksCompleted { get; set; }
        public decimal TotalHours { get; set; }
    }

    public class SkillStatsDto
    {
        public decimal AverageScore { get; set; }
        public int TestsTaken { get; set; }
        public int TestsPassed { get; set; }
    }

    public class RecentActivityDto
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class AdminDashboardStatsDto
    {
        public string Branch { get; set; } = string.Empty;
        public int TotalEmployees { get; set; }
        public int PresentToday { get; set; }
        public int AbsentToday { get; set; }
        public int OpenComplaints { get; set; }
        public int PendingApprovals { get; set; }
        public decimal MonthlyTestAvg { get; set; }
        public int LeaveRequestsPending { get; set; }
        public int TechIssuesPending { get; set; }
        public decimal AttendanceRate { get; set; }
        public DateTime? SubscriptionEndDate { get; set; }
    }
}
