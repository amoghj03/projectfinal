namespace BankAPI.Models.DTOs
{
    public class RoleDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsSystem { get; set; }
        public int UserCount { get; set; }
        public List<long> Permissions { get; set; } = new List<long>();
    }

    public class PermissionDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Category { get; set; }
    }

    public class UpdateRoleDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<long> PermissionIds { get; set; } = new List<long>();
    }
}
