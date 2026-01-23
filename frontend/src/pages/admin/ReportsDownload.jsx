import React, { useState } from 'react';
import { useEffect } from 'react';
import adminAttendanceService from '../../services/adminAttendanceService';
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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Divider,
  Paper,
  Snackbar,
} from '@mui/material';
import {
  FileDownload,
  Assessment,
  People,
  ReportProblem,
  BugReport,
  CalendarMonth,
  PictureAsPdf,
  TableChart,
  Business,
} from '@mui/icons-material';
import { useBranch } from '../../contexts/BranchContext';
import { AdminLayout } from './AdminDashboard';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

const ReportsDownload = () => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const [selectedReport, setSelectedReport] = useState('');
  // Set dateFrom to the start of the current month and dateTo to today
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // Format as yyyy-mm-dd in local time
  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const [dateFrom, setDateFrom] = useState(formatDateLocal(startOfMonth));
  const [dateTo, setDateTo] = useState(formatDateLocal(today));
  const [department, setDepartment] = useState('All');
  // Always use XLSX format

  // Read access object from localStorage (expects a JSON string)
  let access = {
    attendance: false,
    skillReports: false,
    complaints: false,
    techIssues: false
  };
  try {
    const accessStr = localStorage.getItem('adminPermissions');
    if (accessStr) {
      const parsed = JSON.parse(accessStr);
      access = {
        attendance: !!parsed.attendance,
        skillReports: !!parsed.skillReports,
        complaints: !!parsed.complaints,
        techIssues: !!parsed.techIssues
      };
    }
  } catch (e) {
    // fallback to all false if parsing fails
  }

  // Build reports array based on access
  const reports = [];
  if (access.attendance) {
    reports.push({
      id: 'attendance',
      title: 'Employee Attendance Report',
      description: 'Comprehensive attendance data including work hours, self-ratings, and productivity metrics',
      icon: <People />, 
      color: 'primary',
      fields: ['Employee ID', 'Name', 'Attendance Status', 'Work Hours', 'Self Rating', 'Productivity Score']
    });
  }
  if (access.skillReports) {
    reports.push({
      id: 'skill_tests',
      title: 'Skill Test Performance Report',
      description: 'Employee skill assessment results, scores, and improvement tracking',
      icon: <Assessment />, 
      color: 'success',
      fields: ['Employee ID', 'Name', 'Skill Area', 'Test Score', 'Pass/Fail Status', 'Previous Score', 'Improvement']
    });
  }
  if (access.complaints) {
    reports.push({
      id: 'complaints',
      title: 'Complaints Summary Report',
      description: 'All employee complaints with status, resolution details, and timelines',
      icon: <ReportProblem />, 
      color: 'warning',
      fields: ['Complaint ID', 'Employee', 'Category', 'Priority', 'Status', 'Resolution', 'Timeline']
    });
  }
  if (access.techIssues) {
    reports.push({
      id: 'tech_issues',
      title: 'Technical Issues Report',
      description: 'Tech issues reported, employee resolutions, and admin approval status',
      icon: <BugReport />, 
      color: 'error',
      fields: ['Issue ID', 'Employee', 'Category', 'Impact Level', 'Status', 'Resolution', 'Approval Status']
    });
  }
  // Add comprehensive report if at least one other report is visible
  if (reports.length > 0) {
    reports.push({
      id: 'comprehensive',
      title: 'Comprehensive Employee Report',
      description: 'Complete employee data including attendance, skills, complaints, and technical contributions',
      icon: <CalendarMonth />, 
      color: 'info',
      fields: ['All employee metrics combined in one comprehensive report']
    });
  }

  const departments = ['All', 'Customer Service', 'IT Support', 'Accounts', 'HR', 'Management'];

  // Attendance data state
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  // Snackbar state for notifications (copied from TechIssuesManagement)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const showError = (msg) => {
    setSnackbar({ open: true, message: msg, severity: 'error' });
  } 

  const generateSkillTestData = () => {
    const allData = [
      {
        'Employee ID': 'EMP001',
        'Employee Name': 'John Doe',
        'Department': 'Customer Service',
        'Branch': 'Main Branch',
        'Skill Area': 'Banking Operations',
        'Test Date': '2024-11-15',
        'Test Score': 85,
        'Status': 'Pass',
        'Previous Score': 78,
        'Improvement': 7,
        'Next Test Due': '2025-01-15'
      },
      {
        'Employee ID': 'EMP002',
        'Employee Name': 'Jane Smith',
        'Department': 'IT Support',
        'Branch': 'Tech Center',
        'Skill Area': 'Technical Support',
        'Test Date': '2024-11-20',
        'Test Score': 92,
        'Status': 'Pass',
        'Previous Score': 89,
        'Improvement': 3,
        'Next Test Due': '2025-01-20'
      },
      {
        'Employee ID': 'EMP003',
        'Employee Name': 'Mike Johnson',
        'Department': 'Accounts',
        'Branch': 'Downtown Branch',
        'Skill Area': 'Financial Analysis',
        'Test Date': '2024-11-18',
        'Test Score': 78,
        'Status': 'Pass',
        'Previous Score': 72,
        'Improvement': 6,
        'Next Test Due': '2025-01-18'
      },
      {
        'Employee ID': 'EMP004',
        'Employee Name': 'Sarah Wilson',
        'Department': 'HR',
        'Branch': 'Main Branch',
        'Skill Area': 'HR Management',
        'Test Date': '2024-11-22',
        'Test Score': 88,
        'Status': 'Pass',
        'Previous Score': 85,
        'Improvement': 3,
        'Next Test Due': '2025-01-22'
      },
      {
        'Employee ID': 'EMP005',
        'Employee Name': 'David Brown',
        'Department': 'Customer Service',
        'Branch': 'East Branch',
        'Skill Area': 'Customer Relations',
        'Test Date': '2024-11-19',
        'Test Score': 82,
        'Status': 'Pass',
        'Previous Score': 79,
        'Improvement': 3,
        'Next Test Due': '2025-01-19'
      }
    ];
    
    const effectiveBranch = getEffectiveBranch();
    if (isSuperAdmin || effectiveBranch === 'All Branches') {
      return allData;
    }
    return allData.filter(record => record.Branch === effectiveBranch);
  };

  const generateComplaintsData = () => {
    const allData = [
      {
        'Complaint ID': 'CMP001',
        'Employee ID': 'EMP001',
        'Employee Name': 'John Doe',
        'Department': 'Customer Service',
        'Branch': 'Main Branch',
        'Title': 'Inadequate workplace lighting',
        'Category': 'Workplace Environment',
        'Priority': 'Medium',
        'Status': 'Open',
        'Submitted Date': '2024-11-20',
        'Assigned To': 'Facilities Team',
        'Description': 'The lighting in the third floor workspace is insufficient'
      },
      {
        'Complaint ID': 'CMP002',
        'Employee ID': 'EMP002',
        'Employee Name': 'Jane Smith',
        'Department': 'IT Support',
        'Branch': 'Tech Center',
        'Title': 'Harassment by supervisor',
        'Category': 'HR Issue',
        'Priority': 'High',
        'Status': 'In Progress',
        'Submitted Date': '2024-11-18',
        'Assigned To': 'HR Department',
        'Description': 'Experiencing inappropriate behavior from supervisor'
      },
      {
        'Complaint ID': 'CMP003',
        'Employee ID': 'EMP003',
        'Employee Name': 'Mike Johnson',
        'Department': 'Accounts',
        'Branch': 'Downtown Branch',
        'Title': 'Outdated computer equipment',
        'Category': 'IT Equipment',
        'Priority': 'Low',
        'Status': 'Resolved',
        'Submitted Date': '2024-11-15',
        'Assigned To': 'IT Department',
        'Description': 'Computer hardware needs upgrade'
      }
    ];
    
    const effectiveBranch = getEffectiveBranch();
    if (isSuperAdmin || effectiveBranch === 'All Branches') {
      return allData;
    }
    return allData.filter(record => record.Branch === effectiveBranch);
  };

  const generateTechIssuesData = () => {
    const allData = [
      {
        'Issue ID': 'TECH001',
        'Employee ID': 'EMP001',
        'Employee Name': 'John Doe',
        'Department': 'Customer Service',
        'Branch': 'Main Branch',
        'Title': 'Login system timeout error',
        'Category': 'Authentication',
        'Impact Level': 'Medium',
        'Status': 'Pending Approval',
        'Submitted Date': '2024-11-20',
        'Employee Resolution': 'Updated session timeout configuration',
        'Admin Status': 'Under Review'
      },
      {
        'Issue ID': 'TECH002',
        'Employee ID': 'EMP002',
        'Employee Name': 'Jane Smith',
        'Department': 'IT Support',
        'Branch': 'Tech Center',
        'Title': 'Database search malfunction',
        'Category': 'Database',
        'Impact Level': 'High',
        'Status': 'Open',
        'Submitted Date': '2024-11-18',
        'Employee Resolution': 'Optimized search queries',
        'Admin Status': 'In Review'
      },
      {
        'Issue ID': 'TECH003',
        'Employee ID': 'EMP003',
        'Employee Name': 'Mike Johnson',
        'Department': 'Accounts',
        'Branch': 'Downtown Branch',
        'Title': 'Report generation performance issue',
        'Category': 'Performance',
        'Impact Level': 'Medium',
        'Status': 'Approved',
        'Submitted Date': '2024-11-15',
        'Employee Resolution': 'Optimized database queries and added indexing',
        'Admin Status': 'Approved'
      }
    ];
    
    const effectiveBranch = getEffectiveBranch();
    if (isSuperAdmin || effectiveBranch === 'All Branches') {
      return allData;
    }
    return allData.filter(record => record.Branch === effectiveBranch);
  };

  const handleDownloadReport = async () => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }

    let data = [];
    let filename = '';
    let comprehensiveError = false;

    if (selectedReport === 'attendance') {
      try {
        setAttendanceLoading(true);
        setAttendanceError(null);
        const filters = {
          fromDate: dateFrom,
          toDate: dateTo,
          branch: getEffectiveBranch(),
          ...(department !== 'All' && { department }),
        };
        const res = await adminAttendanceService.getAttendanceRange(filters);
        if (res.success && Array.isArray(res.data)) {
          data = res.data.map(item => ({
            'Employee ID': item.employeeId,
            'Employee Name': item.employeeName,
            'Department': item.department,
            'Branch': item.branch,
            'Date': item.date,
            'Attendance Status': item.status,
            'Check-in Time': item.checkInTime,
            'Work Hours': item.workHours,
            'Self Rating': item.productivityRating,
            'Work Summary': item.notes,
            'Productivity Score': item.productivityRating
          }));
          filename = `Attendance_Report_${dateFrom}_to_${dateTo}`;
        } else {
          showError(res.message || 'Failed to fetch attendance data');
          setAttendanceLoading(false);
          return;
        }
      } catch (err) {
        setAttendanceError(err?.response?.data?.message || 'Failed to fetch attendance data');
        showError(err?.response?.data?.message || 'Failed to fetch attendance data');
        setAttendanceLoading(false);
        return;
      } finally {
        setAttendanceLoading(false);
      }
    } else if (selectedReport === 'skill_tests') {
      data = generateSkillTestData();
      filename = `Skill_Test_Report_${dateFrom}_to_${dateTo}`;
    } else if (selectedReport === 'complaints') {
      try {
        const filters = {
          fromDate: dateFrom,
          toDate: dateTo,
          branch: getEffectiveBranch(),
          ...(department !== 'All' && { department }),
        };
        const res = await adminAttendanceService.getComplaintSummaryRange(filters);
        if (res.success && Array.isArray(res.data)) {
          data = res.data.map(item => ({
            'Complaint ID': item.complaintId,
            'Employee ID': item.employeeId,
            'Employee Name': item.employeeName,
            'Branch': item.branch,
            'Category': item.category,
            'Priority': item.priority,
            'Status': item.status,
            'Resolution': item.resolution,
            'Timeline': item.submittedDate + (item.resolvedDate ? ` - ${item.resolvedDate}` : ''),
          }));
          filename = `Complaints_Report_${dateFrom}_to_${dateTo}`;
        } else {
          showError(res.message || 'Failed to fetch complaints data');
          return;
        }
      } catch (err) {
        showError(err?.response?.data?.message || 'Failed to fetch complaints data');
        return;
      }
    } else if (selectedReport === 'tech_issues') {
      try {
        const filters = {
          fromDate: dateFrom,
          toDate: dateTo,
          branch: getEffectiveBranch(),
          ...(department !== 'All' && { department }),
        };
        const res = await adminAttendanceService.getTechIssuesRange(filters);
        if (res.success && Array.isArray(res.data)) {
          data = res.data.map(item => ({
            'Issue ID': item.issueId,
            'Employee ID': item.employeeId,
            'Employee Name': item.employeeName,
            'Department': item.department,
            'Branch': item.branch,
            'Title': item.title,
            'Description': item.description,
            'Category': item.category,
            'Impact': item.impact,
            'Status': item.status,
            'Submitted Date': item.submittedDate,
            'Employee Resolution': item.employeeResolution,
            'Approved By': item.approvedBy,
            'Approved Date': item.approvedDate,
            'Last Update': item.lastUpdate
          }));
          filename = `Tech_Issues_Report_${dateFrom}_to_${dateTo}`;
        } else {
          showError(res.message || 'Failed to fetch tech issues data');
          return;
        }
      } catch (err) {
        showError(err?.response?.data?.message || 'Failed to fetch tech issues data');
        return;
      }
    } else if (selectedReport === 'comprehensive') {
      // Gather all data asynchronously before generating the file
      data = [];
      let attendanceSection = [];
      let attendanceFailed = false;
      if (access.attendance) {
        try {
          setAttendanceLoading(true);
          setAttendanceError(null);
          const filters = {
            fromDate: dateFrom,
            toDate: dateTo,
            branch: getEffectiveBranch(),
            ...(department !== 'All' && { department }),
          };
          const res = await adminAttendanceService.getAttendanceRange(filters);
          if (res.success && Array.isArray(res.data)) {
            attendanceSection = res.data.map(item => ({
              'Employee ID': item.employeeId,
              'Employee Name': item.employeeName,
              'Department': item.department,
              'Branch': item.branch,
              'Date': item.date,
              'Attendance Status': item.status,
              'Check-in Time': item.checkInTime,
              'Work Hours': item.workHours,
              'Self Rating': item.productivityRating,
              'Work Summary': item.notes,
              'Productivity Score': item.productivityRating,
              //'Report Type': 'Attendance'
            }));
          } else {
            showError(res.message || 'Failed to fetch attendance data');
            attendanceFailed = true;
          }
        } catch (err) {
          setAttendanceError(err?.response?.data?.message || 'Failed to fetch attendance data');
          showError(err?.response?.data?.message || 'Failed to fetch attendance data');
          attendanceFailed = true;
        } finally {
          setAttendanceLoading(false);
        }
      }
      // Synchronously gather other data
      let skillSection = [];
      if (access.skillReports) {
        skillSection = generateSkillTestData().map(item => ({ ...item, 'Report Type': 'Skill Tests' }));
      }
      let complaintsSection = [];
      let complaintsFailed = false;
      if (access.complaints) {
        try {
          const filters = {
            fromDate: dateFrom,
            toDate: dateTo,
            branch: getEffectiveBranch(),
            ...(department !== 'All' && { department }),
          };
          const res = await adminAttendanceService.getComplaintSummaryRange(filters);
          if (res.success && Array.isArray(res.data)) {
            complaintsSection = res.data.map(item => ({
              'Complaint ID': item.complaintId,
              'Employee ID': item.employeeId,
              'Employee Name': item.employeeName,
              'Branch': item.branch,
              'Category': item.category,
              'Priority': item.priority,
              'Status': item.status,
              'Resolution': item.resolution,
              'Timeline': item.submittedDate + (item.resolvedDate ? ` - ${item.resolvedDate}` : ''),
              //'Report Type': 'Complaints',
            }));
          } else {
            showError(res.message || 'Failed to fetch complaints data');
            complaintsFailed = true;
          }
        } catch (err) {
          showError(err?.response?.data?.message || 'Failed to fetch complaints data');
          complaintsFailed = true;
        }
      }
      let techSection = [];
      if (access.techIssues) {
        techSection = generateTechIssuesData().map(item => ({ ...item, 'Report Type': 'Tech Issues' }));
      }
      // If any required API failed, do not proceed
      if ((access.attendance && attendanceFailed) || (access.complaints && complaintsFailed)) {
        showError('Failed to fetch all required data for comprehensive report. Please fix errors and try again.');
        return;
      }
      // Prepare data for each sheet
      const sheets = [];
      if (attendanceSection.length > 0) sheets.push({ name: 'Attendance', data: attendanceSection });
      if (skillSection.length > 0) sheets.push({ name: 'Skill Tests', data: skillSection });
      if (complaintsSection.length > 0) sheets.push({ name: 'Complaints', data: complaintsSection });
      if (techSection.length > 0) sheets.push({ name: 'Tech Issues', data: techSection });
      filename = `Comprehensive_Report_${dateFrom}_to_${dateTo}`;

      // Excel export: each section as a separate sheet
      const workbook = new ExcelJS.Workbook();
      sheets.forEach(sheet => {
        const worksheet = workbook.addWorksheet(sheet.name);
        if (sheet.data.length > 0) {
          // Remove 'Department' from header and rows
          const allHeaders = Object.keys(sheet.data[0]);
          const header = allHeaders.filter(h => h !== 'Department');
          worksheet.addRow(header);
          worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'D9EAF7' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
          sheet.data.forEach(row => {
            worksheet.addRow(header.map(h => row[h]));
          });
          worksheet.columns.forEach(col => {
            let maxLength = 10;
            col.eachCell({ includeEmpty: true }, cell => {
              maxLength = Math.max(maxLength, (cell.value ? cell.value.toString().length : 0));
            });
            col.width = maxLength + 2;
          });
        }
      });
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${filename}.xlsx`);
      });
      return;
    } else {
      return;
    }

    // Filter by department if not "All"
    if (department !== 'All') {
      data = data.filter(item => item.Department === department);
    }

    // Always export as XLSX
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    if (data.length > 0) {
      // Remove 'Department' from header and rows
      const allHeaders = Object.keys(data[0]);
      const header = allHeaders.filter(h => h !== 'Department');
      worksheet.addRow(header);
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D9EAF7' } // light blue
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      data.forEach(row => {
        worksheet.addRow(header.map(h => row[h]));
      });
      worksheet.columns.forEach(col => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, cell => {
          maxLength = Math.max(maxLength, (cell.value ? cell.value.toString().length : 0));
        });
        col.width = maxLength + 2;
      });
    }
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${filename}.xlsx`);
    });
  };

  const getReportIcon = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    return report ? report.icon : <Assessment />;
  };

  const getReportColor = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    return report ? report.color : 'primary';
  };

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Reports Download Center
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

        <Grid container spacing={3}>
          {/* Report Selection */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Report Type
                </Typography>
                
                <List>
                  {reports.map((report) => (
                    <React.Fragment key={report.id}>
                      <ListItem
                        button
                        selected={selectedReport === report.id}
                        onClick={() => setSelectedReport(report.id)}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          border: selectedReport === report.id ? 2 : 1,
                          borderColor: selectedReport === report.id ? `${report.color}.main` : 'divider',
                        }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ backgroundColor: `${report.color}.main` }}>
                            {report.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={report.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {report.description}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {report.fields.slice(0, 3).map((field, index) => (
                                  <Chip
                                    key={index}
                                    label={field}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                                {report.fields.length > 3 && (
                                  <Chip
                                    label={`+${report.fields.length - 3} more`}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Report Configuration */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report Configuration
                </Typography>

                {selectedReport && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="subtitle2">
                        Selected: {reports.find(r => r.id === selectedReport)?.title}
                      </Typography>
                    </Alert>

                    <TextField
                      fullWidth
                      label="From Date"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="To Date"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />

                    {/* <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        label="Department"
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl> */}

                    {/* File format selection removed: always XLSX */}
                                                  <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>File Format</InputLabel>
                                <Select
                                  value={"xlsx"}
                                  label="File Format"
                                  disabled
                                >
                                  <MenuItem value="xlsx" disabled>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <TableChart />
                                      Excel (.xlsx)
                                    </Box>
                                  </MenuItem>
                                </Select>
                              </FormControl>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<FileDownload />}
                      onClick={handleDownloadReport}
                      sx={{
                        background: 'linear-gradient(135deg, #64B5F6, #42A5F5)',
                        py: 1.5,
                      }}
                    >
                      Generate & Download Report
                    </Button>
                  </Box>
                )}

                {!selectedReport && (
                  <Alert severity="warning">
                    Please select a report type to configure download options.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Statistics
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Total Employees:</Typography>
                  <Typography variant="body2" fontWeight="medium">147</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Active Issues:</Typography>
                  <Typography variant="body2" fontWeight="medium">23</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Completed Tests:</Typography>
                  <Typography variant="body2" fontWeight="medium">89</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Avg Attendance:</Typography>
                  <Typography variant="body2" fontWeight="medium">91%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Information */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Data Fields:
                </Typography>
                {selectedReport && (
                  <List dense>
                    {reports.find(r => r.id === selectedReport)?.fields.map((field, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={field}
                          sx={{ py: 0.5 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                {!selectedReport && (
                  <Typography variant="body2" color="text.secondary">
                    Select a report type to view available fields
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Export Guidelines:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Excel Format"
                      secondary="Best for data analysis and pivot tables"
                    />
                  </ListItem>
                  {/* <ListItem>
                    <ListItemText
                      primary="CSV Format"
                      secondary="Best for importing into other systems"
                    />
                  </ListItem> */}
                  <ListItem>
                    <ListItemText
                      primary="Date Range"
                      secondary="Select appropriate date range for accurate data"
                    />
                  </ListItem>
                  {/* <ListItem>
                    <ListItemText
                      primary="Department Filter"
                      secondary="Filter by specific department or select 'All'"
                    />
                  </ListItem> */}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default ReportsDownload;