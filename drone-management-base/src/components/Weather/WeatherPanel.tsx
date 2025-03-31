import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Paper,
  useTheme
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Cloud as CloudyIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Thunderstorm as StormIcon,
  Air as WindIcon,
  Visibility as VisibilityIcon,
  WaterDrop as HumidityIcon,
  Thermostat as TemperatureIcon
} from '@mui/icons-material';
import { FlightSuitability, getCurrentWeather, getWeatherForecast, geocodeLocation, WeatherForecast, CurrentWeather } from '../../utils/weatherApi';

interface WeatherPanelProps {
  onLocationSelected?: (lat: number, lon: number, locationName: string) => void;
  onWeatherDataReceived?: (current: CurrentWeather, forecast: WeatherForecast[]) => void;
}

const WeatherPanel: React.FC<WeatherPanelProps> = ({
  onLocationSelected,
  onWeatherDataReceived
}) => {
  const theme = useTheme();
  
  // State
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number, locationName: string} | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch current weather and forecast
  const fetchWeatherData = useCallback(async (lat?: number, lon?: number) => {
    if (!lat || !lon) {
      if (!coordinates) return;
      lat = coordinates.lat;
      lon = coordinates.lon;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [current, forecastData] = await Promise.all([
        getCurrentWeather(lat, lon),
        getWeatherForecast(lat, lon)
      ]);
      
      setCurrentWeather(current);
      setForecast(forecastData);
      
      if (onWeatherDataReceived) {
        onWeatherDataReceived(current, forecastData);
      }
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error('Error fetching weather data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [coordinates, onWeatherDataReceived]);
  
  // Fetch weather data when coordinates change
  useEffect(() => {
    if (coordinates) {
      fetchWeatherData(coordinates.lat, coordinates.lon);
    }
  }, [coordinates, fetchWeatherData]);
  
  // Search for location and get coordinates
  const handleLocationSearch = async () => {
    if (!location) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const geoData = await geocodeLocation(location);
      setCoordinates({
        lat: geoData.lat,
        lon: geoData.lon,
        locationName: location
      });
      
      if (onLocationSelected) {
        onLocationSelected(geoData.lat, geoData.lon, location);
      }
    } catch (err) {
      setError('Location not found. Please try another search term.');
      console.error('Error searching location:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get the color for flight suitability
  const getFlightSuitabilityColor = (suitability: FlightSuitability) => {
    switch(suitability) {
      case FlightSuitability.OPTIMAL:
        return theme.palette.success.main;
      case FlightSuitability.ACCEPTABLE:
        return theme.palette.success.light;
      case FlightSuitability.CAUTION:
        return theme.palette.warning.main;
      case FlightSuitability.UNSAFE:
        return theme.palette.warning.dark;
      case FlightSuitability.DANGEROUS:
        return theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };
  
  // Get weather icon based on conditions
  const getWeatherIcon = (conditions: string) => {
    const conditionsLower = conditions.toLowerCase();
    
    if (conditionsLower.includes('clear') || conditionsLower.includes('sun')) {
      return <SunnyIcon fontSize="large" />;
    } else if (conditionsLower.includes('rain') || conditionsLower.includes('drizzle')) {
      return <RainIcon fontSize="large" />;
    } else if (conditionsLower.includes('snow')) {
      return <SnowIcon fontSize="large" />;
    } else if (conditionsLower.includes('thunder') || conditionsLower.includes('storm')) {
      return <StormIcon fontSize="large" />;
    } else {
      return <CloudyIcon fontSize="large" />;
    }
  };
  
  // Format a date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric'
    });
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Weather Conditions
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Location"
              placeholder="Enter city, region, or coordinates"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              disabled={isLoading || !location}
              onClick={handleLocationSearch}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {currentWeather && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Current Weather {coordinates?.locationName && `in ${coordinates.locationName}`}
              </Typography>
              
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4} md={2} sx={{ textAlign: 'center' }}>
                    {getWeatherIcon(currentWeather.conditions)}
                    <Typography variant="body2" color="textSecondary">
                      {currentWeather.conditions}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={8} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TemperatureIcon sx={{ mr: 1 }} color="primary" />
                      <Typography>
                        {currentWeather.temperature.toFixed(1)}°C (Feels like: {currentWeather.feelsLike.toFixed(1)}°C)
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WindIcon sx={{ mr: 1 }} color="primary" />
                      <Typography>
                        Wind: {currentWeather.windSpeed.toFixed(1)} m/s
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HumidityIcon sx={{ mr: 1 }} color="primary" />
                      <Typography>
                        Humidity: {currentWeather.humidity}%
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Flight Suitability
                    </Typography>
                    
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: `${getFlightSuitabilityColor(currentWeather.flightSuitability)}20`,
                      border: `1px solid ${getFlightSuitabilityColor(currentWeather.flightSuitability)}`,
                      color: getFlightSuitabilityColor(currentWeather.flightSuitability),
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      {currentWeather.flightSuitability.replace('_', ' ')}
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        {currentWeather.flightSuitability === FlightSuitability.OPTIMAL && 
                          "Ideal conditions for all drone operations."}
                        {currentWeather.flightSuitability === FlightSuitability.ACCEPTABLE && 
                          "Good conditions for most drone operations."}
                        {currentWeather.flightSuitability === FlightSuitability.CAUTION && 
                          "Exercise caution and monitor conditions closely."}
                        {currentWeather.flightSuitability === FlightSuitability.UNSAFE && 
                          "Not recommended for standard operations."}
                        {currentWeather.flightSuitability === FlightSuitability.DANGEROUS && 
                          "Do not fly. Conditions are hazardous."}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Forecast
            </Typography>
            
            <Grid container spacing={2}>
              {forecast.slice(0, 8).map((item, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Paper elevation={1} sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="body2" gutterBottom>
                      {formatDate(item.date)}
                    </Typography>
                    
                    {getWeatherIcon(item.conditions)}
                    
                    <Typography variant="body2">
                      {item.temperature.toFixed(1)}°C
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      Wind: {item.windSpeed.toFixed(1)} m/s
                    </Typography>
                    
                    <Chip 
                      label={item.flightSuitability}
                      size="small"
                      sx={{ 
                        mt: 1,
                        bgcolor: `${getFlightSuitabilityColor(item.flightSuitability)}20`,
                        color: getFlightSuitabilityColor(item.flightSuitability),
                        borderColor: getFlightSuitabilityColor(item.flightSuitability),
                        fontWeight: 'medium'
                      }}
                      variant="outlined"
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        
        {!currentWeather && !isLoading && !error && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="textSecondary">
              Search for a location to see weather conditions for your mission planning.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherPanel; 