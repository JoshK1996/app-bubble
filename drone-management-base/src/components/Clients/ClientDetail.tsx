import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Tab,
  Tabs,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  BusinessCenter as BusinessCenterIcon,
  LocalPolice as GovernmentIcon,
  Apartment as NonprofitIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  EventNote as EventNoteIcon,
  AttachFile as AttachFileIcon,
  Flight as FlightIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { 
  Client, 
  ClientType, 
  ClientCommunication, 
  ClientDocument,
  createMockClientCommunications,
  createMockClientDocuments,
} from '../../types/clientTypes';

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
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ClientDetailProps {
  client: Client;
  onEdit: (client: Client) => void;
  onBack: () => void;
  onAddCommunication: (clientId: number) => void;
  onAddDocument: (clientId: number) => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({
  client,
  onEdit,
  onBack,
  onAddCommunication,
  onAddDocument,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [communications] = useState<ClientCommunication[]>(
    createMockClientCommunications(client.id)
  );
  const [documents] = useState<ClientDocument[]>(
    createMockClientDocuments(client.id)
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTypeIcon = (type: ClientType) => {
    switch (type) {
      case ClientType.INDIVIDUAL:
        return <AccountCircleIcon />;
      case ClientType.BUSINESS:
        return <BusinessCenterIcon />;
      case ClientType.GOVERNMENT:
        return <GovernmentIcon />;
      case ClientType.NONPROFIT:
        return <NonprofitIcon />;
      default:
        return <AccountCircleIcon />;
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <AssignmentIcon />;
      case 'docx':
        return <AssignmentIcon />;
      case 'xlsx':
        return <AssignmentIcon />;
      case 'jpg':
      case 'png':
        return <AssignmentIcon />;
      default:
        return <AttachFileIcon />;
    }
  };

  const getCommunicationTypeIcon = (type: string) => {
    switch (type) {
      case 'Email':
        return <EmailIcon />;
      case 'Phone':
        return <PhoneIcon />;
      case 'Meeting':
        return <EventNoteIcon />;
      case 'Video Call':
        return <EventNoteIcon />;
      case 'Message':
        return <MessageIcon />;
      default:
        return <MessageIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined" onClick={onBack}>
          Back to Clients
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => onEdit(client)}
        >
          Edit Client
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getTypeIcon(client.type)}
                  </Avatar>
                  <Typography variant="h6">{client.name}</Typography>
                </Box>
              }
              subheader={
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={client.status} 
                    size="small" 
                    color={
                      client.status === 'Active' ? 'success' :
                      client.status === 'Inactive' ? 'error' :
                      client.status === 'Prospect' ? 'warning' :
                      'default'
                    }
                    sx={{ mr: 1 }}
                  />
                  <Chip label={client.type} size="small" variant="outlined" />
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Contact Information
              </Typography>
              
              {client.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{client.email}</Typography>
                </Box>
              )}
              
              {client.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{client.phone}</Typography>
                </Box>
              )}
              
              {client.website && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                  <WebsiteIcon fontSize="small" color="action" />
                  <Typography variant="body2">{client.website}</Typography>
                </Box>
              )}
              
              {client.address && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body2">{client.address.street}</Typography>
                  <Typography variant="body2">
                    {client.address.city}, {client.address.state} {client.address.zipCode}
                  </Typography>
                  <Typography variant="body2">{client.address.country}</Typography>
                </Box>
              )}
              
              {client.industry && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Industry
                  </Typography>
                  <Chip 
                    label={client.industry} 
                    size="small" 
                    icon={<BusinessIcon fontSize="small" />}
                  />
                </Box>
              )}
              
              {client.taxId && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tax ID
                  </Typography>
                  <Typography variant="body2">{client.taxId}</Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Client Since
                </Typography>
                <Typography variant="body2">{formatDate(client.createdAt)}</Typography>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Business Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.default' }}>
                      <Typography variant="h6">{client.totalMissions}</Typography>
                      <Typography variant="body2" color="text.secondary">Missions</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.default' }}>
                      <Typography variant="h6">${client.totalValue.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Value</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
          
          {client.notes && (
            <Card sx={{ mt: 2 }}>
              <CardHeader 
                title="Notes" 
                titleTypographyProps={{ variant: 'subtitle1' }} 
                avatar={<InfoIcon color="action" />} 
              />
              <Divider />
              <CardContent>
                <Typography variant="body2">{client.notes}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Contacts" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Communication History" icon={<MessageIcon />} iconPosition="start" />
                <Tab label="Documents" icon={<AttachFileIcon />} iconPosition="start" />
                <Tab label="Missions" icon={<FlightIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            
            <CardContent sx={{ minHeight: 400 }}>
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button variant="outlined" size="small">
                    Add Contact
                  </Button>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {client.contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {contact.name}
                              {contact.isPrimary && (
                                <Chip
                                  label="Primary"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontSize: '0.625rem' }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{contact.position || '-'}</TableCell>
                          <TableCell>{contact.email || '-'}</TableCell>
                          <TableCell>{contact.phone || '-'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit Contact">
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Contact">
                              <IconButton size="small" color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => onAddCommunication(client.id)}
                  >
                    Add Communication
                  </Button>
                </Box>
                <List>
                  {communications.map((comm) => (
                    <ListItem 
                      key={comm.id}
                      alignItems="flex-start"
                      divider
                      sx={{ px: 2, py: 1.5 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'action.selected' }}>
                          {getCommunicationTypeIcon(comm.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2">{comm.subject}</Typography>
                            <Chip 
                              label={comm.type} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.625rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                              {comm.content}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                By {comm.userName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDateTime(comm.date)}
                              </Typography>
                            </Box>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Edit">
                          <IconButton edge="end" size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton edge="end" size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {communications.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      No communication history found.
                    </Typography>
                  )}
                </List>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => onAddDocument(client.id)}
                  >
                    Upload Document
                  </Button>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Document</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Uploaded</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getFileTypeIcon(doc.fileType)}
                              <Typography variant="body2">{doc.name}</Typography>
                              {doc.version > 1 && (
                                <Chip
                                  label={`v${doc.version}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.625rem' }}
                                />
                              )}
                            </Box>
                            {doc.description && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {doc.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{doc.fileType.toUpperCase()}</TableCell>
                          <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                          <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="View">
                              <IconButton size="small">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton size="small" color="primary">
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {documents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            No documents found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {client.totalMissions > 0 
                      ? `${client.name} has ${client.totalMissions} missions.`
                      : `${client.name} has no missions yet.`}
                  </Typography>
                  <Button variant="contained" startIcon={<FlightIcon />}>
                    {client.totalMissions > 0 ? 'View Missions' : 'Create Mission'}
                  </Button>
                </Box>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDetail; 