import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle } from 'react-leaflet';
import { LatLngExpression, Icon, DivIcon, LeafletMouseEvent, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Paper, Button, Tooltip, IconButton, Badge } from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  LocationOn as LocationIcon,
  AddLocation as AddLocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Route as RouteIcon,
  NearMe as NavigateIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { formatCoordinates, getLat, getLng } from '../../utils/mapHelpers';
import { MapLocation } from '../../types/mapTypes';

// Use a subset of MapLocation types for backward compatibility
type MapComponentLocationType = Omit<MapLocation, 'type'> & {
  type: 'mission' | 'waypoint' | 'poi' | 'restricted';
};

interface MapComponentProps {
  center?: LatLngExpression;
  zoom?: number;
  locations?: MapLocation[];
  height?: number | string;
  editable?: boolean;
  onLocationSelect?: (location: MapLocation) => void;
  onLocationAdd?: (location: MapLocation) => void;
  onLocationUpdate?: (location: MapLocation) => void;
  onLocationDelete?: (locationId: string) => void;
}

// Add helper function to convert LatLngExpression to [number, number]
const toLatLngTuple = (pos: LatLngExpression): [number, number] => {
  if (Array.isArray(pos)) {
    return [pos[0], pos[1]];
  }
  if (pos instanceof LatLng) {
    return [pos.lat, pos.lng];
  }
  // Handle object with lat/lng properties
  if ('lat' in pos && 'lng' in pos) {
    return [pos.lat, pos.lng];
  }
  throw new Error('Invalid position format');
};

/**
 * Component to fix Leaflet marker icons
 */
const LeafletIconFix: React.FC = () => {
  useEffect(() => {
    // Fix for Leaflet default marker icons
    // This is needed because the Leaflet CSS expects the marker images in a different location
    const L = require('leaflet');
    
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }, []);
  
  return null;
};

/**
 * Component to handle click events on the map
 */
const LocationMarker: React.FC<{
  editable: boolean;
  onLocationAdd: (location: MapLocation) => void;
}> = ({ editable, onLocationAdd }) => {
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  
  const map = useMapEvents({
    click: (e: LeafletMouseEvent) => {
      const newPosition: LatLngExpression = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
    },
  });
  
  const handleAddLocation = () => {
    if (position) {
      const newLocation: MapLocation = {
        id: `loc_${Date.now()}`,
        position: toLatLngTuple(position),
        name: `Location ${new Date().toLocaleTimeString()}`,
        type: 'waypoint'
      };
      
      onLocationAdd(newLocation);
      setPosition(null);
    }
  };
  
  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" gutterBottom>
            New Location
          </Typography>
          <Typography variant="caption" color="textSecondary" gutterBottom>
            {formatCoordinates(position)}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleAddLocation}
              startIcon={<AddLocationIcon />}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Popup>
    </Marker>
  );
};

/**
 * Component to recenter the map to user's location
 */
const RecenterAutomatically: React.FC<{ position: LatLngExpression }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  
  return null;
};

/**
 * Main Map Component
 */
const MapComponent: React.FC<MapComponentProps> = ({
  center = [51.505, -0.09],
  zoom = 13,
  locations = [],
  height = 400,
  editable = false,
  onLocationSelect,
  onLocationAdd,
  onLocationUpdate,
  onLocationDelete
}) => {
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  // Custom marker icons - defined inside component to avoid issues with SSR
  const [icons, setIcons] = useState<{
    missionMarkerIcon: Icon | null,
    locationMarkerIcon: Icon | null
  }>({
    missionMarkerIcon: null,
    locationMarkerIcon: null
  });
  
  // Initialize icons when component mounts
  useEffect(() => {
    try {
      const L = require('leaflet');
      
      const missionIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
      const locationIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
      setIcons({
        missionMarkerIcon: missionIcon,
        locationMarkerIcon: locationIcon
      });
    } catch (error) {
      console.error('Error initializing icons:', error);
    }
  }, []);
  
  // Get user's current location
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };
  
  // Handle location selection
  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location.id);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };
  
  // Handle location deletion
  const handleLocationDelete = (locationId: string) => {
    if (onLocationDelete) {
      onLocationDelete(locationId);
    }
  };
  
  return (
    <Box sx={{ position: 'relative', height, width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: 4 }}
      >
        {/* Fix Leaflet Icons */}
        <LeafletIconFix />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Display all provided locations */}
        {locations.map((location) => (
          <React.Fragment key={location.id}>
            <Marker 
              position={location.position} 
              icon={location.type === 'mission' && icons.missionMarkerIcon 
                ? icons.missionMarkerIcon 
                : undefined}
              eventHandlers={{
                click: () => handleLocationSelect(location),
              }}
            >
              <Popup>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2">
                    {location.name}
                  </Typography>
                  
                  {location.description && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {location.description}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                    {formatCoordinates(location.position)}
                  </Typography>
                  
                  {editable && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => onLocationUpdate && onLocationUpdate(location)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleLocationDelete(location.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Box>
              </Popup>
            </Marker>
            
            {/* Display radius if provided */}
            {location.radius && location.radius > 0 && (
              <Circle 
                center={location.position} 
                radius={location.radius}
                color={location.type === 'restricted' ? 'red' : 'blue'}
                fillColor={location.type === 'restricted' ? 'red' : 'blue'}
                fillOpacity={0.2}
              />
            )}
          </React.Fragment>
        ))}
        
        {/* Show user location if available */}
        {userLocation && (
          <>
            <Marker position={userLocation}>
              <Popup>
                <Typography variant="body2">Your location</Typography>
              </Popup>
            </Marker>
            <RecenterAutomatically position={userLocation} />
          </>
        )}
        
        {/* Handle map click events if editable */}
        {editable && onLocationAdd && (
          <LocationMarker 
            editable={editable} 
            onLocationAdd={onLocationAdd} 
          />
        )}
      </MapContainer>
      
      {/* Map controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Paper elevation={3} sx={{ p: 0.5 }}>
          <Tooltip title="Get Current Location">
            <IconButton size="small" onClick={handleGetUserLocation}>
              <MyLocationIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>
        
        {editable && (
          <Paper elevation={3} sx={{ p: 0.5 }}>
            <Tooltip title="Click on map to add locations">
              <IconButton size="small">
                <Badge color="primary" variant="dot">
                  <AddLocationIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default MapComponent; 