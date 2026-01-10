using Microsoft.EntityFrameworkCore;
using BankAPI.Models;

namespace BankAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets for all entities
    public DbSet<Tenant> Tenants { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Branch> Branches { get; set; } = null!;
    public DbSet<Employee> Employees { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<RolePermission> RolePermissions { get; set; } = null!;
    public DbSet<EmployeeRole> EmployeeRoles { get; set; } = null!;
    public DbSet<Attendance> Attendances { get; set; } = null!;
    public DbSet<LeaveType> LeaveTypes { get; set; } = null!;
    public DbSet<LeaveRequest> LeaveRequests { get; set; } = null!;
    public DbSet<LeaveBalance> LeaveBalances { get; set; } = null!;
    public DbSet<WorkLog> WorkLogs { get; set; } = null!;
    public DbSet<Skill> Skills { get; set; } = null!;
    public DbSet<SkillTest> SkillTests { get; set; } = null!;
    public DbSet<EmployeeSkillTest> EmployeeSkillTests { get; set; } = null!;
    public DbSet<Complaint> Complaints { get; set; } = null!;
    public DbSet<TechIssue> TechIssues { get; set; } = null!;
    public DbSet<Payslip> Payslips { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    public DbSet<Setting> Settings { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure unique constraints
        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.Slug)
            .IsUnique();

        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.Subdomain)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => new { u.TenantId, u.Email })
            .IsUnique();

        modelBuilder.Entity<Branch>()
            .HasIndex(b => new { b.TenantId, b.Code })
            .IsUnique();

        modelBuilder.Entity<Employee>()
            .HasIndex(e => new { e.TenantId, e.EmployeeId })
            .IsUnique();

        modelBuilder.Entity<Employee>()
            .HasIndex(e => new { e.TenantId, e.Email })
            .IsUnique();

        modelBuilder.Entity<Role>()
            .HasIndex(r => new { r.TenantId, r.Name })
            .IsUnique();

        modelBuilder.Entity<Permission>()
            .HasIndex(p => p.Name)
            .IsUnique();

        modelBuilder.Entity<RolePermission>()
            .HasIndex(rp => new { rp.RoleId, rp.PermissionId })
            .IsUnique();

        modelBuilder.Entity<EmployeeRole>()
            .HasIndex(er => new { er.EmployeeId, er.RoleId })
            .IsUnique();

        modelBuilder.Entity<Attendance>()
            .HasIndex(a => new { a.TenantId, a.EmployeeId, a.Date })
            .IsUnique();

        modelBuilder.Entity<LeaveType>()
            .HasIndex(lt => new { lt.TenantId, lt.Name })
            .IsUnique();

        modelBuilder.Entity<LeaveBalance>()
            .HasIndex(lb => new { lb.EmployeeId, lb.LeaveTypeId, lb.Year })
            .IsUnique();

        modelBuilder.Entity<Skill>()
            .HasIndex(s => new { s.TenantId, s.Name })
            .IsUnique();

        modelBuilder.Entity<Complaint>()
            .HasIndex(c => new { c.TenantId, c.ComplaintNumber })
            .IsUnique();

        modelBuilder.Entity<TechIssue>()
            .HasIndex(ti => new { ti.TenantId, ti.IssueNumber })
            .IsUnique();

        modelBuilder.Entity<Payslip>()
            .HasIndex(p => new { p.EmployeeId, p.Month, p.Year })
            .IsUnique();

        modelBuilder.Entity<Setting>()
            .HasIndex(s => new { s.TenantId, s.Key })
            .IsUnique();

        // Configure self-referencing relationships to prevent cascading delete issues
        modelBuilder.Entity<EmployeeRole>()
            .HasOne(er => er.AssignedByEmployee)
            .WithMany()
            .HasForeignKey(er => er.AssignedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(lr => lr.ReviewedByEmployee)
            .WithMany()
            .HasForeignKey(lr => lr.ReviewedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Complaint>()
            .HasOne(c => c.AssignedToEmployee)
            .WithMany()
            .HasForeignKey(c => c.AssignedTo)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TechIssue>()
            .HasOne(ti => ti.ApprovedByEmployee)
            .WithMany()
            .HasForeignKey(ti => ti.ApprovedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TechIssue>()
            .HasOne(ti => ti.AssignedToEmployee)
            .WithMany()
            .HasForeignKey(ti => ti.AssignedTo)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payslip>()
            .HasOne(p => p.GeneratedByEmployee)
            .WithMany()
            .HasForeignKey(p => p.GeneratedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
