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
  CircularProgress,
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
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useBranch } from '../../contexts/BranchContext';
import adminEmployeeService from '../../services/adminEmployeeService';

const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );


const AddEditEmployee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { getEffectiveBranch, isSuperAdmin, branches } = useBranch();
  const isEdit = location.pathname.includes('edit');
  const existingEmployee = location.state?.employee;

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    branchName: '',
    jobRole: 'Employee',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    salary: 0,
    photoUrl: null,
    roles: [] // Array of role names
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Helper function to convert DateOnly to string format
  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string') {
      // If it's already a string, extract just the date part
      return dateValue.split('T')[0];
    }
    return dateValue;
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        
        // Fetch departments and roles in parallel
        const [depts, roles] = await Promise.all([
          adminEmployeeService.getDepartments(),
          adminEmployeeService.getAvailableRoles()
        ]);
        
        setDepartments(depts);
        setAvailableRoles(roles);

        // If editing, fetch employee data
        if (isEdit && id) {
          const employeeData = await adminEmployeeService.getEmployeeById(parseInt(id));
          setFormData({
            employeeId: employeeData.employeeId || '',
            fullName: employeeData.fullName || '',
            email: employeeData.email || '',
            phone: employeeData.phone || '',
            gender: employeeData.gender || '',
            dateOfBirth: formatDate(employeeData.dateOfBirth) || '',
            branchName: employeeData.branchName || '',
            jobRole: employeeData.jobRole || 'Employee',
            status: employeeData.status || 'Active',
            joinDate: formatDate(employeeData.joinDate) || new Date().toISOString().split('T')[0],
            salary: employeeData.salary || 0,
            photoUrl: employeeData.photoUrl || null,
            roles: employeeData.roles || []
          });
          if (employeeData.photoUrl) {
            setPhotoPreview(employeeData.photoUrl);
          }
        } else if (!isEdit) {
          // Auto-generate Employee ID
          const timestamp = Date.now().toString().slice(-6);
          setFormData(prev => ({
            ...prev,
            employeeId: `EMP${timestamp}`,
            branchName: getEffectiveBranch()
          }));
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setSaveError(error.response?.data?.message || 'Failed to load initial data');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [isEdit, id, getEffectiveBranch]);

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

  const handleRoleToggle = (roleName) => {
    setFormData(prev => {
      const isAssigned = prev.roles.includes(roleName);
      return {
        ...prev,
        roles: isAssigned ? [] : [roleName] // Only allow one role at a time
      };
    });
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.branchName) newErrors.branchName = 'Branch is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Phone validation - only if phone is provided
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (formData.phone && formData.phone.trim() && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('Save button clicked');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      setLoading(true);
      setSaveError(null);

      // Add default department since it's required by backend but not in UI
      const dataToSave = {
        ...formData,
        department: 'General' // Default department value
      };

      console.log('Data to save:', dataToSave);

      if (isEdit && id) {
        // Update existing employee
        console.log('Updating employee with ID:', id);
        const result = await adminEmployeeService.updateEmployee(parseInt(id), dataToSave);
        console.log('Update result:', result);
      } else {
        // Create new employee
        console.log('Creating new employee');
        const result = await adminEmployeeService.createEmployee(dataToSave);
        console.log('Create result:', result);
      }

      console.log('Navigating to employee management');
      navigate('/admin/employee-management');
    } catch (error) {
      console.error('Error saving employee:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      setSaveError(error.response?.data?.message || error.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/employee-management');
  };

  const handleResetPassword = () => {
    // Implement password reset logic
    alert('Password reset email sent to employee');
  };

  // Show loading state
  if (initialLoading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

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
            {saveError && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSaveError(null)}>
                {saveError}
              </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="General Info" />
                <Tab label="Professional Details" />
                <Tab label="Roles" />
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
                    <InputLabel>Branch</InputLabel>
                    <Select
                      value={formData.branchName}
                      onChange={(e) => handleInputChange('branchName', e.target.value)}
                      label="Branch"
                      error={!!errors.branchName}
                    >
                      {branches.map((branch) => (
                        <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Job Role</InputLabel>
                    <Select
                      value={formData.jobRole}
                      onChange={(e) => handleInputChange('jobRole', e.target.value)}
                      label="Job Role"
                    >
                      <MenuItem value="Employee">Employee</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                      <MenuItem value="Supervisor">Supervisor</MenuItem>
                      <MenuItem value="Team Lead">Team Lead</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Monthly Salary"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    margin="normal"
                    type="number"
                    InputProps={{
                      startAdornment: '₹',
                    }}
                    helperText="Enter monthly salary amount"
                  />

                  {formData.jobRole === 'Manager' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Manager role may require additional administrative privileges.
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
                  • You can assign only one role to a user<br/>
                  • Users will have access to all pages from their assigned role<br/>
                  • Manage roles in the Role Management page
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                {availableRoles.map((role) => {
                  const isAssigned = formData.roles.includes(role.name);
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
                        onClick={() => handleRoleToggle(role.name)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Checkbox
                            checked={isAssigned}
                            onChange={() => handleRoleToggle(role.name)}
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

              {formData.roles.length === 0 && (
                <Alert severity="warning" sx={{ mt: 3 }}>
                  <Typography variant="subtitle2">No Role Assigned</Typography>
                  <Typography variant="body2">
                    This user has no role assigned and will not have access to any admin pages.
                    Please assign a role.
                  </Typography>
                </Alert>
              )}

              {formData.roles.length > 0 && (
                <Card sx={{ mt: 3, bgcolor: 'success.50' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Assigned Role:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.roles.map((roleName) => {
                        const role = availableRoles.find((r) => r.name === roleName);
                        return role ? (
                          <Chip
                            key={roleName}
                            label={role.name}
                            color="success"
                            icon={<Security />}
                            onDelete={() => handleRoleToggle(roleName)}
                          />
                        ) : null;
                      })}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </TabPanel>

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{ background: 'linear-gradient(135deg, #64B5F6, #42A5F5)' }}
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Employee' : 'Save Employee')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default AddEditEmployee;