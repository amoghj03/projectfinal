import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  IconButton,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Delete,
  Business,
  Person,
  Security,
  EventAvailable,
  Settings as SettingsIcon,
  CheckCircle,
  ExpandMore,
  Apartment,
} from '@mui/icons-material';
import tenantService from '../../services/tenantService';

const steps = [
  'Tenant Information',
  'Branches Setup',
  'Admin User',
  'Roles & Permissions',
  'Leave Types',
  'Settings & Review'
];

const TenantOnboarding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    tenant: {
      name: '',
      slug: '',
      domain: '',
      subdomain: '',
      logoUrl: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      timezone: 'UTC',
      currency: 'USD',
      subscriptionPlan: 'basic',
      subscriptionStatus: 'trial',
      subscriptionExpiresAt: '',
      maxEmployees: 50,
      maxBranches: 5,
    },
    branches: [
      {
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        isHeadOffice: true,
      }
    ],
    adminUser: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      department: 'Administration',
      jobRole: 'Admin',
      salary: 0,
      branchId: 0,
    },
    roles: [
      {
        name: 'SuperAdmin',
        description: 'Full system administrator access',
        isSystem: true,
        permissionIds: [],
      },
      {
        name: 'Admin',
        description: 'Department manager with approval rights',
        isSystem: true,
        permissionIds: [],
      },
      {
        name: 'Employee',
        description: 'Regular employee with basic access',
        isSystem: true,
        permissionIds: [],
      }
    ],
    leaveTypes: [
      {
        name: 'Sick Leave',
        description: 'Medical leave for illness or injury',
        maxDaysPerYear: 10,
        requiresApproval: true,
        isPaid: true,
      },
      {
        name: 'Casual Leave',
        description: 'Casual or personal leave',
        maxDaysPerYear: 12,
        requiresApproval: true,
        isPaid: true,
      },
      {
        name: 'Annual Leave',
        description: 'Annual vacation leave',
        maxDaysPerYear: 15,
        requiresApproval: true,
        isPaid: true,
      }
    ],
    settings: {
      RequireComplaintApproval: 'true',
      TechIssueApproval: 'true',
      NoWeekends: 'false',
    }
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const data = await tenantService.getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Tenant Information
        if (!formData.tenant.name || !formData.tenant.slug || !formData.tenant.contactEmail) {
          setError('Please fill in all required tenant fields');
          return false;
        }
        if (!slugAvailable) {
          setError('Tenant slug is not available');
          return false;
        }
        return true;
      case 1: // Branches
        if (formData.branches.length === 0) {
          setError('At least one branch is required');
          return false;
        }
        for (const branch of formData.branches) {
          if (!branch.name) {
            setError('All branches must have a name');
            return false;
          }
        }
        return true;
      case 2: // Admin User
        if (!formData.adminUser.email || !formData.adminUser.password || !formData.adminUser.fullName) {
          setError('Please fill in all required admin user fields');
          return false;
        }
        if (formData.adminUser.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        return true;
      case 3: // Roles
        return true;
      case 4: // Leave Types
        return true;
      case 5: // Settings
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Clean up the data - convert empty strings to null for date fields
      const cleanedData = {
        ...formData,
        tenant: {
          ...formData.tenant,
          subscriptionExpiresAt: formData.tenant.subscriptionExpiresAt || null
        },
        adminUser: {
          ...formData.adminUser,
          dateOfBirth: formData.adminUser.dateOfBirth || null
        }
      };

      const result = await tenantService.onboardTenant(cleanedData);
      
      if (result.success) {
        setSuccess(`Tenant "${formData.tenant.name}" onboarded successfully! Admin email: ${result.adminEmail}`);
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 3000);
      } else {
        setError(result.message || 'Failed to onboard tenant');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during onboarding');
    } finally {
      setLoading(false);
    }
  };

  const checkSlugAvailability = async (slug) => {
    if (!slug) return;
    
    setCheckingSlug(true);
    try {
      const available = await tenantService.checkSlugAvailability(slug);
      setSlugAvailable(available);
    } catch (error) {
      console.error('Error checking slug:', error);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleTenantChange = (field, value) => {
    setFormData({
      ...formData,
      tenant: {
        ...formData.tenant,
        [field]: value,
      }
    });

    // Auto-generate slug from name
    if (field === 'name' && !formData.tenant.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        tenant: { ...prev.tenant, slug }
      }));
      checkSlugAvailability(slug);
    }

    // Check slug availability
    if (field === 'slug') {
      checkSlugAvailability(value);
    }
  };

  const handleAdminUserChange = (field, value) => {
    setFormData({
      ...formData,
      adminUser: {
        ...formData.adminUser,
        [field]: value,
      }
    });
  };

  const addBranch = () => {
    setFormData({
      ...formData,
      branches: [
        ...formData.branches,
        {
          name: '',
          code: '',
          address: '',
          city: '',
          state: '',
          country: '',
          phone: '',
          email: '',
          isHeadOffice: false,
        }
      ]
    });
  };

  const removeBranch = (index) => {
    setFormData({
      ...formData,
      branches: formData.branches.filter((_, i) => i !== index),
    });
  };

  const handleBranchChange = (index, field, value) => {
    const newBranches = [...formData.branches];
    newBranches[index][field] = value;
    setFormData({
      ...formData,
      branches: newBranches,
    });
  };

  const addRole = () => {
    setFormData({
      ...formData,
      roles: [
        ...formData.roles,
        {
          name: '',
          description: '',
          isSystem: false,
          permissionIds: [],
        }
      ]
    });
  };

  const removeRole = (index) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter((_, i) => i !== index),
    });
  };

  const handleRoleChange = (index, field, value) => {
    const newRoles = [...formData.roles];
    newRoles[index][field] = value;
    setFormData({
      ...formData,
      roles: newRoles,
    });
  };

  const addLeaveType = () => {
    setFormData({
      ...formData,
      leaveTypes: [
        ...formData.leaveTypes,
        {
          name: '',
          description: '',
          maxDaysPerYear: 10,
          requiresApproval: true,
          isPaid: true,
        }
      ]
    });
  };

  const removeLeaveType = (index) => {
    setFormData({
      ...formData,
      leaveTypes: formData.leaveTypes.filter((_, i) => i !== index),
    });
  };

  const handleLeaveTypeChange = (index, field, value) => {
    const newLeaveTypes = [...formData.leaveTypes];
    newLeaveTypes[index][field] = value;
    setFormData({
      ...formData,
      leaveTypes: newLeaveTypes,
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
                Tenant Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Company Name"
                value={formData.tenant.name}
                onChange={(e) => handleTenantChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Slug"
                value={formData.tenant.slug}
                onChange={(e) => handleTenantChange('slug', e.target.value)}
                helperText="Unique identifier (lowercase, no spaces)"
                InputProps={{
                  endAdornment: checkingSlug ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : slugAvailable ? (
                    <InputAdornment position="end">
                      <CheckCircle color="success" />
                    </InputAdornment>
                  ) : (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="error">Not available</Typography>
                    </InputAdornment>
                  )
                }}
                error={!slugAvailable}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Contact Email"
                value={formData.tenant.contactEmail}
                onChange={(e) => handleTenantChange('contactEmail', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.tenant.contactPhone}
                onChange={(e) => handleTenantChange('contactPhone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.tenant.address}
                onChange={(e) => handleTenantChange('address', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.tenant.city}
                onChange={(e) => handleTenantChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.tenant.state}
                onChange={(e) => handleTenantChange('state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Country"
                value={formData.tenant.country}
                onChange={(e) => handleTenantChange('country', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subscription Plan</InputLabel>
                <Select
                  value={formData.tenant.subscriptionPlan}
                  label="Subscription Plan"
                  onChange={(e) => handleTenantChange('subscriptionPlan', e.target.value)}
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subscription Status</InputLabel>
                <Select
                  value={formData.tenant.subscriptionStatus}
                  label="Subscription Status"
                  onChange={(e) => handleTenantChange('subscriptionStatus', e.target.value)}
                >
                  <MenuItem value="trial">Trial</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Employees"
                value={formData.tenant.maxEmployees}
                onChange={(e) => handleTenantChange('maxEmployees', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 10000 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Branches"
                value={formData.tenant.maxBranches}
                onChange={(e) => handleTenantChange('maxBranches', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 1000 }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                <Apartment sx={{ verticalAlign: 'middle', mr: 1 }} />
                Branches Setup
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addBranch}
              >
                Add Branch
              </Button>
            </Box>
            {formData.branches.map((branch, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">
                      Branch {index + 1}
                      {branch.isHeadOffice && <Chip label="Head Office" size="small" color="primary" sx={{ ml: 1 }} />}
                    </Typography>
                    {formData.branches.length > 1 && (
                      <IconButton onClick={() => removeBranch(index)} color="error">
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Branch Name"
                        value={branch.name}
                        onChange={(e) => handleBranchChange(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Branch Code"
                        value={branch.code}
                        onChange={(e) => handleBranchChange(index, 'code', e.target.value)}
                        helperText="Leave empty to auto-generate"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={branch.address}
                        onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="City"
                        value={branch.city}
                        onChange={(e) => handleBranchChange(index, 'city', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="State"
                        value={branch.state}
                        onChange={(e) => handleBranchChange(index, 'state', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Country"
                        value={branch.country}
                        onChange={(e) => handleBranchChange(index, 'country', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={branch.phone}
                        onChange={(e) => handleBranchChange(index, 'phone', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        value={branch.email}
                        onChange={(e) => handleBranchChange(index, 'email', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={branch.isHeadOffice}
                            onChange={(e) => handleBranchChange(index, 'isHeadOffice', e.target.checked)}
                          />
                        }
                        label="Head Office"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                Admin User Creation
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Create the primary administrator account for this tenant
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Admin Email"
                value={formData.adminUser.email}
                onChange={(e) => handleAdminUserChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="password"
                label="Password"
                value={formData.adminUser.password}
                onChange={(e) => handleAdminUserChange('password', e.target.value)}
                helperText="Minimum 6 characters"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                value={formData.adminUser.fullName}
                onChange={(e) => handleAdminUserChange('fullName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.adminUser.phone}
                onChange={(e) => handleAdminUserChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.adminUser.gender}
                  label="Gender"
                  onChange={(e) => handleAdminUserChange('gender', e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={formData.adminUser.dateOfBirth}
                onChange={(e) => handleAdminUserChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Department"
                value={formData.adminUser.department}
                onChange={(e) => handleAdminUserChange('department', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Job Role"
                value={formData.adminUser.jobRole}
                onChange={(e) => handleAdminUserChange('jobRole', e.target.value)}
                Disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Salary"
                value={formData.adminUser.salary}
                onChange={(e) => handleAdminUserChange('salary', parseFloat(e.target.value))}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Assign to Branch</InputLabel>
                <Select
                  value={formData.adminUser.branchId}
                  label="Assign to Branch"
                  onChange={(e) => handleAdminUserChange('branchId', e.target.value)}
                >
                  {formData.branches.map((branch, index) => (
                    <MenuItem key={index} value={index}>
                      {branch.name || `Branch ${index + 1}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3:
        // Employee permissions: IDs 1-6 (dashboard.view, employee.view, leave.request, skill.manage, complaint.create, techissue.create)
        const employeePermissions = permissions.filter(p => p.id >= 1 && p.id <= 6);
        
        // Admin permissions: IDs 7+ (admin.dashboard.view, employee.manage, role.manage, etc.)
        const adminPermissions = permissions.filter(p => p.id >= 7);

        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6">
                  <Security sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Roles & Permissions
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Configure roles and their permissions
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addRole}
              >
                Add Role
              </Button>
            </Box>
            {formData.roles.map((role, index) => (
              <Accordion key={index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <Typography>
                      {role.name || `Role ${index + 1}`}
                      {role.isSystem && <Chip label="System" size="small" sx={{ ml: 1 }} />}
                    </Typography>
                    {!role.isSystem && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRole(index);
                        }}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Role Name"
                        value={role.name}
                        onChange={(e) => handleRoleChange(index, 'name', e.target.value)}
                        disabled={role.isSystem}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={role.description}
                        onChange={(e) => handleRoleChange(index, 'description', e.target.value)}
                      />
                    </Grid>
                    
                    {/* Admin Permissions Card */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Admin Permissions
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => {
                                const allAdminIds = adminPermissions.map(p => p.id);
                                const currentIds = role.permissionIds || [];
                                const hasAll = allAdminIds.every(id => currentIds.includes(id));
                                
                                if (hasAll) {
                                  // Deselect all admin permissions
                                  handleRoleChange(index, 'permissionIds', 
                                    currentIds.filter(id => !allAdminIds.includes(id))
                                  );
                                } else {
                                  // Select all admin permissions
                                  handleRoleChange(index, 'permissionIds', 
                                    [...new Set([...currentIds, ...allAdminIds])]
                                  );
                                }
                              }}
                            >
                              {adminPermissions.every(p => role.permissionIds.includes(p.id)) 
                                ? 'Deselect All' 
                                : 'Select All'}
                            </Button>
                          </Box>
                          <FormGroup>
                            {adminPermissions.map((permission) => (
                              <FormControlLabel
                                key={permission.id}
                                control={
                                  <Checkbox
                                    checked={role.permissionIds.includes(permission.id)}
                                    onChange={(e) => {
                                      const currentIds = role.permissionIds || [];
                                      if (e.target.checked) {
                                        handleRoleChange(index, 'permissionIds', [...currentIds, permission.id]);
                                      } else {
                                        handleRoleChange(index, 'permissionIds', 
                                          currentIds.filter(id => id !== permission.id)
                                        );
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant="body2">{permission.displayName || permission.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {permission.description}
                                    </Typography>
                                  </Box>
                                }
                              />
                            ))}
                          </FormGroup>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Employee Permissions Card */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Employee Permissions
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => {
                                const allEmployeeIds = employeePermissions.map(p => p.id);
                                const currentIds = role.permissionIds || [];
                                const hasAll = allEmployeeIds.every(id => currentIds.includes(id));
                                
                                if (hasAll) {
                                  // Deselect all employee permissions
                                  handleRoleChange(index, 'permissionIds', 
                                    currentIds.filter(id => !allEmployeeIds.includes(id))
                                  );
                                } else {
                                  // Select all employee permissions
                                  handleRoleChange(index, 'permissionIds', 
                                    [...new Set([...currentIds, ...allEmployeeIds])]
                                  );
                                }
                              }}
                            >
                              {employeePermissions.every(p => role.permissionIds.includes(p.id)) 
                                ? 'Deselect All' 
                                : 'Select All'}
                            </Button>
                          </Box>
                          <FormGroup>
                            {employeePermissions.map((permission) => (
                              <FormControlLabel
                                key={permission.id}
                                control={
                                  <Checkbox
                                    checked={role.permissionIds.includes(permission.id)}
                                    onChange={(e) => {
                                      const currentIds = role.permissionIds || [];
                                      if (e.target.checked) {
                                        handleRoleChange(index, 'permissionIds', [...currentIds, permission.id]);
                                      } else {
                                        handleRoleChange(index, 'permissionIds', 
                                          currentIds.filter(id => id !== permission.id)
                                        );
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant="body2">{permission.displayName || permission.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {permission.description}
                                    </Typography>
                                  </Box>
                                }
                              />
                            ))}
                          </FormGroup>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h6">
                  <EventAvailable sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Leave Types
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Configure leave policies for the tenant
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addLeaveType}
              >
                Add Leave Type
              </Button>
            </Box>
            {formData.leaveTypes.map((leaveType, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">
                      {leaveType.name || `Leave Type ${index + 1}`}
                    </Typography>
                    <IconButton onClick={() => removeLeaveType(index)} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Leave Type Name"
                        value={leaveType.name}
                        onChange={(e) => handleLeaveTypeChange(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max Days Per Year"
                        value={leaveType.maxDaysPerYear}
                        onChange={(e) => handleLeaveTypeChange(index, 'maxDaysPerYear', parseInt(e.target.value))}
                        inputProps={{ min: 0, max: 365 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={leaveType.description}
                        onChange={(e) => handleLeaveTypeChange(index, 'description', e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormGroup row>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={leaveType.requiresApproval}
                              onChange={(e) => handleLeaveTypeChange(index, 'requiresApproval', e.target.checked)}
                            />
                          }
                          label="Requires Approval"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={leaveType.isPaid}
                              onChange={(e) => handleLeaveTypeChange(index, 'isPaid', e.target.checked)}
                            />
                          }
                          label="Paid Leave"
                        />
                      </FormGroup>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Settings & Review
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  General Settings
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.settings.RequireComplaintApproval === 'true'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            RequireComplaintApproval: e.target.checked ? 'true' : 'false'
                          }
                        })}
                      />
                    }
                    label="Require Complaint Approval"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.settings.TechIssueApproval === 'true'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            TechIssueApproval: e.target.checked ? 'true' : 'false'
                          }
                        })}
                      />
                    }
                    label="Tech Issue Approval Required"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.settings.NoWeekends === 'true'}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            NoWeekends: e.target.checked ? 'true' : 'false'
                          }
                        })}
                      />
                    }
                    label="No Weekends"
                  />
                </FormGroup>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Review Onboarding Details
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Tenant Name</Typography>
                    <Typography variant="body1">{formData.tenant.name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Slug</Typography>
                    <Typography variant="body1">{formData.tenant.slug}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Contact Email</Typography>
                    <Typography variant="body1">{formData.tenant.contactEmail}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">Subscription Plan</Typography>
                    <Typography variant="body1">{formData.tenant.subscriptionPlan}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Branches</Typography>
                    <Typography variant="body1">{formData.branches.length} branch(es)</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Admin User</Typography>
                    <Typography variant="body1">{formData.adminUser.fullName} ({formData.adminUser.email})</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Roles</Typography>
                    <Typography variant="body1">{formData.roles.length} role(s)</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Leave Types</Typography>
                    <Typography variant="body1">{formData.leaveTypes.length} leave type(s)</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tenant Onboarding
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Follow the steps below to onboard a new tenant
        </Typography>

        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {activeStep === steps.length ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Tenant Onboarded Successfully!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Redirecting to dashboard...
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Onboarding...' : 'Complete Onboarding'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default TenantOnboarding;
