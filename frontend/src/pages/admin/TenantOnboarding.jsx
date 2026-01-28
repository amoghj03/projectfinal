import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
  Tabs,
  Tab,
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
import { AdminLayout } from './AdminDashboard';
import tenantService from '../../services/tenantService';
import branchService from '../../services/branchService';
import adminEmployeeService from '../../services/adminEmployeeService';


// Helper functions for time string <-> Date conversion (for TimePicker compatibility)
function parseTimeStringToDate(timeStr) {
  if (!timeStr) return null;
  timeStr = timeStr.replace(/"/g, '');
  const now = new Date();
  let date = new Date(now);
  const match = timeStr.match(/(\d{1,2})(:(\d{2}))?\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    const ampm = match[4].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  const parsed = Date.parse('01/01/2000 ' + timeStr);
  if (!isNaN(parsed)) return new Date(parsed);
  return now;
}

function formatDateToTimeString(date) {
  if (!(date instanceof Date)) return date;
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return minutes
    ? `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`
    : `${hours} ${ampm}`;
}
const steps = [
  'Tenant Information',
  'Branches Setup',
  'Admin User',
  'Roles & Permissions',
  'Leave Types',
  'Settings & Review'
];

const TenantOnboarding = () => {
  const [tabValue, setTabValue] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);
  
  // Branch addition states
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [newBranchData, setNewBranchData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    email: '',
  });

  // Employee addition states
  const [employeeBranches, setEmployeeBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    tenant: null,
    branchId: '',
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    jobRole: 'Employee',
    status: 'Active',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
    roles: [],
  });

  // Tenant details and renewal states
  const [selectedTenantForDetails, setSelectedTenantForDetails] = useState(null);
  const [loadingTenantDetails, setLoadingTenantDetails] = useState(false);
  const [renewalForm, setRenewalForm] = useState({
    subscriptionPlan: 'basic',
    subscriptionDays: 30,
    maxEmployees: 50,
    maxBranches: 5,
  });
  const [showRenewDialog, setShowRenewDialog] = useState(false);

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
      subscriptionDays: 30,
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
    fetchTenants();
    fetchAvailableRoles();
  }, []);

  const fetchPermissions = async () => {
    try {
      const data = await tenantService.getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchTenants = async () => {
    console.log('Fetching tenants...');
    setLoadingTenants(true);
    try {
      const data = await tenantService.getAllTenants();
      console.log('Tenants fetched:', data);
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setError('Failed to load tenants. Please refresh the page.');
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  };

  const fetchAvailableRoles = async () => {
    setLoadingRoles(true);
    try {
      const roles = await adminEmployeeService.getAvailableRoles();
      setAvailableRoles(roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadBranchesForTenant = async (tenant) => {
    if (!tenant) {
      setEmployeeBranches([]);
      return;
    }

    setLoadingBranches(true);
    try {
      const branches = await branchService.getBranchesByTenant(tenant.id);
      setEmployeeBranches(branches || []);
    } catch (error) {
      console.error('Error fetching branches for tenant:', error);
      setError('Failed to load branches for selected tenant');
      setEmployeeBranches([]);
    } finally {
      setLoadingBranches(false);
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
        },
        settings: {
          ...formData.settings,
          checkIn: formData.settings.checkIn ? formatDateToTimeString(parseTimeStringToDate(formData.settings.checkIn)) : null,
          checkOut: formData.settings.checkOut ? formatDateToTimeString(parseTimeStringToDate(formData.settings.checkOut)) : null
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

  const handleEmployeeTenantChange = (tenant) => {
    setSelectedTenant(tenant);
    setEmployeeForm((prev) => ({
      ...prev,
      tenant,
      branchId: '',
    }));
    loadBranchesForTenant(tenant);
  };

  const handleEmployeeFormChange = (field, value) => {
    setEmployeeForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmployeeRoleToggle = (roleName) => {
    setEmployeeForm((prev) => {
      const isAssigned = prev.roles.includes(roleName);
      return {
        ...prev,
        roles: isAssigned ? [] : [roleName],
      };
    });
  };

  const handleAddEmployeeToTenant = async () => {
    if (!employeeForm.tenant) {
      setError('Please select a tenant');
      return;
    }
    if (!employeeForm.branchId) {
      setError('Please select a branch');
      return;
    }
    if (!employeeForm.fullName || !employeeForm.email) {
      setError('Full name and email are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        employeeId: employeeForm.employeeId,
        fullName: employeeForm.fullName,
        email: employeeForm.email,
        phone: employeeForm.phone,
        gender: employeeForm.gender,
        dateOfBirth: employeeForm.dateOfBirth || null,
        jobRole: employeeForm.jobRole || 'Employee',
        status: employeeForm.status || 'Active',
        salary: employeeForm.salary || null,
        branchId: Number(employeeForm.branchId),
        joinDate: employeeForm.joinDate || new Date().toISOString().split('T')[0],
        roles: employeeForm.roles,
      };

      await tenantService.addEmployeeToTenant(employeeForm.tenant.id, payload);

      setSuccess(`Employee "${employeeForm.fullName}" added to "${employeeForm.tenant.name}" successfully!`);

      setEmployeeForm({
        tenant: employeeForm.tenant,
        branchId: '',
        employeeId: '',
        fullName: '',
        email: '',
        phone: '',
        gender: '',
        dateOfBirth: '',
        jobRole: 'Employee',
        status: 'Active',
        salary: '',
        joinDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      setError(error.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
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
                label="Subscription Days"
                value={formData.tenant.subscriptionDays}
                onChange={(e) => handleTenantChange('subscriptionDays', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 3650 }}
                helperText="Number of days for subscription validity (1-3650)"
              />
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
                        disabled={role.isSystem}
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
                  <Box display="flex" gap={2} mt={2}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        label="Check In Time"
                        value={formData.settings.checkIn ? parseTimeStringToDate(formData.settings.checkIn) : null}
                        onChange={val => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            checkIn: val ? formatDateToTimeString(val) : ''
                          }
                        })}
                        renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                      />
                      <TimePicker
                        label="Check Out Time"
                        value={formData.settings.checkOut ? parseTimeStringToDate(formData.settings.checkOut) : null}
                        onChange={val => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            checkOut: val ? formatDateToTimeString(val) : ''
                          }
                        })}
                        renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                      />
                    </LocalizationProvider>
                  </Box>
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

  const handleNewBranchChange = (field, value) => {
    setNewBranchData({
      ...newBranchData,
      [field]: value,
    });
  };

  const handleAddBranchToTenant = async () => {
    if (!selectedTenant) {
      setError('Please select a tenant');
      return;
    }
    if (!newBranchData.name) {
      setError('Branch name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await tenantService.addBranchToTenant(selectedTenant.id, newBranchData);
      setSuccess(`Branch "${newBranchData.name}" added to "${selectedTenant.name}" successfully!`);
      
      // Reset form
      setNewBranchData({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
      });
      setSelectedTenant(null);
    } catch (error) {
      setError(error.message || 'Failed to add branch');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTenantDetails = async (tenant) => {
    setSelectedTenantForDetails(tenant);
    setLoadingTenantDetails(true);
    setError('');

    try {
      const details = await tenantService.getTenantById(tenant.id);
      setSelectedTenantForDetails(details);
      // Initialize renewal form with current tenant data
      setRenewalForm({
        subscriptionPlan: details.subscriptionPlan || 'basic',
        subscriptionDays: 30,
        maxEmployees: details.maxEmployees || 50,
        maxBranches: details.maxBranches || 5,
      });
    } catch (error) {
      setError(error.message || 'Failed to load tenant details');
      setSelectedTenantForDetails(null);
    } finally {
      setLoadingTenantDetails(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (!selectedTenantForDetails) {
      setError('Please select a tenant first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await tenantService.renewTenantSubscription(
        selectedTenantForDetails.id,
        renewalForm
      );

      if (result.success || result.data) {
        setSuccess(`Subscription renewed successfully for ${selectedTenantForDetails.name}!`);
        // Reload tenant details
        await handleLoadTenantDetails(selectedTenantForDetails);
        setShowRenewDialog(false);
      } else {
        setError(result.message || 'Failed to renew subscription');
      }
    } catch (error) {
      setError(error.message || 'Failed to renew subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const renderAddBranchTab = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Apartment sx={{ verticalAlign: 'middle', mr: 1 }} />
          Add Branch to Existing Tenant
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={tenants}
              getOptionLabel={(option) => `${option.name} (${option.slug})`}
              value={selectedTenant}
              onChange={(event, newValue) => setSelectedTenant(newValue)}
              loading={loadingTenants}
              noOptionsText={loadingTenants ? "Loading tenants..." : "No tenants found"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Tenant"
                  required
                  helperText={`Choose the tenant to add a branch to (${tenants.length} tenant${tenants.length !== 1 ? 's' : ''} available)`}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTenants ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {selectedTenant && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Branch Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Branch Name"
                  value={newBranchData.name}
                  onChange={(e) => handleNewBranchChange('name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Branch Code"
                  value={newBranchData.code}
                  onChange={(e) => handleNewBranchChange('code', e.target.value)}
                  helperText="e.g., BR001"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={newBranchData.address}
                  onChange={(e) => handleNewBranchChange('address', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={newBranchData.city}
                  onChange={(e) => handleNewBranchChange('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={newBranchData.state}
                  onChange={(e) => handleNewBranchChange('state', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={newBranchData.country}
                  onChange={(e) => handleNewBranchChange('country', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={newBranchData.phone}
                  onChange={(e) => handleNewBranchChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={newBranchData.email}
                  onChange={(e) => handleNewBranchChange('email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleAddBranchToTenant}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                  >
                    {loading ? 'Adding Branch...' : 'Add Branch'}
                  </Button>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    );
  };

  const renderAddEmployeeTab = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
          Add Employee to Existing Tenant
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={tenants}
              getOptionLabel={(option) => `${option.name} (${option.slug})`}
              value={employeeForm.tenant}
              onChange={(event, newValue) => handleEmployeeTenantChange(newValue)}
              loading={loadingTenants}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Tenant"
                  required
                  helperText="Choose the tenant to add an employee to"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTenants ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Branch</InputLabel>
              <Select
                value={employeeForm.branchId}
                label="Branch"
                onChange={(e) => handleEmployeeFormChange('branchId', e.target.value)}
                disabled={!employeeForm.tenant || loadingBranches}
              >
                {employeeBranches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                ))}
              </Select>
              {loadingBranches && <Typography variant="caption" color="textSecondary">Loading branches...</Typography>}
            </FormControl>
          </Grid>

          {employeeForm.tenant && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  value={employeeForm.fullName}
                  onChange={(e) => handleEmployeeFormChange('fullName', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="email"
                  label="Email"
                  value={employeeForm.email}
                  onChange={(e) => handleEmployeeFormChange('email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={employeeForm.phone}
                  onChange={(e) => handleEmployeeFormChange('phone', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={employeeForm.gender}
                    label="Gender"
                    onChange={(e) => handleEmployeeFormChange('gender', e.target.value)}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  value={employeeForm.dateOfBirth}
                  onChange={(e) => handleEmployeeFormChange('dateOfBirth', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Job Role</InputLabel>
                  <Select
                    value={employeeForm.jobRole}
                    label="Job Role"
                    onChange={(e) => handleEmployeeFormChange('jobRole', e.target.value)}
                  >
                    <MenuItem value="Employee">Employee</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Supervisor">Supervisor</MenuItem>
                    <MenuItem value="Team Lead">Team Lead</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Salary"
                  value={employeeForm.salary}
                  onChange={(e) => handleEmployeeFormChange('salary', e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={employeeForm.status}
                    label="Status"
                    onChange={(e) => handleEmployeeFormChange('status', e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Join Date"
                  value={employeeForm.joinDate}
                  onChange={(e) => handleEmployeeFormChange('joinDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
                  Assign Role
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Select one role to grant admin access. Leaving empty keeps standard employee access.
                </Typography>

                <Grid container spacing={2}>
                  {availableRoles.map((role) => {
                    const isAssigned = (employeeForm.roles || []).includes(role.name);
                    return (
                      <Grid item xs={12} md={6} key={role.id}>
                        <Paper
                          sx={{
                            p: 2.5,
                            cursor: 'pointer',
                            border: 2,
                            borderColor: isAssigned ? 'primary.main' : 'divider',
                            bgcolor: isAssigned ? 'primary.50' : 'background.paper',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                          }}
                          onClick={() => handleEmployeeRoleToggle(role.name)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Checkbox
                              checked={isAssigned}
                              onChange={() => handleEmployeeRoleToggle(role.name)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Security color={isAssigned ? 'primary' : 'action'} />
                                <Typography variant="subtitle1" fontWeight={600}>{role.name}</Typography>
                                {isAssigned && <Chip label="Assigned" size="small" color="primary" />}
                              </Box>
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                {role.description}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                Access to {role.permissions.length} page(s)
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {role.permissions.slice(0, 4).map((perm) => (
                                  <Chip key={perm} label={perm.replace(/([A-Z])/g, ' $1').trim()} size="small" variant="outlined" />
                                ))}
                                {role.permissions.length > 4 && (
                                  <Chip label={`+${role.permissions.length - 4} more`} size="small" variant="outlined" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>

                {(employeeForm.roles || []).length === 0 && !loadingRoles && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No role selected. Employee will have standard access.
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleAddEmployeeToTenant}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                  >
                    {loading ? 'Adding Employee...' : 'Add Employee'}
                  </Button>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    );
  };

  const renderTenantDetailsTab = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
          Select Tenant & View Details
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={tenants}
              getOptionLabel={(option) => `${option.name} (${option.slug})`}
              value={selectedTenantForDetails}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleLoadTenantDetails(newValue);
                } else {
                  setSelectedTenantForDetails(null);
                  setError('');
                }
              }}
              loading={loadingTenants}
              noOptionsText={loadingTenants ? "Loading tenants..." : "No tenants found"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Tenant"
                  required
                  helperText={`Choose the tenant to view details (${tenants.length} tenant${tenants.length !== 1 ? 's' : ''} available)`}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTenants ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {loadingTenantDetails && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          )}

          {selectedTenantForDetails && !loadingTenantDetails && (
            <>
              {/* Tenant Information Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Tenant Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Tenant Name
                    </Typography>
                    <Typography variant="h6">{selectedTenantForDetails.name}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Slug
                    </Typography>
                    <Typography variant="h6">{selectedTenantForDetails.slug}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Contact Email
                    </Typography>
                    <Typography variant="body2">{selectedTenantForDetails.contactEmail}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Contact Phone
                    </Typography>
                    <Typography variant="body2">{selectedTenantForDetails.contactPhone || 'N/A'}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Active Status
                    </Typography>
                    <Chip
                      label={selectedTenantForDetails.isActive ? 'Active' : 'Inactive'}
                      color={selectedTenantForDetails.isActive ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Onboarded On
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedTenantForDetails.onboardedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Subscription Information Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  <EventAvailable sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Subscription Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Subscription Plan
                    </Typography>
                    <Typography variant="h6">
                      {selectedTenantForDetails.subscriptionPlan?.charAt(0).toUpperCase() + selectedTenantForDetails.subscriptionPlan?.slice(1) || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Subscription Status
                    </Typography>
                    <Chip
                      label={selectedTenantForDetails.subscriptionStatus || 'N/A'}
                      color={
                        selectedTenantForDetails.subscriptionStatus === 'active'
                          ? 'success'
                          : selectedTenantForDetails.subscriptionStatus === 'trial'
                          ? 'info'
                          : 'warning'
                      }
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Expires On
                    </Typography>
                    <Typography variant="h6">
                      {selectedTenantForDetails.subscriptionExpiresAt
                        ? new Date(selectedTenantForDetails.subscriptionExpiresAt).toLocaleDateString()
                        : 'N/A'}
                    </Typography>
                    {selectedTenantForDetails.subscriptionExpiresAt && (
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            new Date(selectedTenantForDetails.subscriptionExpiresAt) < new Date()
                              ? 'error.main'
                              : 'success.main',
                        }}
                      >
                        {new Date(selectedTenantForDetails.subscriptionExpiresAt) < new Date()
                          ? '(Expired)'
                          : `(${Math.ceil((new Date(selectedTenantForDetails.subscriptionExpiresAt) - new Date()) / (1000 * 60 * 60 * 24))} days remaining)`}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Max Employees & Branches
                    </Typography>
                    <Typography variant="body2">
                      Employees: {selectedTenantForDetails.maxEmployees} | Branches: {selectedTenantForDetails.maxBranches}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Address Information */}
              {(selectedTenantForDetails.address ||
                selectedTenantForDetails.city ||
                selectedTenantForDetails.state ||
                selectedTenantForDetails.country) && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      <Apartment sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Address Information
                    </Typography>
                  </Grid>

                  {selectedTenantForDetails.address && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography color="textSecondary" gutterBottom>
                            Address
                          </Typography>
                          <Typography variant="body2">{selectedTenantForDetails.address}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          City
                        </Typography>
                        <Typography variant="body2">{selectedTenantForDetails.city || 'N/A'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          State
                        </Typography>
                        <Typography variant="body2">{selectedTenantForDetails.state || 'N/A'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Country
                        </Typography>
                        <Typography variant="body2">{selectedTenantForDetails.country || 'N/A'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Branches Count */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Total Branches
                        </Typography>
                        <Typography variant="h6">
                          {selectedTenantForDetails.branches?.length || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Renewal Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowRenewDialog(true)}
                    disabled={loading}
                    startIcon={<EventAvailable />}
                  >
                    Update Subscription & Limits
                  </Button>
                </Box>
              </Grid>
            </>
          )}
        </Grid>

        {/* Renewal Dialog */}
        <Dialog open={showRenewDialog} onClose={() => setShowRenewDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Subscription & Limits</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Subscription Renewal (Optional)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Subscription Plan"
                  value={renewalForm.subscriptionPlan}
                  onChange={(e) =>
                    setRenewalForm({ ...renewalForm, subscriptionPlan: e.target.value })
                  }
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Subscription Days"
                  value={renewalForm.subscriptionDays}
                  onChange={(e) =>
                    setRenewalForm({
                      ...renewalForm,
                      subscriptionDays: parseInt(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 0, max: 365 }}
                  helperText="Days to extend subscription (0 = no renewal, 1-365 = extend)"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Tenant Limits
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Employees"
                  value={renewalForm.maxEmployees}
                  onChange={(e) =>
                    setRenewalForm({
                      ...renewalForm,
                      maxEmployees: parseInt(e.target.value) || 50,
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Branches"
                  value={renewalForm.maxBranches}
                  onChange={(e) =>
                    setRenewalForm({
                      ...renewalForm,
                      maxBranches: parseInt(e.target.value) || 5,
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowRenewDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleRenewSubscription}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  return (
    <AdminLayout>
      <Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Tenant Management
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Onboard new tenants or add branches to existing ones
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Onboard New Tenant" />
              <Tab label="Add Branch to Tenant" />
              <Tab label="Add Employee to Tenant" />
              <Tab label="Tenant Details & Renewal" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          {tabValue === 0 && (
            <Box sx={{ mt: 3 }}>
              <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

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
            </Box>
          )}

          {tabValue === 1 && renderAddBranchTab()}
          {tabValue === 2 && renderAddEmployeeTab()}
          {tabValue === 3 && renderTenantDetailsTab()}
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default TenantOnboarding;
