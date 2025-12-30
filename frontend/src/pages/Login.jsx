import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Avatar,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  AccountBalance,
  Email,
  Visibility,
  VisibilityOff,
  Lock,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Call backend API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid credentials. Please check your email and password.');
        return;
      }

      // Store authentication token
      localStorage.setItem('authToken', data.token);

      // Store employee information
      const user = data.user;
      localStorage.setItem('employeeName', user.name);
      localStorage.setItem('employeeId', user.employeeId);
      
      // Store admin permissions if available
      if (user.adminPermissions) {
        localStorage.setItem('adminPermissions', JSON.stringify(user.adminPermissions));
      }
      
      // Check role and set admin permissions
      if (user.adminRole === 'superadmin') {
        // CEO/Super Admin gets full access
        localStorage.setItem('adminName', user.name);
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem('hasAdminAccess', 'true');
        localStorage.setItem('adminRole', 'superadmin');
        localStorage.setItem('adminBranch', user.branch);
        localStorage.setItem('selectedBranch', 'All Branches');
      } else if (user.hasAdminAccess) {
        // Manager/Admin gets branch-specific access
        localStorage.setItem('adminName', user.name);
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem('hasAdminAccess', 'true');
        localStorage.setItem('adminRole', user.adminRole || 'admin');
        localStorage.setItem('adminBranch', user.branch);
        localStorage.setItem('selectedBranch', user.branch);
      } else {
        // Regular employees get employee portal access only
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem('hasAdminAccess', 'false');
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to server. Please try again later.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            padding: 4,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Bank Logo and Branding */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #64B5F6, #42A5F5)',
              }}
            >
              <AccountBalance sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom>
              SecureBank
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Employee Management Portal
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email or Employee ID"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Sign In
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                href="#"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot Password?
              </Link>
            </Box>
          </Box>

          {/* Demo Credentials */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: '#F8F9FA',
              borderRadius: 2,
              border: '1px solid #E9ECEF',
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              <strong>Demo Credentials:</strong><br />
              <strong>Employee:</strong> john@acme.com / password123<br />
              <strong>HR/Admin:</strong> hr@acme.com / password123<br />
              <strong>Super Admin:</strong> admin@acme.com / password123
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;