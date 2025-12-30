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
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FileDownload,
  FilterList,
  Visibility,
  ReportProblem,
  Pending,
  CheckCircle,
  HourglassEmpty,
  Business,
} from '@mui/icons-material';
import { useBranch } from '../../contexts/BranchContext';
import { AdminLayout } from './AdminDashboard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ComplaintsOverview = () => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock complaints data
  const [complaintsData] = useState([
    {
      complaintId: 'CMP001',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Customer Service',
      branch: 'Main Branch',
      title: 'Inadequate workplace lighting',
      description: 'The lighting in the third floor workspace is insufficient, causing eye strain during work hours. This has been ongoing for several weeks and affects productivity.',
      category: 'workplace',
      priority: 'medium',
      status: 'open',
      submittedDate: '2024-11-20',
      lastUpdate: '2024-11-20',
      assignedTo: 'Facilities Team'
    },
    {
      complaintId: 'CMP002',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'IT Support',
      branch: 'Tech Center',
      title: 'Harassment by supervisor',
      description: 'Experiencing inappropriate behavior and unprofessional conduct from immediate supervisor. Multiple incidents of verbal abuse and discrimination.',
      category: 'hr',
      priority: 'high',
      status: 'in_progress',
      submittedDate: '2024-11-18',
      lastUpdate: '2024-11-21',
      assignedTo: 'HR Department'
    },
    {
      complaintId: 'CMP003',
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      department: 'Accounts',
      branch: 'Downtown Branch',
      title: 'Outdated computer equipment',
      description: 'Current workstation is running slowly and affecting productivity. Request for hardware upgrade to meet job requirements.',
      category: 'it',
      priority: 'low',
      status: 'resolved',
      submittedDate: '2024-11-15',
      lastUpdate: '2024-11-19',
      assignedTo: 'IT Department',
      resolution: 'Hardware upgrade completed on 2024-11-19'
    },
    {
      complaintId: 'CMP004',
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      department: 'HR',
      branch: 'Main Branch',
      title: 'Unfair workload distribution',
      description: 'Consistently assigned more tasks than other team members, leading to overtime and stress. Request for workload review.',
      category: 'management',
      priority: 'medium',
      status: 'in_progress',
      submittedDate: '2024-11-12',
      lastUpdate: '2024-11-20',
      assignedTo: 'Management'
    },
    {
      complaintId: 'CMP005',
      employeeId: 'EMP005',
      employeeName: 'David Brown',
      department: 'Customer Service',
      branch: 'East Branch',
      title: 'Lack of training resources',
      description: 'Insufficient training materials and resources for new banking products. Affecting ability to serve customers effectively.',
      category: 'training',
      priority: 'medium',
      status: 'open',
      submittedDate: '2024-11-10',
      lastUpdate: '2024-11-10',
      assignedTo: 'Training Department'
    },
  ]);

  const categories = ['All', 'workplace', 'hr', 'it', 'management', 'training', 'policy', 'other'];
  const statuses = ['All', 'open', 'in_progress', 'resolved'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'workplace': 'Workplace Environment',
      'hr': 'HR/Personnel Issues',
      'it': 'IT/Technical',
      'management': 'Management',
      'training': 'Training',
      'policy': 'Policy/Procedure',
      'other': 'Other'
    };
    return categoryLabels[category] || category;
  };

  const filteredData = complaintsData.filter(complaint => {
    const effectiveBranch = getEffectiveBranch();
    const branchMatch = isSuperAdmin || effectiveBranch === 'All Branches' || complaint.branch === effectiveBranch;
    
    return (
      branchMatch &&
      (filterEmployee === '' || 
       complaint.employeeName.toLowerCase().includes(filterEmployee.toLowerCase()) || 
       complaint.employeeId.toLowerCase().includes(filterEmployee.toLowerCase())) &&
      (filterStatus === '' || filterStatus === 'All' || complaint.status === filterStatus) &&
      (filterCategory === '' || filterCategory === 'All' || complaint.category === filterCategory) &&
      (filterDate === '' || complaint.submittedDate >= filterDate)
    );
  });

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialog(true);
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map(complaint => ({
      'Complaint ID': complaint.complaintId,
      'Employee ID': complaint.employeeId,
      'Employee Name': complaint.employeeName,
      'Department': complaint.department,
      'Title': complaint.title,
      'Description': complaint.description,
      'Category': getCategoryLabel(complaint.category),
      'Priority': complaint.priority,
      'Status': complaint.status,
      'Submitted Date': complaint.submittedDate,
      'Last Update': complaint.lastUpdate,
      'Assigned To': complaint.assignedTo,
      'Resolution': complaint.resolution || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Complaints Report');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `complaints_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Calculate statistics
  const stats = {
    total: filteredData.length,
    open: filteredData.filter(c => c.status === 'open').length,
    inProgress: filteredData.filter(c => c.status === 'in_progress').length,
    resolved: filteredData.filter(c => c.status === 'resolved').length,
    highPriority: filteredData.filter(c => c.priority === 'high').length
  };

  // Chart data
  const statusData = [
    { name: 'Open', value: stats.open, color: '#f44336' },
    { name: 'In Progress', value: stats.inProgress, color: '#ff9800' },
    { name: 'Resolved', value: stats.resolved, color: '#4caf50' }
  ];

  const categoryData = categories.slice(1).map(cat => ({
    category: getCategoryLabel(cat),
    count: filteredData.filter(c => c.category === cat).length
  })).filter(item => item.count > 0);

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4">
              Complaints Overview
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
                    <ReportProblem />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Complaints
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
                  <Avatar sx={{ backgroundColor: 'error.main', mr: 2 }}>
                    <Pending />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.open}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Open
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
                    <HourglassEmpty />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.inProgress}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress
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
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.resolved}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Resolved
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Complaints by Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Complaints by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#81C784" />
                  </BarChart>
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
                label="From Date"
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
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === 'All' ? category : getCategoryLabel(category)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Complaint ID</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted Date</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((complaint) => (
                      <TableRow key={complaint.complaintId}>
                        <TableCell>{complaint.complaintId}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: 14 }}>
                              {complaint.employeeName.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">{complaint.employeeName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {complaint.employeeId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                            {complaint.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                            {complaint.description.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getCategoryLabel(complaint.category)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.priority}
                            color={getPriorityColor(complaint.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.status}
                            color={getStatusColor(complaint.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{complaint.submittedDate}</TableCell>
                        <TableCell>{complaint.assignedTo}</TableCell>
                        <TableCell>
                          <Tooltip title="View Full Complaint">
                            <IconButton
                              onClick={() => handleViewComplaint(complaint)}
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

        {/* Complaint Details Dialog */}
        <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Complaint Details - {selectedComplaint?.complaintId}
          </DialogTitle>
          <DialogContent>
            {selectedComplaint && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Employee Information</Typography>
                  <Typography><strong>Name:</strong> {selectedComplaint.employeeName}</Typography>
                  <Typography><strong>ID:</strong> {selectedComplaint.employeeId}</Typography>
                  <Typography><strong>Department:</strong> {selectedComplaint.department}</Typography>
                  <Typography><strong>Submitted:</strong> {selectedComplaint.submittedDate}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Complaint Status</Typography>
                  <Typography><strong>Category:</strong> 
                    <Chip
                      label={getCategoryLabel(selectedComplaint.category)}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography sx={{ mt: 1 }}><strong>Priority:</strong> 
                    <Chip
                      label={selectedComplaint.priority}
                      color={getPriorityColor(selectedComplaint.priority)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography sx={{ mt: 1 }}><strong>Status:</strong> 
                    <Chip
                      label={selectedComplaint.status}
                      color={getStatusColor(selectedComplaint.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography sx={{ mt: 1 }}><strong>Assigned To:</strong> {selectedComplaint.assignedTo}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Complaint Title</Typography>
                  <Typography>{selectedComplaint.title}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography>{selectedComplaint.description}</Typography>
                </Grid>
                {selectedComplaint.resolution && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Resolution</Typography>
                    <Typography color="success.main">{selectedComplaint.resolution}</Typography>
                  </Grid>
                )}
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

export default ComplaintsOverview;