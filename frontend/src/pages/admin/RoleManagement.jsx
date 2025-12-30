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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Security,
  AdminPanelSettings,
  ManageAccounts,
  Save,
  Cancel,
  Visibility,
  Business,
} from '@mui/icons-material';
import { AdminLayout } from './AdminDashboard';
import { useBranch } from '../../contexts/BranchContext';

const RoleManagement = () => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access across all branches',
      permissions: {
        dashboard: true,
        employeeManagement: true,
        attendance: true,
        leaveManagement: true,
        skillReports: true,
        complaints: true,
        techIssues: true,
        reports: true,
        payslip: true,
      },
      userCount: 2,
      isSystem: true, // Cannot be deleted
    },
    {
      id: 2,
      name: 'Branch Admin',
      description: 'Full access within assigned branch',
      permissions: {
        dashboard: true,
        employeeManagement: true,
        attendance: true,
        leaveManagement: true,
        skillReports: true,
        complaints: true,
        techIssues: true,
        reports: true,
        payslip: true,
      },
      userCount: 5,
      isSystem: true,
    },
    {
      id: 3,
      name: 'HR Manager',
      description: 'Human resources management access',
      permissions: {
        dashboard: true,
        employeeManagement: true,
        attendance: true,
        leaveManagement: true,
        skillReports: false,
        complaints: true,
        techIssues: false,
        reports: true,
        payslip: true,
      },
      userCount: 3,
      isSystem: false,
    },
    {
      id: 4,
      name: 'Operations Manager',
      description: 'Daily operations and attendance management',
      permissions: {
        dashboard: true,
        employeeManagement: false,
        attendance: true,
        leaveManagement: true,
        skillReports: true,
        complaints: true,
        techIssues: true,
        reports: true,
        payslip: false,
      },
      userCount: 7,
      isSystem: false,
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {
      dashboard: false,
      employeeManagement: false,
      attendance: false,
      leaveManagement: false,
      skillReports: false,
      complaints: false,
      techIssues: false,
      reports: false,
      payslip: false,
    },
  });

  const [errors, setErrors] = useState({});

  const pagePermissions = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      description: 'Main admin dashboard with overview stats',
      icon: <AdminPanelSettings />,
    },
    {
      key: 'employeeManagement',
      label: 'Employee Management',
      description: 'Add, edit, view, and manage employees',
      icon: <ManageAccounts />,
    },
    {
      key: 'attendance',
      label: 'Attendance Management',
      description: 'View and manage employee attendance records',
      icon: <Security />,
    },
    {
      key: 'leaveManagement',
      label: 'Leave Management',
      description: 'Approve and manage employee leave requests',
      icon: <Security />,
    },
    {
      key: 'skillReports',
      label: 'Skill Test Reports',
      description: 'View employee skill test results and analytics',
      icon: <Security />,
    },
    {
      key: 'complaints',
      label: 'Complaints Overview',
      description: 'View and manage employee complaints',
      icon: <Security />,
    },
    {
      key: 'techIssues',
      label: 'Tech Issues Management',
      description: 'Manage technical issues and support tickets',
      icon: <Security />,
    },
    {
      key: 'reports',
      label: 'Reports Download',
      description: 'Download and export various system reports',
      icon: <Security />,
    },
    {
      key: 'payslip',
      label: 'Payslip Generation',
      description: 'Generate and manage employee payslips',
      icon: <Security />,
    },
  ];

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: { ...role.permissions },
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: {
          dashboard: false,
          employeeManagement: false,
          attendance: false,
          leaveManagement: false,
          skillReports: false,
          complaints: false,
          techIssues: false,
          reports: false,
          payslip: false,
        },
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: {
        dashboard: false,
        employeeManagement: false,
        attendance: false,
        leaveManagement: false,
        skillReports: false,
        complaints: false,
        techIssues: false,
        reports: false,
        payslip: false,
      },
    });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handlePermissionChange = (permission, checked) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Role name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    // Check if at least one permission is selected
    const hasPermission = Object.values(formData.permissions).some((v) => v);
    if (!hasPermission) {
      newErrors.permissions = 'Please select at least one permission';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      if (editingRole) {
        // Update existing role
        setRoles((prev) =>
          prev.map((role) =>
            role.id === editingRole.id
              ? {
                  ...role,
                  name: formData.name,
                  description: formData.description,
                  permissions: formData.permissions,
                }
              : role
          )
        );
      } else {
        // Create new role
        const newRole = {
          id: Math.max(...roles.map((r) => r.id)) + 1,
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          userCount: 0,
          isSystem: false,
        };
        setRoles((prev) => [...prev, newRole]);
      }
      handleCloseDialog();
    }
  };

  const handleDelete = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? Users assigned to this role will lose their permissions.')) {
      setRoles((prev) => prev.filter((role) => role.id !== roleId));
    }
  };

  const countPermissions = (permissions) => {
    return Object.values(permissions).filter((v) => v).length;
  };

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Business fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              {isSuperAdmin ? 'All Branches' : getEffectiveBranch()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Role Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage roles with specific page access permissions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Create New Role
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Roles
                    </Typography>
                    <Typography variant="h4">{roles.length}</Typography>
                  </Box>
                  <Security sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
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
                      System Roles
                    </Typography>
                    <Typography variant="h4">{roles.filter((r) => r.isSystem).length}</Typography>
                  </Box>
                  <AdminPanelSettings sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
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
                      Custom Roles
                    </Typography>
                    <Typography variant="h4">{roles.filter((r) => !r.isSystem).length}</Typography>
                  </Box>
                  <ManageAccounts sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
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
                      Total Users
                    </Typography>
                    <Typography variant="h4">{roles.reduce((sum, r) => sum + r.userCount, 0)}</Typography>
                  </Box>
                  <ManageAccounts sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Roles Table */}
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Permissions</TableCell>
                    <TableCell align="center">Users</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Security color="primary" />
                          <Typography variant="body1" fontWeight="medium">
                            {role.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`${countPermissions(role.permissions)} of ${pagePermissions.length} pages accessible`}>
                          <Chip
                            label={`${countPermissions(role.permissions)}/${pagePermissions.length}`}
                            size="small"
                            color={countPermissions(role.permissions) === pagePermissions.length ? 'success' : 'primary'}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={role.userCount} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        {role.isSystem ? (
                          <Chip label="System" size="small" color="error" />
                        ) : (
                          <Chip label="Custom" size="small" color="success" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Permissions">
                            <IconButton size="small" color="info" onClick={() => handleOpenDialog(role)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Role">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(role)}
                              disabled={role.isSystem}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={role.isSystem ? "System roles cannot be deleted" : "Delete Role"}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(role.id)}
                                disabled={role.isSystem}
                              >
                                <Delete />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Create/Edit Role Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingRole ? (editingRole.isSystem ? 'View Role' : 'Edit Role') : 'Create New Role'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {/* Basic Information */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Basic Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Role Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={editingRole?.isSystem}
                    placeholder="e.g., HR Manager, Operations Lead"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description}
                    disabled={editingRole?.isSystem}
                    placeholder="Describe the purpose and responsibilities of this role"
                  />
                </Grid>
              </Grid>

              {/* Permissions */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Page Access Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select which admin pages users with this role can access
              </Typography>

              {errors.permissions && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.permissions}
                </Alert>
              )}

              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormGroup>
                  {pagePermissions.map((page, index) => (
                    <Box key={page.key}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissions[page.key]}
                            onChange={(e) => handlePermissionChange(page.key, e.target.checked)}
                            disabled={editingRole?.isSystem}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {page.icon}
                            <Box>
                              <Typography variant="body1">{page.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {page.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      {index < pagePermissions.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </FormGroup>
              </Paper>

              {!editingRole?.isSystem && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const allChecked = Object.values(formData.permissions).every((v) => v);
                      const newPermissions = {};
                      Object.keys(formData.permissions).forEach((key) => {
                        newPermissions[key] = !allChecked;
                      });
                      setFormData((prev) => ({ ...prev, permissions: newPermissions }));
                    }}
                  >
                    {Object.values(formData.permissions).every((v) => v) ? 'Uncheck All' : 'Check All'}
                  </Button>
                </Box>
              )}

              {editingRole?.isSystem && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  System roles cannot be modified. They are managed by the application.
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
              {editingRole?.isSystem ? 'Close' : 'Cancel'}
            </Button>
            {!editingRole?.isSystem && (
              <Button
                onClick={handleSave}
                variant="contained"
                startIcon={<Save />}
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default RoleManagement;
