import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Badge,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onSidebarOpen: () => void;
  title: string;
}

/**
 * Top navigation bar component with app title, menu toggle, notifications, and user menu
 */
const TopBar: React.FC<TopBarProps> = ({ onSidebarOpen, title }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for menu anchors
  const [accountMenu, setAccountMenu] = useState<null | HTMLElement>(null);
  const [notificationMenu, setNotificationMenu] = useState<null | HTMLElement>(null);
  
  // Handle opening the account menu
  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenu(event.currentTarget);
  };
  
  // Handle opening the notifications menu
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenu(event.currentTarget);
  };
  
  // Handle closing any menu
  const handleMenuClose = () => {
    setAccountMenu(null);
    setNotificationMenu(null);
  };
  
  // Handle navigation from menu items
  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };
  
  return (
    <AppBar 
      position="fixed"
      color="default"
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onSidebarOpen}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        {/* Help Button */}
        <Tooltip title="Help & Resources">
          <IconButton color="inherit" sx={{ mx: 0.5 }}>
            <HelpIcon />
          </IconButton>
        </Tooltip>
        
        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton 
            color="inherit" 
            onClick={handleNotificationMenuOpen}
            sx={{ mx: 0.5 }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        
        {/* User Account Menu */}
        <Tooltip title="Account Settings">
          <IconButton
            onClick={handleAccountMenuOpen}
            color="inherit"
            sx={{ ml: 0.5 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              DB
            </Avatar>
          </IconButton>
        </Tooltip>
        
        {/* Account Menu Dropdown */}
        <Menu
          anchorEl={accountMenu}
          open={Boolean(accountMenu)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleNavigation('/profile')}>
            <AccountCircle sx={{ mr: 2 }} /> Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/settings')}>
            <SettingsIcon sx={{ mr: 2 }} /> Settings
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/logout')}>
            <LogoutIcon sx={{ mr: 2 }} /> Logout
          </MenuItem>
        </Menu>
        
        {/* Notifications Menu Dropdown */}
        <Menu
          anchorEl={notificationMenu}
          open={Boolean(notificationMenu)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="subtitle2">New mission scheduled</Typography>
              <Typography variant="body2" color="text.secondary">
                Aerial survey for SunTech Solar scheduled for 10/25/2023
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="subtitle2">Drone maintenance due</Typography>
              <Typography variant="body2" color="text.secondary">
                DJI Phantom 4 Pro is due for routine maintenance
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="subtitle2">License expiring</Typography>
              <Typography variant="body2" color="text.secondary">
                Your Part 107 certification expires in 30 days
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem>
            <Typography 
              variant="body2" 
              color="primary" 
              align="center" 
              sx={{ width: '100%' }}
            >
              View all notifications
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar; 