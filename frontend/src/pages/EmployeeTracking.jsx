import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  AccessTime,
  Add,
  Edit,
  Star,
  TrendingUp,
  Assignment,
} from '@mui/icons-material';
import { Layout } from './Dashboard';
import attendanceService from '../services/attendanceService';
import workLogService from '../services/workLogService';

const EmployeeTracking = () => {
  // Attendance state
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  
  // Work items state
  const [workItems, setWorkItems] = useState([]);
  
  // Work dialog state
  const [workDialog, setWorkDialog] = useState(false);
  const [newWorkItem, setNewWorkItem] = useState({
    title: '',
    description: '',
    hours: 1
  });
  
  // Self-scoring state
  const [dailyRating, setDailyRating] = useState(7);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  
  // Attendance history
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      fetchAllData();
    }
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTodayAttendance(),
        fetchTodayWorkLogs(),
        fetchAttendanceHistory(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceService.getTodayAttendance();
      if (response.success && response.data) {
        const attendance = response.data;
        if (attendance.checkInTime) {
          setCheckedIn(true);
          // API returns time already formatted (e.g., "02:04 PM")
          setCheckInTime(attendance.checkInTime);
        }
        if (attendance.checkOutTime) {
          setCheckedOut(true);
          // API returns time already formatted (e.g., "03:24 PM")
          setCheckOutTime(attendance.checkOutTime);
        }
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchTodayWorkLogs = async () => {
    try {
      const response = await workLogService.getTodayWorkLogs();
      if (response.success && response.data) {
        // API returns workLogs array inside data object
        const workLogsArray = response.data.workLogs || response.data;
        
        if (Array.isArray(workLogsArray) && workLogsArray.length > 0) {
          const logs = workLogsArray.map(log => {
            let formattedDate = new Date().toISOString().split('T')[0];
            try {
              if (log.date) {
                const dateObj = new Date(log.date);
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = dateObj.toISOString().split('T')[0];
                }
              }
            } catch (e) {
              console.error('Date parsing error:', e);
            }
            
            return {
              id: log.id,
              title: log.taskName,
              description: log.description,
              hours: log.hours || 0,
              date: formattedDate,
              status: log.status || 'completed'
            };
          });
          setWorkItems(logs);
        } else {
          setWorkItems([]);
        }
      } else {
        setWorkItems([]);
      }
    } catch (error) {
      console.error('Error fetching today work logs:', error);
      setWorkItems([]);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await attendanceService.getAttendanceHistory(7);
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const history = response.data
          .map(record => {
            // Safe date parsing
            let formattedDate = null;
            let formattedCheckInTime = 'N/A';
            let formattedCheckOutTime = 'N/A';
            
            try {
              // API returns 'date' field (YYYY-MM-DD format)
              if (record.date) {
                const dateObj = new Date(record.date);
                if (!isNaN(dateObj.getTime())) {
                  // Format date in Indian locale
                  formattedDate = dateObj.toLocaleDateString('en-IN');
                }
              }
            } catch (e) {
              console.error('Date parsing error:', e);
            }
            
            try {
              // Format check-in time in IST (Indian Standard Time)
              if (record.checkInTime && typeof record.checkInTime === 'string') {
                // If API returns formatted time, keep it; otherwise parse it
                formattedCheckInTime = record.checkInTime.includes(':') ? record.checkInTime : 'N/A';
              }
            } catch (e) {
              console.error('Check-in time parsing error:', e);
            }
            
            try {
              // Format check-out time in IST (Indian Standard Time)
              if (record.checkOutTime && typeof record.checkOutTime === 'string') {
                // If API returns formatted time, keep it; otherwise parse it
                formattedCheckOutTime = record.checkOutTime.includes(':') ? record.checkOutTime : 'N/A';
              }
            } catch (e) {
              console.error('Check-out time parsing error:', e);
            }
            
            return {
              date: formattedDate,
              status: record.status,
              checkInTime: formattedCheckInTime,
              checkOutTime: formattedCheckOutTime,
              valid: formattedDate !== null // Mark as valid only if date parsed successfully
            };
          })
          .filter(record => record.valid); // Filter out records with invalid dates
        
        setAttendanceHistory(history);
      } else {
        setAttendanceHistory([]);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceHistory([]);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.checkIn();
      if (response.success) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        setCheckedIn(true);
        setCheckInTime(timeString);
        showSnackbar('Checked in successfully!', 'success');
        await fetchAttendanceHistory();
      } else {
        showSnackbar(response.message || 'Failed to check in', 'error');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      showSnackbar('Failed to check in', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.checkOut();
      if (response.success) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        setCheckedOut(true);
        setCheckOutTime(timeString);
        showSnackbar('Checked out successfully!', 'success');
        await fetchAttendanceHistory();
      } else {
        showSnackbar(response.message || 'Failed to check out', 'error');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      showSnackbar('Failed to check out', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkItem = async () => {
    if (newWorkItem.title.trim() === '') return;
    
    setLoading(true);
    try {
      const workLogData = {
        taskName: newWorkItem.title,  // API expects 'taskName' not 'title'
        description: newWorkItem.description,
        hours: newWorkItem.hours,  // API expects 'hours' not 'hoursSpent'
        workDate: new Date().toISOString().split('T')[0],
      };
      
      const response = await workLogService.createWorkLog(workLogData);
      if (response.success) {
        showSnackbar('Work item added successfully!', 'success');
        setNewWorkItem({ title: '', description: '', hours: 1 });
        setWorkDialog(false);
        await fetchTodayWorkLogs();
      } else {
        showSnackbar(response.message || 'Failed to add work item', 'error');
      }
    } catch (error) {
      console.error('Error adding work item:', error);
      showSnackbar('Failed to add work item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`rating_${today}`, dailyRating.toString());
    setRatingSubmitted(true);
  };

  const getTotalHours = () => {
    // Calculate hours based on check-in and check-out times
    if (checkInTime && checkOutTime && checkOutTime !== 'N/A') {
      try {
        // Parse time strings in 12-hour format (e.g., "02:04 PM")
        const parseTime = (timeStr) => {
          // Handle time string with format like "02:04 PM" or "2:14:32 PM"
          const timeParts = timeStr.split(' ');
          if (timeParts.length < 2) return null;
          
          const period = timeParts[timeParts.length - 1]; // AM or PM
          const time = timeParts.slice(0, -1).join(' '); // Rest is the time
          const [hours, minutes] = time.split(':').map(Number);
          
          if (isNaN(hours) || isNaN(minutes)) return null;
          
          let h = hours;
          if (period === 'PM' && h !== 12) {
            h += 12;
          } else if (period === 'AM' && h === 12) {
            h = 0;
          }
          
          return h * 60 + minutes; // Return minutes since midnight
        };
        
        const checkInMinutes = parseTime(checkInTime);
        const checkOutMinutes = parseTime(checkOutTime);
        
        if (checkInMinutes === null || checkOutMinutes === null) {
          return 0;
        }
        
        // Calculate difference in hours
        let diffMinutes = checkOutMinutes - checkInMinutes;
        if (diffMinutes < 0) {
          diffMinutes += 24 * 60; // Handle overnight shifts
        }
        
        const hours = (diffMinutes / 60).toFixed(2);
        return parseFloat(hours);
      } catch (e) {
        console.error('Error calculating total hours:', e);
        return 0;
      }
    }
    return 0;
  };

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Employee Tracking
        </Typography>

        {loading && workItems.length === 0 && attendanceHistory.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
          {/* Attendance Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AccessTime sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Today's Attendance</Typography>
                </Box>

                {!checkedIn ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      Check in for today
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleCheckIn}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                      }}
                    >
                      {loading ? 'Checking In...' : 'Check In'}
                    </Button>
                  </Box>
                ) : !checkedOut ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="success.main">
                      Checked In
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Check-in Time: {checkInTime}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleCheckOut}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                      }}
                    >
                      {loading ? 'Checking Out...' : 'Check Out'}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="success.main">
                      Day Complete
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check-in: {checkInTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check-out: {checkOutTime}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Summary */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Today's Summary</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Total Work Hours:</Typography>
                    <Chip label={`${getTotalHours()}h`} color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Tasks Completed:</Typography>
                    <Chip label={workItems.length} color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Attendance Status:</Typography>
                    <Chip 
                      label={checkedOut ? 'Complete' : checkedIn ? 'Checked In' : 'Not Started'} 
                      color={checkedOut ? 'success' : checkedIn ? 'info' : 'warning'} 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Work Done Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">Work Done Today</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setWorkDialog(true)}
                    disabled={loading}
                  >
                    Add Work Item
                  </Button>
                </Box>

                {workItems.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No work items added yet. Click "Add Work Item" to get started.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {workItems.map((item) => (
                      <React.Fragment key={item.id}>
                        <ListItem>
                          <ListItemText
                            primary={item.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {item.description}
                                </Typography>
                                <Chip 
                                  label={`${item.hours}h`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Chip 
                              label={item.status} 
                              color="success" 
                              size="small"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Self-Scoring Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Star sx={{ mr: 2, color: 'warning.main' }} />
                  <Typography variant="h6">Daily Productivity Rating</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Rate your productivity today (0-10):
                </Typography>

                <Box sx={{ px: 2, mb: 3 }}>
                  <Slider
                    value={dailyRating}
                    onChange={(e, newValue) => setDailyRating(newValue)}
                    min={0}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="on"
                    disabled={ratingSubmitted}
                  />
                </Box>

                {!ratingSubmitted ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={submitRating}
                  >
                    Submit Rating
                  </Button>
                ) : (
                  <Alert severity="success">
                    Rating submitted: {dailyRating}/10
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance History */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Attendance History
                </Typography>
                {attendanceHistory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No attendance records found.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Check In</TableCell>
                          <TableCell>Check Out</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendanceHistory.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>
                              <Chip
                                label={record.status}
                                color={record.status === 'Present' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{record.checkInTime}</TableCell>
                            <TableCell>{record.checkOutTime}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}

        {/* Add Work Item Dialog */}
        <Dialog open={workDialog} onClose={() => setWorkDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add Work Item</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Work Title"
              value={newWorkItem.title}
              onChange={(e) => setNewWorkItem(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={newWorkItem.description}
              onChange={(e) => setNewWorkItem(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Hours Spent"
              type="number"
              value={newWorkItem.hours}
              onChange={(e) => setNewWorkItem(prev => ({ ...prev, hours: parseInt(e.target.value) || 1 }))}
              margin="normal"
              inputProps={{ min: 1, max: 12 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWorkDialog(false)} disabled={loading}>Cancel</Button>
            <Button 
              onClick={handleAddWorkItem} 
              variant="contained"
              disabled={loading || !newWorkItem.title.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
    </Layout>
  );
};

export default EmployeeTracking;