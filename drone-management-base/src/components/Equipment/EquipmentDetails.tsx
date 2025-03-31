import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Paper,
  Card,
  CardContent,
  Avatar,
  useTheme
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Build as MaintenanceIcon,
  Flight as FlightIcon,
  Straighten as DistanceIcon,
  Timer as TimerIcon,
  BatteryChargingFull as BatteryIcon,
  Task as TaskIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { Equipment, EquipmentStatus, EquipmentType } from './EquipmentItem';

// Define the necessary interfaces
interface EquipmentUsageMetrics {
  totalFlightHours: number;
  missionsCompleted: number;
  batteryCharges: number;
  distanceFlown: number; // in km
  averageFlightTime: number; // in minutes
  maintenanceRatio: number; // maintenance hours / flight hours
  upcomingMaintenance: {
    date: string;
    type: string;
    description: string;
  }[];
}

interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  equipmentName: string;
  date: string;
  type: string;
  status: string;
  description: string;
  technician: string;
  cost: number;
  partsReplaced: string[];
}

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

interface EquipmentDetailsProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment;
  maintenanceRecords?: MaintenanceRecord[];
  flightLogs?: FlightLog[];
  usageMetrics?: EquipmentUsageMetrics;
  onEdit?: () => void;
  onScheduleMaintenance?: () => void;
  onTrackComponents?: () => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({
  open,
  onClose,
  equipment,
  maintenanceRecords = [],
  flightLogs = [],
  usageMetrics,
  onEdit,
  onScheduleMaintenance,
  onTrackComponents
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  // Get equipment status color
  const getStatusColor = (status: EquipmentStatus): string => {
    switch (status) {
      case 'Ready':
        return theme.palette.success.main;
      case 'In Maintenance':
        return theme.palette.warning.main;
      case 'Grounded':
        return theme.palette.error.main;
      case 'In Use':
        return theme.palette.info.main;
      case 'Needs Attention':
        return theme.palette.warning.dark;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Equipment Details</Typography>
          <Button 
            size="small" 
            onClick={onClose} 
            color="inherit"
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                src={equipment.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={equipment.name}
                sx={{
                  width: '100%',
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  objectFit: 'cover'
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>{equipment.name}</Typography>
              
              <Box sx={{ display: 'flex', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  size="small"
                  label={equipment.type}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={equipment.status}
                  sx={{
                    backgroundColor: getStatusColor(equipment.status),
                    color: '#fff'
                  }}
                />
              </Box>
              
              <Typography variant="body1" sx={{ mt: 1 }}>
                {equipment.model} | {equipment.serialNumber}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Purchase Date
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(equipment.purchaseDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Flight Hours
                  </Typography>
                  <Typography variant="body2">
                    {equipment.flightHours} hours
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Maintenance
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(equipment.lastMaintenance)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Next Maintenance
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(equipment.nextMaintenance)}
                  </Typography>
                </Grid>
              </Grid>
              
              {equipment.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {equipment.notes}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {onEdit && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={onEdit}
                  >
                    Edit
                  </Button>
                )}
                {onScheduleMaintenance && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MaintenanceIcon />}
                    onClick={onScheduleMaintenance}
                  >
                    Schedule Maintenance
                  </Button>
                )}
                {onTrackComponents && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BuildIcon />}
                    onClick={onTrackComponents}
                  >
                    Component Tracker
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Divider />
        
        <Box sx={{ width: '100%', mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
            >
              <Tab label="Usage Metrics" icon={<SettingsIcon />} iconPosition="start" />
              <Tab 
                label={`Maintenance History (${maintenanceRecords.length})`} 
                icon={<MaintenanceIcon />} 
                iconPosition="start" 
              />
              <Tab 
                label={`Flight Logs (${flightLogs.length})`} 
                icon={<HistoryIcon />} 
                iconPosition="start" 
              />
            </Tabs>
          </Box>
          
          {/* Usage Metrics */}
          <TabPanel value={tabValue} index={0}>
            {usageMetrics ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FlightIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Flight Stats</Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <TimerIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Total Flight Hours" 
                            secondary={`${usageMetrics.totalFlightHours} hours`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <DistanceIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Distance Flown" 
                            secondary={`${usageMetrics.distanceFlown.toFixed(1)} km`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TaskIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Missions Completed" 
                            secondary={usageMetrics.missionsCompleted} 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <MaintenanceIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Maintenance Stats</Typography>
                      </Box>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <TimerIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Average Flight Time" 
                            secondary={`${usageMetrics.averageFlightTime.toFixed(1)} minutes`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <MaintenanceIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Maintenance Ratio" 
                            secondary={`${(usageMetrics.maintenanceRatio * 100).toFixed(1)}%`} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <BatteryIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Battery Charges" 
                            secondary={usageMetrics.batteryCharges} 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Upcoming Maintenance</Typography>
                      </Box>
                      {usageMetrics.upcomingMaintenance.length > 0 ? (
                        <List dense>
                          {usageMetrics.upcomingMaintenance.map((maintenance, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <MaintenanceIcon 
                                  fontSize="small" 
                                  color={
                                    new Date(maintenance.date) < new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) 
                                      ? 'error' 
                                      : 'inherit'
                                  } 
                                />
                              </ListItemIcon>
                              <ListItemText 
                                primary={maintenance.type} 
                                secondary={
                                  <>
                                    {formatDate(maintenance.date)}
                                    <br />
                                    {maintenance.description}
                                  </>
                                } 
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          No upcoming maintenance scheduled
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                No usage metrics available for this equipment.
              </Typography>
            )}
          </TabPanel>
          
          {/* Maintenance History */}
          <TabPanel value={tabValue} index={1}>
            {maintenanceRecords.length > 0 ? (
              <List>
                {maintenanceRecords.map((record) => (
                  <Paper key={record.id} sx={{ mb: 2, p: 2 }}>
                    <Grid container>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="subtitle1">
                          {record.type} - {record.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(record.date)} | Technician: {record.technician}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {record.description}
                        </Typography>
                        
                        {record.partsReplaced.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Parts Replaced:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {record.partsReplaced.map((part, index) => (
                                <Chip key={index} label={part} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Chip 
                          label={`$${record.cost.toFixed(2)}`} 
                          variant="outlined" 
                          color="primary" 
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                No maintenance records available for this equipment.
              </Typography>
            )}
          </TabPanel>
          
          {/* Flight Logs */}
          <TabPanel value={tabValue} index={2}>
            {flightLogs.length > 0 ? (
              <List>
                {flightLogs.map((log) => (
                  <Paper key={log.id} sx={{ mb: 2, p: 2 }}>
                    <Grid container>
                      <Grid item xs={12} sm={9}>
                        <Typography variant="subtitle1">
                          {log.purpose}
                          {log.missionName && (
                            <Chip 
                              label={log.missionName} 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1 }} 
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(log.date)} | {log.location} | Pilot: {log.pilot}
                        </Typography>
                        
                        {log.notes && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {log.notes}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Chip 
                          icon={<TimerIcon />}
                          label={`${log.duration} min`} 
                          variant="outlined" 
                          color="primary" 
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                No flight logs available for this equipment.
              </Typography>
            )}
          </TabPanel>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`equipment-tabpanel-${index}`}
      aria-labelledby={`equipment-tab-${index}`}
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

export default EquipmentDetails; 