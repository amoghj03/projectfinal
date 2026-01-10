import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  IconButton,
  Collapse,
  TablePagination,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  ReportProblem,
  Add,
  FilterList,
  Pending,
  HourglassEmpty,
  CheckCircle,
  Assignment,
  Person,
  Today,
  ExpandMore,
  ExpandLess,
  Close,
} from '@mui/icons-material';
import { Layout } from './Dashboard';
import complaintService from '../services/complaintService';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const ComplaintRegister = () => {
  const [tabValue, setTabValue] = useState(0);
  const [complaintDialog, setComplaintDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [closeDialog, setCloseDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [closeComments, setCloseComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  const hasFetchedData = useRef(false);

  const [complaints, setComplaints] = useState([]);

  // Fetch complaints on component mount
  useEffect(() => {
    if (!hasFetchedData.current) {
      hasFetchedData.current = true;
      fetchComplaints();
    }
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintService.getComplaints();
      
      if (response.success && response.data) {
        // Transform backend data to match frontend format
        const formattedComplaints = response.data.map(complaint => ({
          id: complaint.id, // Keep numeric ID for API calls
          complaintNumber: complaint.complaintNumber, // Display string
          title: complaint.title,
          description: complaint.description,
          category: complaint.category.toLowerCase(),
          priority: complaint.priority.toLowerCase(),
          status: complaint.status.toLowerCase().replace(' ', '_'),
          submittedDate: new Date(complaint.submittedDate).toISOString().split('T')[0],
          submittedBy: complaint.submittedBy,
          lastUpdate: new Date(complaint.lastUpdate).toISOString().split('T')[0],
          resolution: complaint.resolution,
          closingComments: complaint.closingComments
        }));
        setComplaints(formattedComplaints);
      } else {
        showSnackbar('Failed to load complaints', 'error');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      showSnackbar('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'workplace', label: 'Workplace Environment' },
    { value: 'hr', label: 'HR/Personnel Issues' },
    { value: 'it', label: 'IT/Technical' },
    { value: 'management', label: 'Management' },
    { value: 'policy', label: 'Policy/Procedure' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'info' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' }
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: 'error', icon: <Pending /> },
    { value: 'in_progress', label: 'In Progress', color: 'warning', icon: <HourglassEmpty /> },
    { value: 'approval_pending', label: 'Approval Pending', color: 'info', icon: <HourglassEmpty /> },
    { value: 'resolved', label: 'Resolved', color: 'success', icon: <CheckCircle /> },
    { value: 'closed', label: 'Closed', color: 'success', icon: <CheckCircle /> }
  ];

  const handleSubmitComplaint = async () => {
    if (!newComplaint.title.trim() || !newComplaint.description.trim() || !newComplaint.category) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await complaintService.submitComplaint(newComplaint);
      
      if (response.success && response.data) {
        showSnackbar('Complaint submitted successfully', 'success');
        setNewComplaint({ title: '', description: '', category: '', priority: 'medium' });
        setTabValue(0); // Switch to "My Complaints" tab
        await fetchComplaints(); // Refresh the complaints list
      } else {
        showSnackbar(response.message || 'Failed to submit complaint', 'error');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      showSnackbar('Failed to submit complaint', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const getPriorityInfo = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const filteredComplaints = complaints.filter(complaint => 
    filterStatus === 'all' || complaint.status === filterStatus
  );

  const handleExpandRow = (complaintId) => {
    setExpandedRow(expandedRow === complaintId ? null : complaintId);
  };

  const handleCloseComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setCloseDialog(true);
  };

  const confirmCloseComplaint = async () => {
    if (selectedComplaint && closeComments.trim()) {
      setLoading(true);
      try {
        const response = await complaintService.markComplaintResolved(
          selectedComplaint.id, 
          closeComments.trim()
        );
        
        if (response.success) {
          showSnackbar('Complaint marked as resolved and pending admin approval', 'success');
          setCloseDialog(false);
          setSelectedComplaint(null);
          setCloseComments('');
          await fetchComplaints(); // Refresh the complaints list
        } else {
          showSnackbar(response.message || 'Failed to mark complaint as resolved', 'error');
        }
      } catch (error) {
        console.error('Error closing complaint:', error);
        showSnackbar('Failed to mark complaint as resolved', 'error');
      } finally {
        setLoading(false);
      }
    }
  };



  const complaintStats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    approvalPending: complaints.filter(c => c.status === 'approval_pending').length,
    closed: complaints.filter(c => c.status === 'closed' || c.status === 'resolved').length
  };

  return (
    <Layout>
      <Box>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            Complaint Register
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setTabValue(1)}
          >
            File New Complaint
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
                    <Typography variant="h6">{complaintStats.total}</Typography>
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
                    <Typography variant="h6">{complaintStats.open}</Typography>
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
                    <Typography variant="h6">{complaintStats.approvalPending}</Typography>
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
                    <Typography variant="h6">{complaintStats.closed}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Resolved
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs and Filters */}
        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="My Complaints" />
                <Tab label="Submit New" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {/* Filter */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FilterList />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="approval_pending">Approval Pending</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Complaints Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredComplaints
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((complaint) => {
                        const statusInfo = getStatusInfo(complaint.status);
                        const priorityInfo = getPriorityInfo(complaint.priority);
                        const isExpanded = expandedRow === complaint.id;
                        
                        return (
                          <React.Fragment key={complaint.id}>
                            <TableRow>
                              <TableCell>{complaint.complaintNumber}</TableCell>
                              <TableCell>
                                <Typography variant="subtitle2">
                                  {complaint.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
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
                                  label={priorityInfo.label}
                                  color={priorityInfo.color}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={statusInfo.icon}
                                  label={statusInfo.label}
                                  color={statusInfo.color}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{complaint.submittedDate}</TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => handleExpandRow(complaint.id)}
                                  size="small"
                                >
                                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                              </TableCell>
                            </TableRow>
                            
                            {/* Expanded Details Row */}
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                <Collapse in={isExpanded}>
                                  <Box sx={{ margin: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                      Complaint Details
                                    </Typography>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Full Description:
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                          {complaint.description}
                                        </Typography>
                                        
                                        <Typography variant="subtitle2" gutterBottom>
                                          Submitted By:
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                          {complaint.submittedBy}
                                        </Typography>
                                      </Grid>
                                      
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Last Update:
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                          {complaint.lastUpdate}
                                        </Typography>
                                        
                                        {complaint.resolution && (
                                          <>
                                            <Typography variant="subtitle2" gutterBottom>
                                              Resolution:
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              {complaint.resolution}
                                            </Typography>
                                          </>
                                        )}
                                        
                                        {complaint.closingComments && (
                                          <>
                                            <Typography variant="subtitle2" gutterBottom>
                                              Closing Comments:
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              {complaint.closingComments}
                                            </Typography>
                                          </>
                                        )}
                                      </Grid>
                                    </Grid>
                                    
                                    {/* Close Complaint Button for Open/In Progress cases */}
                                    {(complaint.status === 'open' || complaint.status === 'in_progress') && (
                                      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                        <Button
                                          variant="contained"
                                          color="error"
                                          startIcon={<Close />}
                                          onClick={() => handleCloseComplaint(complaint)}
                                          size="small"
                                        >
                                          Close Complaint
                                        </Button>
                                      </Box>
                                    )}
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })
                    }
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredComplaints.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Complaint Title"
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, title: e.target.value }))}
                    margin="normal"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Detailed Description"
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                    margin="normal"
                    multiline
                    rows={6}
                    required
                    helperText="Please provide as much detail as possible to help us understand and address your concern"
                  />

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={newComplaint.category}
                          onChange={(e) => setNewComplaint(prev => ({ ...prev, category: e.target.value }))}
                          label="Category"
                          required
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.value} value={category.value}>
                              {category.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={newComplaint.priority}
                          onChange={(e) => setNewComplaint(prev => ({ ...prev, priority: e.target.value }))}
                          label="Priority"
                        >
                          {priorities.map((priority) => (
                            <MenuItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleSubmitComplaint}
                      disabled={!newComplaint.title.trim() || !newComplaint.description.trim() || !newComplaint.category}
                    >
                      Submit Complaint
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Guidelines for Filing Complaints:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Be specific and factual"
                          secondary="Provide clear details about the issue"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Include relevant dates and times"
                          secondary="Help us understand when the issue occurred"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Maintain professionalism"
                          secondary="Keep the tone respectful and constructive"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Follow up as needed"
                          secondary="Check the status of your complaint regularly"
                        />
                      </ListItem>
                    </List>
                  </Alert>
                </Grid>
              </Grid>
            </TabPanel>
          </CardContent>
        </Card>

        {/* Close Complaint Dialog */}
        <Dialog 
          open={closeDialog} 
          onClose={() => setCloseDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Close Complaint: {selectedComplaint?.complaintNumber}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedComplaint?.title}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Closing Comments"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={closeComments}
              onChange={(e) => setCloseComments(e.target.value)}
              placeholder="Please provide comments about how this complaint was resolved or why it's being closed..."
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCloseDialog(false)}>Cancel</Button>
            <Button 
              onClick={confirmCloseComplaint}
              variant="contained"
              disabled={!closeComments.trim()}
            >
              Close Complaint
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
      </Box>
    </Layout>
  );
};

export default ComplaintRegister;