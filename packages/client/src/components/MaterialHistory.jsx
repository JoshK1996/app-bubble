import { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Create as CreateIcon,
  Update as UpdateIcon,
  LocalShipping as ShippingIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SwapHoriz as SwapIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { materialHistoryByMaterial } from '../graphql/queries';

// Helper function to format dates
const formatDateTime = (isoString) => {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper to format action type
const formatAction = (action) => {
  switch (action) {
    case 'CREATE':
      return 'Created';
    case 'UPDATE':
      return 'Updated';
    case 'UPDATE_STATUS':
      return 'Status Changed';
    case 'SCAN':
      return 'Scanned';
    case 'IMPORT':
      return 'Imported';
    default:
      return action;
  }
};

// Get icon for action type
const getActionIcon = (action) => {
  switch (action) {
    case 'CREATE':
      return <CreateIcon />;
    case 'UPDATE':
      return <UpdateIcon />;
    case 'UPDATE_STATUS':
      return <SwapIcon />;
    case 'SCAN':
      return <CheckCircleIcon />;
    case 'IMPORT':
      return <InfoIcon />;
    default:
      return <InfoIcon />;
  }
};

// Get color for timeline dot based on action
const getTimelineDotColor = (action, oldValue, newValue) => {
  if (action === 'UPDATE_STATUS') {
    if (newValue === 'DAMAGED' || newValue === 'MISSING') {
      return 'error';
    } else if (newValue === 'INSTALLED') {
      return 'success';
    } else if (newValue === 'FABRICATED' || newValue === 'IN_FABRICATION') {
      return 'primary';
    } else if (newValue === 'SHIPPED_TO_FIELD' || newValue === 'RECEIVED_ON_SITE') {
      return 'info';
    }
  }
  
  switch (action) {
    case 'CREATE':
      return 'success';
    case 'UPDATE':
      return 'primary';
    case 'SCAN':
      return 'info';
    case 'IMPORT':
      return 'warning';
    default:
      return 'default';
  }
};

function MaterialHistory({ materialId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    if (!materialId) return;
    
    fetchHistory();
  }, [materialId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.graphql({
        query: materialHistoryByMaterial,
        variables: {
          materialId,
          sortDirection: 'DESC',
          limit: 100
        }
      });
      
      const historyItems = response.data.materialHistoryByMaterial.items;
      setHistory(historyItems);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching material history:', err);
      setError('Failed to load history: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (history.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No history records found for this material.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Material History ({history.length} records)
      </Typography>
      
      <Timeline position="alternate">
        {history.map((item) => (
          <TimelineItem key={item.id}>
            <TimelineOppositeContent color="text.secondary">
              {formatDateTime(item.timestamp)}
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineDot color={getTimelineDotColor(item.action, item.oldValue, item.newValue)}>
                {getActionIcon(item.action)}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            
            <TimelineContent>
              <Card variant="outlined">
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle1" component="div" fontWeight="medium">
                      {formatAction(item.action)}
                      {item.fieldName && ` - ${item.fieldName}`}
                    </Typography>
                    
                    <IconButton 
                      size="small" 
                      onClick={() => toggleExpanded(item.id)}
                      sx={{ ml: 1 }}
                    >
                      {expandedItems[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    By: {item.userId || 'System'}
                  </Typography>
                  
                  {item.action === 'UPDATE_STATUS' && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={item.oldValue?.replace(/_/g, ' ') || 'None'} 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <SwapIcon fontSize="small" sx={{ mx: 1 }} />
                      <Chip 
                        label={item.newValue?.replace(/_/g, ' ') || 'None'} 
                        size="small" 
                        color={getTimelineDotColor(item.action, item.oldValue, item.newValue)}
                      />
                    </Box>
                  )}
                  
                  <Collapse in={expandedItems[item.id]}>
                    {item.notes && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">
                          <strong>Notes:</strong> {item.notes}
                        </Typography>
                      </>
                    )}
                    
                    {(item.oldValue || item.newValue) && item.action !== 'UPDATE_STATUS' && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">
                          {item.oldValue && (
                            <Box>
                              <strong>Previous value:</strong> {item.oldValue}
                            </Box>
                          )}
                          {item.newValue && (
                            <Box>
                              <strong>New value:</strong> {item.newValue}
                            </Box>
                          )}
                        </Typography>
                      </>
                    )}
                    
                    {item.location && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">
                          <strong>Location:</strong> {item.location}
                        </Typography>
                      </>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}

export default MaterialHistory; 