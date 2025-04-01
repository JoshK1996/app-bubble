import { useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { listJobs, listUsers } from '../graphql/queries';
import { createJob, updateJob, deleteJob, createUser, updateUser, deleteUser } from '../graphql/mutations';

// Tabs configuration
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [openCreateJobDialog, setOpenCreateJobDialog] = useState(false);
  const [openEditJobDialog, setOpenEditJobDialog] = useState(false);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ open: false, itemId: null, itemType: null });
  const [loading, setLoading] = useState({ users: false, jobs: false, action: false });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Data states
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  // Form states
  const [newJob, setNewJob] = useState({ jobNumber: '', jobName: '', clientName: '', status: 'ACTIVE' });
  const [editingJob, setEditingJob] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', groups: [] });
  const [editingUser, setEditingUser] = useState(null);
  
  // Available user groups
  const userGroups = [
    'Admin', 'Estimator', 'Detailer', 'Purchaser', 'FieldInstaller', 'WarehouseStaff'
  ];
  
  // Job status options
  const jobStatuses = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  // Fetch users and jobs on component mount
  useEffect(() => {
    fetchUsers();
    fetchJobs();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    setError('');
    
    try {
      const response = await API.graphql({ query: listUsers });
      setUsers(response.data.listUsers.items);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Fetch all jobs
  const fetchJobs = async () => {
    setLoading(prev => ({ ...prev, jobs: true }));
    setError('');
    
    try {
      const response = await API.graphql({ query: listJobs });
      setJobs(response.data.listJobs.items);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open/close dialogs
  const handleOpenCreateJobDialog = () => {
    setNewJob({ jobNumber: '', jobName: '', clientName: '', status: 'ACTIVE' });
    setOpenCreateJobDialog(true);
  };
  
  const handleCloseCreateJobDialog = () => {
    setOpenCreateJobDialog(false);
  };
  
  const handleOpenEditJobDialog = (job) => {
    setEditingJob(job);
    setOpenEditJobDialog(true);
  };
  
  const handleCloseEditJobDialog = () => {
    setEditingJob(null);
    setOpenEditJobDialog(false);
  };
  
  const handleOpenCreateUserDialog = () => {
    setNewUser({ email: '', groups: [] });
    setOpenCreateUserDialog(true);
  };
  
  const handleCloseCreateUserDialog = () => {
    setOpenCreateUserDialog(false);
  };
  
  const handleOpenEditUserDialog = (user) => {
    setEditingUser(user);
    setOpenEditUserDialog(true);
  };
  
  const handleCloseEditUserDialog = () => {
    setEditingUser(null);
    setOpenEditUserDialog(false);
  };
  
  const handleOpenDeleteDialog = (itemId, itemType) => {
    setConfirmDeleteDialog({ open: true, itemId, itemType });
  };
  
  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog({ open: false, itemId: null, itemType: null });
  };
  
  // Job form handlers
  const handleJobInputChange = (event) => {
    const { name, value } = event.target;
    setNewJob(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditJobInputChange = (event) => {
    const { name, value } = event.target;
    setEditingJob(prev => ({ ...prev, [name]: value }));
  };
  
  // User form handlers
  const handleUserInputChange = (event) => {
    const { name, value } = event.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUserGroupsChange = (event) => {
    setNewUser(prev => ({ ...prev, groups: event.target.value }));
  };
  
  const handleEditUserInputChange = (event) => {
    const { name, value } = event.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditUserGroupsChange = (event) => {
    setEditingUser(prev => ({ ...prev, groups: event.target.value }));
  };
  
  // Create a new job
  const handleCreateJob = async (event) => {
    event.preventDefault();
    setLoading(prev => ({ ...prev, action: true }));
    setError('');
    
    try {
      // Validate form
      if (!newJob.jobNumber || !newJob.jobName) {
        throw new Error('Job Number and Job Name are required');
      }
      
      const input = {
        jobNumber: newJob.jobNumber,
        jobName: newJob.jobName,
        clientName: newJob.clientName || null,
        status: newJob.status,
        cognitoGroups: userGroups
      };
      
      const response = await API.graphql({
        query: createJob,
        variables: { input }
      });
      
      const createdJob = response.data.createJob;
      setJobs(prev => [...prev, createdJob]);
      setSuccessMessage(`Job ${createdJob.jobNumber} created successfully`);
      handleCloseCreateJobDialog();
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create job: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };
  
  // Update an existing job
  const handleUpdateJob = async (event) => {
    event.preventDefault();
    setLoading(prev => ({ ...prev, action: true }));
    setError('');
    
    try {
      // Validate form
      if (!editingJob.jobNumber || !editingJob.jobName) {
        throw new Error('Job Number and Job Name are required');
      }
      
      const input = {
        id: editingJob.id,
        jobNumber: editingJob.jobNumber,
        jobName: editingJob.jobName,
        clientName: editingJob.clientName || null,
        status: editingJob.status
      };
      
      const response = await API.graphql({
        query: updateJob,
        variables: { input }
      });
      
      const updatedJob = response.data.updateJob;
      setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
      setSuccessMessage(`Job ${updatedJob.jobNumber} updated successfully`);
      handleCloseEditJobDialog();
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Failed to update job: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };
  
  // Create a new user
  const handleCreateUser = async (event) => {
    event.preventDefault();
    setLoading(prev => ({ ...prev, action: true }));
    setError('');
    
    try {
      // Validate form
      if (!newUser.email) {
        throw new Error('Email is required');
      }
      
      if (newUser.groups.length === 0) {
        throw new Error('At least one group must be selected');
      }
      
      // In a real app, this would call Cognito's AdminCreateUser API via a custom Lambda
      // For this mock implementation, we'll use a simplified version
      const input = {
        email: newUser.email,
        groups: newUser.groups
      };
      
      const response = await API.graphql({
        query: createUser,
        variables: { input }
      });
      
      const createdUser = response.data.createUser;
      setUsers(prev => [...prev, createdUser]);
      setSuccessMessage(`User ${createdUser.username} created successfully. A temporary password has been sent to their email.`);
      handleCloseCreateUserDialog();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };
  
  // Update an existing user
  const handleUpdateUser = async (event) => {
    event.preventDefault();
    setLoading(prev => ({ ...prev, action: true }));
    setError('');
    
    try {
      // Validate form
      if (editingUser.groups.length === 0) {
        throw new Error('At least one group must be selected');
      }
      
      const input = {
        id: editingUser.id,
        groups: editingUser.groups
      };
      
      const response = await API.graphql({
        query: updateUser,
        variables: { input }
      });
      
      const updatedUser = response.data.updateUser;
      setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
      setSuccessMessage(`User ${updatedUser.username} updated successfully`);
      handleCloseEditUserDialog();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };
  
  // Delete confirmation
  const handleConfirmDelete = async () => {
    setLoading(prev => ({ ...prev, action: true }));
    setError('');
    
    try {
      const { itemId, itemType } = confirmDeleteDialog;
      
      if (itemType === 'job') {
        await API.graphql({
          query: deleteJob,
          variables: {
            input: { id: itemId }
          }
        });
        
        setJobs(prev => prev.filter(job => job.id !== itemId));
        setSuccessMessage('Job deleted successfully');
      } else if (itemType === 'user') {
        await API.graphql({
          query: deleteUser,
          variables: {
            input: { id: itemId }
          }
        });
        
        setUsers(prev => prev.filter(user => user.id !== itemId));
        setSuccessMessage('User deleted successfully');
      }
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item: ' + (err.message || 'Unknown error'));
      handleCloseDeleteDialog();
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Administration
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Users" />
          <Tab label="Jobs" />
        </Tabs>
        
        {/* Users Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenCreateUserDialog}
            >
              Add User
            </Button>
          </Box>
          
          {loading.users ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No users found. Add a user to get started.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Groups</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.groups.map((group) => (
                          <Chip 
                            key={group} 
                            label={group} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          color={user.status === 'CONFIRMED' ? 'success' : 'default'}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          sx={{ mr: 1 }}
                          onClick={() => handleOpenEditUserDialog(user)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog(user.id, 'user')}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        {/* Jobs Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenCreateJobDialog}
            >
              Add Job
            </Button>
          </Box>
          
          {loading.jobs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : jobs.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No jobs found. Add a job to get started.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Number</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.jobNumber}</TableCell>
                      <TableCell>{job.jobName}</TableCell>
                      <TableCell>{job.clientName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={job.status.replace(/_/g, ' ')} 
                          color={
                            job.status === 'ACTIVE' ? 'success' : 
                            job.status === 'ON_HOLD' ? 'warning' : 
                            job.status === 'COMPLETED' ? 'info' : 
                            'default'
                          }
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          sx={{ mr: 1 }}
                          onClick={() => handleOpenEditJobDialog(job)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog(job.id, 'job')}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>
      
      {/* Create Job Dialog */}
      <Dialog open={openCreateJobDialog} onClose={handleCloseCreateJobDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Job</DialogTitle>
        <form onSubmit={handleCreateJob}>
          <DialogContent>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Job Number"
              name="jobNumber"
              value={newJob.jobNumber}
              onChange={handleJobInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Job Name"
              name="jobName"
              value={newJob.jobName}
              onChange={handleJobInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Client Name"
              name="clientName"
              value={newJob.clientName}
              onChange={handleJobInputChange}
            />
            <TextField
              select
              margin="normal"
              fullWidth
              label="Status"
              name="status"
              value={newJob.status}
              onChange={handleJobInputChange}
            >
              {jobStatuses.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateJobDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading.action}
            >
              {loading.action ? <CircularProgress size={24} /> : 'Create Job'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Edit Job Dialog */}
      <Dialog open={openEditJobDialog && editingJob !== null} onClose={handleCloseEditJobDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Job</DialogTitle>
        {editingJob && (
          <form onSubmit={handleUpdateJob}>
            <DialogContent>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Job Number"
                name="jobNumber"
                value={editingJob.jobNumber}
                onChange={handleEditJobInputChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Job Name"
                name="jobName"
                value={editingJob.jobName}
                onChange={handleEditJobInputChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Client Name"
                name="clientName"
                value={editingJob.clientName || ''}
                onChange={handleEditJobInputChange}
              />
              <TextField
                select
                margin="normal"
                fullWidth
                label="Status"
                name="status"
                value={editingJob.status}
                onChange={handleEditJobInputChange}
              >
                {jobStatuses.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditJobDialog}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading.action}
              >
                {loading.action ? <CircularProgress size={24} /> : 'Update Job'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
      
      {/* Create User Dialog */}
      <Dialog open={openCreateUserDialog} onClose={handleCloseCreateUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <form onSubmit={handleCreateUser}>
          <DialogContent>
            <DialogContentText>
              Enter the email address for the new user. A temporary password will be sent to this email.
            </DialogContentText>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleUserInputChange}
            />
            <TextField
              select
              margin="normal"
              required
              fullWidth
              label="User Groups"
              name="groups"
              SelectProps={{
                multiple: true,
                value: newUser.groups,
                onChange: handleUserGroupsChange
              }}
            >
              {userGroups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateUserDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading.action}
            >
              {loading.action ? <CircularProgress size={24} /> : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={openEditUserDialog && editingUser !== null} onClose={handleCloseEditUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        {editingUser && (
          <form onSubmit={handleUpdateUser}>
            <DialogContent>
              <TextField
                margin="normal"
                fullWidth
                label="Username"
                value={editingUser.username}
                disabled
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                value={editingUser.email}
                disabled
              />
              <TextField
                select
                margin="normal"
                required
                fullWidth
                label="User Groups"
                name="groups"
                SelectProps={{
                  multiple: true,
                  value: editingUser.groups,
                  onChange: handleEditUserGroupsChange
                }}
              >
                {userGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditUserDialog}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading.action}
              >
                {loading.action ? <CircularProgress size={24} /> : 'Update User'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {confirmDeleteDialog.itemType}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading.action}
          >
            {loading.action ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPage; 