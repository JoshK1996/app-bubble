import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  LinearProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  SelectChangeEvent,
  useTheme,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Description as DocumentIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  SaveAlt as SaveDraftIcon,
  Print as PrintIcon,
  Person as ClientIcon,
  PictureAsPdf as PdfIcon,
  FormatColorText as FormatTextIcon,
  Palette as PaletteIcon,
  FormatSize as FormatSizeIcon
} from '@mui/icons-material';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

// Template types for contract generation
export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  complexity: 'Simple' | 'Standard' | 'Complex';
}

// Client interface for autocomplete
interface Client {
  id: number;
  name: string;
  company?: string;
  email?: string;
  industry?: string;
}

// Contract variable to be filled in during generation
export interface ContractVariable {
  key: string;
  label: string;
  value: string;
  required: boolean;
  type: 'text' | 'date' | 'number' | 'selection';
  options?: string[];
}

// Styled Paper for documents
const DocumentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  fontFamily: 'Georgia, serif',
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#333',
  position: 'relative',
  '& h1, & h2, & h3, & h4': {
    fontFamily: 'Arial, sans-serif',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  '& h1': {
    fontSize: '24px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  '& h2': {
    fontSize: '20px',
    marginTop: theme.spacing(3),
  },
  '& h3': {
    fontSize: '18px',
  },
  '& p': {
    marginBottom: theme.spacing(2),
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  '& strong': {
    fontWeight: 'bold',
  }
}));

// Props for ContractGenerator component
interface ContractGeneratorProps {
  templates?: ContractTemplate[];
  onGeneratedContract?: (contractText: string, contractName: string) => void;
  prefilledPrompt?: string;
  prefilledVariables?: Record<string, string>;
  clients?: Client[];
}

/**
 * AI-powered Contract Generator component
 * Generates contracts based on templates and custom requirements
 */
const ContractGenerator: React.FC<ContractGeneratorProps> = ({
  templates = [],
  onGeneratedContract,
  prefilledPrompt = '',
  prefilledVariables = {},
  clients = []
}) => {
  const theme = useTheme();
  
  // Sample clients if none provided
  const defaultClients: Client[] = [
    { id: 1, name: 'ABC Real Estate', company: 'ABC Real Estate Corp', email: 'contact@abcrealestate.com', industry: 'Real Estate' },
    { id: 2, name: 'City of Riverside', company: 'City of Riverside', email: 'planning@riverside.gov', industry: 'Government' },
    { id: 3, name: 'Green Fields Foundation', company: 'Green Fields Foundation', email: 'info@greenfields.org', industry: 'Environmental' },
    { id: 4, name: 'David Wilson', email: 'david.wilson@example.com', industry: 'Individual' },
    { id: 5, name: 'TechStart Inc.', company: 'TechStart Inc.', email: 'projects@techstart.com', industry: 'Technology' },
  ];
  
  // Default templates if none provided
  const defaultTemplates: ContractTemplate[] = [
    {
      id: 'aerial-photo',
      name: 'Aerial Photography Agreement',
      description: 'Standard agreement for drone photography services',
      category: 'Photography',
      industry: 'Real Estate',
      complexity: 'Standard'
    },
    {
      id: 'survey-mapping',
      name: 'Drone Survey & Mapping Contract',
      description: 'Technical contract for surveying and mapping services',
      category: 'Surveying',
      industry: 'Construction',
      complexity: 'Complex'
    },
    {
      id: 'event-coverage',
      name: 'Event Coverage Agreement',
      description: 'Simple contract for drone event photography/videography',
      category: 'Event Coverage',
      industry: 'Entertainment',
      complexity: 'Simple'
    },
    {
      id: 'inspection',
      name: 'Infrastructure Inspection Contract',
      description: 'Complex contract for industrial inspections',
      category: 'Inspection',
      industry: 'Industrial',
      complexity: 'Complex'
    },
    {
      id: 'agricultural',
      name: 'Agricultural Monitoring Agreement',
      description: 'Specialized contract for crop monitoring services',
      category: 'Monitoring',
      industry: 'Agriculture',
      complexity: 'Standard'
    }
  ];

  // States
  const [availableTemplates, setAvailableTemplates] = useState<ContractTemplate[]>(
    templates.length > 0 ? templates : defaultTemplates
  );
  const [availableClients, setAvailableClients] = useState<Client[]>(
    clients.length > 0 ? clients : defaultClients
  );
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState(prefilledPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContract, setGeneratedContract] = useState('');
  const [contractName, setContractName] = useState('');
  const [contractVariables, setContractVariables] = useState<ContractVariable[]>([]);
  const [showVariablesForm, setShowVariablesForm] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showFormatOptions, setShowFormatOptions] = useState(false);
  const [documentFormat, setDocumentFormat] = useState<'plain' | 'professional' | 'formal'>('professional');
  const [documentColor, setDocumentColor] = useState<'blue' | 'green' | 'purple' | 'gray'>('blue');
  const [documentFontSize, setDocumentFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Initialize with prefilled variables if any
  useEffect(() => {
    if (Object.keys(prefilledVariables).length > 0) {
      const initialVariables = Object.keys(prefilledVariables).map(key => ({
        key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: prefilledVariables[key],
        required: true,
        type: 'text' as 'text' | 'date' | 'number' | 'selection'
      }));
      
      setContractVariables(initialVariables);
      setShowVariablesForm(true);
    }
    
    if (prefilledPrompt) {
      setCustomPrompt(prefilledPrompt);
    }
  }, [prefilledPrompt, prefilledVariables]);

  // Handle template selection with recommendations based on client industry
  const handleTemplateChange = (event: SelectChangeEvent) => {
    const templateId = event.target.value;
    setSelectedTemplate(templateId);
    
    // Generate default variables based on selected template
    if (templateId) {
      const selectedTemplateObj = availableTemplates.find(t => t.id === templateId);
      
      // Sample variables based on template type
      let defaultVariables: ContractVariable[] = [
        { key: 'clientName', label: 'Client Name', value: selectedClient?.name || '', required: true, type: 'text' },
        { key: 'startDate', label: 'Start Date', value: new Date().toISOString().split('T')[0], required: true, type: 'date' },
        { key: 'endDate', label: 'End Date', value: '', required: true, type: 'date' },
        { key: 'contractValue', label: 'Contract Value ($)', value: '', required: true, type: 'number' }
      ];
      
      if (selectedTemplateObj?.category === 'Photography') {
        defaultVariables = [
          ...defaultVariables,
          { key: 'numberOfLocations', label: 'Number of Locations', value: '', required: true, type: 'number' },
          { key: 'deliverableFormat', label: 'Deliverable Format', value: '', required: true, type: 'selection', options: ['Digital Files', 'Prints', 'Both'] },
          { key: 'editingIncluded', label: 'Editing Included', value: 'Yes', required: false, type: 'selection', options: ['Yes', 'No', 'Additional Fee'] }
        ];
      } else if (selectedTemplateObj?.category === 'Surveying') {
        defaultVariables = [
          ...defaultVariables,
          { key: 'siteArea', label: 'Site Area (acres)', value: '', required: true, type: 'number' },
          { key: 'deliverableFormat', label: 'Deliverable Format', value: '', required: true, type: 'selection', options: ['CAD Files', '3D Model', 'Orthomosaic', 'Full Package'] },
          { key: 'accuracy', label: 'Required Accuracy', value: '', required: true, type: 'selection', options: ['Low', 'Medium', 'High'] }
        ];
      }
      
      // Apply any prefilled values
      defaultVariables = defaultVariables.map(variable => ({
        ...variable,
        value: prefilledVariables[variable.key] || variable.value
      }));
      
      setContractVariables(defaultVariables);
      setShowVariablesForm(true);
      
      // Generate default contract name with selected client if available
      if (selectedTemplateObj) {
        const clientPart = selectedClient ? ` - ${selectedClient.name}` : '';
        setContractName(`${selectedTemplateObj.name}${clientPart} - ${new Date().toLocaleDateString()}`);
      }
    } else {
      setShowVariablesForm(false);
    }
  };

  // Handle client selection
  const handleClientSelect = (event: React.SyntheticEvent, newValue: Client | null) => {
    setSelectedClient(newValue);
    
    if (newValue) {
      // Update client name variable if it exists
      setContractVariables(prevVars => 
        prevVars.map(v => v.key === 'clientName' ? { ...v, value: newValue.name } : v)
      );
      
      // Update contract name if template is selected
      if (selectedTemplate) {
        const selectedTemplateObj = availableTemplates.find(t => t.id === selectedTemplate);
        if (selectedTemplateObj) {
          setContractName(`${selectedTemplateObj.name} - ${newValue.name} - ${new Date().toLocaleDateString()}`);
        }
      }
      
      // Recommend template based on client industry if available
      if (newValue.industry && !selectedTemplate) {
        const recommendedTemplate = availableTemplates.find(t => t.industry === newValue.industry);
        if (recommendedTemplate) {
          setSelectedTemplate(recommendedTemplate.id);
          handleTemplateChange({ target: { value: recommendedTemplate.id } } as SelectChangeEvent);
        }
      }
    }
  };

  // Update variable value
  const handleVariableChange = (key: string, value: string) => {
    setContractVariables(prevVars => 
      prevVars.map(v => v.key === key ? { ...v, value } : v)
    );
    setIsDraftSaved(false);
  };

  // Calculate contract duration
  const calculateDuration = () => {
    const startDate = contractVariables.find(v => v.key === 'startDate')?.value;
    const endDate = contractVariables.find(v => v.key === 'endDate')?.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return `Duration: ${diffDays} days`;
    }
    
    return null;
  };

  // Generate the contract
  const generateContract = () => {
    if ((!selectedTemplate && !customPrompt) || isGenerating) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedContract('');
    
    // Create progress simulation
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 250);
    
    // Simulate contract generation after delay
    setTimeout(() => {
      clearInterval(interval);
      setGenerationProgress(100);
      
      // Generate based on template and variables
      const selectedTemplateObj = availableTemplates.find(t => t.id === selectedTemplate);
      const variablesText = contractVariables.reduce((acc, v) => {
        if (v.value) {
          return `${acc}${v.key}: ${v.value}\n`;
        }
        return acc;
      }, '');
      
      // Generate contract based on template type
      let generatedText = '';
      
      if (selectedTemplateObj?.id === 'aerial-photo') {
        const clientName = contractVariables.find(v => v.key === 'clientName')?.value || '[CLIENT NAME]';
        const startDate = contractVariables.find(v => v.key === 'startDate')?.value || '[START DATE]';
        const contractValue = contractVariables.find(v => v.key === 'contractValue')?.value || '[CONTRACT VALUE]';
        const numLocations = contractVariables.find(v => v.key === 'numberOfLocations')?.value || '[NUMBER OF LOCATIONS]';
        
        generatedText = `# AERIAL PHOTOGRAPHY SERVICES AGREEMENT

## PARTIES
This Aerial Photography Services Agreement (the "Agreement") is entered into as of ${startDate} by and between:

**PROVIDER**: [YOUR COMPANY NAME], a drone service provider ("Provider")
**CLIENT**: ${clientName} ("Client")

## SCOPE OF SERVICES
Provider agrees to provide the following drone photography services:
- Aerial photography of ${numLocations} location(s) as specified in Attachment A
- Delivery of processed digital images in high-resolution format
- One revision round for edited photos

## COMPENSATION
Client agrees to pay Provider the sum of $${contractValue} for the Services outlined in this Agreement according to the following schedule:
- 50% deposit due upon signing this Agreement
- 50% balance due upon delivery of final images

## TERM
This Agreement shall commence on the date of signing and continue until all deliverables have been provided and accepted by Client, unless terminated earlier in accordance with this Agreement.

## INTELLECTUAL PROPERTY
Provider shall retain copyright ownership of all images created pursuant to this Agreement. Client is granted a non-exclusive, perpetual license to use the images for their business purposes. Client may not resell or redistribute the images without Provider's written permission.

## WEATHER CONTINGENCY
In the event of unsafe flying conditions as determined by Provider, the shoot will be rescheduled to the next mutually available date without penalty.

## LIABILITY LIMITATION
In no event shall Provider be liable for any indirect, special, consequential or punitive damages arising out of this Agreement.

## SIGNATURES

________________________
[YOUR COMPANY NAME], Provider

________________________
${clientName}, Client`;
      } else if (selectedTemplateObj?.id === 'survey-mapping') {
        const clientName = contractVariables.find(v => v.key === 'clientName')?.value || '[CLIENT NAME]';
        const startDate = contractVariables.find(v => v.key === 'startDate')?.value || '[START DATE]';
        const endDate = contractVariables.find(v => v.key === 'endDate')?.value || '[END DATE]';
        const contractValue = contractVariables.find(v => v.key === 'contractValue')?.value || '[CONTRACT VALUE]';
        const siteArea = contractVariables.find(v => v.key === 'siteArea')?.value || '[SITE AREA]';
        const deliverableFormat = contractVariables.find(v => v.key === 'deliverableFormat')?.value || '[DELIVERABLE FORMAT]';
        
        generatedText = `# DRONE SURVEY & MAPPING SERVICES AGREEMENT

## PARTIES
This Drone Survey & Mapping Services Agreement (the "Agreement") is entered into as of ${startDate} by and between:

**PROVIDER**: [YOUR COMPANY NAME], a professional drone survey provider ("Provider")
**CLIENT**: ${clientName} ("Client")

## SCOPE OF SERVICES
Provider agrees to provide the following drone survey and mapping services:
- Aerial survey of approximately ${siteArea} acres as specified in Attachment A
- Data processing and creation of deliverables in ${deliverableFormat} format
- Delivery of all raw and processed data files
- One consultation session to review deliverables

## TECHNICAL SPECIFICATIONS
- Ground sampling distance: 2.5 cm/pixel or better
- Horizontal accuracy: +/- 10 cm
- Vertical accuracy: +/- 15 cm
- Survey control points will be established according to industry standards

## COMPENSATION
Client agrees to pay Provider the sum of $${contractValue} for the Services outlined in this Agreement according to the following schedule:
- 40% deposit due upon signing this Agreement
- 30% due upon completion of field work
- 30% balance due upon delivery of final deliverables

## TERM
This Agreement shall commence on ${startDate} and continue until ${endDate}, unless terminated earlier in accordance with this Agreement.

## DATA OWNERSHIP
Client shall own all processed data and deliverables created pursuant to this Agreement. Provider retains the right to use the data for portfolio and marketing purposes with Client's written approval.

## COMPLIANCE
Provider shall obtain all necessary permits and authorizations for drone operations in accordance with applicable FAA regulations and local laws.

## LIABILITY LIMITATION
Provider's total liability under this Agreement shall not exceed the total amount paid by Client to Provider.

## SIGNATURES

________________________
[YOUR COMPANY NAME], Provider

________________________
${clientName}, Client`;
      } else if (customPrompt) {
        // Generate from custom prompt
        generatedText = `# CUSTOM DRONE SERVICES AGREEMENT
Based on: "${customPrompt}"

## PARTIES
This Drone Services Agreement (the "Agreement") is entered into as of [DATE] by and between:

**PROVIDER**: [YOUR COMPANY NAME], a drone service provider ("Provider")
**CLIENT**: ${selectedClient?.name || '[CLIENT NAME]'} ("Client")

## SCOPE OF SERVICES
Provider agrees to provide drone services as described below:
${customPrompt}

## COMPENSATION
Client agrees to pay Provider the sum of $[AMOUNT] for the Services outlined in this Agreement according to the following schedule:
- 50% deposit due upon signing this Agreement
- 50% balance due upon completion of services

## TERM
This Agreement shall commence on the date of signing and continue until all services have been provided, unless terminated earlier in accordance with this Agreement.

## INTELLECTUAL PROPERTY
[INTELLECTUAL PROPERTY TERMS BASED ON PROJECT TYPE]

## COMPLIANCE
Provider shall comply with all applicable laws and regulations related to drone operations.

## LIABILITY LIMITATION
In no event shall Provider be liable for any indirect, special, consequential or punitive damages arising out of this Agreement.

## SIGNATURES

________________________
[YOUR COMPANY NAME], Provider

________________________
${selectedClient?.name || '[CLIENT NAME]'}, Client

---
Note: This is an AI-generated contract template. Review with legal counsel before use.`;
      } else {
        // Generic contract
        generatedText = `# DRONE SERVICES AGREEMENT

## PARTIES
This Drone Services Agreement (the "Agreement") is entered into as of [DATE] by and between:

**PROVIDER**: [YOUR COMPANY NAME], a drone service provider ("Provider")
**CLIENT**: ${selectedClient?.name || '[CLIENT NAME]'} ("Client")

## SCOPE OF SERVICES
Provider agrees to provide the following drone services:
- [DESCRIBE SERVICES]
- [DELIVERABLES]

## COMPENSATION
Client agrees to pay Provider the sum of $[AMOUNT] for the Services outlined in this Agreement.

## TERM
This Agreement shall commence on [START DATE] and continue until [END DATE], unless terminated earlier.

## INTELLECTUAL PROPERTY
[INTELLECTUAL PROPERTY TERMS]

## LIABILITY LIMITATION
In no event shall Provider be liable for any indirect, special, consequential or punitive damages arising out of this Agreement.

## SIGNATURES

________________________
[YOUR COMPANY NAME], Provider

________________________
${selectedClient?.name || '[CLIENT NAME]'}, Client

---
Note: This is an AI-generated contract template. Review with legal counsel before use.`;
      }
      
      // Add variable information at the end
      if (variablesText && !customPrompt) {
        generatedText += `\n\n---\nGENERATION VARIABLES:\n${variablesText}`;
      }
      
      setGeneratedContract(generatedText);
      setIsGenerating(false);
      
      // Notify parent component if callback provided
      if (onGeneratedContract) {
        onGeneratedContract(generatedText, contractName);
      }
    }, 3000);
  };

  // Save draft contract to localStorage
  const handleSaveDraft = () => {
    const draft = {
      selectedTemplate,
      customPrompt,
      contractVariables,
      contractName,
      selectedClient,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('contractDraft', JSON.stringify(draft));
    setIsDraftSaved(true);
    
    // Reset saved status after 3 seconds
    setTimeout(() => {
      setIsDraftSaved(false);
    }, 3000);
  };

  // Load draft from localStorage
  const handleLoadDraft = () => {
    const savedDraft = localStorage.getItem('contractDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setSelectedTemplate(draft.selectedTemplate);
      setCustomPrompt(draft.customPrompt);
      setContractVariables(draft.contractVariables);
      setContractName(draft.contractName);
      setSelectedClient(draft.selectedClient);
      setShowVariablesForm(draft.contractVariables.length > 0);
    }
  };

  // Toggle print view
  const togglePrintView = () => {
    setShowPrintView(!showPrintView);
  };

  // Handle download contract
  const handleDownloadContract = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContract], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${contractName || 'drone-contract'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle copying contract to clipboard
  const handleCopyContract = () => {
    navigator.clipboard.writeText(generatedContract);
  };

  // Reset the form
  const handleReset = () => {
    setSelectedTemplate('');
    setCustomPrompt('');
    setGeneratedContract('');
    setContractVariables([]);
    setShowVariablesForm(false);
    setContractName('');
    setSelectedClient(null);
    setShowPrintView(false);
  };

  // Check if localStorage has a saved draft
  const hasDraft = !!localStorage.getItem('contractDraft');

  // Handle export to PDF
  const handleExportToPdf = async () => {
    const contentElement = document.getElementById('contract-content');
    if (!contentElement) return;
    
    // Show loading state
    setHasCopied(true);
    
    try {
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${contractName || 'contract'}.pdf`);
      
      // Reset loading state
      setHasCopied(false);
    } catch (error) {
      console.error('PDF generation failed', error);
      setHasCopied(false);
    }
  };

  // Handle PDF preview
  const handlePdfPreview = () => {
    setPdfPreviewDialogOpen(true);
  };

  // Get document style based on selected format
  const getDocumentStyle = () => {
    const baseStyle: any = {
      padding: theme.spacing(3),
      maxHeight: showPrintView ? 'none' : '500px',
      overflow: showPrintView ? 'visible' : 'auto',
      whiteSpace: 'pre-wrap',
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.paper,
      position: 'relative',
    };
    
    // Font size
    if (documentFontSize === 'small') {
      baseStyle.fontSize = '0.85rem';
      baseStyle.lineHeight = 1.4;
    } else if (documentFontSize === 'medium') {
      baseStyle.fontSize = '1rem';
      baseStyle.lineHeight = 1.6;
    } else if (documentFontSize === 'large') {
      baseStyle.fontSize = '1.1rem';
      baseStyle.lineHeight = 1.8;
    }
    
    if (documentFormat === 'plain') {
      baseStyle.fontFamily = 'monospace';
    } else if (documentFormat === 'professional') {
      baseStyle.fontFamily = 'Arial, sans-serif';
      baseStyle.borderRadius = '4px';
      baseStyle.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    } else if (documentFormat === 'formal') {
      baseStyle.fontFamily = 'Georgia, serif';
      baseStyle.borderRadius = '4px';
      baseStyle.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      baseStyle.borderLeft = `4px solid ${getThemeColor()}`;
    }
    
    return baseStyle;
  };
  
  // Get color based on theme selection
  const getThemeColor = () => {
    switch (documentColor) {
      case 'blue':
        return theme.palette.primary.main;
      case 'green':
        return theme.palette.success.main;
      case 'purple':
        return '#8e44ad';
      case 'gray':
        return theme.palette.grey[700];
      default:
        return theme.palette.primary.main;
    }
  };

  // Convert Markdown to styled HTML
  const formatMarkdownToHtml = (text: string) => {
    if (!text) return '';
    
    // Basic Markdown conversion
    let html = text
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Emphasis
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      // Paragraphs (double line breaks)
      .replace(/\n\s*\n/g, '</p><p>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Fix lists
    html = html.replace(/<li>(.*?)<\/li>/g, function(match) {
      return '<ul>' + match + '</ul>';
    }).replace(/<\/ul><ul>/g, '');
    
    return html;
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AIIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              AI Contract Generator
            </Typography>
          </Box>
          {!generatedContract && hasDraft && (
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleLoadDraft}
              startIcon={<RefreshIcon />}
            >
              Load Draft
            </Button>
          )}
        </Box>
        
        {!generatedContract ? (
          <>
            <Grid container spacing={3}>
              {/* Client Selection */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={availableClients}
                  getOptionLabel={(option) => option.name + (option.company ? ` (${option.company})` : '')}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Select Client" 
                      fullWidth
                    />
                  )}
                  value={selectedClient}
                  onChange={handleClientSelect}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.company && `${option.company} • `}{option.industry}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Contract Template</InputLabel>
                  <Select
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    label="Contract Template"
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select a template or use custom prompt</em>
                    </MenuItem>
                    {availableTemplates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name} 
                        <Chip 
                          label={template.complexity} 
                          size="small" 
                          color={
                            template.complexity === 'Simple' ? 'success' : 
                            template.complexity === 'Standard' ? 'primary' : 
                            'warning'
                          } 
                          sx={{ ml: 1 }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {selectedTemplate && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Contract Name"
                    fullWidth
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    placeholder="Enter a name for this contract"
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  label="Custom Requirements (Optional)"
                  multiline
                  rows={4}
                  fullWidth
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the contract requirements in detail, including specific clauses or terms you need..."
                  helperText="Provide specific details about the project, client needs, or special requirements to be included in the contract."
                />
              </Grid>
              
              {showVariablesForm && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Contract Variables
                    </Typography>
                    {calculateDuration() && (
                      <Chip 
                        label={calculateDuration()} 
                        color="info" 
                        size="small"
                      />
                    )}
                  </Box>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      {contractVariables.map((variable) => (
                        <Grid item xs={12} sm={6} md={4} key={variable.key}>
                          {variable.type === 'selection' && variable.options ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>{variable.label}{variable.required ? ' *' : ''}</InputLabel>
                              <Select
                                value={variable.value}
                                onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                                label={`${variable.label}${variable.required ? ' *' : ''}`}
                                required={variable.required}
                              >
                                <MenuItem value="">
                                  <em>Select {variable.label}</em>
                                </MenuItem>
                                {variable.options.map(option => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              label={variable.label}
                              type={variable.type}
                              size="small"
                              fullWidth
                              value={variable.value}
                              onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                              required={variable.required}
                              InputLabelProps={variable.type === 'date' ? { shrink: true } : undefined}
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Box>
                <Button 
                  variant="outlined" 
                  onClick={handleReset}
                  sx={{ mr: 1 }}
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SaveDraftIcon />}
                  onClick={handleSaveDraft}
                  color={isDraftSaved ? "success" : "primary"}
                >
                  {isDraftSaved ? 'Saved!' : 'Save Draft'}
                </Button>
              </Box>
              <Button 
                variant="contained" 
                startIcon={isGenerating ? <CircularProgress size={20} /> : <AIIcon />}
                onClick={generateContract}
                disabled={isGenerating || (!selectedTemplate && !customPrompt)}
              >
                {isGenerating ? 'Generating...' : 'Generate Contract'}
              </Button>
            </Box>
            
            {isGenerating && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={generationProgress} 
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Analyzing requirements
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(generationProgress)}%
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">
                Generated Contract: {contractName || 'Untitled Contract'}
              </Typography>
              <Box>
                {/* Format options toggle */}
                <Tooltip title="Document format options">
                  <IconButton onClick={() => setShowFormatOptions(!showFormatOptions)} size="small" color={showFormatOptions ? "primary" : "default"}>
                    <FormatTextIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy to clipboard">
                  <IconButton onClick={handleCopyContract} size="small">
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as markdown">
                  <IconButton onClick={handleDownloadContract} size="small">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export to PDF">
                  <IconButton onClick={handleExportToPdf} size="small" color={hasCopied ? "primary" : "default"}>
                    <PdfIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Preview PDF">
                  <IconButton onClick={handlePdfPreview} size="small">
                    <DocumentIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print view">
                  <IconButton onClick={togglePrintView} size="small" color={showPrintView ? "primary" : "default"}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Start over">
                  <IconButton onClick={handleReset} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Format options panel */}
            {showFormatOptions && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" gutterBottom>Document Formatting</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Format Style</InputLabel>
                      <Select
                        value={documentFormat}
                        onChange={(e) => setDocumentFormat(e.target.value as any)}
                        label="Format Style"
                        startAdornment={<FormatTextIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />}
                      >
                        <MenuItem value="plain">Plain Text</MenuItem>
                        <MenuItem value="professional">Professional</MenuItem>
                        <MenuItem value="formal">Formal</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Color Theme</InputLabel>
                      <Select
                        value={documentColor}
                        onChange={(e) => setDocumentColor(e.target.value as any)}
                        label="Color Theme"
                        startAdornment={<PaletteIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />}
                      >
                        <MenuItem value="blue">Blue</MenuItem>
                        <MenuItem value="green">Green</MenuItem>
                        <MenuItem value="purple">Purple</MenuItem>
                        <MenuItem value="gray">Gray</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Font Size</InputLabel>
                      <Select
                        value={documentFontSize}
                        onChange={(e) => setDocumentFontSize(e.target.value as any)}
                        label="Font Size"
                        startAdornment={<FormatSizeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />}
                      >
                        <MenuItem value="small">Small</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="large">Large</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Alert severity="info" sx={{ mb: 2 }}>
              This is an AI-generated contract template. Review with legal counsel before use.
            </Alert>
            
            {documentFormat === 'plain' ? (
              <Paper 
                variant="outlined" 
                sx={getDocumentStyle()}
                id="contract-content"
              >
                {generatedContract}
              </Paper>
            ) : (
              <DocumentPaper 
                variant="outlined" 
                sx={{ 
                  ...getDocumentStyle(),
                  '& h1, & h2, & h3, & h4': {
                    color: getThemeColor()
                  },
                  '& h1': {
                    borderBottom: `1px solid ${getThemeColor()}30`,
                  }
                }}
                id="contract-content"
                dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(generatedContract) }}
              />
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={handleReset}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              {onGeneratedContract && (
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={() => onGeneratedContract(generatedContract, contractName)}
                >
                  Use This Contract
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* PDF Preview Dialog */}
      <Dialog
        open={pdfPreviewDialogOpen}
        onClose={() => setPdfPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          PDF Preview - {contractName || 'Untitled Contract'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ bgcolor: '#f5f5f5', p: 4, height: '70vh', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
            <Box 
              sx={{ 
                width: '210mm', 
                minHeight: '297mm',
                bgcolor: 'white', 
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                p: 4
              }}
            >
              {documentFormat === 'plain' ? (
                <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {generatedContract}
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    fontFamily: documentFormat === 'professional' ? 'Arial, sans-serif' : 'Georgia, serif',
                    fontSize: documentFontSize === 'small' ? '12px' : documentFontSize === 'medium' ? '14px' : '16px',
                    '& h1, & h2, & h3, & h4': { color: getThemeColor() },
                    '& h1': { borderBottom: `1px solid ${getThemeColor()}30` }
                  }}
                  dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(generatedContract) }}
                />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPdfPreviewDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<PdfIcon />}
            onClick={() => {
              setPdfPreviewDialogOpen(false);
              handleExportToPdf();
            }}
          >
            Export to PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractGenerator; 