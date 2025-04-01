import { useState, useEffect } from 'react';
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
  DialogTitle,
  Snackbar
} from '@mui/material';
import { WiFiOff as WiFiOffIcon } from '@mui/icons-material';
import { materialByQrCode } from '../graphql/queries';
import { updateMaterialStatus } from '../graphql/mutations';
import * as syncManager from '../offline/syncManager';

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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineSnackbarOpen, setOfflineSnackbarOpen] = useState(false);
  const [offlineActionQueued, setOfflineActionQueued] = useState(false);

  // Set up online/offline event listeners
  useEffect(() => {
    syncManager.setupNetworkListeners(
      // Online callback
      () => {
        setIsOffline(false);
        // Try to sync any pending operations
        syncManager.syncPendingOperations().catch(console.error);
      },
      // Offline callback
      () => {
        setIsOffline(true);
        setOfflineSnackbarOpen(true);
      }
    );
    
    // Initialize offline status
    setIsOffline(!syncManager.isOnline());
    
    return () => {
      // Cleanup event listeners (note: not all browsers support this)
      window.removeEventListener('online', null);
      window.removeEventListener('offline', null);
    };
  }, []);

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
      if (isOffline) {
        // Try to find the material in the local cache
        const cachedMaterial = await syncManager.getCachedMaterialByQrCode(qrData);
        
        if (cachedMaterial) {
          setMaterial(cachedMaterial);
        } else {
          setError('Material not found in offline cache. Please try again when online.');
        }
      } else {
        // Online mode - call the GraphQL API
        const response = await API.graphql({
          query: materialByQrCode,
          variables: { 
            qrCodeData: qrData,
            limit: 1
          }
        });
        
        const items = response.data.materialByQrCode.items;
        
        if (items && items.length > 0) {
          const fetchedMaterial = items[0];
          setMaterial(fetchedMaterial);
          
          // Cache the material for offline use
          await syncManager.cacheMaterial(fetchedMaterial);
          
          // If the material has a job, cache that too
          if (fetchedMaterial.job) {
            await syncManager.cacheJob(fetchedMaterial.job);
          }
        } else {
          setError('Material not found with this QR code');
        }
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
    setOfflineActionQueued(false);
    
    try {
      const variables = { 
        materialId: material.id, 
        status: newStatus,
        notes: notes
      };
      
      if (isOffline) {
        // Queue the operation for later sync
        await syncManager.queueOperation(
          syncManager.OPERATION_TYPES.UPDATE_MATERIAL_STATUS,
          {
            mutation: updateMaterialStatus,
            variables
          }
        );
        
        // Update the local cache immediately
        const updatedMaterial = {
          ...material,
          status: newStatus
        };
        
        await syncManager.cacheMaterial(updatedMaterial);
        setMaterial(updatedMaterial);
        setOfflineActionQueued(true);
      } else {
        // Online mode - call the GraphQL API directly
        const response = await API.graphql({
          query: updateMaterialStatus,
          variables
        });
        
        const updatedMaterial = response.data.updateMaterialStatus;
        setMaterial(updatedMaterial);
        
        // Update cache for offline use
        await syncManager.cacheMaterial(updatedMaterial);
      }
      
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
      {isOffline && (
        <Alert 
          severity="warning" 
          icon={<WiFiOffIcon />}
          sx={{ mb: 2 }}
        >
          You are currently offline. Limited functionality is available.
        </Alert>
      )}
      
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
            {isOffline && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'warning.main' }}>
                You are offline. This change will be applied when you reconnect.
              </Box>
            )}
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
      
      {/* Offline Snackbar */}
      <Snackbar
        open={offlineSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setOfflineSnackbarOpen(false)}
        message="You are now offline. Some features may be limited."
      />
      
      {/* Offline Action Queued Snackbar */}
      <Snackbar
        open={offlineActionQueued}
        autoHideDuration={6000}
        onClose={() => setOfflineActionQueued(false)}
        message="Status update queued. Changes will sync when you're back online."
      />
    </Box>
  );
}

export default ScanPage; 