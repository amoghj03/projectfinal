import React, { Component } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Refresh, Home, BugReport } from '@mui/icons-material';

/**
 * Error Boundary Component
 * Catches React errors that slip through and shows a friendly fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'background.default',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <BugReport sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {error?.message || 'An unexpected error occurred. Our team has been notified.'}
            </Alert>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're sorry, but something unexpected happened. This could be due to:
            </Typography>

            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                • A temporary connection issue with the server
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • The server is undergoing maintenance
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • An unexpected error in the application
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
              >
                Go to Dashboard
              </Button>
            </Box>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: 12 }}>
                  {this.state.error?.toString()}
                </Typography>
                {this.state.errorInfo?.componentStack && (
                  <Typography variant="body2" component="pre" sx={{ overflow: 'auto', fontSize: 10, mt: 1 }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

