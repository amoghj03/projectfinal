using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankAPI.Data;
using BankAPI.Models;

namespace BankAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class BranchController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BranchController> _logger;

    public BranchController(ApplicationDbContext context, ILogger<BranchController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all branches for a specific tenant
    /// </summary>
    /// <param name="tenantId">The tenant ID to filter branches</param>
    /// <returns>List of branches for the tenant</returns>
    [HttpGet("tenant/{tenantId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetBranchesByTenant(long tenantId)
    {
        try
        {
            var branches = await _context.Branches
                .Where(b => b.TenantId == tenantId && b.IsActive)
                .OrderBy(b => b.Name)
                .Select(b => new
                {
                    b.Id,
                    b.Name,
                    b.Code,
                    b.City,
                    b.State,
                    b.IsActive
                })
                .ToListAsync();

            return Ok(branches);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching branches for tenant {TenantId}", tenantId);
            return StatusCode(500, new { message = "An error occurred while fetching branches" });
        }
    }

    /// <summary>
    /// Get a single branch by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetBranch(long id)
    {
        try
        {
            var branch = await _context.Branches
                .Where(b => b.Id == id && b.IsActive)
                .Select(b => new
                {
                    b.Id,
                    b.Name,
                    b.Code,
                    b.Address,
                    b.City,
                    b.State,
                    b.Country,
                    b.Phone,
                    b.Email,
                    b.IsActive
                })
                .FirstOrDefaultAsync();

            if (branch == null)
            {
                return NotFound(new { message = "Branch not found" });
            }

            return Ok(branch);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching branch {BranchId}", id);
            return StatusCode(500, new { message = "An error occurred while fetching the branch" });
        }
    }
}
