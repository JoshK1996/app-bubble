import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Divider,
  Alert,
  Tooltip,
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Types
export interface MaintenanceItem {
  id: number;
  equipmentId: number;
  equipmentName: string;
  maintenanceType: string; // Regular, Emergency, Inspection, Component Replacement, etc.
  description: string;
  dueDate: Date;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  assignedTo: string;
  estimatedHours: number;
  actualHours?: number;
  notes: string;
  partsRequired?: string[];
  completedDate?: Date;
  createdDate: Date;
}

interface MaintenanceSchedulerProps {
  open: boolean;
  onClose: () => void;
  equipmentId?: number;
  equipmentName?: string;
  maintenanceItems: MaintenanceItem[];
  onAddMaintenanceItem: (item: Omit<MaintenanceItem, 'id'>) => void;
  onUpdateMaintenanceItem: (item: MaintenanceItem) => void;
  onDeleteMaintenanceItem: (id: number) => void;
  onMarkComplete: (id: number, actualHours: number, notes: string) => void;
  equipment?: any; // For compatibility with EquipmentManagement
  onSave?: (data: any) => void; // For compatibility with EquipmentManagement
}

const MaintenanceScheduler: React.FC<MaintenanceSchedulerProps> = ({
  open,
  onClose,
  equipmentId,
  equipmentName,
  maintenanceItems,
  onAddMaintenanceItem,
  onUpdateMaintenanceItem,
  onDeleteMaintenanceItem,
  onMarkComplete,
  equipment,
  onSave,
}) => {
  const theme = useTheme();
  
  // Filter maintenance items for the selected equipment
  const filteredItems = equipmentId 
    ? maintenanceItems.filter(item => item.equipmentId === equipmentId) 
    : maintenanceItems;
  
  // Form state for new/editing maintenance item
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCompletionFormOpen, setIsCompletionFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null);
  const [completingItem, setCompletingItem] = useState<MaintenanceItem | null>(null);
  
  // New item state
  const [newItem, setNewItem] = useState<Omit<MaintenanceItem, 'id'>>({
    equipmentId: equipmentId || 0,
    equipmentName: equipmentName || '',
    maintenanceType: 'Regular',
    description: '',
    dueDate: new Date(),
    priority: 'Medium',
    status: 'Scheduled',
    assignedTo: '',
    estimatedHours: 1,
    notes: '',
    partsRequired: [],
    createdDate: new Date(),
  });
  
  // Completion form state
  const [actualHours, setActualHours] = useState(0);
  const [completionNotes, setCompletionNotes] = useState('');
  
  // Handle opening the new item form
  const handleOpenForm = () => {
    setIsFormOpen(true);
    setEditingItem(null);
    setNewItem({
      equipmentId: equipmentId || 0,
      equipmentName: equipmentName || '',
      maintenanceType: 'Regular',
      description: '',
      dueDate: new Date(),
      priority: 'Medium',
      status: 'Scheduled',
      assignedTo: '',
      estimatedHours: 1,
      notes: '',
      partsRequired: [],
      createdDate: new Date(),
    });
  };
  
  // Handle opening the edit form
  const handleEditItem = (item: MaintenanceItem) => {
    setIsFormOpen(true);
    setEditingItem(item);
    setNewItem({ ...item });
  };
  
  // Handle closing the form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };
  
  // Handle saving the form
  const handleSaveForm = () => {
    if (editingItem) {
      // Update existing item
      onUpdateMaintenanceItem({
        ...newItem,
        id: editingItem.id,
      } as MaintenanceItem);
    } else {
      // Add new item
      onAddMaintenanceItem(newItem);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };
  
  // Handle opening the completion form
  const handleOpenCompletionForm = (item: MaintenanceItem) => {
    setIsCompletionFormOpen(true);
    setCompletingItem(item);
    setActualHours(item.estimatedHours);
    setCompletionNotes(item.notes);
  };
  
  // Handle closing the completion form
  const handleCloseCompletionForm = () => {
    setIsCompletionFormOpen(false);
    setCompletingItem(null);
  };
  
  // Handle marking an item as complete
  const handleMarkComplete = () => {
    if (completingItem) {
      onMarkComplete(completingItem.id, actualHours, completionNotes);
    }
    setIsCompletionFormOpen(false);
    setCompletingItem(null);
  };
  
  // Get color for priority chip
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return theme.palette.error.main;
      case 'Medium':
        return theme.palette.warning.main;
      case 'Low':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  // Get color for status chip
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return theme.palette.success.main;
      case 'In Progress':
        return theme.palette.info.main;
      case 'Scheduled':
        return theme.palette.primary.main;
      case 'Overdue':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Check if maintenance is overdue
  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date();
  };
  
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {equipmentName ? `Maintenance Schedule: ${equipmentName}` : 'Maintenance Schedule'}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenForm}
            >
              Schedule Maintenance
            </Button>
            
            <Box>
              <Chip 
                icon={<WarningIcon />} 
                label={`${filteredItems.filter(item => item.status === 'Overdue').length} Overdue`} 
                color="error"
                sx={{ mr: 1 }}
              />
              <Chip 
                icon={<CalendarIcon />} 
                label={`${filteredItems.filter(item => item.status === 'Scheduled').length} Scheduled`} 
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip 
                icon={<CheckCircleIcon />} 
                label={`${filteredItems.filter(item => item.status === 'Completed').length} Completed`} 
                color="success"
              />
            </Box>
          </Box>
          
          {filteredItems.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No maintenance items scheduled. Click "Schedule Maintenance" to add a new item.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.equipmentName}</TableCell>
                      <TableCell>{item.maintenanceType}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {isOverdue(item.dueDate) && item.status !== 'Completed' && (
                            <WarningIcon 
                              fontSize="small" 
                              color="error" 
                              sx={{ mr: 0.5 }} 
                            />
                          )}
                          {new Date(item.dueDate).toLocaleDateString()}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.priority} 
                          size="small"
                          sx={{ backgroundColor: getPriorityColor(item.priority), color: '#fff' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status} 
                          size="small"
                          sx={{ backgroundColor: getStatusColor(item.status), color: '#fff' }}
                        />
                      </TableCell>
                      <TableCell>{item.assignedTo}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditItem(item)}
                            disabled={item.status === 'Completed'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {item.status !== 'Completed' && (
                          <Tooltip title="Mark as Complete">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleOpenCompletionForm(item)}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => onDeleteMaintenanceItem(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Form Dialog for Adding/Editing Maintenance Items */}
      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? 'Edit Maintenance Item' : 'Schedule New Maintenance'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Equipment"
                fullWidth
                value={newItem.equipmentName}
                disabled={!!equipmentId}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Maintenance Type</InputLabel>
                <Select
                  value={newItem.maintenanceType}
                  onChange={(e) => setNewItem({ ...newItem, maintenanceType: e.target.value })}
                  label="Maintenance Type"
                >
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Inspection">Inspection</MenuItem>
                  <MenuItem value="Component Replacement">Component Replacement</MenuItem>
                  <MenuItem value="Software Update">Software Update</MenuItem>
                  <MenuItem value="Calibration">Calibration</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={newItem.dueDate}
                  onChange={(newDate: Date | null) => {
                    if (newDate) {
                      setNewItem({ ...newItem, dueDate: newDate });
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                  label="Priority"
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Assigned To"
                fullWidth
                value={newItem.assignedTo}
                onChange={(e) => setNewItem({ ...newItem, assignedTo: e.target.value })}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Estimated Hours"
                type="number"
                fullWidth
                value={newItem.estimatedHours}
                onChange={(e) => setNewItem({ ...newItem, estimatedHours: Number(e.target.value) })}
                InputProps={{
                  inputProps: { min: 0, step: 0.5 }
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Parts Required (comma separated)"
                fullWidth
                value={newItem.partsRequired?.join(', ') || ''}
                onChange={(e) => setNewItem({ 
                  ...newItem, 
                  partsRequired: e.target.value.split(',').map(part => part.trim()).filter(Boolean)
                })}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveForm}
            startIcon={<SaveIcon />}
          >
            {editingItem ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Completion Form Dialog */}
      <Dialog
        open={isCompletionFormOpen}
        onClose={handleCloseCompletionForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Maintenance as Complete</DialogTitle>
        
        <DialogContent dividers>
          {completingItem && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {completingItem.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Actual Hours Spent"
                    type="number"
                    fullWidth
                    value={actualHours}
                    onChange={(e) => setActualHours(Number(e.target.value))}
                    InputProps={{
                      inputProps: { min: 0, step: 0.5 },
                      endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                    }}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Completion Notes"
                    fullWidth
                    multiline
                    rows={4}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Describe the work performed, parts replaced, and any issues encountered..."
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseCompletionForm}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleMarkComplete}
            startIcon={<CheckCircleIcon />}
          >
            Mark as Complete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MaintenanceScheduler; 