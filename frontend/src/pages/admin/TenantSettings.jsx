import React, { useEffect, useState } from 'react';
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
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { AdminLayout } from './AdminDashboard';
import adminSettingsService from '../../services/adminSettingsService';

const TenantSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  // Removed editDescription state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSettingsService.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditRow(row.id);
    setEditValue(row.value);
    setOriginalValue(row.value);
    // Description removed
  };

  const handleCancel = () => {
    setEditRow(null);
    setEditValue('');
    setOriginalValue('');
    // Description removed
  };

  const handleSave = async () => {
    try {
      await adminSettingsService.updateSetting(editRow, {
        ...settings.find(s => s.id === editRow),
        value: editValue,
      });
      setSnackbar({ open: true, message: 'Setting updated successfully', severity: 'success' });
      setEditRow(null);
      fetchSettings();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update setting', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Tenant Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and edit all tenant settings
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button size="small" onClick={fetchSettings} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {!loading && !error && (
          <Card>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Key</TableCell>
                      <TableCell>Value</TableCell>
                      {/* Description column removed */}
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {settings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No settings found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      settings.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{row.key}</TableCell>
                          <TableCell>
                            {editRow === row.id ? (
                              <TextField
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                size="small"
                                fullWidth
                              />
                            ) : (
                              row.value
                            )}
                          </TableCell>
                          <TableCell>
                            {editRow === row.id ? (
                              <React.Fragment>
                                <IconButton color="success" onClick={handleSave} disabled={editValue === originalValue}>
                                  <Save />
                                </IconButton>
                                <IconButton color="error" onClick={handleCancel}>
                                  <Cancel />
                                </IconButton>
                              </React.Fragment>
                            ) : (
                              <IconButton color="primary" onClick={() => handleEdit(row)}>
                                <Edit />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default TenantSettings;
