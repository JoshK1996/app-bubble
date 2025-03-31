import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  FlightTakeoff as FlightTakeoffIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Define mission form data interface
export interface MissionFormData {
  id?: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  client: string;
  pilot: string;
  equipment: string[];
  notes: string;
  tasks: string[];
  status?: string;
}

// Define checklist item interface
export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  required: boolean;
  category: 'equipment' | 'safety' | 'regulatory' | 'environment' | 'mission';
}

interface MissionReportProps {
  mission: MissionFormData;
  checklist?: ChecklistItem[];
  onClose?: () => void;
}

const MissionReport: React.FC<MissionReportProps> = ({ mission, checklist, onClose }) => {
  return (
    <Box>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {mission.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Mission Report
        </Typography>
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FlightTakeoffIcon sx={{ mr: 1 }} />
            Mission Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Date</Typography>
              <Typography variant="body1">{mission.date}</Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Location</Typography>
              <Typography variant="body1">{mission.location}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Client</Typography>
              <Typography variant="body1">{mission.client}</Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Pilot</Typography>
              <Typography variant="body1">{mission.pilot}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Equipment</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {mission.equipment.map((item, index) => (
                  <Chip key={index} label={item} size="small" />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {mission.tasks.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Mission Tasks</Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>#</TableCell>
                    <TableCell>Task Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mission.tasks.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{task}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {checklist && checklist.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Pre-Flight Checklist</Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Completed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checklist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.text}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.required ? "Required" : "Optional"} 
                          size="small"
                          color={item.required ? "primary" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.checked ? "Yes" : "No"} 
                          size="small"
                          color={item.checked ? "success" : "error"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {mission.notes && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            <Typography variant="body1">{mission.notes}</Typography>
          </CardContent>
        </Card>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button 
          variant="contained" 
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          Close Report
        </Button>
      </Box>
    </Box>
  );
};

export default MissionReport; 