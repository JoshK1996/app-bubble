import { createTheme } from '@mui/material/styles';

// Glassmorphism effects
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
};

// Color palette
const colors = {
  primary: {
    main: '#3a86ff',
    light: '#5e9cff',
    dark: '#1a64e0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff6b6b',
    light: '#ff8e8e',
    dark: '#e64545',
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50',
    light: '#80e27e',
    dark: '#087f23',
    contrastText: '#ffffff',
  },
  error: {
    main: '#f44336',
    light: '#ff7961',
    dark: '#ba000d',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ff9800',
    light: '#ffc947',
    dark: '#c66900',
    contrastText: '#000000',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#0069c0',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f7fa',
    paper: '#ffffff',
  },
  text: {
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    disabled: '#bdc3c7',
  },
};

// Create theme
const glassmorphismTheme = createTheme({
  palette: {
    mode: 'light',
    ...colors,
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          ...glassEffect,
          padding: '16px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          ...glassEffect,
          background: 'rgba(255, 255, 255, 0.7)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          transition: 'all 0.3s ease',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1.5px',
              },
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          ...glassEffect,
          background: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          ...glassEffect,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          ...glassEffect,
          background: 'rgba(255, 255, 255, 0.9)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          ...glassEffect,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          color: '#fff',
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default glassmorphismTheme; 