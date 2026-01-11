using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class AdminPayslipController : BaseApiController
    {
        private readonly AdminPayslipService _adminPayslipService;

        public AdminPayslipController(AdminPayslipService adminPayslipService, ApplicationDbContext context) : base(context)
        {
            _adminPayslipService = adminPayslipService;
        }

        /// <summary>
        /// Get employees with salary for payslip generation
        /// </summary>
        [HttpGet("employees")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetEmployeesForPayslip([FromQuery] string? branch = null)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminPayslipService.GetEmployeesForPayslipAsync(employeeId, branch);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving employees", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate payslip for employee
        /// </summary>
        [HttpPost("generate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GeneratePayslip([FromBody] PayslipGenerateDto request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminPayslipService.GeneratePayslipAsync(employeeId, request);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while generating payslip", error = ex.Message });
            }
        }
    }
}
