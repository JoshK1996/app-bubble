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
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon 
} from '@mui/icons-material';
import { Equipment, EquipmentStatus, EquipmentType } from './EquipmentItem';

interface EquipmentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (equipment: Omit<Equipment, 'id'>) => void;
  equipment?: Equipment;
  title?: string;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  open,
  onClose,
  onSave,
  equipment,
  title = equipment ? 'Edit Equipment' : 'Add New Equipment'
}) => {
  const theme = useTheme();
  
  // Form state
  const [name, setName] = useState(equipment?.name || '');
  const [type, setType] = useState<EquipmentType>(equipment?.type || 'Drone');
  const [model, setModel] = useState(equipment?.model || '');
  const [serialNumber, setSerialNumber] = useState(equipment?.serialNumber || '');
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(
    equipment?.purchaseDate ? new Date(equipment.purchaseDate) : new Date()
  );
  const [status, setStatus] = useState<EquipmentStatus>(equipment?.status || 'Ready');
  const [lastMaintenance, setLastMaintenance] = useState<Date | null>(
    equipment?.lastMaintenance ? new Date(equipment.lastMaintenance) : new Date()
  );
  const [nextMaintenance, setNextMaintenance] = useState<Date | null>(
    equipment?.nextMaintenance ? new Date(equipment.nextMaintenance) : new Date()
  );
  const [flightHours, setFlightHours] = useState(equipment?.flightHours?.toString() || '0');
  const [notes, setNotes] = useState(equipment?.notes || '');
  const [image, setImage] = useState(equipment?.image || '');
  
  // Form validation
  const [errors, setErrors] = useState<{
    name?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: string;
    lastMaintenance?: string;
    nextMaintenance?: string;
    flightHours?: string;
  }>({});
  
  // Equipment type options
  const equipmentTypes: EquipmentType[] = [
    'Drone',
    'Camera',
    'Battery',
    'Propeller',
    'Controller',
    'Sensor'
  ];
  
  // Equipment status options
  const equipmentStatuses: EquipmentStatus[] = [
    'Ready',
    'In Maintenance',
    'Grounded',
    'In Use',
    'Needs Attention'
  ];
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      model?: string;
      serialNumber?: string;
      purchaseDate?: string;
      lastMaintenance?: string;
      nextMaintenance?: string;
      flightHours?: string;
    } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!model.trim()) {
      newErrors.model = 'Model is required';
    }
    
    if (!serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }
    
    if (!purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }
    
    if (!lastMaintenance) {
      newErrors.lastMaintenance = 'Last maintenance date is required';
    }
    
    if (!nextMaintenance) {
      newErrors.nextMaintenance = 'Next maintenance date is required';
    }
    
    // Validate flight hours
    const hoursValue = parseFloat(flightHours);
    if (isNaN(hoursValue) || hoursValue < 0) {
      newErrors.flightHours = 'Flight hours must be a valid number';
    }
    
    // Validate maintenance dates
    if (lastMaintenance && nextMaintenance && lastMaintenance > nextMaintenance) {
      newErrors.nextMaintenance = 'Next maintenance must be after last maintenance';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;
    
    const equipmentData: Omit<Equipment, 'id'> = {
      name,
      type,
      model,
      serialNumber,
      purchaseDate: purchaseDate!.toISOString(),
      status,
      lastMaintenance: lastMaintenance!.toISOString(),
      nextMaintenance: nextMaintenance!.toISOString(),
      flightHours: parseFloat(flightHours),
      notes,
      image
    };
    
    onSave(equipmentData);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="equipment-type-label">Type</InputLabel>
                <Select
                  labelId="equipment-type-label"
                  value={type}
                  label="Type"
                  onChange={(e) => setType(e.target.value as EquipmentType)}
                >
                  {equipmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                error={!!errors.model}
                helperText={errors.model}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                error={!!errors.serialNumber}
                helperText={errors.serialNumber}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Purchase Date"
                value={purchaseDate}
                onChange={(newDate: Date | null) => setPurchaseDate(newDate)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.purchaseDate}
                    helperText={errors.purchaseDate}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="equipment-status-label">Status</InputLabel>
                <Select
                  labelId="equipment-status-label"
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                >
                  {equipmentStatuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Last Maintenance"
                value={lastMaintenance}
                onChange={(newDate: Date | null) => setLastMaintenance(newDate)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.lastMaintenance}
                    helperText={errors.lastMaintenance}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Next Maintenance"
                value={nextMaintenance}
                onChange={(newDate: Date | null) => setNextMaintenance(newDate)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.nextMaintenance}
                    helperText={errors.nextMaintenance}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Flight Hours"
                type="number"
                value={flightHours}
                onChange={(e) => setFlightHours(e.target.value)}
                inputProps={{ min: 0, step: 0.1 }}
                error={!!errors.flightHours}
                helperText={errors.flightHours}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Image URL (optional)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional information about this equipment"
              />
            </Grid>
            
            {image && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Image Preview
                </Typography>
                <Box
                  component="img"
                  src={image}
                  alt={name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                  }}
                />
              </Grid>
            )}
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          color="primary"
        >
          {equipment ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EquipmentForm; 