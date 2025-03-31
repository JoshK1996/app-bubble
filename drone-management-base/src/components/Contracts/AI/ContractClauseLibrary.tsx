import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Description as DescriptionIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmartToy as AIIcon,
  Refresh as RefreshIcon,
  TextSnippet as SnippetIcon
} from '@mui/icons-material';

// Define the contract clause interface
interface ContractClause {
  id: string;
  title: string;
  text: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  aiGenerated?: boolean;
  lastUsed?: string;
  complexity: 'Simple' | 'Standard' | 'Complex';
}

// Props for ContractClauseLibrary component
interface ContractClauseLibraryProps {
  onSelectClause?: (clause: ContractClause) => void;
  onGenerateCustomClause?: (prompt: string, category: string) => void;
  allowEditing?: boolean;
}

/**
 * Contract Clause Library Component
 * A searchable, filterable library of contract clauses and templates
 */
const ContractClauseLibrary: React.FC<ContractClauseLibraryProps> = ({
  onSelectClause,
  onGenerateCustomClause,
  allowEditing = true
}) => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('');
  const [expandedClause, setExpandedClause] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [clausePrompt, setClausePrompt] = useState('');
  const [promptCategory, setPromptCategory] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<ContractClause | null>(null);
  
  // Sample contract clauses
  const [clauses, setClauses] = useState<ContractClause[]>([
    {
      id: 'liability-1',
      title: 'Standard Liability Limitation',
      text: 'LIMITATION OF LIABILITY: In no event shall Provider be liable to Client for any indirect, special, consequential or punitive damages, including lost profits, arising out of or relating to this Agreement, regardless of the theory of liability, whether based in contract, tort, or otherwise. In no event shall Provider\'s aggregate liability exceed the total amount paid by Client to Provider under this Agreement.',
      category: 'Liability',
      tags: ['liability', 'limitation', 'damages'],
      isFavorite: true,
      lastUsed: '2025-03-10',
      complexity: 'Standard'
    },
    {
      id: 'payment-1',
      title: 'Standard Payment Terms',
      text: 'PAYMENT TERMS: Client shall pay Provider within thirty (30) days of invoice date. All payments shall be made via bank transfer or other electronic payment method approved by Provider. Late payments shall incur a fee of 1.5% per month or the maximum rate permitted by law, whichever is less. Provider reserves the right to suspend services until payment is received for any invoice more than fifteen (15) days past due.',
      category: 'Payment',
      tags: ['payment', 'invoice', 'terms'],
      isFavorite: false,
      lastUsed: '2025-03-15',
      complexity: 'Standard'
    },
    {
      id: 'confidentiality-1',
      title: 'Basic Confidentiality Clause',
      text: 'CONFIDENTIALITY: Each party shall maintain the confidentiality of all proprietary or confidential information disclosed by the other party and clearly identified as confidential ("Confidential Information") for a period of three (3) years following the termination of this Agreement. Neither party shall use the other party\'s Confidential Information except as necessary to perform its obligations under this Agreement.',
      category: 'Confidentiality',
      tags: ['confidentiality', 'proprietary', 'information'],
      isFavorite: false,
      lastUsed: '2025-02-28',
      complexity: 'Simple'
    },
    {
      id: 'intellectual-property-1',
      title: 'Drone Photography IP Rights',
      text: 'INTELLECTUAL PROPERTY RIGHTS: All photographs, videos, and other content captured by Provider ("Content") shall remain the intellectual property of Provider. Upon payment in full, Client is granted a non-exclusive, non-transferable license to use the Content for Client\'s business purposes. Client may not sell, license, or distribute the Content to third parties without Provider\'s written consent. Provider retains the right to use the Content in Provider\'s portfolio and marketing materials unless otherwise specified in writing.',
      category: 'Intellectual Property',
      tags: ['copyright', 'ownership', 'license'],
      isFavorite: true,
      lastUsed: '2025-03-20',
      complexity: 'Complex'
    },
    {
      id: 'termination-1',
      title: 'Standard Termination Clause',
      text: 'TERMINATION: Either party may terminate this Agreement with thirty (30) days written notice. In the event of termination, Client shall pay Provider for all services performed up to the date of termination. If Client terminates this Agreement other than for Provider\'s material breach, Client shall also pay a cancellation fee equal to 25% of the remaining contract value, unless otherwise specified herein.',
      category: 'Termination',
      tags: ['termination', 'cancellation', 'notice'],
      isFavorite: false,
      lastUsed: '2025-03-05',
      complexity: 'Standard'
    },
    {
      id: 'weather-1',
      title: 'Weather Contingency for Drone Operations',
      text: 'WEATHER CONTINGENCY: Drone operations are weather-dependent. Provider shall determine at its sole discretion whether weather conditions permit safe flight operations. If scheduled services cannot be performed due to inclement weather or unsafe flying conditions, the parties shall reschedule services to the next mutually available date without additional fees or penalties. Repeated weather cancellations extending beyond 30 days may require contract modification.',
      category: 'Operations',
      tags: ['weather', 'safety', 'rescheduling'],
      isFavorite: true,
      lastUsed: '2025-03-22',
      complexity: 'Standard'
    },
    {
      id: 'compliance-1',
      title: 'Regulatory Compliance Clause',
      text: 'REGULATORY COMPLIANCE: Provider shall perform all drone operations in compliance with Federal Aviation Administration (FAA) regulations, including but not limited to Part 107 of the Federal Aviation Regulations, and any applicable state and local laws. Provider shall maintain all necessary licenses, certifications, and permits required for commercial drone operations. Client acknowledges that regulatory restrictions may limit operations in certain airspaces or require additional authorizations that may affect scheduling.',
      category: 'Compliance',
      tags: ['FAA', 'regulations', 'permits'],
      isFavorite: false,
      lastUsed: '2025-02-15',
      complexity: 'Complex'
    },
    {
      id: 'insurance-1',
      title: 'Insurance Requirements',
      text: 'INSURANCE: Provider shall maintain liability insurance with coverage appropriate for the drone services provided under this Agreement. Upon Client\'s request, Provider shall furnish certificates of insurance evidencing such coverage. Client shall be responsible for insurance coverage of its own property and personnel during drone operations.',
      category: 'Insurance',
      tags: ['liability', 'coverage', 'certificate'],
      isFavorite: false,
      lastUsed: '2025-01-20',
      complexity: 'Simple'
    },
    {
      id: 'delivery-1',
      title: 'Deliverables and Acceptance',
      text: 'DELIVERABLES AND ACCEPTANCE: Provider shall deliver all work products in the format specified in the Statement of Work. Client shall have five (5) business days from delivery to inspect and accept the deliverables or provide specific written notice of deficiencies. Deliverables shall be deemed accepted if Client fails to provide notice within the review period. Provider shall correct legitimate deficiencies within a reasonable timeframe at no additional cost.',
      category: 'Deliverables',
      tags: ['acceptance', 'review', 'deficiencies'],
      isFavorite: false,
      lastUsed: '2025-03-01',
      complexity: 'Standard'
    },
    {
      id: 'force-majeure-1',
      title: 'Force Majeure Clause',
      text: 'FORCE MAJEURE: Neither party shall be liable for delays or failures in performance resulting from causes beyond its reasonable control, including but not limited to acts of God, natural disasters, pandemic, strikes, lockouts, riots, acts of war, epidemics, government regulations superimposed after the fact, fire, power failures, or communication line failures. The affected party shall notify the other party promptly of the occurrence and its estimated duration.',
      category: 'General',
      tags: ['force majeure', 'delay', 'circumstances'],
      isFavorite: false,
      aiGenerated: true,
      lastUsed: '2025-02-10',
      complexity: 'Standard'
    }
  ]);
  
  // Available categories
  const categories = Array.from(new Set(clauses.map(clause => clause.category)));
  
  // Toggle clause expansion
  const toggleClauseExpansion = (clauseId: string) => {
    setExpandedClause(expandedClause === clauseId ? null : clauseId);
  };
  
  // Toggle favorite status
  const toggleFavorite = (clauseId: string) => {
    setClauses(prevClauses => 
      prevClauses.map(clause => 
        clause.id === clauseId 
          ? { ...clause, isFavorite: !clause.isFavorite } 
          : clause
      )
    );
  };
  
  // Handle category filter change
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };
  
  // Handle complexity filter change
  const handleComplexityChange = (event: SelectChangeEvent) => {
    setSelectedComplexity(event.target.value);
  };
  
  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Copy clause text to clipboard
  const handleCopyClause = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  // Select a clause and pass it to parent component
  const handleSelectClause = (clause: ContractClause) => {
    if (onSelectClause) {
      onSelectClause(clause);
    }
  };
  
  // Open the custom clause prompt dialog
  const handleOpenPromptDialog = () => {
    setPromptDialogOpen(true);
    setClausePrompt('');
    setPromptCategory('');
  };
  
  // Close the custom clause prompt dialog
  const handleClosePromptDialog = () => {
    setPromptDialogOpen(false);
  };
  
  // Handle custom clause generation
  const handleGenerateCustomClause = () => {
    if (!clausePrompt) return;
    
    setIsGenerating(true);
    
    // In a real implementation, you would call an AI service here
    setTimeout(() => {
      if (onGenerateCustomClause) {
        onGenerateCustomClause(clausePrompt, promptCategory);
      }
      
      // Simulate generating a new clause
      const newClause: ContractClause = {
        id: `custom-${Date.now()}`,
        title: clausePrompt.split(' ').slice(0, 5).join(' ') + '...',
        text: `Custom clause based on: "${clausePrompt}"\n\nThis would be AI-generated text tailored to the specific requirements provided in the prompt. It would be formatted as a proper legal clause with appropriate language and structure.`,
        category: promptCategory || 'Custom',
        tags: clausePrompt.split(' ').filter(word => word.length > 5).slice(0, 3),
        isFavorite: false,
        aiGenerated: true,
        lastUsed: new Date().toISOString().split('T')[0],
        complexity: 'Standard'
      };
      
      setClauses(prev => [newClause, ...prev]);
      setIsGenerating(false);
      setPromptDialogOpen(false);
    }, 2000);
  };
  
  // Open edit dialog for a clause
  const handleEditClause = (clause: ContractClause) => {
    setEditingClause({ ...clause });
    setEditDialogOpen(true);
  };
  
  // Close edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingClause(null);
  };
  
  // Save edited clause
  const handleSaveEditedClause = () => {
    if (!editingClause) return;
    
    setClauses(prev => 
      prev.map(clause => 
        clause.id === editingClause.id ? editingClause : clause
      )
    );
    
    setEditDialogOpen(false);
    setEditingClause(null);
  };
  
  // Delete a clause
  const handleDeleteClause = (clauseId: string) => {
    setClauses(prev => prev.filter(clause => clause.id !== clauseId));
  };

  // Get color for complexity
  const getComplexityColor = (complexity: string) => {
    switch(complexity) {
      case 'Simple': return 'success';
      case 'Standard': return 'primary';
      case 'Complex': return 'warning';
      default: return 'default';
    }
  };
  
  // Filter clauses based on search, category, and complexity
  const filteredClauses = clauses.filter(clause => {
    const matchesSearch = 
      searchQuery === '' || 
      clause.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      clause.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || clause.category === selectedCategory;
    const matchesComplexity = 
      selectedComplexity === '' || 
      clause.complexity === selectedComplexity;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });
  
  // Handle tag click to filter by tag
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };
  
  // Get all unique tags from clauses
  const getAllTags = () => {
    const allTags = new Set<string>();
    
    clauses.forEach(clause => {
      clause.tags.forEach(tag => {
        allTags.add(tag);
      });
    });
    
    return Array.from(allTags).sort();
  };
  
  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SnippetIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Contract Clause Library
          </Typography>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Search Clauses"
              value={searchQuery}
              onChange={handleSearchChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Complexity</InputLabel>
              <Select
                value={selectedComplexity}
                onChange={handleComplexityChange}
                label="Complexity"
              >
                <MenuItem value="">All Complexity Levels</MenuItem>
                <MenuItem value="Simple">Simple</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Complex">Complex</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Display common tags for filtering */}
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
            Popular Tags:
          </Typography>
          {getAllTags().slice(0, 10).map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => handleTagClick(tag)}
              clickable
              color={searchQuery === tag ? "primary" : "default"}
              variant={searchQuery === tag ? "filled" : "outlined"}
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
          {searchQuery && (
            <Chip
              label="Clear Filter"
              size="small"
              onClick={() => setSearchQuery('')}
              color="secondary"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1">
            {filteredClauses.length} Clauses Available
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={handleOpenPromptDialog}
          >
            Generate Custom Clause
          </Button>
        </Box>
        
        <List sx={{ bgcolor: 'background.paper' }}>
          {filteredClauses.length > 0 ? (
            filteredClauses.map((clause) => (
              <React.Fragment key={clause.id}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => toggleClauseExpansion(clause.id)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(clause.id);
                      }}
                    >
                      {clause.isFavorite ? (
                        <StarIcon color="warning" />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <DescriptionIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ mr: 1 }}>
                          {clause.title}
                        </Typography>
                        {clause.aiGenerated && (
                          <Chip 
                            label="AI Generated" 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            icon={<AIIcon fontSize="small" />}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          label={clause.category} 
                          size="small" 
                          sx={{ mr: 0.5 }}
                        />
                        <Chip 
                          label={clause.complexity} 
                          size="small"
                          color={getComplexityColor(clause.complexity) as any}
                          sx={{ mr: 0.5 }}
                        />
                        {clause.tags.map(tag => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 0.5 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagClick(tag);
                            }}
                            clickable
                          />
                        ))}
                      </Box>
                    }
                  />
                  {expandedClause === clause.id ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
                
                <Collapse in={expandedClause === clause.id} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 2, pl: 9, pr: 7, bgcolor: 'action.hover' }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      {clause.text}
                    </Paper>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {allowEditing && (
                        <>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClause(clause);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClause(clause.id);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      <Button
                        size="small"
                        startIcon={<CopyIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyClause(clause.text);
                        }}
                      >
                        Copy
                      </Button>
                      {onSelectClause && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectClause(clause);
                          }}
                        >
                          Use Clause
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Collapse>
                <Divider component="li" />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary="No matching clauses found" 
                secondary="Try adjusting your search criteria or filters"
              />
            </ListItem>
          )}
        </List>
      </Paper>
      
      {/* Generate Custom Clause Dialog */}
      <Dialog 
        open={promptDialogOpen} 
        onClose={handleClosePromptDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AIIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">Generate Custom Clause</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Describe the clause you need
              </Typography>
              <TextField
                label="Clause Requirements"
                placeholder="E.g., a data ownership clause that ensures the client owns all raw data but we retain rights to use processed data for marketing"
                multiline
                rows={4}
                fullWidth
                value={clausePrompt}
                onChange={(e) => setClausePrompt(e.target.value)}
                disabled={isGenerating}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Clause Category</InputLabel>
                <Select
                  value={promptCategory}
                  onChange={(e) => setPromptCategory(e.target.value)}
                  label="Clause Category"
                  disabled={isGenerating}
                >
                  <MenuItem value="">- Select Category -</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                  <MenuItem value="Custom">Custom Category</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePromptDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={isGenerating ? <CircularProgress size={20} /> : <AIIcon />}
            onClick={handleGenerateCustomClause}
            disabled={!clausePrompt || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Clause'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Clause Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">Edit Clause</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editingClause && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Clause Title"
                  fullWidth
                  value={editingClause.title}
                  onChange={(e) => setEditingClause({
                    ...editingClause,
                    title: e.target.value
                  })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editingClause.category}
                    label="Category"
                    onChange={(e) => setEditingClause({
                      ...editingClause,
                      category: e.target.value
                    })}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                    <MenuItem value="Custom">Custom Category</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Complexity</InputLabel>
                  <Select
                    value={editingClause.complexity}
                    label="Complexity"
                    onChange={(e) => setEditingClause({
                      ...editingClause,
                      complexity: e.target.value as 'Simple' | 'Standard' | 'Complex'
                    })}
                  >
                    <MenuItem value="Simple">Simple</MenuItem>
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Complex">Complex</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Tags (comma separated)"
                  fullWidth
                  value={editingClause.tags.join(', ')}
                  onChange={(e) => setEditingClause({
                    ...editingClause,
                    tags: e.target.value.split(',').map(tag => tag.trim())
                  })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Clause Text"
                  multiline
                  rows={8}
                  fullWidth
                  value={editingClause.text}
                  onChange={(e) => setEditingClause({
                    ...editingClause,
                    text: e.target.value
                  })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveEditedClause}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractClauseLibrary; 