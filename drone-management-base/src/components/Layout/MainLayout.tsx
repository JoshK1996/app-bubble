import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Container,
  Tooltip,
  Badge,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  FlightTakeoff as MissionIcon,
  People as ClientsIcon,
  Assignment as ContractsIcon,
  AttachMoney as FinanceIcon,
  Devices as EquipmentIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountCircle,
  Help as HelpIcon,
  Description as DocumentIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import { useThemeMode } from '../../theme/ThemeProvider';
import ThemeSelector from '../ThemeSelector';

// Constants
const DRAWER_WIDTH = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  const [accountMenu, setAccountMenu] = useState<null | HTMLElement>(null);
  const [notificationMenu, setNotificationMenu] = useState<null | HTMLElement>(null);
  
  // Get current page title
  const pageTitle = getPageTitle(location.pathname);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenu(event.currentTarget);
  };
  
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenu(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAccountMenu(null);
    setNotificationMenu(null);
  };
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/missions', label: 'Missions', icon: <MissionIcon /> },
    { path: '/mission-planning', label: 'Mission Planning', icon: <MissionIcon /> },
    { path: '/clients', label: 'Clients', icon: <ClientsIcon /> },
    { path: '/contracts', label: 'Contracts', icon: <ContractsIcon /> },
    { path: '/finance', label: 'Finance', icon: <FinanceIcon /> },
    { path: '/equipment', label: 'Equipment', icon: <EquipmentIcon /> },
    { path: '/compliance', label: 'Compliance', icon: <DocumentIcon /> },
    { path: '/reports', label: 'Reports', icon: <ReportsIcon /> },
    { path: '/profile', label: 'Profile', icon: <ProfileIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];
  
  // Add animated background elements
  const renderBackgroundWaves = () => (
    <>
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { md: `${drawerOpen ? DRAWER_WIDTH : 0}px` },
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {pageTitle}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Dark Mode Toggle */}
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton 
                color="inherit" 
                onClick={toggleColorMode}
                sx={{ 
                  mr: 1,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': { transform: 'rotate(30deg)' }
                }}
              >
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            
            {/* Theme Color Selector */}
            <ThemeSelector variant="icon" />
            
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                onClick={handleNotificationMenuOpen}
                sx={{ 
                  mr: 1,
                  animation: '2s pulse infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' },
                  }
                }}
              >
                <Badge badgeContent={3} color="secondary">
                  <NotificationIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* User Profile */}
            <Tooltip title="Account settings">
              <IconButton
                color="inherit"
                onClick={handleAccountMenuOpen}
                sx={{ 
                  ml: 1,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>D</Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Sidebar
        open={drawerOpen}
        onClose={handleDrawerToggle}
        navItems={navItems}
        drawerWidth={DRAWER_WIDTH}
        currentPath={location.pathname}
        navigate={navigate}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { md: `${drawerOpen ? DRAWER_WIDTH : 0}px` },
          mt: '64px',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {renderBackgroundWaves()}
        {children}
      </Box>
      
      {/* Account Menu */}
      <Menu
        anchorEl={accountMenu}
        open={Boolean(accountMenu)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
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
        <MenuItem onClick={() => navigate('/profile')}>
          <Avatar /> Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationMenu}
        open={Boolean(notificationMenu)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 320,
            maxHeight: 400,
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
        <MenuItem>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2">Equipment Maintenance Due</Typography>
            <Typography variant="body2" color="text.secondary">Drone DJI-001 is due for maintenance today</Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2">Weather Alert</Typography>
            <Typography variant="body2" color="text.secondary">Strong winds forecasted for upcoming mission on 06/15</Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2">New Client Request</Typography>
            <Typography variant="body2" color="text.secondary">Acme Corporation has requested a proposal</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Helper function to get the current page title
function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/missions': 'Mission System',
    '/mission-planning': 'Mission Planning',
    '/clients': 'Client Management',
    '/contracts': 'Contract System',
    '/finance': 'Financial Management',
    '/equipment': 'Equipment Management',
    '/compliance': 'Compliance & Documentation',
    '/reports': 'Reporting & Analytics',
    '/profile': 'User Profile',
    '/settings': 'Settings',
  };
  
  return titles[pathname] || 'Drone Business Management';
}

export default MainLayout; 