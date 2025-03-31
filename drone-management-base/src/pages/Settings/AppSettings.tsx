import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  SaveAlt as BackupIcon,
  BugReport as BugIcon,
  Help as HelpIcon,
  DeleteForever as DeleteIcon,
  Clear as ClearIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';

/**
 * Application Settings page component
 */
const AppSettings: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Settings state
  const [settings, setSettings] = useState({
    appearance: {
      darkMode: false,
      density: 'comfortable',
      fontSize: 14,
      colorTheme: 'blue',
      enableAnimations: true,
      glassmorphism: true
    },
    language: {
      preferredLanguage: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      reminderNotifications: true,
      licenseExpiryAlerts: true,
      paymentAlerts: true,
      systemAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      autoLock: true
    },
    data: {
      autoSave: true,
      autoSaveInterval: 5,
      localBackup: true,
      cloudBackup: false,
      dataRetention: 365,
      anonymizeData: false
    },
    advanced: {
      enableDebugMode: false,
      enableDevTools: false,
      logLevel: 'error',
      useExperimentalFeatures: false
    }
  });
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle toggle change
  const handleToggleChange = (section: string, setting: string) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [setting]: !settings[section as keyof typeof settings][setting as keyof typeof settings[keyof typeof settings]]
      }
    });
  };
  
  // Handle slider change
  const handleSliderChange = (section: string, setting: string, value: number) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [setting]: value
      }
    });
  };
  
  // Handle select change
  const handleSelectChange = (section: string, setting: string, value: string) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [setting]: value
      }
    });
  };
  
  // Reset all settings
  const handleResetSettings = () => {
    // Implementation would reset to default settings
    alert('This would reset all settings to default values.');
  };
  
  // Clear all data
  const handleClearData = () => {
    // Implementation would clear stored data
    alert('This would clear all stored application data.');
  };
  
  // Export settings
  const handleExportSettings = () => {
    // Implementation would export settings to a file
    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drone-business-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => alert('Settings saved')}
        >
          Save Changes
        </Button>
      </Box>
      
      {/* Settings Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab icon={<DarkModeIcon />} label="Appearance" />
          <Tab icon={<LanguageIcon />} label="Language & Region" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<StorageIcon />} label="Data Management" />
          <Tab icon={<BugIcon />} label="Advanced" />
        </Tabs>
      </Box>
      
      {/* Appearance Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Theme Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.appearance.darkMode}
                      onChange={() => handleToggleChange('appearance', 'darkMode')}
                    />
                  }
                  label="Dark Mode"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.appearance.glassmorphism}
                      onChange={() => handleToggleChange('appearance', 'glassmorphism')}
                    />
                  }
                  label="Glass Effect UI"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.appearance.enableAnimations}
                      onChange={() => handleToggleChange('appearance', 'enableAnimations')}
                    />
                  }
                  label="Enable Animations"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Color Theme</InputLabel>
                  <Select
                    value={settings.appearance.colorTheme}
                    label="Color Theme"
                    onChange={(e) => handleSelectChange('appearance', 'colorTheme', e.target.value as string)}
                  >
                    <MenuItem value="blue">Blue</MenuItem>
                    <MenuItem value="green">Green</MenuItem>
                    <MenuItem value="purple">Purple</MenuItem>
                    <MenuItem value="orange">Orange</MenuItem>
                    <MenuItem value="red">Red</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Layout Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Font Size</Typography>
                  <Slider
                    value={settings.appearance.fontSize}
                    min={12}
                    max={20}
                    step={1}
                    marks={[
                      { value: 12, label: 'Small' },
                      { value: 14, label: 'Medium' },
                      { value: 16, label: 'Large' },
                      { value: 20, label: 'X-Large' }
                    ]}
                    onChange={(_, value) => handleSliderChange('appearance', 'fontSize', value as number)}
                  />
                </Box>
                
                <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
                  <InputLabel>Density</InputLabel>
                  <Select
                    value={settings.appearance.density}
                    label="Density"
                    onChange={(e) => handleSelectChange('appearance', 'density', e.target.value as string)}
                  >
                    <MenuItem value="compact">Compact</MenuItem>
                    <MenuItem value="comfortable">Comfortable</MenuItem>
                    <MenuItem value="spacious">Spacious</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined"
                    onClick={() => alert('Preview theme applied')}
                    sx={{ mr: 1 }}
                  >
                    Preview
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => alert('Theme settings reset')}
                  >
                    Reset Theme
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Language & Region Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Language Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Preferred Language</InputLabel>
                  <Select
                    value={settings.language.preferredLanguage}
                    label="Preferred Language"
                    onChange={(e) => handleSelectChange('language', 'preferredLanguage', e.target.value as string)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="cn">Chinese</MenuItem>
                  </Select>
                </FormControl>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Changing language will require a page reload to take effect.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Date & Time Formats
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.language.dateFormat}
                    label="Date Format"
                    onChange={(e) => handleSelectChange('language', 'dateFormat', e.target.value as string)}
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={settings.language.timeFormat}
                    label="Time Format"
                    onChange={(e) => handleSelectChange('language', 'timeFormat', e.target.value as string)}
                  >
                    <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                    <MenuItem value="24h">24-hour</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography variant="body2" gutterBottom>Preview:</Typography>
                <Typography variant="body1">
                  {settings.language.dateFormat === 'MM/DD/YYYY' && '05/25/2023'}
                  {settings.language.dateFormat === 'DD/MM/YYYY' && '25/05/2023'}
                  {settings.language.dateFormat === 'YYYY-MM-DD' && '2023-05-25'}
                  {' '}
                  {settings.language.timeFormat === '12h' && '3:30 PM'}
                  {settings.language.timeFormat === '24h' && '15:30'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Notifications Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email Notifications" 
                      secondary="Receive notifications via email"
                    />
                    <Switch
                      edge="end"
                      checked={settings.notifications.emailNotifications}
                      onChange={() => handleToggleChange('notifications', 'emailNotifications')}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Push Notifications" 
                      secondary="Receive in-browser notifications"
                    />
                    <Switch
                      edge="end"
                      checked={settings.notifications.pushNotifications}
                      onChange={() => handleToggleChange('notifications', 'pushNotifications')}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Reminder Notifications" 
                      secondary="Get reminded about upcoming missions"
                    />
                    <Switch
                      edge="end"
                      checked={settings.notifications.reminderNotifications}
                      onChange={() => handleToggleChange('notifications', 'reminderNotifications')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alert Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="License Expiry Alerts" 
                      secondary="Get notified when licenses are about to expire"
                    />
                    <Switch
                      edge="end"
                      checked={settings.notifications.licenseExpiryAlerts}
                      onChange={() => handleToggleChange('notifications', 'licenseExpiryAlerts')}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Payment Alerts" 
                      secondary="Get notified about invoice status and payments"
                    />
                    <Switch
                      edge="end"
                      checked={settings.notifications.paymentAlerts}
                      onChange={() => handleToggleChange('notifications', 'paymentAlerts')}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="System Alerts" 
                      secondary="Get notified about important system updates"
                    />
                    <Switch
                      edge="end"
                      checked={settings.notifications.systemAlerts}
                      onChange={() => handleToggleChange('notifications', 'systemAlerts')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Security Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Authentication Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.security.twoFactorAuth}
                      onChange={() => handleToggleChange('security', 'twoFactorAuth')}
                    />
                  }
                  label="Two-Factor Authentication"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.security.autoLock}
                      onChange={() => handleToggleChange('security', 'autoLock')}
                    />
                  }
                  label="Auto-lock Session"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Session Timeout (minutes)</Typography>
                  <Slider
                    value={settings.security.sessionTimeout}
                    min={5}
                    max={60}
                    step={5}
                    marks={[
                      { value: 5, label: '5' },
                      { value: 30, label: '30' },
                      { value: 60, label: '60' }
                    ]}
                    onChange={(_, value) => handleSliderChange('security', 'sessionTimeout', value as number)}
                    disabled={!settings.security.autoLock}
                  />
                </Box>
                
                <Box>
                  <Typography gutterBottom>Password Expiry (days)</Typography>
                  <Slider
                    value={settings.security.passwordExpiry}
                    min={30}
                    max={180}
                    step={30}
                    marks={[
                      { value: 30, label: '30' },
                      { value: 90, label: '90' },
                      { value: 180, label: '180' }
                    ]}
                    onChange={(_, value) => handleSliderChange('security', 'passwordExpiry', value as number)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    onClick={() => alert('This would change your password')}
                  >
                    Change Password
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    onClick={() => alert('This would set up 2FA')}
                    disabled={settings.security.twoFactorAuth}
                  >
                    Set Up Two-Factor Authentication
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => alert('This would sign out from all devices')}
                  >
                    Sign Out From All Devices
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => alert('This would delete your account')}
                  >
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Data Management Tab */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Storage Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.data.autoSave}
                      onChange={() => handleToggleChange('data', 'autoSave')}
                    />
                  }
                  label="Auto-Save Data"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Auto-Save Interval (minutes)</Typography>
                  <Slider
                    value={settings.data.autoSaveInterval}
                    min={1}
                    max={60}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 5, label: '5' },
                      { value: 15, label: '15' },
                      { value: 60, label: '60' }
                    ]}
                    onChange={(_, value) => handleSliderChange('data', 'autoSaveInterval', value as number)}
                    disabled={!settings.data.autoSave}
                  />
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.data.localBackup}
                      onChange={() => handleToggleChange('data', 'localBackup')}
                    />
                  }
                  label="Enable Local Backups"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.data.cloudBackup}
                      onChange={() => handleToggleChange('data', 'cloudBackup')}
                    />
                  }
                  label="Enable Cloud Backups"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <Box>
                  <Typography gutterBottom>Data Retention Period (days)</Typography>
                  <Slider
                    value={settings.data.dataRetention}
                    min={30}
                    max={730}
                    step={30}
                    marks={[
                      { value: 30, label: '30' },
                      { value: 180, label: '180' },
                      { value: 365, label: '365' },
                      { value: 730, label: '730' }
                    ]}
                    onChange={(_, value) => handleSliderChange('data', 'dataRetention', value as number)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Management Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="outlined"
                    startIcon={<BackupIcon />}
                    onClick={() => alert('This would create a backup of your data')}
                  >
                    Create Backup Now
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => alert('This would restore your data from a backup')}
                  >
                    Restore From Backup
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    startIcon={<StorageIcon />}
                    onClick={handleExportSettings}
                  >
                    Export Settings
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    color="warning"
                    startIcon={<ClearIcon />}
                    onClick={handleClearData}
                  >
                    Clear All Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Advanced Tab */}
      {tabValue === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Advanced Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.advanced.enableDebugMode}
                      onChange={() => handleToggleChange('advanced', 'enableDebugMode')}
                    />
                  }
                  label="Enable Debug Mode"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.advanced.enableDevTools}
                      onChange={() => handleToggleChange('advanced', 'enableDevTools')}
                    />
                  }
                  label="Enable Developer Tools"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.advanced.useExperimentalFeatures}
                      onChange={() => handleToggleChange('advanced', 'useExperimentalFeatures')}
                    />
                  }
                  label="Use Experimental Features"
                  sx={{ display: 'block', mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Log Level</InputLabel>
                  <Select
                    value={settings.advanced.logLevel}
                    label="Log Level"
                    onChange={(e) => handleSelectChange('advanced', 'logLevel', e.target.value as string)}
                  >
                    <MenuItem value="error">Error Only</MenuItem>
                    <MenuItem value="warn">Warning & Error</MenuItem>
                    <MenuItem value="info">Info, Warning & Error</MenuItem>
                    <MenuItem value="debug">Debug (All)</MenuItem>
                  </Select>
                </FormControl>
                
                <Alert severity="warning" sx={{ mt: 2 }}>
                  These settings are intended for advanced users and developers. Changing them may affect application performance.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemText primary="Application Version" secondary="1.0.0" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Build Date" secondary="June 15, 2023" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Database Version" secondary="3.4.2" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Browser" secondary={navigator.userAgent} />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Support Options
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined"
                    startIcon={<HelpIcon />}
                    onClick={() => alert('This would open the help documentation')}
                  >
                    View Documentation
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    startIcon={<BugIcon />}
                    onClick={() => alert('This would open the bug report form')}
                  >
                    Report a Bug
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    color="warning"
                    startIcon={<ResetIcon />}
                    onClick={handleResetSettings}
                  >
                    Reset All Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AppSettings; 