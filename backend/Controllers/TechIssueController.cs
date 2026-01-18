using BankAPI.Data;
using BankAPI.Models.DTOs;
using BankAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace BankAPI.Controllers
{
    [Route("[controller]")]
    public class TechIssueController : BaseApiController
    {
        private readonly TechIssueService _techIssueService;

        public TechIssueController(TechIssueService techIssueService, ApplicationDbContext context)
            : base(context)
        {
            _techIssueService = techIssueService;
        }

        [HttpGet("my-issues")]
        public async Task<IActionResult> GetMyTechIssues()
        {
            try
            {
                var employeeId = GetEmployeeIdFromAuth();
                if (employeeId == 0)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized access." });
                }

                var techIssues = await _techIssueService.GetEmployeeTechIssues(employeeId);

                return Ok(new
                {
                    success = true,
                    data = techIssues
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to fetch tech issues",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTechIssue([FromBody] CreateTechIssueRequest request)
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

                var techIssue = await _techIssueService.CreateTechIssue(employee.TenantId, employeeId, request);

                if (techIssue == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Failed to create tech issue"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Tech issue submitted successfully",
                    data = techIssue
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to create tech issue",
                    error = ex.Message
                });
            }
        }

        [HttpPut("{id}/close")]
        public async Task<IActionResult> CloseTechIssue(long id, [FromBody] CloseTechIssueRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.ClosingComments))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Closing comments are required"
                    });
                }

                var employeeId = GetEmployeeIdFromAuth();
                if (employeeId == 0)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized access." });
                }

                var techIssue = await _techIssueService.CloseTechIssue(employeeId, id, request.ClosingComments);

                if (techIssue == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Tech issue not found or you don't have permission to close it"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = techIssue.Status == "Pending"
                        ? "Tech issue submitted for approval"
                        : "Tech issue closed successfully",
                    data = techIssue
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to close tech issue",
                    error = ex.Message
                });
            }
        }
    }
}
