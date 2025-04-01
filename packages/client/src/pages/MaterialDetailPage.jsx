import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { 
  getMaterial, 
  materialByQrCode, 
  updateMaterial, 
  updateMaterialStatus,
  listMaterialHistories
} from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import MaterialQRCode from '../components/MaterialQRCode';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MaterialDetailPage = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const qrCodeParam = queryParams.get('qrCode');
  
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
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
  
  // Load material data - either by ID or by QR code
  useEffect(() => {
    const fetchMaterialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let materialData;
        
        // If QR code is provided in the URL, use it to look up the material
        if (qrCodeParam) {
          const result = await materialByQrCode(qrCodeParam);
          if (result?.items?.length > 0) {
            materialData = result.items[0];
            
            // Update URL to use the material ID for better bookmarking
            navigate(`/materials/${materialData.id}`, { replace: true });
          } else {
            throw new Error('Material not found with the provided QR code');
          }
        } else if (materialId) {
          // Otherwise use the material ID from the URL
          materialData = await getMaterial(materialId);
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
  
  // Fetch material history when tab changes to history
  useEffect(() => {
    if (tabValue === 1 && material && !history.length && !loadingHistory) {
      fetchMaterialHistory();
    }
  }, [tabValue, material, history.length]);
  
  const fetchMaterialHistory = async () => {
    if (!material) return;
    
    try {
      setLoadingHistory(true);
      
      const result = await listMaterialHistories({
        filter: { materialId: { eq: material.id } },
        limit: 100
      });
      
      // Sort history by timestamp (newest first)
      const sortedHistory = (result?.items || []).sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      setHistory(sortedHistory);
      setLoadingHistory(false);
    } catch (err) {
      console.error('Error fetching material history:', err);
      setLoadingHistory(false);
    }
  };
  
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
      const result = await updateMaterialStatus(material.id, newStatus, statusNotes);
      
      // Update local state with new status
      setMaterial(prev => ({
        ...prev,
        status: result.status,
        updatedAt: result.updatedAt,
        lastUpdatedBy: result.lastUpdatedBy
      }));
      
      // Close dialog
      handleCloseStatusDialog();
      
      // Refresh history if we're on that tab
      if (tabValue === 1) {
        fetchMaterialHistory();
      }
    } catch (err) {
      console.error('Error updating material status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    <Box sx={{ px: 2, py: 3 }}>
      {/* Header with Back Button and Title */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          
          <Typography variant="h4" gutterBottom>
            {material.materialIdentifier || 'Material Details'}
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Status:
            </Typography>
            <Chip 
              label={material.status} 
              color={statusColors[material.status] || 'default'} 
              size="small"
            />
          </Stack>
          
          {material.job && (
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Job: <Button 
                    variant="text" 
                    size="small" 
                    onClick={() => navigate(`/jobs/${material.job.id}`)}
                  >
                    {material.job.jobNumber} - {material.job.jobName}
                  </Button>
            </Typography>
          )}
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<QrCode2 />}
            variant="outlined"
            onClick={() => setShowQrDialog(true)}
          >
            View QR Code
          </Button>
          
          {hasRole(['Admin', 'Estimator', 'Detailer', 'Purchaser', 'WarehouseStaff', 'FieldInstaller']) && (
            <Button
              startIcon={<Edit />}
              variant="contained"
              onClick={handleOpenStatusDialog}
            >
              Update Status
            </Button>
          )}
        </Stack>
      </Box>
      
      {/* Tabs for Details and History */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<Edit />} label="Details" />
          <Tab icon={<History />} label="History" />
        </Tabs>
      </Box>
      
      {/* Details Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Left column - Basic Info */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Identifier
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.materialIdentifier || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.description || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Material Type
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.materialType || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    System Type
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.systemType || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quantity
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.quantityEstimated ? `${material.quantityEstimated} ${material.unitOfMeasure || ''}` : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Right column - Location & Tracking */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Location & Tracking</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location Level
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.locationLevel || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location Zone
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.locationZone || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    QR Code Data
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.qrCodeData || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Drawing ID
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.detailDrawingId || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created By
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.createdBy || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {formatDate(material.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated By
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {material.lastUpdatedBy || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {formatDate(material.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* History Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Material History</Typography>
          <Divider sx={{ mb: 2 }} />
          
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : history.length === 0 ? (
            <Alert severity="info">
              No history records found for this material.
            </Alert>
          ) : (
            <Box>
              {history.map((record) => (
                <Paper 
                  key={record.id} 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3} md={2}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(record.timestamp)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={9} md={10}>
                      <Typography variant="subtitle2">
                        {record.action === 'UPDATE_STATUS' ? 'Status Update' : record.action}
                      </Typography>
                      
                      {record.fieldName && (
                        <Typography variant="body2" gutterBottom>
                          Changed <strong>{record.fieldName}</strong> from <strong>{record.oldValue || 'none'}</strong> to <strong>{record.newValue}</strong>
                        </Typography>
                      )}
                      
                      {record.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Notes: {record.notes}
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        By: {record.userId || 'Unknown'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      )}
      
      {/* Status Update Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Material Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the status of material <strong>{material.materialIdentifier || material.id}</strong>
          </DialogContentText>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="ESTIMATED">Estimated</MenuItem>
              <MenuItem value="DETAILED">Detailed</MenuItem>
              <MenuItem value="RELEASED_TO_FAB">Released to Fabrication</MenuItem>
              <MenuItem value="IN_FABRICATION">In Fabrication</MenuItem>
              <MenuItem value="FABRICATED">Fabricated</MenuItem>
              <MenuItem value="SHIPPED_TO_FIELD">Shipped to Field</MenuItem>
              <MenuItem value="RECEIVED_ON_SITE">Received on Site</MenuItem>
              <MenuItem value="INSTALLED">Installed</MenuItem>
              <MenuItem value="EXCESS">Excess Material</MenuItem>
              <MenuItem value="RETURNED_TO_WAREHOUSE">Returned to Warehouse</MenuItem>
              <MenuItem value="DAMAGED">Damaged</MenuItem>
              <MenuItem value="MISSING">Missing</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Notes"
            multiline
            rows={3}
            fullWidth
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            placeholder="Add any relevant notes about this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained" 
            disabled={isSubmitting || newStatus === material.status}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onClose={() => setShowQrDialog(false)} maxWidth="xs">
        <DialogTitle>Material QR Code</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <MaterialQRCode
            qrCodeData={material.qrCodeData}
            materialId={material.id}
            materialIdentifier={material.materialIdentifier}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Material ID: {material.id}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            QR Code Data: {material.qrCodeData}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQrDialog(false)}>Close</Button>
          <Button variant="contained">Print</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialDetailPage; 