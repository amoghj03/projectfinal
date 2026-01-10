using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class AdminTechIssueController : BaseApiController
    {
        private readonly AdminTechIssueService _adminTechIssueService;

        public AdminTechIssueController(AdminTechIssueService adminTechIssueService, ApplicationDbContext context) : base(context)
        {
            _adminTechIssueService = adminTechIssueService;
        }

        /// <summary>
        /// Get all tech issues with optional branch filtering
        /// </summary>
        /// <param name="branch">Optional branch filter</param>
        /// <returns>List of tech issues</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllTechIssues([FromQuery] string? branch = null)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var issues = await _adminTechIssueService.GetAllTechIssuesAsync(employeeId, branch);

                return Ok(issues);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving tech issues", error = ex.Message });
            }
        }

        /// <summary>
        /// Get tech issue statistics
        /// </summary>
        /// <param name="branch">Optional branch filter</param>
        /// <returns>Tech issue statistics</returns>
        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetTechIssueStats([FromQuery] string? branch = null)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var stats = await _adminTechIssueService.GetTechIssueStatsAsync(employeeId, branch);

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving tech issue statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a single tech issue by ID
        /// </summary>
        /// <param name="id">Tech issue ID</param>
        /// <returns>Tech issue details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetTechIssueById(long id)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var issue = await _adminTechIssueService.GetTechIssueByIdAsync(id, employeeId);

                if (issue == null)
                {
                    return NotFound(new { message = "Tech issue not found" });
                }

                return Ok(issue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving tech issue", error = ex.Message });
            }
        }

        /// <summary>
        /// Approve a tech issue resolution
        /// </summary>
        /// <param name="id">Tech issue ID</param>
        /// <param name="request">Approval request with admin comment</param>
        /// <returns>Success response</returns>
        [HttpPost("{id}/approve")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ApproveTechIssue(long id, [FromBody] ApproveTechIssueRequest request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminTechIssueService.ApproveTechIssueAsync(id, employeeId, request.AdminComment);

                if (!result)
                {
                    return NotFound(new { message = "Tech issue not found" });
                }

                return Ok(new { message = "Tech issue approved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while approving tech issue", error = ex.Message });
            }
        }

        /// <summary>
        /// Reject a tech issue resolution
        /// </summary>
        /// <param name="id">Tech issue ID</param>
        /// <param name="request">Rejection request with admin comment</param>
        /// <returns>Success response</returns>
        [HttpPost("{id}/reject")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RejectTechIssue(long id, [FromBody] RejectTechIssueRequest request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminTechIssueService.RejectTechIssueAsync(id, employeeId, request.AdminComment);

                if (!result)
                {
                    return NotFound(new { message = "Tech issue not found" });
                }

                return Ok(new { message = "Tech issue rejected successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting tech issue", error = ex.Message });
            }
        }
    }
}
