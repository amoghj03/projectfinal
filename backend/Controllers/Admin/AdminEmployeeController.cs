using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin
{
    [Route("admin/[controller]")]
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

        /// <summary>
        /// Create a new employee
        /// </summary>
        /// <param name="employeeDto">Employee data</param>
        /// <returns>Created employee</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateEmployee([FromBody] EmployeeDto employeeDto)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminEmployeeService.CreateEmployeeAsync(employeeId, employeeDto);

                return CreatedAtAction(nameof(GetEmployeeById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating employee", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing employee
        /// </summary>
        /// <param name="id">Employee ID</param>
        /// <param name="employeeDto">Updated employee data</param>
        /// <returns>Updated employee</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateEmployee(long id, [FromBody] EmployeeDto employeeDto)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminEmployeeService.UpdateEmployeeAsync(employeeId, id, employeeDto);

                if (result == null)
                {
                    return NotFound(new { message = "Employee not found" });
                }

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating employee", error = ex.Message });
            }
        }

        /// <summary>
        /// Get available departments
        /// </summary>
        /// <returns>List of departments</returns>
        [HttpGet("departments")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult GetDepartments()
        {
            var departments = new[]
            {
                "Customer Service",
                "IT Support",
                "Accounts",
                "HR",
                "Security",
                "Management",
                "Operations"
            };
            return Ok(departments);
        }

        /// <summary>
        /// Get available roles for assignment
        /// </summary>
        /// <returns>List of roles with their permissions</returns>
        [HttpGet("available-roles")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAvailableRoles()
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminEmployeeService.GetAvailableRolesAsync(employeeId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving roles", error = ex.Message });
            }
        }
    }
}
