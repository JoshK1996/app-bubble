import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Flight as FlightIcon,
  Business as BusinessIcon,
  Assignment as TaskIcon,
  CloudQueue as WeatherIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Map as MapIcon,
  ArrowBack as BackIcon,
  PictureAsPdf as PdfIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import WeatherIntegration from '../Missions/WeatherIntegration';
import { WeatherData } from '../../services/WeatherService';
import MissionLocationMap from './MissionLocationMap';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface MissionDetailsProps {
  mission: {
    id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    client: string;
    clientId: number;
    pilot: string;
    pilotId: number;
    equipment: string[];
    notes: string;
    tasks: string[];
    status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
    coordinates?: {
      lat: number;
      lon: number;
    };
    weatherData?: WeatherData;
    checklistCompleted?: boolean;
  };
  onBack: () => void;
  onEdit?: (id: string) => void;
}

const MissionDetails: React.FC<MissionDetailsProps> = ({
  mission,
  onBack,
  onEdit
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [weatherData, setWeatherData] = useState<WeatherData | undefined>(mission.weatherData);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(false);
  
  // Format the mission date to a readable string
  const formattedDate = mission.date ? format(new Date(mission.date), 'MMMM dd, yyyy') : '';
  
  // Calculate mission's date and time for weather planning
  const getMissionDateTime = (): Date | undefined => {
    if (mission.date && mission.startTime) {
      const [year, month, day] = mission.date.split('-').map(Number);
      const [hours, minutes] = mission.startTime.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }
    return undefined;
  };
  
  // Handle weather update from the WeatherIntegration component
  const handleWeatherUpdate = (data: WeatherData) => {
    setWeatherData(data);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Export mission details to PDF
  const exportToPdf = async () => {
    try {
      const detailsElement = document.getElementById('mission-details');
      if (!detailsElement) return;
      
      const canvas = await html2canvas(detailsElement);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
      });
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(0, 51, 102); // Navy blue
      pdf.text(`Mission: ${mission.title}`, 20, 20);
      
      // Add status
      pdf.setFontSize(12);
      const statusColor = 
        mission.status === 'Completed' ? [0, 128, 0] : // green
        mission.status === 'In Progress' ? [0, 102, 204] : // blue
        mission.status === 'Cancelled' ? [204, 0, 0] : // red
        [128, 128, 128]; // grey
      
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(`Status: ${mission.status}`, 20, 30);
      
      // Add screenshot of details
      const imgWidth = 170;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
      
      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, 285);
      pdf.text('Drone Business Manager - Mission Report', 20, 290);
      
      // Save PDF
      pdf.save(`mission_${mission.id}_${mission.title.replace(/\s+/g, '_')}.pdf`);
      
      setExportDialogOpen(false);
      setExportSuccess(true);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setExportError(true);
      setExportDialogOpen(false);
    }
  };
  
  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button 
            startIcon={<BackIcon />} 
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            {mission.title}
          </Typography>
          <Chip 
            label={mission.status} 
            color={
              mission.status === 'Completed' ? 'success' :
              mission.status === 'In Progress' ? 'primary' :
              mission.status === 'Cancelled' ? 'error' :
              'default'
            }
            sx={{ ml: 2 }}
          />
        </Box>
        <Box>
          {onEdit && (
            <Button 
              variant="outlined" 
              onClick={() => onEdit(mission.id)}
              sx={{ mr: 1 }}
            >
              Edit Mission
            </Button>
          )}
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<PdfIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Mission description */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1">
          {mission.description}
        </Typography>
      </Paper>
      
      {/* Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Details" />
        <Tab label="Weather" />
        <Tab label="Location" />
      </Tabs>
      
      {/* Tab Content */}
      <Box id="mission-details">
        {/* Details Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Mission Details */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Mission Details
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Date" 
                        secondary={formattedDate} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Time" 
                        secondary={`${mission.startTime} - ${mission.endTime}`} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Location" 
                        secondary={mission.location} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Client" 
                        secondary={mission.client} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Pilot" 
                        secondary={mission.pilot} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <FlightIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Equipment" 
                        secondary={mission.equipment.join(', ')} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Tasks & Notes */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Mission Tasks
                  </Typography>
                  
                  <List dense>
                    {mission.tasks.map((task, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TaskIcon />
                        </ListItemIcon>
                        <ListItemText primary={task} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
              
              {mission.notes && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {mission.notes}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
            
            {/* Checklist Status */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: mission.checklistCompleted ? 'success.main' : 'warning.main',
                    mr: 2
                  }}
                >
                  {mission.checklistCompleted ? <CheckIcon /> : <WarningIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Pre-Flight Checklist
                  </Typography>
                  <Typography variant="body2">
                    {mission.checklistCompleted 
                      ? 'Completed and ready for operation' 
                      : 'Not completed - needs review before flight'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Weather Tab */}
        {tabValue === 1 && (
          <Box>
            <WeatherIntegration 
              location={mission.location}
              plannedDateTime={getMissionDateTime()}
              onWeatherUpdate={handleWeatherUpdate}
            />
            
            {weatherData?.flightSafetyAssessment && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Flight Safety Summary
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Recommendation
                      </Typography>
                      <Chip 
                        label={weatherData.flightSafetyAssessment.recommendation}
                        color={
                          weatherData.flightSafetyAssessment.recommendation === 'Go' ? 'success' :
                          weatherData.flightSafetyAssessment.recommendation === 'Caution' ? 'warning' :
                          'error'
                        }
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Wind Status
                      </Typography>
                      <Chip 
                        label={weatherData.flightSafetyAssessment.windStatus}
                        color={
                          weatherData.flightSafetyAssessment.windStatus === 'Calm' ? 'success' :
                          weatherData.flightSafetyAssessment.windStatus === 'Moderate' ? 'success' :
                          weatherData.flightSafetyAssessment.windStatus === 'High' ? 'warning' :
                          'error'
                        }
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Visibility
                      </Typography>
                      <Chip 
                        label={weatherData.flightSafetyAssessment.visibilityStatus}
                        color={
                          weatherData.flightSafetyAssessment.visibilityStatus === 'Good' ? 'success' :
                          weatherData.flightSafetyAssessment.visibilityStatus === 'Moderate' ? 'warning' :
                          'error'
                        }
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Max Altitude
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {weatherData.flightSafetyAssessment.recommendedMaxAltitude} ft
                      </Typography>
                    </Grid>
                    
                    {weatherData.flightSafetyAssessment.warnings.length > 0 && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Weather Warnings
                        </Typography>
                        
                        {weatherData.flightSafetyAssessment.warnings.map((warning, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 1, 
                              p: 1,
                              bgcolor: 
                                warning.severity === 'High' ? 'error.light' :
                                warning.severity === 'Medium' ? 'warning.light' :
                                'info.light',
                              borderRadius: 1
                            }}
                          >
                            <WarningIcon 
                              fontSize="small" 
                              color={
                                warning.severity === 'High' ? 'error' :
                                warning.severity === 'Medium' ? 'warning' :
                                'info'
                              } 
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2">
                              {warning.message}
                            </Typography>
                          </Box>
                        ))}
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Box>
            )}
          </Box>
        )}
        
        {/* Location Tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Mission Location
            </Typography>
            
            {mission.coordinates ? (
              <Box height={400}>
                <MissionLocationMap 
                  initialLocations={[{
                    id: '1',
                    name: mission.title,
                    description: mission.location,
                    type: 'mission',
                    position: [
                      mission.coordinates.lat,
                      mission.coordinates.lon
                    ]
                  }]}
                />
              </Box>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>
                  No location coordinates specified for this mission.
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Box>
      
      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      >
        <DialogTitle>Export Mission Details</DialogTitle>
        <DialogContent>
          <Typography>
            This will generate a professionally formatted PDF document with all mission details.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The PDF will include:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Mission details and status" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Client and pilot information" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Equipment list and tasks" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Formatted with your company branding" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={exportToPdf} 
            variant="contained" 
            startIcon={<PdfIcon />}
          >
            Export to PDF
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={exportSuccess} 
        autoHideDuration={6000} 
        onClose={() => setExportSuccess(false)}
      >
        <Alert 
          onClose={() => setExportSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Mission details exported successfully!
        </Alert>
      </Snackbar>
      
      {/* Error Snackbar */}
      <Snackbar 
        open={exportError} 
        autoHideDuration={6000} 
        onClose={() => setExportError(false)}
      >
        <Alert 
          onClose={() => setExportError(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          Failed to export mission details. Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MissionDetails; 