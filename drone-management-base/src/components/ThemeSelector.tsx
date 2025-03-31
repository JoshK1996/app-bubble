import React from 'react';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  IconButton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { useThemeMode, ThemeColorOption } from '../theme/ThemeProvider';

// Theme color options with display names and sample colors
const themeColorOptions: {
  value: ThemeColorOption;
  name: string;
  colors: { primary: string; secondary: string };
}[] = [
  { 
    value: 'blue', 
    name: 'Blue', 
    colors: { primary: '#2196f3', secondary: '#f50057' } 
  },
  { 
    value: 'purple', 
    name: 'Purple', 
    colors: { primary: '#673ab7', secondary: '#ff4081' } 
  },
  { 
    value: 'green', 
    name: 'Green', 
    colors: { primary: '#4caf50', secondary: '#ff9800' } 
  },
  { 
    value: 'orange', 
    name: 'Orange', 
    colors: { primary: '#ff5722', secondary: '#2196f3' } 
  },
  { 
    value: 'teal', 
    name: 'Teal', 
    colors: { primary: '#009688', secondary: '#9c27b0' } 
  },
];

interface ThemeSelectorProps {
  variant?: 'icon' | 'button';
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ variant = 'icon' }) => {
  const theme = useTheme();
  const { colorOption, changeColorOption } = useThemeMode();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (option: ThemeColorOption) => {
    changeColorOption(option);
    handleClose();
  };

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip title="Change theme colors">
          <IconButton
            onClick={handleClick}
            color="inherit"
            sx={{ 
              transition: 'transform 0.2s',
              '&:hover': { 
                transform: 'rotate(30deg)' 
              }
            }}
          >
            <PaletteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          startIcon={<PaletteIcon />}
          onClick={handleClick}
        >
          Theme
        </Button>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
          Choose Theme
        </Typography>
        
        {themeColorOptions.map((option) => (
          <MenuItem 
            key={option.value} 
            onClick={() => handleThemeChange(option.value)}
            selected={colorOption === option.value}
            sx={{ 
              px: 2, 
              py: 1.5,
              transition: 'transform 0.2s',
              '&:hover': { 
                transform: 'translateX(5px)' 
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ display: 'flex', mr: 2 }}>
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    bgcolor: option.colors.primary,
                    borderRadius: '50% 0 0 50%',
                  }} 
                />
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    bgcolor: option.colors.secondary,
                    borderRadius: '0 50% 50% 0',
                  }} 
                />
              </Box>
              <Typography>
                {option.name}
              </Typography>
              {colorOption === option.value && (
                <Box sx={{ ml: 'auto', color: theme.palette.primary.main }}>
                  ✓
                </Box>
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeSelector; 