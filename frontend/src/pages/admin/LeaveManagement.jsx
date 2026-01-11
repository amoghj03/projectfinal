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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Avatar,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  FilterList,
  CalendarToday,
  Person,
  EventAvailable,
  EventBusy,
  Business,
} from '@mui/icons-material';
import { AdminLayout } from './AdminDashboard';
import { useBranch } from '../../contexts/BranchContext';
import adminLeaveService from '../../services/adminLeaveService';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const LeaveManagement = () => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterLeaveType, setFilterLeaveType] = useState('');
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [actionRemark, setActionRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Track if initial fetch has been done to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  const previousBranchRef = useRef(null);
  const effectiveBranch = getEffectiveBranch();

  // Fetch leave requests on component mount and when branch changes
  useEffect(() => {
    const shouldFetch = 
      !hasFetchedRef.current || 
      previousBranchRef.current !== effectiveBranch;

    if (shouldFetch) {
      hasFetchedRef.current = true;
      previousBranchRef.current = effectiveBranch;
      fetchLeaveRequests();
    }
  }, [effectiveBranch]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        branch: effectiveBranch,
      };
      
      const data = await adminLeaveService.getLeaveRequests(filters);
      setLeaveRequests(data);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError(err.response?.data?.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const leaveTypes = [
    'All Types',
    'Casual Leave',
    'Sick Leave',
    'Annual Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Compensatory Off',
    'Leave Without Pay',
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle />;
      case 'Rejected':
        return <Cancel />;
      case 'Pending':
        return <HourglassEmpty />;
      default:
        return null;
    }
  };

  const filteredRequests = leaveRequests.filter((leave) => {
    const statusMatch = !filterStatus || leave.status === filterStatus;
    const employeeMatch = !filterEmployee || leave.employeeName.toLowerCase().includes(filterEmployee.toLowerCase());
    const leaveTypeMatch = !filterLeaveType || filterLeaveType === 'All Types' || leave.leaveType === filterLeaveType;
    
    // Tab filtering
    let tabMatch = true;
    if (tabValue === 0) tabMatch = leave.status === 'Pending';
    else if (tabValue === 1) tabMatch = leave.status === 'Approved';
    else if (tabValue === 2) tabMatch = leave.status === 'Rejected';
    
    return statusMatch && employeeMatch && leaveTypeMatch && tabMatch;
  });

  const pendingCount = leaveRequests.filter(l => l.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(l => l.status === 'Rejected').length;

  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setViewDialog(true);
  };

  const handleOpenAction = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setActionRemark('');
    setActionDialog(true);
  };

  const handleAction = async () => {
    try {
      if (actionType === 'approve') {
        await adminLeaveService.approveLeaveRequest(selectedLeave.id, actionRemark);
        showSnackbar('Leave request approved successfully', 'success');
      } else if (actionType === 'reject') {
        await adminLeaveService.rejectLeaveRequest(selectedLeave.id, actionRemark);
        showSnackbar('Leave request rejected successfully', 'success');
      }
      
      // Refresh the leave requests
      await fetchLeaveRequests();
      
      setActionDialog(false);
      setActionRemark('');
    } catch (err) {
      console.error('Error processing leave action:', err);
      showSnackbar(
        err.response?.data?.message || 'Failed to process leave request',
        'error'
      );
    }
  };

  const stats = {
    totalRequests: leaveRequests.length,
    pending: pendingCount,
    approved: approvedCount,
    rejected: rejectedCount,
  };

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Business fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              {effectiveBranch}
            </Typography>
          </Box>
          <Typography variant="h4" gutterBottom>
            Leave Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and manage employee leave requests
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button size="small" onClick={fetchLeaveRequests} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          Total Requests
                        </Typography>
                        <Typography variant="h4">{stats.totalRequests}</Typography>
                      </Box>
                      <CalendarToday sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          Pending Approval
                        </Typography>
                        <Typography variant="h4">{stats.pending}</Typography>
                      </Box>
                      <HourglassEmpty sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          Approved
                        </Typography>
                        <Typography variant="h4">{stats.approved}</Typography>
                      </Box>
                      <EventAvailable sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2">
                          Rejected
                        </Typography>
                        <Typography variant="h4">{stats.rejected}</Typography>
                      </Box>
                      <EventBusy sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterList />
              <Typography variant="h6">Filters</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Employee"
                  value={filterEmployee}
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  placeholder="Employee name or ID"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={filterLeaveType}
                    onChange={(e) => setFilterLeaveType(e.target.value)}
                    label="Leave Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {leaveTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setFilterEmployee('');
                    setFilterLeaveType('');
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Leave Requests Table with Tabs */}
        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
              <Tab
                label={
                  <Badge badgeContent={pendingCount} color="warning">
                    <Box sx={{ px: 2 }}>Pending</Box>
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={approvedCount} color="success">
                    <Box sx={{ px: 2 }}>Approved</Box>
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={rejectedCount} color="error">
                    <Box sx={{ px: 2 }}>Rejected</Box>
                  </Badge>
                }
              />
              <Tab label="All Requests" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <LeaveTable
                requests={filteredRequests}
                onView={handleViewLeave}
                onApprove={handleOpenAction}
                showActions={true}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <LeaveTable
                requests={filteredRequests}
                onView={handleViewLeave}
                showActions={false}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <LeaveTable
                requests={filteredRequests}
                onView={handleViewLeave}
                showActions={false}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <LeaveTable
                requests={leaveRequests}
                onView={handleViewLeave}
                onApprove={handleOpenAction}
                showActions={true}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            </TabPanel>
          </CardContent>
        </Card>
        </>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* View Leave Details Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Leave Request Details</DialogTitle>
          <DialogContent>
            {selectedLeave && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedLeave.employeeName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{selectedLeave.employeeName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedLeave.employeeId} • {selectedLeave.department}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Leave Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedLeave.leaveType}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        icon={getStatusIcon(selectedLeave.status)}
                        label={selectedLeave.status}
                        color={getStatusColor(selectedLeave.status)}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">{selectedLeave.startDate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">{selectedLeave.endDate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1">
                      {selectedLeave.isHalfDay
                        ? `0.5 day (${selectedLeave.halfDayPeriod})`
                        : `${selectedLeave.days} day(s)`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Applied Date
                    </Typography>
                    <Typography variant="body1">{selectedLeave.appliedDate}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Reason
                    </Typography>
                    <Typography variant="body1">{selectedLeave.reason}</Typography>
                  </Grid>

                  {selectedLeave.status === 'Approved' && (
                    <>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <Alert severity="success">
                          <Typography variant="subtitle2">Approved</Typography>
                          <Typography variant="body2">
                            By {selectedLeave.approvedBy} on {selectedLeave.approvedDate}
                          </Typography>
                        </Alert>
                      </Grid>
                    </>
                  )}

                  {selectedLeave.status === 'Rejected' && (
                    <>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <Alert severity="error">
                          <Typography variant="subtitle2">Rejection Reason:</Typography>
                          <Typography variant="body2">{selectedLeave.rejectionReason}</Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Rejected by {selectedLeave.rejectedBy} on {selectedLeave.rejectedDate}
                          </Typography>
                        </Alert>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {selectedLeave && selectedLeave.status === 'Pending' && (
              <>
                <Button
                  onClick={() => {
                    setViewDialog(false);
                    handleOpenAction(selectedLeave, 'reject');
                  }}
                  color="error"
                  startIcon={<Cancel />}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setViewDialog(false);
                    handleOpenAction(selectedLeave, 'approve');
                  }}
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                >
                  Approve
                </Button>
              </>
            )}
            {selectedLeave && selectedLeave.status !== 'Pending' && (
              <Button onClick={() => setViewDialog(false)}>Close</Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Action Dialog (Approve/Reject) */}
        <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {selectedLeave && (
                <>
                  <Alert severity={actionType === 'approve' ? 'success' : 'error'} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {actionType === 'approve'
                        ? `Approving leave request for ${selectedLeave.employeeName}`
                        : `Rejecting leave request for ${selectedLeave.employeeName}`}
                    </Typography>
                    <Typography variant="caption">
                      {selectedLeave.leaveType} • {selectedLeave.startDate} to {selectedLeave.endDate}
                    </Typography>
                  </Alert>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={actionType === 'approve' ? 'Remarks (Optional)' : 'Reason for Rejection *'}
                    value={actionRemark}
                    onChange={(e) => setActionRemark(e.target.value)}
                    placeholder={
                      actionType === 'approve'
                        ? 'Add any remarks or notes'
                        : 'Please provide reason for rejection'
                    }
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setActionDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAction}
              variant="contained"
              color={actionType === 'approve' ? 'success' : 'error'}
              disabled={actionType === 'reject' && !actionRemark.trim()}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

// Separate LeaveTable component for reusability
const LeaveTable = ({ requests, onView, onApprove, showActions, getStatusColor, getStatusIcon }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Leave Type</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Days</TableCell>
            <TableCell>Applied Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No leave requests found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            requests.map((leave) => (
              <TableRow key={leave.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                      {leave.employeeName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {leave.employeeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {leave.employeeId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>{leave.startDate}</TableCell>
                <TableCell>{leave.endDate}</TableCell>
                <TableCell>
                  <Chip
                    label={leave.isHalfDay ? `0.5 (${leave.halfDayPeriod})` : leave.days}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{leave.appliedDate}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(leave.status)}
                    label={leave.status}
                    color={getStatusColor(leave.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => onView(leave)} title="View Details">
                      <Visibility />
                    </IconButton>
                    {showActions && leave.status === 'Pending' && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onApprove(leave, 'approve')}
                          title="Approve"
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onApprove(leave, 'reject')}
                          title="Reject"
                        >
                          <Cancel />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeaveManagement;
