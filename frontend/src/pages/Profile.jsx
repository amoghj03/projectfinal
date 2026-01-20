
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Alert,
  Snackbar,
  Divider,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Layout } from './Dashboard';
import profileService from '../services/profileService';


const Profile = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const res = await profileService.getProfile();
        if (res.success) {
          setProfile(res.data);
        } else {
          setProfileError(res.message || 'Failed to load profile');
        }
      } catch (err) {
        let msg = 'Failed to load profile.';
        if (err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message;
        }
        setProfileError(msg);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleOpenPasswordForm = () => setShowPasswordForm(true);
  const handleClosePasswordForm = () => {
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });


  // Password strength conditions
  const passwordConditions = [
    {
      label: 'At least 8 characters',
      test: (pw) => pw.length >= 8,
    },
    {
      label: 'At least one uppercase letter',
      test: (pw) => /[A-Z]/.test(pw),
    },
    {
      label: 'At least one lowercase letter',
      test: (pw) => /[a-z]/.test(pw),
    },
    {
      label: 'At least one number',
      test: (pw) => /\d/.test(pw),
    },
    {
      label: 'At least one special character',
      test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
    },
  ];
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match.', severity: 'error' });
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      setSnackbar({
        open: true,
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
        severity: 'error',
      });
      return;
    }
    setLoading(true);
    try {
      const res = await profileService.resetPassword(currentPassword, newPassword);
      if (res.success) {
        setSnackbar({ open: true, message: res.message || 'Password reset successful!', severity: 'success' });
        handleClosePasswordForm();
      } else {
        let msg = res.message || 'Failed to reset password.';
        if (msg === 'Current password is incorrect.') {
          msg = 'Current password doesn\'t match.';
        }
        setSnackbar({ open: true, message: msg, severity: 'error' });
      }
    } catch (err) {
      let msg = 'Failed to reset password.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
        if (msg === 'Current password is incorrect.') {
          msg = 'Current password doesn\'t match.';
        }
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box maxWidth={600} mx="auto" mt={5}>
        {profileLoading ? (
          <Typography>Loading profile...</Typography>
        ) : profileError ? (
          <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>
        ) : profile ? (
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
                  {profile.fullName?.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h5">{profile.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{profile.employeeId}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{profile.email}</Typography>
                </Grid>
                {profile.phone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{profile.phone}</Typography>
                  </Grid>
                )}
                {profile.dateOfBirth && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1">{profile.dateOfBirth}</Typography>
                  </Grid>
                )}
                {profile.status && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Typography variant="body1">{profile.status}</Typography>
                  </Grid>
                )}
                {profile.joinDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Join Date</Typography>
                    <Typography variant="body1">{profile.joinDate}</Typography>
                  </Grid>
                )}
                {profile.address && (
                  <Grid item xs={12} sm={12}>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">{profile.address}</Typography>
                  </Grid>
                )}
                {profile.branchName && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Branch</Typography>
                    <Typography variant="body1">{profile.branchName}</Typography>
                  </Grid>
                )}
                {profile.jobRole && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Job Role</Typography>
                    <Typography variant="body1">{profile.jobRole}</Typography>
                  </Grid>
                )}
              </Grid>
              <Box mt={3}>
                <Button variant="contained" onClick={handleOpenPasswordForm}>
                  Reset Password
                </Button>
              </Box>
              {showPasswordForm && (
                <Box component="form" mt={3} onSubmit={handlePasswordReset}>
                  <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                    required
                    margin="normal"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                  <TextField
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    margin="normal"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowNewPassword((show) => !show)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* Password strength conditions */}
                  <Box sx={{ mb: 2, ml: 1 }}>
                    {passwordConditions.map((cond, idx) => {
                      const passed = cond.test(newPassword);
                      return (
                        <Typography
                          key={idx}
                          variant="caption"
                          sx={{
                            color: passed ? 'success.main' : 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontWeight: passed ? 700 : 400, marginRight: 6 }}>
                            {passed ? '✓' : '○'}
                          </span>
                          {cond.label}
                        </Typography>
                      );
                    })}
                  </Box>
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    required
                    margin="normal"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onPaste={e => e.preventDefault()}
                  />
                  {confirmPassword.length > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          confirmPassword === newPassword
                            ? 'success.main'
                            : 'error.main',
                        ml: 1,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        mt: 0.5,
                      }}
                    >
                      <span style={{ fontWeight: 700, marginRight: 6 }}>
                        {confirmPassword === newPassword ? '✓' : '✗'}
                      </span>
                      {confirmPassword === newPassword
                        ? 'Passwords match'
                        : 'Passwords do not match'}
                    </Typography>
                  )}
                  <Box mt={2} display="flex" gap={2}>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                      {loading ? 'Resetting...' : 'Submit'}
                    </Button>
                    <Button variant="outlined" onClick={handleClosePasswordForm} disabled={loading}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : null}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default Profile;
