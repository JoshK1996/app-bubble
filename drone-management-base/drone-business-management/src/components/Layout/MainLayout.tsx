import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  FlightTakeoff as MissionIcon,
  People as ClientsIcon,
  Description as ContractsIcon,
  AttachMoney as FinanceIcon,
  Devices as EquipmentIcon,
  LibraryBooks as ComplianceIcon,
  BarChart as ReportingIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  NightsStay as DarkModeIcon,
} from '@mui/icons-material';

// Define sidebar width
const DRAWER_WIDTH = 260;

// Interface for the sidebar navigation items
interface NavItem {
  text: string;
  icon: ReactNode;
  path: string;
}

// Interface for MainLayout props
interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * Main layout component with responsive sidebar and header
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children, title = 'Dashboard' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  // State for controlling drawer open state
  const [open, setOpen] = useState(!isMobile);
  
  // State for user menu
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const isUserMenuOpen = Boolean(userMenuAnchor);
  
  // State for notifications menu
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const isNotificationsOpen = Boolean(notificationsAnchor);

  // List of navigation items for sidebar
  const navItems: NavItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Mission Management', icon: <MissionIcon />, path: '/missions' },
    { text: 'Client Management', icon: <ClientsIcon />, path: '/clients' },
    { text: 'Contract System', icon: <ContractsIcon />, path: '/contracts' },
    { text: 'Financial Management', icon: <FinanceIcon />, path: '/finance' },
    { text: 'Equipment Management', icon: <EquipmentIcon />, path: '/equipment' },
    { text: 'Compliance & Docs', icon: <ComplianceIcon />, path: '/compliance' },
    { text: 'Reporting & Analytics', icon: <ReportingIcon />, path: '/reporting' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'User Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  // Toggle drawer
  const toggleDrawer = () => {
    setOpen(!open);
  };
  
  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  // Handle notifications menu
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* AppBar/Header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: DRAWER_WIDTH,
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{
              marginRight: 2,
              color: theme.palette.text.primary,
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: theme.palette.text.primary
            }}
          >
            {title}
          </Typography>
          
          {/* Notification Icon */}
          <IconButton 
            color="inherit" 
            onClick={handleNotificationsOpen}
            sx={{ color: theme.palette.text.primary }}
          >
            <NotificationsIcon />
          </IconButton>
          
          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationsAnchor}
            open={isNotificationsOpen}
            onClose={handleNotificationsClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                minWidth: 250,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2">Mission #1024 starting in 30 minutes</Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2">New client request received</Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2">Drone DJI-001 maintenance due</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2" color="primary">View all notifications</Typography>
            </MenuItem>
          </Menu>
          
          {/* Theme Toggle */}
          <IconButton 
            color="inherit"
            sx={{ ml: 1, color: theme.palette.text.primary }}
          >
            <DarkModeIcon />
          </IconButton>
          
          {/* User Avatar */}
          <IconButton
            onClick={handleUserMenuOpen}
            sx={{ p: 0, ml: 1 }}
          >
            <Avatar 
              alt="User" 
              src="/static/images/avatar/1.jpg" 
              sx={{ width: 36, height: 36, border: `2px solid ${theme.palette.primary.main}` }} 
            />
          </IconButton>
          
          {/* User Menu */}
          <Menu
            anchorEl={userMenuAnchor}
            open={isUserMenuOpen}
            onClose={handleUserMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                minWidth: 180,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">My Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar/Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => isMobile && setOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 'none',
          },
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 2,
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              letterSpacing: '0.5px'
            }}
          >
            Drone Manager
          </Typography>
        </Toolbar>
        <Divider />
        <List sx={{ p: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    minHeight: 48,
                    borderRadius: '10px',
                    px: 2.5,
                    backgroundColor: isActive ? 'rgba(58, 134, 255, 0.08)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(58, 134, 255, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      justifyContent: 'center',
                      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      style: {
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { xs: '100%', sm: `calc(100% - ${open ? DRAWER_WIDTH : 0}px)` },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          height: '100vh',
          overflow: 'auto',
          mt: '64px',
          background: 'linear-gradient(145deg, #f8f9ff 0%, #eef1f5 100%)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 