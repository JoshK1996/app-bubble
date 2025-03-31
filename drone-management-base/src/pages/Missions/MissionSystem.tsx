import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container,
  Tabs,
  Tab,
  Paper,
  Button
} from '@mui/material';
import { 
  List as ListAltIcon,
  CalendarMonth as CalendarIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import MissionCalendar from '../../components/Missions/MissionCalendar';
import MissionAnalytics from '../../components/Missions/MissionAnalytics';

// Define mission type
interface Mission {
  id: number;
  name: string;
  client: string;
  location: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  type: string;
  drone: string;
  pilot: string;
}

// Define mission data for our demo
const sampleMissions: Mission[] = [
  {
    id: 1,
    name: 'Aerial Photography - Downtown',
    client: 'ABC Real Estate',
    location: '123 Downtown Ave',
    date: '2025-03-28',
    status: 'Scheduled' as const,
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
    status: 'Scheduled' as const,
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
    status: 'Completed' as const,
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
    status: 'Completed' as const,
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
    status: 'In Progress' as const,
    type: 'Mapping',
    drone: 'DJI Phantom 4 Multispectral',
    pilot: 'Sarah Williams'
  }
];

const MissionSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [missions] = useState(sampleMissions);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle mission click in calendar
  const handleMissionClick = (mission: any) => {
    alert(`Clicked on mission: ${mission.name}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Mission Management System</Typography>
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
          <Tab label="Overview" icon={<ListAltIcon />} iconPosition="start" />
          <Tab label="Calendar" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="Analytics" icon={<ReportIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Overview Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="body1" paragraph>
            Welcome to the Mission Management System. This system allows you to plan, schedule, and track your drone missions.
            Use the tabs above to switch between different views.
          </Typography>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Quick Stats</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Paper sx={{ p: 2, flexGrow: 1, bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="h4">{missions.filter(m => m.status === 'Scheduled').length}</Typography>
                <Typography variant="body2">Scheduled Missions</Typography>
              </Paper>
              <Paper sx={{ p: 2, flexGrow: 1, bgcolor: 'warning.light', color: 'white' }}>
                <Typography variant="h4">{missions.filter(m => m.status === 'In Progress').length}</Typography>
                <Typography variant="body2">In Progress</Typography>
              </Paper>
              <Paper sx={{ p: 2, flexGrow: 1, bgcolor: 'success.light', color: 'white' }}>
                <Typography variant="h4">{missions.filter(m => m.status === 'Completed').length}</Typography>
                <Typography variant="body2">Completed Missions</Typography>
              </Paper>
            </Box>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Button variant="contained" color="primary" href="/mission-planning">
              Go to Mission Planning
            </Button>
            <Button variant="outlined" onClick={() => setActiveTab(1)}>
              View Calendar
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Calendar Tab */}
      {activeTab === 1 && (
        <Box>
          <MissionCalendar 
            missions={missions} 
            onMissionClick={handleMissionClick}
          />
        </Box>
      )}
      
      {/* Analytics Tab */}
      {activeTab === 2 && (
        <Box>
          <MissionAnalytics missions={missions} />
        </Box>
      )}
    </Container>
  );
};

export default MissionSystem; 