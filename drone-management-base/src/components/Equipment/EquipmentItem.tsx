import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Grid,
  Avatar,
  useTheme,
  CardActions,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as MaintenanceIcon,
  Info as InfoIcon,
  AirplanemodeInactive as GroundedIcon,
  CheckCircle as ReadyIcon,
  Flight as DroneIcon,
  Memory as ComponentIcon,
  BatteryAlert as BatteryIcon,
  History as HistoryIcon,
  Flight as FlightIcon,
  Build as BuildIcon
} from '@mui/icons-material';

// Types
export type EquipmentStatus = 'Ready' | 'In Maintenance' | 'Grounded' | 'In Use' | 'Needs Attention';
export type EquipmentType = 'Drone' | 'Camera' | 'Battery' | 'Propeller' | 'Controller' | 'Sensor';

export interface Equipment {
  id: number;
  name: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  status: EquipmentStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  flightHours: number;
  notes: string;
  image?: string;
}

interface EquipmentItemProps {
  equipment: Equipment;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (id: number) => void;
  onScheduleMaintenance?: (equipment: Equipment) => void;
  onViewDetails?: (equipment: Equipment) => void;
  onRecordFlightLog?: (equipment: Equipment) => void;
  onTrackComponents?: (equipment: Equipment) => void;
}

const EquipmentItem: React.FC<EquipmentItemProps> = ({
  equipment,
  onEdit,
  onDelete,
  onScheduleMaintenance,
  onViewDetails,
  onRecordFlightLog,
  onTrackComponents
}) => {
  const theme = useTheme();

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

  // Get equipment type icon
  const getEquipmentTypeIcon = (type: EquipmentType) => {
    switch (type) {
      case 'Drone':
        return <DroneIcon />;
      case 'Camera':
        return <ComponentIcon />;
      case 'Battery':
        return <BatteryIcon />;
      default:
        return <ComponentIcon />;
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
        return <DroneIcon />;
      case 'Needs Attention':
        return <InfoIcon color="error" />;
      default:
        return <InfoIcon />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  // Maintenance due soon check
  const isMaintenanceDueSoon = (): boolean => {
    const nextMaintDate = new Date(equipment.nextMaintenance);
    const now = new Date();
    const daysDiff = Math.ceil((nextMaintDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff > 0;
  };

  return (
    <Card sx={{ 
      mb: 2, 
      boxShadow: 2,
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      },
      position: 'relative'
    }}>
      {isMaintenanceDueSoon() && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: theme.palette.warning.main,
            color: theme.palette.warning.contrastText,
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '0 4px 0 4px',
          }}
        >
          Maintenance Due Soon
        </Box>
      )}

      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 56,
                height: 56
              }}
            >
              {getEquipmentTypeIcon(equipment.type)}
            </Avatar>
          </Grid>

          <Grid item xs>
            <Typography variant="h6" component="div">
              {equipment.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {equipment.model} | {equipment.serialNumber}
            </Typography>
            
            <Box sx={{ display: 'flex', mt: 1, gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={equipment.type}
                color="primary"
                variant="outlined"
              />
              <Chip
                size="small"
                icon={getStatusIcon(equipment.status)}
                label={equipment.status}
                sx={{
                  backgroundColor: getStatusColor(equipment.status),
                  color: '#fff'
                }}
              />
              <Chip
                size="small"
                icon={<HistoryIcon />}
                label={`${equipment.flightHours} hrs`}
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Purchased:</strong> {formatDate(equipment.purchaseDate)}
          </Typography>
          <Typography variant="body2">
            <strong>Last Maintenance:</strong> {formatDate(equipment.lastMaintenance)}
          </Typography>
          <Typography variant="body2">
            <strong>Next Maintenance:</strong> {formatDate(equipment.nextMaintenance)}
          </Typography>
        </Box>

        {equipment.notes && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ 
              maxHeight: '40px', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {equipment.notes}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => onViewDetails?.(equipment)}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Schedule Maintenance">
          <IconButton size="small" onClick={() => onScheduleMaintenance?.(equipment)}>
            <MaintenanceIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Record Flight Log">
          <IconButton size="small" onClick={() => onRecordFlightLog?.(equipment)}>
            <FlightIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Component Tracker">
          <IconButton size="small" onClick={() => onTrackComponents?.(equipment)}>
            <BuildIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit?.(equipment)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete?.(equipment.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default EquipmentItem; 