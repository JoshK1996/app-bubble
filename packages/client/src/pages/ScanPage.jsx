import { useState } from 'react';
import { useZxing } from 'react-zxing';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  Grid
} from '@mui/material';

function ScanPage() {
  const [result, setResult] = useState('');
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // React-zxing hook for QR code scanning
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      setResult(result.getText());
      handleScanResult(result.getText());
      // Pause scanning briefly
      setCameraEnabled(false);
      setTimeout(() => setCameraEnabled(true), 2000);
    },
    paused: !cameraEnabled,
  });

  const handleScanResult = async (qrData) => {
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the GraphQL API
      // const response = await API.graphql({
      //   query: getMaterialByQrCode,
      //   variables: { qrCodeData: qrData }
      // });
      
      // Simulate API response
      setTimeout(() => {
        // Simulated successful material lookup
        if (qrData.startsWith('MAT-')) {
          setMaterial({
            id: '123',
            materialIdentifier: 'SPOOL-456',
            description: '6" Carbon Steel Pipe Spool',
            status: 'FABRICATED',
            jobId: 'JOB-789',
            job: { jobName: 'Downtown Hospital Project' },
            materialType: 'SPOOL',
            systemType: 'CHW'
          });
        } else {
          // Simulated error
          setError('Invalid QR code or material not found');
        }
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error fetching material:', err);
      setError('Error fetching material information');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setLoading(true);
    
    try {
      // In a real implementation, this would call the GraphQL API
      // await API.graphql({
      //   query: updateMaterialStatus,
      //   variables: { 
      //     materialId: material.id, 
      //     status: newStatus 
      //   }
      // });
      
      // Simulate API call
      setTimeout(() => {
        setMaterial({
          ...material,
          status: newStatus
        });
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Error updating material status');
      setLoading(false);
    }
  };

  const startScanning = () => {
    setResult('');
    setMaterial(null);
    setError('');
    setCameraEnabled(true);
  };

  // Determine available status transitions based on current status
  const getAvailableStatusTransitions = () => {
    if (!material) return [];
    
    const statusTransitions = {
      FABRICATED: ['SHIPPED_TO_FIELD'],
      SHIPPED_TO_FIELD: ['RECEIVED_ON_SITE', 'DAMAGED', 'MISSING'],
      RECEIVED_ON_SITE: ['INSTALLED', 'DAMAGED', 'EXCESS'],
      INSTALLED: [],
      DAMAGED: ['RETURNED_TO_WAREHOUSE'],
      EXCESS: ['RETURNED_TO_WAREHOUSE'],
      RETURNED_TO_WAREHOUSE: []
    };
    
    return statusTransitions[material.status] || [];
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        QR Code Scanner
      </Typography>
      
      {!cameraEnabled && !material && !loading && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={startScanning}
          >
            Start Scanning
          </Button>
        </Box>
      )}
      
      {cameraEnabled && (
        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%', 
            maxWidth: 500, 
            mx: 'auto', 
            p: 2, 
            textAlign: 'center',
            mb: 3
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Position QR code in the camera view
          </Typography>
          <Box 
            sx={{ 
              border: '2px solid #1976d2', 
              borderRadius: 1,
              overflow: 'hidden',
              width: '100%',
              height: 300
            }}
          >
            <video
              ref={ref}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        </Paper>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {material && (
        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              {material.materialIdentifier}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {material.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Current Status
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {material.status.replace(/_/g, ' ')}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Job
                </Typography>
                <Typography variant="body1">
                  {material.job.jobName}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Material Type
                </Typography>
                <Typography variant="body1">
                  {material.materialType}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  System Type
                </Typography>
                <Typography variant="body1">
                  {material.systemType}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          
          <Divider />
          
          <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', p: 2 }}>
            <Typography variant="body1" gutterBottom>
              Update Status:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {getAvailableStatusTransitions().map(status => (
                <Button 
                  key={status} 
                  variant="outlined"
                  onClick={() => handleUpdateStatus(status)}
                  disabled={loading}
                >
                  {status.replace(/_/g, ' ')}
                </Button>
              ))}
              
              {getAvailableStatusTransitions().length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No status updates available for current state
                </Typography>
              )}
            </Box>
            
            <Button 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
              onClick={startScanning}
            >
              Scan Another Item
            </Button>
          </CardActions>
        </Card>
      )}
    </Box>
  );
}

export default ScanPage; 