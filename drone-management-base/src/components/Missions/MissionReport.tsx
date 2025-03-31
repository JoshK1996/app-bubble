import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControlLabel,
  Checkbox,
  useTheme,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  FlightTakeoff as FlightIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Notes as NotesIcon,
  Task as TaskIcon,
  AirplanemodeActive as DroneIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MissionFormData, ChecklistItem, MissionFlightLog, MissionTask } from '../../types/missionTypes';
import { Equipment } from '../../types/equipmentTypes';

interface MissionReportProps {
  mission: MissionFormData;
  checklist?: ChecklistItem[];
  flightLog?: MissionFlightLog;
  onClose?: () => void;
}

/**
 * Mission Report component for generating comprehensive mission reports
 * without any live monitoring functionality
 */
const MissionReport: React.FC<MissionReportProps> = ({
  mission,
  checklist,
  flightLog,
  onClose
}) => {
  const theme = useTheme();
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Track selected sections for the report
  const [selectedSections, setSelectedSections] = React.useState({
    basicInfo: true,
    weatherData: true,
    flightPath: true,
    checklist: true,
    tasks: true,
    notes: true
  });
  
  // Handle section selection change
  const handleSectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSections({
      ...selectedSections,
      [event.target.name]: event.target.checked
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Generate PDF report
  const generatePDF = () => {
    if (!reportRef.current) return;
    
    const pdf = new jsPDF();
    const title = `Mission Report: ${mission.title}`;
    
    // Add title
    pdf.setFontSize(18);
    pdf.text(title, 15, 15);
    
    // Add date
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 22);
    
    let yPos = 30;
    
    // Basic Information
    if (selectedSections.basicInfo) {
      pdf.setFontSize(14);
      pdf.text('Mission Information', 15, yPos);
      yPos += 7;
      
      pdf.setFontSize(10);
      pdf.text(`Date: ${formatDate(mission.date)}`, 15, yPos);
      yPos += 5;
      pdf.text(`Time: ${mission.startTime} - ${mission.endTime}`, 15, yPos);
      yPos += 5;
      pdf.text(`Location: ${mission.location?.name ?? 'N/A'}`, 15, yPos);
      yPos += 5;
      pdf.text(`Client: ${mission.client?.name ?? 'N/A'}`, 15, yPos);
      yPos += 5;
      pdf.text(`Pilot: ${mission.pilot?.name ?? 'N/A'}`, 15, yPos);
      yPos += 5;
      pdf.text(`Equipment: ${mission.equipment?.map(eq => eq.name).join(', ') ?? 'N/A'}`, 15, yPos);
      yPos += 10;
    }
    
    // Weather Data
    if (selectedSections.weatherData && mission.weatherData) {
      pdf.setFontSize(14);
      pdf.text('Weather Conditions', 15, yPos);
      yPos += 7;
      
      const weather = mission.weatherData.current;
      pdf.setFontSize(10);
      pdf.text(`Temperature: ${weather.temperature}°C`, 15, yPos);
      yPos += 5;
      pdf.text(`Conditions: ${weather.conditions}`, 15, yPos);
      yPos += 5;
      pdf.text(`Wind Speed: ${weather.windSpeed} m/s`, 15, yPos);
      yPos += 5;
      pdf.text(`Visibility: ${weather.visibility} m`, 15, yPos);
      yPos += 10;
    }
    
    // Tasks
    if (selectedSections.tasks && mission.tasks.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Mission Tasks', 15, yPos);
      yPos += 10;
      
      const taskData = mission.tasks.map((task, index) => [
        (index + 1).toString(),
        task.text
      ]);
      
      (pdf as any).autoTable({
        startY: yPos,
        head: [['#', 'Task Description']],
        body: taskData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      yPos = (pdf as any).lastAutoTable.finalY + 10;
    }
    
    // Checklist
    if (selectedSections.checklist && checklist && checklist.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Pre-Flight Checklist', 15, yPos);
      yPos += 10;
      
      // Group items by category
      const categories = ['equipment', 'safety', 'regulatory', 'environment', 'mission'];
      const categoryNames: {[key: string]: string} = {
        equipment: 'Equipment',
        safety: 'Safety',
        regulatory: 'Regulatory',
        environment: 'Environment',
        mission: 'Mission Specific',
      };
      
      const checklistData: any[] = [];
      
      categories.forEach(category => {
        // Add category header
        checklistData.push([
          { content: categoryNames[category], colSpan: 3, styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } }
        ]);
        
        // Add items
        const categoryItems = checklist.filter(item => item.category === category);
        categoryItems.forEach(item => {
          checklistData.push([
            item.text,
            item.required ? 'Required' : 'Optional', 
            item.checked ? 'Yes' : 'No'
          ]);
        });
      });
      
      (pdf as any).autoTable({
        startY: yPos,
        head: [['Item', 'Status', 'Completed']],
        body: checklistData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      yPos = (pdf as any).lastAutoTable.finalY + 10;
    }
    
    // Notes
    if (selectedSections.notes && mission.notes) {
      pdf.setFontSize(14);
      pdf.text('Notes', 15, yPos);
      yPos += 7;
      
      pdf.setFontSize(10);
      const splitNotes = pdf.splitTextToSize(mission.notes, 180);
      pdf.text(splitNotes, 15, yPos);
    }
    
    // Save PDF
    pdf.save(`mission-report-${mission.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };
  
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Mission Report
        </Typography>
        
        <Box>
          <Button 
            variant="contained" 
            startIcon={<PdfIcon />}
            onClick={generatePDF}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Include in Report
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedSections.basicInfo} 
                onChange={handleSectionChange} 
                name="basicInfo" 
              />
            }
            label="Basic Information"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedSections.weatherData} 
                onChange={handleSectionChange} 
                name="weatherData" 
              />
            }
            label="Weather Data"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedSections.flightPath} 
                onChange={handleSectionChange} 
                name="flightPath" 
              />
            }
            label="Flight Path"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedSections.checklist} 
                onChange={handleSectionChange} 
                name="checklist" 
              />
            }
            label="Checklist"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedSections.tasks} 
                onChange={handleSectionChange} 
                name="tasks" 
              />
            }
            label="Tasks"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={selectedSections.notes} 
                onChange={handleSectionChange} 
                name="notes" 
              />
            }
            label="Notes"
          />
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Report Preview */}
      <Box ref={reportRef} sx={{ 
        p: 3, 
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {mission.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Mission Report
          </Typography>
        </Box>
        
        {selectedSections.basicInfo && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FlightIcon sx={{ mr: 1 }} />
                Mission Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date</Typography>
                      <Typography variant="body1">{formatDate(mission.date)}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body1">{mission.location?.name ?? 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <BusinessIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Client</Typography>
                      <Typography variant="body1">{mission.client?.name ?? 'N/A'}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Pilot</Typography>
                      <Typography variant="body1">{mission.pilot?.name ?? 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <FlightIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Equipment</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {mission.equipment?.map((eq: Equipment) => (
                          <Chip key={eq.id} label={eq.name} icon={<DroneIcon />} />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
        
        {selectedSections.weatherData && mission.weatherData && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Weather Conditions</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5">{mission.weatherData.current.temperature}°C</Typography>
                    <Typography variant="body2">Temperature</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5">{mission.weatherData.current.windSpeed}</Typography>
                    <Typography variant="body2">Wind Speed (m/s)</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5">{mission.weatherData.current.humidity}%</Typography>
                    <Typography variant="body2">Humidity</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5">{mission.weatherData.current.visibility}</Typography>
                    <Typography variant="body2">Visibility (m)</Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Conditions</Typography>
                <Typography variant="body1">{mission.weatherData.current.conditions}</Typography>
              </Box>
            </CardContent>
          </Card>
        )}
        
        {selectedSections.tasks && mission.tasks.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TaskIcon sx={{ mr: 1 }} />
                Mission Tasks
              </Typography>
              
              <List dense>
                {mission.tasks?.map((task: MissionTask) => (
                  <ListItem key={task.id} secondaryAction={
                    <Checkbox edge="end" checked={task.completed} disabled />
                  }>
                    <ListItemText primary={task.text} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
        
        {selectedSections.checklist && checklist && checklist.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pre-Flight Checklist</Typography>
              
              {/* Group checklist by category */}
              {['equipment', 'safety', 'regulatory', 'environment', 'mission'].map(category => {
                const items = checklist.filter(item => item.category === category);
                if (items.length === 0) return null;
                
                const categoryNames: {[key: string]: string} = {
                  equipment: 'Equipment',
                  safety: 'Safety',
                  regulatory: 'Regulatory',
                  environment: 'Environment',
                  mission: 'Mission Specific',
                };
                
                return (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ bgcolor: 'action.hover', p: 1 }}>
                      {categoryNames[category]}
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell width={100}>Status</TableCell>
                            <TableCell width={100}>Completed</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {items.map((item) => (
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
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        )}
        
        {selectedSections.notes && mission.notes && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <NotesIcon sx={{ mr: 1 }} />
                Notes
              </Typography>
              
              <Typography variant="body1">
                {mission.notes}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default MissionReport; 