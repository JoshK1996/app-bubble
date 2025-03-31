import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper
} from '@mui/material';
import {
  FlightTakeoff,
  AttachMoney,
  Devices,
  Person,
  Check,
  Warning,
  NoteAlt,
  CloudQueue
} from '@mui/icons-material';

/**
 * Dashboard component displaying business overview with glassmorphism UI
 */
const Dashboard: React.FC = () => {
  // Sample data - in a real app, this would come from an API
  const stats = {
    totalMissions: 145,
    completedMissions: 128,
    revenue: '$38,450',
    expenses: '$12,800',
    clients: 42,
    activeClients: 28,
    drones: 8,
    operationalDrones: 7,
  };

  // Sample upcoming missions
  const upcomingMissions = [
    { id: 1, name: 'Aerial Photography - Downtown', client: 'ABC Corp', date: '2025-03-28', status: 'Confirmed' },
    { id: 2, name: 'Survey - Highway Construction', client: 'XYZ Engineering', date: '2025-03-29', status: 'Pending' },
    { id: 3, name: 'Real Estate - Luxury Property', client: 'Premium Realty', date: '2025-03-30', status: 'Confirmed' },
  ];

  // Sample drone status
  const droneStatus = [
    { id: 'DJI-001', name: 'Phantom 4 Pro', status: 'Operational', batteryLevel: 85, lastMaintenance: '2025-02-15' },
    { id: 'DJI-002', name: 'Mavic 3', status: 'Operational', batteryLevel: 92, lastMaintenance: '2025-03-01' },
    { id: 'DJI-003', name: 'Inspire 2', status: 'Maintenance', batteryLevel: 0, lastMaintenance: '2025-03-20' },
  ];

  // Sample weather data
  const weatherData = {
    current: { temp: 72, condition: 'Partly Cloudy', windSpeed: '8 mph', humidity: '65%' },
    forecast: [
      { day: 'Tomorrow', temp: 75, condition: 'Sunny' },
      { day: 'Thu', temp: 68, condition: 'Cloudy' },
      { day: 'Fri', temp: 70, condition: 'Rain' },
    ]
  };

  // Calculate completion rates
  const missionCompletionRate = Math.round((stats.completedMissions / stats.totalMissions) * 100);
  const clientActivityRate = Math.round((stats.activeClients / stats.clients) * 100);
  const droneOperationalRate = Math.round((stats.operationalDrones / stats.drones) * 100);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back! Here's an overview of your drone business.
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
        {/* Missions Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: 'rgba(58, 134, 255, 0.1)', mr: 2 }}>
                  <FlightTakeoff sx={{ color: 'primary.main' }} />
                </Avatar>
                <Typography variant="h6">
                  Missions
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.totalMissions}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {stats.completedMissions} completed
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={missionCompletionRate} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(58, 134, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'primary.main'
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {missionCompletionRate}% completion rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Financial Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', mr: 2 }}>
                  <AttachMoney sx={{ color: 'success.main' }} />
                </Avatar>
                <Typography variant="h6">
                  Revenue
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.revenue}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Expenses: {stats.expenses}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={70} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'success.main'
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                70% of quarterly goal
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Clients Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', mr: 2 }}>
                  <Person sx={{ color: 'secondary.main' }} />
                </Avatar>
                <Typography variant="h6">
                  Clients
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.clients}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {stats.activeClients} active this month
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={clientActivityRate} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'secondary.main'
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {clientActivityRate}% active client rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Equipment Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', mr: 2 }}>
                  <Devices sx={{ color: 'warning.main' }} />
                </Avatar>
                <Typography variant="h6">
                  Drones
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.drones}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {stats.operationalDrones} operational
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={droneOperationalRate} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'warning.main'
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {droneOperationalRate}% operational rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Detailed Cards */}
      <Grid container spacing={3}>
        {/* Upcoming Missions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Missions
              </Typography>
              <List>
                {upcomingMissions.map((mission) => (
                  <React.Fragment key={mission.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: mission.status === 'Confirmed' ? 'primary.main' : 'warning.main' }}>
                          {mission.status === 'Confirmed' ? <Check /> : <Warning />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={mission.name}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {mission.client}
                            </Typography>
                            {` • ${mission.date} • `}
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color={mission.status === 'Confirmed' ? 'primary.main' : 'warning.main'}
                            >
                              {mission.status}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Equipment Status */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Drone Status
              </Typography>
              <List>
                {droneStatus.map((drone) => (
                  <React.Fragment key={drone.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: drone.status === 'Operational' 
                              ? 'rgba(76, 175, 80, 0.1)' 
                              : 'rgba(244, 67, 54, 0.1)' 
                          }}
                        >
                          <Devices 
                            sx={{ 
                              color: drone.status === 'Operational' 
                                ? 'success.main' 
                                : 'error.main' 
                            }} 
                          />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1">{drone.name}</Typography>
                            <Typography 
                              variant="body2"
                              color={drone.status === 'Operational' ? 'success.main' : 'error.main'}
                            >
                              {drone.status}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span">
                              ID: {drone.id}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" component="span">
                                Battery: {drone.batteryLevel}%
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={drone.batteryLevel} 
                                sx={{ 
                                  height: 4, 
                                  borderRadius: 2,
                                  my: 0.5,
                                  bgcolor: 'rgba(0, 0, 0, 0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: drone.batteryLevel > 70 
                                      ? 'success.main' 
                                      : drone.batteryLevel > 30 
                                        ? 'warning.main' 
                                        : 'error.main'
                                  }
                                }} 
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Last Maintenance: {drone.lastMaintenance}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Weather Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', mr: 2 }}>
                  <CloudQueue sx={{ color: 'info.main' }} />
                </Avatar>
                <Typography variant="h6">Weather Conditions</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h3" fontWeight="bold">
                  {weatherData.current.temp}°F
                </Typography>
                <Typography variant="body1">
                  {weatherData.current.condition}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Wind: {weatherData.current.windSpeed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Humidity: {weatherData.current.humidity}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Forecast
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {weatherData.forecast.map((day, index) => (
                  <Box key={index} sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {day.day}
                    </Typography>
                    <Typography variant="body1">
                      {day.temp}°F
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {day.condition}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Notes/Tasks Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: 'rgba(156, 39, 176, 0.1)', mr: 2 }}>
                  <NoteAlt sx={{ color: '#9c27b0' }} />
                </Avatar>
                <Typography variant="h6">Tasks & Notes</Typography>
              </Box>
              
              <List sx={{ mt: 1 }}>
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemText 
                    primary="Complete mission reports for ABC Corp"
                    secondary="Due tomorrow"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'error.main', variant: 'caption' }}
                  />
                </ListItem>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemText 
                    primary="Schedule maintenance for Inspire 2"
                    secondary="High priority"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'error.main', variant: 'caption' }}
                  />
                </ListItem>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemText 
                    primary="Follow up with potential client XYZ Corp"
                    secondary="This week"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'warning.main', variant: 'caption' }}
                  />
                </ListItem>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemText 
                    primary="Update flight logs in compliance system"
                    secondary="This week"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'warning.main', variant: 'caption' }}
                  />
                </ListItem>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemText 
                    primary="Renew liability insurance"
                    secondary="Next month"
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ color: 'info.main', variant: 'caption' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Compliance Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ backgroundColor: 'rgba(0, 150, 136, 0.1)', mr: 2 }}>
                  <Check sx={{ color: '#009688' }} />
                </Avatar>
                <Typography variant="h6">Compliance Status</Typography>
              </Box>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  All Licenses Current
                </Typography>
                <Typography variant="body2">
                  Your Part 107 and business licenses are up to date.
                </Typography>
              </Paper>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  Flight Logs Need Update
                </Typography>
                <Typography variant="body2">
                  3 recent missions need log entries to maintain compliance.
                </Typography>
              </Paper>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Insurance Review
                </Typography>
                <Typography variant="body2">
                  Liability insurance renewal due in 30 days.
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 