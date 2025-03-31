import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  IconButton,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Check as CheckIcon,
  Add as AddIcon,
  FlightTakeoff as FlightIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Bolt as BoltIcon,
  Notifications as NotificationIcon,
  CloudQueue as CloudIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  TabletMac as TabletIcon
} from '@mui/icons-material';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { ClientDashboard } from '../../components/Clients';
import { Client, createMockClients } from '../../types/clientTypes';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard component displaying business overview with glassmorphism UI
 */
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState(createMockClients(15));
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle refresh dashboard
  const handleRefreshDashboard = () => {
    setRefreshing(true);
    
    // Simulate API refresh
    setTimeout(() => {
      // Update data with slight variations to simulate real changes
      setRevenueData(revenueData.map(item => ({
        ...item,
        amount: item.amount * (0.95 + Math.random() * 0.1) // +/- 5% variation
      })));
      
      setRefreshing(false);
    }, 2000);
  };

  // Handle date range change
  const handleDateRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newDateRange: 'week' | 'month' | 'quarter' | 'year',
  ) => {
    if (newDateRange !== null) {
      setDateRange(newDateRange);
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newChartType: 'line' | 'bar' | 'area',
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Navigation handlers
  const handleViewAllClients = () => {
    navigate('/clients');
  };

  const handleViewClient = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Sample data - in a real app, this would come from an API
  const stats = {
    totalMissions: 145,
    completedMissions: 128,
    revenue: '$52,450',
    expenses: '$18,750',
    clients: 42,
    activeClients: 28,
    drones: 8,
    operationalDrones: 7,
  };

  // Sample upcoming missions
  const upcomingMissions = [
    { id: 1, name: 'Beach Property Aerial Tour', client: 'Coastal Realty', date: '06/15/2023', status: 'Confirmed' },
    { id: 2, name: 'Agricultural Field Survey', client: 'FarmCorp Inc.', date: '06/17/2023', status: 'Pending' },
    { id: 3, name: 'Solar Panel Inspection', client: 'SolarTech', date: '06/18/2023', status: 'Confirmed' },
    { id: 4, name: 'Construction Site Progress', client: 'BuildRite', date: '06/21/2023', status: 'Confirmed' },
  ];

  // Sample revenue data
  const [revenueData, setRevenueData] = useState([
    { month: 'Jan', amount: 4000, expenses: 2500, profit: 1500 },
    { month: 'Feb', amount: 6000, expenses: 3500, profit: 2500 },
    { month: 'Mar', amount: 8000, expenses: 4500, profit: 3500 },
    { month: 'Apr', amount: 7500, expenses: 4000, profit: 3500 },
    { month: 'May', amount: 12000, expenses: 6500, profit: 5500 },
    { month: 'Jun', amount: 14000, expenses: 7500, profit: 6500 },
  ]);

  // Get date-appropriate data based on selection
  const getFilteredData = () => {
    switch (dateRange) {
      case 'week':
        return [
          { day: 'Mon', amount: 1200, expenses: 800, profit: 400 },
          { day: 'Tue', amount: 1800, expenses: 1200, profit: 600 },
          { day: 'Wed', amount: 1400, expenses: 900, profit: 500 },
          { day: 'Thu', amount: 2000, expenses: 1300, profit: 700 },
          { day: 'Fri', amount: 2200, expenses: 1400, profit: 800 },
          { day: 'Sat', amount: 1800, expenses: 1100, profit: 700 },
          { day: 'Sun', amount: 1200, expenses: 800, profit: 400 },
        ];
      case 'quarter':
        return [
          { period: 'Jan', amount: 4000, expenses: 2500, profit: 1500 },
          { period: 'Feb', amount: 6000, expenses: 3500, profit: 2500 },
          { period: 'Mar', amount: 8000, expenses: 4500, profit: 3500 },
          { period: 'Apr', amount: 7500, expenses: 4000, profit: 3500 },
          { period: 'May', amount: 12000, expenses: 6500, profit: 5500 },
          { period: 'Jun', amount: 14000, expenses: 7500, profit: 6500 },
          { period: 'Jul', amount: 15000, expenses: 8000, profit: 7000 },
          { period: 'Aug', amount: 16500, expenses: 8500, profit: 8000 },
          { period: 'Sep', amount: 18000, expenses: 9000, profit: 9000 },
        ];
      case 'year':
        return [
          { period: 'Jan', amount: 4000, expenses: 2500, profit: 1500 },
          { period: 'Feb', amount: 6000, expenses: 3500, profit: 2500 },
          { period: 'Mar', amount: 8000, expenses: 4500, profit: 3500 },
          { period: 'Apr', amount: 7500, expenses: 4000, profit: 3500 },
          { period: 'May', amount: 12000, expenses: 6500, profit: 5500 },
          { period: 'Jun', amount: 14000, expenses: 7500, profit: 6500 },
          { period: 'Jul', amount: 15000, expenses: 8000, profit: 7000 },
          { period: 'Aug', amount: 16500, expenses: 8500, profit: 8000 },
          { period: 'Sep', amount: 18000, expenses: 9000, profit: 9000 },
          { period: 'Oct', amount: 16000, expenses: 8200, profit: 7800 },
          { period: 'Nov', amount: 14500, expenses: 7500, profit: 7000 },
          { period: 'Dec', amount: 20000, expenses: 10000, profit: 10000 },
        ];
      default:
        return revenueData;
    }
  };

  // Get appropriate x-axis key based on date range
  const getXAxisKey = () => {
    if (dateRange === 'week') return 'day';
    if (dateRange === 'quarter' || dateRange === 'year') return 'period';
    return 'month';
  };

  // Sample mission type data
  const missionTypeData = [
    { name: 'Real Estate', value: 35 },
    { name: 'Agricultural', value: 25 },
    { name: 'Inspection', value: 20 },
    { name: 'Surveillance', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Render appropriate chart based on type selection
  const renderFinancialChart = () => {
    const data = getFilteredData();
    const xAxisKey = getXAxisKey();
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="amount" fill={theme.palette.primary.main} />
              <Bar dataKey="expenses" fill={theme.palette.error.light} />
              <Bar dataKey="profit" fill={theme.palette.success.main} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="amount" fill={theme.palette.primary.main} stroke={theme.palette.primary.dark} fillOpacity={0.8} />
              <Area type="monotone" dataKey="expenses" fill={theme.palette.error.light} stroke={theme.palette.error.main} fillOpacity={0.6} />
              <Area type="monotone" dataKey="profit" fill={theme.palette.success.light} stroke={theme.palette.success.main} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default: // line chart
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expenses" stroke={theme.palette.error.main} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="profit" stroke={theme.palette.success.main} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ position: 'relative' }}>
            Dashboard
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '60px',
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: '2px',
              }}
            />
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Overview of your drone business operations
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Refresh dashboard data">
            <IconButton 
              onClick={handleRefreshDashboard} 
              sx={{ mr: 1 }}
              disabled={refreshing}
            >
              <RefreshIcon sx={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Dashboard options">
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              Export dashboard data
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              Dashboard settings
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <TabletIcon fontSize="small" sx={{ mr: 1 }} />
              Show on mobile app
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Revenue Card */}
              <Grid item xs={12} sm={6}>
                <Card className="float-element" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Revenue</Typography>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                        <MoneyIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1 }}>{stats.revenue}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        icon={<TrendingUpIcon />} 
                        label="+15% from last month" 
                        color="success" 
                        size="small" 
                        sx={{ 
                          '& .MuiChip-label': { fontWeight: 'bold' },
                          animation: '1.5s pulse infinite ease-in-out',
                          '@keyframes pulse': {
                            '0%, 100%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.05)' }
                          }
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Missions Card */}
              <Grid item xs={12} sm={6}>
                <Card className="float-element" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Total Missions</Typography>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 40, height: 40 }}>
                        <FlightIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1 }}>{stats.totalMissions}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        <span style={{ fontWeight: 'bold', color: theme.palette.success.main }}>{stats.completedMissions}</span> Completed | 
                        <span style={{ fontWeight: 'bold', color: theme.palette.warning.main }}> {stats.totalMissions - stats.completedMissions}</span> Upcoming
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Clients Card */}
              <Grid item xs={12} sm={6}>
                <Card className="float-element" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Active Clients</Typography>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
                        <PeopleIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1 }}>{stats.activeClients}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip icon={<AddIcon />} label="3 new this month" color="primary" size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Compliance Card */}
              <Grid item xs={12} sm={6}>
                <Card className="float-element" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Compliance Status</Typography>
                      <Avatar sx={{ bgcolor: theme.palette.success.light, width: 40, height: 40 }}>
                        <CheckIcon />
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1 }}>100%</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        icon={<BoltIcon />} 
                        label="All certifications up to date" 
                        color="success" 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Chart Card */}
            <Card className="float-element" sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">Financial Performance</Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <ToggleButtonGroup
                      size="small"
                      value={dateRange}
                      exclusive
                      onChange={handleDateRangeChange}
                      aria-label="date range"
                    >
                      <ToggleButton value="week">
                        Week
                      </ToggleButton>
                      <ToggleButton value="month">
                        Month
                      </ToggleButton>
                      <ToggleButton value="quarter">
                        Quarter
                      </ToggleButton>
                      <ToggleButton value="year">
                        Year
                      </ToggleButton>
                    </ToggleButtonGroup>
                    
                    <ToggleButtonGroup
                      size="small"
                      value={chartType}
                      exclusive
                      onChange={handleChartTypeChange}
                      aria-label="chart type"
                    >
                      <ToggleButton value="line">
                        Line
                      </ToggleButton>
                      <ToggleButton value="bar">
                        Bar
                      </ToggleButton>
                      <ToggleButton value="area">
                        Area
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>
                
                {refreshing ? (
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  renderFinancialChart()
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Weather Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Current Weather</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
                  Weather data currently unavailable.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Client Overview */}
          <Grid item xs={12} md={6}>
            <ClientDashboard 
              clients={clients}
              onViewAllClients={handleViewAllClients}
              onViewClient={handleViewClient}
            />
          </Grid>

          {/* Mission Types Chart */}
          <Grid item xs={12} md={6}>
            <Card className="float-element">
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Mission Types</Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={missionTypeData}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {missionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number, name: string) => [`${value}%`, name]} 
                        wrapperStyle={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Missions Table */}
          <Grid item xs={12}>
            <Card className="float-element">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Upcoming Missions</Typography>
                  <Button startIcon={<CalendarIcon />} variant="outlined" size="small">
                    View All
                  </Button>
                </Box>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingMissions.map((mission) => (
                        <TableRow
                          key={mission.id}
                          sx={{
                            transition: 'transform 0.2s ease, background-color 0.2s ease',
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                              transform: 'translateX(5px)',
                            },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FlightIcon color="primary" fontSize="small" />
                              <Typography variant="body2" fontWeight="medium">{mission.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{mission.client}</TableCell>
                          <TableCell>{mission.date}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={mission.status}
                              size="small"
                              color={mission.status === 'Confirmed' ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default Dashboard; 