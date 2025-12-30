import React, { useState, useEffect } from 'react';
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

const EmployeeTracking = () => {
  // Attendance state
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  
  // Work items state
  const [workItems, setWorkItems] = useState([
    {
      id: 1,
      title: 'Process loan applications',
      description: 'Reviewed and processed 15 loan applications',
      hours: 4,
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    },
    {
      id: 2,
      title: 'Customer service calls',
      description: 'Handled customer inquiries and complaints',
      hours: 3,
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    }
  ]);
  
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
  const [attendanceHistory] = useState([
    { date: '2024-11-21', status: 'Present', time: '09:15 AM' },
    { date: '2024-11-20', status: 'Present', time: '09:05 AM' },
    { date: '2024-11-19', status: 'Present', time: '09:20 AM' },
    { date: '2024-11-18', status: 'Present', time: '09:10 AM' },
    { date: '2024-11-17', status: 'Late', time: '09:45 AM' },
  ]);

  useEffect(() => {
    // Check if attendance is already marked today
    const today = new Date().toISOString().split('T')[0];
    const checkInToday = localStorage.getItem(`checkin_${today}`);
    const checkOutToday = localStorage.getItem(`checkout_${today}`);
    
    if (checkInToday) {
      setCheckedIn(true);
      setCheckInTime(checkInToday);
    }
    
    if (checkOutToday) {
      setCheckedOut(true);
      setCheckOutTime(checkOutToday);
    }

    // Check if rating is already submitted today
    const ratingToday = localStorage.getItem(`rating_${today}`);
    if (ratingToday) {
      setRatingSubmitted(true);
      setDailyRating(parseInt(ratingToday));
    }
  }, []);

  const handleCheckIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const today = now.toISOString().split('T')[0];
    
    setCheckedIn(true);
    setCheckInTime(timeString);
    localStorage.setItem(`checkin_${today}`, timeString);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const today = now.toISOString().split('T')[0];
    
    setCheckedOut(true);
    setCheckOutTime(timeString);
    localStorage.setItem(`checkout_${today}`, timeString);
  };

  const handleAddWorkItem = () => {
    if (newWorkItem.title.trim() === '') return;
    
    const workItem = {
      id: Date.now(),
      ...newWorkItem,
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    };
    
    setWorkItems(prev => [...prev, workItem]);
    setNewWorkItem({ title: '', description: '', hours: 1 });
    setWorkDialog(false);
  };

  const submitRating = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`rating_${today}`, dailyRating.toString());
    setRatingSubmitted(true);
  };

  const getTotalHours = () => {
    return workItems.reduce((total, item) => total + item.hours, 0);
  };

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Employee Tracking
        </Typography>

        <Grid container spacing={3}>
          {/* Attendance Section */}
          <Grid item xs={12} md={6}>
            <Card>
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
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                      }}
                    >
                      Check In
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
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                      }}
                    >
                      Check Out
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
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
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Time</TableCell>
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
                          <TableCell>{record.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
            <Button onClick={() => setWorkDialog(false)}>Cancel</Button>
            <Button onClick={handleAddWorkItem} variant="contained">Add Item</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default EmployeeTracking;