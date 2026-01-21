import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Alert,
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
  Refresh,
} from '@mui/icons-material';
import { AdminLayout } from './AdminDashboard';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import attendanceService from '../../services/attendanceService';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const AttendanceManagement = () => {
    // Manual attendance marking state
    const [manualMarkDialog, setManualMarkDialog] = useState(false);
    const [manualMarkInfo, setManualMarkInfo] = useState({ employee: null, date: null });
    const [manualMarkLoading, setManualMarkLoading] = useState(false);
    const [manualMarkError, setManualMarkError] = useState(null);
    // Handler for clicking a calendar day
    const handleCalendarDayClick = async (employee, dayData) => {
      const today = new Date();
      const clickedDate = new Date(dayData.date);
      if (dayData.status === 'weekend') return;
      if (dayData.status === 'present' || dayData.status === 'late') {
        // Fetch attendance details for this employee and date
        try {
          const response = await attendanceService.getEmployeeAttendanceDetails(employee.employeeId, 36);
          if (response.success && response.data && (response.data.Attendances || response.data.attendances)) {
            const attendances = response.data.Attendances || response.data.attendances;
            // Find the record for the clicked date
            const record = attendances.find(a => (a.Date || a.date) === dayData.date);
            if (record) {
              setSelectedEmployee({
                ...employee,
                ...record,
                date: dayData.date
              });
              setDetailsDialog(true);
              return;
            }
          }
        } catch (err) {
          // Optionally show error
        }
        return;
      }
      // Only allow manual mark for absent days
      if (dayData.status === 'absent') {
        setManualMarkInfo({ employee, date: dayData.date });
        if (clickedDate > today) {
          setManualMarkError('Cannot mark attendance for a future date.');
        } else {
          setManualMarkError(null);
        }
        setManualMarkDialog(true);
      }
    };

    // Handler for confirming manual mark
    const handleManualMarkConfirm = async () => {
      setManualMarkLoading(true);
      setManualMarkError(null);
      try {
        await attendanceService.markManualAttendance({
          employeeId: manualMarkInfo.employee.employeeId,
          date: manualMarkInfo.date,
          status: 'present',
          workHours: 8
        });
        setManualMarkDialog(false);
        setExpandedRow(null); // Close expanded rows
        setPage(0); // Reset pagination to first page
        setEmployeeCalendarData({}); // Clear calendar cache if needed
        await fetchMonthlyAttendance(); // Ensure state is updated before UI renders
      } catch (err) {
        setManualMarkError(err?.response?.data?.message || 'Failed to mark attendance');
      } finally {
        setManualMarkLoading(false);
      }
    };
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

  // API state management
  const [dailyAttendanceData, setDailyAttendanceData] = useState([]);
  const [monthlyAttendanceData, setMonthlyAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employeeCalendarData, setEmployeeCalendarData] = useState({});
  const [includeWeekends, setIncludeWeekends] = useState(false);

  const hasFetchedRef = useRef(false);
  const previousDailyBranchRef = useRef(null);
  const previousMonthlyBranchRef = useRef(null);
  const previousDateRef = useRef(null);
  const previousMonthRef = useRef(null);

  const currentBranch = getEffectiveBranch();

  // Fetch daily attendance when date or branch changes
  useEffect(() => {
    if (tabValue === 0 && (!hasFetchedRef.current || previousDailyBranchRef.current !== currentBranch || previousDateRef.current !== filterDate)) {
      hasFetchedRef.current = true;
      previousDailyBranchRef.current = currentBranch;
      previousDateRef.current = filterDate;
      fetchDailyAttendance();
    }
  }, [currentBranch, filterDate, tabValue]);

  // Fetch monthly attendance when month or branch changes
  useEffect(() => {
    if (tabValue === 1 && (previousMonthlyBranchRef.current !== currentBranch || previousMonthRef.current !== filterMonth)) {
      previousMonthlyBranchRef.current = currentBranch;
      previousMonthRef.current = filterMonth;
      setEmployeeCalendarData({}); // Clear calendar cache when month/branch changes
      setExpandedRow(null); // Close expanded rows
      fetchMonthlyAttendance();
    }
  }, [currentBranch, filterMonth, tabValue]);

  const fetchDailyAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        date: filterDate,
      };

      // Add branch filter only if not "All Branches"
      if (currentBranch && currentBranch !== 'All Branches') {
        params.branch = currentBranch;
      }

      const response = await attendanceService.getDailyAttendance(params);
      
      if (response.success) {
        setDailyAttendanceData(response.data || []);
      } else {
        setError('Failed to load daily attendance data');
      }
    } catch (err) {
      console.error('Error fetching daily attendance:', err);
      setError(err.response?.data?.message || 'Failed to load daily attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        month: filterMonth,
      };

      // Add branch filter only if not "All Branches"
      if (currentBranch && currentBranch !== 'All Branches') {
        params.branch = currentBranch;
      }

      const response = await attendanceService.getMonthlyAttendance(params);
      
      if (response.success) {
        setMonthlyAttendanceData(response.data || []);
        setIncludeWeekends(response.includeWeekends || false);
      } else {
        setError('Failed to load monthly attendance data');
      }
    } catch (err) {
      console.error('Error fetching monthly attendance:', err);
      setError(err.response?.data?.message || 'Failed to load monthly attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique departments from data
  const departments = ['All', ...new Set(
    (tabValue === 0 ? dailyAttendanceData : monthlyAttendanceData)
      .map(emp => emp.department)
      .filter(Boolean)
  )];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const filteredDailyData = dailyAttendanceData.filter(emp => {
    const matchesEmployee = !filterEmployee || 
      emp.employeeName?.toLowerCase().includes(filterEmployee.toLowerCase()) || 
      emp.employeeId?.toLowerCase().includes(filterEmployee.toLowerCase());
    const matchesDepartment = !filterDepartment || filterDepartment === 'All' || emp.department === filterDepartment;
    
    return matchesEmployee && matchesDepartment;
  });

  const filteredMonthlyData = monthlyAttendanceData.filter(emp => {
    const matchesEmployee = !filterEmployee || 
      emp.employeeName?.toLowerCase().includes(filterEmployee.toLowerCase()) || 
      emp.employeeId?.toLowerCase().includes(filterEmployee.toLowerCase());
    const matchesDepartment = !filterDepartment || filterDepartment === 'All' || emp.department === filterDepartment;
    
    return matchesEmployee && matchesDepartment;
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
        'Branch': emp.branch || 'N/A',
        'Status': getStatusLabel(emp.status),
        'Check In': emp.checkInTime || 'N/A',
        'Check Out': emp.checkOutTime || 'N/A',
        'Work Hours': emp.workHours ? `${emp.workHours}h` : 'N/A',
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
        'Branch': emp.branch || 'N/A',
        'Total Days': emp.totalDays,
        'Present Days': emp.presentDays,
        'Late Days': emp.lateDays,
        'Absent Days': emp.absentDays,
        'Attendance %': emp.attendancePercentage + '%',
        'Avg Hours': emp.avgHours + 'h'
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
    present: filteredDailyData.filter(emp => emp.status?.toLowerCase() === 'present').length,
    late: filteredDailyData.filter(emp => emp.status?.toLowerCase() === 'late').length,
    absent: filteredDailyData.filter(emp => emp.status?.toLowerCase() === 'absent').length,
    avgHours: filteredDailyData.length > 0 && filteredDailyData.some(emp => emp.workHours)
      ? (filteredDailyData.reduce((acc, emp) => acc + (emp.workHours || 0), 0) / filteredDailyData.filter(emp => emp.workHours).length).toFixed(1) 
      : '0'
  };

  // Calculate monthly statistics
  const monthlyStats = {
    total: filteredMonthlyData.length,
    avgAttendance: filteredMonthlyData.length > 0 ? (filteredMonthlyData.reduce((acc, emp) => acc + emp.attendancePercentage, 0) / filteredMonthlyData.length).toFixed(1) : 0,
    totalPresent: filteredMonthlyData.reduce((acc, emp) => acc + emp.presentDays, 0),
    totalAbsent: filteredMonthlyData.reduce((acc, emp) => acc + emp.absentDays, 0),
    avgHours: filteredMonthlyData.length > 0 ? (filteredMonthlyData.reduce((acc, emp) => acc + emp.avgHours, 0) / filteredMonthlyData.length).toFixed(1) : 0
  };

  // Generate daily attendance data for a specific employee and month
  const generateMonthlyCalendar = async (employeeId) => {
    // Check if we already have the data cached
    if (employeeCalendarData[employeeId]) {
      return employeeCalendarData[employeeId];
    }

    try {
      // Fetch employee attendance details for the month
      const [year, month] = filterMonth.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // Fetch attendance data from API
      const response = await attendanceService.getEmployeeAttendanceDetails(employeeId, daysInMonth + 5);
      
      if (!response.success) {
        console.error('Failed to fetch employee attendance details');
        return [];
      }

      const attendances = response.data.Attendances || response.data.attendances || [];
      
      // Create a map of dates to attendance records
      const attendanceMap = {};
      attendances.forEach(att => {
        attendanceMap[att.Date || att.date] = att;
      });

      const attendanceData = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        
        let status = 'absent';
        
        // First check if there's actual attendance data for this date
        const attendance = attendanceMap[dateStr];
        
        if (attendance) {
          // Determine status based on check-in time
          const checkInTime = attendance.CheckInTime || attendance.checkInTime;
          if (checkInTime) {
            // Parse time to determine if late
            const timeParts = checkInTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (timeParts) {
              let hours = parseInt(timeParts[1]);
              const minutes = parseInt(timeParts[2]);
              const period = timeParts[3].toUpperCase();
              
              if (period === 'PM' && hours !== 12) hours += 12;
              if (period === 'AM' && hours === 12) hours = 0;
              
              const checkInMinutes = hours * 60 + minutes;
              const standardTime = 9 * 60; // 9:00 AM
              const lateThreshold = standardTime + 15; // 9:15 AM
              
              if (checkInMinutes > lateThreshold) {
                status = 'late';
              } else {
                status = 'present';
              }
            } else {
              status = 'present';
            }
          }
        } else {
          // Only mark as weekend if there's no attendance data and weekends are not included
          if (!includeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
            status = 'weekend';
          }
        }

        attendanceData.push({
          day,
          date: dateStr,
          status,
          dayOfWeek
        });
      }

      // Cache the data
      setEmployeeCalendarData(prev => ({
        ...prev,
        [employeeId]: attendanceData
      }));

      return attendanceData;
    } catch (error) {
      console.error('Error generating monthly calendar:', error);
      return [];
    }
  };

  const handleToggleExpand = async (employeeId) => {
    if (expandedRow === employeeId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(employeeId);
      // Pre-fetch calendar data when expanding
      if (!employeeCalendarData[employeeId]) {
        await generateMonthlyCalendar(employeeId);
      }
    }
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

  const handleRefresh = () => {
    if (tabValue === 0) {
      fetchDailyAttendance();
    } else {
      fetchMonthlyAttendance();
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset pagination
    setExpandedRow(null); // Close any expanded rows
    setEmployeeCalendarData({}); // Clear calendar cache when switching tabs
    // useEffect will handle fetching when tab changes
  };

  // Show loading state
  if (loading && (dailyAttendanceData.length === 0 && monthlyAttendanceData.length === 0)) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportExcel}
              sx={{ background: 'linear-gradient(135deg, #64B5F6, #42A5F5)' }}
              disabled={loading || (tabValue === 0 ? filteredDailyData.length === 0 : filteredMonthlyData.length === 0)}
            >
              Download Excel
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <IconButton color="inherit" size="small" onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Tabs */}
        <Card sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Daily Attendance Tracker" />
              <Tab label="Monthly Attendance Tracker" />
            </Tabs>
          </Box>
        </Card>

        <TabPanel value={tabValue} index={0}>
          {/* Daily Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
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

          <Grid item xs={12} sm={6} md={4}>
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

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'error.main', mr: 2 }}>
                    <CalendarMonth />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{dailyStats.late + dailyStats.absent}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Late + Absent
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
                    <TableCell>Branch</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Hours</TableCell>
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
                        <TableCell>{employee.branch || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(employee.status)}
                            color={getStatusColor(employee.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{employee.checkInTime || '-'}</TableCell>
                        <TableCell>{employee.checkOutTime || '-'}</TableCell>
                        <TableCell>
                          {employee.workHours ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {employee.workHours}h
                              <LinearProgress
                                variant="determinate"
                                value={(employee.workHours / 8) * 100}
                                sx={{ width: 50, height: 4 }}
                              />
                            </Box>
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
                      <Typography variant="h6">{monthlyStats.totalAbsent}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Absent Days
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
                  <TextField
                    fullWidth
                    label="Employee Name/ID"
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
                    placeholder="Search employee..."
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
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
                        const monthlyCalendar = employeeCalendarData[employee.employeeId] || [];
                        
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
                                  label={`N/A`}
                                  color="default"
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
                                  {monthlyCalendar.length === 0 ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                      <CircularProgress size={24} />
                                    </Box>
                                  ) : (
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
                                              cursor: dayData.status !== 'weekend' ? 'pointer' : 'default',
                                              transition: 'transform 0.2s',
                                              '&:hover': {
                                                transform: dayData.status !== 'weekend' ? 'scale(1.1)' : 'none',
                                                boxShadow: dayData.status !== 'weekend' ? 2 : 0
                                              }
                                            }}
                                            onClick={() => handleCalendarDayClick(employee, dayData)}
                                          >
                                            {dayData.day}
                                          </Box>
                                        </Tooltip>
                                      ))}
                                                    {/* Manual Mark Attendance Dialog */}
                                                    <Dialog open={manualMarkDialog} onClose={() => setManualMarkDialog(false)}>
                                                      <DialogTitle>Manually Mark Attendance</DialogTitle>
                                                      <DialogContent>
                                                        <Typography>
                                                          Mark <b>{manualMarkInfo.employee?.employeeName}</b> as <b>Present</b> for <b>{manualMarkInfo.date}</b> with 8 hours?
                                                        </Typography>
                                                        {manualMarkError && <Alert severity="error" sx={{ mt: 2 }}>{manualMarkError}</Alert>}
                                                      </DialogContent>
                                                      <DialogActions>
                                                        <Button onClick={() => setManualMarkDialog(false)} disabled={manualMarkLoading}>Cancel</Button>
                                                        <Button onClick={handleManualMarkConfirm} variant="contained" disabled={manualMarkLoading}>
                                                          {manualMarkLoading ? <CircularProgress size={20} /> : 'Mark Present'}
                                                        </Button>
                                                      </DialogActions>
                                                    </Dialog>
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
                                  )}
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
                  <Typography><strong>Branch:</strong> {selectedEmployee.branch || 'N/A'}</Typography>
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
                  <Typography variant="h6" gutterBottom>Attendance Details</Typography>
                  <Typography><strong>Check In:</strong> {selectedEmployee.checkInTime || 'Not checked in'}</Typography>
                  <Typography><strong>Check Out:</strong> {selectedEmployee.checkOutTime || 'Not checked out'}</Typography>
                  <Typography><strong>Work Hours:</strong> {selectedEmployee.workHours ? `${selectedEmployee.workHours}h` : 'N/A'}</Typography>
                  {/*<Typography><strong>Location:</strong> {selectedEmployee.location || 'N/A'}</Typography>*/}
                  <Typography><strong>Productivity Rating:</strong> {selectedEmployee.productivityRating !== undefined && selectedEmployee.productivityRating !== null ? selectedEmployee.productivityRating : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Typography>{selectedEmployee.notes || 'No notes available'}</Typography>
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