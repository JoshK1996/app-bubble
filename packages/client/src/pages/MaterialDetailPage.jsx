import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API } from 'aws-amplify';
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
  IconButton,
  Stack,
  Tab,
  Tabs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ArrowBack, Edit, History, QrCode2 } from '@mui/icons-material';
import { getMaterial } from '../graphql/queries';
import { updateMaterialStatus } from '../graphql/mutations';
import MaterialQRCode from '../components/MaterialQRCode';
import MaterialHistory from '../components/MaterialHistory';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`material-tabpanel-${index}`}
      aria-labelledby={`material-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MaterialDetailPage = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const qrCodeParam = queryParams.get('qrCode');
  
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Status update dialog
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // QR Code dialog
  const [showQrDialog, setShowQrDialog] = useState(false);
  
  // Status color mapping
  const statusColors = {
    ESTIMATED: 'default',
    DETAILED: 'primary',
    RELEASED_TO_FAB: 'secondary',
    IN_FABRICATION: 'warning',
    FABRICATED: 'info',
    SHIPPED_TO_FIELD: 'warning',
    RECEIVED_ON_SITE: 'info',
    INSTALLED: 'success',
    EXCESS: 'default',
    RETURNED_TO_WAREHOUSE: 'default',
    DAMAGED: 'error',
    MISSING: 'error'
  };
  
  // Available transitions
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
  
  // Load material data - either by ID or by QR code
  useEffect(() => {
    const fetchMaterialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let materialData;
        
        // If QR code is provided in the URL, use it to look up the material
        if (qrCodeParam) {
          const result = await API.graphql({
            query: materialByQrCode,
            variables: { 
              qrCodeData: qrCodeParam,
              limit: 1
            }
          });
          
          if (result?.data?.materialByQrCode?.items?.length > 0) {
            materialData = result.data.materialByQrCode.items[0];
            
            // Update URL to use the material ID for better bookmarking
            navigate(`/materials/${materialData.id}`, { replace: true });
          } else {
            throw new Error('Material not found with the provided QR code');
          }
        } else if (materialId) {
          // Otherwise use the material ID from the URL
          const result = await API.graphql({
            query: getMaterial,
            variables: { id: materialId }
          });
          
          materialData = result.data.getMaterial;
          
          if (!materialData) {
            throw new Error('Material not found');
          }
        } else {
          throw new Error('No material ID or QR code provided');
        }
        
        setMaterial(materialData);
        setLoading(false);
        
        // Pre-populate status field with current status
        if (materialData) {
          setNewStatus(materialData.status);
        }
        
      } catch (err) {
        console.error('Error fetching material data:', err);
        setError(err.message || 'Failed to load material details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchMaterialData();
  }, [materialId, qrCodeParam, navigate]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenStatusDialog = () => {
    setOpenStatusDialog(true);
  };
  
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setStatusNotes('');
    // Reset status to current
    if (material) {
      setNewStatus(material.status);
    }
  };
  
  const handleStatusChange = async () => {
    if (!material || !newStatus) return;
    
    setIsSubmitting(true);
    
    try {
      // Call API to update status
      const result = await API.graphql({
        query: updateMaterialStatus,
        variables: {
          materialId: material.id,
          status: newStatus,
          notes: statusNotes
        }
      });
      
      // Update local state with new status
      setMaterial(prev => ({
        ...prev,
        status: result.data.updateMaterialStatus.status,
        updatedAt: result.data.updateMaterialStatus.updatedAt
      }));
      
      // Close dialog
      handleCloseStatusDialog();
      
    } catch (err) {
      console.error('Error updating material status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatStatus = (status) => {
    return status.replace(/_/g, ' ');
  };
  
  const handleShowQrCode = () => {
    setShowQrDialog(true);
  };
  
  const handleCloseQrDialog = () => {
    setShowQrDialog(false);
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
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  if (!material) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">
          <AlertTitle>Material Not Found</AlertTitle>
          The requested material doesn't exist or you don't have permission to view it.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/materials')}
          sx={{ mt: 2 }}
        >
          Back to Materials
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Material Details
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="material tabs"
          >
            <Tab label="Details" id="material-tab-0" />
            <Tab label="History" id="material-tab-1" />
          </Tabs>
        </Box>
        
        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" component="h2">
                {material.materialIdentifier}
              </Typography>
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<QrCode2 />}
                  onClick={handleShowQrCode}
                >
                  QR Code
                </Button>
                
                {statusTransitions[material.status]?.length > 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenStatusDialog}
                  >
                    Update Status
                  </Button>
                )}
              </Stack>
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {material.description || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Current Status
                    </Typography>
                    <Chip 
                      label={formatStatus(material.status)}
                      color={statusColors[material.status] || 'default'}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Material Type
                    </Typography>
                    <Typography variant="body1">
                      {material.materialType || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      System Type
                    </Typography>
                    <Typography variant="body1">
                      {material.systemType || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Project Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Job
                    </Typography>
                    <Typography variant="body1">
                      {material.job?.jobName || 'N/A'}
                      {material.job?.jobNumber && ` (${material.job.jobNumber})`}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {material.locationLevel && `Level: ${material.locationLevel}`}
                      {material.locationZone && material.locationLevel && ', '}
                      {material.locationZone && `Zone: ${material.locationZone}`}
                      {!material.locationLevel && !material.locationZone && 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Quantity Estimated
                    </Typography>
                    <Typography variant="body1">
                      {material.quantityEstimated ? 
                        `${material.quantityEstimated} ${material.unitOfMeasure || ''}` : 
                        'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Drawing Reference
                    </Typography>
                    <Typography variant="body1">
                      {material.detailDrawingId || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Tracking Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(material.createdAt)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body1">
                      {material.createdBy || 'System'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(material.updatedAt)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated By
                    </Typography>
                    <Typography variant="body1">
                      {material.lastUpdatedBy || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* History Tab */}
        <TabPanel value={tabValue} index={1}>
          <MaterialHistory materialId={material.id} />
        </TabPanel>
      </Paper>
      
      {/* Status Update Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Update Material Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Current status: <Chip 
              label={formatStatus(material.status)} 
              color={statusColors[material.status] || 'default'}
              size="small"
              sx={{ ml: 1 }}
            />
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="new-status-label">New Status</InputLabel>
            <Select
              labelId="new-status-label"
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {statusTransitions[material.status]?.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatStatus(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Notes (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting || !newStatus || newStatus === material.status}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onClose={handleCloseQrDialog} maxWidth="sm">
        <DialogTitle>Material QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <MaterialQRCode 
              data={material.qrCodeData} 
              identifier={material.materialIdentifier}
              description={material.description}
              size={250}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialDetailPage; 