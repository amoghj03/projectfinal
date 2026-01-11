using BankAPI.Data;
using BankAPI.Models;
using BankAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BankAPI.Services.Admin
{
    public class AdminRoleService
    {
        private readonly ApplicationDbContext _context;

        public AdminRoleService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<RoleDto>> GetAllRoles(long tenantId)
        {
            var roles = await _context.Roles
                .Where(r => r.TenantId == tenantId)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description ?? string.Empty,
                    IsSystem = r.IsSystem,
                    UserCount = _context.EmployeeRoles.Count(er => er.RoleId == r.Id),
                    Permissions = _context.RolePermissions
                        .Where(rp => rp.RoleId == r.Id)
                        .Select(rp => rp.PermissionId)
                        .ToList()
                })
                .ToListAsync();

            return roles;
        }

        public async Task<RoleDto?> GetRoleById(long roleId, long tenantId)
        {
            var role = await _context.Roles
                .Where(r => r.Id == roleId && r.TenantId == tenantId)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description ?? string.Empty,
                    IsSystem = r.IsSystem,
                    UserCount = _context.EmployeeRoles.Count(er => er.RoleId == r.Id),
                    Permissions = _context.RolePermissions
                        .Where(rp => rp.RoleId == r.Id)
                        .Select(rp => rp.PermissionId)
                        .ToList()
                })
                .FirstOrDefaultAsync();

            return role;
        }

        public async Task<List<PermissionDto>> GetAllPermissions()
        {
            var permissions = await _context.Permissions
                .Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    DisplayName = p.DisplayName,
                    Description = p.Description,
                    Category = p.Category
                })
                .ToListAsync();

            return permissions;
        }

        public async Task<bool> UpdateRolePermissions(long roleId, long tenantId, List<long> permissionIds, string performedBy = "Admin")
        {
            // Verify role exists and belongs to tenant
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == roleId && r.TenantId == tenantId);

            if (role == null)
                return false;

            // Get old permissions for audit log
            var oldPermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            // Remove existing permissions for this role
            var existingPermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .ToListAsync();

            _context.RolePermissions.RemoveRange(existingPermissions);

            // Add new permissions
            var newPermissions = permissionIds.Select(permissionId => new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _context.RolePermissions.AddRangeAsync(newPermissions);
            await _context.SaveChangesAsync();

            // Create audit log entry
            var auditLog = new AuditLog
            {
                TenantId = tenantId,
                Action = "UPDATE",
                EntityType = "RolePermissions",
                EntityId = roleId,
                Changes = System.Text.Json.JsonSerializer.Serialize(new
                {
                    RoleName = role.Name,
                    OldPermissions = oldPermissions,
                    NewPermissions = permissionIds,
                    ModifiedBy = performedBy
                }),
                CreatedAt = DateTime.UtcNow
            };

            await _context.AuditLogs.AddAsync(auditLog);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<RoleDto?> UpdateRole(long roleId, long tenantId, UpdateRoleDto updateDto, string performedBy = "Admin")
        {
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == roleId && r.TenantId == tenantId);

            if (role == null)
                return null;

            // Store old values for audit log
            var oldName = role.Name;
            var oldDescription = role.Description;
            var oldPermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            // Update basic info
            role.Name = updateDto.Name;
            role.Description = updateDto.Description;
            role.UpdatedAt = DateTime.UtcNow;

            // Update permissions
            var existingPermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .ToListAsync();

            _context.RolePermissions.RemoveRange(existingPermissions);

            var newPermissions = updateDto.PermissionIds.Select(permissionId => new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _context.RolePermissions.AddRangeAsync(newPermissions);
            await _context.SaveChangesAsync();

            // Create audit log entry
            var auditLog = new AuditLog
            {
                TenantId = tenantId,
                Action = "UPDATE",
                EntityType = "Role",
                EntityId = roleId,
                Changes = System.Text.Json.JsonSerializer.Serialize(new
                {
                    OldName = oldName,
                    NewName = updateDto.Name,
                    OldDescription = oldDescription,
                    NewDescription = updateDto.Description,
                    OldPermissions = oldPermissions,
                    NewPermissions = updateDto.PermissionIds,
                    ModifiedBy = performedBy
                }),
                CreatedAt = DateTime.UtcNow
            };

            await _context.AuditLogs.AddAsync(auditLog);
            await _context.SaveChangesAsync();

            return await GetRoleById(roleId, tenantId);
        }
    }
}
