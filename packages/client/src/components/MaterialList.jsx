import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from 'aws-amplify';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Typography,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { listMaterialsByJob } from '../graphql/queries';
import { onCreateMaterial, onUpdateMaterial, onDeleteMaterial } from '../graphql/subscriptions';

// Mapping for status colors
const statusColorMap = {
  ESTIMATED: 'default',
  DETAILED: 'info',
  RELEASED_TO_FAB: 'secondary',
  IN_FABRICATION: 'warning',
  FABRICATED: 'success',
  SHIPPED_TO_FIELD: 'info',
  RECEIVED_ON_SITE: 'warning',
  INSTALLED: 'success',
  EXCESS: 'default',
  RETURNED_TO_WAREHOUSE: 'default',
  DAMAGED: 'error',
  MISSING: 'error'
};

const materialTypes = [
  { value: '', label: 'All Types' },
  { value: 'PIPE', label: 'Pipe' },
  { value: 'VALVE', label: 'Valve' },
  { value: 'FITTING', label: 'Fitting' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'SPOOL', label: 'Spool' },
  { value: 'DUCT', label: 'Duct' },
  { value: 'OTHER', label: 'Other' }
];

const systemTypes = [
  { value: '', label: 'All Systems' },
  { value: 'CHW', label: 'Chilled Water' },
  { value: 'HHW', label: 'Heating Hot Water' },
  { value: 'COND', label: 'Condensate' },
  { value: 'DUCT_EXHAUST', label: 'Duct Exhaust' },
  { value: 'DRAIN', label: 'Drain' },
  { value: 'OTHER', label: 'Other' }
];

const statusTypes = [
  { value: '', label: 'All Statuses' },
  { value: 'ESTIMATED', label: 'Estimated' },
  { value: 'DETAILED', label: 'Detailed' },
  { value: 'RELEASED_TO_FAB', label: 'Released to Fab' },
  { value: 'IN_FABRICATION', label: 'In Fabrication' },
  { value: 'FABRICATED', label: 'Fabricated' },
  { value: 'SHIPPED_TO_FIELD', label: 'Shipped to Field' },
  { value: 'RECEIVED_ON_SITE', label: 'Received on Site' },
  { value: 'INSTALLED', label: 'Installed' },
  { value: 'EXCESS', label: 'Excess' },
  { value: 'RETURNED_TO_WAREHOUSE', label: 'Returned to Warehouse' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'MISSING', label: 'Missing' }
];

/**
 * MaterialList component for displaying a filterable, paginated list of materials
 * @param {Object} props
 * @param {string} props.jobId - ID of the job to filter materials by (optional)
 */
const MaterialList = ({ jobId }) => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [nextToken, setNextToken] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    materialType: '',
    systemType: '',
    search: ''
  });
  
  // Fetch initial data
  useEffect(() => {
    fetchMaterials();
    
    // Set up subscriptions
    const createSubscription = API.graphql({
      query: onCreateMaterial,
      variables: { jobId }
    }).subscribe({
      next: ({ value }) => {
        const newMaterial = value.data.onCreateMaterial;
        setMaterials(prevMaterials => {
          // Only add if it matches our current filters
          if (filterMatches(newMaterial, filters)) {
            return [...prevMaterials, newMaterial];
          }
          return prevMaterials;
        });
      }
    });
    
    const updateSubscription = API.graphql({
      query: onUpdateMaterial,
      variables: { jobId }
    }).subscribe({
      next: ({ value }) => {
        const updatedMaterial = value.data.onUpdateMaterial;
        setMaterials(prevMaterials => {
          // If it still matches our filters, update it
          if (filterMatches(updatedMaterial, filters)) {
            return prevMaterials.map(material => 
              material.id === updatedMaterial.id ? updatedMaterial : material
            );
          } 
          // If it no longer matches, remove it
          else {
            return prevMaterials.filter(material => material.id !== updatedMaterial.id);
          }
        });
      }
    });
    
    const deleteSubscription = API.graphql({
      query: onDeleteMaterial
    }).subscribe({
      next: ({ value }) => {
        const deletedId = value.data.onDeleteMaterial.id;
        setMaterials(prevMaterials => 
          prevMaterials.filter(material => material.id !== deletedId)
        );
      }
    });
    
    // Clean up subscriptions
    return () => {
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    };
  }, [jobId, filters]);
  
  // Helper function to check if a material matches the current filters
  const filterMatches = (material, filters) => {
    if (jobId && material.jobId !== jobId) return false;
    if (filters.status && material.status !== filters.status) return false;
    if (filters.materialType && material.materialType !== filters.materialType) return false;
    if (filters.systemType && material.systemType !== filters.systemType) return false;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        (material.materialIdentifier && material.materialIdentifier.toLowerCase().includes(searchLower)) ||
        (material.description && material.description.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  };
  
  // Fetch materials list
  const fetchMaterials = async (token = null) => {
    try {
      setLoading(true);
      
      // Build filter
      let filter = {};
      if (filters.status) filter.status = { eq: filters.status };
      if (filters.materialType) filter.materialType = { eq: filters.materialType };
      if (filters.systemType) filter.systemType = { eq: filters.systemType };
      if (filters.search) {
        filter.or = [
          { materialIdentifier: { contains: filters.search } },
          { description: { contains: filters.search } }
        ];
      }
      
      const variables = {
        jobId: jobId,
        limit: rowsPerPage,
        nextToken: token,
        filter: Object.keys(filter).length > 0 ? filter : null
      };
      
      // In a real app, this would use the listMaterialsByJob query
      // Since we're just mocking, simulate the API response
      // const response = await API.graphql({
      //   query: listMaterialsByJob,
      //   variables
      // });
      
      // Mock response for development
      const mockMaterials = Array(25).fill(null).map((_, index) => ({
        id: `material-${index}`,
        jobId: jobId || 'job-1',
        materialIdentifier: `SPOOL-${1000 + index}`,
        description: `Sample material description ${index + 1}`,
        materialType: index % 7 === 0 ? 'PIPE' : index % 7 === 1 ? 'VALVE' : index % 7 === 2 ? 'FITTING' : 'SPOOL',
        systemType: index % 5 === 0 ? 'CHW' : index % 5 === 1 ? 'HHW' : 'COND',
        locationLevel: `Level ${Math.floor(index / 10) + 1}`,
        locationZone: `Zone ${(index % 5) + 1}`,
        status: index % 12 === 0 ? 'ESTIMATED' : 
                index % 12 === 1 ? 'DETAILED' : 
                index % 12 === 2 ? 'RELEASED_TO_FAB' : 
                index % 12 === 3 ? 'IN_FABRICATION' : 
                index % 12 === 4 ? 'FABRICATED' : 
                index % 12 === 5 ? 'SHIPPED_TO_FIELD' : 
                index % 12 === 6 ? 'RECEIVED_ON_SITE' : 
                index % 12 === 7 ? 'INSTALLED' : 
                index % 12 === 8 ? 'EXCESS' :
                index % 12 === 9 ? 'RETURNED_TO_WAREHOUSE' :
                index % 12 === 10 ? 'DAMAGED' : 'MISSING',
        qrCodeData: `MAT-${index}-${Date.now()}`,
        quantityEstimated: Math.floor(Math.random() * 100) + 1,
        unitOfMeasure: index % 3 === 0 ? 'EA' : index % 3 === 1 ? 'FT' : 'LF',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Filter the mock data
      const filteredMockData = mockMaterials.filter(material => filterMatches(material, filters));
      
      // Simulate pagination
      const startIndex = page * rowsPerPage;
      const paginatedData = filteredMockData.slice(startIndex, startIndex + rowsPerPage);
      
      // Simulate response format
      const mockResponse = {
        data: {
          listMaterials: {
            items: paginatedData,
            nextToken: null,
            scannedCount: filteredMockData.length
          }
        }
      };
      
      // Set state with response data
      setMaterials(mockResponse.data.listMaterials.items);
      setNextToken(mockResponse.data.listMaterials.nextToken);
      setTotalCount(mockResponse.data.listMaterials.scannedCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0); // Reset to first page when filter changes
  };
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    if (newPage * rowsPerPage >= materials.length) {
      // Load more data if needed
      fetchMaterials(nextToken);
    }
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchMaterials();
  };
  
  // Navigation handler
  const handleViewMaterial = (id) => {
    // In a real app, this would navigate to a material detail page
    // navigate(`/materials/${id}`);
    console.log(`View material: ${id}`);
  };
  
  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Material Type"
              variant="outlined"
              size="small"
              value={filters.materialType}
              onChange={(e) => handleFilterChange('materialType', e.target.value)}
            >
              {materialTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="System Type"
              variant="outlined"
              size="small"
              value={filters.systemType}
              onChange={(e) => handleFilterChange('systemType', e.target.value)}
            >
              {systemTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              variant="outlined"
              size="small"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Materials Table */}
      <Paper>
        {loading && materials.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : materials.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1">No materials found matching your criteria</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>System</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">QR</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id} hover>
                      <TableCell>{material.materialIdentifier || '-'}</TableCell>
                      <TableCell>{material.description}</TableCell>
                      <TableCell>{material.materialType}</TableCell>
                      <TableCell>{material.systemType}</TableCell>
                      <TableCell>
                        {material.locationLevel && material.locationZone 
                          ? `${material.locationLevel}, ${material.locationZone}`
                          : material.locationLevel || material.locationZone || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={material.status.replace(/_/g, ' ')}
                          color={statusColorMap[material.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View QR Code">
                          <IconButton size="small">
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewMaterial(material.id)}
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default MaterialList; 