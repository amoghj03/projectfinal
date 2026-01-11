namespace BankAPI.Models.DTOs;

public class PayslipGenerateDto
{
    public long EmployeeId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BasicSalary { get; set; }
    public decimal Hra { get; set; }
    public decimal TransportAllowance { get; set; }
    public decimal MedicalAllowance { get; set; }
    public decimal SpecialAllowance { get; set; }
    public decimal OtherEarnings { get; set; }
    public decimal ProvidentFund { get; set; }
    public decimal ProfessionalTax { get; set; }
    public decimal IncomeTax { get; set; }
    public decimal OtherDeductions { get; set; }
    public int WorkingDays { get; set; }
    public int PresentDays { get; set; }
}
