import React, { useState } from 'react';
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
  Avatar,
  IconButton,
  Collapse,
  TablePagination,
  Menu,
  MenuList,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  BugReport,
  Add,
  FilterList,
  Warning,
  Error,
  Info,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Computer,
  Security,
  Storage,
  NetworkCheck,
  Close,
} from '@mui/icons-material';
import { Layout } from './Dashboard';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const TechIssuesRegister = () => {
  const [tabValue, setTabValue] = useState(0);
  const [issueDialog, setIssueDialog] = useState(false);
  const [filterImpact, setFilterImpact] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [closeDialog, setCloseDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [closeComments, setCloseComments] = useState('');
  
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: '',
    impact: 'low',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: ''
  });

  const [techIssues, setTechIssues] = useState([
    {
      id: 'TECH001',
      title: 'Login system timeout error',
      description: 'System automatically logs out users after 5 minutes of inactivity instead of the expected 30 minutes',
      category: 'authentication',
      impact: 'medium',
      status: 'open',
      submittedDate: '2024-11-20',
      submittedBy: 'John Doe',
      lastUpdate: '2024-11-20',
      stepsToReproduce: '1. Login to system\n2. Leave inactive for 5 minutes\n3. Try to perform any action',
      expectedBehavior: 'Session should remain active for 30 minutes',
      actualBehavior: 'Session expires after 5 minutes'
    },
    {
      id: 'TECH002',
      title: 'Customer database search malfunction',
      description: 'Search function returns incorrect customer records when using partial name matches',
      category: 'database',
      impact: 'high',
      status: 'in_progress',
      submittedDate: '2024-11-18',
      submittedBy: 'John Doe',
      lastUpdate: '2024-11-21',
      assignedTo: 'IT Support Team',
      stepsToReproduce: '1. Go to customer search\n2. Enter partial name (e.g., "John")\n3. Check results',
      expectedBehavior: 'Should return all customers with "John" in their name',
      actualBehavior: 'Returns random customer records'
    },
    {
      id: 'TECH003',
      title: 'Report generation performance issue',
      description: 'Monthly reports take excessively long time to generate, often timing out',
      category: 'performance',
      impact: 'medium',
      status: 'closed',
      submittedDate: '2024-11-15',
      submittedBy: 'John Doe',
      lastUpdate: '2024-11-19',
      resolution: 'Database indexing optimized, report generation now takes 2-3 minutes',
      closingComments: 'Issue resolved by optimizing database queries and adding proper indexing',
      stepsToReproduce: '1. Navigate to Reports section\n2. Select Monthly Summary Report\n3. Choose date range\n4. Click Generate',
      expectedBehavior: 'Report should generate within 5 minutes',
      actualBehavior: 'Report generation times out after 15 minutes'
    }
  ]);

  const categories = [
    { value: 'authentication', label: 'Authentication/Login', icon: <Security /> },
    { value: 'database', label: 'Database Issues', icon: <Storage /> },
    { value: 'performance', label: 'Performance', icon: <Computer /> },
    { value: 'network', label: 'Network/Connectivity', icon: <NetworkCheck /> },
    { value: 'ui', label: 'User Interface', icon: <Computer /> },
    { value: 'integration', label: 'System Integration', icon: <NetworkCheck /> },
    { value: 'other', label: 'Other', icon: <BugReport /> }
  ];

  const impacts = [
    { 
      value: 'low', 
      label: 'Low', 
      color: 'info',
      icon: <Info />,
      description: 'Minor inconvenience, workaround available'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      color: 'warning',
      icon: <Warning />,
      description: 'Affects productivity, limited workaround'
    },
    { 
      value: 'high', 
      label: 'High', 
      color: 'error',
      icon: <Error />,
      description: 'Critical issue, blocks work, no workaround'
    }
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: 'error' },
    { value: 'in_progress', label: 'In Progress', color: 'warning' },
    { value: 'resolved', label: 'Resolved', color: 'success' },
    { value: 'closed', label: 'Closed', color: 'default' }
  ];

  const handleSubmitIssue = () => {
    if (!newIssue.title.trim() || !newIssue.description.trim() || !newIssue.category) {
      return;
    }

    const issue = {
      id: `TECH${String(techIssues.length + 1).padStart(3, '0')}`,
      ...newIssue,
      status: 'open',
      submittedDate: new Date().toISOString().split('T')[0],
      submittedBy: localStorage.getItem('employeeName') || 'John Doe',
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    setTechIssues(prev => [issue, ...prev]);
    setNewIssue({
      title: '',
      description: '',
      category: '',
      impact: 'low',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: ''
    });
    setIssueDialog(false);
  };

  const getImpactInfo = (impact) => {
    return impacts.find(i => i.value === impact) || impacts[0];
  };

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || categories[6];
  };

  const filteredIssues = techIssues.filter(issue => 
    (filterImpact === 'all' || issue.impact === filterImpact) &&
    (filterStatus === 'all' || issue.status === filterStatus)
  );

  const issueStats = {
    total: techIssues.length,
    open: techIssues.filter(i => i.status === 'open').length,
    inProgress: techIssues.filter(i => i.status === 'in_progress').length,
    resolved: techIssues.filter(i => i.status === 'resolved').length,
    high: techIssues.filter(i => i.impact === 'high').length,
    medium: techIssues.filter(i => i.impact === 'medium').length,
    low: techIssues.filter(i => i.impact === 'low').length
  };

  const handleExpandRow = (issueId) => {
    setExpandedRow(expandedRow === issueId ? null : issueId);
  };

  const handleCloseIssue = (issue) => {
    setSelectedIssue(issue);
    setCloseDialog(true);
  };

  const confirmCloseIssue = () => {
    if (selectedIssue && closeComments.trim()) {
      setTechIssues(prev => prev.map(issue => 
        issue.id === selectedIssue.id 
          ? { 
              ...issue, 
              status: 'closed', 
              closingComments: closeComments.trim(),
              lastUpdate: new Date().toISOString().split('T')[0]
            }
          : issue
      ));
      setCloseDialog(false);
      setSelectedIssue(null);
      setCloseComments('');
    }
  };

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            Tech Issues Register
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setTabValue(1)}
          >
            Report Issue
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                    <BugReport />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{issueStats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Issues
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
                    <Error />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{issueStats.high}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Priority
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
                    <Warning />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{issueStats.inProgress}</Typography>
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
                    <Typography variant="h6">{issueStats.resolved}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Resolved
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="My Issues" />
                <Tab label="Report New Issue" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {/* Filters */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FilterList />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Impact</InputLabel>
                  <Select
                    value={filterImpact}
                    onChange={(e) => setFilterImpact(e.target.value)}
                    label="Impact"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Issues Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Impact</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIssues
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((issue) => {
                        const impactInfo = getImpactInfo(issue.impact);
                        const statusInfo = getStatusInfo(issue.status);
                        const categoryInfo = getCategoryInfo(issue.category);
                        const isExpanded = expandedRow === issue.id;
                        
                        return (
                          <React.Fragment key={issue.id}>
                            <TableRow>
                              <TableCell>{issue.id}</TableCell>
                              <TableCell>
                                <Typography variant="subtitle2">
                                  {issue.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {issue.description.substring(0, 60)}...
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  icon={categoryInfo.icon}
                                  label={categoryInfo.label} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={impactInfo.icon}
                                  label={impactInfo.label}
                                  color={impactInfo.color}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={statusInfo.label}
                                  color={statusInfo.color}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{issue.submittedDate}</TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => handleExpandRow(issue.id)}
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
                                      Issue Details
                                    </Typography>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Description:
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                          {issue.description}
                                        </Typography>
                                        
                                        {issue.stepsToReproduce && (
                                          <>
                                            <Typography variant="subtitle2" gutterBottom>
                                              Steps to Reproduce:
                                            </Typography>
                                            <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-line' }}>
                                              {issue.stepsToReproduce}
                                            </Typography>
                                          </>
                                        )}
                                      </Grid>
                                      
                                      <Grid item xs={12} md={6}>
                                        {issue.expectedBehavior && (
                                          <>
                                            <Typography variant="subtitle2" gutterBottom>
                                              Expected Behavior:
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              {issue.expectedBehavior}
                                            </Typography>
                                          </>
                                        )}
                                        
                                        {issue.actualBehavior && (
                                          <>
                                            <Typography variant="subtitle2" gutterBottom>
                                              Actual Behavior:
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              {issue.actualBehavior}
                                            </Typography>
                                          </>
                                        )}
                                        
                                        
                                        
                                        {issue.closingComments && (
                                          <>
                                            <Typography variant="subtitle2" gutterBottom>
                                              Closing Comments:
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              {issue.closingComments}
                                            </Typography>
                                          </>
                                        )}
                                      </Grid>
                                    </Grid>
                                    
                                    {/* Close Issue Button for Open/In Progress cases */}
                                    {(issue.status === 'open' || issue.status === 'in_progress') && (
                                      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                        <Button
                                          variant="contained"
                                          color="error"
                                          startIcon={<Close />}
                                          onClick={() => handleCloseIssue(issue)}
                                          size="small"
                                        >
                                          Close Issue
                                        </Button>
                                      </Box>
                                    )}
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredIssues.length}
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
                    label="Issue Title"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                    margin="normal"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Issue Description"
                    value={newIssue.description}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                    margin="normal"
                    multiline
                    rows={4}
                    required
                    helperText="Provide a clear and concise description of the technical issue"
                  />

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={newIssue.category}
                          onChange={(e) => setNewIssue(prev => ({ ...prev, category: e.target.value }))}
                          label="Category"
                          required
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.value} value={category.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {category.icon}
                                {category.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Impact Level</InputLabel>
                        <Select
                          value={newIssue.impact}
                          onChange={(e) => setNewIssue(prev => ({ ...prev, impact: e.target.value }))}
                          label="Impact Level"
                        >
                          {impacts.map((impact) => (
                            <MenuItem key={impact.value} value={impact.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {impact.icon}
                                {impact.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Steps to Reproduce (Optional)"
                    value={newIssue.stepsToReproduce}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, stepsToReproduce: e.target.value }))}
                    margin="normal"
                    multiline
                    rows={3}
                    helperText="List the steps that lead to this issue"
                  />

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Expected Behavior (Optional)"
                        value={newIssue.expectedBehavior}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, expectedBehavior: e.target.value }))}
                        multiline
                        rows={2}
                        helperText="What should have happened?"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Actual Behavior (Optional)"
                        value={newIssue.actualBehavior}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, actualBehavior: e.target.value }))}
                        multiline
                        rows={2}
                        helperText="What actually happened?"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleSubmitIssue}
                      disabled={!newIssue.title.trim() || !newIssue.description.trim() || !newIssue.category}
                    >
                      Submit Issue Report
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Reporting Guidelines:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Be detailed and specific"
                          secondary="Include error messages, screenshots if possible"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Choose appropriate impact level"
                          secondary="High: Blocks work, Medium: Reduces efficiency, Low: Minor issue"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Provide reproduction steps"
                          secondary="Help IT team understand and fix the issue faster"
                        />
                      </ListItem>
                    </List>
                  </Alert>

                  <Alert severity="warning">
                    <Typography variant="subtitle2" gutterBottom>
                      Emergency Issues:
                    </Typography>
                    <Typography variant="body2">
                      For critical system outages or security issues, contact IT Support directly at extension 1234 or email support@bank.com
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </TabPanel>
          </CardContent>
        </Card>

        {/* Close Issue Dialog */}
        <Dialog 
          open={closeDialog} 
          onClose={() => setCloseDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Close Issue: {selectedIssue?.id}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedIssue?.title}
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
              placeholder="Please provide comments about how this issue was resolved or why it's being closed..."
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCloseDialog(false)}>Cancel</Button>
            <Button 
              onClick={confirmCloseIssue}
              variant="contained"
              disabled={!closeComments.trim()}
            >
              Close Issue
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default TechIssuesRegister;