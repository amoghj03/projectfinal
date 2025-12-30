import React, { useState, useEffect } from 'react';
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
  Avatar,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Checkbox,
  FormGroup,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Cancel,
  PhotoCamera,
  Person,
  Email,
  Phone,
  Business,
  CalendarToday,
  Badge,
  Security,
  LockReset,
  History,
  AdminPanelSettings,
  ManageAccounts,
  Work,
  Assignment,
} from '@mui/icons-material';
import { AdminLayout } from './AdminDashboard';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBranch } from '../../contexts/BranchContext';

const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );


const AddEditEmployee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const isEdit = location.pathname.includes('edit');
  const existingEmployee = location.state?.employee;

  const [tabValue, setTabValue] = useState(0);
  // Available roles - in a real app, this would come from an API
  const availableRoles = [
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access across all branches',
      permissions: ['dashboard', 'employeeManagement', 'attendance', 'leaveManagement', 'skillReports', 'complaints', 'techIssues', 'reports', 'payslip'],
    },
    {
      id: 2,
      name: 'Branch Admin',
      description: 'Full access within assigned branch',
      permissions: ['dashboard', 'employeeManagement', 'attendance', 'leaveManagement', 'skillReports', 'complaints', 'techIssues', 'reports', 'payslip'],
    },
    {
      id: 3,
      name: 'HR Manager',
      description: 'Human resources management access',
      permissions: ['dashboard', 'employeeManagement', 'attendance', 'leaveManagement', 'complaints', 'reports', 'payslip'],
    },
    {
      id: 4,
      name: 'Operations Manager',
      description: 'Daily operations and attendance management',
      permissions: ['dashboard', 'attendance', 'leaveManagement', 'skillReports', 'complaints', 'techIssues', 'reports'],
    },
  ];

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    department: '',
    branch: '',
    role: 'Employee',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    salary: 0,
    photo: null,
    assignedRoles: [] // Array of role IDs
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (isEdit && existingEmployee) {
      setFormData({
        ...existingEmployee,
        // Ensure assignedRoles exists with default values if not present
        assignedRoles: existingEmployee.assignedRoles || []
      });
    } else if (!isEdit) {
      // Auto-generate Employee ID
      const timestamp = Date.now().toString().slice(-6);
      setFormData(prev => ({
        ...prev,
        employeeId: `EMP${timestamp}`
      }));
    }
  }, [isEdit, existingEmployee]);

  const departments = [
    'Customer Service',
    'IT Support', 
    'Accounts',
    'HR',
    'Security',
    'Management',
    'Operations'
  ];

  const branches = [
    'Main Branch',
    'Downtown Branch',
    'West Branch',
    'East Branch',
    'Tech Center'
  ];

  const roles = [
    { value: 'Employee', label: 'Employee' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Admin', label: 'Admin' },
    { value: 'HR', label: 'HR' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleRoleToggle = (roleId) => {
    setFormData(prev => {
      const isAssigned = prev.assignedRoles.includes(roleId);
      return {
        ...prev,
        assignedRoles: isAssigned
          ? prev.assignedRoles.filter(id => id !== roleId)
          : [...prev.assignedRoles, roleId]
      };
    });
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Here you would typically make an API call to save the employee
      console.log('Saving employee:', formData);
      navigate('/admin/employee-management');
    }
  };

  const handleCancel = () => {
    navigate('/admin/employee-management');
  };

  const handleResetPassword = () => {
    // Implement password reset logic
    alert('Password reset email sent to employee');
  };

  
  // Mock activity logs for edit mode
  const activityLogs = [
    { date: '2024-11-22', action: 'Logged in', details: 'Accessed employee portal at 09:15 AM' },
    { date: '2024-11-22', action: 'Attendance marked', details: 'Marked attendance at 09:15 AM' },
    { date: '2024-11-21', action: 'Skill test completed', details: 'Completed Banking Operations test - Score: 85%' },
    { date: '2024-11-20', action: 'Work logged', details: 'Added 4 hours of customer service work' },
    { date: '2024-11-19', action: 'Complaint submitted', details: 'Filed workplace lighting complaint #CMP001' }
  ];

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={handleCancel} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">
              {isEdit ? 'Edit Employee' : 'Add New Employee'}
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
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="General Info" />
                <Tab label="Professional Details" />
                <Tab label="Roles" />
                {isEdit && <Tab label="Activity Logs" />}
              </Tabs>
            </Box>

            {/* General Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        margin: '0 auto 16px',
                        fontSize: '2rem'
                      }}
                      src={photoPreview}
                    >
                      {formData.fullName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="photo-upload"
                      type="file"
                      onChange={handlePhotoUpload}
                    />
                    <label htmlFor="photo-upload">
                      <IconButton color="primary" component="span">
                        <PhotoCamera />
                      </IconButton>
                    </label>
                    <Typography variant="body2" color="text.secondary">
                      Upload Photo (Optional)
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    margin="normal"
                    disabled={isEdit}
                    helperText={isEdit ? "Employee ID cannot be changed" : "Auto-generated"}
                  />

                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    margin="normal"
                    required
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                  />

                  <TextField
                    fullWidth
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    margin="normal"
                    required
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    margin="normal"
                    required
                    error={!!errors.phone}
                    helperText={errors.phone}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      label="Gender"
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    margin="normal"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    fullWidth
                    label="Join Date"
                    value={formData.joinDate}
                    onChange={(e) => handleInputChange('joinDate', e.target.value)}
                    margin="normal"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    required
                  />

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Employment Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Employment Status"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>

                  {isEdit && (
                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<LockReset />}
                        onClick={handleResetPassword}
                        fullWidth
                      >
                        Reset Password
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Professional Details Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      label="Department"
                      error={!!errors.department}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Branch</InputLabel>
                    <Select
                      value={formData.branch}
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      label="Branch"
                      error={!!errors.branch}
                    >
                      {branches.map((branch) => (
                        <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      label="Role"
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Annual Salary"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    margin="normal"
                    type="number"
                    InputProps={{
                      startAdornment: '₹',
                    }}
                    helperText="Enter annual salary amount"
                  />

                  {formData.role === 'Admin' && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Admin role grants full system access. Please ensure this user requires administrative privileges.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Roles Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Role Assignment
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Assign roles to this user. Each role has predefined page access permissions.
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2">About Roles:</Typography>
                <Typography variant="body2">
                  • Roles define which admin pages a user can access<br/>
                  • You can assign multiple roles to a user<br/>
                  • Users will have access to all pages from their assigned roles<br/>
                  • Manage roles in the Role Management page
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                {availableRoles.map((role) => {
                  const isAssigned = formData.assignedRoles.includes(role.id);
                  return (
                    <Grid item xs={12} md={6} key={role.id}>
                      <Paper
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          border: 2,
                          borderColor: isAssigned ? 'primary.main' : 'divider',
                          bgcolor: isAssigned ? 'primary.50' : 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => handleRoleToggle(role.id)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Checkbox
                            checked={isAssigned}
                            onChange={() => handleRoleToggle(role.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Security color={isAssigned ? 'primary' : 'action'} />
                              <Typography variant="h6" fontWeight="bold">
                                {role.name}
                              </Typography>
                              {isAssigned && (
                                <Chip label="Assigned" size="small" color="primary" />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {role.description}
                            </Typography>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Access to {role.permissions.length} pages:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {role.permissions.slice(0, 4).map((perm) => (
                                  <Chip
                                    key={perm}
                                    label={perm.replace(/([A-Z])/g, ' $1').trim()}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                                {role.permissions.length > 4 && (
                                  <Chip
                                    label={`+${role.permissions.length - 4} more`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {formData.assignedRoles.length === 0 && (
                <Alert severity="warning" sx={{ mt: 3 }}>
                  <Typography variant="subtitle2">No Roles Assigned</Typography>
                  <Typography variant="body2">
                    This user has no roles assigned and will not have access to any admin pages.
                    Please assign at least one role.
                  </Typography>
                </Alert>
              )}

              {formData.assignedRoles.length > 0 && (
                <Card sx={{ mt: 3, bgcolor: 'success.50' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Summary of Assigned Roles:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.assignedRoles.map((roleId) => {
                        const role = availableRoles.find((r) => r.id === roleId);
                        return role ? (
                          <Chip
                            key={roleId}
                            label={role.name}
                            color="success"
                            icon={<Security />}
                            onDelete={() => handleRoleToggle(roleId)}
                          />
                        ) : null;
                      })}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </TabPanel>

            {/* Activity Logs Tab - Only for Edit Mode */}
            {isEdit && (
              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                  Employee Activity Summary
                </Typography>
                
                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">95%</Typography>
                        <Typography variant="body2">Attendance Rate</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">24</Typography>
                        <Typography variant="body2">Tasks Completed</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="warning.main">85%</Typography>
                        <Typography variant="body2">Avg Skill Score</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="info.main">2</Typography>
                        <Typography variant="body2">Open Issues</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Recent Activity */}
                <Typography variant="subtitle1" gutterBottom>
                  Recent Activity
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <List>
                    {activityLogs.map((log, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <History color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={log.action}
                            secondary={
                              <Box>
                                <Typography variant="body2">{log.details}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {log.date}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < activityLogs.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </TabPanel>
            )}

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ background: 'linear-gradient(135deg, #64B5F6, #42A5F5)' }}
              >
                {isEdit ? 'Update Employee' : 'Save Employee'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default AddEditEmployee;