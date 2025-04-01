import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Add, FilterList } from '@mui/icons-material';
import { listJobs, createJob, subscribeToCreateJob, subscribeToUpdateJob } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const JobsListPage = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New job form state
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [newJobData, setNewJobData] = useState({
    jobNumber: '',
    jobName: '',
    clientName: '',
    status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Status color mapping
  const statusColors = {
    ACTIVE: 'success',
    ON_HOLD: 'warning',
    COMPLETED: 'info',
    ARCHIVED: 'default'
  };
  
  // Fetch jobs on initial load
  useEffect(() => {
    fetchJobs();
    
    // Set up subscriptions for real-time updates
    const createSubscription = subscribeToCreateJob((newJob) => {
      setJobs(prevJobs => [newJob, ...prevJobs]);
    });
    
    const updateSubscription = subscribeToUpdateJob((updatedJob) => {
      setJobs(prevJobs => 
        prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job)
      );
    });
    
    return () => {
      // Clean up subscriptions
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
    };
  }, []);
  
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await listJobs();
      setJobs(response?.items || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
      setLoading(false);
    }
  };
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleOpenJobDialog = () => {
    setOpenJobDialog(true);
  };
  
  const handleCloseJobDialog = () => {
    setOpenJobDialog(false);
    setNewJobData({
      jobNumber: '',
      jobName: '',
      clientName: '',
      status: 'ACTIVE'
    });
    setFormErrors({});
  };
  
  const handleNewJobInputChange = (e) => {
    const { name, value } = e.target;
    setNewJobData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateJobForm = () => {
    const errors = {};
    
    if (!newJobData.jobNumber.trim()) {
      errors.jobNumber = 'Job Number is required';
    }
    
    if (!newJobData.jobName.trim()) {
      errors.jobName = 'Job Name is required';
    }
    
    if (!newJobData.status) {
      errors.status = 'Status is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleCreateJob = async () => {
    if (!validateJobForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Add cognitoGroups for auth
      const input = {
        ...newJobData,
        cognitoGroups: ['Admin', 'Estimator', 'Detailer', 'Purchaser', 'WarehouseStaff', 'FieldInstaller']
      };
      
      const newJob = await createJob(input);
      
      // Close dialog and reset form
      handleCloseJobDialog();
      
      // Navigate to the new job detail page
      navigate(`/jobs/${newJob.id}`);
    } catch (err) {
      console.error('Error creating job:', err);
      setFormErrors(prev => ({ ...prev, submit: 'Failed to create job. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter jobs based on status and search query
  const filteredJobs = jobs.filter(job => {
    // Status filter
    if (filterStatus && job.status !== filterStatus) {
      return false;
    }
    
    // Search query filter (job number, name, or client)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (job.jobNumber?.toLowerCase().includes(query)) ||
        (job.jobName?.toLowerCase().includes(query)) ||
        (job.clientName?.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const isAsc = order === 'asc';
    
    if (orderBy === 'createdAt' || orderBy === 'updatedAt') {
      return isAsc
        ? new Date(a[orderBy]) - new Date(b[orderBy])
        : new Date(b[orderBy]) - new Date(a[orderBy]);
    }
    
    // For string fields
    if (!a[orderBy]) return isAsc ? -1 : 1;
    if (!b[orderBy]) return isAsc ? 1 : -1;
    
    return isAsc
      ? a[orderBy].localeCompare(b[orderBy])
      : b[orderBy].localeCompare(a[orderBy]);
  });
  
  if (loading && jobs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Jobs</Typography>
        
        {hasRole(['Admin']) && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenJobDialog}
          >
            New Job
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search Jobs"
              placeholder="Job number, name, or client"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="ON_HOLD">On Hold</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="ARCHIVED">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
            <Button 
              startIcon={<FilterList />}
              onClick={() => {
                setFilterStatus('');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Jobs Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'jobNumber'}
                  direction={orderBy === 'jobNumber' ? order : 'asc'}
                  onClick={() => handleRequestSort('jobNumber')}
                >
                  Job Number
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'jobName'}
                  direction={orderBy === 'jobName' ? order : 'asc'}
                  onClick={() => handleRequestSort('jobName')}
                >
                  Job Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'clientName'}
                  direction={orderBy === 'clientName' ? order : 'asc'}
                  onClick={() => handleRequestSort('clientName')}
                >
                  Client
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={orderBy === 'createdAt' ? order : 'asc'}
                  onClick={() => handleRequestSort('createdAt')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'updatedAt'}
                  direction={orderBy === 'updatedAt' ? order : 'asc'}
                  onClick={() => handleRequestSort('updatedAt')}
                >
                  Updated
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No jobs found. {hasRole(['Admin']) ? 'Click "New Job" to create one.' : ''}
                </TableCell>
              </TableRow>
            ) : (
              sortedJobs.map((job) => (
                <TableRow 
                  key={job.id} 
                  hover 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{job.jobNumber}</TableCell>
                  <TableCell>{job.jobName}</TableCell>
                  <TableCell>{job.clientName || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={job.status} 
                      color={statusColors[job.status] || 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{formatDate(job.createdAt)}</TableCell>
                  <TableCell>{formatDate(job.updatedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Create Job Dialog */}
      <Dialog open={openJobDialog} onClose={handleCloseJobDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Job</DialogTitle>
        <DialogContent>
          {formErrors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.submit}
            </Alert>
          )}
          
          <TextField
            margin="dense"
            name="jobNumber"
            label="Job Number"
            type="text"
            fullWidth
            required
            value={newJobData.jobNumber}
            onChange={handleNewJobInputChange}
            error={!!formErrors.jobNumber}
            helperText={formErrors.jobNumber}
          />
          
          <TextField
            margin="dense"
            name="jobName"
            label="Job Name"
            type="text"
            fullWidth
            required
            value={newJobData.jobName}
            onChange={handleNewJobInputChange}
            error={!!formErrors.jobName}
            helperText={formErrors.jobName}
          />
          
          <TextField
            margin="dense"
            name="clientName"
            label="Client Name"
            type="text"
            fullWidth
            value={newJobData.clientName}
            onChange={handleNewJobInputChange}
          />
          
          <FormControl fullWidth margin="dense" error={!!formErrors.status}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={newJobData.status}
              label="Status"
              onChange={handleNewJobInputChange}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="ON_HOLD">On Hold</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="ARCHIVED">Archived</MenuItem>
            </Select>
            {formErrors.status && (
              <DialogContentText color="error" fontSize="0.75rem" margin="3px 14px 0">
                {formErrors.status}
              </DialogContentText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJobDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateJob} 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobsListPage; 