import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  FlightTakeoff as TakeoffIcon,
  Warning as WarningIcon,
  Block as NoFlyIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapLocation } from '../../types/mapTypes';
import { v4 as uuidv4 } from 'uuid';

// Custom marker icons for different location types
const missionIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const waypointIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const restrictedIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const poiIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component props
interface MissionMapLocationProps {
  initialLocations?: MapLocation[];
  onLocationsChange?: (locations: MapLocation[]) => void;
  onMainLocationChange?: (location: MapLocation) => void;
  readOnly?: boolean;
}

// Location types
const locationTypes = [
  { value: 'mission', label: 'Mission Site', icon: <TakeoffIcon /> },
  { value: 'waypoint', label: 'Waypoint', icon: <PlaceIcon /> },
  { value: 'poi', label: 'Point of Interest', icon: <LocationIcon /> },
  { value: 'restricted', label: 'Restricted Area', icon: <NoFlyIcon /> }
];

// Get icon based on location type
const getIconForLocationType = (type: string) => {
  switch (type) {
    case 'mission':
      return missionIcon;
    case 'restricted':
      return restrictedIcon;
    case 'poi':
      return poiIcon;
    default:
      return waypointIcon;
  }
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

// Main component
const MissionMapLocation: React.FC<MissionMapLocationProps> = ({
  initialLocations = [],
  onLocationsChange,
  onMainLocationChange,
  readOnly = false
}) => {
  const theme = useTheme();
  
  // State
  const [locations, setLocations] = useState<MapLocation[]>(initialLocations);
  const [editingLocation, setEditingLocation] = useState<MapLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([51.505, -0.09]); // Default to London
  const [zoom, setZoom] = useState(13);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [locationToAdd, setLocationToAdd] = useState<LatLngExpression | null>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState('waypoint');
  const [newLocationDescription, setNewLocationDescription] = useState('');
  const [newLocationRadius, setNewLocationRadius] = useState(100);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with geolocation if no locations provided
  useEffect(() => {
    if (initialLocations.length > 0) {
      setLocations(initialLocations);
      // Center on the main mission site if available
      const mainLocation = initialLocations.find(l => l.type === 'mission');
      if (mainLocation) {
        setMapCenter(mainLocation.position);
      } else {
        setMapCenter(initialLocations[0].position);
      }
    } else {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter([latitude, longitude]);
          },
          () => {
            // Geolocation failed, keep default
          }
        );
      }
    }
  }, [initialLocations]);
  
  // Notify parent component when locations change
  useEffect(() => {
    if (onLocationsChange) {
      onLocationsChange(locations);
    }
    
    // Check if we have a main mission location
    const mainLocation = locations.find(l => l.type === 'mission');
    if (mainLocation && onMainLocationChange) {
      onMainLocationChange(mainLocation);
    }
  }, [locations, onLocationsChange, onMainLocationChange]);
  
  // Handle map click to add location
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (readOnly) return;
    
    setLocationToAdd([lat, lng]);
    setNewLocationName('');
    setNewLocationType('waypoint');
    setNewLocationDescription('');
    setNewLocationRadius(100);
    setDialogOpen(true);
  }, [readOnly]);
  
  // Add new location
  const handleAddLocation = () => {
    if (!locationToAdd || !newLocationName) return;
    
    // Check if we already have a mission site and trying to add another
    if (newLocationType === 'mission' && locations.some(l => l.type === 'mission')) {
      setError('Only one mission site is allowed. Please change the location type or edit the existing mission site.');
      return;
    }
    
    // Safely convert LatLngExpression to [number, number]
    let position: [number, number];
    
    if (Array.isArray(locationToAdd)) {
      position = locationToAdd as [number, number];
    } else if (typeof locationToAdd === 'object' && 'lat' in locationToAdd && 'lng' in locationToAdd) {
      const lat = typeof locationToAdd.lat === 'number' ? locationToAdd.lat : 0;
      const lng = typeof locationToAdd.lng === 'number' ? locationToAdd.lng : 0;
      position = [lat, lng];
    } else {
      // Fallback
      position = [0, 0];
      console.error('Invalid location format', locationToAdd);
    }
    
    const newLocation: MapLocation = {
      id: uuidv4(),
      name: newLocationName,
      type: newLocationType,
      position: position,
      description: newLocationDescription,
      radius: newLocationType === 'restricted' ? newLocationRadius : undefined
    };
    
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    setDialogOpen(false);
    setError(null);
    
    // If this is the first mission site, update parent component
    if (newLocationType === 'mission' && onMainLocationChange) {
      onMainLocationChange(newLocation);
    }
  };
  
  // Delete location
  const handleDeleteLocation = (id: string) => {
    if (readOnly) return;
    
    const updatedLocations = locations.filter(l => l.id !== id);
    setLocations(updatedLocations);
    
    // If we deleted the main mission site, update parent component with null
    const deletedLocation = locations.find(l => l.id === id);
    if (deletedLocation?.type === 'mission' && onMainLocationChange) {
      const newMainLocation = updatedLocations.find(l => l.type === 'mission');
      if (newMainLocation) {
        onMainLocationChange(newMainLocation);
      }
    }
  };
  
  // Start editing a location
  const handleEditLocation = (location: MapLocation) => {
    if (readOnly) return;
    setEditingLocation(location);
    setNewLocationName(location.name);
    setNewLocationType(location.type);
    setNewLocationDescription(location.description || '');
    setNewLocationRadius(location.radius || 100);
    setDialogOpen(true);
  };
  
  // Save edited location
  const handleSaveEdit = () => {
    if (!editingLocation) return;
    
    // Check if we're changing a non-mission to a mission when one already exists
    if (editingLocation.type !== 'mission' && newLocationType === 'mission') {
      const existingMission = locations.find(l => l.type === 'mission' && l.id !== editingLocation.id);
      if (existingMission) {
        setError('Only one mission site is allowed. Please choose a different location type or edit the existing mission site.');
        return;
      }
    }
    
    const updatedLocation: MapLocation = {
      ...editingLocation,
      name: newLocationName,
      type: newLocationType,
      description: newLocationDescription,
      radius: newLocationType === 'restricted' ? newLocationRadius : undefined
    };
    
    const updatedLocations = locations.map(l => 
      l.id === editingLocation.id ? updatedLocation : l
    );
    
    setLocations(updatedLocations);
    setEditingLocation(null);
    setDialogOpen(false);
    setError(null);
    
    // If we edited the mission site, update parent component
    if (newLocationType === 'mission' && onMainLocationChange) {
      onMainLocationChange(updatedLocation);
    } else if (editingLocation.type === 'mission' && newLocationType !== 'mission' && onMainLocationChange) {
      // If we changed the mission site to another type, find a new mission site
      const newMissionSite = updatedLocations.find(l => l.type === 'mission');
      if (newMissionSite) {
        onMainLocationChange(newMissionSite);
      }
    }
  };
  
  // Handle location type change
  const handleLocationTypeChange = (event: SelectChangeEvent) => {
    setNewLocationType(event.target.value);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLocation(null);
    setError(null);
  };
  
  // Get color for location type
  const getLocationColor = (type: string) => {
    switch (type) {
      case 'mission':
        return theme.palette.success.main;
      case 'restricted':
        return theme.palette.error.main;
      case 'poi':
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Set the primary mission site and any additional waypoints, points of interest, or restricted areas. The mission site is required and will be used as the default takeoff location.
        </Typography>
      </Box>
      
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
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onMapClick={handleMapClick} disabled={readOnly} />
          
          {/* Render locations */}
          {locations.map((location) => (
            <React.Fragment key={location.id}>
              <Marker 
                position={location.position}
                icon={getIconForLocationType(location.type)}
              >
                <Popup>
                  <Typography variant="subtitle2">{location.name}</Typography>
                  {location.description && (
                    <Typography variant="body2">{location.description}</Typography>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      label={locationTypes.find(t => t.value === location.type)?.label || 'Waypoint'}
                      sx={{ 
                        bgcolor: `${getLocationColor(location.type)}20`,
                        color: getLocationColor(location.type),
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                  {!readOnly && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleEditLocation(location)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Popup>
              </Marker>
              
              {/* Draw circle for restricted areas */}
              {location.type === 'restricted' && location.radius && (
                <Circle
                  center={location.position}
                  radius={location.radius}
                  pathOptions={{ color: theme.palette.error.main, fillColor: theme.palette.error.main, fillOpacity: 0.2 }}
                />
              )}
            </React.Fragment>
          ))}
        </MapContainer>
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2">
            Locations: {locations.length}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {locations.some(l => l.type === 'mission') ? 
              'Mission site defined ✓' : 
              'No mission site defined ⚠️'}
          </Typography>
        </Box>
        
        {!readOnly && (
          <Box>
            {locationTypes.map((type) => (
              <Chip
                key={type.value}
                icon={type.icon}
                label={type.label}
                variant="outlined"
                size="small"
                sx={{ mr: 1, mb: 1 }}
                color={type.value === 'mission' ? 'success' : 
                      type.value === 'restricted' ? 'error' :
                      type.value === 'poi' ? 'warning' : 'primary'}
              />
            ))}
          </Box>
        )}
      </Box>
      
      {!locations.some(l => l.type === 'mission') && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please add a mission site location to proceed. The mission site will be used as the default takeoff location.
        </Alert>
      )}
      
      {/* Add/Edit Location Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingLocation ? 'Edit Location' : 'Add New Location'}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Location Name"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Location Type</InputLabel>
              <Select
                value={newLocationType}
                onChange={handleLocationTypeChange}
                label="Location Type"
              >
                {locationTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {React.cloneElement(type.icon, { fontSize: 'small', sx: { mr: 1 } })}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Description (optional)"
              value={newLocationDescription}
              onChange={(e) => setNewLocationDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            
            {newLocationType === 'restricted' && (
              <TextField
                label="Restricted Area Radius (meters)"
                type="number"
                value={newLocationRadius}
                onChange={(e) => setNewLocationRadius(Number(e.target.value))}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 10, max: 5000 } }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={editingLocation ? handleSaveEdit : handleAddLocation}
            variant="contained"
            color="primary"
            disabled={!newLocationName}
          >
            {editingLocation ? 'Save Changes' : 'Add Location'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MissionMapLocation; 