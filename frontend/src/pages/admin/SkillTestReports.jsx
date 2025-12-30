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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  TablePagination,
  LinearProgress,
} from '@mui/material';
import {
  FileDownload,
  FilterList,
  TrendingUp,
  School,
  EmojiEvents,
  Assignment,
  Business,
} from '@mui/icons-material';
import { useBranch } from '../../contexts/BranchContext';
import { AdminLayout } from './AdminDashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const SkillTestReports = () => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const [filterMonth, setFilterMonth] = useState('2024-11');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterScore, setFilterScore] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock skill test data
  const [skillTestData] = useState([
    {
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Customer Service',
      branch: 'Main Branch',
      testDate: '2024-11-15',
      testScore: 85,
      skillArea: 'Banking Operations',
      status: 'Pass',
      nextTestDate: '2025-01-15',
      previousScore: 78,
      improvement: 7
    },
    {
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'IT Support',
      branch: 'Tech Center',
      testDate: '2024-11-14',
      testScore: 92,
      skillArea: 'Technical Support',
      status: 'Pass',
      nextTestDate: '2025-01-20',
      previousScore: 89,
      improvement: 3
    },
    {
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      department: 'Accounts',
      branch: 'Downtown Branch',
      testDate: '2024-11-13',
      testScore: 68,
      skillArea: 'Financial Analysis',
      status: 'Fail',
      nextTestDate: '2024-12-10',
      previousScore: 72,
      improvement: -4
    },
    {
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      department: 'HR',
      branch: 'Main Branch',
      lastTestDate: '2024-11-18',
      testScore: 94,
      skillArea: 'HR Management',
      status: 'Pass',
      nextTestDate: '2025-01-18',
      previousScore: 90,
      improvement: 4
    },
    {
      employeeId: 'EMP005',
      employeeName: 'David Brown',
      department: 'Customer Service',
      lastTestDate: '2024-11-12',
      testScore: 79,
      skillArea: 'Customer Relations',
      status: 'Pass',
      nextTestDate: '2025-01-12',
      previousScore: 75,
      improvement: 4
    },
  ]);

  // Chart data for trends
  const trendData = [
    { month: 'Jul', averageScore: 78 },
    { month: 'Aug', averageScore: 81 },
    { month: 'Sep', averageScore: 84 },
    { month: 'Oct', averageScore: 83 },
    { month: 'Nov', averageScore: 86 },
  ];



  const getStatusColor = (status) => {
    return status === 'Pass' ? 'success' : 'error';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'primary';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const filteredData = skillTestData.filter(emp => {
    const scoreRange = filterScore.split('-');
    const inScoreRange = filterScore === '' || 
      (scoreRange.length === 2 && emp.testScore >= parseInt(scoreRange[0]) && emp.testScore <= parseInt(scoreRange[1])) ||
      (filterScore === '90+' && emp.testScore >= 90);

    // Branch filtering - Super admin sees all branches, regular admin sees only their branch
    const currentBranch = getEffectiveBranch();
    const matchesBranch = isSuperAdmin && currentBranch === 'All Branches' 
      ? true 
      : emp.branch === currentBranch;

    return (
      (filterEmployee === '' || 
       emp.employeeName.toLowerCase().includes(filterEmployee.toLowerCase()) || 
       emp.employeeId.toLowerCase().includes(filterEmployee.toLowerCase())) &&
      inScoreRange &&
      matchesBranch
    );
  });

  const handleExportExcel = () => {
    const exportData = filteredData.map(emp => ({
      'Employee ID': emp.employeeId,
      'Employee Name': emp.employeeName,
      'Department': emp.department,
      'Skill Area': emp.skillArea,
      'Last Test Date': emp.lastTestDate,
      'Test Score': emp.testScore,
      'Status': emp.status,
      'Next Test Date': emp.nextTestDate,
      'Previous Score': emp.previousScore,
      'Improvement': emp.improvement
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skill Test Report');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `skill_test_report_${filterMonth}.xlsx`);
  };

  // Calculate statistics
  const stats = {
    totalTests: filteredData.length,
    passRate: Math.round((filteredData.filter(emp => emp.status === 'Pass').length / filteredData.length) * 100),
    avgScore: Math.round(filteredData.reduce((acc, emp) => acc + emp.testScore, 0) / filteredData.length),
    avgImprovement: Math.round(filteredData.reduce((acc, emp) => acc + emp.improvement, 0) / filteredData.length * 10) / 10
  };

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4">
              Skill Test Reports
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

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.totalTests}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tests
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
                    <EmojiEvents />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.passRate}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pass Rate
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
                    <School />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.avgScore}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Score
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
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">+{stats.avgImprovement}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Improvement
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Skill Test Performance Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="averageScore" 
                      stroke="#64B5F6" 
                      strokeWidth={3}
                      name="Average Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                label="Month"
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
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
                <InputLabel>Score Range</InputLabel>
                <Select
                  value={filterScore}
                  onChange={(e) => setFilterScore(e.target.value)}
                  label="Score Range"
                >
                  <MenuItem value="">All Scores</MenuItem>
                  <MenuItem value="90+">90% and above</MenuItem>
                  <MenuItem value="80-89">80% - 89%</MenuItem>
                  <MenuItem value="70-79">70% - 79%</MenuItem>
                  <MenuItem value="60-69">60% - 69%</MenuItem>
                  <MenuItem value="0-59">Below 60%</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Skill Test Results Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Skill Area</TableCell>
                    <TableCell>Last Test Date</TableCell>
                    <TableCell>Test Score</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Improvement</TableCell>
                    <TableCell>Next Test Due</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
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
                        <TableCell>{employee.skillArea}</TableCell>
                        <TableCell>{employee.lastTestDate}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${employee.testScore}%`}
                              color={getScoreColor(employee.testScore)}
                              size="small"
                            />
                            <LinearProgress
                              variant="determinate"
                              value={employee.testScore}
                              sx={{ width: 60, height: 4 }}
                              color={getScoreColor(employee.testScore)}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.status}
                            color={getStatusColor(employee.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${employee.improvement > 0 ? '+' : ''}${employee.improvement}%`}
                              color={employee.improvement > 0 ? 'success' : employee.improvement < 0 ? 'error' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={
                            new Date(employee.nextTestDate) < new Date(Date.now() + 7*24*60*60*1000) ? 
                            'error.main' : 'text.primary'
                          }>
                            {employee.nextTestDate}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
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
      </Box>
    </AdminLayout>
  );
};

export default SkillTestReports;