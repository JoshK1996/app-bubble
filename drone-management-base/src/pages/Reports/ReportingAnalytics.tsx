import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  useTheme,
  SelectChangeEvent
} from '@mui/material';

// Import icons individually to reduce potential import issues
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import FlightIcon from '@mui/icons-material/Flight';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import FilterIcon from '@mui/icons-material/FilterAlt';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';

// Import Recharts components
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieLabelRenderProps
} from 'recharts';

// Demo chart data
type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
};

/**
 * Reporting & Analytics page component
 */
const ReportingAnalytics: React.FC = () => {
  const theme = useTheme();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Filter states
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last month
    end: new Date()
  });
  const [reportType, setReportType] = useState('revenue');
  
  // Chart data for different reports
  const chartData = {
    revenue: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue ($)',
        data: [4500, 5200, 6100, 4800, 7200, 8100],
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        fill: false
      }]
    },
    clients: {
      labels: ['Corporate', 'Real Estate', 'Construction', 'Government', 'Events'],
      datasets: [{
        label: 'Clients by Industry',
        data: [12, 19, 8, 5, 7],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ]
      }]
    },
    missions: {
      labels: ['Mapping', 'Photography', 'Inspection', 'Surveillance', 'Survey'],
      datasets: [{
        label: 'Missions by Type',
        data: [25, 18, 12, 8, 15],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ]
      }]
    },
    expenses: {
      labels: ['Equipment', 'Maintenance', 'Insurance', 'Fuel', 'Training', 'Software'],
      datasets: [{
        label: 'Expenses by Category ($)',
        data: [2100, 850, 1200, 450, 600, 350],
        backgroundColor: '#FF6384'
      }]
    },
    profit: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue ($)',
        data: [4500, 5200, 6100, 4800, 7200, 8100],
        backgroundColor: theme.palette.primary.main
      }, {
        label: 'Expenses ($)',
        data: [2800, 3100, 3400, 2900, 3800, 4200],
        backgroundColor: theme.palette.error.main
      }, {
        label: 'Profit ($)',
        data: [1700, 2100, 2700, 1900, 3400, 3900],
        backgroundColor: theme.palette.success.main
      }]
    }
  };
  
  // Statistics data
  const statistics = {
    totalRevenue: '$35,900',
    totalMissions: '78',
    avgRevenue: '$460 per mission',
    topClient: 'ABC Construction',
    clientRetention: '87%',
    growth: '+18%'
  };
  
  // Convert chart data to Recharts format
  const convertToRechartsData = (data: ChartData): any[] => {
    return data.labels.map((label, index) => {
      const dataPoint: any = { name: label };
      data.datasets.forEach(dataset => {
        dataPoint[dataset.label] = dataset.data[index];
      });
      return dataPoint;
    });
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle report type change
  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };
  
  // Handle date range change
  const handleDateRangeChange = (type: 'start' | 'end') => (date: Date | null) => {
    if (date) {
      setDateRange({
        ...dateRange,
        [type]: date
      });
    }
  };
  
  // Generate report
  const handleGenerateReport = () => {
    alert('This would generate a detailed report based on the selected parameters');
  };
  
  // Export report
  const handleExportReport = (format: string) => {
    alert(`This would export the report in ${format} format`);
  };
  
  // Render chart using Recharts
  const renderChart = (type: string, data: ChartData) => {
    const rechartsData = convertToRechartsData(data);
    const colors = data.datasets[0].backgroundColor instanceof Array 
      ? data.datasets[0].backgroundColor 
      : [data.datasets[0].backgroundColor as string];
      
    switch(type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {data.datasets.map((dataset, index) => (
                <Line 
                  key={index}
                  type="monotone" 
                  dataKey={dataset.label} 
                  stroke={typeof dataset.backgroundColor === 'string' ? dataset.backgroundColor : colors[index % colors.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {data.datasets.map((dataset, index) => (
                <Bar 
                  key={index}
                  dataKey={dataset.label} 
                  fill={typeof dataset.backgroundColor === 'string' ? dataset.backgroundColor : colors[index % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        // For Pie charts we need to transform data differently
        const pieData = data.labels.map((label, index) => ({
          name: label,
          value: data.datasets[0].data[index]
        }));
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <Box sx={{ textAlign: 'center', p: 5 }}>
            <Typography>Chart type not supported</Typography>
          </Box>
        );
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Reporting & Analytics
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            sx={{ mr: 1 }}
          >
            Refresh Data
          </Button>
          <Button 
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleExportReport('PDF')}
          >
            Export Report
          </Button>
        </Box>
      </Box>
      
      {/* Report Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Report Filters
            </Typography>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={handleReportTypeChange}
                >
                  <MenuItem value="revenue">Revenue Analysis</MenuItem>
                  <MenuItem value="clients">Client Analytics</MenuItem>
                  <MenuItem value="missions">Mission Statistics</MenuItem>
                  <MenuItem value="expenses">Expense Breakdown</MenuItem>
                  <MenuItem value="profit">Profit Analysis</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  defaultValue={dateRange.start?.toISOString().split('T')[0]}
                  onChange={(e) => handleDateRangeChange('start')(new Date(e.target.value))}
                />
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  defaultValue={dateRange.end?.toISOString().split('T')[0]}
                  onChange={(e) => handleDateRangeChange('end')(new Date(e.target.value))}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={handleGenerateReport}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label="Last 30 Days" 
              variant="outlined" 
              clickable
              icon={<CalendarIcon />}
            />
            <Chip 
              label="This Month" 
              variant="outlined" 
              clickable
              icon={<CalendarIcon />}
            />
            <Chip 
              label="Last Quarter" 
              variant="outlined" 
              clickable
              icon={<CalendarIcon />}
            />
            <Chip 
              label="Year to Date" 
              variant="outlined" 
              clickable
              icon={<CalendarIcon />}
            />
          </Box>
        </CardContent>
      </Card>
      
      {/* Key Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {statistics.totalRevenue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Missions
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {statistics.totalMissions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Avg. Revenue
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {statistics.avgRevenue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Top Client
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {statistics.topClient}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Client Retention
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {statistics.clientRetention}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Growth YoY
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {statistics.growth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Report Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="Charts" />
          <Tab label="Detailed Data" />
          <Tab label="Insights" />
        </Tabs>
      </Box>
      
      {/* Charts Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {reportType === 'revenue' && 'Revenue Trend'}
                    {reportType === 'clients' && 'Client Distribution'}
                    {reportType === 'missions' && 'Mission Types'}
                    {reportType === 'expenses' && 'Expense Categories'}
                    {reportType === 'profit' && 'Profit Analysis'}
                  </Typography>
                  <Box>
                    <Tooltip title="Print">
                      <IconButton size="small">
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton size="small">
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {/* Main Chart */}
                {reportType === 'revenue' && renderChart('line', chartData.revenue)}
                {reportType === 'clients' && renderChart('pie', chartData.clients)}
                {reportType === 'missions' && renderChart('pie', chartData.missions)}
                {reportType === 'expenses' && renderChart('bar', chartData.expenses)}
                {reportType === 'profit' && renderChart('bar', chartData.profit)}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {reportType === 'revenue' && (
                  <>
                    <Typography variant="body2" paragraph>
                      Revenue has shown a positive trend over the past 6 months, with a peak in June at $8,100. Overall growth 
                      is 80% compared to January's figures.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      The average monthly revenue is $5,983, with a standard deviation of $1,327.
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Insights:
                    </Typography>
                    <ul>
                      <li>Strongest month: June ($8,100)</li>
                      <li>Weakest month: January ($4,500)</li>
                      <li>Growth trend: +15% per month</li>
                    </ul>
                  </>
                )}
                
                {reportType === 'clients' && (
                  <>
                    <Typography variant="body2" paragraph>
                      Corporate clients form the largest segment at 24%, followed by Real Estate at 37%. 
                      The smallest client segment is Government at 10%.
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Client Acquisition Cost:
                    </Typography>
                    <ul>
                      <li>Corporate: $450</li>
                      <li>Real Estate: $320</li>
                      <li>Construction: $380</li>
                      <li>Government: $620</li>
                      <li>Events: $290</li>
                    </ul>
                  </>
                )}
                
                {reportType === 'missions' && (
                  <>
                    <Typography variant="body2" paragraph>
                      Mapping missions are the most common type at 32%, followed by Photography at 23%. 
                      Surveillance missions make up only 10% of total missions.
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Revenue by Mission Type:
                    </Typography>
                    <ul>
                      <li>Mapping: $12,450</li>
                      <li>Photography: $9,800</li>
                      <li>Inspection: $7,350</li>
                      <li>Surveillance: $3,200</li>
                      <li>Survey: $3,100</li>
                    </ul>
                  </>
                )}
                
                {reportType === 'expenses' && (
                  <>
                    <Typography variant="body2" paragraph>
                      Equipment represents the largest expense category at 38%, followed by 
                      Insurance at 22%. The lowest expense category is Fuel at 8%.
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Expense Trends:
                    </Typography>
                    <ul>
                      <li>Equipment: +5% YoY</li>
                      <li>Maintenance: +12% YoY</li>
                      <li>Insurance: -3% YoY</li>
                      <li>Fuel: +8% YoY</li>
                      <li>Training: -2% YoY</li>
                      <li>Software: +15% YoY</li>
                    </ul>
                  </>
                )}
                
                {reportType === 'profit' && (
                  <>
                    <Typography variant="body2" paragraph>
                      The profit margin has consistently remained between 37% and 48% over the past 6 months.
                      The average profit margin is 42.5%.
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Profit Metrics:
                    </Typography>
                    <ul>
                      <li>Highest profit: June ($3,900)</li>
                      <li>Lowest profit: January ($1,700)</li>
                      <li>Average profit: $2,633</li>
                      <li>Profit growth: +129% (Jan to Jun)</li>
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Detailed Data Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detailed Data
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="textSecondary" align="center">
              Detailed data table would be displayed here with filterable and sortable columns.
            </Typography>
            
            <Box sx={{ 
              height: 300, 
              border: '1px dashed #ccc', 
              borderRadius: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.02)',
              p: 2,
              mt: 2
            }}>
              <Typography>Data Table Placeholder</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={() => handleExportReport('CSV')}
                sx={{ mr: 1 }}
              >
                Export CSV
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={() => handleExportReport('Excel')}
              >
                Export Excel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Insights Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI-Generated Insights
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Key Observations
            </Typography>
            
            <Typography variant="body1" paragraph>
              Based on the data analysis, the following insights have been identified:
            </Typography>
            
            <ul>
              <li>
                <Typography variant="body1" paragraph>
                  <b>Growth Trend:</b> Your business has shown consistent growth over the past 6 months, with revenue increasing by 80% from January to June. This is significantly above the industry average of 12% for the same period.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  <b>Client Diversification:</b> Your client base is well-diversified across different industries, reducing business risk. However, there is an opportunity to increase government sector clients, which currently represent only 10% of your client base but typically offer more stable, long-term contracts.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  <b>Profit Margin Improvement:</b> Your profit margin has increased from 37.8% in January to 48.1% in June. This improvement appears to be driven by economies of scale as revenue grows faster than expenses.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  <b>Expense Management:</b> Equipment costs represent 38% of total expenses. Consider exploring equipment leasing options or drone-as-a-service models to reduce upfront costs and improve cash flow.
                </Typography>
              </li>
            </ul>
            
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ mt: 2 }}>
              Recommendations
            </Typography>
            
            <ol>
              <li>
                <Typography variant="body1" paragraph>
                  <b>Target Government Sector:</b> Develop a targeted marketing campaign for government agencies to increase this client segment from 10% to at least 20% within the next two quarters.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  <b>Optimize Service Mix:</b> Given that Mapping missions generate the highest revenue, consider specialization and additional training in this area to improve efficiency and margins.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  <b>Expense Reduction:</b> Negotiate better insurance rates based on your safety record and consider implementing a preventive maintenance program to reduce future maintenance costs.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  <b>Client Retention Program:</b> Develop a structured client retention program to maintain the high 87% retention rate, possibly through loyalty discounts or enhanced service packages for repeat clients.
                </Typography>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ReportingAnalytics; 