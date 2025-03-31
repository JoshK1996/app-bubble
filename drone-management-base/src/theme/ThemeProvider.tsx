import React, { createContext, useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Define theme color palettes
export type ThemeColorOption = 'blue' | 'purple' | 'green' | 'orange' | 'teal';

interface ThemeOptions {
  mode: PaletteMode;
  colorOption: ThemeColorOption;
}

// Color palette definitions
const colorOptions: Record<ThemeColorOption, {
  light: { primary: any, secondary: any },
  dark: { primary: any, secondary: any },
}> = {
  blue: {
    light: {
      primary: {
        main: '#2196f3',
        dark: '#1976d2',
        light: '#64b5f6',
      },
      secondary: {
        main: '#f50057',
        dark: '#c51162',
        light: '#ff4081',
      },
    },
    dark: {
      primary: {
        main: '#90caf9',
        dark: '#64b5f6',
        light: '#bbdefb',
      },
      secondary: {
        main: '#f48fb1',
        dark: '#f06292',
        light: '#f8bbd0',
      },
    }
  },
  purple: {
    light: {
      primary: {
        main: '#673ab7',
        dark: '#512da8',
        light: '#9575cd',
      },
      secondary: {
        main: '#ff4081',
        dark: '#f50057',
        light: '#ff80ab',
      },
    },
    dark: {
      primary: {
        main: '#9c7cf4',
        dark: '#7c5fe6',
        light: '#c9b3ff',
      },
      secondary: {
        main: '#ff80ab',
        dark: '#ff4081',
        light: '#ffb2dd',
      },
    }
  },
  green: {
    light: {
      primary: {
        main: '#4caf50',
        dark: '#388e3c',
        light: '#81c784',
      },
      secondary: {
        main: '#ff9800',
        dark: '#f57c00',
        light: '#ffb74d',
      },
    },
    dark: {
      primary: {
        main: '#81c784',
        dark: '#4caf50',
        light: '#c8e6c9',
      },
      secondary: {
        main: '#ffb74d',
        dark: '#ff9800',
        light: '#ffe0b2',
      },
    }
  },
  orange: {
    light: {
      primary: {
        main: '#ff5722',
        dark: '#e64a19',
        light: '#ff8a65',
      },
      secondary: {
        main: '#2196f3',
        dark: '#1976d2',
        light: '#64b5f6',
      },
    },
    dark: {
      primary: {
        main: '#ff8a65',
        dark: '#ff5722',
        light: '#ffccbc',
      },
      secondary: {
        main: '#64b5f6',
        dark: '#2196f3',
        light: '#bbdefb',
      },
    }
  },
  teal: {
    light: {
      primary: {
        main: '#009688',
        dark: '#00796b',
        light: '#4db6ac',
      },
      secondary: {
        main: '#9c27b0',
        dark: '#7b1fa2',
        light: '#ba68c8',
      },
    },
    dark: {
      primary: {
        main: '#4db6ac',
        dark: '#009688',
        light: '#b2dfdb',
      },
      secondary: {
        main: '#ba68c8',
        dark: '#9c27b0',
        light: '#e1bee7',
      },
    }
  }
};

// Get theme design tokens
const getDesignTokens = (options: ThemeOptions) => {
  const { mode, colorOption } = options;
  const colors = colorOptions[colorOption][mode === 'light' ? 'light' : 'dark'];
  
  return {
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode
            primary: colors.primary,
            secondary: colors.secondary,
            background: {
              default: '#f8f9fa',
              paper: 'rgba(255, 255, 255, 0.8)',
            },
            text: {
              primary: 'rgba(0, 0, 0, 0.87)',
              secondary: 'rgba(0, 0, 0, 0.6)',
            },
          }
        : {
            // Dark mode
            primary: colors.primary,
            secondary: colors.secondary,
            background: {
              default: '#121212',
              paper: 'rgba(18, 18, 18, 0.75)',
            },
            text: {
              primary: '#ffffff',
              secondary: 'rgba(255, 255, 255, 0.7)',
            },
          }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
      },
      h2: {
        fontWeight: 500,
      },
      h3: {
        fontWeight: 500,
      },
      h4: {
        fontWeight: 400,
      },
      h5: {
        fontWeight: 400,
      },
      h6: {
        fontWeight: 400,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            boxShadow: mode === 'light' 
              ? '0 4px 20px 0 rgba(0, 0, 0, 0.05)' 
              : '0 4px 20px 0 rgba(0, 0, 0, 0.25)',
            background: mode === 'light'
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(18, 18, 18, 0.75)',
            borderRadius: 16,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'light'
                ? '0 12px 20px 0 rgba(0, 0, 0, 0.1)'
                : '0 12px 20px 0 rgba(0, 0, 0, 0.5)',
            }
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            background: mode === 'light'
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(18, 18, 18, 0.75)',
            borderRadius: 16,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            background: mode === 'light'
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(18, 18, 18, 0.75)',
            borderRadius: 16,
            overflow: 'hidden',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            background: mode === 'light'
              ? 'rgba(240, 240, 240, 0.9)'
              : 'rgba(30, 30, 30, 0.9)',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: mode === 'light'
                ? 'rgba(0, 0, 0, 0.04)'
                : 'rgba(255, 255, 255, 0.04)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'light'
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(18, 18, 18, 0.8)',
            color: mode === 'light' ? '#000' : '#fff',
            boxShadow: mode === 'light'
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          // Optional default props
        },
        // Remove the problematic styleOverrides and use custom CSS classes instead
        // We'll handle button styling through the className prop when using buttons
      },
    },
  };
};

// Create theme context
interface ThemeContextType {
  mode: PaletteMode;
  colorOption: ThemeColorOption;
  toggleColorMode: () => void;
  changeColorOption: (option: ThemeColorOption) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colorOption: 'blue',
  toggleColorMode: () => {},
  changeColorOption: () => {},
});

// Custom hook to use the theme context
export const useThemeMode = () => useContext(ThemeContext);

// ThemeProvider component
export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Load theme preferences from localStorage
  const savedMode = localStorage.getItem('themeMode') as PaletteMode || 'light';
  const savedColorOption = localStorage.getItem('themeColorOption') as ThemeColorOption || 'blue';
  
  const [mode, setMode] = useState<PaletteMode>(savedMode);
  const [colorOption, setColorOption] = useState<ThemeColorOption>(savedColorOption);

  // Toggle theme function
  const toggleColorMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  }, [mode]);

  // Change color option function
  const changeColorOption = useCallback((option: ThemeColorOption) => {
    setColorOption(option);
    localStorage.setItem('themeColorOption', option);
  }, []);

  // Create theme context value
  const themeContextValue = useMemo(
    () => ({
      mode,
      colorOption,
      toggleColorMode,
      changeColorOption,
    }),
    [mode, colorOption, toggleColorMode, changeColorOption]
  );

  // Create MUI theme
  const theme = useMemo(() => 
    createTheme(getDesignTokens({ mode, colorOption })), 
    [mode, colorOption]
  );

  // Apply theme based on system preference if no saved preference
  useEffect(() => {
    if (!localStorage.getItem('themeMode')) {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, []);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 