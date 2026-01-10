using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Mvc;
using BankAPI.Data;

namespace BankAPI.Controllers.Admin
{
    [Route("api/admin/Complaint")]
    [ApiController]
    public class AdminComplaintController : BaseApiController
    {
        private readonly AdminComplaintService _adminComplaintService;

        public AdminComplaintController(AdminComplaintService adminComplaintService, ApplicationDbContext context) : base(context)
        {
            _adminComplaintService = adminComplaintService;
        }

        /// <summary>
        /// Get all complaints with optional branch filtering
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllComplaints([FromQuery] string? branch = null)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var complaints = await _adminComplaintService.GetAllComplaintsAsync(employeeId, branch);

                return Ok(complaints);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving complaints", error = ex.Message });
            }
        }

        /// <summary>
        /// Get complaint statistics
        /// </summary>
        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetComplaintStats([FromQuery] string? branch = null)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var stats = await _adminComplaintService.GetComplaintStatsAsync(employeeId, branch);

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving complaint statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a single complaint by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetComplaintById(long id)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var complaint = await _adminComplaintService.GetComplaintByIdAsync(id, employeeId);

                if (complaint == null)
                {
                    return NotFound(new { message = "Complaint not found" });
                }

                return Ok(complaint);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving complaint", error = ex.Message });
            }
        }

        /// <summary>
        /// Resolve a complaint
        /// </summary>
        [HttpPost("{id}/resolve")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ResolveComplaint(long id, [FromBody] ResolveComplaintRequest request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminComplaintService.ResolveComplaintAsync(id, employeeId, request.Resolution, request.AdminComment);

                if (!result)
                {
                    return NotFound(new { message = "Complaint not found" });
                }

                return Ok(new { message = "Complaint resolved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while resolving complaint", error = ex.Message });
            }
        }

        /// <summary>
        /// Take action on complaint (mark as In Progress)
        /// </summary>
        [HttpPost("{id}/take-action")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> TakeAction(long id, [FromBody] ResolveComplaintRequest request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminComplaintService.TakeActionOnComplaintAsync(id, employeeId, request.AdminComment);

                if (!result)
                {
                    return NotFound(new { message = "Complaint not found" });
                }

                return Ok(new { message = "Action taken on complaint successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while taking action on complaint", error = ex.Message });
            }
        }

        /// <summary>
        /// Reject a complaint (mark as Open with rejection comment)
        /// </summary>
        [HttpPost("{id}/reject")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RejectComplaint(long id, [FromBody] ResolveComplaintRequest request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminComplaintService.RejectComplaintAsync(id, employeeId, request.AdminComment);

                if (!result)
                {
                    return NotFound(new { message = "Complaint not found" });
                }

                return Ok(new { message = "Complaint rejected successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting complaint", error = ex.Message });
            }
        }
    }
}
