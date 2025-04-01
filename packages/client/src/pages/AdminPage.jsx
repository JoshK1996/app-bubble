import { useState } from 'react';
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
  Grid
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

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
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ open: false, itemId: null, itemType: null });
  
  // Mock data for users
  const mockUsers = [
    { id: 'user-1', username: 'john.smith', email: 'john.smith@example.com', groups: ['Admin', 'Estimator'] },
    { id: 'user-2', username: 'jane.doe', email: 'jane.doe@example.com', groups: ['Purchaser', 'FieldInstaller'] },
    { id: 'user-3', username: 'bob.jones', email: 'bob.jones@example.com', groups: ['Detailer', 'WarehouseStaff'] }
  ];
  
  // Mock data for jobs
  const mockJobs = [
    { id: 'job-1', jobNumber: 'J-001', jobName: 'Downtown Hospital Project', clientName: 'City Healthcare', status: 'ACTIVE' },
    { id: 'job-2', jobNumber: 'J-002', jobName: 'Office Tower Renovation', clientName: 'Skyline Properties', status: 'ACTIVE' },
    { id: 'job-3', jobNumber: 'J-003', jobName: 'School District HVAC Upgrade', clientName: 'Unified School District', status: 'ON_HOLD' },
    { id: 'job-4', jobNumber: 'J-004', jobName: 'Residential Complex Plumbing', clientName: 'Urban Living', status: 'COMPLETED' }
  ];
  
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
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open/close dialogs
  const handleOpenCreateJobDialog = () => {
    setOpenCreateJobDialog(true);
  };
  
  const handleCloseCreateJobDialog = () => {
    setOpenCreateJobDialog(false);
  };
  
  const handleOpenCreateUserDialog = () => {
    setOpenCreateUserDialog(true);
  };
  
  const handleCloseCreateUserDialog = () => {
    setOpenCreateUserDialog(false);
  };
  
  const handleOpenDeleteDialog = (itemId, itemType) => {
    setConfirmDeleteDialog({ open: true, itemId, itemType });
  };
  
  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog({ open: false, itemId: null, itemType: null });
  };
  
  // Handle create job
  const handleCreateJob = (event) => {
    event.preventDefault();
    // In a real app, this would submit the form data to API
    console.log('Create job form submitted');
    handleCloseCreateJobDialog();
  };
  
  // Handle create user
  const handleCreateUser = (event) => {
    event.preventDefault();
    // In a real app, this would submit the form data to API
    console.log('Create user form submitted');
    handleCloseCreateUserDialog();
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = () => {
    // In a real app, this would call the API to delete the item
    console.log(`Delete ${confirmDeleteDialog.itemType} with ID ${confirmDeleteDialog.itemId}`);
    handleCloseDeleteDialog();
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Administration
      </Typography>
      
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
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Groups</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockUsers.map((user) => (
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
                    <TableCell align="right">
                      <IconButton size="small" sx={{ mr: 1 }}>
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
                {mockJobs.map((job) => (
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
                      <IconButton size="small" sx={{ mr: 1 }}>
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
        </TabPanel>
      </Paper>
      
      {/* Create Job Dialog */}
      <Dialog open={openCreateJobDialog} onClose={handleCloseCreateJobDialog}>
        <DialogTitle>Create New Job</DialogTitle>
        <form onSubmit={handleCreateJob}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  required
                  label="Job Number"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Job Name"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Client Name"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  required
                  label="Status"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  defaultValue="ACTIVE"
                >
                  {jobStatuses.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateJobDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Create User Dialog */}
      <Dialog open={openCreateUserDialog} onClose={handleCloseCreateUserDialog}>
        <DialogTitle>Create New User</DialogTitle>
        <form onSubmit={handleCreateUser}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  required
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Username"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  User Groups
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {userGroups.map((group) => (
                    <Chip
                      key={group}
                      label={group}
                      variant="outlined"
                      onClick={() => {}} // Toggle selection in a real app
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateUserDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {confirmDeleteDialog.itemType}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPage; 