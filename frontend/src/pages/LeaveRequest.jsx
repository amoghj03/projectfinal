import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Add,
  CalendarToday,
  Visibility,
  Cancel,
  CheckCircle,
  HourglassEmpty,
  EventAvailable,
  EventBusy,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Layout } from './Dashboard';
import leaveService from '../services/leaveService';

const LeaveRequest = () => {
  const navigate = useNavigate();
  const employeeName = localStorage.getItem('employeeName');
  const employeeId = localStorage.getItem('employeeId') || 'EMP-ACME-001';

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayPeriod: 'morning',
  });

  const [errors, setErrors] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    casualLeave: 0,
    sickLeave: 0,
    earnedLeave: 0,
    totalAvailable: 0,
    totalTaken: 0,
    pending: 0,
  });

  const hasFetchedData = useRef(false);

  // Fetch data on component mount
  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      fetchLeaveData();
    }
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLeaveBalance(),
        fetchLeaveRequests(),
        fetchLeaveTypes(),
      ]);
    } catch (error) {
      console.error('Error fetching leave data:', error);
      showSnackbar('Failed to load leave data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await leaveService.getLeaveBalance();
      
      if (response.success && response.data) {
        setLeaveBalance(response.data);
      } else {
        console.error('Failed to fetch leave balance:', response.message);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await leaveService.getLeaveRequests();
      
      if (response.success && response.data) {
        setLeaveRequests(response.data);
      } else {
        console.error('Failed to fetch leave requests:', response.message);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await leaveService.getLeaveTypes();
      
      if (response.success && response.data) {
        setLeaveTypes(response.data);
      } else {
        console.error('Failed to fetch leave types:', response.message);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      isHalfDay: false,
      halfDayPeriod: 'morning',
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      isHalfDay: false,
      halfDayPeriod: 'morning',
    });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-set end date to start date for half day
    if (field === 'isHalfDay' && value === true) {
      setFormData((prev) => ({
        ...prev,
        isHalfDay: true,
        endDate: prev.startDate,
      }));
    }

    // Clear end date if half day is unchecked
    if (field === 'isHalfDay' && value === false) {
      setFormData((prev) => ({
        ...prev,
        isHalfDay: false,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    if (formData.isHalfDay) return 0.5;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) newErrors.leaveType = 'Leave type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.isHalfDay && !formData.endDate)
      newErrors.endDate = 'End date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';

    if (formData.startDate && formData.endDate && !formData.isHalfDay) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        // Find the selected leave type to get its name
        const selectedLeaveType = leaveTypes.find(type => type.id === formData.leaveType);
        
        if (!selectedLeaveType) {
          showSnackbar('Invalid leave type selected', 'error');
          setLoading(false);
          return;
        }

        const requestData = {
          leaveType: selectedLeaveType.name, // Send the name, not the ID
          startDate: formData.startDate,
          endDate: formData.isHalfDay ? formData.startDate : formData.endDate,
          reason: formData.reason,
          isHalfDay: formData.isHalfDay,
          halfDayPeriod: formData.isHalfDay ? formData.halfDayPeriod : null,
        };

        const response = await leaveService.submitLeaveRequest(requestData);

        if (response.success) {
          showSnackbar('Leave request submitted successfully', 'success');
          handleCloseDialog();
          // Refresh leave data
          await fetchLeaveRequests();
          await fetchLeaveBalance();
        } else {
          showSnackbar(response.message || 'Failed to submit leave request', 'error');
        }
      } catch (error) {
        console.error('Error submitting leave request:', error);
        showSnackbar('An error occurred while submitting leave request', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setViewDialog(true);
  };

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

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Header */}
        <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Leave Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Apply for leave and track your leave requests
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
            Apply Leave
          </Button>
        </Box>
      </Box>

      {/* Leave Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Available
                  </Typography>
                  <Typography variant="h4">{leaveBalance.totalAvailable}</Typography>
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
                    Leaves Taken
                  </Typography>
                  <Typography variant="h4">{leaveBalance.totalTaken}</Typography>
                </Box>
                <EventBusy sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
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
                  <Typography variant="h4">{leaveBalance.pending}</Typography>
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
                    Balance Remaining
                  </Typography>
                  <Typography variant="h4">
                    {leaveBalance.totalAvailable - leaveBalance.totalTaken - leaveBalance.pending}
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Type Balance */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Leave Balance by Type
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Casual Leave:</Typography>
                <Chip label={`${leaveBalance.casualLeave} days`} color="primary" />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Sick Leave:</Typography>
                <Chip label={`${leaveBalance.sickLeave} days`} color="warning" />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">Earned Leave:</Typography>
                <Chip label={`${leaveBalance.earnedLeave} days`} color="success" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Leave Requests
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
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
                {leaveRequests.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {leave.leaveType}
                      </Typography>
                    </TableCell>
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
                      <IconButton size="small" onClick={() => handleViewLeave(leave)}>
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Apply Leave Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.leaveType}>
                  <InputLabel>Leave Type *</InputLabel>
                  <Select
                    value={formData.leaveType}
                    onChange={(e) => handleInputChange('leaveType', e.target.value)}
                    label="Leave Type *"
                  >
                    {leaveTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name} {type.isPaid && '(Paid)'} - Max: {type.maxDaysPerYear} days/year
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.leaveType && (
                    <Typography variant="caption" color="error">
                      {errors.leaveType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="checkbox"
                    checked={formData.isHalfDay}
                    onChange={(e) => handleInputChange('isHalfDay', e.target.checked)}
                  />
                  <Typography variant="body2">Half Day Leave</Typography>
                </Box>
              </Grid>

              {formData.isHalfDay && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Half Day Period</InputLabel>
                    <Select
                      value={formData.halfDayPeriod}
                      onChange={(e) => handleInputChange('halfDayPeriod', e.target.value)}
                      label="Half Day Period"
                    >
                      <MenuItem value="morning">Morning (First Half)</MenuItem>
                      <MenuItem value="afternoon">Afternoon (Second Half)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={formData.isHalfDay ? 12 : 6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date *"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {!formData.isHalfDay && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date *"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    error={!!errors.endDate}
                    helperText={errors.endDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}

              {formData.startDate && formData.endDate && (
                <Grid item xs={12}>
                  <Alert severity="info" icon={<Info />}>
                    Total Days: {calculateDays()} day(s)
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason *"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  error={!!errors.reason}
                  helperText={errors.reason}
                  placeholder="Please provide reason for leave"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit Request
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

      {/* View Leave Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
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
                <Grid item xs={12}>
                  <Divider />
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
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Approved By
                      </Typography>
                      <Typography variant="body1">{selectedLeave.approvedBy}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Approved Date
                      </Typography>
                      <Typography variant="body1">{selectedLeave.approvedDate}</Typography>
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
                        <Typography variant="body2">
                          {selectedLeave.rejectionReason}
                        </Typography>
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
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Layout>
  );
};

export default LeaveRequest;
