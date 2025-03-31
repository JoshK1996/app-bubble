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
  Autocomplete,
  Box,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  FlightTakeoff as FlightIcon
} from '@mui/icons-material';
import { Equipment } from './EquipmentItem';

// Define the flight log interface
interface FlightLog {
  id: number;
  equipmentId: number;
  equipmentName: string;
  date: string;
  duration: number; // in minutes
  pilot: string;
  location: string;
  purpose: string;
  notes: string;
  missionId?: number;
  missionName?: string;
}

interface Mission {
  id: number;
  name: string;
}

interface FlightLogFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (flightLog: Omit<FlightLog, 'id'>) => void;
  equipment?: Equipment;
  flightLog?: FlightLog;
  pilots?: { id: string; name: string }[];
  missions?: Mission[];
  title?: string;
}

const FlightLogForm: React.FC<FlightLogFormProps> = ({
  open,
  onClose,
  onSave,
  equipment,
  flightLog,
  pilots = [],
  missions = [],
  title = flightLog ? 'Edit Flight Log' : 'Record Flight Log'
}) => {
  const theme = useTheme();
  
  // Form state
  const [date, setDate] = useState<Date | null>(
    flightLog?.date ? new Date(flightLog.date) : new Date()
  );
  const [duration, setDuration] = useState(
    flightLog?.duration?.toString() || '30'
  );
  const [pilot, setPilot] = useState(
    flightLog?.pilot || (pilots.length > 0 ? pilots[0].name : '')
  );
  const [location, setLocation] = useState(
    flightLog?.location || ''
  );
  const [purpose, setPurpose] = useState(
    flightLog?.purpose || ''
  );
  const [notes, setNotes] = useState(
    flightLog?.notes || ''
  );
  const [selectedMission, setSelectedMission] = useState<Mission | null>(
    flightLog?.missionId 
      ? missions.find(m => m.id === flightLog.missionId) || null 
      : null
  );
  
  // Form validation
  const [errors, setErrors] = useState<{
    date?: string;
    duration?: string;
    pilot?: string;
    location?: string;
    purpose?: string;
  }>({});
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {
      date?: string;
      duration?: string;
      pilot?: string;
      location?: string;
      purpose?: string;
    } = {};
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    if (!duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else {
      const durationValue = parseFloat(duration);
      if (isNaN(durationValue) || durationValue <= 0) {
        newErrors.duration = 'Duration must be a positive number';
      }
    }
    
    if (!pilot.trim()) {
      newErrors.pilot = 'Pilot is required';
    }
    
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle save
  const handleSave = () => {
    if (!validateForm() || !equipment) return;
    
    const flightLogData: Omit<FlightLog, 'id'> = {
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      date: date!.toISOString(),
      duration: parseFloat(duration),
      pilot,
      location,
      purpose,
      notes,
      missionId: selectedMission?.id,
      missionName: selectedMission?.name
    };
    
    onSave(flightLogData);
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title}
        {equipment && (
          <Typography variant="subtitle1" color="text.secondary">
            for {equipment.name} ({equipment.model})
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Flight Date"
                value={date}
                onChange={(newDate: Date | null) => setDate(newDate)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.date}
                    helperText={errors.date}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                InputProps={{
                  inputProps: { min: 1 }
                }}
                error={!!errors.duration}
                helperText={errors.duration}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.pilot}>
                <InputLabel id="pilot-label">Pilot</InputLabel>
                <Select
                  labelId="pilot-label"
                  value={pilot}
                  label="Pilot"
                  onChange={(e) => setPilot(e.target.value)}
                  required
                >
                  {pilots.length > 0 ? (
                    pilots.map((p) => (
                      <MenuItem key={p.id} value={p.name}>
                        {p.name}
                      </MenuItem>
                    ))
                  ) : (
                    [
                      <MenuItem key="pilot1" value="Jane Davis">Jane Davis</MenuItem>,
                      <MenuItem key="pilot2" value="Mike Thompson">Mike Thompson</MenuItem>,
                      <MenuItem key="pilot3" value="John Smith">John Smith</MenuItem>
                    ]
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={!!errors.location}
                helperText={errors.location}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                error={!!errors.purpose}
                helperText={errors.purpose}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                options={missions}
                getOptionLabel={(option) => option.name}
                value={selectedMission}
                onChange={(event, newValue) => {
                  setSelectedMission(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Associated Mission (optional)"
                    fullWidth
                  />
                )}
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
                placeholder="Additional information about this flight"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FlightIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Flight Summary</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {date ? date.toLocaleDateString() : 'Not set'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Duration:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {duration} minutes
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Pilot:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{pilot || 'Not assigned'}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Location:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{location || 'Not specified'}</Typography>
                  </Grid>
                  
                  {selectedMission && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Mission:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{selectedMission.name}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Grid>
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
          {flightLog ? 'Update' : 'Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlightLogForm; 