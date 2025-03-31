import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  CircularProgress,
  Button,
  TextField,
  Grid,
  Alert,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  Lightbulb as InsightIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Help as HelpIcon,
  ContentCopy as CopyIcon,
  ThumbUp as ThumbUpIcon,
  Info as InfoIcon,
  SmartToy as AIIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  GppGood as GppGoodIcon,
  GppBad as GppBadIcon
} from '@mui/icons-material';

// Interface for contract analysis results
interface AnalysisResult {
  category: 'legal' | 'financial' | 'obligation' | 'risk' | 'opportunity' | 'missing';
  severity: 'high' | 'medium' | 'low' | 'info';
  message: string;
  suggestion?: string;
  location?: string;
  textToReplace?: string;
}

// Contract risk score interface
interface RiskScore {
  overall: number;
  categories: {
    legal: number;
    financial: number;
    obligation: number;
    risk: number;
  };
}

// Props for the ContractAnalyzer component
interface ContractAnalyzerProps {
  contractText: string;
  onUpdateContract?: (updatedText: string) => void;
  readOnly?: boolean;
}

/**
 * AI-powered Contract Analyzer component
 * Analyzes contract text for potential issues, missing clauses, and provides recommendations
 */
const ContractAnalyzer: React.FC<ContractAnalyzerProps> = ({ 
  contractText, 
  onUpdateContract, 
  readOnly = false 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [suggestedText, setSuggestedText] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState('');
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [selectedIssueResolution, setSelectedIssueResolution] = useState<'suggested' | 'custom' | 'ignore'>('suggested');

  // Function to analyze contract text
  const analyzeContract = () => {
    if (!contractText || contractText.trim() === '') return;
    
    setIsAnalyzing(true);
    setAnalysisResults([]);
    setSelectedResult(null);
    
    // Simulate AI analysis with a delay
    setTimeout(() => {
      // This is mock data - in a real implementation, this would be an API call to an AI service
      const mockResults: AnalysisResult[] = [
        {
          category: 'legal',
          severity: 'high',
          message: 'Missing liability clause',
          suggestion: 'Add a standard liability limitation clause to protect your business.',
          location: 'Section: General Terms',
          textToReplace: ''
        },
        {
          category: 'financial',
          severity: 'medium',
          message: 'Payment terms are vague',
          suggestion: 'Specify payment schedule, late payment penalties, and accepted payment methods.',
          location: 'Section: Compensation',
          textToReplace: 'Client shall pay Provider for services rendered.'
        },
        {
          category: 'obligation',
          severity: 'low',
          message: 'Deliverable timeline is not clearly defined',
          suggestion: 'Add specific delivery dates or timeframes for each deliverable.',
          location: 'Section: Scope of Services',
          textToReplace: 'Provider will deliver completed work to Client.'
        },
        {
          category: 'risk',
          severity: 'high',
          message: 'No cancellation policy',
          suggestion: 'Include a cancellation policy with appropriate notice periods and potential fees.',
          location: 'Section: Term',
          textToReplace: ''
        },
        {
          category: 'opportunity',
          severity: 'info',
          message: 'Consider adding upsell opportunities',
          suggestion: 'Include clause for additional services that may be required at standard rates.',
          location: 'Section: Scope of Services',
          textToReplace: ''
        },
        {
          category: 'missing',
          severity: 'medium',
          message: 'Confidentiality clause is missing',
          suggestion: 'Add a standard confidentiality clause to protect client information.',
          location: 'Document',
          textToReplace: ''
        }
      ];
      
      // Calculate risk score based on severity and category
      const calculateRiskScore = (): RiskScore => {
        // Base score starts at 100 (perfect)
        let baseScore = 100;
        
        // Category scores (each starts at 100)
        let legal = 100;
        let financial = 100;
        let obligation = 100;
        let risk = 100;
        
        // Deduct points based on severity
        mockResults.forEach(result => {
          let deduction = 0;
          
          switch (result.severity) {
            case 'high':
              deduction = 20;
              break;
            case 'medium':
              deduction = 10;
              break;
            case 'low':
              deduction = 5;
              break;
            case 'info':
              deduction = 0;
              break;
          }
          
          baseScore -= deduction;
          
          // Update category scores
          switch (result.category) {
            case 'legal':
              legal -= deduction * 1.5;
              break;
            case 'financial':
              financial -= deduction * 1.2;
              break;
            case 'obligation':
              obligation -= deduction;
              break;
            case 'risk':
              risk -= deduction * 1.3;
              break;
          }
        });
        
        return {
          overall: Math.max(0, Math.min(100, Math.round(baseScore))),
          categories: {
            legal: Math.max(0, Math.min(100, Math.round(legal))),
            financial: Math.max(0, Math.min(100, Math.round(financial))),
            obligation: Math.max(0, Math.min(100, Math.round(obligation))),
            risk: Math.max(0, Math.min(100, Math.round(risk)))
          }
        };
      };
      
      setAnalysisResults(mockResults);
      setRiskScore(calculateRiskScore());
      setIsAnalyzing(false);
    }, 2000);
  };

  // Get the color for severity chips
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  // Get the icon for category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'legal': return <WarningIcon color="error" />;
      case 'financial': return <InfoIcon color="primary" />;
      case 'obligation': return <CheckIcon color="action" />;
      case 'risk': return <WarningIcon color="warning" />;
      case 'opportunity': return <ThumbUpIcon color="success" />;
      case 'missing': return <HelpIcon color="disabled" />;
      default: return <InsightIcon />;
    }
  };

  // Get risk score color
  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  // Handle result selection
  const handleResultSelect = (result: AnalysisResult) => {
    setSelectedResult(result);
    
    // Generate suggested text based on the selected result
    if (result.category === 'legal' && result.message.includes('liability')) {
      setSuggestedText(
        "LIMITATION OF LIABILITY: In no event shall Provider be liable to Client for any indirect, special, consequential or punitive damages, including lost profits, arising out of or relating to this Agreement, regardless of the theory of liability, whether based in contract, tort, or otherwise. In no event shall Provider's aggregate liability exceed the total amount paid by Client to Provider under this Agreement."
      );
    } else if (result.category === 'financial' && result.message.includes('payment')) {
      setSuggestedText(
        "PAYMENT TERMS: Client shall pay Provider within 30 days of invoice date. All payments shall be made via bank transfer or other electronic payment method approved by Provider. Late payments shall incur a fee of 1.5% per month or the maximum rate permitted by law, whichever is less."
      );
    } else if (result.category === 'missing' && result.message.includes('confidentiality')) {
      setSuggestedText(
        "CONFIDENTIALITY: Each party shall maintain the confidentiality of all proprietary or confidential information disclosed by the other party and clearly identified as confidential ('Confidential Information') for a period of three (3) years following the termination of this Agreement. Neither party shall use the other party's Confidential Information except as necessary to perform its obligations under this Agreement."
      );
    } else if (result.category === 'risk' && result.message.includes('cancellation')) {
      setSuggestedText(
        "CANCELLATION POLICY: Either party may terminate this Agreement with 30 days written notice. In the event of cancellation by Client, Client shall pay Provider for all work completed up to the date of cancellation plus a cancellation fee equal to 25% of the remaining contract value, unless cancellation is due to Provider's material breach of this Agreement."
      );
    } else {
      setSuggestedText(
        `Suggested text for addressing "${result.message}": [Insert appropriate language here based on standard contract templates and legal requirements]`
      );
    }
    
    setEditedSuggestion(suggestedText);
    setHasCopied(false);
    setIsEditingText(false);
    setSelectedIssueResolution('suggested');
  };

  // Handle opening comparison dialog
  const handleOpenComparison = () => {
    setShowComparisonDialog(true);
  };

  // Handle closing comparison dialog
  const handleCloseComparison = () => {
    setShowComparisonDialog(false);
  };

  // Handle editing suggestion
  const handleEditSuggestion = () => {
    setEditedSuggestion(suggestedText);
    setIsEditingText(true);
  };

  // Handle saving edited suggestion
  const handleSaveEdit = () => {
    setSuggestedText(editedSuggestion);
    setIsEditingText(false);
    setSelectedIssueResolution('custom');
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditedSuggestion(suggestedText);
    setIsEditingText(false);
  };

  // Handle copying suggested text
  const handleCopySuggestion = () => {
    navigator.clipboard.writeText(suggestedText);
    setHasCopied(true);
    
    // Reset copied state after 3 seconds
    setTimeout(() => {
      setHasCopied(false);
    }, 3000);
  };

  // Handle updating contract with suggestion
  const handleApplySuggestion = () => {
    if (onUpdateContract && suggestedText) {
      onUpdateContract(suggestedText);
      
      // Show success state briefly
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 3000);
    }
  };

  // Handle resolution change
  const handleResolutionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIssueResolution(event.target.value as 'suggested' | 'custom' | 'ignore');
  };

  // Start analysis when contract text changes significantly
  useEffect(() => {
    if (contractText && contractText.length > 100) {
      analyzeContract();
    }
  }, []);

  return (
    <Box sx={{ mb: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AIIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            AI Contract Analysis
          </Typography>
          
          <Button 
            variant="outlined"
            size="small"
            onClick={analyzeContract}
            disabled={isAnalyzing || !contractText}
            startIcon={isAnalyzing ? <CircularProgress size={16} /> : <AIIcon />}
            sx={{ ml: 'auto' }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Contract'}
          </Button>
        </Box>
        
        {isAnalyzing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Analyzing contract for potential issues and recommendations...
            </Typography>
          </Box>
        ) : analysisResults.length > 0 ? (
          <Grid container spacing={2}>
            {/* Risk Score Card */}
            {riskScore && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {riskScore.overall >= 80 ? (
                          <GppGoodIcon sx={{ color: '#4caf50', mr: 1 }} />
                        ) : riskScore.overall >= 60 ? (
                          <SecurityIcon sx={{ color: '#ff9800', mr: 1 }} />
                        ) : (
                          <GppBadIcon sx={{ color: '#f44336', mr: 1 }} />
                        )}
                        <Typography variant="h6">
                          Contract Risk Score: {riskScore.overall}/100
                        </Typography>
                      </Box>
                      <Chip 
                        label={
                          riskScore.overall >= 80 ? "Low Risk" : 
                          riskScore.overall >= 60 ? "Medium Risk" : 
                          "High Risk"
                        } 
                        color={
                          riskScore.overall >= 80 ? "success" : 
                          riskScore.overall >= 60 ? "warning" : 
                          "error"
                        }
                      />
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Legal Protection</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={riskScore.categories.legal} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 1, 
                            my: 1,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getRiskScoreColor(riskScore.categories.legal)
                            }
                          }} 
                        />
                        <Typography variant="body2" align="right">{riskScore.categories.legal}%</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Financial Terms</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={riskScore.categories.financial} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 1, 
                            my: 1,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getRiskScoreColor(riskScore.categories.financial)
                            }
                          }} 
                        />
                        <Typography variant="body2" align="right">{riskScore.categories.financial}%</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Obligations</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={riskScore.categories.obligation} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 1, 
                            my: 1,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getRiskScoreColor(riskScore.categories.obligation)
                            }
                          }} 
                        />
                        <Typography variant="body2" align="right">{riskScore.categories.obligation}%</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Risk Mitigation</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={riskScore.categories.risk} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 1, 
                            my: 1,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getRiskScoreColor(riskScore.categories.risk)
                            }
                          }} 
                        />
                        <Typography variant="body2" align="right">{riskScore.categories.risk}%</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Analysis Results
              </Typography>
              <List dense sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {analysisResults.map((result, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      alignItems="flex-start"
                      button
                      selected={selectedResult === result}
                      onClick={() => handleResultSelect(result)}
                    >
                      <ListItemIcon>
                        {getCategoryIcon(result.category)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight={500}>
                              {result.message}
                            </Typography>
                            <Chip 
                              label={result.severity} 
                              size="small" 
                              color={getSeverityColor(result.severity) as any}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={result.location}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {selectedResult ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommendation
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {selectedResult.suggestion}
                  </Alert>
                  
                  <Box sx={{ mb: 2 }}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Resolution</FormLabel>
                      <RadioGroup
                        row
                        value={selectedIssueResolution}
                        onChange={handleResolutionChange}
                      >
                        <FormControlLabel 
                          value="suggested" 
                          control={<Radio size="small" />} 
                          label="Use suggested text" 
                        />
                        <FormControlLabel 
                          value="custom" 
                          control={<Radio size="small" />} 
                          label="Use custom text" 
                        />
                        <FormControlLabel 
                          value="ignore" 
                          control={<Radio size="small" />} 
                          label="Ignore issue" 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                  
                  {selectedIssueResolution !== 'ignore' && (
                    <>
                      {isEditingText ? (
                        <Box>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={editedSuggestion}
                            onChange={(e) => setEditedSuggestion(e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                            <Button 
                              size="small" 
                              startIcon={<CancelIcon />}
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained"
                              startIcon={<SaveIcon />}
                              onClick={handleSaveEdit}
                            >
                              Save Changes
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <Paper 
                            variant="outlined"
                            sx={{ 
                              p: 1.5, 
                              fontFamily: 'monospace', 
                              fontSize: '0.875rem',
                              bgcolor: 'action.hover',
                              mb: 2,
                              position: 'relative'
                            }}
                          >
                            {suggestedText}
                            {!readOnly && selectedIssueResolution === 'custom' && (
                              <Tooltip title="Edit suggested text">
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: 'background.paper'
                                  }}
                                  onClick={handleEditSuggestion}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Paper>

                          {selectedResult.textToReplace && (
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ mb: 1 }}
                              onClick={handleOpenComparison}
                            >
                              Compare with existing text
                            </Button>
                          )}
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<CopyIcon />}
                              onClick={handleCopySuggestion}
                              color={hasCopied ? 'success' : 'primary'}
                            >
                              {hasCopied ? 'Copied!' : 'Copy'}
                            </Button>
                            
                            {!readOnly && onUpdateContract && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={handleApplySuggestion}
                                disabled={hasCopied}
                              >
                                Apply to Contract
                              </Button>
                            )}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
                  <InsightIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" align="center">
                    Select an issue from the analysis results to view recommendations.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
            <InsightIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Click "Analyze Contract" to scan for potential issues and recommendations.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Comparison Dialog */}
      <Dialog
        open={showComparisonDialog}
        onClose={handleCloseComparison}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Compare Text Changes</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Current Text
              </Typography>
              <Paper 
                variant="outlined"
                sx={{ 
                  p: 1.5, 
                  fontFamily: 'monospace', 
                  fontSize: '0.875rem',
                  bgcolor: '#ffebee', // Light red background
                  mb: 2,
                  height: 200,
                  overflow: 'auto'
                }}
              >
                {selectedResult?.textToReplace || 'No existing text'}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Suggested Replacement
              </Typography>
              <Paper 
                variant="outlined"
                sx={{ 
                  p: 1.5, 
                  fontFamily: 'monospace', 
                  fontSize: '0.875rem',
                  bgcolor: '#e8f5e9', // Light green background
                  mb: 2,
                  height: 200,
                  overflow: 'auto'
                }}
              >
                {suggestedText}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComparison}>Close</Button>
          {!readOnly && onUpdateContract && (
            <Button
              variant="contained"
              onClick={() => {
                handleApplySuggestion();
                handleCloseComparison();
              }}
            >
              Apply Change
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractAnalyzer; 