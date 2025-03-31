import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  FormHelperText,
  Tabs,
  Tab,
  Divider,
  Alert,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AirplanemodeActive as DroneIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// License types
const LICENSE_TYPES = [
  'Part 107 Remote Pilot Certificate',
  'Part 107 Knowledge Test',
  'Drone Registration - Recreational',
  'Drone Registration - Commercial',
  'FAA Waiver - Night Operations',
  'FAA Waiver - Operations Over People',
  'FAA Waiver - Operations in Controlled Airspace',
  'FAA Waiver - Beyond Visual Line of Sight',
  'Insurance Certificate',
  'Local Permit'
];

// License status types
export type LicenseStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'Pending Renewal' | 'Pending Approval';

// License interface
export interface License {
  id: number;
  type: string;
  licenseNumber: string;
  pilotName: string;
  issuedDate: string | Date;
  expiryDate: string | Date;
  status: LicenseStatus;
  attachments: number;
  notes: string;
  /* New fields for enhanced compliance management */
  issuer: string;
  renewalUrl?: string;
  associatedDrones?: string[];
  warningThreshold: number; // days before expiry to show warning
  reminderSent: boolean;
  lastReminderDate?: string | Date;
  authorityContactInfo?: string;
  droneId?: number;
}

interface FAALicenseManagerProps {
  licenses: License[];
  onAddLicense: (license: Omit<License, 'id'>) => void;
  onUpdateLicense: (id: number, license: Omit<License, 'id'>) => void;
  onDeleteLicense: (id: number) => void;
  onSendReminder: (id: number) => void;
  onExportCsv: () => void;
  onImportCsv: (file: File) => void;
}

const FAALicenseManager: React.FC<FAALicenseManagerProps> = ({
  licenses,
  onAddLicense,
  onUpdateLicense,
  onDeleteLicense,
  onSendReminder,
  onExportCsv,
  onImportCsv
}) => {
  const theme = useTheme();
  
  // State for form dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  // Selected license for edit/delete
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Omit<License, 'id'>>({
    type: '',
    licenseNumber: '',
    pilotName: '',
    issuedDate: new Date(),
    expiryDate: new Date(),
    status: 'Valid',
    attachments: 0,
    notes: '',
    issuer: 'Federal Aviation Administration',
    warningThreshold: 90, // 90 days default warning threshold
    reminderSent: false,
    associatedDrones: []
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Tab state for license types
  const [tabValue, setTabValue] = useState(0);
  
  // License category filter
  const [licenseFilter, setLicenseFilter] = useState<string>('All');
  
  // Handle opening the add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      type: '',
      licenseNumber: '',
      pilotName: '',
      issuedDate: new Date(),
      expiryDate: new Date(),
      status: 'Valid',
      attachments: 0,
      notes: '',
      issuer: 'Federal Aviation Administration',
      warningThreshold: 90,
      reminderSent: false,
      associatedDrones: []
    });
    setFormErrors({});
    setIsAddDialogOpen(true);
  };
  
  // Handle opening the edit dialog
  const handleOpenEditDialog = (license: License) => {
    setSelectedLicense(license);
    setFormData({
      ...license,
      issuedDate: new Date(license.issuedDate),
      expiryDate: new Date(license.expiryDate),
      lastReminderDate: license.lastReminderDate ? new Date(license.lastReminderDate) : undefined
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };
  
  // Handle opening the delete dialog
  const handleOpenDeleteDialog = (license: License) => {
    setSelectedLicense(license);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle opening the import dialog
  const handleOpenImportDialog = () => {
    setSelectedFile(null);
    setIsImportDialogOpen(true);
  };
  
  // Handle closing dialogs
  const handleCloseDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsImportDialogOpen(false);
    setSelectedLicense(null);
  };
  
  // Handle form field change
  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.type) {
      errors.type = 'License type is required';
    }
    
    if (!formData.licenseNumber) {
      errors.licenseNumber = 'License number is required';
    }
    
    if (!formData.pilotName && !formData.type.includes('Drone Registration')) {
      errors.pilotName = 'Pilot name is required for pilot licenses';
    }
    
    if (!formData.issuedDate) {
      errors.issuedDate = 'Issue date is required';
    }
    
    if (!formData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (new Date(formData.expiryDate) <= new Date(formData.issuedDate)) {
      errors.expiryDate = 'Expiry date must be after issue date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle saving a new license
  const handleSaveNewLicense = () => {
    if (validateForm()) {
      onAddLicense(formData);
      handleCloseDialogs();
    }
  };
  
  // Handle updating a license
  const handleUpdateLicense = () => {
    if (validateForm() && selectedLicense) {
      onUpdateLicense(selectedLicense.id, formData);
      handleCloseDialogs();
    }
  };
  
  // Handle deleting a license
  const handleDeleteLicense = () => {
    if (selectedLicense) {
      onDeleteLicense(selectedLicense.id);
      handleCloseDialogs();
    }
  };
  
  // Handle file selection for import
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  // Handle import submission
  const handleImport = () => {
    if (selectedFile) {
      onImportCsv(selectedFile);
      handleCloseDialogs();
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Set filter based on tab
    switch (newValue) {
      case 0:
        setLicenseFilter('All');
        break;
      case 1:
        setLicenseFilter('Pilot');
        break;
      case 2:
        setLicenseFilter('Drone');
        break;
      case 3:
        setLicenseFilter('Waiver');
        break;
      default:
        setLicenseFilter('All');
    }
  };
  
  // Get license status color
  const getLicenseStatusColor = (status: LicenseStatus): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'Valid':
        return 'success';
      case 'Expiring Soon':
        return 'warning';
      case 'Expired':
        return 'error';
      case 'Pending Renewal':
      case 'Pending Approval':
        return 'info';
      default:
        return 'info';
    }
  };
  
  // Filter licenses based on tab selection
  const getFilteredLicenses = (): License[] => {
    if (licenseFilter === 'All') {
      return licenses;
    }
    
    return licenses.filter(license => {
      if (licenseFilter === 'Pilot') {
        return license.type.includes('Pilot') || license.type.includes('Knowledge Test');
      } else if (licenseFilter === 'Drone') {
        return license.type.includes('Registration');
      } else if (licenseFilter === 'Waiver') {
        return license.type.includes('Waiver');
      }
      return true;
    });
  };
  
  // Calculate licenses statistics
  const validLicenses = licenses.filter(l => l.status === 'Valid').length;
  const expiringLicenses = licenses.filter(l => l.status === 'Expiring Soon').length;
  const expiredLicenses = licenses.filter(l => l.status === 'Expired').length;
  const pendingLicenses = licenses.filter(l => 
    l.status === 'Pending Renewal' || l.status === 'Pending Approval'
  ).length;
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          License & Registration Management
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{ mr: 1 }}
          >
            Add License
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<UploadIcon />}
            onClick={handleOpenImportDialog}
            sx={{ mr: 1 }}
          >
            Import
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={onExportCsv}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">
                  Valid Licenses
                </Typography>
                <Box sx={{ 
                  bgcolor: theme.palette.success.light, 
                  borderRadius: '50%', 
                  width: 36, 
                  height: 36, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <PersonIcon sx={{ color: theme.palette.success.main }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {validLicenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">
                  Expiring Soon
                </Typography>
                <Box sx={{ 
                  bgcolor: theme.palette.warning.light, 
                  borderRadius: '50%', 
                  width: 36, 
                  height: 36, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <NotificationsIcon sx={{ color: theme.palette.warning.main }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {expiringLicenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">
                  Expired
                </Typography>
                <Box sx={{ 
                  bgcolor: theme.palette.error.light, 
                  borderRadius: '50%', 
                  width: 36, 
                  height: 36, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <RefreshIcon sx={{ color: theme.palette.error.main }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {expiredLicenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">
                  Pending
                </Typography>
                <Box sx={{ 
                  bgcolor: theme.palette.info.light, 
                  borderRadius: '50%', 
                  width: 36, 
                  height: 36, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <BusinessIcon sx={{ color: theme.palette.info.main }} />
                </Box>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {pendingLicenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for different license types */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Licenses" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="Pilot Licenses" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Drone Registrations" icon={<DroneIcon />} iconPosition="start" />
          <Tab label="Waivers" icon={<RefreshIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* License list - You would implement the actual list here */}
      <Box>
        {getFilteredLicenses().length === 0 ? (
          <Alert severity="info">
            No licenses found for the selected filter. Click "Add License" to create one.
          </Alert>
        ) : (
          <Typography>
            License list component would go here - Showing {getFilteredLicenses().length} licenses
          </Typography>
        )}
      </Box>
      
      {/* Add License Dialog */}
      <Dialog open={isAddDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add New License or Registration</Typography>
            <IconButton onClick={handleCloseDialogs} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.type} margin="normal">
                  <InputLabel>License Type *</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    label="License Type *"
                  >
                    {LICENSE_TYPES.map((type, index) => (
                      <MenuItem key={index} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="License Number *"
                  fullWidth
                  value={formData.licenseNumber}
                  onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
                  error={!!formErrors.licenseNumber}
                  helperText={formErrors.licenseNumber}
                  margin="normal"
                />
              </Grid>
              
              {!formData.type.includes('Drone Registration') && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Pilot Name *"
                    fullWidth
                    value={formData.pilotName}
                    onChange={(e) => handleFormChange('pilotName', e.target.value)}
                    error={!!formErrors.pilotName}
                    helperText={formErrors.pilotName}
                    margin="normal"
                  />
                </Grid>
              )}
              
              {formData.type.includes('Drone Registration') && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Drone Name/Model"
                    fullWidth
                    value={formData.pilotName}
                    onChange={(e) => handleFormChange('pilotName', e.target.value)}
                    margin="normal"
                  />
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Issuer"
                  fullWidth
                  value={formData.issuer}
                  onChange={(e) => handleFormChange('issuer', e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Issue Date *"
                  value={formData.issuedDate}
                  onChange={(newDate) => handleFormChange('issuedDate', newDate)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!formErrors.issuedDate}
                      helperText={formErrors.issuedDate}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Expiry Date *"
                  value={formData.expiryDate}
                  onChange={(newDate) => handleFormChange('expiryDate', newDate)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!formErrors.expiryDate}
                      helperText={formErrors.expiryDate}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="Valid">Valid</MenuItem>
                    <MenuItem value="Expiring Soon">Expiring Soon</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                    <MenuItem value="Pending Renewal">Pending Renewal</MenuItem>
                    <MenuItem value="Pending Approval">Pending Approval</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Warning Threshold (days)"
                  type="number"
                  fullWidth
                  value={formData.warningThreshold}
                  onChange={(e) => handleFormChange('warningThreshold', parseInt(e.target.value))}
                  margin="normal"
                  InputProps={{ inputProps: { min: 1, max: 365 } }}
                  helperText="Days before expiry to show warnings"
                />
              </Grid>
              
              {formData.type.includes('Waiver') && (
                <Grid item xs={12}>
                  <TextField
                    label="Associated Drones"
                    fullWidth
                    placeholder="Comma-separated list of drone names or registration numbers"
                    value={formData.associatedDrones ? formData.associatedDrones.join(', ') : ''}
                    onChange={(e) => handleFormChange('associatedDrones', e.target.value.split(',').map(item => item.trim()))}
                    margin="normal"
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  label="Renewal URL"
                  fullWidth
                  value={formData.renewalUrl || ''}
                  onChange={(e) => handleFormChange('renewalUrl', e.target.value)}
                  margin="normal"
                  placeholder="https://faadronezone.faa.gov/"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Authority Contact Information"
                  fullWidth
                  value={formData.authorityContactInfo || ''}
                  onChange={(e) => handleFormChange('authorityContactInfo', e.target.value)}
                  margin="normal"
                  placeholder="Contact information for the issuing authority"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSaveNewLicense}
          >
            Save License
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit License Dialog - Similar to Add but with pre-filled data */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit License</Typography>
            <IconButton onClick={handleCloseDialogs} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Same form fields as Add Dialog, but pre-filled with selected license data */}
          <Typography>Edit form would go here with same fields as Add form</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleUpdateLicense}
          >
            Update License
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the license 
            "{selectedLicense?.type} - {selectedLicense?.licenseNumber}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteLicense}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Import Licenses</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Upload a CSV file with license data. The file should have the following columns:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>type</li>
              <li>licenseNumber</li>
              <li>pilotName</li>
              <li>issuedDate (YYYY-MM-DD)</li>
              <li>expiryDate (YYYY-MM-DD)</li>
              <li>status</li>
              <li>notes</li>
            </ul>
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            sx={{ mt: 2 }}
          >
            Select File
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileChange}
            />
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleImport}
            disabled={!selectedFile}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FAALicenseManager; 