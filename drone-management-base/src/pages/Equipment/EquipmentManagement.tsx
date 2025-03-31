import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tab,
  Tabs,
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Divider,
  IconButton,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Dashboard as DashboardIcon,
  ViewList as ListIcon,
  Flight as DroneIcon,
  FlightTakeoff as FlightIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Build as BuildIcon
} from '@mui/icons-material';

// Import our equipment components
import {
  EquipmentItem,
  Equipment as DroneEquipment,
  EquipmentList,
  EquipmentDashboard,
  EquipmentForm,
  EquipmentDetails,
  MaintenanceScheduler,
  FlightLogForm,
  EquipmentType,
  EquipmentStatus,
  EquipmentUsageStats,
  ComponentTracker,
  DroneComponent,
  ComponentMaintenance,
  ComponentReplacement
} from '../../components/Equipment';

// Import our custom hook
import useEquipmentManagement from '../../hooks/useEquipmentManagement';

/**
 * Equipment Management page component
 */
const EquipmentManagement: React.FC = () => {
  const theme = useTheme();
  
  // Use our custom hook
  const {
    equipmentList,
    loading,
    error,
    maintenanceRecords,
    flightLogs,
    usageMetrics,
    selectedEquipment,
    isEquipmentFormOpen,
    isMaintenanceSchedulerOpen,
    isFlightLogFormOpen,
    isEquipmentDetailsOpen,
    openEquipmentForm,
    closeEquipmentForm,
    openMaintenanceScheduler,
    closeMaintenanceScheduler,
    openFlightLogForm,
    closeFlightLogForm,
    openEquipmentDetails,
    closeEquipmentDetails,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    addFlightLog,
    filterEquipment,
    getDashboardData,
    setSelectedEquipment
  } = useEquipmentManagement();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<EquipmentType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<EquipmentStatus[]>([]);
  
  // Calculate dashboard data
  const dashboardData = getDashboardData();
  
  // Add state for ComponentTracker
  const [isComponentTrackerOpen, setIsComponentTrackerOpen] = useState(false);
  const [droneComponents, setDroneComponents] = useState<DroneComponent[]>([
    {
      id: 1,
      equipmentId: 1,
      equipmentName: 'DJI Phantom 4 Pro',
      componentType: 'Propeller',
      serialNumber: 'PROP-001',
      manufacturer: 'DJI',
      model: 'P4P Propeller',
      installationDate: new Date('2023-01-15'),
      hoursUsed: 25.5,
      cyclesCompleted: 42,
      maxLifeHours: 100,
      maxLifeCycles: 200,
      status: 'Operational',
      notes: 'Standard propeller for Phantom 4 Pro',
      replacementHistory: [],
      maintenanceHistory: []
    },
    {
      id: 2,
      equipmentId: 1,
      equipmentName: 'DJI Phantom 4 Pro',
      componentType: 'Battery',
      serialNumber: 'BAT-002',
      manufacturer: 'DJI',
      model: 'P4P Intelligent Battery',
      installationDate: new Date('2023-01-15'),
      hoursUsed: 45.2,
      cyclesCompleted: 78,
      maxLifeHours: 50,
      maxLifeCycles: 100,
      status: 'Needs Maintenance',
      notes: 'Showing signs of reduced capacity',
      replacementHistory: [],
      maintenanceHistory: []
    }
  ]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle type filter change
  const handleTypeFilterChange = (type: EquipmentType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (status: EquipmentStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedStatuses([]);
  };
  
  // Get filtered equipment list
  const filteredEquipment = filterEquipment({
    search: searchQuery,
    type: selectedTypes.length > 0 ? selectedTypes : undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
  });
  
  // Create an array of equipment types for filtering
  const equipmentTypes: EquipmentType[] = [
    'Drone',
    'Camera',
    'Battery',
    'Propeller',
    'Controller',
    'Sensor'
  ];
  
  // Create an array of equipment statuses for filtering
  const equipmentStatuses: EquipmentStatus[] = [
    'Ready',
    'In Maintenance',
    'Grounded',
    'In Use',
    'Needs Attention'
  ];
  
  // Get status color
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
  
  // Add handlers for ComponentTracker
  const openComponentTracker = (equipment: DroneEquipment) => {
    setSelectedEquipment(equipment);
    setIsComponentTrackerOpen(true);
  };

  const closeComponentTracker = () => {
    setIsComponentTrackerOpen(false);
  };

  const handleAddComponent = (component: Omit<DroneComponent, 'id'>) => {
    const newComponent: DroneComponent = {
      ...component,
      id: droneComponents.length + 1,
    };
    setDroneComponents([...droneComponents, newComponent]);
  };

  const handleUpdateComponent = (component: DroneComponent) => {
    setDroneComponents(droneComponents.map(c => 
      c.id === component.id ? component : c
    ));
  };

  const handleDeleteComponent = (id: number) => {
    setDroneComponents(droneComponents.filter(c => c.id !== id));
  };

  const handleAddComponentMaintenance = (maintenance: Omit<ComponentMaintenance, 'id'>) => {
    setDroneComponents(droneComponents.map(component => {
      if (component.id === maintenance.componentId) {
        const newMaintenance = {
          ...maintenance,
          id: component.maintenanceHistory.length + 1
        };
        return {
          ...component,
          lastMaintenanceDate: maintenance.maintenanceDate,
          hoursUsed: Math.max(0, component.hoursUsed - maintenance.hoursAdded),
          cyclesCompleted: Math.max(0, component.cyclesCompleted - maintenance.cyclesAdded),
          status: 'Operational',
          maintenanceHistory: [...component.maintenanceHistory, newMaintenance]
        };
      }
      return component;
    }));
  };

  const handleAddComponentReplacement = (replacement: Omit<ComponentReplacement, 'id'>) => {
    setDroneComponents(droneComponents.map(component => {
      if (component.id === replacement.componentId) {
        const newReplacement = {
          ...replacement,
          id: component.replacementHistory.length + 1
        };
        return {
          ...component,
          serialNumber: replacement.newSerialNumber,
          installationDate: replacement.replacementDate,
          hoursUsed: 0,
          cyclesCompleted: 0,
          status: 'Operational',
          replacementHistory: [...component.replacementHistory, newReplacement]
        };
      }
      return component;
    }));
  };
  
  // First, let's define MaintenanceItem interface to match the empty arrays in the MaintenanceScheduler component
  const emptyMaintenanceItems: any[] = [];
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Equipment Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => openEquipmentForm()}
            sx={{ mr: 1 }}
          >
            Add Equipment
          </Button>
          <IconButton onClick={() => window.location.reload()}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {loading && <LinearProgress sx={{ mb: 3 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<ListIcon />} label="Equipment List" />
          <Tab icon={<FlightIcon />} label="Flight Logs" />
          <Tab icon={<SettingsIcon />} label="Maintenance" />
        </Tabs>
      </Paper>
      
      {/* Dashboard Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <EquipmentDashboard
              equipmentItems={equipmentList}
              onViewAllEquipment={() => setTabValue(1)}
              onViewMaintenanceSchedule={() => setTabValue(3)}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 3 }}>
            <EquipmentUsageStats
              equipmentList={equipmentList}
              maintenanceCount={maintenanceRecords.length}
              flightLogCount={flightLogs.length}
            />
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Equipment List Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <FilterIcon sx={{ color: 'text.secondary', mr: 1 }} />
                
                {equipmentTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    color={selectedTypes.includes(type) ? 'primary' : 'default'}
                    onClick={() => handleTypeFilterChange(type)}
                    variant={selectedTypes.includes(type) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
                
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                
                {equipmentStatuses.map((status) => (
                  <Chip
                    key={status}
                    label={status}
                    sx={{
                      bgcolor: selectedStatuses.includes(status) ? getStatusColor(status) : 'transparent',
                      color: selectedStatuses.includes(status) ? '#fff' : 'inherit',
                      borderColor: getStatusColor(status)
                    }}
                    onClick={() => handleStatusFilterChange(status)}
                    variant={selectedStatuses.includes(status) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
                
                {(selectedTypes.length > 0 || selectedStatuses.length > 0 || searchQuery) && (
                  <Button size="small" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        <EquipmentList
          equipmentItems={filteredEquipment}
          onAddEquipment={() => openEquipmentForm()}
          onViewDetails={openEquipmentDetails}
          onEditEquipment={openEquipmentForm}
          onDeleteEquipment={deleteEquipment}
          onScheduleMaintenance={openMaintenanceScheduler}
          onRecordFlightLog={openFlightLogForm}
          onTrackComponents={openComponentTracker}
        />
      </TabPanel>
      
      {/* Flight Logs Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>Flight Logs</Typography>
          
          <Paper sx={{ p: 3 }}>
            {flightLogs.length > 0 ? (
              <Grid container spacing={3}>
                {flightLogs.map((log) => {
                  // Find associated equipment
                  const equipment = equipmentList.find(e => e.id === log.equipmentId);
                  
                  return (
                    <Grid item xs={12} key={log.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="h6" gutterBottom>
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
                                Equipment: <strong>{log.equipmentName}</strong> {equipment && `(${equipment.model})`}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary">
                                Date: {new Date(log.date).toLocaleDateString()}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary">
                                Pilot: {log.pilot} | Location: {log.location}
                              </Typography>
                              
                              {log.notes && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {log.notes}
                                </Typography>
                              )}
                            </Grid>
                            
                            <Grid item xs={12} sm={6} sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: { xs: 'flex-start', sm: 'flex-end' } 
                            }}>
                              <Chip 
                                icon={<FlightIcon />}
                                label={`${log.duration} minutes`} 
                                variant="outlined" 
                                color="primary" 
                                sx={{ mb: 1 }}
                              />
                              
                              <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                                <Button 
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    if (equipment) {
                                      openFlightLogForm(equipment);
                                    }
                                  }}
                                  disabled={!equipment}
                                >
                                  Edit
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography align="center" color="text.secondary">
                No flight logs recorded yet. Add equipment and start recording flights.
              </Typography>
            )}
          </Paper>
        </Box>
      </TabPanel>
      
      {/* Maintenance Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>Maintenance Records</Typography>
          
          <Paper sx={{ p: 3 }}>
            {maintenanceRecords.length > 0 ? (
              <Grid container spacing={3}>
                {maintenanceRecords.map((record) => {
                  // Find associated equipment
                  const equipment = equipmentList.find(e => e.id === record.equipmentId);
                  
                  // Get status color
                  const getMaintenanceStatusColor = (status: string): string => {
                    switch (status) {
                      case 'Scheduled':
                        return theme.palette.info.main;
                      case 'In Progress':
                        return theme.palette.warning.main;
                      case 'Completed':
                        return theme.palette.success.main;
                      case 'Cancelled':
                        return theme.palette.error.main;
                      default:
                        return theme.palette.text.primary;
                    }
                  };
                  
                  // Get type color
                  const getMaintenanceTypeColor = (type: string): string => {
                    switch (type) {
                      case 'Routine':
                        return theme.palette.primary.main;
                      case 'Repair':
                        return theme.palette.error.main;
                      case 'Upgrade':
                        return theme.palette.success.main;
                      case 'Inspection':
                        return theme.palette.info.main;
                      case 'Calibration':
                        return theme.palette.warning.main;
                      default:
                        return theme.palette.text.primary;
                    }
                  };
                  
                  return (
                    <Grid item xs={12} key={record.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <Chip 
                                  label={record.type} 
                                  size="small"
                                  sx={{ 
                                    backgroundColor: getMaintenanceTypeColor(record.type),
                                    color: '#fff'
                                  }} 
                                />
                                <Chip 
                                  label={record.status} 
                                  size="small"
                                  sx={{ 
                                    backgroundColor: getMaintenanceStatusColor(record.status),
                                    color: '#fff'
                                  }} 
                                />
                              </Box>
                              
                              <Typography variant="h6" gutterBottom>
                                {record.description}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary">
                                Equipment: <strong>{record.equipmentName}</strong> {equipment && `(${equipment.model})`}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary">
                                Date: {new Date(record.date).toLocaleDateString()} | Technician: {record.technician}
                              </Typography>
                              
                              {record.partsReplaced.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Parts Replaced:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                    {record.partsReplaced.map((part: string, index: number) => (
                                      <Chip key={index} label={part} size="small" variant="outlined" />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Grid>
                            
                            <Grid item xs={12} sm={4} sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: { xs: 'flex-start', sm: 'flex-end' } 
                            }}>
                              <Chip 
                                label={`$${record.cost.toFixed(2)}`} 
                                variant="outlined" 
                                color="primary" 
                              />
                              
                              <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                                <Button 
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    if (equipment) {
                                      openMaintenanceScheduler(equipment);
                                    }
                                  }}
                                  disabled={!equipment}
                                >
                                  Edit
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography align="center" color="text.secondary">
                No maintenance records found. Schedule maintenance for your equipment.
              </Typography>
            )}
          </Paper>
        </Box>
      </TabPanel>
      
      {/* Dialogs */}
      
      {/* Equipment Form Dialog */}
      {isEquipmentFormOpen && (
        <EquipmentForm
          open={isEquipmentFormOpen}
          onClose={closeEquipmentForm}
          onSave={(data) => {
            if (selectedEquipment) {
              updateEquipment(selectedEquipment.id, data);
            } else {
              addEquipment(data);
            }
            closeEquipmentForm();
          }}
          equipment={selectedEquipment || undefined}
        />
      )}
      
      {/* Maintenance Scheduler Dialog */}
      {isMaintenanceSchedulerOpen && selectedEquipment && (
        <MaintenanceScheduler
          open={isMaintenanceSchedulerOpen}
          onClose={closeMaintenanceScheduler}
          equipment={selectedEquipment}
          onSave={(data) => {
            addMaintenanceRecord(data);
            closeMaintenanceScheduler();
          }}
          maintenanceItems={emptyMaintenanceItems}
          onAddMaintenanceItem={(item) => console.log('Add maintenance item', item)}
          onUpdateMaintenanceItem={(item) => console.log('Update maintenance item', item)}
          onDeleteMaintenanceItem={(id) => console.log('Delete maintenance item', id)}
          onMarkComplete={(id, hours, notes) => console.log('Mark complete', id, hours, notes)}
        />
      )}
      
      {/* Flight Log Form Dialog */}
      {isFlightLogFormOpen && selectedEquipment && (
        <FlightLogForm
          open={isFlightLogFormOpen}
          onClose={closeFlightLogForm}
          onSave={(data) => {
            addFlightLog(data);
            closeFlightLogForm();
          }}
          equipment={selectedEquipment}
        />
      )}
      
      {/* Equipment Details Dialog */}
      {isEquipmentDetailsOpen && selectedEquipment && (
        <EquipmentDetails
          open={isEquipmentDetailsOpen}
          onClose={closeEquipmentDetails}
          equipment={selectedEquipment}
          maintenanceRecords={maintenanceRecords.filter(
            record => record.equipmentId === selectedEquipment.id
          )}
          flightLogs={flightLogs.filter(
            log => log.equipmentId === selectedEquipment.id
          )}
          usageMetrics={usageMetrics[selectedEquipment.id]}
          onEdit={() => {
            closeEquipmentDetails();
            openEquipmentForm(selectedEquipment);
          }}
          onScheduleMaintenance={() => {
            closeEquipmentDetails();
            openMaintenanceScheduler(selectedEquipment);
          }}
          onTrackComponents={() => {
            closeEquipmentDetails();
            openComponentTracker(selectedEquipment);
          }}
        />
      )}
      
      {/* Component Tracker Dialog */}
      {isComponentTrackerOpen && selectedEquipment && (
        <ComponentTracker
          open={isComponentTrackerOpen}
          onClose={closeComponentTracker}
          equipmentId={selectedEquipment.id}
          equipmentName={selectedEquipment.name}
          components={droneComponents}
          onAddComponent={handleAddComponent}
          onUpdateComponent={handleUpdateComponent}
          onDeleteComponent={handleDeleteComponent}
          onAddMaintenance={handleAddComponentMaintenance}
          onAddReplacement={handleAddComponentReplacement}
        />
      )}
    </Box>
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
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default EquipmentManagement; 