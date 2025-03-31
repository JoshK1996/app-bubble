import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Define mission interface
interface Mission {
  id: number;
  name: string;
  client: string;
  location: string;
  date: string; // ISO format: "2025-03-28"
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  type: string;
  drone: string;
  pilot: string;
}

interface MissionAnalyticsProps {
  missions: Mission[];
}

const MissionAnalytics: React.FC<MissionAnalyticsProps> = ({ missions }) => {
  // Calculate mission stats
  const completedMissions = missions.filter(m => m.status === 'Completed').length;
  const scheduledMissions = missions.filter(m => m.status === 'Scheduled').length;
  const inProgressMissions = missions.filter(m => m.status === 'In Progress').length;
  const cancelledMissions = missions.filter(m => m.status === 'Cancelled').length;
  
  // Generate mission type data for pie chart
  const generateMissionTypeData = () => {
    const typeMap = new Map<string, number>();
    
    missions.forEach(mission => {
      const count = typeMap.get(mission.type) || 0;
      typeMap.set(mission.type, count + 1);
    });
    
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
  };
  
  // Generate pilot data for bar chart
  const generatePilotData = () => {
    const pilotMap = new Map<string, number>();
    
    missions.forEach(mission => {
      if (mission.status === 'Completed') {
        const count = pilotMap.get(mission.pilot) || 0;
        pilotMap.set(mission.pilot, count + 1);
      }
    });
    
    return Array.from(pilotMap.entries()).map(([name, value]) => ({ name, value }));
  };
  
  // Generate monthly mission data for line chart
  const generateMonthlyData = () => {
    const monthMap = new Map<string, number>();
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Initialize months
    for (let i = 0; i < 12; i++) {
      const month = i + 1;
      const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
      monthMap.set(monthKey, 0);
    }
    
    // Count missions by month
    missions.forEach(mission => {
      if (mission.status === 'Completed') {
        const date = new Date(mission.date);
        const year = date.getFullYear();
        if (year === currentYear) {
          const month = date.getMonth() + 1;
          const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
          const count = monthMap.get(monthKey) || 0;
          monthMap.set(monthKey, count + 1);
        }
      }
    });
    
    return Array.from(monthMap.entries())
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split('-');
        return {
          month: getMonthName(parseInt(month, 10)),
          missions: count
        };
      });
  };
  
  // Helper function to get month name
  const getMonthName = (month: number) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[month - 1];
  };
  
  const missionTypeData = generateMissionTypeData();
  const pilotData = generatePilotData();
  const monthlyData = generateMonthlyData();
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Mission Analytics Dashboard</Typography>
      
      <Grid container spacing={3}>
        {/* Mission status overview */}
        <Grid item xs={12} md={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Mission Status Overview</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" align="center" color="primary">{completedMissions}</Typography>
                    <Typography variant="body2" align="center">Completed</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" align="center" color="info.main">{scheduledMissions}</Typography>
                    <Typography variant="body2" align="center">Scheduled</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" align="center" color="warning.main">{inProgressMissions}</Typography>
                    <Typography variant="body2" align="center">In Progress</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" align="center" color="error.main">{cancelledMissions}</Typography>
                    <Typography variant="body2" align="center">Cancelled</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Mission types pie chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>Mission Types</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={missionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {missionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Missions']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Pilot performance */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>Pilot Performance</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={pilotData}
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => [value, 'Completed Missions']} />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Monthly missions trend */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>Monthly Mission Trend</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="missions" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MissionAnalytics; 