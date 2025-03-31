import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Air as WindIcon,
  WbSunny as SunnyIcon,
  Cloud as CloudyIcon,
  Opacity as RainIcon,
  Visibility as VisibilityIcon,
  Speed as WindSpeedIcon,
  Navigation as WindDirectionIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  NearMe as LocationIcon,
  AccessTime as TimeIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import WeatherService, { 
  WeatherData, 
  CurrentConditions, 
  FlightSafetyAssessment, 
  WeatherWarning,
  ForecastData
} from '../../services/WeatherService';

// Weather Icon mapping
const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'clear':
      return <SunnyIcon />;
    case 'partly cloudy':
      return <CloudyIcon />;
    case 'cloudy':
      return <CloudyIcon />;
    case 'light rain':
    case 'heavy rain':
      return <RainIcon />;
    default:
      return <CloudyIcon />;
  }
};

// Severity color mapping
const getSeverityColor = (severity: 'Low' | 'Medium' | 'High'): 'success' | 'warning' | 'error' => {
  switch (severity) {
    case 'Low':
      return 'success';
    case 'Medium':
      return 'warning';
    case 'High':
      return 'error';
    default:
      return 'warning';
  }
};

// Recommendation color mapping
const getRecommendationColor = (recommendation: 'Go' | 'No-Go' | 'Caution'): 'success' | 'error' | 'warning' => {
  switch (recommendation) {
    case 'Go':
      return 'success';
    case 'No-Go':
      return 'error';
    case 'Caution':
      return 'warning';
    default:
      return 'warning';
  }
};

interface WeatherIntegrationProps {
  location?: string;
  onLocationChange?: (location: string) => void;
  onWeatherUpdate?: (weatherData: WeatherData) => void;
  plannedDateTime?: Date;
}

const WeatherIntegration: React.FC<WeatherIntegrationProps> = ({
  location = '',
  onLocationChange,
  onWeatherUpdate,
  plannedDateTime
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<string>(location);
  const [relevantForecast, setRelevantForecast] = useState<ForecastData | null>(null);
  
  // Fetch weather data
  const fetchWeatherData = async (loc: string) => {
    if (!loc) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await WeatherService.getWeatherData(loc);
      setWeatherData(data);
      
      // Find relevant forecast if plannedDateTime is provided
      if (plannedDateTime) {
        const forecast = WeatherService.getForecastForTime(data, plannedDateTime);
        setRelevantForecast(forecast);
      } else {
        setRelevantForecast(null);
      }
      
      if (onWeatherUpdate) {
        onWeatherUpdate(data);
      }
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch weather data when location changes
  useEffect(() => {
    if (location) {
      setSearchLocation(location);
      fetchWeatherData(location);
    }
  }, [location]);
  
  // Fetch relevant forecast when plannedDateTime changes
  useEffect(() => {
    if (weatherData && plannedDateTime) {
      const forecast = WeatherService.getForecastForTime(weatherData, plannedDateTime);
      setRelevantForecast(forecast);
    } else {
      setRelevantForecast(null);
    }
  }, [plannedDateTime, weatherData]);
  
  // Handle location search
  const handleSearch = () => {
    fetchWeatherData(searchLocation);
    if (onLocationChange) {
      onLocationChange(searchLocation);
    }
  };
  
  // Handle location input change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchLocation(e.target.value);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchWeatherData(searchLocation || location);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            Weather Integration
          </Typography>
          <Box display="flex" alignItems="center">
            <TextField
              size="small"
              label="Search location"
              value={searchLocation}
              onChange={handleLocationChange}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch} size="small">
                    <SearchIcon />
                  </IconButton>
                )
              }}
              sx={{ mr: 1 }}
            />
            <Tooltip title="Refresh weather data">
              <IconButton onClick={handleRefresh} color="primary" size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {weatherData && (
          <>
            {/* Current Weather */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center">
                    <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {weatherData.location}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Last updated: {new Date(weatherData.currentConditions.lastUpdated).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      {getWeatherIcon(weatherData.currentConditions.conditions)}
                      <Typography variant="h4" sx={{ ml: 1 }}>
                        {weatherData.currentConditions.temperature}°C
                      </Typography>
                    </Box>
                    <Typography variant="body1" mt={1}>
                      {weatherData.currentConditions.conditions}
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <WindSpeedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`Wind: ${weatherData.currentConditions.windSpeed} mph ${weatherData.currentConditions.windDirection}`} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <VisibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`Visibility: ${weatherData.currentConditions.visibility} km`} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CloudyIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`Cloud Cover: ${weatherData.currentConditions.cloudCover}%`} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {/* Flight Safety Assessment */}
                    <Typography variant="h6" gutterBottom>
                      Flight Safety
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <Typography variant="subtitle1" mr={2}>
                        Recommendation:
                      </Typography>
                      <Chip
                        label={weatherData.flightSafetyAssessment.recommendation}
                        color={getRecommendationColor(weatherData.flightSafetyAssessment.recommendation)}
                        icon={weatherData.flightSafetyAssessment.safeToFly ? <CheckIcon /> : <CancelIcon />}
                      />
                    </Box>
                    
                    {weatherData.flightSafetyAssessment.warnings.length > 0 && (
                      <Alert 
                        severity={weatherData.flightSafetyAssessment.safeToFly ? "warning" : "error"}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      >
                        <AlertTitle>Weather Warnings</AlertTitle>
                        <List dense disablePadding>
                          {weatherData.flightSafetyAssessment.warnings.map((warning, index) => (
                            <ListItem key={index} disablePadding>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <Chip 
                                  size="small" 
                                  label={warning.severity} 
                                  color={getSeverityColor(warning.severity)}
                                  sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' } }}
                                />
                              </ListItemIcon>
                              <ListItemText 
                                primary={warning.message} 
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    )}
                    
                    <Box>
                      <Typography variant="body2">
                        Max Recommended Altitude: {weatherData.flightSafetyAssessment.recommendedMaxAltitude} ft
                      </Typography>
                      <Typography variant="body2">
                        Visibility: <Chip 
                          size="small" 
                          label={weatherData.flightSafetyAssessment.visibilityStatus}
                          color={
                            weatherData.flightSafetyAssessment.visibilityStatus === 'Good' ? 'success' :
                            weatherData.flightSafetyAssessment.visibilityStatus === 'Moderate' ? 'warning' :
                            'error'
                          }
                        />
                      </Typography>
                      <Typography variant="body2">
                        Wind: <Chip 
                          size="small" 
                          label={weatherData.flightSafetyAssessment.windStatus}
                          color={
                            weatherData.flightSafetyAssessment.windStatus === 'Calm' ? 'success' :
                            weatherData.flightSafetyAssessment.windStatus === 'Moderate' ? 'success' :
                            weatherData.flightSafetyAssessment.windStatus === 'High' ? 'warning' :
                            'error'
                          }
                        />
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Planned Mission Weather (if applicable) */}
            {relevantForecast && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weather Forecast for Planned Mission
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {new Date(relevantForecast.time).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Box display="flex" alignItems="center">
                        {getWeatherIcon(relevantForecast.conditions)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {relevantForecast.temperature}°C
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {relevantForecast.conditions}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" display="flex" alignItems="center">
                        <WindSpeedIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Wind: {relevantForecast.windSpeed} mph {relevantForecast.windDirection}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" display="flex" alignItems="center">
                        <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Visibility: {relevantForecast.visibility} km
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" display="flex" alignItems="center">
                        <CloudyIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Cloud Cover: {relevantForecast.cloudCover}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
            
            {/* Weather Forecast */}
            <Typography variant="h6" gutterBottom>
              12-Hour Forecast
            </Typography>
            <Box sx={{ display: 'flex', overflowX: 'auto', pb: 1 }}>
              {weatherData.forecast.map((item, index) => (
                <Card 
                  key={index} 
                  variant="outlined"
                  sx={{ 
                    minWidth: 140,
                    mr: 1,
                    flex: '0 0 auto',
                    border: plannedDateTime && 
                           Math.abs(new Date(item.time).getTime() - plannedDateTime.getTime()) < 3600000 
                           ? '2px solid #1976d2' : undefined
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" my={1}>
                      {getWeatherIcon(item.conditions)}
                      <Typography variant="body1" sx={{ ml: 0.5 }}>
                        {item.temperature}°C
                      </Typography>
                    </Box>
                    <Typography variant="caption" display="block">
                      {item.windSpeed} mph {item.windDirection}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Vis: {item.visibility} km
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default WeatherIntegration; 