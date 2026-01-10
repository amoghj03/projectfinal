using Microsoft.EntityFrameworkCore;
using BankAPI.Data;
using BankAPI.Services;
using BankAPI.Services.Admin;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure PostgreSQL Database Connection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register application services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ILeaveService, LeaveService>();
builder.Services.AddScoped<ComplaintService>();
builder.Services.AddScoped<TechIssueService>();
builder.Services.AddScoped<AttendanceService>();
builder.Services.AddScoped<WorkLogService>();
builder.Services.AddScoped<DashboardService>();

// Register admin services
builder.Services.AddScoped<AdminDashboardService>();
builder.Services.AddScoped<AdminEmployeeService>();
builder.Services.AddScoped<AdminTechIssueService>();

// Configure CORS for frontend access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // React default port
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
