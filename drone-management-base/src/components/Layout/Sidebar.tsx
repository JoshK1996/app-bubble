import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Tooltip,
  Typography,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FlightTakeoff as MissionIcon,
  People as ClientsIcon,
  Assignment as ContractsIcon,
  AttachMoney as FinanceIcon,
  Devices as EquipmentIcon,
  Description as DocumentIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';

// Sidebar props interface
interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  currentPath: string;
  navigate: (path: string) => void;
  navItems: {
    path: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  drawerWidth,
  currentPath,
  navigate,
  navItems,
}) => {
  const theme = useTheme();

  // Group navigation items by category
  const mainNavItems = navItems.filter(
    item => !['/profile', '/settings'].includes(item.path)
  );
  
  const accountNavItems = navItems.filter(
    item => ['/profile', '/settings'].includes(item.path)
  );

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          boxShadow: theme.shadows[3],
          backgroundImage: 'none',
          overflowX: 'hidden',
          transform: open ? 'none' : 'translateX(-100%)',
          transition: theme.transitions.create('transform', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
    >
      {/* App Logo/Title */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          height: '64px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              backgroundColor: theme.palette.primary.main,
              width: 40,
              height: 40,
              boxShadow: 3,
              animation: '5s float infinite ease-in-out',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-5px)' },
              },
            }}
          >
            <MissionIcon />
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Drone Manager
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Main Navigation */}
      <List sx={{ pt: 1 }}>
        {mainNavItems.map((item) => (
          <Tooltip key={item.path} title={item.label} placement="right" arrow>
            <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                selected={currentPath === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  mx: 1, 
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.mode === 'light' 
                      ? 'rgba(25, 118, 210, 0.12)'
                      : 'rgba(144, 202, 249, 0.16)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '0 2px 2px 0',
                    }
                  },
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'light'
                      ? 'rgba(0, 0, 0, 0.04)'
                      : 'rgba(255, 255, 255, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                }}
                className="float-element"
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: 'center',
                    color: currentPath === item.path 
                      ? theme.palette.primary.main 
                      : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      <Divider sx={{ mt: 'auto' }} />

      {/* Account Navigation */}
      <List>
        {accountNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={currentPath === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 48,
                px: 2.5,
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: theme.palette.mode === 'light' 
                    ? 'rgba(25, 118, 210, 0.12)'
                    : 'rgba(144, 202, 249, 0.16)',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 