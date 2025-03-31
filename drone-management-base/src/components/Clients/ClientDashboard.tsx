import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocalPolice as GovernmentIcon,
  Apartment as NonprofitIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  NewReleases as ProspectIcon,
  Archive as ArchivedIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
  Flight as FlightIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { Client, ClientStatus, ClientType } from '../../types/clientTypes';

interface ClientDashboardProps {
  clients: Client[];
  onViewAllClients?: () => void;
  onViewClient?: (client: Client) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({
  clients,
  onViewAllClients,
  onViewClient,
}) => {
  // Calculate client statistics
  const totalClients = clients.length;
  
  const statusCounts = clients.reduce(
    (acc, client) => {
      if (acc[client.status]) {
        acc[client.status] += 1;
      } else {
        acc[client.status] = 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );
  
  const typeCounts = clients.reduce(
    (acc, client) => {
      if (acc[client.type]) {
        acc[client.type] += 1;
      } else {
        acc[client.type] = 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate top clients by value
  const topClients = [...clients]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  // Calculate total value and average value
  const totalValue = clients.reduce((sum, client) => sum + client.totalValue, 0);
  const averageValue = clients.length > 0 ? totalValue / clients.length : 0;
  
  // Calculate activity rate (clients with missions)
  const activeClientCount = clients.filter(client => client.totalMissions > 0).length;
  const activityRate = clients.length > 0 ? (activeClientCount / clients.length) * 100 : 0;

  // Utility function to get status color
  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE:
        return 'success';
      case ClientStatus.INACTIVE:
        return 'error';
      case ClientStatus.PROSPECT:
        return 'warning';
      case ClientStatus.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  // Utility function to get status icon
  const getStatusIcon = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE:
        return <ActiveIcon fontSize="small" />;
      case ClientStatus.INACTIVE:
        return <InactiveIcon fontSize="small" />;
      case ClientStatus.PROSPECT:
        return <ProspectIcon fontSize="small" />;
      case ClientStatus.ARCHIVED:
        return <ArchivedIcon fontSize="small" />;
      default:
        return <LabelIcon fontSize="small" />;
    }
  };

  // Utility function to get type icon
  const getTypeIcon = (type: ClientType) => {
    switch (type) {
      case ClientType.INDIVIDUAL:
        return <PersonIcon fontSize="small" />;
      case ClientType.BUSINESS:
        return <BusinessIcon fontSize="small" />;
      case ClientType.GOVERNMENT:
        return <GovernmentIcon fontSize="small" />;
      case ClientType.NONPROFIT:
        return <NonprofitIcon fontSize="small" />;
      default:
        return <LabelIcon fontSize="small" />;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Client Overview</Typography>
          </Box>
          {onViewAllClients && (
            <Button
              size="small"
              onClick={onViewAllClients}
              color="primary"
            >
              View All
            </Button>
          )}
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Clients
            </Typography>
            <Typography variant="h4">{totalClients}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Value
            </Typography>
            <Typography variant="h4">${totalValue.toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Avg. Value
            </Typography>
            <Typography variant="h4">${averageValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Active Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" sx={{ mr: 1 }}>
                {Math.round(activityRate)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={activityRate} 
              color="success"
              sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Client Status
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(statusCounts).map(([status, count]) => (
                <Chip
                  key={status}
                  icon={getStatusIcon(status as ClientStatus)}
                  label={`${status}: ${count}`}
                  color={getStatusColor(status as ClientStatus) as any}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Client Types
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(typeCounts).map(([type, count]) => (
                <Chip
                  key={type}
                  icon={getTypeIcon(type as ClientType)}
                  label={`${type}: ${count}`}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Recent Activity
            </Typography>
            <Chip
              icon={<TrendingUpIcon />}
              label={`${activeClientCount} Active Clients`}
              color="success"
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Chip
              icon={<FlightIcon />}
              label={`${clients.reduce((sum, client) => sum + client.totalMissions, 0)} Total Missions`}
              color="info"
              variant="outlined"
              size="small"
              sx={{ ml: 1, mb: 1 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Top Clients by Value
        </Typography>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {topClients.map((client) => (
            <ListItem
              key={client.id}
              alignItems="flex-start"
              sx={{ px: 1, cursor: onViewClient ? 'pointer' : 'default' }}
              onClick={() => onViewClient && onViewClient(client)}
              divider
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {getTypeIcon(client.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2">
                    {client.name}
                    <Chip
                      label={client.status}
                      size="small"
                      color={getStatusColor(client.status) as any}
                      sx={{ ml: 1, fontSize: '0.625rem' }}
                    />
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <MoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                    <Typography variant="body2" color="text.primary">
                      ${client.totalValue.toLocaleString()}
                    </Typography>
                    <Box sx={{ mx: 1, color: 'text.secondary' }}>|</Box>
                    <FlightIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                    <Typography variant="body2" color="text.primary">
                      {client.totalMissions} missions
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ClientDashboard; 