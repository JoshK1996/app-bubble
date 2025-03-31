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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
  Tabs,
  Tab,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  AttachMoney as RevenueIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ChartIcon,
  FilterAlt as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import {
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer
} from 'recharts';

// Types
interface RevenueMetrics {
  period: string;
  totalRevenue: number;
  operatingCosts: number;
  maintenanceCosts: number;
  netProfit: number;
  marginPercentage: number;
}

interface DroneRevenue {
  droneType: string;
  revenue: number;
  flights: number;
  hoursFlown: number;
  maintenanceCost: number;
  revenuePerHour: number;
}

interface ClientRevenue {
  clientName: string;
  revenue: number;
  jobs: number;
  retention: boolean;
  lastJobDate: string;
}

interface MissionTypeRevenue {
  missionType: string;
  revenue: number;
  count: number;
  averageDuration: number;
  averageRevenue: number;
}

interface RevenueByMonth {
  month: string;
  plannedRevenue: number;
  actualRevenue: number;
  costs: number;
}

// Sample colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#4CAF50', '#FF5252', '#7B68EE', '#20B2AA'];

const RevenueTracking: React.FC = () => {
  // State
  const [timeRange, setTimeRange] = useState<string>('year');
  const [currentTab, setCurrentTab] = useState(0);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('previous');
  const [dataLoading, setDataLoading] = useState(false);
  
  // Sample data
  const revenueMetrics: RevenueMetrics[] = [
    { period: 'Jan', totalRevenue: 12500, operatingCosts: 4200, maintenanceCosts: 1800, netProfit: 6500, marginPercentage: 52 },
    { period: 'Feb', totalRevenue: 13800, operatingCosts: 4500, maintenanceCosts: 1900, netProfit: 7400, marginPercentage: 53.6 },
    { period: 'Mar', totalRevenue: 14200, operatingCosts: 4700, maintenanceCosts: 2100, netProfit: 7400, marginPercentage: 52.1 },
    { period: 'Apr', totalRevenue: 15000, operatingCosts: 4800, maintenanceCosts: 1750, netProfit: 8450, marginPercentage: 56.3 },
    { period: 'May', totalRevenue: 16500, operatingCosts: 5100, maintenanceCosts: 2200, netProfit: 9200, marginPercentage: 55.8 },
    { period: 'Jun', totalRevenue: 17800, operatingCosts: 5400, maintenanceCosts: 2300, netProfit: 10100, marginPercentage: 56.7 },
    { period: 'Jul', totalRevenue: 18500, operatingCosts: 5700, maintenanceCosts: 2500, netProfit: 10300, marginPercentage: 55.7 },
    { period: 'Aug', totalRevenue: 19200, operatingCosts: 5900, maintenanceCosts: 2700, netProfit: 10600, marginPercentage: 55.2 },
    { period: 'Sep', totalRevenue: 18700, operatingCosts: 5800, maintenanceCosts: 2600, netProfit: 10300, marginPercentage: 55.1 },
    { period: 'Oct', totalRevenue: 20100, operatingCosts: 6100, maintenanceCosts: 2800, netProfit: 11200, marginPercentage: 55.7 },
    { period: 'Nov', totalRevenue: 21500, operatingCosts: 6400, maintenanceCosts: 3000, netProfit: 12100, marginPercentage: 56.3 },
    { period: 'Dec', totalRevenue: 19800, operatingCosts: 6000, maintenanceCosts: 2900, netProfit: 10900, marginPercentage: 55.1 }
  ];
  
  const droneRevenueData: DroneRevenue[] = [
    { droneType: 'Phantom Pro X', revenue: 53200, flights: 124, hoursFlown: 210, maintenanceCost: 8500, revenuePerHour: 253.3 },
    { droneType: 'SkyView Max', revenue: 72500, flights: 95, hoursFlown: 180, maintenanceCost: 7200, revenuePerHour: 402.8 },
    { droneType: 'Surveyor One', revenue: 38700, flights: 72, hoursFlown: 145, maintenanceCost: 5800, revenuePerHour: 266.9 },
    { droneType: 'Mavic Enterprise', revenue: 22800, flights: 56, hoursFlown: 87, maintenanceCost: 3400, revenuePerHour: 262.1 },
    { droneType: 'Thermal Pro', revenue: 20500, flights: 42, hoursFlown: 76, maintenanceCost: 4200, revenuePerHour: 269.7 }
  ];
  
  const clientRevenueData: ClientRevenue[] = [
    { clientName: 'ABC Construction', revenue: 42800, jobs: 18, retention: true, lastJobDate: '2023-12-01' },
    { clientName: 'Greenfield Farms', revenue: 31500, jobs: 12, retention: true, lastJobDate: '2023-11-15' },
    { clientName: 'XYZ Real Estate', revenue: 28700, jobs: 15, retention: true, lastJobDate: '2023-11-28' },
    { clientName: 'Metro Events Inc.', revenue: 22500, jobs: 9, retention: true, lastJobDate: '2023-12-05' },
    { clientName: 'City Planning Department', revenue: 35200, jobs: 16, retention: true, lastJobDate: '2023-11-22' },
    { clientName: 'Green Energy Solutions', revenue: 19800, jobs: 8, retention: false, lastJobDate: '2023-10-18' },
    { clientName: 'Wildlife Conservation Trust', revenue: 27300, jobs: 11, retention: true, lastJobDate: '2023-11-30' }
  ];
  
  const missionTypeRevenueData: MissionTypeRevenue[] = [
    { missionType: 'Inspection', revenue: 59800, count: 32, averageDuration: 1.5, averageRevenue: 1868.8 },
    { missionType: 'Mapping/Surveying', revenue: 48200, count: 18, averageDuration: 2.8, averageRevenue: 2677.8 },
    { missionType: 'Real Estate Photography', revenue: 32500, count: 28, averageDuration: 1.2, averageRevenue: 1160.7 },
    { missionType: 'Event Coverage', revenue: 28700, count: 15, averageDuration: 3.5, averageRevenue: 1913.3 },
    { missionType: 'Agricultural Monitoring', revenue: 27400, count: 14, averageDuration: 2.2, averageRevenue: 1957.1 },
    { missionType: 'Construction Progress', revenue: 39500, count: 22, averageDuration: 1.8, averageRevenue: 1795.5 },
    { missionType: 'Emergency Response', revenue: 12400, count: 6, averageDuration: 1.9, averageRevenue: 2066.7 },
    { missionType: 'Other', revenue: 8200, count: 7, averageDuration: 1.5, averageRevenue: 1171.4 }
  ];
  
  const revenueByMonth: RevenueByMonth[] = [
    { month: 'Jan', plannedRevenue: 13000, actualRevenue: 12500, costs: 6000 },
    { month: 'Feb', plannedRevenue: 14000, actualRevenue: 13800, costs: 6400 },
    { month: 'Mar', plannedRevenue: 14500, actualRevenue: 14200, costs: 6800 },
    { month: 'Apr', plannedRevenue: 15000, actualRevenue: 15000, costs: 6550 },
    { month: 'May', plannedRevenue: 16000, actualRevenue: 16500, costs: 7300 },
    { month: 'Jun', plannedRevenue: 17000, actualRevenue: 17800, costs: 7700 },
    { month: 'Jul', plannedRevenue: 18000, actualRevenue: 18500, costs: 8200 },
    { month: 'Aug', plannedRevenue: 19000, actualRevenue: 19200, costs: 8600 },
    { month: 'Sep', plannedRevenue: 19500, actualRevenue: 18700, costs: 8400 },
    { month: 'Oct', plannedRevenue: 20000, actualRevenue: 20100, costs: 8900 },
    { month: 'Nov', plannedRevenue: 21000, actualRevenue: 21500, costs: 9400 },
    { month: 'Dec', plannedRevenue: 22000, actualRevenue: 19800, costs: 8900 }
  ];
  
  // Calculate totals
  const totalYearlyRevenue = revenueMetrics.reduce((sum, month) => sum + month.totalRevenue, 0);
  const totalYearlyProfit = revenueMetrics.reduce((sum, month) => sum + month.netProfit, 0);
  const averageMargin = Math.round(
    revenueMetrics.reduce((sum, month) => sum + month.marginPercentage, 0) / revenueMetrics.length
  );
  
  // Calculate top performers
  const topDrone = [...droneRevenueData].sort((a, b) => b.revenue - a.revenue)[0];
  const topClient = [...clientRevenueData].sort((a, b) => b.revenue - a.revenue)[0];
  const topMissionType = [...missionTypeRevenueData].sort((a, b) => b.revenue - a.revenue)[0];
  
  // Calculate YoY growth (simulated)
  const previousYearRevenue = totalYearlyRevenue * 0.82; // Simulating 18% growth
  const yearOverYearGrowth = Math.round(((totalYearlyRevenue - previousYearRevenue) / previousYearRevenue) * 100);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
    
    // Simulate data loading
    setDataLoading(true);
    setTimeout(() => {
      setDataLoading(false);
    }, 800);
  };
  
  // Handle comparison period change
  const handleComparisonChange = (event: SelectChangeEvent) => {
    setComparisonPeriod(event.target.value);
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Revenue Tracking Dashboard
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 140, mr: 2 }}>
            <InputLabel>Compare To</InputLabel>
            <Select
              value={comparisonPeriod}
              label="Compare To"
              onChange={handleComparisonChange}
            >
              <MenuItem value="previous">Previous Period</MenuItem>
              <MenuItem value="year-ago">Same Period Last Year</MenuItem>
              <MenuItem value="target">Target/Budget</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                ${totalYearlyRevenue.toLocaleString()}
              </Typography>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon 
                  color={yearOverYearGrowth >= 0 ? "success" : "error"} 
                  fontSize="small" 
                  sx={{ mr: 0.5 }} 
                />
                <Typography 
                  variant="body2" 
                  color={yearOverYearGrowth >= 0 ? "success.main" : "error.main"}
                >
                  {yearOverYearGrowth}% vs last year
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Net Profit
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                ${totalYearlyProfit.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {averageMargin}% average margin
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Top Performing Drone
              </Typography>
              <Typography variant="h6" fontWeight="bold" noWrap sx={{ mb: 1 }}>
                {topDrone.droneType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${topDrone.revenue.toLocaleString()} | {topDrone.flights} flights
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Top Client
              </Typography>
              <Typography variant="h6" fontWeight="bold" noWrap sx={{ mb: 1 }}>
                {topClient.clientName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${topClient.revenue.toLocaleString()} | {topClient.jobs} jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Revenue Over Time Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Revenue & Profit Trends
        </Typography>
        {dataLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={350}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={revenueMetrics}
              margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="period" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, undefined]} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="totalRevenue" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
              <Area 
                type="monotone" 
                dataKey="netProfit" 
                stroke="#82ca9d" 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Paper>
      
      {/* Tabs for different revenue breakdowns */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="By Drone Type" />
          <Tab label="By Client" />
          <Tab label="By Mission Type" />
        </Tabs>
        
        <Divider />
        
        <Box p={3}>
          {currentTab === 0 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Revenue by Drone Type
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  startIcon={<FilterIcon />}
                >
                  Filter
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={droneRevenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="droneType" />
                      <YAxis />
                      <RechartsTooltip formatter={(value, name) => {
                        if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                        return [value, name];
                      }} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#8884d8" />
                      <Bar dataKey="flights" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Drone Type</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">Hours</TableCell>
                          <TableCell align="right">$/Hour</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {droneRevenueData.map((row) => (
                          <TableRow key={row.droneType}>
                            <TableCell component="th" scope="row">
                              {row.droneType}
                            </TableCell>
                            <TableCell align="right">${row.revenue.toLocaleString()}</TableCell>
                            <TableCell align="right">{row.hoursFlown}</TableCell>
                            <TableCell align="right">${row.revenuePerHour.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </>
          )}
          
          {currentTab === 1 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Revenue by Client
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  startIcon={<FilterIcon />}
                >
                  Filter
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={clientRevenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="clientName" width={150} />
                      <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Client</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">Jobs</TableCell>
                          <TableCell align="right">Avg/Job</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clientRevenueData.map((row) => (
                          <TableRow key={row.clientName}>
                            <TableCell component="th" scope="row">
                              {row.clientName}
                            </TableCell>
                            <TableCell align="right">${row.revenue.toLocaleString()}</TableCell>
                            <TableCell align="right">{row.jobs}</TableCell>
                            <TableCell align="right">${(row.revenue / row.jobs).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </>
          )}
          
          {currentTab === 2 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Revenue by Mission Type
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  startIcon={<FilterIcon />}
                >
                  Filter
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={missionTypeRevenueData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                        nameKey="missionType"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {missionTypeRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Mission Type</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Avg Duration</TableCell>
                          <TableCell align="right">Avg Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {missionTypeRevenueData.map((row) => (
                          <TableRow key={row.missionType}>
                            <TableCell component="th" scope="row">
                              {row.missionType}
                            </TableCell>
                            <TableCell align="right">${row.revenue.toLocaleString()}</TableCell>
                            <TableCell align="right">{row.count}</TableCell>
                            <TableCell align="right">{row.averageDuration}h</TableCell>
                            <TableCell align="right">${row.averageRevenue.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Paper>
      
      {/* Budget vs Actual Performance */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Planned vs Actual Revenue Performance
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={revenueByMonth}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, undefined]} />
            <Legend />
            <Line type="monotone" dataKey="plannedRevenue" stroke="#8884d8" />
            <Line type="monotone" dataKey="actualRevenue" stroke="#82ca9d" />
            <Line type="monotone" dataKey="costs" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default RevenueTracking; 