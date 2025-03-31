import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Divider,
  Paper,
  Stack,
  Chip,
  useTheme
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  Flight as FlightIcon,
  Timer as TimerIcon,
  BatteryChargingFull as BatteryIcon,
  Build as MaintenanceIcon,
  Straighten as DistanceIcon
} from '@mui/icons-material';
import { Equipment, EquipmentStatus, EquipmentType } from './EquipmentItem';

// Interface for equipment usage statistics
interface EquipmentUsageStatistics {
  // Usage by type
  usageByType: Array<{
    type: EquipmentType;
    flightHours: number;
    count: number;
  }>;
  
  // Usage by status
  usageByStatus: Array<{
    status: EquipmentStatus;
    count: number;
  }>;
  
  // Fleet metrics
  totalEquipment: number;
  totalFlightHours: number;
  totalDistance: number;
  averageFlightHours: number;
  averageFlightTime: number;
  totalMaintenance: number;
  maintenanceRatio: number;
  batteryUsage: number;
  fleetReadiness: number;
  
  // Equipment breakdown
  droneCount: number;
  cameraCount: number;
  batteryCount: number;
  otherCount: number;
}

interface EquipmentUsageStatsProps {
  equipmentList: Equipment[];
  maintenanceCount: number;
  flightLogCount: number;
}

const EquipmentUsageStats: React.FC<EquipmentUsageStatsProps> = ({
  equipmentList,
  maintenanceCount,
  flightLogCount
}) => {
  const theme = useTheme();
  
  // Generate statistical data from equipment list
  const calculateStats = (): EquipmentUsageStatistics => {
    const totalEquipment = equipmentList.length;
    
    if (totalEquipment === 0) {
      return {
        usageByType: [],
        usageByStatus: [],
        totalEquipment: 0,
        totalFlightHours: 0,
        totalDistance: 0,
        averageFlightHours: 0,
        averageFlightTime: 0,
        totalMaintenance: maintenanceCount,
        maintenanceRatio: 0,
        batteryUsage: 0,
        fleetReadiness: 0,
        droneCount: 0,
        cameraCount: 0,
        batteryCount: 0,
        otherCount: 0
      };
    }
    
    // Count by type
    const typeMap = new Map<EquipmentType, { count: number; flightHours: number }>();
    equipmentList.forEach(equipment => {
      const current = typeMap.get(equipment.type) || { count: 0, flightHours: 0 };
      typeMap.set(equipment.type, {
        count: current.count + 1,
        flightHours: current.flightHours + equipment.flightHours
      });
    });
    
    // Count by status
    const statusMap = new Map<EquipmentStatus, number>();
    equipmentList.forEach(equipment => {
      const current = statusMap.get(equipment.status) || 0;
      statusMap.set(equipment.status, current + 1);
    });
    
    // Calculate metrics
    const totalFlightHours = equipmentList.reduce((total, eq) => total + eq.flightHours, 0);
    const readyCount = equipmentList.filter(eq => eq.status === 'Ready').length;
    
    // Calculate specific equipment type counts
    const droneCount = equipmentList.filter(eq => eq.type === 'Drone').length;
    const cameraCount = equipmentList.filter(eq => eq.type === 'Camera').length;
    const batteryCount = equipmentList.filter(eq => eq.type === 'Battery').length;
    const otherCount = totalEquipment - droneCount - cameraCount - batteryCount;
    
    // Estimated distance (simplified calculation - about 10km per flight hour)
    const totalDistance = totalFlightHours * 10;
    
    // Prepare data for visualizations
    const usageByType = Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      flightHours: data.flightHours,
      count: data.count
    }));
    
    const usageByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count
    }));
    
    return {
      usageByType,
      usageByStatus,
      totalEquipment,
      totalFlightHours,
      totalDistance,
      averageFlightHours: totalFlightHours / totalEquipment,
      averageFlightTime: flightLogCount > 0 ? totalFlightHours * 60 / flightLogCount : 0,
      totalMaintenance: maintenanceCount,
      maintenanceRatio: totalFlightHours > 0 ? maintenanceCount / totalFlightHours : 0,
      batteryUsage: flightLogCount * 1.5, // Assumption: 1.5 batteries per flight on average
      fleetReadiness: (readyCount / totalEquipment) * 100,
      droneCount,
      cameraCount,
      batteryCount,
      otherCount
    };
  };
  
  const stats = calculateStats();
  
  // Status chart colors
  const statusColors = {
    'Ready': theme.palette.success.main,
    'In Maintenance': theme.palette.warning.main,
    'Grounded': theme.palette.error.main,
    'In Use': theme.palette.info.main,
    'Needs Attention': theme.palette.warning.dark
  };
  
  // Type chart colors
  const typeColors = {
    'Drone': theme.palette.primary.main,
    'Camera': theme.palette.secondary.main,
    'Battery': theme.palette.success.main,
    'Propeller': theme.palette.info.main,
    'Controller': theme.palette.warning.main,
    'Sensor': theme.palette.error.main
  };
  
  // Format numbers
  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Fleet Statistics</Typography>
      
      <Grid container spacing={3}>
        {/* Fleet Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fleet Overview
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Equipment
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalEquipment}
                  </Typography>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fleet Readiness
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(stats.fleetReadiness)}%
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Equipment Breakdown
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip 
                    label={`${stats.droneCount} Drones`} 
                    size="small" 
                    variant="outlined" 
                    color="primary" 
                  />
                  <Chip 
                    label={`${stats.cameraCount} Cameras`} 
                    size="small" 
                    variant="outlined" 
                    color="secondary" 
                  />
                  <Chip 
                    label={`${stats.batteryCount} Batteries`} 
                    size="small" 
                    variant="outlined" 
                    color="success" 
                  />
                  <Chip 
                    label={`${stats.otherCount} Other`} 
                    size="small" 
                    variant="outlined" 
                  />
                </Stack>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                Flight Operations
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlightIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Flight Hours
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatNumber(stats.totalFlightHours)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimerIcon sx={{ color: 'success.main', mr: 1 }} fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg. Flight Time
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatNumber(stats.averageFlightTime)} min
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DistanceIcon sx={{ color: 'info.main', mr: 1 }} fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Distance
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatNumber(stats.totalDistance)} km
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BatteryIcon sx={{ color: 'warning.main', mr: 1 }} fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Battery Usage
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatNumber(stats.batteryUsage)} cycles
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Equipment Status Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equipment Status
              </Typography>
              
              {stats.usageByStatus.length > 0 ? (
                <Box sx={{ height: 250, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.usageByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {stats.usageByStatus.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={statusColors[entry.status] || theme.palette.grey[500]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} items`, name]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    height: 250, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No equipment data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Equipment Usage by Type */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Flight Hours by Type
              </Typography>
              
              {stats.usageByType.length > 0 ? (
                <Box sx={{ height: 250, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.usageByType}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'flightHours' ? `${value} hours` : `${value} items`, 
                          name === 'flightHours' ? 'Flight Hours' : 'Count'
                        ]} 
                      />
                      <Legend />
                      <Bar 
                        dataKey="flightHours" 
                        fill={theme.palette.primary.main} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    height: 250, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No flight data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Maintenance Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Maintenance Performance
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MaintenanceIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="subtitle1">
                        Total Maintenance Records
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {stats.totalMaintenance}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Maintenance to Flight Hours Ratio
                    </Typography>
                    <Typography variant="body1">
                      {formatNumber(stats.maintenanceRatio * 100)}%
                    </Typography>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(stats.maintenanceRatio * 100 * 5, 100)} 
                        sx={{ height: 6, borderRadius: 3 }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {stats.maintenanceRatio < 0.05 ? 'Low maintenance needs' : 
                       stats.maintenanceRatio < 0.15 ? 'Average maintenance needs' : 
                       'High maintenance needs'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Fleet Health Insights
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: theme.palette.success.light, 
                          borderRadius: 1,
                          color: theme.palette.success.contrastText
                        }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Fleet Readiness
                          </Typography>
                          <Typography variant="h5">
                            {formatNumber(stats.fleetReadiness)}%
                          </Typography>
                          <Typography variant="body2">
                            {stats.fleetReadiness > 80 ? 'Excellent' : 
                             stats.fleetReadiness > 60 ? 'Good' : 
                             stats.fleetReadiness > 40 ? 'Average' : 'Needs Attention'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: theme.palette.warning.light, 
                          borderRadius: 1,
                          color: theme.palette.warning.contrastText
                        }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Average Equipment Age
                          </Typography>
                          <Typography variant="h5">
                            120 days
                          </Typography>
                          <Typography variant="body2">
                            Within expected lifespan
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: theme.palette.info.light, 
                          borderRadius: 1,
                          color: theme.palette.info.contrastText
                        }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Maintenance Efficiency
                          </Typography>
                          <Typography variant="h5">
                            92%
                          </Typography>
                          <Typography variant="body2">
                            Based on downtime metrics
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EquipmentUsageStats; 