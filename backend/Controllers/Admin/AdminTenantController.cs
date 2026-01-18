using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin
{
    [Route("admin/[controller]")]
    [ApiController]
    public class AdminTenantController : BaseApiController
    {
        private readonly AdminTenantService _adminTenantService;

        public AdminTenantController(AdminTenantService adminTenantService, ApplicationDbContext context) : base(context)
        {
            _adminTenantService = adminTenantService;
        }

        /// <summary>
        /// Onboard a new tenant with branches, admin user, roles, and leave types
        /// </summary>
        /// <param name="request">Tenant onboarding request</param>
        /// <returns>Onboarding result</returns>
        [HttpPost("onboard")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> OnboardTenant([FromBody] TenantOnboardingDto request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                // Validate the request
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Invalid request data", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                var result = await _adminTenantService.OnboardTenantAsync(request, employeeId);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while onboarding tenant", error = ex.Message });
            }
        }

        /// <summary>
        /// Check if tenant slug is available
        /// </summary>
        /// <param name="slug">Tenant slug to check</param>
        /// <returns>Availability result</returns>
        [HttpGet("check-slug/{slug}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> CheckSlugAvailability(string slug)
        {
            try
            {
                var isAvailable = await _adminTenantService.IsSlugAvailableAsync(slug);
                return Ok(new { available = isAvailable });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking slug availability", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all tenants
        /// </summary>
        /// <returns>List of tenants</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetTenants()
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var tenants = await _adminTenantService.GetAllTenantsAsync();
                return Ok(tenants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving tenants", error = ex.Message });
            }
        }

        /// <summary>
        /// Get available permissions for role assignment
        /// </summary>
        /// <returns>List of permissions</returns>
        [HttpGet("permissions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPermissions()
        {
            try
            {
                var permissions = await _adminTenantService.GetAllPermissionsAsync();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving permissions", error = ex.Message });
            }
        }

        /// <summary>
        /// Add a branch to an existing tenant
        /// </summary>
        /// <param name="tenantId">The tenant ID</param>
        /// <param name="branchData">Branch data</param>
        /// <returns>Created branch</returns>
        [HttpPost("{tenantId}/branches")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddBranchToTenant(long tenantId, [FromBody] BranchDto branchData)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Invalid branch data", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                var branch = await _adminTenantService.AddBranchToTenantAsync(tenantId, branchData);
                return CreatedAtAction(nameof(AddBranchToTenant), new { id = branch.Id }, branch);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding branch", error = ex.Message });
            }
        }

        /// <summary>
        /// Add an employee to an existing tenant
        /// </summary>
        /// <param name="tenantId">The tenant ID</param>
        /// <param name="employeeData">Employee data</param>
        /// <returns>Created employee</returns>
        [HttpPost("{tenantId}/employees")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddEmployeeToTenant(long tenantId, [FromBody] TenantEmployeeCreateDto employeeData)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Invalid employee data", errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
                }

                var result = await _adminTenantService.AddEmployeeToTenantAsync(tenantId, employeeData);
                return CreatedAtAction(nameof(AddEmployeeToTenant), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding employee", error = ex.Message });
            }
        }
    }
}
