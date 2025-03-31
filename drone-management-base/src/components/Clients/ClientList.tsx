import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  Stack,
  InputAdornment,
  Button,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountCircle as AccountCircleIcon,
  BusinessCenter as BusinessCenterIcon,
  LocalPolice as GovernmentIcon,
  Apartment as NonprofitIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  NewReleases as ProspectIcon,
  Archive as ArchivedIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { Client, ClientStatus, ClientType } from '../../types/clientTypes';

interface ClientListProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: number) => void;
  onAddClient: () => void;
  onEmailClient: (client: Client) => void;
  onCallClient: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({
  clients,
  onViewClient,
  onEditClient,
  onDeleteClient,
  onAddClient,
  onEmailClient,
  onCallClient,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof Client>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const handleSort = (column: keyof Client) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

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

  const getTypeIcon = (type: ClientType) => {
    switch (type) {
      case ClientType.INDIVIDUAL:
        return <AccountCircleIcon fontSize="small" />;
      case ClientType.BUSINESS:
        return <BusinessCenterIcon fontSize="small" />;
      case ClientType.GOVERNMENT:
        return <GovernmentIcon fontSize="small" />;
      case ClientType.NONPROFIT:
        return <NonprofitIcon fontSize="small" />;
      default:
        return <LabelIcon fontSize="small" />;
    }
  };

  // Filter clients based on search term and filter selections
  const filteredClients = clients.filter((client) => {
    const matchesSearch = searchTerm === '' || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.industry && client.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || client.status === statusFilter;
    const matchesType = typeFilter === '' || client.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort filtered clients
  const sortedClients = filteredClients.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue === undefined || bValue === undefined) return 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      return 0;
    }
  });

  // Paginate clients
  const paginatedClients = sortedClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Clients
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onAddClient}
        >
          Add Client
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Search Clients"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ minWidth: 300, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Status"
          >
            <MenuItem value="">All Statuses</MenuItem>
            {Object.values(ClientStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={handleTypeFilterChange}
            label="Type"
          >
            <MenuItem value="">All Types</MenuItem>
            {Object.values(ClientType).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="clients table">
          <TableHead>
            <TableRow>
              <TableCell 
                onClick={() => handleSort('name')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell 
                onClick={() => handleSort('totalMissions')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Missions {sortBy === 'totalMissions' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('totalValue')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Total Value {sortBy === 'totalValue' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('avgMissionValue')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Avg. Value {sortBy === 'avgMissionValue' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClients.length > 0 ? (
              paginatedClients.map((client) => (
                <TableRow
                  key={client.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {client.name}
                    </Typography>
                    {client.industry && (
                      <Typography variant="caption" color="text.secondary">
                        {client.industry}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(client.status)}
                      label={client.status}
                      size="small"
                      color={getStatusColor(client.status) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getTypeIcon(client.type)}
                      label={client.type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{client.totalMissions}</TableCell>
                  <TableCell>${client.totalValue.toLocaleString()}</TableCell>
                  <TableCell>${client.avgMissionValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {client.email && (
                        <Tooltip title={`Email: ${client.email}`}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEmailClient(client)}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {client.phone && (
                        <Tooltip title={`Phone: ${client.phone}`}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onCallClient(client)}
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => onViewClient(client)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Client">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEditClient(client)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Client">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteClient(client.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No clients found matching the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredClients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  );
};

export default ClientList; 