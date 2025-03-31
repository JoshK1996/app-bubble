import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button
} from '@mui/material';
import {
  BuildCircle as ComponentIcon,
  Flight as DroneIcon,
  LocalOffer as CostIcon,
  Timer as UsageIcon,
  ShowChart as TrendIcon,
  WarningAmber as WarningIcon,
  FilterAlt as FilterIcon,
  MoreVert as MoreIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Sample data
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Types
interface ComponentData {
  id: number;
  name: string;
  type: string;
  droneId: number;
  droneName: string;
  installDate: string;
  totalFlightHours: number;
  expectedLifespan: number;
  maintenanceCount: number;
  lastMaintenance: string;
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  replacementCost: number;
  maintenanceCosts: number;
  remainingLifePercentage: number;
}

interface MaintenanceCost {
  componentType: string;
  cost: number;
}

interface UsageByDrone {
  droneName: string;
  flightHours: number;
  missions: number;
  revenue: number;
}

interface ComponentLifecycle {
  componentType: string;
  averageLifespan: number;
  replacementRate: number;
  failureRate: number;
}

interface EquipmentAnalyticsProps {
  // If we had real APIs, we'd pass data fetching functions here
}

const EquipmentAnalytics: React.FC<EquipmentAnalyticsProps> = () => {
  // State
  const [timeRange, setTimeRange] = useState<string>('year');
  const [selectedDrone, setSelectedDrone] = useState<string>('all');
  const [selectedComponentType, setSelectedComponentType] = useState<string>('all');
  
  // Sample data - would be passed as props or fetched in a real application
  const componentData: ComponentData[] = [
    {
      id: 1,
      name: 'Main Camera',
      type: 'Camera',
      droneId: 1,
      droneName: 'Phantom Pro X',
      installDate: '2023-08-15',
      totalFlightHours: 120,
      expectedLifespan: 500,
      maintenanceCount: 3,
      lastMaintenance: '2023-11-20',
      healthStatus: 'Good',
      replacementCost: 799,
      maintenanceCosts: 150,
      remainingLifePercentage: 76
    },
    {
      id: 2,
      name: 'Battery Pack A',
      type: 'Battery',
      droneId: 1,
      droneName: 'Phantom Pro X',
      installDate: '2023-06-10',
      totalFlightHours: 150,
      expectedLifespan: 300,
      maintenanceCount: 1,
      lastMaintenance: '2023-10-05',
      healthStatus: 'Fair',
      replacementCost: 349,
      maintenanceCosts: 0,
      remainingLifePercentage: 50
    },
    {
      id: 3,
      name: 'Main Motor (Front Left)',
      type: 'Motor',
      droneId: 1,
      droneName: 'Phantom Pro X',
      installDate: '2023-04-20',
      totalFlightHours: 180,
      expectedLifespan: 600,
      maintenanceCount: 2,
      lastMaintenance: '2023-12-01',
      healthStatus: 'Good',
      replacementCost: 120,
      maintenanceCosts: 80,
      remainingLifePercentage: 70
    },
    {
      id: 4,
      name: 'GPS Module',
      type: 'Navigation',
      droneId: 2,
      droneName: 'SkyView Max',
      installDate: '2023-05-15',
      totalFlightHours: 90,
      expectedLifespan: 800,
      maintenanceCount: 0,
      lastMaintenance: 'N/A',
      healthStatus: 'Excellent',
      replacementCost: 250,
      maintenanceCosts: 0,
      remainingLifePercentage: 89
    },
    {
      id: 5,
      name: 'Propeller Set',
      type: 'Propeller',
      droneId: 2,
      droneName: 'SkyView Max',
      installDate: '2023-09-01',
      totalFlightHours: 40,
      expectedLifespan: 100,
      maintenanceCount: 1,
      lastMaintenance: '2023-11-10',
      healthStatus: 'Good',
      replacementCost: 45,
      maintenanceCosts: 20,
      remainingLifePercentage: 60
    },
    {
      id: 6,
      name: 'Gimbal System',
      type: 'Stabilization',
      droneId: 3,
      droneName: 'Surveyor One',
      installDate: '2023-03-10',
      totalFlightHours: 220,
      expectedLifespan: 400,
      maintenanceCount: 4,
      lastMaintenance: '2023-12-05',
      healthStatus: 'Fair',
      replacementCost: 320,
      maintenanceCosts: 180,
      remainingLifePercentage: 45
    }
  ];
  
  // Derived data for charts
  const maintenanceCostData: MaintenanceCost[] = [
    { componentType: 'Camera', cost: 250 },
    { componentType: 'Battery', cost: 80 },
    { componentType: 'Motor', cost: 180 },
    { componentType: 'Navigation', cost: 50 },
    { componentType: 'Propeller', cost: 120 },
    { componentType: 'Stabilization', cost: 220 }
  ];
  
  const usageByDroneData: UsageByDrone[] = [
    { droneName: 'Phantom Pro X', flightHours: 450, missions: 42, revenue: 12500 },
    { droneName: 'SkyView Max', flightHours: 320, missions: 28, revenue: 8900 },
    { droneName: 'Surveyor One', flightHours: 580, missions: 35, revenue: 15200 }
  ];
  
  const componentLifecycleData: ComponentLifecycle[] = [
    { componentType: 'Camera', averageLifespan: 750, replacementRate: 0.15, failureRate: 0.08 },
    { componentType: 'Battery', averageLifespan: 350, replacementRate: 0.4, failureRate: 0.12 },
    { componentType: 'Motor', averageLifespan: 900, replacementRate: 0.1, failureRate: 0.05 },
    { componentType: 'Navigation', averageLifespan: 1200, replacementRate: 0.05, failureRate: 0.03 },
    { componentType: 'Propeller', averageLifespan: 150, replacementRate: 0.8, failureRate: 0.25 },
    { componentType: 'Stabilization', averageLifespan: 600, replacementRate: 0.2, failureRate: 0.1 }
  ];
  
  // Make pie data from component types and their costs
  const componentCostDistribution = maintenanceCostData.map(item => ({
    name: item.componentType,
    value: item.cost
  }));
  
  // Calculate total costs
  const totalMaintenanceCost = maintenanceCostData.reduce((sum, item) => sum + item.cost, 0);
  const totalReplacementCost = componentData.reduce((sum, item) => sum + item.replacementCost, 0);
  
  // Filter functions
  const filteredComponents = componentData.filter(component => {
    if (selectedDrone !== 'all' && component.droneName !== selectedDrone) return false;
    if (selectedComponentType !== 'all' && component.type !== selectedComponentType) return false;
    return true;
  });
  
  // Handlers
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };
  
  const handleDroneChange = (event: SelectChangeEvent) => {
    setSelectedDrone(event.target.value);
  };
  
  const handleComponentTypeChange = (event: SelectChangeEvent) => {
    setSelectedComponentType(event.target.value);
  };
  
  // Function to get color for health status
  const getHealthStatusColor = (status: string): string => {
    switch (status) {
      case 'Excellent': return '#4caf50';
      case 'Good': return '#8bc34a';
      case 'Fair': return '#ffeb3b';
      case 'Poor': return '#ff9800';
      case 'Critical': return '#f44336';
      default: return '#757575';
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Equipment Analytics
        </Typography>
        
        <Box display="flex" alignItems="center">
          <ButtonGroup variant="outlined" size="small" sx={{ mr: 2 }}>
            <Button
              variant={timeRange === 'month' ? 'contained' : 'outlined'} 
              onClick={() => setTimeRange('month')}
            >
              Month
            </Button>
            <Button 
              variant={timeRange === 'quarter' ? 'contained' : 'outlined'} 
              onClick={() => setTimeRange('quarter')}
            >
              Quarter
            </Button>
            <Button 
              variant={timeRange === 'year' ? 'contained' : 'outlined'} 
              onClick={() => setTimeRange('year')}
            >
              Year
            </Button>
          </ButtonGroup>
          
          <Tooltip title="Download Report">
            <IconButton size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center">
          <FilterIcon color="action" sx={{ mr: 2 }} />
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Filters:
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>Drone</InputLabel>
            <Select
              value={selectedDrone}
              label="Drone"
              onChange={handleDroneChange}
            >
              <MenuItem value="all">All Drones</MenuItem>
              <MenuItem value="Phantom Pro X">Phantom Pro X</MenuItem>
              <MenuItem value="SkyView Max">SkyView Max</MenuItem>
              <MenuItem value="Surveyor One">Surveyor One</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Component Type</InputLabel>
            <Select
              value={selectedComponentType}
              label="Component Type"
              onChange={handleComponentTypeChange}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Camera">Camera</MenuItem>
              <MenuItem value="Battery">Battery</MenuItem>
              <MenuItem value="Motor">Motor</MenuItem>
              <MenuItem value="Navigation">Navigation</MenuItem>
              <MenuItem value="Propeller">Propeller</MenuItem>
              <MenuItem value="Stabilization">Stabilization</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Component Health
                </Typography>
                <ComponentIcon color="primary" />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {Math.round(
                  filteredComponents.reduce((sum, component) => sum + component.remainingLifePercentage, 0) / 
                  (filteredComponents.length || 1)
                )}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average remaining lifespan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Maintenance Cost
                </Typography>
                <CostIcon color="error" />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                ${totalMaintenanceCost}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total maintenance expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Flight Hours
                </Typography>
                <UsageIcon color="info" />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {filteredComponents.reduce((sum, component) => sum + component.totalFlightHours, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total component flight hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Replacement Value
                </Typography>
                <WarningIcon color="warning" />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                ${filteredComponents.reduce((sum, component) => sum + component.replacementCost, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total replacement cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Maintenance Costs by Component Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={maintenanceCostData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="componentType" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`$${value}`, 'Cost']} />
                <Bar dataKey="cost" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Cost Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={componentCostDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {componentCostDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`$${value}`, 'Cost']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Usage by Drone */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Usage & Revenue by Drone
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={usageByDroneData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="droneName" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="flightHours" fill="#8884d8" />
            <Bar dataKey="revenue" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
      
      {/* Component Details Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Component Details
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Drone</TableCell>
                <TableCell>Install Date</TableCell>
                <TableCell>Flight Hours</TableCell>
                <TableCell>Health Status</TableCell>
                <TableCell>Remaining Life</TableCell>
                <TableCell>Maintenance</TableCell>
                <TableCell>Replacement Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComponents.map((component) => (
                <TableRow key={component.id}>
                  <TableCell>{component.name}</TableCell>
                  <TableCell>{component.type}</TableCell>
                  <TableCell>{component.droneName}</TableCell>
                  <TableCell>{new Date(component.installDate).toLocaleDateString()}</TableCell>
                  <TableCell>{component.totalFlightHours} hrs</TableCell>
                  <TableCell>
                    <Chip 
                      label={component.healthStatus} 
                      size="small"
                      sx={{
                        bgcolor: getHealthStatusColor(component.healthStatus),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {component.remainingLifePercentage}%
                  </TableCell>
                  <TableCell>${component.maintenanceCosts}</TableCell>
                  <TableCell>${component.replacementCost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default EquipmentAnalytics; 