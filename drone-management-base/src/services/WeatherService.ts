import axios from 'axios';

// Weather data interfaces
export interface WeatherData {
  location: string;
  currentConditions: CurrentConditions;
  forecast: ForecastData[];
  flightSafetyAssessment: FlightSafetyAssessment;
}

export interface CurrentConditions {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  precipitation: number;
  cloudCover: number;
  visibility: number;
  conditions: string;
  icon: string;
  lastUpdated: Date;
}

export interface ForecastData {
  time: Date;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  cloudCover: number;
  visibility: number;
  conditions: string;
  icon: string;
}

export interface FlightSafetyAssessment {
  safeToFly: boolean;
  recommendation: 'Go' | 'No-Go' | 'Caution';
  warnings: WeatherWarning[];
  recommendedMaxAltitude: number;
  visibilityStatus: 'Good' | 'Moderate' | 'Poor';
  windStatus: 'Calm' | 'Moderate' | 'High' | 'Severe';
}

export interface WeatherWarning {
  type: 'Wind' | 'Visibility' | 'Precipitation' | 'Lightning' | 'Temperature' | 'Other';
  severity: 'Low' | 'Medium' | 'High';
  message: string;
}

// Mock data for development (would be replaced with actual API call)
const generateMockWeatherData = (location: string): WeatherData => {
  const randomWindSpeed = Math.floor(Math.random() * 25);
  const randomTemp = Math.floor(Math.random() * 35) + 5; // 5-40°C
  const randomVisibility = Math.floor(Math.random() * 10) + 1; // 1-10 km
  const randomPrecipitation = Math.random() * 0.5;
  const randomCloudCover = Math.floor(Math.random() * 100);
  
  const currentDate = new Date();
  
  // Generate safety assessment based on weather conditions
  const warnings: WeatherWarning[] = [];
  let safeToFly = true;
  let recommendation: 'Go' | 'No-Go' | 'Caution' = 'Go';
  
  if (randomWindSpeed > 20) {
    safeToFly = false;
    recommendation = 'No-Go';
    warnings.push({
      type: 'Wind',
      severity: 'High',
      message: `Wind speed of ${randomWindSpeed} mph exceeds safe operating limits.`
    });
  } else if (randomWindSpeed > 15) {
    recommendation = 'Caution';
    warnings.push({
      type: 'Wind',
      severity: 'Medium',
      message: `Wind speed of ${randomWindSpeed} mph may affect flight stability.`
    });
  }
  
  if (randomVisibility < 3) {
    safeToFly = false;
    recommendation = 'No-Go';
    warnings.push({
      type: 'Visibility',
      severity: 'High',
      message: `Visibility of ${randomVisibility} km is below safe operating limits.`
    });
  } else if (randomVisibility < 5) {
    if (recommendation !== 'No-Go') recommendation = 'Caution';
    warnings.push({
      type: 'Visibility',
      severity: 'Medium',
      message: `Visibility of ${randomVisibility} km may impact visual line of sight.`
    });
  }
  
  if (randomPrecipitation > 0.2) {
    if (recommendation !== 'No-Go') recommendation = 'Caution';
    warnings.push({
      type: 'Precipitation',
      severity: 'Medium',
      message: `Precipitation of ${randomPrecipitation.toFixed(2)} inches may affect equipment.`
    });
  }
  
  // Create forecast data - 12 hourly forecasts
  const forecasts: ForecastData[] = [];
  for (let i = 0; i < 12; i++) {
    const forecastDate = new Date(currentDate);
    forecastDate.setHours(forecastDate.getHours() + i);
    
    // Add some variation to forecast values
    const variation = (Math.random() - 0.5) * 10;
    const tempVariation = Math.floor(variation);
    const windVariation = Math.floor(variation / 2);
    
    forecasts.push({
      time: forecastDate,
      temperature: randomTemp + tempVariation,
      windSpeed: Math.max(0, randomWindSpeed + windVariation),
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      precipitation: Math.max(0, randomPrecipitation + (Math.random() - 0.5) * 0.2),
      cloudCover: Math.min(100, Math.max(0, randomCloudCover + Math.floor((Math.random() - 0.5) * 20))),
      visibility: Math.max(0, randomVisibility + (Math.random() - 0.5) * 2),
      conditions: randomCloudCover > 80 ? 'Cloudy' : 
                 randomCloudCover > 50 ? 'Partly Cloudy' : 'Clear',
      icon: randomCloudCover > 80 ? 'cloudy' : 
           randomCloudCover > 50 ? 'partly-cloudy' : 'clear'
    });
  }
  
  // Determine wind status
  let windStatus: 'Calm' | 'Moderate' | 'High' | 'Severe' = 'Calm';
  if (randomWindSpeed > 20) windStatus = 'Severe';
  else if (randomWindSpeed > 15) windStatus = 'High';
  else if (randomWindSpeed > 8) windStatus = 'Moderate';
  
  // Determine visibility status
  let visibilityStatus: 'Good' | 'Moderate' | 'Poor' = 'Good';
  if (randomVisibility < 3) visibilityStatus = 'Poor';
  else if (randomVisibility < 5) visibilityStatus = 'Moderate';
  
  return {
    location,
    currentConditions: {
      temperature: randomTemp,
      windSpeed: randomWindSpeed,
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      humidity: Math.floor(Math.random() * 100),
      precipitation: randomPrecipitation,
      cloudCover: randomCloudCover,
      visibility: randomVisibility,
      conditions: randomCloudCover > 80 ? 'Cloudy' : 
                 randomCloudCover > 50 ? 'Partly Cloudy' : 'Clear',
      icon: randomCloudCover > 80 ? 'cloudy' : 
           randomCloudCover > 50 ? 'partly-cloudy' : 'clear',
      lastUpdated: new Date()
    },
    forecast: forecasts,
    flightSafetyAssessment: {
      safeToFly,
      recommendation,
      warnings,
      recommendedMaxAltitude: Math.floor(randomVisibility * 100),
      visibilityStatus,
      windStatus
    }
  };
};

const WeatherService = {
  // Fetch weather data for a location
  async getWeatherData(location: string): Promise<WeatherData> {
    try {
      // In a production app, we would call an actual weather API here
      // For development, we'll use mock data
      // Example API call commented out:
      // const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=no&alerts=yes`);
      // return this.transformWeatherData(response.data);
      
      // Return mock data for development
      return generateMockWeatherData(location);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },
  
  // Assess if it's safe to fly based on weather conditions
  assessFlightSafety(weatherData: WeatherData): FlightSafetyAssessment {
    return weatherData.flightSafetyAssessment;
  },
  
  // Get weather forecast for a specific time
  getForecastForTime(weatherData: WeatherData, time: Date): ForecastData | null {
    const forecasts = weatherData.forecast;
    if (!forecasts || forecasts.length === 0) return null;
    
    // Find the forecast closest to the requested time
    return forecasts.reduce((closest, current) => {
      const currentDiff = Math.abs(new Date(current.time).getTime() - time.getTime());
      const closestDiff = Math.abs(new Date(closest.time).getTime() - time.getTime());
      return currentDiff < closestDiff ? current : closest;
    });
  }
};

export default WeatherService; 