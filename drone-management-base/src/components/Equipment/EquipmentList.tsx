import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Pagination,
  Stack,
  Button,
  Alert,
  useTheme
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import EquipmentItem, { Equipment, EquipmentStatus, EquipmentType } from './EquipmentItem';

interface EquipmentListProps {
  equipmentItems: Equipment[];
  onAddEquipment?: () => void;
  onViewDetails?: (equipment: Equipment) => void;
  onEditEquipment?: (equipment: Equipment) => void;
  onDeleteEquipment?: (id: number) => void;
  onScheduleMaintenance?: (equipment: Equipment) => void;
  onRecordFlightLog?: (equipment: Equipment) => void;
  onTrackComponents?: (equipment: Equipment) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  equipmentItems,
  onAddEquipment,
  onViewDetails,
  onEditEquipment,
  onDeleteEquipment,
  onScheduleMaintenance,
  onRecordFlightLog,
  onTrackComponents
}) => {
  const theme = useTheme();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('name');
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Filter and sort equipment
  const filteredEquipment = useMemo(() => {
    return equipmentItems
      .filter(item => {
        // Search term filter
        const matchesSearch = 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.notes.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        
        // Type filter
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'status':
            return a.status.localeCompare(b.status);
          case 'type':
            return a.type.localeCompare(b.type);
          case 'flightHours':
            return b.flightHours - a.flightHours; // Descending order
          case 'nextMaintenance':
            return new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime();
          default:
            return 0;
        }
      });
  }, [equipmentItems, searchTerm, statusFilter, typeFilter, sortBy]);

  // Get paginated equipment
  const paginatedEquipment = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEquipment.slice(startIndex, endIndex);
  }, [filteredEquipment, page]);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Status options for filter
  const statusOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Ready', label: 'Ready' },
    { value: 'In Maintenance', label: 'In Maintenance' },
    { value: 'Grounded', label: 'Grounded' },
    { value: 'In Use', label: 'In Use' },
    { value: 'Needs Attention', label: 'Needs Attention' }
  ];

  // Type options for filter
  const typeOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'Drone', label: 'Drone' },
    { value: 'Camera', label: 'Camera' },
    { value: 'Battery', label: 'Battery' },
    { value: 'Propeller', label: 'Propeller' },
    { value: 'Controller', label: 'Controller' },
    { value: 'Sensor', label: 'Sensor' }
  ];

  // Sort options
  const sortOptions: { value: string; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'type', label: 'Type' },
    { value: 'flightHours', label: 'Flight Hours' },
    { value: 'nextMaintenance', label: 'Next Maintenance' }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Equipment Inventory
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddEquipment}
        >
          Add Equipment
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="type-filter-label">Type</InputLabel>
            <Select
              labelId="type-filter-label"
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {typeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Results count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {Math.min(filteredEquipment.length, paginatedEquipment.length)} of {filteredEquipment.length} items
        </Typography>
      </Box>

      {/* Equipment list */}
      {paginatedEquipment.length > 0 ? (
        <Grid container spacing={3}>
          {paginatedEquipment.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <EquipmentItem
                equipment={item}
                onEdit={onEditEquipment}
                onDelete={onDeleteEquipment}
                onScheduleMaintenance={onScheduleMaintenance}
                onViewDetails={onViewDetails}
                onRecordFlightLog={onRecordFlightLog}
                onTrackComponents={onTrackComponents}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No equipment items found matching your filters. Try adjusting your search criteria.
        </Alert>
      )}

      {/* Pagination */}
      {filteredEquipment.length > itemsPerPage && (
        <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredEquipment.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      )}
    </Box>
  );
};

export default EquipmentList; 