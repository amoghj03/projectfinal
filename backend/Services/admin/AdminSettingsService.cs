using BankAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace BankAPI.Services.Admin
{
    public class AdminSettingsService
    {
        private readonly ApplicationDbContext _context;

        public AdminSettingsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetSettingsForTenant(long tenantId)
        {
            var settings = await _context.Settings
                .Where(s => s.TenantId == tenantId)
                .Select(s => new
                {
                    s.Id,
                    s.TenantId,
                    s.Key,
                    s.Value,
                    s.CreatedAt,
                    s.UpdatedAt
                })
                .ToListAsync();
            return settings;
        }

        public async Task<object> UpdateSetting(long id, long tenantId, string key, string value)
        {
            var setting = await _context.Settings
                .Where(s => s.Id == id && s.TenantId == tenantId)
                .FirstOrDefaultAsync();
            if (setting == null)
                return null;
            setting.Key = key;
            setting.Value = value;
            await _context.SaveChangesAsync();
            return setting;
        }
    }
}
