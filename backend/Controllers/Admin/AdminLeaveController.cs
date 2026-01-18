using BankAPI.Data;
using BankAPI.Models.DTOs;
using BankAPI.Services.Admin;
using Microsoft.AspNetCore.Mvc;

namespace BankAPI.Controllers.Admin
{
    [Route("admin/[controller]")]
    [ApiController]
    public class AdminLeaveController : BaseApiController
    {
        private readonly AdminLeaveService _adminLeaveService;

        public AdminLeaveController(AdminLeaveService adminLeaveService, ApplicationDbContext context)
            : base(context)
        {
            _adminLeaveService = adminLeaveService;
        }

        /// <summary>
        /// Get all leave requests with optional filtering
        /// </summary>
        /// <param name="branch">Optional branch filter</param>
        /// <param name="status">Optional status filter (Pending, Approved, Rejected)</param>
        /// <param name="employeeName">Optional employee name filter</param>
        /// <param name="leaveType">Optional leave type filter</param>
        /// <returns>List of leave requests</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetLeaveRequests(
            [FromQuery] string? branch = null,
            [FromQuery] string? status = null,
            [FromQuery] string? employeeName = null,
            [FromQuery] string? leaveType = null)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminLeaveService.GetLeaveRequestsAsync(
                    employeeId, branch, status, employeeName, leaveType);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving leave requests",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get leave request by ID
        /// </summary>
        /// <param name="id">Leave request ID</param>
        /// <returns>Leave request details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetLeaveRequestById(long id)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminLeaveService.GetLeaveRequestByIdAsync(employeeId, id);

                if (result == null)
                {
                    return NotFound(new { message = "Leave request not found" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving leave request",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Approve a leave request
        /// </summary>
        /// <param name="id">Leave request ID</param>
        /// <param name="request">Approval request with optional remark</param>
        /// <returns>Success response</returns>
        [HttpPost("{id}/approve")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ApproveLeaveRequest(
            long id,
            [FromBody] AdminLeaveActionRequest request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminLeaveService.ApproveLeaveRequestAsync(
                    employeeId, id, request.Remark);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while approving leave request",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Reject a leave request
        /// </summary>
        /// <param name="id">Leave request ID</param>
        /// <param name="request">Rejection request with required reason</param>
        /// <returns>Success response</returns>
        [HttpPost("{id}/reject")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RejectLeaveRequest(
            long id,
            [FromBody] AdminLeaveActionRequest request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                if (string.IsNullOrWhiteSpace(request.Remark))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Rejection reason is required"
                    });
                }

                var result = await _adminLeaveService.RejectLeaveRequestAsync(
                    employeeId, id, request.Remark);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while rejecting leave request",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get leave statistics for admin dashboard
        /// </summary>
        /// <param name="branch">Optional branch filter</param>
        /// <returns>Leave statistics</returns>
        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetLeaveStats([FromQuery] string? branch = null)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();

                if (employeeId == 0)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var result = await _adminLeaveService.GetLeaveStatsAsync(employeeId, branch);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving leave statistics",
                    error = ex.Message
                });
            }
        }
    }
}
