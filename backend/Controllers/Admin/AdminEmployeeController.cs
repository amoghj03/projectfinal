using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class AdminEmployeeController : BaseApiController
    {
        private readonly AdminEmployeeService _adminEmployeeService;

        public AdminEmployeeController(AdminEmployeeService adminEmployeeService, ApplicationDbContext context) : base(context)
        {
            _adminEmployeeService = adminEmployeeService;
        }

        /// <summary>
        /// Get list of employees with optional branch filtering
        /// </summary>
        /// <param name="branch">Optional branch filter</param>
        /// <returns>List of employees</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetEmployees([FromQuery] string? branch = null)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminEmployeeService.GetEmployeesAsync(employeeId, branch);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving employees", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a single employee by ID
        /// </summary>
        /// <param name="id">Employee ID</param>
        /// <returns>Employee details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetEmployeeById(long id)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminEmployeeService.GetEmployeeByIdAsync(employeeId, id);

                if (result == null)
                {
                    return NotFound(new { message = "Employee not found" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving employee", error = ex.Message });
            }
        }
    }
}
