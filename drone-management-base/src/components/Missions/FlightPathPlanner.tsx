import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  SelectChangeEvent,
  Grid
} from '@mui/material';
import {
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandIcon,
  AddLocation as AddWaypointIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Straighten as MeasureIcon,
  Speed as SpeedIcon,
  Timer as DurationIcon,
  Map as MapIcon,
  Navigation as NavigationIcon,
  Route as RouteIcon
} from '@mui/icons-material';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMapEvents, 
  Circle,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import type { LatLng, LatLngTuple, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { v4 as uuidv4 } from 'uuid';
import { MapLocation } from '../../types/mapTypes';
import { useFlightPath } from '../../hooks/useFlightPath';

// Define custom marker icons
const takeoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const landingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const waypointIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Waypoint with additional properties for flight planning
interface Waypoint extends Omit<MapLocation, 'position'> {
  id: string;
  type: 'takeoff' | 'landing' | 'waypoint';
  altitude: number; // meters
  speed?: number; // m/s
  hoverTime?: number; // seconds
  action?: 'photo' | 'video' | 'survey' | 'none';
  position: [number, number]; // Latitude and longitude as tuple
}

// Flight path planner props
interface FlightPathPlannerProps {
  initialWaypoints?: Waypoint[];
  onFlightPathChange?: (waypoints: Waypoint[]) => void;
  missionLocation?: MapLocation;
  readOnly?: boolean;
}

// Function to calculate distance between two points in meters
const calculateDistance = (point1: L.LatLng, point2: L.LatLng): number => {
  return point1.distanceTo(point2);
};

// Function to calculate total flight path distance
const calculateTotalDistance = (waypoints: Waypoint[]): number => {
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = new L.LatLng(waypoints[i].position[0], waypoints[i].position[1]);
    const p2 = new L.LatLng(waypoints[i + 1].position[0], waypoints[i + 1].position[1]);
    totalDistance += calculateDistance(p1, p2);
  }
  return totalDistance;
};

// Function to convert LatLngExpression to tuple
const toLatLngTuple = (pos: LatLngTuple | LatLng): LatLngTuple => {
  if (Array.isArray(pos)) {
    return pos;
  }
  return [pos.lat, pos.lng];
};

// Function to estimate flight duration based on waypoints, speed, and hover times
const estimateFlightDuration = (waypoints: Waypoint[], defaultSpeed: number): number => {
  let totalDuration = 0; // seconds
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = new L.LatLng(waypoints[i].position[0], waypoints[i].position[1]);
    const p2 = new L.LatLng(waypoints[i + 1].position[0], waypoints[i + 1].position[1]);
    const distance = calculateDistance(p1, p2);
    const speed = waypoints[i].speed || defaultSpeed;
    const hoverTime = waypoints[i].hoverTime || 0;
    
    // Add travel time to next waypoint
    totalDuration += (distance / speed);
    // Add hover time
    totalDuration += hoverTime;
  }
  
  // Add hover time for the last waypoint
  if (waypoints.length > 0) {
    totalDuration += waypoints[waypoints.length - 1].hoverTime || 0;
  }
  
  return totalDuration;
};

// Map click handler component
const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
  disabled?: boolean;
}> = ({ onMapClick, disabled }) => {
  const map = useMapEvents({
    click: (e) => {
      if (!disabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  
  return null;
};

const FlightPathPlanner: React.FC<FlightPathPlannerProps> = ({
  initialWaypoints = [],
  onFlightPathChange,
  missionLocation,
  readOnly = false
}) => {
  const theme = useTheme();
  
  // Default center location if no mission location provided
  const defaultCenter: LatLngTuple = missionLocation ? 
    toLatLngTuple(missionLocation.position) : 
    [51.505, -0.09]; // London as default
  
  // State
  const [waypoints, setWaypoints] = useState<Waypoint[]>(initialWaypoints);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [editingWaypoint, setEditingWaypoint] = useState<Waypoint | null>(null);
  const [defaultFlightSpeed, setDefaultFlightSpeed] = useState<number>(5); // m/s
  const [defaultAltitude, setDefaultAltitude] = useState<number>(50); // meters
  const [pathType, setPathType] = useState<'linear' | 'grid' | 'circular'>('linear');
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(defaultCenter);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with takeoff and landing markers if empty
  useEffect(() => {
    if (initialWaypoints.length > 0) {
      setWaypoints(initialWaypoints);
    } else if (waypoints.length === 0 && missionLocation) {
      // If no waypoints, add a takeoff point at mission location
      const pos = missionLocation.position;
      const takeoff: Waypoint = {
        id: uuidv4(),
        name: 'Takeoff',
        type: 'takeoff',
        position: toLatLngTuple(pos),
        altitude: defaultAltitude,
        description: 'Takeoff location',
        speed: defaultFlightSpeed,
        hoverTime: 0,
        action: 'none'
      };
      setWaypoints([takeoff]);
    }
  }, [initialWaypoints, missionLocation]);
  
  // Update parent component when waypoints change
  useEffect(() => {
    if (onFlightPathChange) {
      onFlightPathChange(waypoints);
    }
  }, [waypoints, onFlightPathChange]);
  
  // Handle map click to add waypoint
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (readOnly) return;
    
    let waypointType: 'takeoff' | 'landing' | 'waypoint' = 'waypoint';
    let waypointName = `Waypoint ${waypoints.length + 1}`;
    
    // If no waypoints, add takeoff
    if (waypoints.length === 0) {
      waypointType = 'takeoff';
      waypointName = 'Takeoff';
    }
    
    const newWaypoint: Waypoint = {
      id: uuidv4(),
      name: waypointName,
      type: waypointType,
      position: toLatLngTuple([lat, lng]),
      altitude: defaultAltitude,
      description: '',
      speed: defaultFlightSpeed,
      hoverTime: 0,
      action: 'none'
    };
    
    setWaypoints([...waypoints, newWaypoint]);
    setSelectedWaypoint(newWaypoint);
  }, [waypoints, defaultAltitude, defaultFlightSpeed, readOnly]);
  
  // Handle waypoint selection
  const handleWaypointSelect = (waypoint: Waypoint) => {
    setSelectedWaypoint(waypoint);
    setEditingWaypoint(null);
  };
  
  // Handle adding a landing point
  const handleAddLanding = () => {
    if (waypoints.length === 0 || readOnly) return;
    
    // Check if landing already exists
    const landingExists = waypoints.some(w => w.type === 'landing');
    if (landingExists) {
      setError('A landing point already exists. Remove it before adding a new one.');
      return;
    }
    
    // If we have a takeoff, add landing at the same location by default
    const takeoff = waypoints.find(w => w.type === 'takeoff');
    let landingPosition: LatLngTuple = takeoff ? toLatLngTuple(takeoff.position) : waypoints[waypoints.length - 1].position;
    
    const landing: Waypoint = {
      id: uuidv4(),
      name: 'Landing',
      type: 'landing',
      position: landingPosition,
      altitude: defaultAltitude,
      description: 'Landing location',
      speed: defaultFlightSpeed,
      hoverTime: 0,
      action: 'none'
    };
    
    setWaypoints([...waypoints, landing]);
    setSelectedWaypoint(landing);
    setError(null);
  };
  
  // Handle removing a waypoint
  const handleRemoveWaypoint = (id: string) => {
    if (readOnly) return;
    
    const updatedWaypoints = waypoints.filter(w => w.id !== id);
    setWaypoints(updatedWaypoints);
    setSelectedWaypoint(null);
    setEditingWaypoint(null);
  };
  
  // Handle entering edit mode for a waypoint
  const handleEditWaypoint = (waypoint: Waypoint) => {
    if (readOnly) return;
    setEditingWaypoint({ ...waypoint });
  };
  
  // Handle saving waypoint edits
  const handleSaveWaypoint = () => {
    if (!editingWaypoint || readOnly) return;
    
    const updatedWaypoints = waypoints.map(w => 
      w.id === editingWaypoint.id ? editingWaypoint : w
    );
    
    setWaypoints(updatedWaypoints);
    setSelectedWaypoint(editingWaypoint);
    setEditingWaypoint(null);
  };
  
  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditingWaypoint(null);
  };
  
  // Handle change in editing waypoint fields
  const handleWaypointChange = (field: keyof Waypoint, value: any) => {
    if (!editingWaypoint || readOnly) return;
    
    setEditingWaypoint({
      ...editingWaypoint,
      [field]: value
    });
  };
  
  // Handle action change
  const handleActionChange = (event: SelectChangeEvent) => {
    if (!editingWaypoint || readOnly) return;
    
    const action = event.target.value as 'photo' | 'video' | 'survey' | 'none';
    
    // If selected action is not 'none', set a default hover time
    let hoverTime = editingWaypoint.hoverTime;
    if (action === 'photo' && (!hoverTime || hoverTime < 3)) {
      hoverTime = 3; // 3 seconds for photo
    } else if (action === 'video' && (!hoverTime || hoverTime < 10)) {
      hoverTime = 10; // 10 seconds for video
    } else if (action === 'survey' && (!hoverTime || hoverTime < 30)) {
      hoverTime = 30; // 30 seconds for survey
    } else if (action === 'none') {
      hoverTime = 0;
    }
    
    setEditingWaypoint({
      ...editingWaypoint,
      action,
      hoverTime
    });
  };
  
  // Generate automatic grid pattern
  const generateGridPattern = () => {
    if (waypoints.length < 1 || readOnly) return;
    
    // Need at least a takeoff point
    const takeoff = waypoints.find(w => w.type === 'takeoff');
    if (!takeoff) {
      setError('Add a takeoff point first');
      return;
    }
    
    // Use the first waypoint as center
    const center = new L.LatLng(takeoff.position[0], takeoff.position[1]);
    
    // Grid dimensions (in meters)
    const width = 100;
    const height = 100;
    const spacing = 20;
    
    // Calculate grid corners
    const rows = Math.floor(height / spacing) + 1;
    const cols = Math.floor(width / spacing) + 1;
    
    // Start with takeoff
    const gridWaypoints: Waypoint[] = [takeoff];
    
    // Generate grid pattern waypoints
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip first point (already have takeoff)
        if (row === 0 && col === 0) continue;
        
        // Calculate position offset
        const latOffset = (row * spacing) / 111111; // Rough conversion to degrees
        const lngOffset = ((col * spacing) / 111111) / Math.cos(center.lat * Math.PI / 180);
        
        // Alternate direction for each row (serpentine pattern)
        const lngMultiplier = row % 2 === 0 ? 1 : -1;
        
        const lat = center.lat + latOffset;
        const lng = center.lng + (lngOffset * lngMultiplier);
        
        // Create waypoint
        const waypoint: Waypoint = {
          id: uuidv4(),
          name: `Grid ${row+1}-${col+1}`,
          type: 'waypoint',
          position: toLatLngTuple([lat, lng]),
          altitude: defaultAltitude,
          description: 'Grid survey point',
          speed: defaultFlightSpeed,
          hoverTime: 0,
          action: 'photo'
        };
        
        gridWaypoints.push(waypoint);
      }
    }
    
    // Add a landing point at the takeoff location
    const landing: Waypoint = {
      id: uuidv4(),
      name: 'Landing',
      type: 'landing',
      position: toLatLngTuple(takeoff.position),
      altitude: defaultAltitude,
      description: 'Landing location',
      speed: defaultFlightSpeed,
      hoverTime: 0,
      action: 'none'
    };
    
    gridWaypoints.push(landing);
    
    setWaypoints(gridWaypoints);
    setSelectedWaypoint(null);
    setError(null);
  };
  
  // Generate circular pattern
  const generateCircularPattern = () => {
    if (waypoints.length < 1 || readOnly) return;
    
    // Need at least a takeoff point
    const takeoff = waypoints.find(w => w.type === 'takeoff');
    if (!takeoff) {
      setError('Add a takeoff point first');
      return;
    }
    
    // Use the first waypoint as center
    const center = new L.LatLng(takeoff.position[0], takeoff.position[1]);
    
    // Circle parameters
    const radius = 50; // meters
    const points = 8; // number of points
    
    // Start with takeoff
    const circleWaypoints: Waypoint[] = [takeoff];
    
    // Generate circle points
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      
      // Calculate position
      const latOffset = (Math.sin(angle) * radius) / 111111; // Rough conversion to degrees
      const lngOffset = (Math.cos(angle) * radius) / (111111 * Math.cos(center.lat * Math.PI / 180));
      
      const lat = center.lat + latOffset;
      const lng = center.lng + lngOffset;
      
      // Create waypoint
      const waypoint: Waypoint = {
        id: uuidv4(),
        name: `Circle ${i+1}`,
        type: 'waypoint',
        position: toLatLngTuple([lat, lng]),
        altitude: defaultAltitude,
        description: 'Circle survey point',
        speed: defaultFlightSpeed,
        hoverTime: 0,
        action: 'photo'
      };
      
      circleWaypoints.push(waypoint);
    }
    
    // Add a landing point at the takeoff location
    const landing: Waypoint = {
      id: uuidv4(),
      name: 'Landing',
      type: 'landing',
      position: toLatLngTuple(takeoff.position),
      altitude: defaultAltitude,
      description: 'Landing location',
      speed: defaultFlightSpeed,
      hoverTime: 0,
      action: 'none'
    };
    
    circleWaypoints.push(landing);
    
    setWaypoints(circleWaypoints);
    setSelectedWaypoint(null);
    setError(null);
  };
  
  // Calculate statistics
  const totalDistance = calculateTotalDistance(waypoints);
  const totalDuration = estimateFlightDuration(waypoints, defaultFlightSpeed);
  
  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card sx={{ 
      mb: 3,
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <RouteIcon sx={{ mr: 1 }} />
            Flight Path Planner
          </Typography>
          
          {!readOnly && (
            <Box>
              <Tooltip title="Add Landing Point">
                <IconButton 
                  color="primary" 
                  onClick={handleAddLanding}
                  disabled={waypoints.length === 0}
                  sx={{ mr: 1 }}
                >
                  <LandIcon />
                </IconButton>
              </Tooltip>
              
              <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                <InputLabel>Pattern</InputLabel>
                <Select
                  value={pathType}
                  label="Pattern"
                  onChange={(e) => setPathType(e.target.value as 'linear' | 'grid' | 'circular')}
                  size="small"
                >
                  <MenuItem value="linear">Linear</MenuItem>
                  <MenuItem value="grid">Grid</MenuItem>
                  <MenuItem value="circular">Circular</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={pathType === 'grid' ? generateGridPattern : generateCircularPattern}
                disabled={waypoints.length === 0}
                startIcon={pathType === 'grid' ? <MapIcon /> : <NavigationIcon />}
              >
                Generate
              </Button>
            </Box>
          )}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          {/* Map View */}
          <Grid item xs={12} md={8}>
            <Box 
              sx={{ 
                height: 400, 
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              <MapContainer 
                center={mapCenter} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapClickHandler onMapClick={handleMapClick} disabled={readOnly} />
                
                {/* Render waypoints */}
                {waypoints.map((waypoint) => (
                  <Marker 
                    key={waypoint.id}
                    position={waypoint.position}
                    icon={
                      waypoint.type === 'takeoff' 
                        ? takeoffIcon 
                        : waypoint.type === 'landing' 
                          ? landingIcon 
                          : waypointIcon
                    }
                  >
                    <Popup>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {waypoint.name}
                      </Typography>
                      
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Type:</strong> {waypoint.type}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Altitude:</strong> {waypoint.altitude}m
                        </Typography>
                        <Typography variant="body2">
                          <strong>Speed:</strong> {waypoint.speed || defaultFlightSpeed}m/s
                        </Typography>
                        {waypoint.hoverTime && waypoint.hoverTime > 0 && (
                          <Typography variant="body2">
                            <strong>Hover:</strong> {waypoint.hoverTime}s
                          </Typography>
                        )}
                        {waypoint.action && waypoint.action !== 'none' && (
                          <Typography variant="body2">
                            <strong>Action:</strong> {waypoint.action}
                          </Typography>
                        )}
                      </Box>
                      
                      {!readOnly && (
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <Button 
                            size="small" 
                            startIcon={<EditIcon />}
                            onClick={() => handleEditWaypoint(waypoint)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveWaypoint(waypoint.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      )}
                    </Popup>
                  </Marker>
                ))}
                
                {/* Use the flight path hook */}
                {waypoints.length > 1 && (
                  <FlightPathHookWrapper
                    waypoints={waypoints}
                    color={theme.palette.primary.main}
                  />
                )}
              </MapContainer>
              
              {/* Flight statistics overlay */}
              <Paper
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  zIndex: 1000,
                  p: 1,
                  width: 180,
                  opacity: 0.9
                }}
                elevation={3}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Flight Statistics</Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MeasureIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      Distance: {(totalDistance / 1000).toFixed(2)} km
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DurationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      Duration: {formatDuration(totalDuration)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      Avg. Speed: {defaultFlightSpeed} m/s
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Grid>
          
          {/* Waypoint Control Panel */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 2, 
                height: 400, 
                overflow: 'auto' 
              }}
              elevation={2}
            >
              {!readOnly && !editingWaypoint && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Default Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Speed (m/s)"
                        type="number"
                        size="small"
                        fullWidth
                        value={defaultFlightSpeed}
                        onChange={(e) => setDefaultFlightSpeed(Number(e.target.value))}
                        InputProps={{ inputProps: { min: 1, max: 20 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Altitude (m)"
                        type="number"
                        size="small"
                        fullWidth
                        value={defaultAltitude}
                        onChange={(e) => setDefaultAltitude(Number(e.target.value))}
                        InputProps={{ inputProps: { min: 5, max: 120 } }}
                      />
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              
              {editingWaypoint && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Edit Waypoint
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Name"
                      size="small"
                      fullWidth
                      value={editingWaypoint.name}
                      onChange={(e) => handleWaypointChange('name', e.target.value)}
                    />
                    
                    <TextField
                      label="Altitude (m)"
                      type="number"
                      size="small"
                      fullWidth
                      value={editingWaypoint.altitude}
                      onChange={(e) => handleWaypointChange('altitude', Number(e.target.value))}
                      InputProps={{ inputProps: { min: 5, max: 120 } }}
                    />
                    
                    <TextField
                      label="Speed (m/s)"
                      type="number"
                      size="small"
                      fullWidth
                      value={editingWaypoint.speed}
                      onChange={(e) => handleWaypointChange('speed', Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1, max: 20 } }}
                    />
                    
                    <TextField
                      label="Hover Time (s)"
                      type="number"
                      size="small"
                      fullWidth
                      value={editingWaypoint.hoverTime}
                      onChange={(e) => handleWaypointChange('hoverTime', Number(e.target.value))}
                      InputProps={{ inputProps: { min: 0, max: 120 } }}
                    />
                    
                    <FormControl fullWidth size="small">
                      <InputLabel>Action</InputLabel>
                      <Select
                        value={editingWaypoint.action || 'none'}
                        label="Action"
                        onChange={handleActionChange}
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="photo">Take Photo</MenuItem>
                        <MenuItem value="video">Record Video</MenuItem>
                        <MenuItem value="survey">Survey Area</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      label="Description"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={editingWaypoint.description}
                      onChange={(e) => handleWaypointChange('description', e.target.value)}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        variant="outlined"
                        onClick={handleCancelEdit}
                        startIcon={<UndoIcon />}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained"
                        onClick={handleSaveWaypoint}
                        startIcon={<SaveIcon />}
                        color="primary"
                      >
                        Save
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              )}
              
              {!editingWaypoint && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Waypoints ({waypoints.length})
                  </Typography>
                  
                  {waypoints.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {readOnly ? 
                        'No flight path defined.' : 
                        'Click on the map to add waypoints for your flight path.'}
                    </Alert>
                  ) : (
                    <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto', pr: 1 }}>
                      {waypoints.map((waypoint, index) => (
                        <Paper 
                          key={waypoint.id}
                          sx={{ 
                            p: 1, 
                            bgcolor: selectedWaypoint?.id === waypoint.id ? 'action.selected' : 'background.paper',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            }
                          }}
                          elevation={1}
                          onClick={() => handleWaypointSelect(waypoint)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {waypoint.type === 'takeoff' ? (
                              <TakeoffIcon color="success" sx={{ mr: 1 }} />
                            ) : waypoint.type === 'landing' ? (
                              <LandIcon color="error" sx={{ mr: 1 }} />
                            ) : (
                              <AddWaypointIcon color="primary" sx={{ mr: 1 }} />
                            )}
                            <Box>
                              <Typography variant="body2">
                                {index + 1}. {waypoint.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {waypoint.altitude}m
                                {waypoint.action && waypoint.action !== 'none' && ` • ${waypoint.action}`}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {!readOnly && (
                            <Box>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditWaypoint(waypoint);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveWaypoint(waypoint.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Wrapper component to use the path hook
const FlightPathHookWrapper: React.FC<{
  waypoints: Waypoint[];
  color: string;
}> = ({ waypoints, color }) => {
  useFlightPath(waypoints, color);
  return null;
};

export default FlightPathPlanner; 