import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalMaterials: 0,
    statusCounts: {}
  });

  // This would use API.graphql() to fetch data from AppSync in a real implementation
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        activeJobs: 5,
        totalMaterials: 420,
        statusCounts: {
          ESTIMATED: 120,
          DETAILED: 85,
          RELEASED_TO_FAB: 65,
          IN_FABRICATION: 45,
          FABRICATED: 38,
          SHIPPED_TO_FIELD: 27,
          RECEIVED_ON_SITE: 18,
          INSTALLED: 12,
          EXCESS: 5,
          RETURNED_TO_WAREHOUSE: 3,
          DAMAGED: 2,
          MISSING: 0
        }
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: 140,
              backgroundColor: 'primary.light',
              color: 'white'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Active Jobs
            </Typography>
            <Typography variant="h3">
              {stats.activeJobs}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: 140,
              backgroundColor: 'secondary.light',
              color: 'white'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Materials
            </Typography>
            <Typography variant="h3">
              {stats.totalMaterials}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: 140,
              backgroundColor: 'success.light',
              color: 'white'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Installed Materials
            </Typography>
            <Typography variant="h3">
              {stats.statusCounts.INSTALLED || 0}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Status Breakdown */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Material Status Breakdown
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <Grid item xs={6} md={3} key={status}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'grey.100' 
                    }}
                  >
                    <Typography variant="body1">
                      {status.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="h6">
                      {count}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage; 