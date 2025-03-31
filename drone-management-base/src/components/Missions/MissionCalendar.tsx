import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  FlightTakeoff as FlightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { addMonths, subMonths, format, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, parseISO } from 'date-fns';

// Define mission interface
interface Mission {
  id: number;
  name: string;
  client: string;
  location: string;
  date: string; // ISO format: "2025-03-28"
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  type: string;
  drone: string;
  pilot: string;
}

interface MissionCalendarProps {
  missions: Mission[];
  onMissionClick?: (mission: Mission) => void;
}

const MissionCalendar: React.FC<MissionCalendarProps> = ({ missions, onMissionClick }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Generate calendar days for the current month view
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    
    // Set start date to beginning of week (Sunday)
    const day = startDate.getDay();
    const diff = startDate.getDate() - day;
    startDate.setDate(diff);
    
    // Ensure we have complete weeks (6 rows max in calendar)
    const daysToShow = 42; // 6 weeks * 7 days
    
    // Generate array of dates to display
    const calendarDays = [];
    let currentDay = new Date(startDate);
    
    for (let i = 0; i < daysToShow; i++) {
      calendarDays.push(new Date(currentDay));
      currentDay = addDays(currentDay, 1);
    }
    
    return calendarDays;
  };
  
  // Get missions for a specific day
  const getMissionsForDay = (day: Date) => {
    return missions.filter(mission => {
      const missionDate = parseISO(mission.date);
      return isSameDay(missionDate, day);
    });
  };
  
  // Get color for mission status
  const getStatusColor = (status: Mission['status']) => {
    switch (status) {
      case 'Scheduled':
        return 'primary';
      case 'In Progress':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <Box>
          <Tooltip title="Previous Month">
            <IconButton onClick={goToPreviousMonth}>
              <PrevIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Today">
            <IconButton onClick={goToToday}>
              <TodayIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Next Month">
            <IconButton onClick={goToNextMonth}>
              <NextIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper elevation={2} sx={{ p: 2 }}>
        <Grid container>
          {/* Weekday headers */}
          {weekDays.map(day => (
            <Grid 
              item 
              key={day} 
              xs={12 / 7} 
              sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold', 
                py: 1,
                borderBottom: '1px solid #eee'
              }}
            >
              <Typography variant="subtitle2">{day}</Typography>
            </Grid>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, i) => {
            const dayMissions = getMissionsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Grid 
                item 
                key={i} 
                xs={12 / 7} 
                sx={{ 
                  minHeight: 100, 
                  p: 0.5,
                  borderRight: i % 7 === 6 ? 'none' : '1px solid #eee',
                  borderBottom: Math.floor(i / 7) === 5 ? 'none' : '1px solid #eee',
                  opacity: isCurrentMonth ? 1 : 0.4,
                  backgroundColor: isToday ? 'rgba(66, 165, 245, 0.1)' : 'transparent',
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 24,
                  width: 24,
                  borderRadius: '50%',
                  mb: 0.5,
                  backgroundColor: isToday ? 'primary.main' : 'transparent',
                  color: isToday ? 'white' : 'inherit',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  <Typography variant="body2">
                    {format(day, 'd')}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  maxHeight: 70, 
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#bbb',
                    borderRadius: '4px',
                  },
                }}>
                  {dayMissions.map(mission => (
                    <Card 
                      key={mission.id}
                      sx={{ 
                        mb: 0.5, 
                        cursor: 'pointer',
                        borderLeft: `4px solid ${mission.status === 'Scheduled' ? '#1976d2' : 
                                                 mission.status === 'In Progress' ? '#ff9800' : 
                                                 mission.status === 'Completed' ? '#4caf50' : '#f44336'}`
                      }}
                      onClick={() => onMissionClick && onMissionClick(mission)}
                    >
                      <CardContent sx={{ p: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FlightIcon fontSize="small" />
                          <Typography variant="caption" noWrap sx={{ maxWidth: '85px' }}>
                            {mission.name}
                          </Typography>
                        </Box>
                        <Chip 
                          label={mission.status} 
                          size="small" 
                          color={getStatusColor(mission.status)} 
                          sx={{ height: 18, fontSize: '0.6rem', mt: 0.5 }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
};

export default MissionCalendar; 