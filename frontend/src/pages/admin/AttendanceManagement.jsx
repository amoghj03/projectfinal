import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Tooltip,
  TablePagination,
  LinearProgress,
  Tabs,
  Tab,
  Autocomplete,
} from '@mui/material';
import { useBranch } from '../../contexts/BranchContext';
import {
  FileDownload,
  Visibility,
  FilterList,
  AccessTime,
  TrendingUp,
  CalendarMonth,
  Person,
  Business,
    ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { AdminLayout } from './AdminDashboard';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const AttendanceManagement = () => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const [tabValue, setTabValue] = useState(0);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);

  // Mock attendance data
  const [attendanceData] = useState([
    {
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Customer Service',
      branch: 'Main Branch',
      status: 'present',
      markedTime: '09:15 AM',
      workSummary: 'Processed 15 loan applications, handled 25 customer calls, resolved 3 complaints',
      totalHours: 8,
      selfScore: 8,
      date: '2025-11-22'
    },
    {
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'IT Support',
      branch: 'Tech Center',
      status: 'late',
      markedTime: '09:45 AM',
      workSummary: 'Fixed server issues, updated 10 workstations, resolved network connectivity problems',
      totalHours: 7.5,
      selfScore: 7,
      date: '2025-11-22'
    },
    {
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      department: 'Accounts',
      branch: 'Downtown Branch',
      status: 'absent',
      markedTime: '-',
      workSummary: '-',
      totalHours: 0,
      selfScore: 0,
      date: '2025-11-22'
    },
    {
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      department: 'HR',
      branch: 'Main Branch',
      status: 'present',
      markedTime: '08:55 AM',
      workSummary: 'Conducted 3 interviews, updated employee policies, processed 5 onboarding documents',
      totalHours: 8.5,
      selfScore: 9,
      date: '2025-11-22'
    },
    {
      employeeId: 'EMP005',
      employeeName: 'David Brown',
      department: 'Customer Service',
      branch: 'Main Branch',
      status: 'present',
      markedTime: '09:10 AM',
      workSummary: 'Handled customer inquiries, processed account openings, completed training module',
      totalHours: 8,
      selfScore: 8,
      date: '2025-11-22'
    },
    {
      employeeId: 'EMP006',
      employeeName: 'Emily Davis',
      department: 'IT Support',
      branch: 'Tech Center',
      status: 'present',
      markedTime: '08:50 AM',
      workSummary: 'Database maintenance, security updates, user account management, system backups',
      totalHours: 8.2,
      selfScore: 9,
      date: '2025-11-22'
    },
    {
      employeeId: 'EMP007',
      employeeName: 'Robert Miller',
      department: 'Accounts',
      branch: 'Downtown Branch',
      status: 'present',
      markedTime: '09:05 AM',
      workSummary: 'Reconciled 50 accounts, prepared monthly reports, audited transaction records',
      totalHours: 7.8,
      selfScore: 8,
      date: '2024-11-22'
    },
    {
      employeeId: 'EMP008',
      employeeName: 'Lisa Garcia',
      department: 'HR',
      branch: 'West Branch',
      status: 'late',
      markedTime: '09:35 AM',
      workSummary: 'Employee relations meeting, policy updates, performance reviews scheduling',
      totalHours: 7.3,
      selfScore: 7,
      date: '2024-11-22'
    },
    {
      employeeId: 'EMP009',
      employeeName: 'Thomas Anderson',
      department: 'Customer Service',
      branch: 'East Branch',
      status: 'present',
      markedTime: '08:45 AM',
      workSummary: 'VIP customer service, complaint escalations, cross-selling activities, team training',
      totalHours: 8.7,
      selfScore: 9,
      date: '2024-11-22'
    },
    {
      employeeId: 'EMP010',
      employeeName: 'Maria Rodriguez',
      department: 'Management',
      branch: 'Main Branch',
      status: 'present',
      markedTime: '08:30 AM',
      workSummary: 'Team meetings, strategic planning, budget reviews, performance analysis',
      totalHours: 9,
      selfScore: 9,
      date: '2024-11-22'
    },
    {
      employeeId: 'EMP011',
      employeeName: 'James Wilson',
      department: 'IT Support',
      status: 'absent',
      markedTime: '-',
      workSummary: '-',
      totalHours: 0,
      selfScore: 0,
      date: '2024-11-22'
    },
    {
      employeeId: 'EMP012',
      employeeName: 'Jennifer Lee',
      department: 'Accounts',
      status: 'present',
      markedTime: '09:20 AM',
      workSummary: 'Financial reporting, budget analysis, vendor payments processing, compliance checks',
      totalHours: 8.1,
      selfScore: 8,
      date: '2024-11-22'
    },
    {
      employeeId: 'EMP013',
      employeeName: 'Michael Chen',
      department: 'Customer Service',
      status: 'late',
      markedTime: '09:50 AM',
      workSummary: 'Customer onboarding, product demonstrations, sales support, documentation updates',
      totalHours: 7.2,
      selfScore: 6,
      date: '2024-11-22'
    },
    {
      employeeId: 'EMP014',
      employeeName: 'Amanda Taylor',
      department: 'HR',
      status: 'present',
      markedTime: '08:40 AM',
      workSummary: 'Recruitment activities, employee benefits administration, training coordination',
      totalHours: 8.3,
      selfScore: 8,
      date: '2024-11-22'
    },
    {
      employeeId: 'EMP015',
      employeeName: 'Daniel White',
      department: 'Management',
      branch: 'Main Branch',
      status: 'present',
      markedTime: '08:25 AM',
      workSummary: 'Department coordination, client meetings, project oversight, quality assurance reviews',
      totalHours: 9.2,
      selfScore: 9,
      date: '2024-11-22'
    },
  ]);

  // Monthly attendance summary data
  const [monthlyAttendanceData] = useState([
    {
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Customer Service',
      branch: 'Main Branch',
      totalDays: 22,
      presentDays: 20,
      lateDays: 2,
      absentDays: 0,
      avgHours: 8.2,
      avgScore: 8.1,
      attendancePercentage: 90.9
    },
    {
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'IT Support',
      branch: 'Tech Center',
      totalDays: 22,
      presentDays: 19,
      lateDays: 1,
      absentDays: 2,
      avgHours: 7.8,
      avgScore: 7.5,
      attendancePercentage: 86.4
    },
    {
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      department: 'Accounts',
      branch: 'Downtown Branch',
      totalDays: 22,
      presentDays: 18,
      lateDays: 3,
      absentDays: 1,
      avgHours: 7.9,
      avgScore: 7.2,
      attendancePercentage: 81.8
    },
    {
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      department: 'HR',
      branch: 'Main Branch',
      totalDays: 22,
      presentDays: 21,
      lateDays: 1,
      absentDays: 0,
      avgHours: 8.5,
      avgScore: 8.8,
      attendancePercentage: 95.5
    },
    {
      employeeId: 'EMP005',
      employeeName: 'David Brown',
      department: 'Customer Service',
      branch: 'Main Branch',
      totalDays: 22,
      presentDays: 17,
      lateDays: 2,
      absentDays: 3,
      avgHours: 7.3,
      avgScore: 6.9,
      attendancePercentage: 77.3
    }
  ]);

  const employees = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown',
    'Emily Davis', 'Robert Miller', 'Lisa Garcia', 'Thomas Anderson', 'Maria Rodriguez',
    'James Wilson', 'Jennifer Lee', 'Michael Chen', 'Amanda Taylor', 'Daniel White'
  ];
  const departments = ['All', 'Customer Service', 'IT Support', 'Accounts', 'HR', 'Management'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'late': return 'Late';
      case 'absent': return 'Absent';
      default: return status;
    }
  };

  const filteredDailyData = attendanceData.filter(emp => {
    const matchesDate = !filterDate || emp.date === filterDate;
    const matchesEmployee = !filterEmployee || emp.employeeName.toLowerCase().includes(filterEmployee.toLowerCase()) || emp.employeeId.toLowerCase().includes(filterEmployee.toLowerCase());
    const matchesDepartment = !filterDepartment || filterDepartment === 'All' || emp.department === filterDepartment;
    
    // Branch filtering - Super admin sees all branches, regular admin sees only their branch
    const currentBranch = getEffectiveBranch();
    const matchesBranch = isSuperAdmin && currentBranch === 'All Branches' 
      ? true 
      : emp.branch === currentBranch;
    
    return matchesDate && matchesEmployee && matchesDepartment && matchesBranch;
  });

  const filteredMonthlyData = monthlyAttendanceData.filter(emp => {
    const matchesEmployee = !filterEmployee || emp.employeeName.toLowerCase().includes(filterEmployee.toLowerCase()) || emp.employeeId.toLowerCase().includes(filterEmployee.toLowerCase());
    const matchesDepartment = !filterDepartment || filterDepartment === 'All' || emp.department === filterDepartment;
    
    // Branch filtering - Super admin sees all branches, regular admin sees only their branch
    const currentBranch = getEffectiveBranch();
    const matchesBranch = isSuperAdmin && currentBranch === 'All Branches' 
      ? true 
      : emp.branch === currentBranch;
    
    return matchesEmployee && matchesDepartment && matchesBranch;
  });

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setDetailsDialog(true);
  };

  const handleExportExcel = () => {
    if (tabValue === 0) {
      // Export daily data
      const exportData = filteredDailyData.map(emp => ({
        'Employee ID': emp.employeeId,
        'Employee Name': emp.employeeName,
        'Department': emp.department,
        'Status': getStatusLabel(emp.status),
        'Marked Time': emp.markedTime,
        'Work Summary': emp.workSummary,
        'Total Hours': emp.totalHours,
        'Self Score': emp.selfScore,
        'Date': emp.date
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Daily Attendance');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `daily_attendance_${filterDate}.xlsx`);
    } else {
      // Export monthly data
      const exportData = filteredMonthlyData.map(emp => ({
        'Employee ID': emp.employeeId,
        'Employee Name': emp.employeeName,
        'Department': emp.department,
        'Total Days': emp.totalDays,
        'Present Days': emp.presentDays,
        'Late Days': emp.lateDays,
        'Absent Days': emp.absentDays,
        'Attendance %': emp.attendancePercentage + '%',
        'Avg Hours': emp.avgHours,
        'Avg Score': emp.avgScore
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Monthly Attendance');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `monthly_attendance_${filterMonth}.xlsx`);
    }
  };

  // Calculate daily statistics
  const dailyStats = {
    total: filteredDailyData.length,
    present: filteredDailyData.filter(emp => emp.status === 'present').length,
    late: filteredDailyData.filter(emp => emp.status === 'late').length,
    absent: filteredDailyData.filter(emp => emp.status === 'absent').length,
    avgHours: filteredDailyData.length > 0 ? (filteredDailyData.reduce((acc, emp) => acc + emp.totalHours, 0) / filteredDailyData.length).toFixed(1) : 0,
    avgScore: filteredDailyData.filter(emp => emp.selfScore > 0).length > 0 ? (filteredDailyData.filter(emp => emp.selfScore > 0).reduce((acc, emp) => acc + emp.selfScore, 0) / filteredDailyData.filter(emp => emp.selfScore > 0).length).toFixed(1) : 0
  };

  // Calculate monthly statistics
  const monthlyStats = {
    total: filteredMonthlyData.length,
    avgAttendance: filteredMonthlyData.length > 0 ? (filteredMonthlyData.reduce((acc, emp) => acc + emp.attendancePercentage, 0) / filteredMonthlyData.length).toFixed(1) : 0,
    totalPresent: filteredMonthlyData.reduce((acc, emp) => acc + emp.presentDays, 0),
    totalAbsent: filteredMonthlyData.reduce((acc, emp) => acc + emp.absentDays, 0),
    avgHours: filteredMonthlyData.length > 0 ? (filteredMonthlyData.reduce((acc, emp) => acc + emp.avgHours, 0) / filteredMonthlyData.length).toFixed(1) : 0,
    avgScore: filteredMonthlyData.length > 0 ? (filteredMonthlyData.reduce((acc, emp) => acc + emp.avgScore, 0) / filteredMonthlyData.length).toFixed(1) : 0
  };

  // Generate daily attendance data for a specific employee and month
  const generateMonthlyCalendar = (employeeId) => {
    const [year, month] = filterMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const attendanceData = [];

    // Generate random attendance pattern for demo
    for (let day = 1; day <= daysInMonth; day++) {
      const random = Math.random();
      let status = 'present';
      
      // Weekend detection (assuming Saturday=6, Sunday=0)
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'weekend';
      } else {
        if (random < 0.05) {
          status = 'absent';
        } else if (random < 0.15) {
          status = 'late';
        } else {
          status = 'present';
        }
      }

      attendanceData.push({
        day,
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        status,
        dayOfWeek
      });
    }

    return attendanceData;
  };

  const handleToggleExpand = (employeeId) => {
    setExpandedRow(expandedRow === employeeId ? null : employeeId);
  };

  const getDayColor = (status) => {
    switch (status) {
      case 'present': return '#4caf50'; // green
      case 'late': return '#ff9800'; // orange
      case 'absent': return '#f44336'; // red
      case 'weekend': return '#e0e0e0'; // gray
      default: return '#fff';
    }
  };

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4">
              Employee Attendance Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Business fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                Viewing: {getEffectiveBranch()}
              </Typography>
              {!isSuperAdmin && (
                <Chip 
                  label="Branch Admin" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            sx={{ background: 'linear-gradient(135deg, #64B5F6, #42A5F5)' }}
          >
            Download Excel
          </Button>
        </Box>

        {/* Tabs */}
        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Daily Attendance Tracker" />
              <Tab label="Monthly Attendance Tracker" />
            </Tabs>
          </Box>
        </Card>

        <TabPanel value={tabValue} index={0}>
          {/* Daily Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{dailyStats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Employees
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'success.main', mr: 2 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{dailyStats.present}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Present Today
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'warning.main', mr: 2 }}>
                    <AccessTime />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{dailyStats.avgHours}h</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Work Hours
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'info.main', mr: 2 }}>
                    <CalendarMonth />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{dailyStats.avgScore}/10</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Self Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <FilterList />
              <TextField
                label="Date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Employee Name/ID"
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Marked Time</TableCell>
                    <TableCell>Work Summary</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Self Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDailyData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((employee) => (
                      <TableRow key={employee.employeeId}>
                        <TableCell>{employee.employeeId}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: 14 }}>
                              {employee.employeeName.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            {employee.employeeName}
                          </Box>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(employee.status)}
                            color={getStatusColor(employee.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{employee.markedTime}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {employee.workSummary.substring(0, 40)}
                            {employee.workSummary.length > 40 && '...'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {employee.totalHours}h
                            <LinearProgress
                              variant="determinate"
                              value={(employee.totalHours / 8) * 100}
                              sx={{ width: 50, height: 4 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          {employee.selfScore > 0 ? (
                            <Chip
                              label={`${employee.selfScore}/10`}
                              color={employee.selfScore >= 8 ? 'success' : employee.selfScore >= 6 ? 'warning' : 'error'}
                              size="small"
                            />
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewDetails(employee)}
                              size="small"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDailyData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Monthly Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{monthlyStats.total}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Employees
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ backgroundColor: 'success.main', mr: 2 }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{monthlyStats.avgAttendance}%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Attendance
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ backgroundColor: 'info.main', mr: 2 }}>
                      <AccessTime />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{monthlyStats.avgHours}h</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Hours/Day
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ backgroundColor: 'warning.main', mr: 2 }}>
                      <CalendarMonth />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{monthlyStats.avgScore}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Score
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Monthly Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Month"
                    type="month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    fullWidth
                    options={employees}
                    value={filterEmployee || null}
                    onChange={(event, newValue) => setFilterEmployee(newValue || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Employee"
                        placeholder="Search employee..."
                      />
                    )}
                    freeSolo
                    clearOnEscape
                    includeInputInList
                    filterOptions={(options, { inputValue }) => {
                      const filtered = options.filter(option =>
                        option.toLowerCase().includes(inputValue.toLowerCase())
                      );
                      return inputValue === '' ? ['All Employees', ...filtered] : filtered;
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      label="Department"
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      <MenuItem value="Customer Service">Customer Service</MenuItem>
                      <MenuItem value="IT Support">IT Support</MenuItem>
                      <MenuItem value="Accounts">Accounts</MenuItem>
                      <MenuItem value="HR">HR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Monthly Attendance Table */}
          <Card>
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee ID</TableCell>
                      <TableCell>Employee Name</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Present Days</TableCell>
                      <TableCell>Absent Days</TableCell>
                      <TableCell>Late Days</TableCell>
                      <TableCell>Attendance %</TableCell>
                      <TableCell>Avg Hours</TableCell>
                      <TableCell>Avg Score</TableCell>
                      <TableCell align="center">Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMonthlyData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((employee) => {
                        const isExpanded = expandedRow === employee.employeeId;
                        const monthlyCalendar = isExpanded ? generateMonthlyCalendar(employee.employeeId) : [];
                        
                        return (
                          <React.Fragment key={employee.employeeId}>
                            <TableRow>
                              <TableCell>{employee.employeeId}</TableCell>
                              <TableCell>{employee.employeeName}</TableCell>
                              <TableCell>{employee.department}</TableCell>
                              <TableCell>
                                <Chip
                                  label={employee.presentDays}
                                  color="success"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={employee.absentDays}
                                  color={employee.absentDays > 2 ? "error" : "default"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={employee.lateDays}
                                  color={employee.lateDays > 3 ? "warning" : "default"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {employee.attendancePercentage}%
                                  <LinearProgress
                                    variant="determinate"
                                    value={employee.attendancePercentage}
                                    sx={{ width: 50, height: 4 }}
                                    color={employee.attendancePercentage >= 90 ? 'success' : employee.attendancePercentage >= 80 ? 'warning' : 'error'}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell>{employee.avgHours}h</TableCell>
                              <TableCell>
                                <Chip
                                  label={`${employee.avgScore}/10`}
                                  color={employee.avgScore >= 8 ? 'success' : employee.avgScore >= 6 ? 'warning' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title={isExpanded ? "Hide Calendar" : "Show Calendar"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleExpand(employee.employeeId)}
                                    color="primary"
                                  >
                                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={10} sx={{ backgroundColor: '#f5f5f5', p: 3 }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CalendarMonth /> Monthly Attendance Calendar - {filterMonth}
                                    </Typography>
                                    <Box sx={{ 
                                      display: 'grid', 
                                      gridTemplateColumns: 'repeat(7, 1fr)', 
                                      gap: 0.5,
                                      mt: 2,
                                      maxWidth: 400
                                    }}>
                                      {/* Day headers */}
                                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <Box
                                          key={day}
                                          sx={{
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem',
                                            color: 'text.secondary',
                                            pb: 0.5
                                          }}
                                        >
                                          {day}
                                        </Box>
                                      ))}
                                      
                                      {/* Empty cells for first week alignment */}
                                      {Array.from({ length: monthlyCalendar[0]?.dayOfWeek || 0 }).map((_, idx) => (
                                        <Box key={`empty-${idx}`} />
                                      ))}
                                      
                                      {/* Calendar days */}
                                      {monthlyCalendar.map((dayData) => (
                                        <Tooltip
                                          key={dayData.day}
                                          title={`${dayData.date}: ${getStatusLabel(dayData.status)}`}
                                          arrow
                                        >
                                          <Box
                                            sx={{
                                              width: 40,
                                              height: 40,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              backgroundColor: getDayColor(dayData.status),
                                              color: dayData.status === 'weekend' ? '#666' : '#fff',
                                              borderRadius: 0.5,
                                              fontWeight: 'bold',
                                              fontSize: '0.75rem',
                                              cursor: 'pointer',
                                              transition: 'transform 0.2s',
                                              '&:hover': {
                                                transform: 'scale(1.1)',
                                                boxShadow: 2
                                              }
                                            }}
                                          >
                                            {dayData.day}
                                          </Box>
                                        </Tooltip>
                                      ))}
                                    </Box>
                                    
                                    {/* Legend */}
                                    <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 16, height: 16, backgroundColor: getDayColor('present'), borderRadius: 0.5 }} />
                                        <Typography variant="caption">Present</Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 16, height: 16, backgroundColor: getDayColor('late'), borderRadius: 0.5 }} />
                                        <Typography variant="caption">Late</Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 16, height: 16, backgroundColor: getDayColor('absent'), borderRadius: 0.5 }} />
                                        <Typography variant="caption">Absent</Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 16, height: 16, backgroundColor: getDayColor('weekend'), borderRadius: 0.5 }} />
                                        <Typography variant="caption">Weekend</Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredMonthlyData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </CardContent>
          </Card>
        </TabPanel>

        {/* Employee Details Dialog */}
        <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Employee Attendance Details - {selectedEmployee?.employeeName}
          </DialogTitle>
          <DialogContent>
            {selectedEmployee && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Typography><strong>Employee ID:</strong> {selectedEmployee.employeeId}</Typography>
                  <Typography><strong>Department:</strong> {selectedEmployee.department}</Typography>
                  <Typography><strong>Date:</strong> {selectedEmployee.date}</Typography>
                  <Typography><strong>Status:</strong> 
                    <Chip
                      label={getStatusLabel(selectedEmployee.status)}
                      color={getStatusColor(selectedEmployee.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Work Summary</Typography>
                  <Typography><strong>Marked Time:</strong> {selectedEmployee.markedTime}</Typography>
                  <Typography><strong>Total Hours:</strong> {selectedEmployee.totalHours}h</Typography>
                  <Typography><strong>Self Score:</strong> {selectedEmployee.selfScore}/10</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Work Done Today</Typography>
                  <Typography>{selectedEmployee.workSummary}</Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AttendanceManagement;