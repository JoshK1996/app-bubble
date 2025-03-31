import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  SelectChangeEvent,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  BusinessCenter as BusinessIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

// Define client type
type ClientType = 'Individual' | 'Business' | 'Government' | 'Non-Profit';

// Define client status
type ClientStatus = 'Active' | 'Inactive' | 'Prospect';

// Client interface
interface Client {
  id: number;
  name: string;
  type: ClientType;
  status: ClientStatus;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  notes: string;
  totalMissions: number;
  totalRevenue: number;
  dateAdded: string;
  rating: number;
}

/**
 * Client Management page component with CRUD operations
 */
const ClientManagement: React.FC = () => {
  // Sample client data (in a real app, this would come from an API)
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: 'ABC Real Estate',
      type: 'Business',
      status: 'Active',
      email: 'contact@abcrealestate.com',
      phone: '123-456-7890',
      address: '123 Business Ave, Suite 200, New York, NY 10001',
      contactPerson: 'John Smith',
      notes: 'Regular client for property listings and marketing',
      totalMissions: 12,
      totalRevenue: 15000,
      dateAdded: '2024-01-15',
      rating: 5
    },
    {
      id: 2,
      name: 'City of Riverside',
      type: 'Government',
      status: 'Active',
      email: 'planning@riverside.gov',
      phone: '987-654-3210',
      address: '555 City Hall Rd, Riverside, CA 92501',
      contactPerson: 'Mayor Johnson',
      notes: 'Infrastructure mapping and event coverage',
      totalMissions: 8,
      totalRevenue: 24000,
      dateAdded: '2024-02-20',
      rating: 4
    },
    {
      id: 3,
      name: 'Green Fields Foundation',
      type: 'Non-Profit',
      status: 'Active',
      email: 'info@greenfields.org',
      phone: '555-123-4567',
      address: '789 Environmental Way, Portland, OR 97201',
      contactPerson: 'Dr. Emily Green',
      notes: 'Wildlife monitoring and conservation projects',
      totalMissions: 5,
      totalRevenue: 7500,
      dateAdded: '2024-03-10',
      rating: 5
    },
    {
      id: 4,
      name: 'David Wilson',
      type: 'Individual',
      status: 'Inactive',
      email: 'david.wilson@email.com',
      phone: '333-555-7777',
      address: '42 Maple St, Burlington, VT 05401',
      contactPerson: 'David Wilson',
      notes: 'Commissioned wedding and property videos',
      totalMissions: 2,
      totalRevenue: 1800,
      dateAdded: '2024-01-30',
      rating: 3
    },
    {
      id: 5,
      name: 'TechStart Inc.',
      type: 'Business',
      status: 'Prospect',
      email: 'bd@techstart.com',
      phone: '888-999-0000',
      address: '1010 Innovation Dr, Austin, TX 78701',
      contactPerson: 'Jessica Lee',
      notes: 'Interested in promotional videos for new product launch',
      totalMissions: 0,
      totalRevenue: 0,
      dateAdded: '2024-03-25',
      rating: 0
    }
  ]);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  
  // Current client being edited, deleted, or viewed
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  
  // New client form state
  const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'totalMissions' | 'totalRevenue' | 'rating'>>({
    name: '',
    type: 'Business',
    status: 'Prospect',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    notes: '',
    dateAdded: new Date().toISOString().split('T')[0]
  });
  
  // Dialog handlers
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewClient({
      name: '',
      type: 'Business',
      status: 'Prospect',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      notes: '',
      dateAdded: new Date().toISOString().split('T')[0]
    });
  };
  
  const handleOpenEditDialog = (client: Client) => {
    setCurrentClient(client);
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentClient(null);
  };
  
  const handleOpenDeleteDialog = (client: Client) => {
    setCurrentClient(client);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentClient(null);
  };
  
  const handleOpenViewDialog = (client: Client) => {
    setCurrentClient(client);
    setOpenViewDialog(true);
  };
  
  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setCurrentClient(null);
  };
  
  // Tab handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Form handlers for text inputs
  const handleAddClientChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNewClient({
      ...newClient,
      [name as string]: value
    });
  };
  
  // Specific handlers for select inputs
  const handleAddTypeChange = (event: SelectChangeEvent<ClientType>) => {
    setNewClient({
      ...newClient,
      type: event.target.value as ClientType
    });
  };
  
  const handleAddStatusChange = (event: SelectChangeEvent<ClientStatus>) => {
    setNewClient({
      ...newClient,
      status: event.target.value as ClientStatus
    });
  };
  
  const handleEditClientChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (!currentClient) return;
    
    const { name, value } = e.target;
    setCurrentClient({
      ...currentClient,
      [name as string]: value
    });
  };
  
  const handleEditTypeChange = (event: SelectChangeEvent<ClientType>) => {
    if (!currentClient) return;
    
    setCurrentClient({
      ...currentClient,
      type: event.target.value as ClientType
    });
  };
  
  const handleEditStatusChange = (event: SelectChangeEvent<ClientStatus>) => {
    if (!currentClient) return;
    
    setCurrentClient({
      ...currentClient,
      status: event.target.value as ClientStatus
    });
  };
  
  // CRUD operations
  const handleAddClient = () => {
    const id = Math.max(0, ...clients.map(c => c.id)) + 1;
    setClients([...clients, { 
      id, 
      ...newClient, 
      totalMissions: 0, 
      totalRevenue: 0,
      rating: 0
    }]);
    handleCloseAddDialog();
  };
  
  const handleUpdateClient = () => {
    if (!currentClient) return;
    
    setClients(clients.map(client => 
      client.id === currentClient.id ? currentClient : client
    ));
    handleCloseEditDialog();
  };
  
  const handleDeleteClient = () => {
    if (!currentClient) return;
    
    setClients(clients.filter(client => client.id !== currentClient.id));
    handleCloseDeleteDialog();
  };
  
  // Helper functions
  const getStatusColor = (status: ClientStatus) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      case 'Prospect': return 'warning';
      default: return 'default';
    }
  };
  
  const getClientTypeIcon = (type: ClientType) => {
    switch(type) {
      case 'Business': return <BusinessIcon />;
      case 'Individual': return <PersonIcon />;
      case 'Government': return <GroupIcon />;
      case 'Non-Profit': return <StarIcon />;
      default: return <BusinessIcon />;
    }
  };
  
  const getRatingStars = (rating: number) => {
    return (
      <Box>
        {[...Array(5)].map((_, i) => (
          i < rating ? 
            <StarIcon key={i} fontSize="small" color="primary" /> : 
            <StarBorderIcon key={i} fontSize="small" color="disabled" />
        ))}
      </Box>
    );
  };

  // Filter clients based on tab
  const filteredClients = () => {
    switch(tabValue) {
      case 0: // All
        return clients;
      case 1: // Active
        return clients.filter(client => client.status === 'Active');
      case 2: // Inactive
        return clients.filter(client => client.status === 'Inactive');
      case 3: // Prospects
        return clients.filter(client => client.status === 'Prospect');
      default:
        return clients;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Client Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          New Client
        </Button>
      </Box>
      
      {/* Client Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="text.secondary">
                  Total Clients
                </Typography>
                <GroupIcon color="primary" />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                {clients.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="text.secondary">
                  Active Clients
                </Typography>
                <BusinessIcon color="success" />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                {clients.filter(c => c.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="text.secondary">
                  Prospects
                </Typography>
                <PersonIcon color="warning" />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                {clients.filter(c => c.status === 'Prospect').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="text.secondary">
                  Total Revenue
                </Typography>
                <BusinessIcon color="info" />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                ${clients.reduce((total, client) => total + client.totalRevenue, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Client Tabs and List */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="client tabs">
            <Tab label="All Clients" />
            <Tab label="Active" />
            <Tab label="Inactive" />
            <Tab label="Prospects" />
          </Tabs>
        </Box>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Missions</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients().map((client) => (
                  <TableRow key={client.id} hover onClick={() => handleOpenViewDialog(client)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getClientTypeIcon(client.type)}
                        </Avatar>
                        {client.name}
                      </Box>
                    </TableCell>
                    <TableCell>{client.type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={client.status} 
                        color={getStatusColor(client.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{client.contactPerson}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.totalMissions}</TableCell>
                    <TableCell>${client.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell>{getRatingStars(client.rating)}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDialog(client);
                        }}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteDialog(client);
                        }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      
      {/* Add Client Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Name"
                name="name"
                value={newClient.name}
                onChange={handleAddClientChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="client-type-label">Client Type</InputLabel>
                <Select
                  labelId="client-type-label"
                  name="type"
                  value={newClient.type}
                  label="Client Type"
                  onChange={handleAddTypeChange}
                >
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Individual">Individual</MenuItem>
                  <MenuItem value="Government">Government</MenuItem>
                  <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="client-status-label">Status</InputLabel>
                <Select
                  labelId="client-status-label"
                  name="status"
                  value={newClient.status}
                  label="Status"
                  onChange={handleAddStatusChange}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Prospect">Prospect</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newClient.email}
                onChange={handleAddClientChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={newClient.phone}
                onChange={handleAddClientChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={newClient.address}
                onChange={handleAddClientChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Person"
                name="contactPerson"
                value={newClient.contactPerson}
                onChange={handleAddClientChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date Added"
                name="dateAdded"
                value={newClient.dateAdded}
                onChange={handleAddClientChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={newClient.notes}
                onChange={handleAddClientChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained" color="primary">
            Add Client
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Client Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          {currentClient && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Client Name"
                  name="name"
                  value={currentClient.name}
                  onChange={handleEditClientChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="edit-client-type-label">Client Type</InputLabel>
                  <Select
                    labelId="edit-client-type-label"
                    name="type"
                    value={currentClient.type}
                    label="Client Type"
                    onChange={handleEditTypeChange}
                  >
                    <MenuItem value="Business">Business</MenuItem>
                    <MenuItem value="Individual">Individual</MenuItem>
                    <MenuItem value="Government">Government</MenuItem>
                    <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="edit-client-status-label">Status</InputLabel>
                  <Select
                    labelId="edit-client-status-label"
                    name="status"
                    value={currentClient.status}
                    label="Status"
                    onChange={handleEditStatusChange}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Prospect">Prospect</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={currentClient.email}
                  onChange={handleEditClientChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={currentClient.phone}
                  onChange={handleEditClientChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={currentClient.address}
                  onChange={handleEditClientChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  name="contactPerson"
                  value={currentClient.contactPerson}
                  onChange={handleEditClientChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Added"
                  name="dateAdded"
                  value={currentClient.dateAdded}
                  onChange={handleEditClientChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={currentClient.notes}
                  onChange={handleEditClientChange}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateClient} variant="contained" color="primary">
            Update Client
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the client "{currentClient?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteClient} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Client Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}>
              {currentClient && getClientTypeIcon(currentClient.type)}
            </Avatar>
            {currentClient?.name}
            {currentClient && (
              <Chip 
                label={currentClient.status} 
                color={getStatusColor(currentClient.status) as any}
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentClient && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {currentClient.contactPerson}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {currentClient.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {currentClient.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <LocationIcon sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                      <Typography variant="body1">
                        {currentClient.address}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Client Details
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Client Type
                      </Typography>
                      <Typography variant="body1">
                        {currentClient.type}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Date Added
                      </Typography>
                      <Typography variant="body1">
                        {new Date(currentClient.dateAdded).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Missions
                      </Typography>
                      <Typography variant="body1">
                        {currentClient.totalMissions}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                      <Typography variant="body1">
                        ${currentClient.totalRevenue.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Client Rating
                      </Typography>
                      {getRatingStars(currentClient.rating)}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {currentClient.notes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              if (currentClient) handleOpenEditDialog(currentClient);
            }} 
            variant="contained" 
            color="primary"
          >
            Edit Client
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientManagement; 