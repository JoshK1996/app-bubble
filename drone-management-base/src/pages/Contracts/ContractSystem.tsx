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
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Tooltip,
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
  SmartToy as AIIcon,
  ContentCopy as CloneIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  TextSnippet as SnippetIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

// Import AI components
import { ContractGenerator, ContractAnalyzer, ContractClauseLibrary } from '../../components/Contracts/AI';

// Sample clients for enhanced selection
interface Client {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  industry?: string;
}

// Status types for contracts
type ContractStatus = 'Draft' | 'Pending Signature' | 'Active' | 'Expired' | 'Terminated';

// Contract template type
type ContractTemplate = {
  id: number;
  name: string;
  description: string;
  category: string;
  industry: string;
};

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
  content?: string;
  riskScore?: number;
}

/**
 * Contract System page component with AI-powered contract generation
 */
const ContractSystem: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isContractFormOpen, setIsContractFormOpen] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiProgress, setAIProgress] = useState(0);
  const [aiPrompt, setAIPrompt] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [generatedPreview, setGeneratedPreview] = useState('');
  
  // New state for enhanced AI features
  const [isAIEnhancedView, setIsAIEnhancedView] = useState(false);
  const [contractText, setContractText] = useState('');
  const [isClauseLibraryOpen, setIsClauseLibraryOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isViewingContract, setIsViewingContract] = useState(false);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  
  // Sample clients data
  const clients: Client[] = [
    { id: 1, name: 'ABC Real Estate', company: 'ABC Real Estate Corp', email: 'contact@abcrealestate.com', phone: '555-123-4567', industry: 'Real Estate' },
    { id: 2, name: 'City of Riverside', company: 'City of Riverside', email: 'planning@riverside.gov', phone: '555-987-6543', industry: 'Government' },
    { id: 3, name: 'Green Fields Foundation', company: 'Green Fields Foundation', email: 'info@greenfields.org', phone: '555-456-7890', industry: 'Environmental' },
    { id: 4, name: 'David Wilson', email: 'david.wilson@example.com', phone: '555-222-3333', industry: 'Individual' },
    { id: 5, name: 'TechStart Inc.', company: 'TechStart Inc.', email: 'projects@techstart.com', phone: '555-777-8888', industry: 'Technology' },
  ];
  
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
      versions: 2,
      riskScore: 82
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
      versions: 1,
      riskScore: 65
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
      versions: 3,
      riskScore: 93
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
      versions: 1,
      riskScore: 58
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
      versions: 1,
      riskScore: 45
    }
  ]);

  // Sample contract templates
  const contractTemplates: ContractTemplate[] = [
    { id: 1, name: 'Drone Photography Service', description: 'For commercial photography services', category: 'Photography', industry: 'Real Estate' },
    { id: 2, name: 'Aerial Surveillance Contract', description: 'For security and surveillance', category: 'Surveillance', industry: 'Security' },
    { id: 3, name: 'Agricultural Monitoring Agreement', description: 'For crop and field monitoring', category: 'Monitoring', industry: 'Agriculture' },
    { id: 4, name: 'Construction Progress Documentation', description: 'For construction site documentation', category: 'Documentation', industry: 'Construction' },
    { id: 5, name: 'Event Coverage Agreement', description: 'For event videography and photography', category: 'Events', industry: 'Entertainment' },
    { id: 6, name: 'Government Survey Agreement', description: 'For government infrastructure monitoring', category: 'Survey', industry: 'Government' },
  ];
  
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
  
  // Filter contracts based on search query and status filter
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchQuery === '' || 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.templateUsed.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Open AI generation dialog with prefilled client if exists
  const handleOpenAIDialog = (clientId?: number) => {
    setIsAIDialogOpen(true);
    setAIPrompt('');
    setGeneratedPreview('');

    if (clientId) {
      const selectedClient = clients.find(client => client.id === clientId);
      if (selectedClient) {
        setCurrentClient(selectedClient);
        setAIPrompt(`Create a comprehensive drone service agreement for ${selectedClient.name} that includes standard liability, payment, and delivery terms.`);
      }
    } else {
      setCurrentClient(null);
    }
  };

  // Handle contract generation
  const handleGenerateContract = (contractText: string, contractName: string) => {
    // In a real implementation, you would update your database
    const newContract: Contract = {
      id: contracts.length + 1,
      title: contractName || 'Untitled Contract',
      clientName: currentClient?.name || 'Unknown Client',
      clientId: currentClient?.id || 0,
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split('T')[0],
      value: 0,
      signedByClient: false,
      signedByCompany: false,
      templateUsed: 'AI Generated',
      aiGenerated: true,
      versions: 1,
      content: contractText,
      riskScore: Math.floor(Math.random() * (95 - 60) + 60) // Random score between 60-95 for demo
    };
    
    setContracts(prev => [newContract, ...prev]);
    setIsAIDialogOpen(false);
    setIsContractFormOpen(false);
    setGeneratedPreview('');
  };

  // Handle opening contract view
  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewingContract(true);
    
    // In a real app, you would load the contract content from the database
    setContractText(contract.content || 
      `# ${contract.title}\n\nAgreement between YOUR COMPANY NAME and ${contract.clientName}\n\nStart Date: ${contract.createdDate}\nEnd Date: ${contract.expiryDate}\n\n## Services\n\nDrone services as agreed upon by both parties.\n\n## Payment\n\nTotal contract value: $${contract.value}\n\n## Terms\n\nStandard terms and conditions apply.`
    );
  };

  // Handle contract analysis
  const handleAnalyzeContract = () => {
    setIsAnalyzerOpen(true);
  };

  // Handle contract update from analyzer
  const handleUpdateContract = (updatedText: string) => {
    setContractText(updatedText);
    
    // Update the contract with improved text and better risk score
    if (selectedContract) {
      const updatedContract = {
        ...selectedContract,
        content: updatedText,
        riskScore: Math.min(98, (selectedContract.riskScore || 50) + 10) // Improve risk score
      };
      
      setSelectedContract(updatedContract);
      setContracts(prev => prev.map(c => c.id === updatedContract.id ? updatedContract : c));
    }
  };

  // Handle adding a clause to the contract
  const handleAddClause = (clause: any) => {
    setContractText(prev => `${prev}\n\n${clause.text}`);
    setIsClauseLibraryOpen(false);
  };

  // Get the risk score color
  const getRiskScoreColor = (score?: number) => {
    if (!score) return '#757575'; // Gray for no score
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  // Render contract list with enhanced filtering and risk scores
  const renderContractList = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">Contract Management</Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<SnippetIcon />}
            onClick={() => setIsClauseLibraryOpen(true)}
            sx={{ mr: 1 }}
          >
            Clause Library
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AIIcon />}
            onClick={() => handleOpenAIDialog()}
            color="primary"
          >
            AI Generate Contract
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search contracts..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Pending Signature">Pending Signature</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
            <MenuItem value="Terminated">Terminated</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Contract Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell align="center">Risk Score</TableCell>
              <TableCell align="center">Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContracts.length > 0 ? (
              filteredContracts.map((contract) => (
                <TableRow 
                  key={contract.id}
                  sx={{ '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' } }}
                  onClick={() => handleViewContract(contract)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        {contract.title}
                        {contract.aiGenerated && (
                          <Chip 
                            icon={<AIIcon />} 
                            label="AI" 
                            size="small" 
                            sx={{ ml: 1 }}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{contract.clientName}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={contract.status} 
                      color={getStatusColor(contract.status)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">${contract.value.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          bgcolor: getRiskScoreColor(contract.riskScore),
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {contract.riskScore || '?'}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{contract.createdDate}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="View Contract">
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          handleViewContract(contract);
                        }}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No contracts found. Create a new contract or adjust your search filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Render contract view with analyzer
  const renderContractView = () => (
    <Box>
      {selectedContract && (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  setIsViewingContract(false);
                  setSelectedContract(null);
                  setIsAnalyzerOpen(false);
                }}
                sx={{ mr: 2 }}
              >
                Back to Contracts
              </Button>
              <Typography variant="h5" component="span">
                {selectedContract.title}
              </Typography>
            </Box>
            
            <Box>
              <Button
                variant="outlined"
                startIcon={<AIIcon />}
                onClick={handleAnalyzeContract}
                sx={{ mr: 1 }}
              >
                Analyze Contract
              </Button>
              <Button
                variant="outlined"
                startIcon={<SnippetIcon />}
                onClick={() => setIsClauseLibraryOpen(true)}
                sx={{ mr: 1 }}
              >
                Clause Library
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
              >
                Download
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={isAnalyzerOpen ? 6 : 12}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Contract Details</Typography>
                  <Chip 
                    label={selectedContract.status} 
                    color={getStatusColor(selectedContract.status)} 
                  />
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Client</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedContract.clientName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Created Date</Typography>
                    <Typography variant="body1">{selectedContract.createdDate}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body1">{selectedContract.expiryDate}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Value</Typography>
                    <Typography variant="body1">${selectedContract.value.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Signed Status</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        size="small" 
                        label="Client" 
                        color={selectedContract.signedByClient ? "success" : "default"}
                        icon={selectedContract.signedByClient ? <CheckIcon /> : <CloseIcon />}
                      />
                      <Chip 
                        size="small" 
                        label="Company" 
                        color={selectedContract.signedByCompany ? "success" : "default"}
                        icon={selectedContract.signedByCompany ? <CheckIcon /> : <CloseIcon />}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary">Risk Score</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          bgcolor: getRiskScoreColor(selectedContract.riskScore),
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          mr: 1
                        }}
                      >
                        {selectedContract.riskScore || '?'}
                      </Box>
                      <Typography variant="body1">
                        {selectedContract.riskScore 
                          ? selectedContract.riskScore >= 80 
                            ? 'Low Risk' 
                            : selectedContract.riskScore >= 60 
                              ? 'Medium Risk' 
                              : 'High Risk'
                          : 'Not Analyzed'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="h6" sx={{ mb: 2 }}>Contract Text</Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    maxHeight: '500px', 
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  {contractText}
                </Paper>
              </Paper>
            </Grid>
            
            {isAnalyzerOpen && (
              <Grid item xs={12} md={6}>
                <ContractAnalyzer 
                  contractText={contractText}
                  onUpdateContract={handleUpdateContract}
                />
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Contract Management System</Typography>
      
      {isViewingContract ? (
        renderContractView()
      ) : (
        renderContractList()
      )}
      
      {/* AI Contract Generator Dialog */}
      <Dialog
        open={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AIIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">AI Contract Generator</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {generatedPreview ? (
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Generated Contract Preview</Typography>
          ) : (
            <ContractGenerator
              clients={clients}
              onGeneratedContract={handleGenerateContract}
              prefilledPrompt={aiPrompt}
              prefilledVariables={currentClient ? {
                clientName: currentClient.name,
                startDate: new Date().toISOString().split('T')[0]
              } : {}}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Clause Library Dialog */}
      <Dialog
        open={isClauseLibraryOpen}
        onClose={() => setIsClauseLibraryOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SnippetIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Contract Clause Library</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <ContractClauseLibrary 
            onSelectClause={handleAddClause}
            allowEditing={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsClauseLibraryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractSystem; 