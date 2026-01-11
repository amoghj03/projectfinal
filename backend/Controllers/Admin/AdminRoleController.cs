using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class AdminRoleController : BaseApiController
    {
        private readonly AdminRoleService _roleService;
        public AdminRoleController(AdminRoleService roleService, ApplicationDbContext context) : base(context)
        {
            _roleService = roleService;
        }

        [HttpGet("roles")]
        public async Task<ActionResult<List<RoleDto>>> GetAllRoles()
        {
            var tenantId = GetTenantId();
            var roles = await _roleService.GetAllRoles(tenantId);
            return Ok(roles);
        }

        [HttpGet("roles/{id}")]
        public async Task<ActionResult<RoleDto>> GetRoleById(long id)
        {
            var tenantId = GetTenantId();
            var role = await _roleService.GetRoleById(id, tenantId);

            if (role == null)
                return NotFound(new { message = "Role not found" });

            return Ok(role);
        }

        [HttpGet("permissions")]
        public async Task<ActionResult<List<PermissionDto>>> GetAllPermissions()
        {
            var permissions = await _roleService.GetAllPermissions();
            return Ok(permissions);
        }

        [HttpPut("roles/{id}")]
        public async Task<ActionResult<RoleDto>> UpdateRole(long id, [FromBody] UpdateRoleDto updateDto)
        {
            var tenantId = GetTenantId();
            var adminName = User.FindFirst("Name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin";
            Console.WriteLine($"Updating role {id} for tenant {tenantId}");
            Console.WriteLine($"UpdateDto: Name={updateDto.Name}, Description={updateDto.Description}, Permissions={string.Join(",", updateDto.PermissionIds)}");

            var updatedRole = await _roleService.UpdateRole(id, tenantId, updateDto, adminName);

            if (updatedRole == null)
            {
                Console.WriteLine($"Role {id} not found for tenant {tenantId}");
                return NotFound(new { message = "Role not found or cannot be modified" });
            }

            return Ok(updatedRole);
        }

        [HttpPut("roles/{id}/permissions")]
        public async Task<ActionResult> UpdateRolePermissions(long id, [FromBody] List<long> permissionIds)
        {
            var tenantId = GetTenantId();
            var adminName = User.FindFirst("Name")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin";
            var success = await _roleService.UpdateRolePermissions(id, tenantId, permissionIds, adminName);

            if (!success)
                return NotFound(new { message = "Role not found" });

            return Ok(new { message = "Role permissions updated successfully" });
        }

        private long GetTenantId()
        {
            var tenantIdClaim = User.FindFirst("TenantId")?.Value;
            return long.Parse(tenantIdClaim ?? "1");
        }
    }
}
