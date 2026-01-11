import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  Chip,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Business,
  Person,
  Receipt,
  Print,
  PictureAsPdf,
  Email,
  CalendarToday,
  AttachMoney,
  Save,
} from '@mui/icons-material';
import { AdminLayout } from './AdminDashboard';
import { useBranch } from '../../contexts/BranchContext';
import { useReactToPrint } from 'react-to-print';
import payslipService from '../../services/payslipService';

const PayslipGeneration = () => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const payslipRef = useRef();
  const effectiveBranch = getEffectiveBranch();
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [payslipGenerated, setPayslipGenerated] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // Editable payslip fields
  const [payslipData, setPayslipData] = useState({
    id: 0,
    employeeId: '',
    employeeName: '',
    designation: '',
    department: '',
    branch: '',
    email: '',
    payPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM format
    payDate: new Date().toISOString().split('T')[0],
    basicSalary: 0,
    hra: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    otherEarnings: 0,
    providentFund: 0,
    professionalTax: 0,
    incomeTax: 0,
    otherDeductions: 0,
    bankName: 'Secure Bank',
    accountNumber: '',
    workingDays: 0,
    presentDays: 0,
    absentDays: 0,
    paidLeaves: 0,
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const branch = effectiveBranch === 'All Branches' ? null : effectiveBranch;
      const response = await payslipService.getEmployeesForPayslip(branch);
      
      if (response.success) {
        setEmployees(response.data);
      } else {
        setAlert({ open: true, message: response.message || 'Failed to fetch employees', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setAlert({ open: true, message: 'Failed to fetch employees', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees on mount and when branch changes
  useEffect(() => {
    fetchEmployees();
  }, [effectiveBranch]);
  const handleEmployeeChange = (employeeId) => {
    setSelectedEmployee(employeeId);
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (employee) {
      // Only salary comes from backend, rest are zero and editable
      setPayslipData({
        ...payslipData,
        id: employee.id,
        employeeId: employee.employeeId,
        employeeName: employee.fullName,
        designation: employee.jobRole || 'Employee',
        department: employee.department,
        branch: employee.branch,
        email: employee.email,
        basicSalary: parseFloat(employee.salary || 0),
        hra: 0,
        transportAllowance: 0,
        medicalAllowance: 0,
        specialAllowance: 0,
        otherEarnings: 0,
        providentFund: 0,
        professionalTax: 0,
        incomeTax: 0,
        otherDeductions: 0,
        accountNumber: '',
        workingDays: 0,
        presentDays: 0,
        absentDays: 0,
        paidLeaves: 0,
      });
      setPayslipGenerated(true);
    }
  };

  const handleInputChange = (field, value) => {
    setPayslipData({
      ...payslipData,
      [field]: value,
    });
  };

  const handleSavePayslip = async () => {
    try {
      setSaving(true);
      
      // Parse month and year from payPeriod
      const [year, month] = payslipData.payPeriod.split('-');
      
      const payslipRequest = {
        employeeId: payslipData.id,
        month: parseInt(month),
        year: parseInt(year),
        basicSalary: parseFloat(payslipData.basicSalary) || 0,
        hra: parseFloat(payslipData.hra) || 0,
        transportAllowance: parseFloat(payslipData.transportAllowance) || 0,
        medicalAllowance: parseFloat(payslipData.medicalAllowance) || 0,
        specialAllowance: parseFloat(payslipData.specialAllowance) || 0,
        otherEarnings: parseFloat(payslipData.otherEarnings) || 0,
        providentFund: parseFloat(payslipData.providentFund) || 0,
        professionalTax: parseFloat(payslipData.professionalTax) || 0,
        incomeTax: parseFloat(payslipData.incomeTax) || 0,
        otherDeductions: parseFloat(payslipData.otherDeductions) || 0,
        workingDays: parseInt(payslipData.workingDays) || 0,
        presentDays: parseInt(payslipData.presentDays) || 0,
      };

      const response = await payslipService.generatePayslip(payslipRequest);
      
      if (response.success) {
        setAlert({ open: true, message: 'Payslip generated successfully!', severity: 'success' });
      } else {
        setAlert({ open: true, message: response.message || 'Failed to generate payslip', severity: 'error' });
      }
    } catch (error) {
      console.error('Error generating payslip:', error);
      setAlert({ open: true, message: error.response?.data?.message || 'Failed to generate payslip', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals
  const grossEarnings = 
    parseFloat(payslipData.basicSalary || 0) +
    parseFloat(payslipData.hra || 0) +
    parseFloat(payslipData.transportAllowance || 0) +
    parseFloat(payslipData.medicalAllowance || 0) +
    parseFloat(payslipData.specialAllowance || 0) +
    parseFloat(payslipData.otherEarnings || 0);

  const totalDeductions = 
    parseFloat(payslipData.providentFund || 0) +
    parseFloat(payslipData.professionalTax || 0) +
    parseFloat(payslipData.incomeTax || 0) +
    parseFloat(payslipData.otherDeductions || 0);

  const netPay = grossEarnings - totalDeductions;

  // Print/PDF handler
  const handlePrint = useReactToPrint({
    contentRef: payslipRef,
    documentTitle: payslipData.employeeName 
      ? `Payslip-${payslipData.employeeName.replace(/\s+/g, '_')}_${payslipData.payPeriod}` 
      : 'Payslip',
  });

  const PayslipDocument = () => (
    <Box sx={{ p: 4, backgroundColor: 'white' }}>
      {/* Company Header */}
      <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #1976d2', pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          SECURE BANK
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Employee Payslip for the month of {payslipData.payPeriod}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Pay Date: {payslipData.payDate}
        </Typography>
      </Box>

      {/* Employee Details */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Typography variant="body2"><strong>Employee ID:</strong> {payslipData.employeeId}</Typography>
          <Typography variant="body2"><strong>Employee Name:</strong> {payslipData.employeeName}</Typography>
          <Typography variant="body2"><strong>Designation:</strong> {payslipData.designation}</Typography>
          <Typography variant="body2"><strong>Department:</strong> {payslipData.department}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2"><strong>Branch:</strong> {payslipData.branch}</Typography>
          <Typography variant="body2"><strong>Email:</strong> {payslipData.email}</Typography>
          <Typography variant="body2"><strong>Bank Name:</strong> {payslipData.bankName}</Typography>
          <Typography variant="body2"><strong>Account Number:</strong> {payslipData.accountNumber}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Attendance Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>Attendance Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body2"><strong>Working Days:</strong> {payslipData.workingDays}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2"><strong>Present Days:</strong> {payslipData.presentDays}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2"><strong>Absent Days:</strong> {payslipData.absentDays}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2"><strong>Paid Leaves:</strong> {payslipData.paidLeaves}</Typography>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Earnings and Deductions */}
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Earnings</Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Basic Salary</TableCell>
                  <TableCell align="right">₹{payslipData.basicSalary.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>House Rent Allowance</TableCell>
                  <TableCell align="right">₹{payslipData.hra.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Transport Allowance</TableCell>
                  <TableCell align="right">₹{payslipData.transportAllowance.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Medical Allowance</TableCell>
                  <TableCell align="right">₹{payslipData.medicalAllowance.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Special Allowance</TableCell>
                  <TableCell align="right">₹{payslipData.specialAllowance.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Other Earnings</TableCell>
                  <TableCell align="right">₹{payslipData.otherEarnings.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Gross Earnings</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{grossEarnings.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Deductions</Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Provident Fund (PF)</TableCell>
                  <TableCell align="right">₹{payslipData.providentFund.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Professional Tax</TableCell>
                  <TableCell align="right">₹{payslipData.professionalTax.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Income Tax (TDS)</TableCell>
                  <TableCell align="right">₹{payslipData.incomeTax.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Other Deductions</TableCell>
                  <TableCell align="right">₹{payslipData.otherDeductions.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Deductions</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{totalDeductions.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Net Pay */}
      <Box sx={{ textAlign: 'right', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Net Pay: ₹{netPay.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          (Gross Earnings - Total Deductions)
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #ccc' }}>
        <Typography variant="caption" color="text.secondary">
          This is a computer-generated document and does not require a signature.
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          For any queries, please contact HR Department at hr@securebank.com
        </Typography>
      </Box>
    </Box>
  );

  return (
    <AdminLayout>
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4">Payslip Generation</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Business fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              Viewing: {effectiveBranch}
            </Typography>
            {!isSuperAdmin && (
              <Chip label="Branch Admin" size="small" color="primary" variant="outlined" />
            )}
          </Box>
        </Box>

        {/* Employee Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Person color="primary" />
              <Typography variant="h6">Select Employee</Typography>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                label="Employee"
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Select an employee</em>
                </MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.employeeId} - {emp.fullName} ({emp.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Editable Payslip Form */}
        {payslipGenerated && (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              All fields below are editable. Please review and modify the values as needed before generating the PDF.
            </Alert>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Edit Payslip Details
                </Typography>

                <Grid container spacing={3}>
                  {/* Employee Information */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                      Employee Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      value={payslipData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Employee Name"
                      value={payslipData.employeeName}
                      onChange={(e) => handleInputChange('employeeName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      value={payslipData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={payslipData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Branch"
                      value={payslipData.branch}
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      InputProps={{
                        startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={payslipData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>

                  {/* Pay Period Details */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                      Pay Period Details
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Pay Period"
                      value={payslipData.payPeriod}
                      onChange={(e) => handleInputChange('payPeriod', e.target.value)}
                      type="month"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Pay Date"
                      value={payslipData.payDate}
                      onChange={(e) => handleInputChange('payDate', e.target.value)}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      value={payslipData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    />
                  </Grid>

                  {/* Attendance Details */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                      Attendance Details
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Working Days"
                      value={payslipData.workingDays}
                      onChange={(e) => handleInputChange('workingDays', e.target.value)}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Present Days"
                      value={payslipData.presentDays}
                      onChange={(e) => handleInputChange('presentDays', e.target.value)}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Absent Days"
                      value={payslipData.absentDays}
                      onChange={(e) => handleInputChange('absentDays', e.target.value)}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Paid Leaves"
                      value={payslipData.paidLeaves}
                      onChange={(e) => handleInputChange('paidLeaves', e.target.value)}
                      type="number"
                    />
                  </Grid>

                  {/* Earnings */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'success.main' }}>
                      Earnings
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Basic Salary"
                      value={payslipData.basicSalary}
                      onChange={(e) => handleInputChange('basicSalary', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="House Rent Allowance (HRA)"
                      value={payslipData.hra}
                      onChange={(e) => handleInputChange('hra', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Transport Allowance"
                      value={payslipData.transportAllowance}
                      onChange={(e) => handleInputChange('transportAllowance', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Medical Allowance"
                      value={payslipData.medicalAllowance}
                      onChange={(e) => handleInputChange('medicalAllowance', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Special Allowance"
                      value={payslipData.specialAllowance}
                      onChange={(e) => handleInputChange('specialAllowance', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Other Earnings"
                      value={payslipData.otherEarnings}
                      onChange={(e) => handleInputChange('otherEarnings', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>

                  {/* Deductions */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'error.main' }}>
                      Deductions
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Provident Fund (PF)"
                      value={payslipData.providentFund}
                      onChange={(e) => handleInputChange('providentFund', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Professional Tax"
                      value={payslipData.professionalTax}
                      onChange={(e) => handleInputChange('professionalTax', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Income Tax (TDS)"
                      value={payslipData.incomeTax}
                      onChange={(e) => handleInputChange('incomeTax', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Other Deductions"
                      value={payslipData.otherDeductions}
                      onChange={(e) => handleInputChange('otherDeductions', e.target.value)}
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>

                  {/* Summary */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Gross Earnings</Typography>
                          <Typography variant="h6" color="success.main">
                            ₹{grossEarnings.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Total Deductions</Typography>
                          <Typography variant="h6" color="error.main">
                            ₹{totalDeductions.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Net Pay</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            ₹{netPay.toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 3 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSavePayslip}
                disabled={saving}
                size="large"
              >
                {saving ? 'Saving...' : 'Save Payslip'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={handlePrint}
                size="large"
              >
                Generate PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<Print />}
                onClick={handlePrint}
                size="large"
              >
                Print Payslip
              </Button>
            </Box>

            {/* Hidden Payslip for Print/PDF */}
            <Box sx={{ display: 'none' }}>
              <div ref={payslipRef}>
                <PayslipDocument />
              </div>
            </Box>
          </>
        )}

        {!payslipGenerated && (
          <Alert severity="info">
            Please select an employee to generate their payslip.
          </Alert>
        )}

        {/* Alert Snackbar */}
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={() => setAlert({ ...alert, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setAlert({ ...alert, open: false })}
            severity={alert.severity}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default PayslipGeneration;
