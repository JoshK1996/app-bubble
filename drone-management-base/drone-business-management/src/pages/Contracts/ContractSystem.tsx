import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  SmartToy as AIIcon
} from '@mui/icons-material';

// Status types for contracts
type ContractStatus = 'Draft' | 'Pending Signature' | 'Active' | 'Expired' | 'Terminated';

// Contract interface
interface Contract {
  id: number;
  title: string;
  clientName: string;
  clientId: number;
  status: ContractStatus;
  createdDate: string;
  expiryDate: string;
  value: number;
  signedByClient: boolean;
  signedByCompany: boolean;
  templateUsed: string;
  aiGenerated: boolean;
  versions: number;
}

/**
 * Contract System page component with AI-powered contract generation
 */
const ContractSystem: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Sample contracts data
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: 1,
      title: 'Commercial Real Estate Photography Agreement',
      clientName: 'ABC Real Estate',
      clientId: 1,
      status: 'Active',
      createdDate: '2025-02-15',
      expiryDate: '2026-02-15',
      value: 12000,
      signedByClient: true,
      signedByCompany: true,
      templateUsed: 'Commercial Photography',
      aiGenerated: true,
      versions: 2
    },
    {
      id: 2,
      title: 'Wedding Videography Contract',
      clientName: 'David Wilson',
      clientId: 4,
      status: 'Expired',
      createdDate: '2024-04-10',
      expiryDate: '2024-05-30',
      value: 1800,
      signedByClient: true,
      signedByCompany: true,
      templateUsed: 'Event Videography',
      aiGenerated: false,
      versions: 1
    },
    {
      id: 3,
      title: 'City Infrastructure Mapping Service Agreement',
      clientName: 'City of Riverside',
      clientId: 2,
      status: 'Pending Signature',
      createdDate: '2025-03-20',
      expiryDate: '2025-09-20',
      value: 15000,
      signedByClient: false,
      signedByCompany: true,
      templateUsed: 'Government Service',
      aiGenerated: true,
      versions: 3
    },
    {
      id: 4,
      title: 'Conservation Drone Survey Agreement',
      clientName: 'Green Fields Foundation',
      clientId: 3,
      status: 'Draft',
      createdDate: '2025-03-25',
      expiryDate: '2025-12-31',
      value: 7500,
      signedByClient: false,
      signedByCompany: false,
      templateUsed: 'Environmental Survey',
      aiGenerated: true,
      versions: 1
    },
    {
      id: 5,
      title: 'Product Launch Promotional Video Contract',
      clientName: 'TechStart Inc.',
      clientId: 5,
      status: 'Draft',
      createdDate: '2025-03-26',
      expiryDate: '2025-06-26',
      value: 4500,
      signedByClient: false,
      signedByCompany: false,
      templateUsed: 'Marketing Video',
      aiGenerated: false,
      versions: 1
    }
  ]);
  
  // Tab handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Helper function to get status color
  const getStatusColor = (status: ContractStatus) => {
    switch(status) {
      case 'Draft': return 'default';
      case 'Pending Signature': return 'warning';
      case 'Active': return 'success';
      case 'Expired': return 'error';
      case 'Terminated': return 'error';
      default: return 'default';
    }
  };
  
  // Filter contracts based on tab
  const filteredContracts = () => {
    switch(tabValue) {
      case 0: // All
        return contracts;
      case 1: // Drafts
        return contracts.filter(contract => contract.status === 'Draft');
      case 2: // Pending Signature
        return contracts.filter(contract => contract.status === 'Pending Signature');
      case 3: // Active
        return contracts.filter(contract => contract.status === 'Active');
      case 4: // Expired/Terminated
        return contracts.filter(contract => 
          contract.status === 'Expired' || contract.status === 'Terminated'
        );
      default:
        return contracts;
    }
  };
  
  // Calculate signature status
  const getSignatureStatus = (contract: Contract) => {
    if (contract.signedByClient && contract.signedByCompany) {
      return 100;
    } else if (contract.signedByClient || contract.signedByCompany) {
      return 50;
    }
    return 0;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Contract System
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<AIIcon />}
            sx={{ mr: 2 }}
          >
            AI Generate
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
          >
            New Contract
          </Button>
        </Box>
      </Box>
      
      {/* Contract Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="text.secondary">
                  Total Contracts
                </Typography>
                <DescriptionIcon color="primary" />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                {contracts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="text.secondary">
                  Active Contracts
                </Typography>
                <DescriptionIcon color="success" />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                {contracts.filter(c => c.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="text.secondary">
                  Pending Signature
                </Typography>
                <DescriptionIcon color="warning" />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                {contracts.filter(c => c.status === 'Pending Signature').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="text.secondary">
                  Contract Value
                </Typography>
                <DescriptionIcon color="info" />
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                ${contracts.reduce((total, contract) => total + contract.value, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Contract Tabs and List */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="contract tabs">
            <Tab label="All Contracts" />
            <Tab label="Drafts" />
            <Tab label="Pending Signature" />
            <Tab label="Active" />
            <Tab label="Expired" />
          </Tabs>
        </Box>
        <CardContent>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contract Title</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Signatures</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContracts().map((contract) => (
                  <TableRow key={contract.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DescriptionIcon 
                          color={contract.aiGenerated ? "secondary" : "primary"} 
                          sx={{ mr: 1, fontSize: 20 }} 
                        />
                        <Typography>
                          {contract.title}
                          {contract.aiGenerated && (
                            <Chip 
                              label="AI" 
                              size="small" 
                              color="secondary"
                              sx={{ ml: 1, height: 18, fontSize: '0.625rem' }}
                            />
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{contract.clientName}</TableCell>
                    <TableCell>{new Date(contract.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(contract.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={contract.status} 
                        color={getStatusColor(contract.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${contract.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={getSignatureStatus(contract)} 
                          sx={{ width: '100%', mr: 1 }}
                        />
                        <Typography variant="caption">
                          {getSignatureStatus(contract)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      
      {/* Note: Additional functionality for contract creation, AI generation, 
       * digital signatures, and contract viewing will be implemented in 
       * separate dialogs and components */}
    </Box>
  );
};

export default ContractSystem;