import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AttachMoney as RevenueIcon,
  Construction as EquipmentIcon,
  Assignment as MissionIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import MissionAnalytics from '../../components/Reports/MissionAnalytics';
import RevenueTracking from '../../components/Reports/RevenueTracking';
import EquipmentAnalytics from '../../components/Reports/EquipmentAnalytics';

const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Helper function to get the current date in a readable format
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box p={3}>
      {/* Header with Breadcrumbs */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="textPrimary">Reports & Analytics</Typography>
        </Breadcrumbs>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            Reports & Analytics
          </Typography>
          
          <Box>
            <Chip 
              label={`Last updated: ${getCurrentDate()}`} 
              variant="outlined" 
              size="small" 
              sx={{ mr: 1 }}
            />
            <IconButton size="small" sx={{ mr: 1 }}>
              <DownloadIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ mr: 1 }}>
              <PrintIcon fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <ShareIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Analytics Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <RevenueIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Revenue Insights</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" paragraph>
                Track revenue streams, monitor profitability, and identify your most valuable clients and service types.
              </Typography>
              <Box textAlign="right">
                <Chip
                  label="18% growth" 
                  size="small" 
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <MissionIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Mission Efficiency</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" paragraph>
                Analyze mission completion rates, on-time performance, and client satisfaction metrics.
              </Typography>
              <Box textAlign="right">
                <Chip
                  label="92% efficiency" 
                  size="small" 
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <EquipmentIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Equipment Performance</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" paragraph>
                Monitor drone fleet health, maintenance costs, and identify optimal replacement schedules.
              </Typography>
              <Box textAlign="right">
                <Chip
                  label="87% avg health" 
                  size="small" 
                  color="info"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content with Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="analytics tabs"
        >
          <Tab 
            icon={<RevenueIcon />} 
            label="Revenue" 
            iconPosition="start"
          />
          <Tab 
            icon={<MissionIcon />} 
            label="Missions" 
            iconPosition="start"
          />
          <Tab 
            icon={<EquipmentIcon />} 
            label="Equipment" 
            iconPosition="start"
          />
        </Tabs>
        
        <Divider />
        
        <Box p={0}>
          {activeTab === 0 && <RevenueTracking />}
          {activeTab === 1 && <MissionAnalytics />}
          {activeTab === 2 && <EquipmentAnalytics />}
        </Box>
      </Paper>
      
      <Box textAlign="center" mt={4} mb={2}>
        <Typography variant="body2" color="textSecondary">
          Data shown is based on your business operations from January 1, 2023 to present.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Need help understanding these metrics? <Link href="#">View the analytics guide</Link> or <Link href="#">contact support</Link>.
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportsDashboard; 