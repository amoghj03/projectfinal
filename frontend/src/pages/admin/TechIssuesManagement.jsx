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
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  FileDownload,
  FilterList,
  Visibility,
  CheckCircle,
  Cancel,
  BugReport,
  Warning,
  Error,
  Info,
  Pending,
  HourglassEmpty,
  ThumbUp,
  ThumbDown,
  Comment,
  Business,
} from '@mui/icons-material';
import { useBranch } from '../../contexts/BranchContext';
import { AdminLayout } from './AdminDashboard';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const TechIssuesManagement = () => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterImpact, setFilterImpact] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock tech issues data
  const [techIssuesData, setTechIssuesData] = useState([
    {
      issueId: 'TECH001',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Customer Service',
      branch: 'Main Branch',
      title: 'Login system timeout error',
      description: 'System automatically logs out users after 5 minutes of inactivity instead of the expected 30 minutes',
      category: 'authentication',
      impact: 'medium',
      status: 'pending_approval',
      submittedDate: '2024-11-20',
      lastUpdate: '2024-11-21',
      stepsToReproduce: '1. Login to system\n2. Leave inactive for 5 minutes\n3. Try to perform any action',
      expectedBehavior: 'Session should remain active for 30 minutes',
      actualBehavior: 'Session expires after 5 minutes',
      employeeResolution: 'Updated session timeout configuration in server settings'
    },
    {
      issueId: 'TECH002',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'IT Support',
      branch: 'Tech Center',
      title: 'Database search malfunction',
      description: 'Search function returns incorrect customer records when using partial name matches',
      category: 'database',
      impact: 'high',
      status: 'open',
      submittedDate: '2024-11-18',
      lastUpdate: '2024-11-21',
      stepsToReproduce: '1. Go to customer search\n2. Enter partial name\n3. Check results',
      expectedBehavior: 'Should return all customers with matching names',
      actualBehavior: 'Returns random customer records'
    },
    {
      issueId: 'TECH003',
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      department: 'Accounts',
      branch: 'Downtown Branch',
      title: 'Report generation performance issue',
      description: 'Monthly reports take excessively long time to generate, often timing out',
      category: 'performance',
      impact: 'medium',
      status: 'approved',
      submittedDate: '2024-11-15',
      lastUpdate: '2024-11-19',
      employeeResolution: 'Optimized database queries and added indexing',
      adminComment: 'Good work on optimizing the queries. Issue resolved effectively.',
      approvedBy: 'Admin User',
      approvedDate: '2024-11-19'
    },
    {
      issueId: 'TECH004',
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      department: 'HR',
      branch: 'Main Branch',
      title: 'Email notification system failure',
      description: 'Automated email notifications for leave approvals are not being sent to employees',
      category: 'integration',
      impact: 'high',
      status: 'pending_approval',
      submittedDate: '2024-11-16',
      lastUpdate: '2024-11-20',
      employeeResolution: 'Fixed SMTP configuration and updated email templates'
    },
    {
      issueId: 'TECH005',
      employeeId: 'EMP005',
      employeeName: 'David Brown',
      department: 'Customer Service',
      branch: 'West Branch',
      title: 'UI responsiveness on mobile',
      description: 'Banking application interface is not responsive on mobile devices',
      category: 'ui',
      impact: 'low',
      status: 'rejected',
      submittedDate: '2024-11-10',
      lastUpdate: '2024-11-12',
      employeeResolution: 'Added CSS media queries for mobile responsiveness',
      adminComment: 'The proposed solution is incomplete. Please implement proper responsive framework.',
      rejectedBy: 'Admin User',
      rejectedDate: '2024-11-12'
    },
  ]);

  const statuses = ['All', 'open', 'pending_approval', 'approved', 'rejected'];
  const impacts = ['All', 'low', 'medium', 'high'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'info';
      case 'pending_approval': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'high': return <Error />;
      case 'medium': return <Warning />;
      case 'low': return <Info />;
      default: return <Info />;
    }
  };

  const filteredData = techIssuesData.filter(issue => {
    const statusFilter = tabValue === 0 ? 
      ['open', 'pending_approval'] : 
      tabValue === 1 ? ['pending_approval'] : 
      ['approved', 'rejected'];
    
    const effectiveBranch = getEffectiveBranch();
    const branchMatch = isSuperAdmin || effectiveBranch === 'All Branches' || issue.branch === effectiveBranch;
    
    return (
      branchMatch &&
      statusFilter.includes(issue.status) &&
      (filterEmployee === '' || 
       issue.employeeName.toLowerCase().includes(filterEmployee.toLowerCase()) || 
       issue.employeeId.toLowerCase().includes(filterEmployee.toLowerCase())) &&
      (filterStatus === '' || filterStatus === 'All' || issue.status === filterStatus) &&
      (filterImpact === '' || filterImpact === 'All' || issue.impact === filterImpact)
    );
  });

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setDetailsDialog(true);
  };

  const handleApprovalAction = (issue, action) => {
    setSelectedIssue(issue);
    setApprovalComment('');
    setApprovalDialog(true);
  };

  const handleApprovalSubmit = (action) => {
    if (!selectedIssue) return;

    const updatedIssues = techIssuesData.map(issue => {
      if (issue.issueId === selectedIssue.issueId) {
        return {
          ...issue,
          status: action === 'approve' ? 'approved' : 'rejected',
          adminComment: approvalComment,
          [`${action === 'approve' ? 'approved' : 'rejected'}By`]: 'Admin User',
          [`${action === 'approve' ? 'approved' : 'rejected'}Date`]: new Date().toISOString().split('T')[0],
          lastUpdate: new Date().toISOString().split('T')[0]
        };
      }
      return issue;
    });

    setTechIssuesData(updatedIssues);
    setApprovalDialog(false);
    setSelectedIssue(null);
    setApprovalComment('');
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map(issue => ({
      'Issue ID': issue.issueId,
      'Employee ID': issue.employeeId,
      'Employee Name': issue.employeeName,
      'Department': issue.department,
      'Title': issue.title,
      'Description': issue.description,
      'Category': issue.category,
      'Impact': issue.impact,
      'Status': issue.status,
      'Submitted Date': issue.submittedDate,
      'Last Update': issue.lastUpdate,
      'Employee Resolution': issue.employeeResolution || 'N/A',
      'Admin Comment': issue.adminComment || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tech Issues Report');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `tech_issues_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Calculate statistics from all branch-filtered data
  const allBranchFilteredData = techIssuesData.filter(issue => {
    const effectiveBranch = getEffectiveBranch();
    const branchMatch = isSuperAdmin || effectiveBranch === 'All Branches' || issue.branch === effectiveBranch;
    return branchMatch;
  });
  
  const stats = {
    total: allBranchFilteredData.length,
    open: allBranchFilteredData.filter(i => i.status === 'open').length,
    pendingApproval: allBranchFilteredData.filter(i => i.status === 'pending_approval').length,
    approved: allBranchFilteredData.filter(i => i.status === 'approved').length,
    rejected: allBranchFilteredData.filter(i => i.status === 'rejected').length,
    highImpact: allBranchFilteredData.filter(i => i.impact === 'high').length
  };

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4">
              Tech Issues Management & Approvals
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
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                    <BugReport />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Issues
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'info.main', mr: 2 }}>
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

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'warning.main', mr: 2 }}>
                    <HourglassEmpty />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.pendingApproval}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Approval
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'success.main', mr: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.approved}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ backgroundColor: 'error.main', mr: 2 }}>
                    <Error />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.highImpact}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Priority
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
                <Tab label="All Issues" />
                <Tab label="Pending Approval" />
                <Tab label="Completed" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {/* Filters */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FilterList />
                <TextField
                  label="Employee Name/ID"
                  value={filterEmployee}
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Impact</InputLabel>
                  <Select
                    value={filterImpact}
                    onChange={(e) => setFilterImpact(e.target.value)}
                    label="Impact"
                  >
                    {impacts.map((impact) => (
                      <MenuItem key={impact} value={impact}>
                        {impact}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Issues Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Issue ID</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Impact</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((issue) => (
                        <TableRow key={issue.issueId}>
                          <TableCell>{issue.issueId}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: 14 }}>
                                {issue.employeeName.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">{issue.employeeName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {issue.employeeId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                              {issue.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={issue.category} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getImpactIcon(issue.impact)}
                              label={issue.impact}
                              color={getImpactColor(issue.impact)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={issue.status.replace('_', ' ')}
                              color={getStatusColor(issue.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{issue.submittedDate}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton onClick={() => handleViewIssue(issue)} size="small">
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              {issue.status === 'pending_approval' && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton 
                                      onClick={() => handleApprovalAction(issue, 'approve')} 
                                      size="small"
                                      color="success"
                                    >
                                      <ThumbUp />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton 
                                      onClick={() => handleApprovalAction(issue, 'reject')} 
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
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Issues marked as resolved by employees are waiting for your approval. Review the employee's resolution and approve or reject accordingly.
              </Alert>
              
              {/* Same table structure but filtered for pending approval */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Issue ID</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Impact</TableCell>
                      <TableCell>Employee Resolution</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .filter(issue => issue.status === 'pending_approval')
                      .map((issue) => (
                        <TableRow key={issue.issueId}>
                          <TableCell>{issue.issueId}</TableCell>
                          <TableCell>{issue.employeeName}</TableCell>
                          <TableCell>{issue.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={issue.impact}
                              color={getImpactColor(issue.impact)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {issue.employeeResolution?.substring(0, 100)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                onClick={() => handleApprovalAction(issue, 'approve')}
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircle />}
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleApprovalAction(issue, 'reject')}
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<Cancel />}
                              >
                                Reject
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {/* Completed issues table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Issue ID</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Completed Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .filter(issue => ['approved', 'rejected'].includes(issue.status))
                      .map((issue) => (
                        <TableRow key={issue.issueId}>
                          <TableCell>{issue.issueId}</TableCell>
                          <TableCell>{issue.employeeName}</TableCell>
                          <TableCell>{issue.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={issue.status}
                              color={getStatusColor(issue.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {issue.approvedDate || issue.rejectedDate}
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleViewIssue(issue)} size="small">
                              <Visibility />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

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

        {/* Issue Details Dialog */}
        <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            Issue Details - {selectedIssue?.issueId}
          </DialogTitle>
          <DialogContent>
            {selectedIssue && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Issue Information</Typography>
                  <Typography><strong>Title:</strong> {selectedIssue.title}</Typography>
                  <Typography><strong>Category:</strong> {selectedIssue.category}</Typography>
                  <Typography><strong>Impact:</strong> 
                    <Chip
                      label={selectedIssue.impact}
                      color={getImpactColor(selectedIssue.impact)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>Status:</strong>
                    <Chip
                      label={selectedIssue.status}
                      color={getStatusColor(selectedIssue.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>Submitted:</strong> {selectedIssue.submittedDate}</Typography>
                  <Typography><strong>Employee:</strong> {selectedIssue.employeeName} ({selectedIssue.employeeId})</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Technical Details</Typography>
                  <Typography><strong>Steps to Reproduce:</strong></Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {selectedIssue.stepsToReproduce}
                  </Typography>
                  <Typography><strong>Expected Behavior:</strong> {selectedIssue.expectedBehavior}</Typography>
                  <Typography><strong>Actual Behavior:</strong> {selectedIssue.actualBehavior}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography>{selectedIssue.description}</Typography>
                </Grid>
                {selectedIssue.employeeResolution && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Employee Resolution</Typography>
                    <Typography>{selectedIssue.employeeResolution}</Typography>
                  </Grid>
                )}
                {selectedIssue.adminComment && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Admin Comment</Typography>
                    <Typography color={selectedIssue.status === 'approved' ? 'success.main' : 'error.main'}>
                      {selectedIssue.adminComment}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedIssue?.status === 'pending_approval' ? 'Approve/Reject Issue Resolution' : 'Issue Action'}
          </DialogTitle>
          <DialogContent>
            {selectedIssue && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedIssue.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Employee: {selectedIssue.employeeName}
                </Typography>
                
                {selectedIssue.employeeResolution && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Employee's Resolution:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography>{selectedIssue.employeeResolution}</Typography>
                    </Paper>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Admin Comment"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  multiline
                  rows={4}
                  placeholder="Add your comment about this resolution..."
                  margin="normal"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => handleApprovalSubmit('reject')} 
              color="error"
              startIcon={<ThumbDown />}
            >
              Reject
            </Button>
            <Button 
              onClick={() => handleApprovalSubmit('approve')} 
              variant="contained"
              color="success"
              startIcon={<ThumbUp />}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default TechIssuesManagement;