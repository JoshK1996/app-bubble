import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip,
  Button,
  CircularProgress,
  Grid,
  Alert,
  AlertTitle,
  IconButton
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import { getJob, materialsByJob, subscribeToUpdateMaterial, subscribeToCreateMaterial } from '../utils/api';
import MaterialList from '../components/MaterialList';
import { useAuth } from '../contexts/AuthContext';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [job, setJob] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materialStats, setMaterialStats] = useState({
    total: 0,
    byStatus: {}
  });
  
  // Status color mapping
  const statusColors = {
    ACTIVE: 'success',
    ON_HOLD: 'warning',
    COMPLETED: 'info',
    ARCHIVED: 'default'
  };
  
  // Load job and materials
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch job details
        const jobData = await getJob(jobId);
        setJob(jobData);
        
        // Fetch materials for this job
        const materialsData = await materialsByJob(jobId);
        setMaterials(materialsData?.items || []);
        
        // Calculate material statistics
        calculateMaterialStats(materialsData?.items || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job data:', err);
        setError('Failed to load job details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchJobData();
  }, [jobId]);
  
  // Set up real-time subscriptions
  useEffect(() => {
    if (!jobId) return;
    
    // Subscribe to material updates
    const updateSubscription = subscribeToUpdateMaterial(jobId, (updatedMaterial) => {
      setMaterials(prevMaterials => {
        const newMaterials = prevMaterials.map(material => 
          material.id === updatedMaterial.id ? updatedMaterial : material
        );
        calculateMaterialStats(newMaterials);
        return newMaterials;
      });
    });
    
    // Subscribe to new materials
    const createSubscription = subscribeToCreateMaterial(jobId, (newMaterial) => {
      setMaterials(prevMaterials => {
        const newMaterials = [...prevMaterials, newMaterial];
        calculateMaterialStats(newMaterials);
        return newMaterials;
      });
    });
    
    return () => {
      // Clean up subscriptions
      updateSubscription.unsubscribe();
      createSubscription.unsubscribe();
    };
  }, [jobId]);
  
  // Calculate material statistics
  const calculateMaterialStats = (materials) => {
    const stats = {
      total: materials.length,
      byStatus: {}
    };
    
    materials.forEach(material => {
      const status = material.status;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });
    
    setMaterialStats(stats);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/jobs')}
          sx={{ mt: 2 }}
        >
          Back to Jobs
        </Button>
      </Box>
    );
  }
  
  if (!job) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">
          <AlertTitle>Job Not Found</AlertTitle>
          The requested job doesn't exist or you don't have permission to view it.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/jobs')}
          sx={{ mt: 2 }}
        >
          Back to Jobs
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ px: 2, py: 3 }}>
      {/* Header with Job Info */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/jobs')}
            sx={{ mb: 2 }}
          >
            Back to Jobs
          </Button>
          
          <Typography variant="h4" gutterBottom>
            {job.jobName}
            <Chip 
              label={job.status} 
              color={statusColors[job.status] || 'default'} 
              size="small" 
              sx={{ ml: 2, verticalAlign: 'middle' }}
            />
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Job Number: {job.jobNumber}
          </Typography>
          
          {job.clientName && (
            <Typography variant="subtitle1" color="text.secondary">
              Client: {job.clientName}
            </Typography>
          )}
        </Box>
        
        {hasRole(['Admin']) && (
          <Button
            startIcon={<Edit />}
            variant="outlined"
            onClick={() => navigate(`/jobs/edit/${jobId}`)}
          >
            Edit Job
          </Button>
        )}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Materials Stats */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Materials Summary
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
              <Typography variant="h4">{materialStats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Total Materials</Typography>
            </Paper>
          </Grid>
          
          {Object.entries(materialStats.byStatus).map(([status, count]) => (
            <Grid item xs={6} sm={4} md={3} key={status}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
                <Typography variant="h4">{count}</Typography>
                <Typography variant="body2" color="text.secondary">{status}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Materials List */}
      <Typography variant="h5" gutterBottom>
        Materials
      </Typography>
      
      <MaterialList 
        materials={materials} 
        jobId={jobId}
        refreshData={() => {}} // No need to refresh as we have subscriptions
        isLoading={false}
      />
    </Box>
  );
};

export default JobDetailPage; 