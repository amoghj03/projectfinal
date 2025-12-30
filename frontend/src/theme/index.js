import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#64B5F6', // Light blue
      light: '#90CAF9',
      dark: '#42A5F5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#81C784', // Soft green
      light: '#A5D6A7',
      dark: '#66BB6A',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC', // Very light blue-gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#263238', // Dark blue-gray
      secondary: '#546E7A',
    },
    info: {
      main: '#29B6F6', // Sky blue
      light: '#4FC3F7',
      dark: '#0288D1',
    },
    success: {
      main: '#66BB6A', // Soft green
      light: '#81C784',
      dark: '#4CAF50',
    },
    warning: {
      main: '#FFA726', // Soft orange
      light: '#FFB74D',
      dark: '#FF9800',
    },
    error: {
      main: '#EF5350', // Soft red
      light: '#F48FB1',
      dark: '#E53935',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 16,
          border: '1px solid #F0F4F8',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #42A5F5 0%, #2196F3 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FAFBFC',
            '& fieldset': {
              borderColor: '#E1E8ED',
            },
            '&:hover fieldset': {
              borderColor: '#64B5F6',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#42A5F5',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#263238',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #F0F4F8',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: '#F3F8FF',
          },
          '&.Mui-selected': {
            backgroundColor: '#E3F2FD',
            '&:hover': {
              backgroundColor: '#BBDEFB',
            },
          },
        },
      },
    },
  },
});

export default theme;