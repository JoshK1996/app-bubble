import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Tooltip,
  Alert,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Flight log types
export type FlightPurpose = 
  | 'Inspection' 
  | 'Mapping/Survey' 
  | 'Photography' 
  | 'Videography' 
  | 'Training'
  | 'Recreation'
  | 'Delivery'
  | 'Emergency Response'
  | 'Other';

export type WeatherCondition = 
  | 'Clear' 
  | 'Partly Cloudy' 
  | 'Cloudy' 
  | 'Light Rain' 
  | 'Heavy Rain'
  | 'Snow'
  | 'Fog'
  | 'Windy'
  | 'Other';

export interface FlightLog {
  id: number;
  date: string | Date;
  pilot: string;
  droneId: number;
  droneName: string;
  startTime: string | Date;
  endTime: string | Date;
  duration: number; // in minutes
  location: string;
  purpose: FlightPurpose;
  weatherConditions: WeatherCondition;
  notes: string;
  batteryLevels: {
    start: number;
    end: number;
  };
  flightPath?: string; // URL to stored flight path data
  incidents?: string;
  maxAltitude?: number;
  maxDistance?: number;
  hasMedia?: boolean;
  mediaLocations?: string[];
}

interface FlightLogSystemProps {
  flightLogs: FlightLog[];
  onAddFlightLog: (log: Omit<FlightLog, 'id'>) => void;
  onUpdateFlightLog: (id: number, log: Omit<FlightLog, 'id'>) => void;
  onDeleteFlightLog: (id: number) => void;
  onExportLogs: () => void;
  pilots: string[];
  drones: Array<{ id: number; name: string }>;
}

const FlightLogSystem: React.FC<FlightLogSystemProps> = ({
  flightLogs,
  onAddFlightLog,
  onUpdateFlightLog,
  onDeleteFlightLog,
  onExportLogs,
  pilots,
  drones
}) => {
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Selected log
  const [selectedLog, setSelectedLog] = useState<FlightLog | null>(null);
  
  // Default form data
  const defaultFormData: Omit<FlightLog, 'id'> = {
    date: new Date(),
    pilot: '',
    droneId: 0,
    droneName: '',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 30 * 60000), // 30 minutes later
    duration: 30,
    location: '',
    purpose: 'Inspection',
    weatherConditions: 'Clear',
    notes: '',
    batteryLevels: {
      start: 100,
      end: 60
    }
  };
  
  // Form data
  const [formData, setFormData] = useState<Omit<FlightLog, 'id'>>(defaultFormData);
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    setFormData(defaultFormData);
    setFormErrors({});
    setIsAddDialogOpen(true);
  };
  
  // Handle opening edit dialog
  const handleOpenEditDialog = (log: FlightLog) => {
    setSelectedLog(log);
    setFormData({
      ...log,
      date: new Date(log.date),
      startTime: new Date(log.startTime),
      endTime: new Date(log.endTime)
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };
  
  // Handle opening delete dialog
  const handleOpenDeleteDialog = (log: FlightLog) => {
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle opening view dialog
  const handleOpenViewDialog = (log: FlightLog) => {
    setSelectedLog(log);
    setIsViewDialogOpen(true);
  };
  
  // Handle closing dialogs
  const handleCloseDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsViewDialogOpen(false);
    setSelectedLog(null);
  };
  
  // Handle form field change
  const handleFormChange = (field: string, value: any) => {
    // Special handling for nested properties
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentKey = parent as keyof typeof formData;
      const parentValue = formData[parentKey];
      
      if (parentValue && typeof parentValue === 'object') {
        setFormData({
          ...formData,
          [parent]: {
            ...parentValue,
            [child]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
    
    // Special handling for drone selection
    if (field === 'droneId') {
      const selectedDrone = drones.find(d => d.id === value);
      if (selectedDrone) {
        setFormData({
          ...formData,
          droneId: value,
          droneName: selectedDrone.name
        });
      }
    }
    
    // Update duration when start or end time changes
    if (field === 'startTime' || field === 'endTime') {
      const start = field === 'startTime' ? value : formData.startTime;
      const end = field === 'endTime' ? value : formData.endTime;
      
      if (start && end) {
        const durationMs = new Date(end).getTime() - new Date(start).getTime();
        const durationMinutes = Math.round(durationMs / 60000);
        
        if (durationMinutes >= 0) {
          setFormData({
            ...formData,
            [field]: value,
            duration: durationMinutes
          });
        } else {
          // End time is before start time
          setFormErrors({
            ...formErrors,
            endTime: 'End time must be after start time'
          });
        }
      } else {
        setFormData({
          ...formData,
          [field]: value
        });
      }
    }
    
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
    
    if (!formData.pilot) {
      errors.pilot = 'Pilot is required';
    }
    
    if (!formData.droneId) {
      errors.droneId = 'Drone is required';
    }
    
    if (!formData.location) {
      errors.location = 'Location is required';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required';
    } else if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      errors.endTime = 'End time must be after start time';
    }
    
    if (formData.batteryLevels.start < 0 || formData.batteryLevels.start > 100) {
      errors['batteryLevels.start'] = 'Battery start level must be between 0-100%';
    }
    
    if (formData.batteryLevels.end < 0 || formData.batteryLevels.end > 100) {
      errors['batteryLevels.end'] = 'Battery end level must be between 0-100%';
    }
    
    if (formData.batteryLevels.end > formData.batteryLevels.start) {
      errors['batteryLevels.end'] = 'End battery level cannot be higher than start';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle saving a new flight log
  const handleSaveNewLog = () => {
    if (validateForm()) {
      onAddFlightLog(formData);
      handleCloseDialogs();
    }
  };
  
  // Handle updating a flight log
  const handleUpdateLog = () => {
    if (validateForm() && selectedLog) {
      onUpdateFlightLog(selectedLog.id, formData);
      handleCloseDialogs();
    }
  };
  
  // Handle deleting a flight log
  const handleDeleteLog = () => {
    if (selectedLog) {
      onDeleteFlightLog(selectedLog.id);
      handleCloseDialogs();
    }
  };
  
  // Format date for display
  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString();
  };
  
  // Format time for display
  const formatTime = (time: string | Date): string => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get purpose chip color
  const getPurposeColor = (purpose: FlightPurpose): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (purpose) {
      case 'Inspection':
        return 'info';
      case 'Mapping/Survey':
        return 'secondary';
      case 'Photography':
      case 'Videography':
        return 'primary';
      case 'Training':
        return 'success';
      case 'Recreation':
        return 'default';
      case 'Delivery':
        return 'warning';
      case 'Emergency Response':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get weather condition icon
  const getWeatherIcon = (condition: WeatherCondition): React.ReactNode => {
    // Would use real weather icons in a real implementation
    return condition;
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Flight Log System
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{ mr: 1 }}
          >
            Add Flight Log
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={onExportLogs}
          >
            Export Logs
          </Button>
        </Box>
      </Box>
      
      {/* Flight Logs Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Pilot</TableCell>
              <TableCell>Drone</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Weather</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flightLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Alert severity="info">
                    No flight logs found. Click "Add Flight Log" to create one.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              flightLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.date)}</TableCell>
                  <TableCell>{log.pilot}</TableCell>
                  <TableCell>{log.droneName}</TableCell>
                  <TableCell>
                    {formatTime(log.startTime)} - {formatTime(log.endTime)}
                  </TableCell>
                  <TableCell>{log.duration} min</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {log.location}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.purpose} 
                      size="small" 
                      color={getPurposeColor(log.purpose)}
                    />
                  </TableCell>
                  <TableCell>{getWeatherIcon(log.weatherConditions)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleOpenViewDialog(log)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenEditDialog(log)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleOpenDeleteDialog(log)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit Flight Log Dialog */}
      <Dialog 
        open={isAddDialogOpen || isEditDialogOpen} 
        onClose={handleCloseDialogs} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {isAddDialogOpen ? 'Add New Flight Log' : 'Edit Flight Log'}
            </Typography>
            <IconButton onClick={handleCloseDialogs} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Flight Date *"
                  value={formData.date}
                  onChange={(newDate) => handleFormChange('date', newDate)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!formErrors.date}
                      helperText={formErrors.date}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!formErrors.pilot}>
                  <InputLabel>Pilot *</InputLabel>
                  <Select
                    value={formData.pilot}
                    onChange={(e) => handleFormChange('pilot', e.target.value)}
                    label="Pilot *"
                  >
                    {pilots.map((pilot, index) => (
                      <MenuItem key={index} value={pilot}>
                        {pilot}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.pilot && <Typography color="error" variant="caption">{formErrors.pilot}</Typography>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!formErrors.droneId}>
                  <InputLabel>Drone *</InputLabel>
                  <Select
                    value={formData.droneId}
                    onChange={(e) => handleFormChange('droneId', e.target.value)}
                    label="Drone *"
                  >
                    {drones.map((drone) => (
                      <MenuItem key={drone.id} value={drone.id}>
                        {drone.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.droneId && <Typography color="error" variant="caption">{formErrors.droneId}</Typography>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Location *"
                  fullWidth
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  error={!!formErrors.location}
                  helperText={formErrors.location}
                  margin="normal"
                  placeholder="e.g., 123 Main St, City, State or GPS Coordinates"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Start Time *"
                  value={formData.startTime}
                  onChange={(newTime) => handleFormChange('startTime', newTime)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!formErrors.startTime}
                      helperText={formErrors.startTime}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="End Time *"
                  value={formData.endTime}
                  onChange={(newTime) => handleFormChange('endTime', newTime)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!formErrors.endTime}
                      helperText={formErrors.endTime}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Flight Purpose *</InputLabel>
                  <Select
                    value={formData.purpose}
                    onChange={(e) => handleFormChange('purpose', e.target.value)}
                    label="Flight Purpose *"
                  >
                    <MenuItem value="Inspection">Inspection</MenuItem>
                    <MenuItem value="Mapping/Survey">Mapping/Survey</MenuItem>
                    <MenuItem value="Photography">Photography</MenuItem>
                    <MenuItem value="Videography">Videography</MenuItem>
                    <MenuItem value="Training">Training</MenuItem>
                    <MenuItem value="Recreation">Recreation</MenuItem>
                    <MenuItem value="Delivery">Delivery</MenuItem>
                    <MenuItem value="Emergency Response">Emergency Response</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Weather Conditions *</InputLabel>
                  <Select
                    value={formData.weatherConditions}
                    onChange={(e) => handleFormChange('weatherConditions', e.target.value)}
                    label="Weather Conditions *"
                  >
                    <MenuItem value="Clear">Clear</MenuItem>
                    <MenuItem value="Partly Cloudy">Partly Cloudy</MenuItem>
                    <MenuItem value="Cloudy">Cloudy</MenuItem>
                    <MenuItem value="Light Rain">Light Rain</MenuItem>
                    <MenuItem value="Heavy Rain">Heavy Rain</MenuItem>
                    <MenuItem value="Snow">Snow</MenuItem>
                    <MenuItem value="Fog">Fog</MenuItem>
                    <MenuItem value="Windy">Windy</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Battery Start Level (%)"
                  type="number"
                  fullWidth
                  value={formData.batteryLevels.start}
                  onChange={(e) => handleFormChange('batteryLevels.start', parseInt(e.target.value))}
                  error={!!formErrors['batteryLevels.start']}
                  helperText={formErrors['batteryLevels.start']}
                  margin="normal"
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Battery End Level (%)"
                  type="number"
                  fullWidth
                  value={formData.batteryLevels.end}
                  onChange={(e) => handleFormChange('batteryLevels.end', parseInt(e.target.value))}
                  error={!!formErrors['batteryLevels.end']}
                  helperText={formErrors['batteryLevels.end']}
                  margin="normal"
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Max Altitude (ft)"
                  type="number"
                  fullWidth
                  value={formData.maxAltitude || ''}
                  onChange={(e) => handleFormChange('maxAltitude', parseInt(e.target.value))}
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Max Distance (ft)"
                  type="number"
                  fullWidth
                  value={formData.maxDistance || ''}
                  onChange={(e) => handleFormChange('maxDistance', parseInt(e.target.value))}
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Incidents/Issues"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.incidents || ''}
                  onChange={(e) => handleFormChange('incidents', e.target.value)}
                  margin="normal"
                  placeholder="Any issues or incidents during flight"
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
                  placeholder="Additional notes about the flight"
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={isAddDialogOpen ? handleSaveNewLog : handleUpdateLog}
          >
            {isAddDialogOpen ? 'Save Log' : 'Update Log'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the flight log for {selectedLog?.droneName} on {selectedLog ? formatDate(selectedLog.date) : ''}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteLog}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Flight Log Dialog */}
      <Dialog open={isViewDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Flight Log Details
            </Typography>
            <IconButton onClick={handleCloseDialogs} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedLog.date)}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pilot
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.pilot}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Drone
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.droneName}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.location}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Flight Time
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(selectedLog.startTime)} - {formatTime(selectedLog.endTime)} ({selectedLog.duration} min)
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Purpose
                  </Typography>
                  <Chip 
                    label={selectedLog.purpose} 
                    size="small" 
                    color={getPurposeColor(selectedLog.purpose)}
                  />
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Weather Conditions
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.weatherConditions}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Battery Levels
                  </Typography>
                  <Typography variant="body1">
                    Start: {selectedLog.batteryLevels.start}% → End: {selectedLog.batteryLevels.end}%
                  </Typography>
                </Stack>
              </Grid>
              
              {(selectedLog.maxAltitude || selectedLog.maxDistance) && (
                <>
                  {selectedLog.maxAltitude && (
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Max Altitude
                        </Typography>
                        <Typography variant="body1">
                          {selectedLog.maxAltitude} ft
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                  
                  {selectedLog.maxDistance && (
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Max Distance
                        </Typography>
                        <Typography variant="body1">
                          {selectedLog.maxDistance} ft
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                </>
              )}
              
              {selectedLog.incidents && (
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Incidents/Issues
                    </Typography>
                    <Typography variant="body1">
                      {selectedLog.incidents}
                    </Typography>
                  </Stack>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.notes || 'No notes provided'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Close</Button>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={() => {
              handleCloseDialogs();
              if (selectedLog) {
                handleOpenEditDialog(selectedLog);
              }
            }}
          >
            Edit Log
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlightLogSystem; 