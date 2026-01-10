using BankAPI.Models.DTOs;
using BankAPI.Services;
using BankAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BankAPI.Controllers
{
    [Route("api/[controller]")]
    public class ComplaintController : BaseApiController
    {
        private readonly ComplaintService _complaintService;

        public ComplaintController(ComplaintService complaintService, ApplicationDbContext context)
            : base(context)
        {
            _complaintService = complaintService;
        }

        [HttpGet("my-complaints")]
        public async Task<IActionResult> GetMyComplaints()
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();
                if (employeeId == 0)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized access." });
                }

                var complaints = await _complaintService.GetEmployeeComplaints(employeeId);

                return Ok(new
                {
                    success = true,
                    data = complaints
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to fetch complaints",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateComplaint([FromBody] CreateComplaintRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Title) ||
                    string.IsNullOrWhiteSpace(request.Description) ||
                    string.IsNullOrWhiteSpace(request.Category))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Title, description, and category are required"
                    });
                }

                var employeeId = GetEmployeeIdFromAuth();
                if (employeeId == 0)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized access." });
                }

                var employee = await _context.Employees.FindAsync(employeeId);
                if (employee == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Employee not found"
                    });
                }

                var complaint = await _complaintService.CreateComplaint(employee.TenantId, employeeId, request);

                if (complaint == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Failed to create complaint"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Complaint submitted successfully",
                    data = complaint
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to create complaint",
                    error = ex.Message
                });
            }
        }

        [HttpPut("{id}/mark-resolved")]
        public async Task<IActionResult> MarkComplaintResolved(long id, [FromBody] MarkResolvedRequest request)
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();
                if (employeeId == 0)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized access." });
                }

                var complaint = await _context.Complaints.FindAsync(id);
                if (complaint == null)
                {
                    return NotFound(new { success = false, message = "Complaint not found" });
                }

                // Verify the complaint belongs to this employee
                if (complaint.EmployeeId != employeeId)
                {
                    return Forbid();
                }

                // Mark as Approval Pending (waiting for admin approval)
                complaint.Status = "Approval Pending";
                complaint.ResolutionNotes = request.ClosingComments;
                complaint.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Complaint marked as resolved and pending admin approval",
                    data = new
                    {
                        complaint.Id,
                        complaint.ComplaintNumber,
                        complaint.Status
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to update complaint status",
                    error = ex.Message
                });
            }
        }
    }
}