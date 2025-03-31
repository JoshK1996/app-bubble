import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  Button,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Flight as DroneIcon,
  Warning as WarningIcon,
  CheckCircle as ReadyIcon,
  AirplanemodeInactive as GroundedIcon,
  Build as MaintenanceIcon,
  VisibilityOff as InUseIcon,
  NavigateNext as NextIcon
} from '@mui/icons-material';
import { Equipment, EquipmentStatus } from './EquipmentItem';

interface EquipmentDashboardProps {
  equipmentItems: Equipment[];
  onViewAllEquipment?: () => void;
  onViewMaintenanceSchedule?: () => void;
}

const EquipmentDashboard: React.FC<EquipmentDashboardProps> = ({
  equipmentItems,
  onViewAllEquipment,
  onViewMaintenanceSchedule
}) => {
  const theme = useTheme();

  // Calculate equipment status counts
  const statusCounts = equipmentItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<EquipmentStatus, number>);

  // Calculate type counts
  const typeCounts = equipmentItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get equipment that needs maintenance soon
  const maintenanceSoon = equipmentItems.filter(item => {
    const nextMaintDate = new Date(item.nextMaintenance);
    const now = new Date();
    const daysDiff = Math.ceil((nextMaintDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff > 0;
  });

  // Get the percentage of equipment ready for use
  const readyPercentage = Math.round(
    ((statusCounts['Ready'] || 0) / equipmentItems.length) * 100
  ) || 0;

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

  // Get status icon
  const getStatusIcon = (status: EquipmentStatus) => {
    switch (status) {
      case 'Ready':
        return <ReadyIcon />;
      case 'In Maintenance':
        return <MaintenanceIcon />;
      case 'Grounded':
        return <GroundedIcon />;
      case 'In Use':
        return <InUseIcon />;
      case 'Needs Attention':
        return <WarningIcon />;
      default:
        return <DroneIcon />;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Equipment Status</Typography>
          <Button
            endIcon={<NextIcon />}
            onClick={onViewAllEquipment}
            size="small"
          >
            View All
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Fleet Readiness
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={readyPercentage} 
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: readyPercentage > 70 
                      ? theme.palette.success.main 
                      : readyPercentage > 40 
                        ? theme.palette.warning.main 
                        : theme.palette.error.main
                  }
                }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">{`${readyPercentage}%`}</Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Status Summary */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Equipment by Status
            </Typography>
            <Stack spacing={1}>
              {Object.entries(statusCounts).map(([status, count]) => (
                <Box 
                  key={status}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        mr: 1,
                        color: getStatusColor(status as EquipmentStatus)
                      }}
                    >
                      {getStatusIcon(status as EquipmentStatus)}
                    </Box>
                    <Typography variant="body2">{status}</Typography>
                  </Box>
                  <Chip 
                    label={count} 
                    size="small"
                    sx={{ 
                      backgroundColor: getStatusColor(status as EquipmentStatus),
                      color: '#fff',
                      minWidth: '40px'
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Type Summary */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Equipment by Type
            </Typography>
            <Stack spacing={1}>
              {Object.entries(typeCounts).map(([type, count]) => (
                <Box 
                  key={type}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="body2">{type}</Typography>
                  <Chip 
                    label={count} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {maintenanceSoon.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Upcoming Maintenance
            </Typography>
            <Stack spacing={1}>
              {maintenanceSoon.slice(0, 3).map((item) => (
                <Box 
                  key={item.id}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(item.nextMaintenance).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Stack>
            {maintenanceSoon.length > 3 && (
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Button 
                  size="small" 
                  onClick={onViewMaintenanceSchedule}
                >
                  View more ({maintenanceSoon.length - 3})
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentDashboard; 