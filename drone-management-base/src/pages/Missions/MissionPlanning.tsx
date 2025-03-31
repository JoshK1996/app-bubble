import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useTheme,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormHelperText,
  Container,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  ListItemIcon,
  Autocomplete,
  Checkbox,
  Snackbar,
  FormControlLabel,
  LinearProgress
} from '@mui/material';
import { 
  PinDrop as LocationIcon,
  FlightTakeoff as FlightIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarMonth as CalendarIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Devices as EquipmentIcon,
  BatteryFull as BatteryIcon,
  FilePresent as FileIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Remove as RemoveIcon,
  ExpandLess as ExpandLessIcon,
  PictureAsPdf as PdfIcon,
  Map as MapIcon,
  CloudQueue as WeatherIcon,
  Thermostat as ThermostatIcon,
  AddCircleOutline as AddCircleOutlineIcon
} from '@mui/icons-material';
import WeatherIntegration from '../../components/Missions/WeatherIntegration';
import { FlightSuitability, CurrentWeather, WeatherForecast, assessFlightSuitability } from '../../utils/weatherApi';
import { MapLocation } from '../../types/mapTypes';
import { MissionFormData, MissionTask, MissionStatus, ChecklistItem } from '../../types/missionTypes';
import { Client, createMockClients } from '../../types/clientTypes';
import { Pilot, createMockPilots } from '../../types/pilotTypes';
import { Equipment, createMockEquipment } from '../../types/equipmentTypes';
import WeatherService, { WeatherData, CurrentConditions, ForecastData } from '../../services/WeatherService';
import { LatLngExpression } from 'leaflet';

// Import domain-specific components
import MissionLocationMap from '../../components/Missions/MissionLocationMap';
import FlightPathPlanner from '../../components/Missions/FlightPathPlanner';
import PreFlightChecklist from '../../components/Missions/PreFlightChecklist';

// Types
interface MissionPlanningProps {
  initialMission?: Partial<MissionFormData>;
  onSave: (missionData: MissionFormData) => void;
  onClose?: () => void;
}

interface PdfExportOptions {
  includeMap: boolean;
  includeWeather: boolean;
}

// Helper functions to map FlightSuitability enum
const mapFlightSuitabilityToLabel = (suitability?: FlightSuitability): string => {
  if (!suitability) return 'Unknown';
  switch (suitability) {
    case FlightSuitability.OPTIMAL: return 'Optimal';
    case FlightSuitability.ACCEPTABLE: return 'Acceptable';
    case FlightSuitability.CAUTION: return 'Caution';
    case FlightSuitability.UNSAFE: return 'Unsafe';
    case FlightSuitability.DANGEROUS: return 'Dangerous';
    default: return 'Unknown';
  }
};

const mapFlightSuitabilityToColor = (suitability?: FlightSuitability): 'success' | 'warning' | 'error' | 'default' => {
  if (!suitability) return 'default';
  switch (suitability) {
    case FlightSuitability.OPTIMAL:
    case FlightSuitability.ACCEPTABLE:
      return 'success';
    case FlightSuitability.CAUTION:
      return 'warning';
    case FlightSuitability.UNSAFE:
    case FlightSuitability.DANGEROUS:
      return 'error';
    default:
      return 'default';
  }
};

const mapFlightSuitabilityToSeverity = (suitability?: FlightSuitability): 'success' | 'warning' | 'error' | 'info' => {
    if (!suitability) return 'info';
    switch (suitability) {
        case FlightSuitability.OPTIMAL:
        case FlightSuitability.ACCEPTABLE:
            return 'success';
        case FlightSuitability.CAUTION:
            return 'warning';
        case FlightSuitability.UNSAFE:
        case FlightSuitability.DANGEROUS:
            return 'error';
        default:
            return 'info';
    }
};

// Sample data - Use mock creators
const clients = createMockClients(5);
const pilots = createMockPilots(4);

// Helper function to create a mock MissionTask (replace with actual logic if needed)
const createMockTask = (text: string): MissionTask => ({
    id: `task-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`,
    text: text,
    completed: false,
    priority: 'Medium',
});

// Map recommendation string back to FlightSuitability enum
const mapRecommendationToSuitability = (recommendation: 'Go' | 'No-Go' | 'Caution'): FlightSuitability => {
  switch (recommendation) {
    case 'Go': return FlightSuitability.ACCEPTABLE; // Or OPTIMAL if you prefer
    case 'Caution': return FlightSuitability.CAUTION;
    case 'No-Go': return FlightSuitability.UNSAFE; // Or DANGEROUS
    default: return FlightSuitability.UNSAFE; // Default fallback
  }
};

/**
 * Mission Planning page component
 */
const MissionPlanning: React.FC<MissionPlanningProps> = ({ initialMission, onSave, onClose }) => {
  const theme = useTheme();
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [missionData, setMissionData] = useState<Partial<MissionFormData>>(initialMission || {});
  const [tasks, setTasks] = useState<MissionTask[]>((initialMission?.tasks?.map(t => 
    (typeof t === 'object' && t !== null && 'id' in t && 'text' in t) ? t : createMockTask(String(t))
  )) ?? []);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    missionData.client || (initialMission?.client ? createMockClients(5).find(c => c.id === (initialMission.client as any)?.id) || null : null) 
  );
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(
    missionData.pilot || (initialMission?.pilot ? createMockPilots(4).find((p: Pilot) => p.id === (initialMission.pilot as any)?.id) || null : null)
  );
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>(
    missionData.equipment || 
    (initialMission?.equipment?.map(eqOrId => { 
        if (typeof eqOrId === 'string') {
            return createMockEquipment(10).find((e: Equipment) => e.id === eqOrId); 
        } else if (typeof eqOrId === 'object' && eqOrId !== null && 'id' in eqOrId && typeof eqOrId.id === 'string') {
            return eqOrId as Equipment; 
        }
        return undefined;
    }).filter(Boolean) as Equipment[]) || []
  );
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(missionData.location || initialMission?.location || null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<PdfExportOptions>({ includeMap: true, includeWeather: true });
  const [exportStatus, setExportStatus] = useState<{ isGeneratingPdf: boolean; progress: number; status: string }>({
    isGeneratingPdf: false,
    progress: 0,
    status: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Steps for the stepper
  const steps = ['Basic Info', 'Location & Map', 'Weather', 'Flight Path Planning', 'Pre-Flight Checklist', 'Review'];
  
  // Calculate the mission date and time for weather planning
  const getMissionDateTime = (): Date | undefined => {
    if (missionData.date && missionData.startTime) {
      const [year, month, day] = missionData.date.split('-').map(Number);
      const [hours, minutes] = missionData.startTime.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }
    return undefined;
  };
  
  // Handle form input changes (for standard text fields)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setMissionData((prev: Partial<MissionFormData>) => ({ ...prev, [name]: value }));
  };

  // UPDATED: Handle Autocomplete changes (signature matches Autocomplete onChange)
  const handleAutocompleteChange = (fieldName: keyof MissionFormData) => 
    (event: React.SyntheticEvent, newValue: any) => { // Correct signature
      setMissionData((prev: Partial<MissionFormData>) => ({ ...prev, [fieldName]: newValue }));
      // Update specific selected state if needed
      if (fieldName === 'client') setSelectedClient(newValue as Client | null);
      if (fieldName === 'pilot') setSelectedPilot(newValue as Pilot | null);
      if (fieldName === 'equipment') setSelectedEquipment(newValue as Equipment[]); // Note: for multi-select, newValue is an array
      setErrors(prev => ({ ...prev, [fieldName]: null })); 
  };
  
  // UPDATED: Handle location selection 
  const handleLocationSelected = (location: MapLocation) => { 
    setSelectedLocation(location);
    setMissionData((prev: Partial<MissionFormData>) => ({
      ...prev,
      location: location, 
      // Use position[0] and position[1] for coordinates
      coordinates: location.position ? { lat: location.position[0], lon: location.position[1] } : prev.coordinates,
    }));
    setErrors(prev => ({ ...prev, location: null })); 
  };

  // UPDATED: Handle main mission location change (simplified and corrected)
  const handleMainLocationChange = (location: MapLocation) => { 
    setMissionData((prev: Partial<MissionFormData>) => ({
      ...prev,
      mainLocation: location,
      // Use position[0] and position[1] for coordinates, avoid duplicate 'location' key
      coordinates: location.position ? { lat: location.position[0], lon: location.position[1] } : prev.coordinates,
    }));
  };
  
  // Handle weather update - Construct CurrentWeather and WeatherForecast correctly
  const handleWeatherUpdate = (weatherData: WeatherData) => {
    // Calculate suitability ONCE from the incoming data
    const finalSuitability = mapRecommendationToSuitability(weatherData.flightSafetyAssessment.recommendation);
    
    const currentConditions = weatherData.currentConditions;

    // Create the 'current' object matching the CurrentWeather type
    const currentWeatherData: CurrentWeather = {
      temperature: currentConditions.temperature,
      feelsLike: currentConditions.temperature, 
      humidity: currentConditions.humidity,
      windSpeed: currentConditions.windSpeed,
      windDirection: 0, // Assuming number type needed, adjust if necessary
      conditions: currentConditions.conditions,
      icon: currentConditions.icon,
      visibility: currentConditions.visibility,
      // Use the calculated suitability enum
      flightSuitability: finalSuitability, 
      precipitation: currentConditions.precipitation
    };
    
    // Map ForecastData[] to WeatherForecast[]
    const mappedForecast: WeatherForecast[] = weatherData.forecast.map(item => ({
        date: item.time.toISOString(), 
        temperature: item.temperature,
        feelsLike: item.temperature, 
        humidity: 50, // Default value
        windSpeed: item.windSpeed,
        windDirection: 0, // Default value
        conditions: item.conditions,
        icon: item.icon,
        precipitation: item.precipitation,
        visibility: item.visibility,
        flightSuitability: assessFlightSuitability(item.windSpeed, item.visibility, item.conditions) 
    }));

    setMissionData((prev: Partial<MissionFormData>) => ({
      ...prev,
      weatherData: {
        current: currentWeatherData, 
        forecast: mappedForecast 
      },
      // Use the calculated suitability enum
      flightSafety: finalSuitability 
    }));

    // Set weather warning based ONLY on the final suitability enum
    let warningMessage: string | null = null;
    if (finalSuitability === FlightSuitability.CAUTION) {
        warningMessage = 'Weather conditions require caution. Review details carefully.';
    } else if (finalSuitability === FlightSuitability.UNSAFE || finalSuitability === FlightSuitability.DANGEROUS) {
        warningMessage = 'Weather conditions are unsafe or dangerous for flight.';
    } 
    
    // Update errors state - only set weatherWarning
    setErrors(prev => ({ ...prev, weatherWarning: warningMessage }));
  };
  
  // Handle checklist completion
  const handleChecklistComplete = (completed: boolean, items: ChecklistItem[]) => {
    setMissionData((prev: Partial<MissionFormData>) => ({
      ...prev,
      checklist: items,
      checklistCompleted: completed
    }));
  };
  
  // Validate current step
  const validateStep = (stepIndex: number): boolean => {
    let isValid = true;
    const newErrors: Record<string, string | null> = {};

    switch (stepIndex) {
      case 0: // Basic Info
        if (!missionData.title?.trim()) { newErrors.title = 'Title is required'; isValid = false; }
        if (!missionData.date) { newErrors.date = 'Date is required'; isValid = false; }
        if (!missionData.startTime) { newErrors.startTime = 'Start time is required'; isValid = false; }
        if (!missionData.endTime) { newErrors.endTime = 'End time is required'; isValid = false; }
        break;
      case 1: // Location & Map
        if (!missionData.mainLocation) { newErrors.location = 'Primary mission location is required. Please add a location of type "Mission Site".'; isValid = false; }
        break;
      case 2: // Weather
        if (!missionData.location) { newErrors.location = 'Weather location is required'; isValid = false; }
        break;
      case 3: // Flight Path Planning
        if (!missionData.flightPath || missionData.flightPath.length < 2) { newErrors.flightPath = 'Flight path must have at least two points'; isValid = false; }
        break;
      case 4: // Pre-Flight Checklist
        if (!missionData.checklistCompleted) {
          newErrors.checklist = 'Please complete all required checklist items';
          isValid = false;
        }
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmitMission = useCallback(async () => {
    setLoading(true);
    setErrors({}); // Clear previous errors

    // Basic Validation (example)
    let formErrors: Partial<Record<keyof MissionFormData, string>> = {};
    if (!missionData.title) formErrors.title = 'Mission title is required';
    if (!selectedClient) formErrors.client = 'Client selection is required';
    if (!selectedPilot) formErrors.pilot = 'Pilot assignment is required';
    if (selectedEquipment.length === 0) formErrors.equipment = 'At least one equipment item must be selected';
    if (!missionData.location) formErrors.location = 'Mission location is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    // Construct the final payload adhering to MissionFormData
    const missionPayload: MissionFormData = {
      // Base fields
      id: missionData.id || `mission-${Date.now()}`,
      title: missionData.title || '',
      description: missionData.description || '',
      date: missionData.date || new Date().toISOString().split('T')[0],
      startTime: missionData.startTime || '',
      endTime: missionData.endTime || '',
      location: missionData.location!, // Asserted as validated
      client: selectedClient!, // Asserted as validated
      pilot: selectedPilot!,   // Asserted as validated
      equipment: selectedEquipment, // Already array
      notes: missionData.notes || '',
      tasks: tasks, // Use state tasks
      // Optional fields from missionData, ensuring they exist in the type
      coordinates: missionData.coordinates,
      weatherData: missionData.weatherData,
      flightSafety: missionData.flightSafety,
      mapLocations: missionData.mapLocations || [],
      mainLocation: missionData.mainLocation,
      flightPath: missionData.flightPath || [],
      status: missionData.status || MissionStatus.PLANNED, // Corrected casing
      attachments: missionData.attachments || [],
      riskAssessmentCompleted: missionData.riskAssessmentCompleted || false,
      checklistItems: missionData.checklistItems || [], 
      checklistCompleted: missionData.checklistCompleted || false, 
      waypoints: missionData.waypoints || [],
    };

    try {
      await onSave(missionPayload);
      setLoading(false);
    } catch (error) { 
      console.error("Error saving mission:", error);
      setErrors(prev => ({ ...prev, form: 'Failed to save mission. Please try again.' }));
      setLoading(false);
    }
  }, [missionData, selectedClient, selectedPilot, selectedEquipment, tasks, onSave]);
  
  // Handle when flight path changes - assume incoming waypoints are MapLocation-like
  // Store both the raw path and the waypoint objects if possible
  const handleFlightPathChange = (incomingWaypoints: MapLocation[]) => { // Type the parameter
    setMissionData((prev: Partial<MissionFormData>) => ({
      ...prev,
      // Extract positions for the flightPath
      flightPath: incomingWaypoints.map(wp => wp.position as LatLngExpression),
      // Store the full waypoint objects as well
      waypoints: incomingWaypoints 
    }));
  };
  
  // Handle PDF export
  const handleExportPdf = useCallback(async (options: PdfExportOptions) => {
    setExportStatus({ isGeneratingPdf: true, progress: 0, status: 'Starting export...' });
    try {
      // Simulate PDF generation
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 150)); // Simulate work
        setExportStatus(prev => ({ ...prev, progress: i, status: `Generating section ${i/10 + 1}...` }));
      }
      
      console.log("PDF Export Options:", options);
      // Actual PDF generation logic would go here
      
      setExportStatus({ isGeneratingPdf: false, progress: 100, status: 'Export Complete' }); // Removed 'success' property
      // Show success message or trigger download
      
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setExportStatus({ isGeneratingPdf: false, progress: 0, status: 'Export Failed' });
      // Show error message
    }
  }, []);
  
  // Define handleChecklistChange to match onSave prop signature
  const handleChecklistChange = (updatedChecklist: ChecklistItem[]) => {
    setMissionData(prev => ({
      ...prev,
      checklistItems: updatedChecklist 
    }));
  };
  
  // Render the content for each step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Basic Info
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Mission Title"
                value={missionData.title}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={missionData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="date"
                label="Date"
                type="date"
                value={missionData.date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.date}
                helperText={errors.date}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="startTime"
                label="Start Time"
                type="time"
                value={missionData.startTime}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.startTime}
                helperText={errors.startTime}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="endTime"
                label="End Time"
                type="time"
                value={missionData.endTime}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.endTime}
                helperText={errors.endTime}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Mission Tasks
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="New Task"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  fullWidth
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAddTask}
                  disabled={!newTaskName.trim()}
                  startIcon={<AddIcon />}
                >
                  Add Task
                </Button>
              </Box>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <Chip
                      key={index}
                      label={task.text}
                      onDelete={() => handleRemoveTask(index)}
                      sx={{ m: 0.5 }}
                    />
                  ))
                ) : (
                  <Typography color="textSecondary">
                    No tasks added yet.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        );
      
      case 1: // Team & Equipment
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={createMockClients(5)} 
                getOptionLabel={(option) => option.name}
                value={selectedClient}
                onChange={handleAutocompleteChange('client')} 
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => <TextField {...params} label="Select Client" required error={!!errors.client} helperText={errors.client} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={createMockPilots(3)} 
                getOptionLabel={(option) => option.name}
                value={selectedPilot}
                onChange={handleAutocompleteChange('pilot')} 
                 isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => <TextField {...params} label="Assign Pilot" required error={!!errors.pilot} helperText={errors.pilot} />}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={createMockEquipment(10)} 
                getOptionLabel={(option) => `${option.name} (${option.type})`}
                value={selectedEquipment}
                onChange={handleAutocompleteChange('equipment')}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => <TextField {...params} label="Select Equipment" required error={!!errors.equipment} helperText={errors.equipment} />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option.name} {...getTagProps({ index })} />
                  ))
                }
              />
            </Grid>
          </Grid>
        );
        
      case 2: // Weather
        return (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Weather Conditions & Flight Safety
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="body1" paragraph>
                View current weather conditions and forecasts for your mission location. The system will provide flight safety recommendations based on weather data.
              </Typography>
              
              {errors.weatherWarning && (
                <Alert 
                  severity={missionData.flightSafety === FlightSuitability.UNSAFE || missionData.flightSafety === FlightSuitability.DANGEROUS ? 'error' : 'warning'} 
                  sx={{ mb: 2 }}
                  icon={<WarningIcon />}
                >
                  {errors.weatherWarning}
                </Alert>
              )}
              
              <Box mt={3}>
                <WeatherIntegration 
                  location={missionData.location?.name || ''}
                  onWeatherUpdate={handleWeatherUpdate}
                  plannedDateTime={getMissionDateTime()}
                />
              </Box>
            </Paper>
          </Box>
        );
      
      case 3: // Flight Path Planning
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Flight Path Planning</Typography>
              <FlightPathPlanner
                 missionLocation={missionData.mainLocation}
                 onFlightPathChange={handleFlightPathChange}
                 initialWaypoints={[]}
               />
            </Grid>
            {/* ... Rest of Step 3 ... */}
          </Grid>
        );
      
      case 4: // Pre-Flight Checklist
        return (
          <PreFlightChecklist 
            missionId={missionData.id}
            missionType="Standard"
            weatherData={missionData.weatherData?.current}
            onSave={handleChecklistChange}
          />
        );
      
      case 5: // Review
        return (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Review Mission Details
            </Typography>
            
            <Grid container spacing={3}>
              {/* Basic Mission Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Mission Details</Typography>
                    <Typography variant="body2">
                      <strong>Title:</strong> {missionData.title}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Description:</strong> {missionData.description}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {missionData.date}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {missionData.startTime} - {missionData.endTime}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {missionData.location?.name ?? 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Assignment Info */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Assignments</Typography>
                    <Typography variant="body2">
                      <strong>Client:</strong> {selectedClient?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Pilot:</strong> {selectedPilot?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Equipment:</strong>
                    </Typography>
                    <Box ml={2}>
                      {selectedEquipment.map((eq, index) => (
                        <Typography key={index} variant="body2">• {eq.name}</Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tasks */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Mission Tasks</Typography>
                    {tasks.map((task, index) => (
                      <Typography key={index} variant="body2">
                        {index + 1}. {task.text}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Notes */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Notes</Typography>
                    <Typography variant="body2">
                      {missionData.notes || 'No additional notes.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Checklist Status */}
              <Grid item xs={12}>
                <Alert severity={missionData.checklistCompleted ? "success" : "warning"}>
                  <strong>Pre-Flight Checklist:</strong> {missionData.checklistCompleted ? "Completed" : "Not Completed"}
                </Alert>
              </Grid>

              {/* Weather Review Section */}
              {missionData.weatherData && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Weather & Flight Safety
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Flight Recommendation:
                          </Typography>
                          <Chip 
                            label={missionData.flightSafety || 'Unknown'} 
                            color={
                              missionData.flightSafety === FlightSuitability.OPTIMAL || missionData.flightSafety === FlightSuitability.ACCEPTABLE ? 'success' :
                              missionData.flightSafety === FlightSuitability.CAUTION ? 'warning' :
                              missionData.flightSafety === FlightSuitability.UNSAFE || missionData.flightSafety === FlightSuitability.DANGEROUS ? 'error' :
                              'default'
                            }
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Current Conditions:
                          </Typography>
                          <Typography variant="body1">
                            {missionData.weatherData.current.temperature}°C, {' '}
                            {missionData.weatherData.current.conditions}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Wind:
                          </Typography>
                          <Typography variant="body1">
                            {missionData.weatherData.current.windSpeed} m/s {missionData.weatherData.current.windDirection}°
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Visibility:
                          </Typography>
                          <Typography variant="body1">
                            {(missionData.weatherData.current.visibility / 1000).toFixed(1)} km
                          </Typography>
                        </Grid>
                        
                        {missionData.flightSafety && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Flight Suitability: {missionData.flightSafety}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
            
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitMission}
              >
                Submit Mission
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  // Define missing task handlers
  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    const newTask = createMockTask(newTaskName);
    setTasks(prev => [...prev, newTask]);
    setMissionData(prev => ({ ...prev, tasks: [...(prev.tasks || []), newTask]}));
    setNewTaskName('');
  };

  const handleRemoveTask = (indexToRemove: number) => {
    const updatedTasks = tasks.filter((_, index) => index !== indexToRemove);
    setTasks(updatedTasks);
    setMissionData(prev => ({ ...prev, tasks: updatedTasks }));
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Mission Planning
        </Typography>
        {activeStep === steps.length ? (
          <Box>
            <Tooltip title="Export Mission Plan as PDF">
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={() => handleExportPdf(pdfOptions)}
                sx={{ mr: 1 }}
              >
                Export PDF
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitMission}
            >
              Save Mission
            </Button>
          </Box>
        ) : null}
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Please correct the following issues:
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '24px' }}>
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h6" gutterBottom>
                Mission planning completed
              </Typography>
              <Typography color="textSecondary" paragraph>
                You have successfully planned your mission. You can now save the mission or make changes if needed.
              </Typography>
              <Button 
                onClick={handleBack} 
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSubmitMission}
              >
                Save Mission
              </Button>
            </Box>
          ) : (
            <>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* PDF Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>PDF Export Options</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Generate a professionally formatted PDF of your mission plan that includes:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Mission details and scheduling information" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Client and pilot assignments" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Equipment list and task breakdown" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Weather conditions and flight safety assessment" />
            </ListItem>
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The PDF can be shared with team members or clients, or used as a printable briefing document.
          </Typography>
          
          {exportStatus.isGeneratingPdf && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={exportStatus.progress} />
              <Typography variant="caption" display="block" gutterBottom align="center">
                {exportStatus.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} disabled={exportStatus.isGeneratingPdf}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => { 
                handleExportPdf(pdfOptions); 
            }} 
            disabled={exportStatus.isGeneratingPdf}
            startIcon={exportStatus.isGeneratingPdf ? <CircularProgress size={20} /> : <PdfIcon />}
          >
            {exportStatus.isGeneratingPdf ? 'Generating...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MissionPlanning; 