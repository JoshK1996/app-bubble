import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  FormHelperText,
  Grid,
  Paper,
  Chip,
  Divider,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MyLocation as MyLocationIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import MapComponent from '../Maps/MapComponent';
import { geocodeLocation } from '../../utils/weatherApi';
import { formatCoordinates, getLat, getLng, toLatLngArray } from '../../utils/mapHelpers';
import { MapLocation } from '../../types/mapTypes';

interface MissionLocationMapProps {
  initialLocations?: MapLocation[];
  missionLocation?: MapLocation | null;
  onMainLocationChange?: (location: MapLocation) => void;
  onLocationsChange?: (locations: MapLocation[]) => void;
}

/**
 * Mission Location Map Component
 */
const MissionLocationMap: React.FC<MissionLocationMapProps> = ({
  initialLocations = [],
  missionLocation = null,
  onMainLocationChange,
  onLocationsChange
}) => {
  // State
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapLocation[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState<Partial<MapLocation>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Initialize locations from props
  useEffect(() => {
    if (initialLocations && initialLocations.length > 0) {
      setLocations(initialLocations);
    }
  }, [initialLocations]);
  
  // Update parent component when locations change
  useEffect(() => {
    if (onLocationsChange) {
      onLocationsChange(locations);
    }
  }, [locations, onLocationsChange]);
  
  // Handle selecting a location
  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
  };
  
  // Open dialog to add a new location
  const handleAddLocation = () => {
    setNewLocation({
      name: '',
      description: '',
      notes: '',
      type: 'location',
    });
    setIsEditing(false);
    setErrors({});
    setDialogOpen(true);
  };
  
  // Open dialog to edit an existing location
  const handleEditLocation = (location: MapLocation) => {
    setNewLocation({
      ...location
    });
    setIsEditing(true);
    setErrors({});
    setDialogOpen(true);
  };
  
  // Delete a location from the list
  const handleDeleteLocation = (id: string) => {
    const updatedLocations = locations.filter(location => location.id !== id);
    setLocations(updatedLocations);
    
    // Clear selection if deleted
    if (selectedLocation && selectedLocation.id === id) {
      setSelectedLocation(null);
    }
  };
  
  // Set location as main mission location
  const handleSetMainLocation = (location: MapLocation) => {
    if (onMainLocationChange) {
      onMainLocationChange(location);
    }
  };
  
  // Handle changes to the location form
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNewLocation(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle changes to the select input
  const handleTypeChange = (e: SelectChangeEvent) => {
    setNewLocation(prev => ({
      ...prev,
      type: e.target.value as MapLocation['type']
    }));
  };
  
  // Search for locations by name/address
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search term');
      return;
    }
    
    try {
      setSearchError(null);
      setIsSearching(true);
      
      const result = await geocodeLocation(searchQuery);
      
      if (result && 'lat' in result && 'lon' in result) {
        const searchResult: MapLocation = {
          id: `search-${Date.now()}`,
          name: searchQuery,
          position: [result.lat, result.lon],
          type: 'location'
        };
        
        setSearchResults([searchResult]);
        setIsSearching(false);
      } else {
        setSearchError('No results found');
        setIsSearching(false);
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      setSearchError('Unable to search location. Using fallback options.');
      setIsSearching(false);
      
      // Show some fallback locations when search fails
      const fallbackLocations: MapLocation[] = [
        {
          id: 'fallback-1',
          name: 'New York City',
          position: [40.7128, -74.0060],
          type: 'location'
        },
        {
          id: 'fallback-2',
          name: 'Los Angeles',
          position: [34.0522, -118.2437],
          type: 'location'
        },
        {
          id: 'fallback-3',
          name: 'Chicago',
          position: [41.8781, -87.6298],
          type: 'location'
        },
        {
          id: 'fallback-4',
          name: 'Miami',
          position: [25.7617, -80.1918],
          type: 'location'
        }
      ];
      
      if (searchQuery.toLowerCase().includes('new') || 
          searchQuery.toLowerCase().includes('york') || 
          searchQuery.toLowerCase().includes('nyc')) {
        setSearchResults([fallbackLocations[0]]);
      } else if (searchQuery.toLowerCase().includes('los') || 
                searchQuery.toLowerCase().includes('angeles') || 
                searchQuery.toLowerCase().includes('la')) {
        setSearchResults([fallbackLocations[1]]);
      } else if (searchQuery.toLowerCase().includes('chicago')) {
        setSearchResults([fallbackLocations[2]]);
      } else if (searchQuery.toLowerCase().includes('miami')) {
        setSearchResults([fallbackLocations[3]]);
      } else {
        // Show all fallbacks if no specific match
        setSearchResults(fallbackLocations);
      }
    }
  };
  
  // Select a search result as the new location
  const handleSelectSearchResult = (location: MapLocation) => {
    setNewLocation({
      ...newLocation,
      position: location.position,
      name: newLocation.name || location.name
    });
    setSearchDialogOpen(false);
  };
  
  // Validate location form before saving
  const validateLocationForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newLocation.name) {
      errors.name = 'Name is required';
    }
    
    if (!newLocation.position) {
      errors.position = 'Position is required';
    }
    
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Save the new or edited location
  const handleSaveLocation = () => {
    if (!validateLocationForm()) {
      return;
    }
    
    if (isEditing && newLocation.id) {
      // Update existing location
      const updatedLocations = locations.map(loc => 
        loc.id === newLocation.id 
          ? { ...loc, ...newLocation } as MapLocation
          : loc
      );
      setLocations(updatedLocations);
      
      // Update selected location if it's the one being edited
      if (selectedLocation && selectedLocation.id === newLocation.id) {
        setSelectedLocation({ ...selectedLocation, ...newLocation } as MapLocation);
      }
    } else {
      // Add new location
      const locationToAdd = {
        id: `loc-${Date.now()}`,
        ...newLocation
      } as MapLocation;
      
      setLocations([...locations, locationToAdd]);
    }
    
    setDialogOpen(false);
  };
  
  return (
    <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Mission Locations</Typography>
        <Box>
          <Button 
            startIcon={<SearchIcon />}
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setSearchError(null);
              setSearchDialogOpen(true);
            }}
            sx={{ mr: 1 }}
          >
            Search
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddLocation}
          >
            Add Location
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', height: 'calc(100% - 48px)' }}>
        {/* Map display */}
        <Box sx={{ flex: 1, mr: 2 }}>
          <MapComponent 
            locations={locations.map(loc => ({
              ...loc,
              type: loc.type === 'location' ? 'waypoint' : loc.type // Convert 'location' to 'waypoint' for base MapComponent
            }))}
            height="100%"
            editable={true}
            onLocationSelect={handleLocationSelect}
            onLocationAdd={(location) => {
              const extendedLocation: MapLocation = {
                ...location,
                notes: ''
              };
              setLocations([...locations, extendedLocation]);
            }}
            onLocationUpdate={handleLocationSelect}
            onLocationDelete={handleDeleteLocation}
          />
        </Box>
        
        {/* Location details */}
        <Box sx={{ width: 300, overflow: 'auto' }}>
          {selectedLocation ? (
            <Box>
              <Typography variant="h6">{selectedLocation.name}</Typography>
              
              {selectedLocation.type && (
                <Chip 
                  icon={<PlaceIcon />} 
                  label={selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1)}
                  size="small"
                  sx={{ mt: 1, mb: 1 }}
                  color={selectedLocation.type === 'mission' ? 'primary' : 'default'}
                />
              )}
              
              {selectedLocation.description && (
                <Typography variant="body2" paragraph>
                  {selectedLocation.description}
                </Typography>
              )}
              
              <Typography variant="body2" color="textSecondary" paragraph>
                Coordinates: {formatCoordinates(selectedLocation.position)}
              </Typography>
              
              {selectedLocation.notes && (
                <>
                  <Typography variant="subtitle2">Notes:</Typography>
                  <Typography variant="body2" paragraph>
                    {selectedLocation.notes}
                  </Typography>
                </>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  startIcon={<LocationIcon />}
                  color="primary"
                  variant={missionLocation && missionLocation.id === selectedLocation.id ? 'contained' : 'outlined'}
                  onClick={() => handleSetMainLocation(selectedLocation)}
                >
                  {missionLocation && missionLocation.id === selectedLocation.id ? 'Main Location' : 'Set as Main'}
                </Button>
                
                <Box>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEditLocation(selectedLocation)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteLocation(selectedLocation.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Select a location on the map to view details or add a new location.
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* Location dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Location' : 'Add New Location'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Location Name"
                fullWidth
                value={newLocation.name || ''}
                onChange={handleLocationInputChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Location Type</InputLabel>
                <Select
                  name="type"
                  value={newLocation.type || 'location'}
                  onChange={handleTypeChange}
                  label="Location Type"
                >
                  <MenuItem value="mission">Mission Site</MenuItem>
                  <MenuItem value="waypoint">Waypoint</MenuItem>
                  <MenuItem value="restricted">Restricted Area</MenuItem>
                  <MenuItem value="location">Other Location</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={newLocation.description || ''}
                onChange={handleLocationInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={newLocation.notes || ''}
                onChange={handleLocationInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Coordinates:</Typography>
                <Button 
                  size="small" 
                  onClick={() => setSearchDialogOpen(true)}
                  startIcon={<SearchIcon />}
                >
                  Search for Location
                </Button>
              </Box>
              
              {newLocation.position && (
                <Typography variant="body2" paragraph>
                  Latitude: {getLat(newLocation.position).toFixed(6)},
                  Longitude: {getLng(newLocation.position).toFixed(6)}
                </Typography>
              )}
              
              {errors.position && (
                <FormHelperText error>{errors.position}</FormHelperText>
              )}
            </Grid>
            
            {newLocation.type === 'restricted' && (
              <Grid item xs={12}>
                <TextField
                  name="radius"
                  label="Radius (meters)"
                  type="number"
                  fullWidth
                  value={newLocation.radius || ''}
                  onChange={handleLocationInputChange}
                  inputProps={{ min: 1 }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveLocation} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Search dialog */}
      <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)}>
        <DialogTitle>Search for Location</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Enter location name"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchLocation();
                }
              }}
              error={!!searchError}
              disabled={isSearching}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearchLocation}
              sx={{ ml: 1 }}
              disabled={isSearching}
            >
              {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
            </Button>
          </Box>
          
          {searchError && (
            <Alert 
              severity={searchResults.length > 0 ? "info" : "warning"} 
              sx={{ mb: 2 }}
              action={
                searchResults.length === 0 ? (
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => {
                      // Show fallback options
                      const fallbackLocations: MapLocation[] = [
                        {
                          id: 'fallback-1',
                          name: 'New York City',
                          position: [40.7128, -74.0060],
                          type: 'location'
                        },
                        {
                          id: 'fallback-2',
                          name: 'Los Angeles',
                          position: [34.0522, -118.2437],
                          type: 'location'
                        },
                        {
                          id: 'fallback-3',
                          name: 'Chicago',
                          position: [41.8781, -87.6298],
                          type: 'location'
                        }
                      ];
                      setSearchResults(fallbackLocations);
                    }}
                  >
                    Show Options
                  </Button>
                ) : null
              }
            >
              {searchError}
            </Alert>
          )}
          
          {searchResults.length > 0 && (
            <List>
              {searchResults.map((location) => (
                <ListItem 
                  key={location.id}
                  button
                  onClick={() => handleSelectSearchResult(location)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon>
                    <PlaceIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={location.name}
                    secondary={formatCoordinates(location.position)}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default MissionLocationMap; 