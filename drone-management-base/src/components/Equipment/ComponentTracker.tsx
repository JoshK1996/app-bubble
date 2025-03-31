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
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Types
export interface DroneComponent {
  id: number;
  equipmentId: number;
  equipmentName: string;
  componentType: string; // Propellers, Batteries, Cameras, Motors, etc.
  serialNumber: string;
  manufacturer: string;
  model: string;
  installationDate: Date;
  lastMaintenanceDate?: Date;
  hoursUsed: number;
  cyclesCompleted: number;
  maxLifeHours: number;
  maxLifeCycles: number;
  status: 'Operational' | 'Needs Maintenance' | 'Need Replacement' | 'Replaced' | 'Defective';
  notes: string;
  replacementHistory: ComponentReplacement[];
  maintenanceHistory: ComponentMaintenance[];
}

export interface ComponentReplacement {
  id: number;
  componentId: number;
  replacementDate: Date;
  replacedBy: string;
  reason: string;
  newSerialNumber: string;
  cost: number;
}

export interface ComponentMaintenance {
  id: number;
  componentId: number;
  maintenanceDate: Date;
  performedBy: string;
  description: string;
  hoursAdded: number;
  cyclesAdded: number;
  cost: number;
}

interface ComponentTrackerProps {
  open: boolean;
  onClose: () => void;
  equipmentId?: number;
  equipmentName?: string;
  components: DroneComponent[];
  onAddComponent: (component: Omit<DroneComponent, 'id'>) => void;
  onUpdateComponent: (component: DroneComponent) => void;
  onDeleteComponent: (id: number) => void;
  onAddMaintenance: (maintenance: Omit<ComponentMaintenance, 'id'>) => void;
  onAddReplacement: (replacement: Omit<ComponentReplacement, 'id'>) => void;
}

const ComponentTracker: React.FC<ComponentTrackerProps> = ({
  open,
  onClose,
  equipmentId,
  equipmentName,
  components,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
  onAddMaintenance,
  onAddReplacement
}) => {
  const theme = useTheme();
  
  // Filter components for the selected equipment
  const filteredComponents = equipmentId 
    ? components.filter(component => component.equipmentId === equipmentId) 
    : components;
  
  // States for form dialogs
  const [isComponentFormOpen, setIsComponentFormOpen] = useState(false);
  const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
  const [isReplacementFormOpen, setIsReplacementFormOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  // States for currently edited/viewed items
  const [editingComponent, setEditingComponent] = useState<DroneComponent | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<DroneComponent | null>(null);
  
  // New component form state
  const [newComponent, setNewComponent] = useState<Omit<DroneComponent, 'id'>>({
    equipmentId: equipmentId || 0,
    equipmentName: equipmentName || '',
    componentType: 'Propeller',
    serialNumber: '',
    manufacturer: '',
    model: '',
    installationDate: new Date(),
    hoursUsed: 0,
    cyclesCompleted: 0,
    maxLifeHours: 0,
    maxLifeCycles: 0,
    status: 'Operational',
    notes: '',
    replacementHistory: [],
    maintenanceHistory: []
  });
  
  // New maintenance form state
  const [newMaintenance, setNewMaintenance] = useState<Omit<ComponentMaintenance, 'id'>>({
    componentId: 0,
    maintenanceDate: new Date(),
    performedBy: '',
    description: '',
    hoursAdded: 0,
    cyclesAdded: 0,
    cost: 0
  });
  
  // New replacement form state
  const [newReplacement, setNewReplacement] = useState<Omit<ComponentReplacement, 'id'>>({
    componentId: 0,
    replacementDate: new Date(),
    replacedBy: '',
    reason: '',
    newSerialNumber: '',
    cost: 0
  });
  
  // Handle opening component form
  const handleOpenComponentForm = () => {
    setIsComponentFormOpen(true);
    setEditingComponent(null);
    setNewComponent({
      equipmentId: equipmentId || 0,
      equipmentName: equipmentName || '',
      componentType: 'Propeller',
      serialNumber: '',
      manufacturer: '',
      model: '',
      installationDate: new Date(),
      hoursUsed: 0,
      cyclesCompleted: 0,
      maxLifeHours: 0,
      maxLifeCycles: 0,
      status: 'Operational',
      notes: '',
      replacementHistory: [],
      maintenanceHistory: []
    });
  };
  
  // Handle editing component
  const handleEditComponent = (component: DroneComponent) => {
    setIsComponentFormOpen(true);
    setEditingComponent(component);
    setNewComponent({ ...component });
  };
  
  // Handle closing component form
  const handleCloseComponentForm = () => {
    setIsComponentFormOpen(false);
    setEditingComponent(null);
  };
  
  // Handle saving component form
  const handleSaveComponentForm = () => {
    if (editingComponent) {
      // Update existing component
      onUpdateComponent({
        ...newComponent,
        id: editingComponent.id,
      } as DroneComponent);
    } else {
      // Add new component
      onAddComponent(newComponent);
    }
    setIsComponentFormOpen(false);
    setEditingComponent(null);
  };
  
  // Handle opening maintenance form
  const handleOpenMaintenanceForm = (component: DroneComponent) => {
    setIsMaintenanceFormOpen(true);
    setSelectedComponent(component);
    setNewMaintenance({
      componentId: component.id,
      maintenanceDate: new Date(),
      performedBy: '',
      description: '',
      hoursAdded: 0,
      cyclesAdded: 0,
      cost: 0
    });
  };
  
  // Handle closing maintenance form
  const handleCloseMaintenanceForm = () => {
    setIsMaintenanceFormOpen(false);
    setSelectedComponent(null);
  };
  
  // Handle saving maintenance form
  const handleSaveMaintenanceForm = () => {
    if (selectedComponent) {
      onAddMaintenance(newMaintenance);
    }
    setIsMaintenanceFormOpen(false);
    setSelectedComponent(null);
  };
  
  // Handle opening replacement form
  const handleOpenReplacementForm = (component: DroneComponent) => {
    setIsReplacementFormOpen(true);
    setSelectedComponent(component);
    setNewReplacement({
      componentId: component.id,
      replacementDate: new Date(),
      replacedBy: '',
      reason: '',
      newSerialNumber: '',
      cost: 0
    });
  };
  
  // Handle closing replacement form
  const handleCloseReplacementForm = () => {
    setIsReplacementFormOpen(false);
    setSelectedComponent(null);
  };
  
  // Handle saving replacement form
  const handleSaveReplacementForm = () => {
    if (selectedComponent) {
      onAddReplacement(newReplacement);
    }
    setIsReplacementFormOpen(false);
    setSelectedComponent(null);
  };
  
  // Handle opening history dialog
  const handleOpenHistoryDialog = (component: DroneComponent) => {
    setIsHistoryDialogOpen(true);
    setSelectedComponent(component);
  };
  
  // Handle closing history dialog
  const handleCloseHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
    setSelectedComponent(null);
  };
  
  // Calculate component health percentage based on hours/cycles usage
  const calculateComponentHealth = (component: DroneComponent) => {
    const hourHealth = component.maxLifeHours > 0 
      ? 100 - (component.hoursUsed / component.maxLifeHours * 100)
      : 100;
      
    const cycleHealth = component.maxLifeCycles > 0 
      ? 100 - (component.cyclesCompleted / component.maxLifeCycles * 100)
      : 100;
      
    // Return the lower of the two values
    return Math.min(hourHealth, cycleHealth);
  };
  
  // Get color for health indicator
  const getHealthColor = (health: number) => {
    if (health > 70) return theme.palette.success.main;
    if (health > 30) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Get color for status chip
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return theme.palette.success.main;
      case 'Needs Maintenance':
        return theme.palette.warning.main;
      case 'Need Replacement':
        return theme.palette.error.main;
      case 'Replaced':
        return theme.palette.info.main;
      case 'Defective':
        return theme.palette.error.dark;
      default:
        return theme.palette.grey[500];
    }
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
              {equipmentName ? `Component Tracker: ${equipmentName}` : 'Component Tracker'}
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
              onClick={handleOpenComponentForm}
            >
              Add Component
            </Button>
            
            <Box>
              <Chip 
                icon={<WarningIcon />} 
                label={`${filteredComponents.filter(c => c.status === 'Needs Maintenance' || c.status === 'Need Replacement').length} Need Attention`} 
                color="warning"
                sx={{ mr: 1 }}
              />
              <Chip 
                icon={<BuildIcon />} 
                label={`${filteredComponents.filter(c => c.status === 'Operational').length} Operational`} 
                color="success"
              />
            </Box>
          </Box>
          
          {filteredComponents.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No components recorded. Click "Add Component" to add a new component.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Model/Serial</TableCell>
                    <TableCell>Installation</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Health</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredComponents.map((component) => {
                    const health = calculateComponentHealth(component);
                    return (
                      <TableRow key={component.id} hover>
                        <TableCell>{component.componentType}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {component.manufacturer} {component.model}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            SN: {component.serialNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(component.installationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {component.hoursUsed} hrs / {component.cyclesCompleted} cycles
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Max: {component.maxLifeHours} hrs / {component.maxLifeCycles} cycles
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <Box sx={{ width: '100%', mb: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={health} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 5,
                                  backgroundColor: theme.palette.grey[300],
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getHealthColor(health)
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="caption">
                              {Math.round(health)}% Remaining
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={component.status} 
                            size="small"
                            sx={{ backgroundColor: getStatusColor(component.status), color: '#fff' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Maintenance">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenMaintenanceForm(component)}
                            >
                              <BuildIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Replace">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleOpenReplacementForm(component)}
                            >
                              <RefreshIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="History">
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => handleOpenHistoryDialog(component)}
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small"
                              onClick={() => handleEditComponent(component)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => onDeleteComponent(component.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Component Form Dialog */}
      <Dialog
        open={isComponentFormOpen}
        onClose={handleCloseComponentForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingComponent ? 'Edit Component' : 'Add New Component'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Equipment"
                fullWidth
                value={newComponent.equipmentName}
                disabled={!!equipmentId}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Component Type</InputLabel>
                <Select
                  value={newComponent.componentType}
                  onChange={(e) => setNewComponent({ ...newComponent, componentType: e.target.value })}
                  label="Component Type"
                >
                  <MenuItem value="Propeller">Propeller</MenuItem>
                  <MenuItem value="Motor">Motor</MenuItem>
                  <MenuItem value="Battery">Battery</MenuItem>
                  <MenuItem value="Camera">Camera</MenuItem>
                  <MenuItem value="Frame">Frame</MenuItem>
                  <MenuItem value="ESC">ESC (Electronic Speed Controller)</MenuItem>
                  <MenuItem value="Flight Controller">Flight Controller</MenuItem>
                  <MenuItem value="GPS Module">GPS Module</MenuItem>
                  <MenuItem value="Antenna">Antenna</MenuItem>
                  <MenuItem value="Landing Gear">Landing Gear</MenuItem>
                  <MenuItem value="Gimbal">Gimbal</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Serial Number"
                fullWidth
                value={newComponent.serialNumber}
                onChange={(e) => setNewComponent({ ...newComponent, serialNumber: e.target.value })}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Manufacturer"
                fullWidth
                value={newComponent.manufacturer}
                onChange={(e) => setNewComponent({ ...newComponent, manufacturer: e.target.value })}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Model"
                fullWidth
                value={newComponent.model}
                onChange={(e) => setNewComponent({ ...newComponent, model: e.target.value })}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Installation Date"
                  value={newComponent.installationDate}
                  onChange={(newDate: Date | null) => {
                    if (newDate) {
                      setNewComponent({ ...newComponent, installationDate: newDate });
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
              <TextField
                label="Hours Used"
                type="number"
                fullWidth
                value={newComponent.hoursUsed}
                onChange={(e) => setNewComponent({ ...newComponent, hoursUsed: Number(e.target.value) })}
                InputProps={{
                  inputProps: { min: 0, step: 0.1 },
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cycles Completed"
                type="number"
                fullWidth
                value={newComponent.cyclesCompleted}
                onChange={(e) => setNewComponent({ ...newComponent, cyclesCompleted: Number(e.target.value) })}
                InputProps={{
                  inputProps: { min: 0, step: 1 },
                  endAdornment: <InputAdornment position="end">cycles</InputAdornment>,
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Maximum Life Hours"
                type="number"
                fullWidth
                value={newComponent.maxLifeHours}
                onChange={(e) => setNewComponent({ ...newComponent, maxLifeHours: Number(e.target.value) })}
                InputProps={{
                  inputProps: { min: 0, step: 1 },
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Maximum Life Cycles"
                type="number"
                fullWidth
                value={newComponent.maxLifeCycles}
                onChange={(e) => setNewComponent({ ...newComponent, maxLifeCycles: Number(e.target.value) })}
                InputProps={{
                  inputProps: { min: 0, step: 1 },
                  endAdornment: <InputAdornment position="end">cycles</InputAdornment>,
                }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={newComponent.status}
                  onChange={(e) => setNewComponent({ 
                    ...newComponent, 
                    status: e.target.value as 'Operational' | 'Needs Maintenance' | 'Need Replacement' | 'Replaced' | 'Defective' 
                  })}
                  label="Status"
                >
                  <MenuItem value="Operational">Operational</MenuItem>
                  <MenuItem value="Needs Maintenance">Needs Maintenance</MenuItem>
                  <MenuItem value="Need Replacement">Need Replacement</MenuItem>
                  <MenuItem value="Replaced">Replaced</MenuItem>
                  <MenuItem value="Defective">Defective</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={newComponent.notes}
                onChange={(e) => setNewComponent({ ...newComponent, notes: e.target.value })}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseComponentForm}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveComponentForm}
            startIcon={<SaveIcon />}
          >
            {editingComponent ? 'Update' : 'Save Component'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Maintenance Form Dialog */}
      <Dialog
        open={isMaintenanceFormOpen}
        onClose={handleCloseMaintenanceForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Record Maintenance
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedComponent && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedComponent.componentType}: {selectedComponent.manufacturer} {selectedComponent.model} (SN: {selectedComponent.serialNumber})
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Maintenance Date"
                      value={newMaintenance.maintenanceDate}
                      onChange={(newDate: Date | null) => {
                        if (newDate) {
                          setNewMaintenance({ ...newMaintenance, maintenanceDate: newDate });
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
                
                <Grid item xs={12}>
                  <TextField
                    label="Performed By"
                    fullWidth
                    value={newMaintenance.performedBy}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, performedBy: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    placeholder="Describe the maintenance performed..."
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Hours Added to Lifespan"
                    type="number"
                    fullWidth
                    value={newMaintenance.hoursAdded}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, hoursAdded: Number(e.target.value) })}
                    InputProps={{
                      inputProps: { min: 0, step: 0.5 },
                      endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                    }}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Cycles Added to Lifespan"
                    type="number"
                    fullWidth
                    value={newMaintenance.cyclesAdded}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, cyclesAdded: Number(e.target.value) })}
                    InputProps={{
                      inputProps: { min: 0, step: 1 },
                      endAdornment: <InputAdornment position="end">cycles</InputAdornment>,
                    }}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Maintenance Cost"
                    type="number"
                    fullWidth
                    value={newMaintenance.cost}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: Number(e.target.value) })}
                    InputProps={{
                      inputProps: { min: 0, step: 0.01 },
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseMaintenanceForm}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveMaintenanceForm}
            startIcon={<SaveIcon />}
          >
            Record Maintenance
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Replacement Form Dialog */}
      <Dialog
        open={isReplacementFormOpen}
        onClose={handleCloseReplacementForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Record Component Replacement
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedComponent && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Replacing: {selectedComponent.componentType} - {selectedComponent.manufacturer} {selectedComponent.model} 
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Serial Number: {selectedComponent.serialNumber}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Replacement Date"
                      value={newReplacement.replacementDate}
                      onChange={(newDate: Date | null) => {
                        if (newDate) {
                          setNewReplacement({ ...newReplacement, replacementDate: newDate });
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
                
                <Grid item xs={12}>
                  <TextField
                    label="Replaced By"
                    fullWidth
                    value={newReplacement.replacedBy}
                    onChange={(e) => setNewReplacement({ ...newReplacement, replacedBy: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="New Serial Number"
                    fullWidth
                    value={newReplacement.newSerialNumber}
                    onChange={(e) => setNewReplacement({ ...newReplacement, newSerialNumber: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Reason for Replacement"
                    fullWidth
                    multiline
                    rows={3}
                    value={newReplacement.reason}
                    onChange={(e) => setNewReplacement({ ...newReplacement, reason: e.target.value })}
                    placeholder="Describe why the component needed to be replaced..."
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Replacement Cost"
                    type="number"
                    fullWidth
                    value={newReplacement.cost}
                    onChange={(e) => setNewReplacement({ ...newReplacement, cost: Number(e.target.value) })}
                    InputProps={{
                      inputProps: { min: 0, step: 0.01 },
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseReplacementForm}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveReplacementForm}
            startIcon={<SaveIcon />}
          >
            Record Replacement
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* History Dialog */}
      <Dialog
        open={isHistoryDialogOpen}
        onClose={handleCloseHistoryDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Component History
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedComponent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedComponent.componentType}: {selectedComponent.manufacturer} {selectedComponent.model}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Serial Number: {selectedComponent.serialNumber}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Installed on: {new Date(selectedComponent.installationDate).toLocaleDateString()}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Maintenance History
              </Typography>
              
              {selectedComponent.maintenanceHistory.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>No maintenance records available</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Performed By</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Hours Added</TableCell>
                        <TableCell>Cycles Added</TableCell>
                        <TableCell>Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedComponent.maintenanceHistory.map((record, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{new Date(record.maintenanceDate).toLocaleDateString()}</TableCell>
                          <TableCell>{record.performedBy}</TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>{record.hoursAdded} hrs</TableCell>
                          <TableCell>{record.cyclesAdded}</TableCell>
                          <TableCell>${record.cost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              <Typography variant="h6" gutterBottom>
                Replacement History
              </Typography>
              
              {selectedComponent.replacementHistory.length === 0 ? (
                <Alert severity="info">No replacement records available</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Replaced By</TableCell>
                        <TableCell>New Serial Number</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedComponent.replacementHistory.map((record, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{new Date(record.replacementDate).toLocaleDateString()}</TableCell>
                          <TableCell>{record.replacedBy}</TableCell>
                          <TableCell>{record.newSerialNumber}</TableCell>
                          <TableCell>{record.reason}</TableCell>
                          <TableCell>${record.cost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComponentTracker; 