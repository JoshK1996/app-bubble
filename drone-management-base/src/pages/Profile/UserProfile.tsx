import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Paper,
  IconButton,
  Switch,
  FormControlLabel,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Chip,
  Stack,
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  PhotoCamera as CameraIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  PersonOutline as PersonIcon,
  BusinessCenter as BusinessIcon,
  CreditCard as PaymentIcon,
  Style as SignatureIcon,
  VerifiedUser as CertificateIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Add as AddIcon
} from '@mui/icons-material';

/**
 * User Profile page component
 */
const UserProfile: React.FC = () => {
  const theme = useTheme();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // User data
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@droneops.com',
    phone: '(555) 123-4567',
    jobTitle: 'Lead Drone Pilot',
    businessName: 'DroneOps Solutions',
    businessAddress: '123 Skyview Lane, Droneville, CA 90210',
    website: 'www.droneops-solutions.com',
    taxId: '12-3456789',
    faaLicenseNumber: 'RP-107-24680',
    faaLicenseExpiry: '2026-06-15',
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Commercial drone pilot with 5+ years of experience in aerial photography, mapping, and surveying. Specializing in real estate and infrastructure inspections.',
    notifications: {
      email: true,
      push: true,
      sms: false,
      licenseExpiry: true,
      missionReminders: true,
      paymentAlerts: true
    },
    appearance: {
      darkMode: false,
      compactMode: false,
      fontSize: 'medium',
      colorScheme: 'blue'
    }
  });
  
  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'Credit Card',
      last4: '4242',
      expiry: '05/26',
      default: true
    },
    {
      id: 2,
      type: 'Bank Account',
      last4: '9876',
      expiry: '',
      default: false
    }
  ]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  // Handle field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  // Handle notification toggle
  const handleNotificationChange = (setting: string) => {
    setUserData({
      ...userData,
      notifications: {
        ...userData.notifications,
        [setting]: !userData.notifications[setting as keyof typeof userData.notifications]
      }
    });
  };
  
  // Handle appearance toggle
  const handleAppearanceChange = (setting: string) => {
    setUserData({
      ...userData,
      appearance: {
        ...userData.appearance,
        [setting]: !userData.appearance[setting as keyof typeof userData.appearance]
      }
    });
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          User Profile
        </Typography>
        <Button 
          variant={editMode ? "contained" : "outlined"} 
          color={editMode ? "success" : "primary"}
          startIcon={editMode ? <SaveIcon /> : <EditIcon />}
          onClick={toggleEditMode}
        >
          {editMode ? "Save Changes" : "Edit Profile"}
        </Button>
      </Box>
      
      {/* Profile Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' }, gap: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  editMode ? (
                    <IconButton
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: 36,
                        height: 36,
                      }}
                    >
                      <CameraIcon fontSize="small" />
                    </IconButton>
                  ) : null
                }
              >
                <Avatar 
                  src={userData.profilePicture} 
                  alt={`${userData.firstName} ${userData.lastName}`}
                  sx={{ width: 120, height: 120, border: `3px solid ${theme.palette.primary.main}` }}
                />
              </Badge>
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {userData.firstName} {userData.lastName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {userData.jobTitle} at {userData.businessName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                {userData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                {userData.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                {userData.businessAddress}
              </Typography>
            </Box>
            
            <Box>
              <Chip 
                icon={<CertificateIcon fontSize="small" />} 
                label={`FAA License: ${userData.faaLicenseNumber}`}
                color="primary" 
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" display="block" color="text.secondary">
                Expiry: {new Date(userData.faaLicenseExpiry).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
          <Tab label="Personal Information" />
          <Tab label="Business Profile" />
          <Tab label="Payment Methods" />
          <Tab label="Settings" />
        </Tabs>
      </Box>
      
      {/* Personal Information Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Phone"
                      name="phone"
                      value={userData.phone}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Job Title"
                      name="jobTitle"
                      value={userData.jobTitle}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Certifications & Licenses
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="FAA Remote Pilot License Number"
                      name="faaLicenseNumber"
                      value={userData.faaLicenseNumber}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CertificateIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="License Expiry Date"
                      name="faaLicenseExpiry"
                      type="date"
                      value={userData.faaLicenseExpiry}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<CameraIcon />}
                        disabled={!editMode}
                      >
                        Upload License
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<CertificateIcon />}
                        disabled={!editMode}
                      >
                        Upload Insurance
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Digital Signature
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ 
                  border: '1px dashed #ccc', 
                  borderRadius: 1, 
                  height: 100, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  mb: 2
                }}>
                  <Typography variant="body2" color="text.secondary">
                    {editMode ? 'Click to upload or draw signature' : 'Your digital signature'}
                  </Typography>
                </Box>
                {editMode && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<CameraIcon />}
                      size="small"
                    >
                      Upload
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<SignatureIcon />}
                      size="small"
                    >
                      Draw
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About Me
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  label="Professional Bio"
                  name="bio"
                  value={userData.bio}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={!editMode}
                  margin="normal"
                  variant="outlined"
                  placeholder="Tell clients about your experience, specialties, and qualifications..."
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Business Profile Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Business Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Business Name"
                      name="businessName"
                      value={userData.businessName}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Business Address"
                      name="businessAddress"
                      value={userData.businessAddress}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Website"
                      name="website"
                      value={userData.website}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LanguageIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Tax ID / EIN"
                      name="taxId"
                      value={userData.taxId}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Business Logo
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ 
                  border: '1px dashed #ccc', 
                  borderRadius: 1, 
                  height: 200, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  mb: 2
                }}>
                  <Box
                    component="img"
                    src="https://placehold.co/300x150/f2f2f2/666666?text=Company+Logo"
                    alt="Business Logo"
                    sx={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </Box>
                {editMode && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<CameraIcon />}
                    >
                      Upload Logo
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error"
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Business Hours
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemText primary="Monday - Friday" secondary="9:00 AM - 5:00 PM" />
                    {editMode && (
                      <IconButton edge="end">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Saturday" secondary="10:00 AM - 2:00 PM" />
                    {editMode && (
                      <IconButton edge="end">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Sunday" secondary="Closed" />
                    {editMode && (
                      <IconButton edge="end">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Payment Methods Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Payment Methods
                  </Typography>
                  {editMode && (
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                    >
                      Add Payment Method
                    </Button>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {paymentMethods.map((method) => (
                    <ListItem
                      key={method.id}
                      secondaryAction={
                        editMode && (
                          <IconButton edge="end">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <PaymentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {method.type}
                            {method.default && (
                              <Chip 
                                label="Default" 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          method.type === 'Credit Card' 
                            ? `•••• •••• •••• ${method.last4} (Expires: ${method.expiry})`
                            : `Account ending in ${method.last4}`
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Billing Address
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  {userData.businessName}
                </Typography>
                <Typography variant="body2" paragraph>
                  {userData.businessAddress}
                </Typography>
                {editMode && (
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                  >
                    Edit Billing Address
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment History
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No recent payment transactions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Settings Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<SecurityIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', mb: 2 }}
                  >
                    Change Password
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<SecurityIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', mb: 2 }}
                  >
                    Two-Factor Authentication
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="error"
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText primary="Email Notifications" />
                    <Switch
                      edge="end"
                      checked={userData.notifications.email}
                      onChange={() => handleNotificationChange('email')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationIcon />
                    </ListItemIcon>
                    <ListItemText primary="Push Notifications" />
                    <Switch
                      edge="end"
                      checked={userData.notifications.push}
                      onChange={() => handleNotificationChange('push')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText primary="SMS Notifications" />
                    <Switch
                      edge="end"
                      checked={userData.notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CertificateIcon />
                    </ListItemIcon>
                    <ListItemText primary="License Expiry Reminders" />
                    <Switch
                      edge="end"
                      checked={userData.notifications.licenseExpiry}
                      onChange={() => handleNotificationChange('licenseExpiry')}
                      disabled={!editMode}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Appearance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PaletteIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dark Mode" />
                    <Switch
                      edge="end"
                      checked={userData.appearance.darkMode}
                      onChange={() => handleAppearanceChange('darkMode')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PaletteIcon />
                    </ListItemIcon>
                    <ListItemText primary="Compact Mode" />
                    <Switch
                      edge="end"
                      checked={userData.appearance.compactMode}
                      onChange={() => handleAppearanceChange('compactMode')}
                      disabled={!editMode}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default UserProfile; 