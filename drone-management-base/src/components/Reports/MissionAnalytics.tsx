import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import {
  AttachMoney as RevenueIcon,
  Assignment as MissionIcon,
  AccountCircle as ClientIcon,
  LocationOn as LocationIcon,
  Schedule as TimeIcon,
  Speed as EfficiencyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterAlt as FilterIcon,
  FileDownload as DownloadIcon,
  Star as RatingIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#4CAF50', '#FF5252'];

// Types
interface MissionSummary {
  id: number;
  title: string;
  client: string;
  date: string;
  duration: number; // in minutes
  location: string;
  status: 'Completed' | 'Cancelled' | 'Delayed' | 'On Time';
  revenue: number;
  cost: number;
  profit: number;
  pilot: string;
  droneUsed: string;
  rating: number; // client rating out of 5
  efficiency: number; // efficiency score out of 100
}

interface ClientRevenue {
  client: string;
  revenue: number;
  missions: number;
  averageRating: number;
}

interface DroneRevenue {
  drone: string;
  revenue: number;
  flightHours: number;
  missions: number;
  efficiency: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
}

interface MissionType {
  type: string;
  count: number;
  revenue: number;
}

interface MissionAnalyticsProps {
  // If we had real APIs, we'd pass data fetching functions here
}

const MissionAnalytics: React.FC<MissionAnalyticsProps> = () => {
  // State
  const [timeRange, setTimeRange] = useState<string>('year');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedDrone, setSelectedDrone] = useState<string>('all');
  const [selectedMissionType, setSelectedMissionType] = useState<string>('all');
  
  // Sample data
  const missionData: MissionSummary[] = [
    {
      id: 1,
      title: 'Downtown Highrise Inspection',
      client: 'ABC Construction',
      date: '2023-12-05',
      duration: 45,
      location: 'Central Business District',
      status: 'Completed',
      revenue: 550,
      cost: 180,
      profit: 370,
      pilot: 'Jane Davis',
      droneUsed: 'Phantom Pro X',
      rating: 4.8,
      efficiency: 92
    },
    {
      id: 2,
      title: 'Agricultural Field Mapping',
      client: 'Greenfield Farms',
      date: '2023-12-02',
      duration: 120,
      location: 'North County Fields',
      status: 'Completed',
      revenue: 890,
      cost: 300,
      profit: 590,
      pilot: 'Robert Williams',
      droneUsed: 'Surveyor One',
      rating: 5.0,
      efficiency: 95
    },
    {
      id: 3,
      title: 'Real Estate Promotional Video',
      client: 'XYZ Real Estate',
      date: '2023-11-28',
      duration: 60,
      location: 'Lakeside Properties',
      status: 'Completed',
      revenue: 750,
      cost: 250,
      profit: 500,
      pilot: 'Sarah Johnson',
      droneUsed: 'SkyView Max',
      rating: 4.5,
      efficiency: 88
    },
    {
      id: 4,
      title: 'Event Coverage',
      client: 'Metro Events Inc.',
      date: '2023-11-25',
      duration: 180,
      location: 'City Park',
      status: 'Completed',
      revenue: 1200,
      cost: 450,
      profit: 750,
      pilot: 'Mike Thompson',
      droneUsed: 'SkyView Max',
      rating: 4.7,
      efficiency: 94
    },
    {
      id: 5,
      title: 'Bridge Inspection',
      client: 'City Planning Department',
      date: '2023-11-20',
      duration: 90,
      location: 'River Crossing',
      status: 'Delayed',
      revenue: 680,
      cost: 280,
      profit: 400,
      pilot: 'Jane Davis',
      droneUsed: 'Phantom Pro X',
      rating: 4.2,
      efficiency: 78
    },
    {
      id: 6,
      title: 'Construction Progress Documentation',
      client: 'ABC Construction',
      date: '2023-11-15',
      duration: 75,
      location: 'New Development Site',
      status: 'Completed',
      revenue: 620,
      cost: 210,
      profit: 410,
      pilot: 'Robert Williams',
      droneUsed: 'Phantom Pro X',
      rating: 4.9,
      efficiency: 90
    },
    {
      id: 7,
      title: 'Solar Panel Inspection',
      client: 'Green Energy Solutions',
      date: '2023-11-10',
      duration: 60,
      location: 'Solar Farm',
      status: 'Completed',
      revenue: 550,
      cost: 200,
      profit: 350,
      pilot: 'Sarah Johnson',
      droneUsed: 'Surveyor One',
      rating: 4.6,
      efficiency: 86
    },
    {
      id: 8,
      title: 'Wildlife Survey',
      client: 'Wildlife Conservation Trust',
      date: '2023-11-05',
      duration: 240,
      location: 'Nature Reserve',
      status: 'Completed',
      revenue: 1500,
      cost: 580,
      profit: 920,
      pilot: 'Mike Thompson',
      droneUsed: 'SkyView Max',
      rating: 4.8,
      efficiency: 92
    }
  ];
  
  // Derived data for charts
  const clientRevenueData: ClientRevenue[] = [
    { client: 'ABC Construction', revenue: 1170, missions: 2, averageRating: 4.85 },
    { client: 'Greenfield Farms', revenue: 890, missions: 1, averageRating: 5.0 },
    { client: 'XYZ Real Estate', revenue: 750, missions: 1, averageRating: 4.5 },
    { client: 'Metro Events Inc.', revenue: 1200, missions: 1, averageRating: 4.7 },
    { client: 'City Planning Department', revenue: 680, missions: 1, averageRating: 4.2 },
    { client: 'Green Energy Solutions', revenue: 550, missions: 1, averageRating: 4.6 },
    { client: 'Wildlife Conservation Trust', revenue: 1500, missions: 1, averageRating: 4.8 }
  ];
  
  const droneRevenueData: DroneRevenue[] = [
    { drone: 'Phantom Pro X', revenue: 1850, flightHours: 3, missions: 3, efficiency: 86.7 },
    { drone: 'SkyView Max', revenue: 3450, flightHours: 8, missions: 3, efficiency: 91.3 },
    { drone: 'Surveyor One', revenue: 1440, flightHours: 6, missions: 2, efficiency: 90.5 }
  ];
  
  const monthlyRevenueData: MonthlyRevenue[] = [
    { month: 'Jan', revenue: 3200, costs: 1100, profit: 2100 },
    { month: 'Feb', revenue: 2800, costs: 950, profit: 1850 },
    { month: 'Mar', revenue: 3100, costs: 1050, profit: 2050 },
    { month: 'Apr', revenue: 3800, costs: 1300, profit: 2500 },
    { month: 'May', revenue: 4200, costs: 1400, profit: 2800 },
    { month: 'Jun', revenue: 4500, costs: 1500, profit: 3000 },
    { month: 'Jul', revenue: 5100, costs: 1700, profit: 3400 },
    { month: 'Aug', revenue: 5300, costs: 1750, profit: 3550 },
    { month: 'Sep', revenue: 4900, costs: 1650, profit: 3250 },
    { month: 'Oct', revenue: 5500, costs: 1800, profit: 3700 },
    { month: 'Nov', revenue: 6740, costs: 2250, profit: 4490 },
    { month: 'Dec', revenue: 1550, costs: 550, profit: 1000 }
  ];
  
  const missionTypeData: MissionType[] = [
    { type: 'Inspection', count: 3, revenue: 1780 },
    { type: 'Mapping', count: 1, revenue: 890 },
    { type: 'Photography/Video', count: 2, revenue: 1950 },
    { type: 'Event Coverage', count: 1, revenue: 1200 },
    { type: 'Survey', count: 1, revenue: 1500 }
  ];
  
  // Calculate totals
  const totalRevenue = missionData.reduce((sum, mission) => sum + mission.revenue, 0);
  const totalProfit = missionData.reduce((sum, mission) => sum + mission.profit, 0);
  const totalMissions = missionData.length;
  const averageEfficiency = Math.round(
    missionData.reduce((sum, mission) => sum + mission.efficiency, 0) / totalMissions
  );
  
  // Helpers to get yearly totals and previous period for comparison
  const currentYearRevenue = monthlyRevenueData.reduce((sum, month) => sum + month.revenue, 0);
  const previousYearRevenue = currentYearRevenue * 0.85; // Simulated 15% growth
  const revenueGrowth = Math.round(((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100);
  
  // Filter functions
  const filteredMissions = missionData.filter(mission => {
    if (selectedClient !== 'all' && mission.client !== selectedClient) return false;
    if (selectedDrone !== 'all' && mission.droneUsed !== selectedDrone) return false;
    // Add mission type filtering if needed
    return true;
  });
  
  // Handlers
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };
  
  const handleClientChange = (event: SelectChangeEvent) => {
    setSelectedClient(event.target.value);
  };
  
  const handleDroneChange = (event: SelectChangeEvent) => {
    setSelectedDrone(event.target.value);
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      case 'Delayed': return 'warning';
      case 'On Time': return 'info';
      default: return 'default';
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Mission Analytics
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
            <InputLabel>Client</InputLabel>
            <Select
              value={selectedClient}
              label="Client"
              onChange={handleClientChange}
            >
              <MenuItem value="all">All Clients</MenuItem>
              <MenuItem value="ABC Construction">ABC Construction</MenuItem>
              <MenuItem value="Greenfield Farms">Greenfield Farms</MenuItem>
              <MenuItem value="XYZ Real Estate">XYZ Real Estate</MenuItem>
              <MenuItem value="Metro Events Inc.">Metro Events Inc.</MenuItem>
              <MenuItem value="City Planning Department">City Planning Department</MenuItem>
              <MenuItem value="Green Energy Solutions">Green Energy Solutions</MenuItem>
              <MenuItem value="Wildlife Conservation Trust">Wildlife Conservation Trust</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
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
        </Box>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Revenue
                </Typography>
                <RevenueIcon color="primary" />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                ${filteredMissions.reduce((sum, mission) => sum + mission.revenue, 0).toLocaleString()}
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" color="text.secondary" mr={1}>
                  vs Previous Period:
                </Typography>
                <Box display="flex" alignItems="center" color={revenueGrowth >= 0 ? 'success.main' : 'error.main'}>
                  {revenueGrowth >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                  <Typography variant="body2" fontWeight="bold" ml={0.5}>
                    {revenueGrowth}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Total Profit
                </Typography>
                <RevenueIcon color="success" />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                ${filteredMissions.reduce((sum, mission) => sum + mission.profit, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round((filteredMissions.reduce((sum, mission) => sum + mission.profit, 0) / 
                filteredMissions.reduce((sum, mission) => sum + mission.revenue, 0)) * 100)}% margin
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Completed Missions
                </Typography>
                <MissionIcon color="info" />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {filteredMissions.filter(m => m.status === 'Completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                out of {filteredMissions.length} total missions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Mission Efficiency
                </Typography>
                <EfficiencyIcon color="warning" />
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {Math.round(
                  filteredMissions.reduce((sum, mission) => sum + mission.efficiency, 0) / 
                  (filteredMissions.length || 1)
                )}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average efficiency score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Revenue Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Revenue Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyRevenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Mission Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={missionTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="type"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {missionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Revenue by Client & Drone */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Client
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={clientRevenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="client" width={150} />
                <RechartsTooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Drone
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={droneRevenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="drone" />
                <YAxis />
                <RechartsTooltip formatter={(value, name) => [
                  name === 'revenue' ? `$${value}` : name === 'efficiency' ? `${value}%` : value,
                  name === 'revenue' ? 'Revenue' : name === 'flightHours' ? 'Flight Hours' : name === 'missions' ? 'Missions' : 'Efficiency'
                ]} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
                <Bar dataKey="flightHours" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Mission Details Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Mission Details
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mission</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Drone</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Profit</TableCell>
                <TableCell>Efficiency</TableCell>
                <TableCell>Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMissions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell>{mission.title}</TableCell>
                  <TableCell>{mission.client}</TableCell>
                  <TableCell>{new Date(mission.date).toLocaleDateString()}</TableCell>
                  <TableCell>{mission.droneUsed}</TableCell>
                  <TableCell>{mission.duration} mins</TableCell>
                  <TableCell>
                    <Chip 
                      label={mission.status} 
                      size="small"
                      color={getStatusColor(mission.status) as any}
                    />
                  </TableCell>
                  <TableCell>${mission.revenue}</TableCell>
                  <TableCell>${mission.profit}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${mission.efficiency}%`} 
                      size="small"
                      color={mission.efficiency >= 90 ? 'success' : mission.efficiency >= 80 ? 'primary' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      <RatingIcon fontSize="small" color="warning" />
                      <Typography variant="body2" ml={0.5}>{mission.rating}</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MissionAnalytics; 