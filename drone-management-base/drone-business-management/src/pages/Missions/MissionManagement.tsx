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
  Modal,
  Container,
  Divider,
  Stack,
  Tab,
  Tabs,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FlightTakeoff as FlightTakeoffIcon,
  Schedule as ScheduleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  Assessment as ReportIcon,
  ListAlt as ListAltIcon
} from '@mui/icons-material';

// Import our new components
import MissionCalendar from '../../components/Missions/MissionCalendar';
import MissionAnalytics from '../../components/Missions/MissionAnalytics';
import MissionReport from '../../components/Missions/MissionReport';

// Define mission status types
type MissionStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

// Mission interface
interface Mission {
  id: number;
  name: string;
  client: string;
  location: string;
  date: string;
  status: MissionStatus;
  type: string;
  drone: string;
  pilot: string;
}

// Instead, let's define the interfaces inline
interface MissionFormData {
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

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  required: boolean;
  category: 'equipment' | 'safety' | 'regulatory' | 'environment' | 'mission';
}

/**
 * Mission Management page component with mission listing and CRUD operations
 */
const MissionManagement: React.FC = () => {
  // Sample mission data (in a real app, this would come from an API)
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 1,
      name: 'Aerial Photography - Downtown',
      client: 'ABC Real Estate',
      location: '123 Downtown Ave',
      date: '2025-03-28',
      status: 'Scheduled',
      type: 'Photography',
      drone: 'DJI Phantom 4 Pro',
      pilot: 'John Doe'
    },
    {
      id: 2,
      name: 'Construction Site Survey',
      client: 'XYZ Construction',
      location: '456 Building Site',
      date: '2025-03-29',
      status: 'Scheduled',
      type: 'Survey',
      drone: 'DJI Mavic 3',
      pilot: 'Jane Smith'
    },
    {
      id: 3,
      name: 'Wedding Event Coverage',
      client: 'Smith Wedding',
      location: 'Lakeside Garden',
      date: '2025-03-25',
      status: 'Completed',
      type: 'Videography',
      drone: 'DJI Inspire 2',
      pilot: 'John Doe'
    },
    {
      id: 4,
      name: 'Industrial Inspection',
      client: 'Industrial Facilities Inc',
      location: 'Factory Zone E',
      date: '2025-03-26',
      status: 'Completed',
      type: 'Inspection',
      drone: 'DJI Matrice 300',
      pilot: 'Mike Johnson'
    },
    {
      id: 5,
      name: 'Agricultural Mapping',
      client: 'FarmTech Solutions',
      location: 'North Fields',
      date: '2025-03-27',
      status: 'In Progress',
      type: 'Mapping',
      drone: 'DJI Phantom 4 Multispectral',
      pilot: 'Sarah Williams'
    }
  ]);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Current mission being edited or deleted
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  
  // New mission form state
  const [newMission, setNewMission] = useState<Omit<Mission, 'id'>>({
    name: '',
    client: '',
    location: '',
    date: '',
    status: 'Scheduled',
    type: '',
    drone: '',
    pilot: ''
  });
  
  // Report modal state
  const [openReportModal, setOpenReportModal] = useState(false);
  const [reportMission, setReportMission] = useState<Mission | null>(null);
  
  // Add state for tab management
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialog handlers
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    // Reset form
    setNewMission({
      name: '',
      client: '',
      location: '',
      date: '',
      status: 'Scheduled',
      type: '',
      drone: '',
      pilot: ''
    });
  };
  
  const handleOpenEditDialog = (mission: Mission) => {
    setCurrentMission(mission);
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentMission(null);
  };
  
  const handleOpenDeleteDialog = (mission: Mission) => {
    setCurrentMission(mission);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentMission(null);
  };
  
  // Form handlers for text inputs
  const handleAddMissionChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNewMission({
      ...newMission,
      [name as string]: value
    });
  };
  
  // Specific handler for status select in add form
  const handleAddStatusChange = (event: SelectChangeEvent<MissionStatus>) => {
    setNewMission({
      ...newMission,
      status: event.target.value as MissionStatus
    });
  };
  
  const handleEditMissionChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    if (!currentMission) return;
    
    const { name, value } = e.target;
    setCurrentMission({
      ...currentMission,
      [name as string]: value
    });
  };
  
  // Specific handler for status select in edit form
  const handleEditStatusChange = (event: SelectChangeEvent<MissionStatus>) => {
    if (!currentMission) return;
    
    setCurrentMission({
      ...currentMission,
      status: event.target.value as MissionStatus
    });
  };
  
  // CRUD operations
  const handleAddMission = () => {
    const id = Math.max(0, ...missions.map(m => m.id)) + 1;
    setMissions([...missions, { id, ...newMission }]);
    handleCloseAddDialog();
  };
  
  const handleUpdateMission = () => {
    if (!currentMission) return;
    
    setMissions(missions.map(mission => 
      mission.id === currentMission.id ? currentMission : mission
    ));
    handleCloseEditDialog();
  };
  
  const handleDeleteMission = () => {
    if (!currentMission) return;
    
    setMissions(missions.filter(mission => mission.id !== currentMission.id));
    handleCloseDeleteDialog();
  };
  
  // Helper function to get color based on status
  const getStatusColor = (status: MissionStatus) => {
    switch(status) {
      case 'Scheduled': return 'info';
      case 'In Progress': return 'warning';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };
  
  // Convert Mission to MissionFormData for the report component
  const convertToMissionFormData = (mission: Mission): MissionFormData => {
    return {
      id: mission.id.toString(),
      title: mission.name,
      description: `${mission.type} mission`,
      date: mission.date,
      startTime: '09:00',
      endTime: '11:00',
      location: mission.location,
      client: mission.client,
      pilot: mission.pilot,
      equipment: [mission.drone],
      notes: `This is a sample mission report for ${mission.name}.`,
      tasks: ['Conduct aerial photography', 'Capture site overview', 'Process collected data'],
      status: mission.status === 'Completed' ? 'COMPLETED' : 
             mission.status === 'In Progress' ? 'ACTIVE' : 
             mission.status === 'Scheduled' ? 'PLANNED' : 'CANCELLED',
    };
  };
  
  // Sample checklist for the report
  const sampleChecklist: ChecklistItem[] = [
    {
      id: '1',
      text: 'Inspect drone for physical damage',
      checked: true,
      required: true,
      category: 'equipment'
    },
    {
      id: '2',
      text: 'Check battery charge level',
      checked: true,
      required: true,
      category: 'equipment'
    },
    {
      id: '3',
      text: 'Calibrate compass',
      checked: true,
      required: true,
      category: 'equipment'
    },
    {
      id: '4',
      text: 'Verify GPS signal',
      checked: true,
      required: true,
      category: 'equipment'
    },
    {
      id: '5',
      text: 'Check for airspace restrictions',
      checked: true,
      required: true,
      category: 'regulatory'
    },
    {
      id: '6',
      text: 'Obtain necessary permissions',
      checked: true,
      required: true,
      category: 'regulatory'
    },
    {
      id: '7',
      text: 'Check weather conditions',
      checked: true,
      required: true,
      category: 'environment'
    },
    {
      id: '8',
      text: 'Identify potential obstacles',
      checked: true,
      required: true,
      category: 'environment'
    },
    {
      id: '9',
      text: 'Brief team on mission objectives',
      checked: true,
      required: true,
      category: 'mission'
    },
    {
      id: '10',
      text: 'Prepare emergency procedures',
      checked: true,
      required: true,
      category: 'safety'
    }
  ];
  
  // Handle opening report modal
  const handleOpenReportModal = (mission: Mission) => {
    setReportMission(mission);
    setOpenReportModal(true);
  };
  
  // Handle closing report modal
  const handleCloseReportModal = () => {
    setOpenReportModal(false);
    setReportMission(null);
  };

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Mission Management</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Plan, track, and analyze your drone missions
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="mission management tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Mission List" icon={<ListAltIcon />} iconPosition="start" />
          <Tab label="Calendar" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="Analytics" icon={<ReportIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Mission List Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Add Mission
            </Button>
          </Box>
          
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mission Name</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {missions.map((mission) => (
                    <TableRow key={mission.id}>
                      <TableCell>{mission.name}</TableCell>
                      <TableCell>{mission.client}</TableCell>
                      <TableCell>{mission.date}</TableCell>
                      <TableCell>{mission.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={mission.status}
                          color={
                            mission.status === 'Completed'
                              ? 'success'
                              : mission.status === 'In Progress'
                              ? 'warning'
                              : mission.status === 'Cancelled'
                              ? 'error'
                              : 'primary'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Mission Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditDialog(mission)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Mission">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(mission)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Generate Report">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenReportModal(mission)}
                            >
                              <ReportIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
      
      {/* Calendar Tab */}
      {activeTab === 1 && (
        <Box>
          <MissionCalendar 
            missions={missions} 
            onMissionClick={handleOpenEditDialog}
          />
        </Box>
      )}
      
      {/* Analytics Tab */}
      {activeTab === 2 && (
        <Box>
          <MissionAnalytics missions={missions} />
        </Box>
      )}
      
      {/* Mission Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Mission</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mission Name"
                name="name"
                value={newMission.name}
                onChange={handleAddMissionChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client"
                name="client"
                value={newMission.client}
                onChange={handleAddMissionChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={newMission.location}
                onChange={handleAddMissionChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                name="date"
                value={newMission.date}
                onChange={handleAddMissionChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="mission-status-label">Status</InputLabel>
                <Select
                  labelId="mission-status-label"
                  name="status"
                  value={newMission.status}
                  label="Status"
                  onChange={handleAddStatusChange}
                >
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mission Type"
                name="type"
                value={newMission.type}
                onChange={handleAddMissionChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Drone"
                name="drone"
                value={newMission.drone}
                onChange={handleAddMissionChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pilot"
                name="pilot"
                value={newMission.pilot}
                onChange={handleAddMissionChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddMission} variant="contained" color="primary">
            Add Mission
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Mission Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Mission</DialogTitle>
        <DialogContent>
          {currentMission && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mission Name"
                  name="name"
                  value={currentMission.name}
                  onChange={handleEditMissionChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Client"
                  name="client"
                  value={currentMission.client}
                  onChange={handleEditMissionChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={currentMission.location}
                  onChange={handleEditMissionChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  name="date"
                  value={currentMission.date}
                  onChange={handleEditMissionChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="edit-mission-status-label">Status</InputLabel>
                  <Select
                    labelId="edit-mission-status-label"
                    name="status"
                    value={currentMission.status}
                    label="Status"
                    onChange={handleEditStatusChange}
                  >
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mission Type"
                  name="type"
                  value={currentMission.type}
                  onChange={handleEditMissionChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Drone"
                  name="drone"
                  value={currentMission.drone}
                  onChange={handleEditMissionChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pilot"
                  name="pilot"
                  value={currentMission.pilot}
                  onChange={handleEditMissionChange}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateMission} variant="contained" color="primary">
            Update Mission
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Mission Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the mission "{currentMission?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteMission} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Mission Report Modal */}
      <Dialog open={openReportModal} onClose={handleCloseReportModal} maxWidth="md" fullWidth>
        <DialogContent>
          {reportMission && (
            <MissionReport 
              mission={{
                id: reportMission.id.toString(),
                title: reportMission.name,
                description: reportMission.type,
                date: reportMission.date,
                startTime: "09:00",
                endTime: "10:30",
                location: reportMission.location,
                client: reportMission.client,
                pilot: reportMission.pilot,
                equipment: [reportMission.drone],
                notes: "Mission completed successfully.",
                tasks: ["Aerial Photography", "Site Survey", "Data Processing"],
                status: reportMission.status
              }}
              checklist={[
                {
                  id: "1",
                  text: "Battery charged",
                  checked: true,
                  required: true,
                  category: "equipment"
                },
                {
                  id: "2",
                  text: "Flight plan prepared",
                  checked: true,
                  required: true,
                  category: "mission"
                },
                {
                  id: "3",
                  text: "Weather conditions checked",
                  checked: true,
                  required: true,
                  category: "environment"
                },
                {
                  id: "4",
                  text: "Permissions obtained",
                  checked: true,
                  required: true,
                  category: "regulatory"
                },
                {
                  id: "5",
                  text: "Safety briefing completed",
                  checked: true,
                  required: true,
                  category: "safety"
                }
              ]}
              onClose={handleCloseReportModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default MissionManagement; 