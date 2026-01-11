import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Snackbar,
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
import roleService from '../../services/roleService';

const RoleManagement = () => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getAllRoles(),
        roleService.getAllPermissions(),
      ]);
      setRoles(rolesData);
      setAllPermissions(permissionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load roles and permissions');
      setSnackbar({
        open: true,
        message: 'Failed to load roles and permissions',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [],
  });

  const [errors, setErrors] = useState({});

  const pagePermissions = allPermissions.map((perm) => ({
    id: perm.id,
    key: perm.name,
    label: perm.displayName,
    description: perm.description,
    category: perm.category,
    icon: <Security />,
  }));

  const handleOpenDialog = (role = null, isViewOnly = false) => {
    setViewMode(isViewOnly);
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissionIds: role.permissions || [],
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissionIds: [],
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
    setViewMode(false);
    setFormData({
      name: '',
      description: '',
      permissionIds: [],
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

  const handlePermissionChange = (permissionId, checked) => {
    setFormData((prev) => {
      const newPermissionIds = checked
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter((id) => id !== permissionId);
      return {
        ...prev,
        permissionIds: newPermissionIds,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Role name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    // Check if at least one permission is selected
    if (formData.permissionIds.length === 0) {
      newErrors.permissions = 'Please select at least one permission';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingRole) {
        // Update existing role
        const updateData = {
          name: formData.name,
          description: formData.description,
          permissionIds: formData.permissionIds,
        };
        await roleService.updateRole(editingRole.id, updateData);
        setSnackbar({
          open: true,
          message: 'Role updated successfully',
          severity: 'success',
        });
      }
      // Refresh the roles list
      await fetchRolesAndPermissions();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving role:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save role',
        severity: 'error',
      });
    }
  };

  const handleDelete = (roleId) => {
    // Delete functionality removed as per requirements
  };

  const countPermissions = (permissions) => {
    return Array.isArray(permissions) ? permissions.length : 0;
  };

  if (loading) {
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
              disabled
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
                            <IconButton size="small" color="info" onClick={() => handleOpenDialog(role, true)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {isSuperAdmin && (
                            <Tooltip title="Edit Role">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(role, false)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          )}
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
            {viewMode ? 'View Role Permissions' : editingRole ? 'Edit Role' : 'Create New Role'}
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
                    disabled
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
                    disabled
                    placeholder="Describe the purpose and responsibilities of this role"
                  />
                </Grid>
              </Grid>

              {/* Permissions */}
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Page Access Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {viewMode ? 'Selected permissions for this role' : 'Select which pages users with this role can access'}
              </Typography>

              {errors.permissions && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.permissions}
                </Alert>
              )}

              {/* Basic Permissions */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                  Basic Permissions
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <FormGroup>
                    {pagePermissions.slice(0, 6).map((page, index) => (
                      <Box key={page.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.permissionIds.includes(page.id)}
                              onChange={(e) => handlePermissionChange(page.id, e.target.checked)}
                              disabled={viewMode}
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
                        {index < 5 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </FormGroup>
                </Paper>
              </Box>

              {/* Admin Permissions */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                  Admin Permissions
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <FormGroup>
                    {pagePermissions.slice(6).map((page, index) => (
                      <Box key={page.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.permissionIds.includes(page.id)}
                              onChange={(e) => handlePermissionChange(page.id, e.target.checked)}
                              disabled={viewMode}
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
                        {index < pagePermissions.slice(6).length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </FormGroup>
                </Paper>
              </Box>

              {!viewMode && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const allChecked = formData.permissionIds.length === pagePermissions.length;
                      const newPermissionIds = allChecked
                        ? []
                        : pagePermissions.map((p) => p.id);
                      setFormData((prev) => ({ ...prev, permissionIds: newPermissionIds }));
                    }}
                  >
                    {formData.permissionIds.length === pagePermissions.length ? 'Uncheck All' : 'Check All'}
                  </Button>
                </Box>
              )}

            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
              {viewMode ? 'Close' : 'Cancel'}
            </Button>
            {!viewMode && (
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
    </AdminLayout>
  );
};

export default RoleManagement;
