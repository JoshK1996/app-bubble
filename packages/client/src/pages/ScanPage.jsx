import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZxing } from 'react-zxing';
import { API } from 'aws-amplify';
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
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { materialByQrCode } from '../graphql/queries';
import { updateMaterialStatus } from '../graphql/mutations';

function ScanPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState('');
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

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
      // Call the GraphQL API to get material by QR code
      const response = await API.graphql({
        query: materialByQrCode,
        variables: { 
          qrCodeData: qrData,
          limit: 1
        }
      });
      
      const items = response.data.materialByQrCode.items;
      
      if (items && items.length > 0) {
        setMaterial(items[0]);
      } else {
        setError('Material not found with this QR code');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching material:', err);
      setError('Error fetching material information: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const openStatusDialog = (newStatus) => {
    setSelectedStatus(newStatus);
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedStatus('');
    setNotes('');
  };

  const confirmStatusUpdate = async () => {
    setStatusDialogOpen(false);
    await handleUpdateStatus(selectedStatus, notes);
  };

  const handleUpdateStatus = async (newStatus, notes) => {
    setLoading(true);
    
    try {
      // Call the GraphQL API to update material status
      const response = await API.graphql({
        query: updateMaterialStatus,
        variables: { 
          materialId: material.id, 
          status: newStatus,
          notes: notes
        }
      });
      
      const updatedMaterial = response.data.updateMaterialStatus;
      setMaterial(updatedMaterial);
      setLoading(false);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Error updating material status: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const startScanning = () => {
    setResult('');
    setMaterial(null);
    setError('');
    setCameraEnabled(true);
  };

  const viewMaterialDetails = () => {
    if (material && material.id) {
      navigate(`/materials/${material.id}`);
    }
  };

  // Determine available status transitions based on current status
  const getAvailableStatusTransitions = () => {
    if (!material) return [];
    
    const statusTransitions = {
      ESTIMATED: ['DETAILED'],
      DETAILED: ['RELEASED_TO_FAB'],
      RELEASED_TO_FAB: ['IN_FABRICATION'],
      IN_FABRICATION: ['FABRICATED', 'DAMAGED'],
      FABRICATED: ['SHIPPED_TO_FIELD', 'DAMAGED'],
      SHIPPED_TO_FIELD: ['RECEIVED_ON_SITE', 'DAMAGED', 'MISSING'],
      RECEIVED_ON_SITE: ['INSTALLED', 'DAMAGED', 'EXCESS'],
      INSTALLED: [],
      DAMAGED: ['RETURNED_TO_WAREHOUSE'],
      EXCESS: ['RETURNED_TO_WAREHOUSE'],
      RETURNED_TO_WAREHOUSE: [],
      MISSING: []
    };
    
    return statusTransitions[material.status] || [];
  };

  // Format status for display
  const formatStatus = (status) => {
    return status.replace(/_/g, ' ');
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
                  {formatStatus(material.status)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Job
                </Typography>
                <Typography variant="body1">
                  {material.job?.jobName || "N/A"}
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
              {getAvailableStatusTransitions().map((status) => (
                <Button 
                  key={status} 
                  variant="outlined" 
                  size="small"
                  onClick={() => openStatusDialog(status)}
                >
                  {formatStatus(status)}
                </Button>
              ))}
              
              {getAvailableStatusTransitions().length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No status transitions available for {formatStatus(material.status)}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={viewMaterialDetails}
                fullWidth
              >
                View Full Details
              </Button>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={startScanning}
                fullWidth
              >
                Scan Another
              </Button>
            </Box>
          </CardActions>
        </Card>
      )}
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={closeStatusDialog}>
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to update the status to {formatStatus(selectedStatus)}?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Notes (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStatusDialog}>Cancel</Button>
          <Button onClick={confirmStatusUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ScanPage; 