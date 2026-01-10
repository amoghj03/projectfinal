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
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
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
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import { useBranch } from '../../contexts/BranchContext';
import { AdminLayout } from './AdminDashboard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import adminComplaintService from '../../services/adminComplaintService';

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
  
  // State for API data
  const [complaintsData, setComplaintsData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    approvalPending: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', complaintId: null });
  const [actionComment, setActionComment] = useState('');
  const [actionResolution, setActionResolution] = useState('');
  
  // Ref to prevent double API calls in StrictMode
  const hasFetched = useRef(false);

  const categories = ['All', 'workplace', 'hr', 'it', 'management', 'training', 'policy', 'other'];
  const statuses = ['All', 'open', 'approval_pending', 'resolved'];

  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      setError('');
      const branch = getEffectiveBranch();
      
      // Fetch complaints and stats in parallel
      const [complaintsResponse, statsResponse] = await Promise.all([
        adminComplaintService.getAllComplaints(branch),
        adminComplaintService.getComplaintStats(branch)
      ]);

      setComplaintsData(complaintsResponse);
      setStats(statsResponse);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to load complaints';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch complaints data from API
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchComplaintsData();
    }
  }, []);

  const handleTakeAction = async () => {
    try {
      await adminComplaintService.takeActionOnComplaint(actionDialog.complaintId, actionComment);
      setSnackbar({ open: true, message: 'Action taken successfully. Complaint marked as In Progress.', severity: 'success' });
      setActionDialog({ open: false, type: '', complaintId: null });
      setActionComment('');
      fetchComplaintsData(); // Refresh data
    } catch (err) {
      console.error('Error taking action:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to take action';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleResolve = async () => {
    try {
      await adminComplaintService.resolveComplaint(actionDialog.complaintId, actionResolution, actionComment);
      setSnackbar({ open: true, message: 'Complaint approved and resolved successfully.', severity: 'success' });
      setActionDialog({ open: false, type: '', complaintId: null });
      setActionComment('');
      setActionResolution('');
      fetchComplaintsData(); // Refresh data
    } catch (err) {
      console.error('Error resolving complaint:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to resolve complaint';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      await adminComplaintService.rejectComplaint(actionDialog.complaintId, actionComment || 'Complaint rejected');
      setSnackbar({ open: true, message: 'Complaint rejected and marked as Open.', severity: 'warning' });
      setActionDialog({ open: false, type: '', complaintId: null });
      setActionComment('');
      fetchComplaintsData(); // Refresh data
    } catch (err) {
      console.error('Error rejecting complaint:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to reject complaint';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'approval_pending': return 'info';
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
    return categoryLabels[category?.toLowerCase()] || category;
  };

  const formatStatus = (status) => {
    if (!status) return '';
    // Convert from database format (e.g., "In Progress") to display format
    return status.toLowerCase().replace(/ /g, '_');
  };

  const formatStatusDisplay = (status) => {
    if (!status) return '';
    // Convert for display (e.g., "in_progress" to "In Progress")
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredData = complaintsData.filter(complaint => {
    const complaintStatus = formatStatus(complaint.status);
    const filterStatusLower = filterStatus === 'All' ? '' : filterStatus.toLowerCase();
    
    return (
      (filterEmployee === '' || 
       complaint.employeeName?.toLowerCase().includes(filterEmployee.toLowerCase()) || 
       complaint.employeeId?.toString().toLowerCase().includes(filterEmployee.toLowerCase())) &&
      (filterStatusLower === '' || complaintStatus === filterStatusLower) &&
      (filterCategory === '' || filterCategory === 'All' || complaint.category?.toLowerCase() === filterCategory.toLowerCase()) &&
      (filterDate === '' || new Date(complaint.submittedDate) >= new Date(filterDate))
    );
  });

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialog(true);
  };

  const handleOpenActionDialog = (type, complaintId) => {
    setActionDialog({ open: true, type, complaintId });
    setActionComment('');
    setActionResolution('');
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map(complaint => ({
      'Complaint ID': complaint.id,
      'Employee ID': complaint.employeeId,
      'Employee Name': complaint.employeeName,
      'Department': complaint.department || 'N/A',
      'Branch': complaint.branch || 'N/A',
      'Title': complaint.title,
      'Description': complaint.description,
      'Category': complaint.category,
      'Priority': complaint.priority,
      'Status': formatStatusDisplay(complaint.status),
      'Submitted Date': new Date(complaint.submittedDate).toLocaleDateString(),
      'Last Update': complaint.lastUpdate ? new Date(complaint.lastUpdate).toLocaleDateString() : 'N/A',
      'Admin Comment': complaint.adminComment || 'N/A',
      'Resolution': complaint.resolution || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Complaints Report');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `complaints_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Calculate statistics (removed since we now get from API)
  // Stats are now fetched from the backend

  // Chart data
  const statusData = [
    { name: 'Open', value: stats.open, color: '#f44336' },
    { name: 'Approval Pending', value: stats.approvalPending, color: '#2196f3' },
    { name: 'Resolved', value: stats.resolved, color: '#4caf50' }
  ];

  const categoryData = categories.slice(1).map(cat => ({
    category: getCategoryLabel(cat),
    count: filteredData.filter(c => c.category === cat).length
  })).filter(item => item.count > 0);

  return (
    <AdminLayout>
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={fetchComplaintsData} sx={{ ml: 2 }}>Retry</Button>
          </Alert>
        ) : (
          <>
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
                  <Avatar sx={{ backgroundColor: 'info.main', mr: 2 }}>
                    <HourglassEmpty />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.approvalPending}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approval Pending
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
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((complaint) => {
                      const complaintStatus = formatStatus(complaint.status);
                      return (
                      <TableRow key={complaint.id}>
                        <TableCell>{complaint.id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: 14 }}>
                              {complaint.employeeName?.split(' ').map(n => n[0]).join('') || 'N'}
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
                            {complaint.description?.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.category}
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
                            label={formatStatusDisplay(complaint.status)}
                            color={getStatusColor(complaintStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(complaint.submittedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => handleViewComplaint(complaint)}
                                size="small"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {complaintStatus === 'approval_pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    onClick={() => handleOpenActionDialog('resolve', complaint.id)}
                                    size="small"
                                    color="success"
                                  >
                                    <ThumbUp />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    onClick={() => handleOpenActionDialog('reject', complaint.id)}
                                    size="small"
                                    color="error"
                                  >
                                    <ThumbDown />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                    })}
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
            Complaint Details - #{selectedComplaint?.id}
          </DialogTitle>
          <DialogContent>
            {selectedComplaint && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Employee Information</Typography>
                  <Typography><strong>Name:</strong> {selectedComplaint.employeeName}</Typography>
                  <Typography><strong>ID:</strong> {selectedComplaint.employeeId}</Typography>
                  <Typography><strong>Department:</strong> {selectedComplaint.department || 'N/A'}</Typography>
                  <Typography><strong>Branch:</strong> {selectedComplaint.branch || 'N/A'}</Typography>
                  <Typography><strong>Submitted:</strong> {new Date(selectedComplaint.submittedDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Complaint Status</Typography>
                  <Typography><strong>Category:</strong> 
                    <Chip
                      label={selectedComplaint.category}
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
                      label={formatStatusDisplay(selectedComplaint.status)}
                      color={getStatusColor(formatStatus(selectedComplaint.status))}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
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

        {/* Action Dialog (Approve or Reject) */}
        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', complaintId: null })} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionDialog.type === 'reject' ? 'Reject Complaint' : 'Approve Complaint'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {actionDialog.type === 'reject' ? (
                <TextField
                  label="Comment"
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Explain why you are rejecting this complaint..."
                />
              ) : (
                <TextField
                  label="Resolution"
                  value={actionResolution}
                  onChange={(e) => setActionResolution(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Describe how the complaint was resolved..."
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, type: '', complaintId: null })}>
              Cancel
            </Button>
            <Button
              onClick={actionDialog.type === 'reject' ? handleReject : handleResolve}
              variant="contained"
              color={actionDialog.type === 'reject' ? 'error' : 'success'}
            >
              {actionDialog.type === 'reject' ? 'Reject' : 'Approve'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
          </>
        )}
      </Box>
    </AdminLayout>
  );
};

export default ComplaintsOverview;