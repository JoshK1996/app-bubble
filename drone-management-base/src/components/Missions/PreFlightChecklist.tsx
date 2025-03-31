import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Divider,
  Chip,
  Alert,
  useTheme,
  LinearProgress,
  IconButton,
  Collapse,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  FlightTakeoff as FlightIcon,
  Check as CheckIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Warning as WarningIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  WbSunny as SunnyIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ChecklistItem } from '../../types/missionTypes';
import { CurrentWeather } from '../../utils/weatherApi';

// Enhanced props for the PreFlightChecklist component with weather data
interface PreFlightChecklistProps {
  missionId?: string;
  missionType?: 'Standard' | 'Survey' | 'Inspection' | 'Photography' | 'Videography' | 'Thermal' | 'Custom';
  equipment?: string[];
  onComplete?: (completed: boolean, items: ChecklistItem[]) => void;
  onSave?: (items: ChecklistItem[]) => void;
  weatherData?: CurrentWeather;
}

// Template interface for saving and loading checklist templates
interface ChecklistTemplate {
  id: string;
  name: string;
  missionType: string;
  items: ChecklistItem[];
}

const PreFlightChecklist: React.FC<PreFlightChecklistProps> = ({
  missionId,
  missionType = 'Standard',
  equipment = [],
  onComplete,
  onSave,
  weatherData
}) => {
  const theme = useTheme();
  const checklistRef = useRef<HTMLDivElement>(null);
  
  // State for template management
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Initial checklist items based on mission type and equipment
  const generateInitialChecklist = (): ChecklistItem[] => {
    let items: ChecklistItem[] = [
      // Common equipment checks
      { id: 'drone-battery', text: 'Drone battery fully charged and secured', checked: false, required: true, category: 'equipment' },
      { id: 'controller-battery', text: 'Controller battery level above 75%', checked: false, required: true, category: 'equipment' },
      { id: 'propellers', text: 'Propellers in good condition and secured', checked: false, required: true, category: 'equipment' },
      { id: 'camera-settings', text: 'Camera settings verified for mission requirements', checked: false, required: true, category: 'equipment' },
      { id: 'storage-space', text: 'Sufficient storage space for media capture', checked: false, required: true, category: 'equipment' },
      
      // Common safety checks
      { id: 'visual-inspection', text: 'Visual inspection of drone completed', checked: false, required: true, category: 'safety' },
      { id: 'compass-calibrated', text: 'Compass calibrated', checked: false, required: true, category: 'safety' },
      { id: 'gps-signal', text: 'GPS signal strong and stable', checked: false, required: true, category: 'safety' },
      { id: 'takeoff-area', text: 'Takeoff area clear of obstacles', checked: false, required: true, category: 'safety' },
      { id: 'emergency-procedures', text: 'Emergency procedures reviewed', checked: false, required: true, category: 'safety' },
      
      // Common regulatory checks
      { id: 'flight-permission', text: 'Flight permission obtained if required', checked: false, required: true, category: 'regulatory' },
      { id: 'airspace-check', text: 'Airspace restrictions checked', checked: false, required: true, category: 'regulatory' },
      { id: 'insurance-valid', text: 'Drone insurance valid', checked: false, required: true, category: 'regulatory' },
      { id: 'notification-filed', text: 'NOTAM filed if required', checked: false, required: false, category: 'regulatory' },
      
      // Common environmental checks
      { id: 'weather-conditions', text: 'Weather conditions suitable for flight', checked: false, required: true, category: 'environment' },
      { id: 'wind-speed', text: 'Wind speed within acceptable limits', checked: false, required: true, category: 'environment' },
      { id: 'visibility', text: 'Visibility adequate for visual line of sight', checked: false, required: true, category: 'environment' },
      
      // Common mission-specific checks
      { id: 'mission-plan', text: 'Mission plan reviewed and loaded', checked: false, required: true, category: 'mission' },
      { id: 'waypoints-verified', text: 'Waypoints verified if applicable', checked: false, required: false, category: 'mission' },
      { id: 'client-requirements', text: 'Client requirements confirmed', checked: false, required: true, category: 'mission' },
    ];
    
    // Add mission type specific items
    switch (missionType) {
      case 'Survey':
        items.push(
          { id: 'survey-grid', text: 'Survey grid pattern properly configured', checked: false, required: true, category: 'mission' },
          { id: 'overlap-settings', text: 'Image overlap settings verified', checked: false, required: true, category: 'mission' },
          { id: 'ground-control', text: 'Ground control points in place', checked: false, required: true, category: 'mission' }
        );
        break;
      case 'Inspection':
        items.push(
          { id: 'inspection-zones', text: 'Inspection zones identified and marked', checked: false, required: true, category: 'mission' },
          { id: 'zoom-functionality', text: 'Camera zoom functionality verified', checked: false, required: true, category: 'mission' },
          { id: 'inspection-checklist', text: 'Inspection checklist items reviewed', checked: false, required: true, category: 'mission' }
        );
        break;
      case 'Photography':
        items.push(
          { id: 'photo-settings', text: 'Photo settings (ISO, aperture, shutter) verified', checked: false, required: true, category: 'mission' },
          { id: 'filter-check', text: 'Lens filters verified for lighting conditions', checked: false, required: false, category: 'mission' },
          { id: 'composition-shots', text: 'Composition shot list reviewed', checked: false, required: true, category: 'mission' }
        );
        break;
      case 'Videography':
        items.push(
          { id: 'video-settings', text: 'Video settings (resolution, frame rate) verified', checked: false, required: true, category: 'mission' },
          { id: 'gimbal-calibrated', text: 'Gimbal calibrated and movements verified', checked: false, required: true, category: 'mission' },
          { id: 'storyboard-check', text: 'Shot sequence/storyboard reviewed', checked: false, required: true, category: 'mission' }
        );
        break;
      case 'Thermal':
        items.push(
          { id: 'thermal-calibration', text: 'Thermal camera calibrated', checked: false, required: true, category: 'mission' },
          { id: 'emissivity-settings', text: 'Emissivity settings verified', checked: false, required: true, category: 'mission' },
          { id: 'temperature-range', text: 'Temperature range settings verified', checked: false, required: true, category: 'mission' }
        );
        break;
    }
    
    // Add equipment-specific checks
    if (equipment.includes('Multispectral Camera')) {
      items.push(
        { id: 'multispectral-calibration', text: 'Multispectral calibration completed', checked: false, required: true, category: 'equipment' }
      );
    }
    
    if (equipment.includes('RTK System')) {
      items.push(
        { id: 'rtk-signal', text: 'RTK baseline and signal confirmed', checked: false, required: true, category: 'equipment' }
      );
    }
    
    if (equipment.includes('Payload Delivery')) {
      items.push(
        { id: 'payload-secure', text: 'Payload securely attached and balanced', checked: false, required: true, category: 'equipment' },
        { id: 'payload-weight', text: 'Payload weight verified and within limits', checked: false, required: true, category: 'equipment' }
      );
    }
    
    return items;
  };
  
  // State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(generateInitialChecklist());
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'equipment' | 'safety' | 'regulatory' | 'environment' | 'mission'>('mission');
  const [newItemRequired, setNewItemRequired] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
    equipment: true,
    safety: true,
    regulatory: true,
    environment: true,
    mission: true
  });
  const [showAddItem, setShowAddItem] = useState(false);
  
  // Update checklist based on weather data
  useEffect(() => {
    if (weatherData) {
      const updatedChecklist = checklist.map(item => {
        if (item.id === 'weather-conditions') {
          // Auto check weather conditions if they are suitable
          return {
            ...item,
            checked: weatherData.isSuitable === true
          };
        }
        if (item.id === 'wind-speed') {
          // Auto check wind speed if it's within limits (e.g., less than 20mph)
          return {
            ...item,
            checked: weatherData.wind?.speed !== undefined ? weatherData.wind.speed < 20 : false
          };
        }
        return item;
      });
      
      // Add specific weather warnings if needed
      if (weatherData.wind?.speed !== undefined && weatherData.wind.speed > 15) {
        const windWarningExists = updatedChecklist.some(item => item.id === 'high-wind-warning');
        if (!windWarningExists) {
          updatedChecklist.push({
            id: 'high-wind-warning',
            text: `Wind warning: ${weatherData.wind.speed}mph - Take extra precautions`,
            checked: false,
            required: true,
            category: 'environment'
          });
        }
      }
      
      if (weatherData.rain || (weatherData.precipitation !== undefined && weatherData.precipitation > 0)) {
        const rainWarningExists = updatedChecklist.some(item => item.id === 'rain-warning');
        if (!rainWarningExists) {
          updatedChecklist.push({
            id: 'rain-warning',
            text: 'Precipitation detected - Verify drone waterproof rating or consider postponing',
            checked: false,
            required: true,
            category: 'environment'
          });
        }
      }
      
      setChecklist(updatedChecklist);
    }
  }, [weatherData]);
  
  // Update on mission type or equipment changes
  useEffect(() => {
    setChecklist(generateInitialChecklist());
  }, [missionType, equipment]);
  
  // Load templates from local storage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('checklistTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);
  
  // Calculate progress
  const requiredItems = checklist.filter(item => item.required);
  const completedRequiredItems = requiredItems.filter(item => item.checked);
  const progress = requiredItems.length > 0 ? (completedRequiredItems.length / requiredItems.length) * 100 : 0;
  const isComplete = requiredItems.length === completedRequiredItems.length;
  
  // Handle item check change
  const handleCheckChange = (id: string) => {
    const updatedChecklist = checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updatedChecklist);
    
    // Calculate new completion status
    const newRequiredItems = updatedChecklist.filter(item => item.required);
    const newCompletedRequiredItems = newRequiredItems.filter(item => item.checked);
    const newIsComplete = newRequiredItems.length === newCompletedRequiredItems.length;
    
    // Call onComplete callback if provided
    if (onComplete) {
      onComplete(newIsComplete, updatedChecklist);
    }
  };
  
  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(checklist);
    }
  };
  
  // Handle category expansion toggle
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Get category counts
  const getCategoryCounts = (category: string) => {
    const categoryItems = checklist.filter(item => item.category === category);
    const completedItems = categoryItems.filter(item => item.checked);
    return `${completedItems.length}/${categoryItems.length}`;
  };
  
  // Add a new checklist item
  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: newItemText,
      checked: false,
      required: newItemRequired,
      category: newItemCategory
    };
    
    setChecklist([...checklist, newItem]);
    setNewItemText('');
    setNewItemRequired(true);
    setShowAddItem(false);
  };
  
  // Handle deleting an item
  const handleDeleteItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };
  
  // Save the current checklist as a template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    
    const newTemplate: ChecklistTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      missionType: missionType,
      items: checklist
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('checklistTemplates', JSON.stringify(updatedTemplates));
    setTemplateDialogOpen(false);
    setTemplateName('');
  };
  
  // Load a template
  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setChecklist(template.items);
    }
    setSelectedTemplate(null);
  };
  
  // Export checklist as PDF
  const handleExportPDF = () => {
    if (!checklistRef.current) return;
    
    const pdf = new jsPDF();
    const title = `Pre-Flight Checklist - ${missionType} Mission ${missionId ? `(${missionId})` : ''}`;
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 15, 15);
    
    // Add date and completion status
    pdf.setFontSize(10);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 15, 25);
    pdf.text(`Completion: ${progress.toFixed(0)}%`, 15, 30);
    
    // Prepare data for table
    const tableData: any[] = [];
    
    // Group items by category
    const categories = ['equipment', 'safety', 'regulatory', 'environment', 'mission'];
    categories.forEach(category => {
      // Add category header
      tableData.push([
        { content: categoryNames[category], colSpan: 3, styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } }
      ]);
      
      // Add items
      const categoryItems = checklist.filter(item => item.category === category);
      categoryItems.forEach(item => {
        tableData.push([
          item.text,
          item.required ? 'Required' : 'Optional', 
          item.checked ? 'Yes' : 'No'
        ]);
      });
    });
    
    // Create table
    (pdf as any).autoTable({
      startY: 35,
      head: [['Item', 'Status', 'Completed']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Save PDF
    pdf.save(`checklist-${missionType.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  // Group items by category
  const itemsByCategory: {[key: string]: ChecklistItem[]} = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as {[key: string]: ChecklistItem[]});
  
  // Category display names
  const categoryNames: {[key: string]: string} = {
    equipment: 'Equipment Checks',
    safety: 'Safety Checks',
    regulatory: 'Regulatory Compliance',
    environment: 'Environmental Conditions',
    mission: 'Mission-Specific'
  };
  
  // Category icons or colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'equipment':
        return theme.palette.info.main;
      case 'safety':
        return theme.palette.error.main;
      case 'regulatory':
        return theme.palette.warning.main;
      case 'environment':
        return theme.palette.success.main;
      case 'mission':
        return theme.palette.primary.main;
      default:
        return theme.palette.text.primary;
    }
  };
  
  return (
    <Card 
      ref={checklistRef}
      sx={{ 
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <FlightIcon sx={{ mr: 1 }} />
            Pre-Flight Checklist - {missionType} Mission {missionId && `(${missionId})`}
          </Typography>
          <Box>
            <Tooltip title="Save checklist">
              <IconButton 
                color="primary" 
                onClick={handleSave}
                sx={{ mr: 1 }}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as PDF">
              <IconButton 
                color="primary"
                onClick={handleExportPDF}
                sx={{ mr: 1 }}
              >
                <PdfIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print checklist">
              <IconButton 
                color="primary"
                onClick={() => window.print()}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Completion Progress ({completedRequiredItems.length}/{requiredItems.length} required items)
            </Typography>
            <Typography variant="body2" fontWeight="bold" color={
              progress < 50 ? 'error.main' : 
              progress < 80 ? 'warning.main' : 
              'success.main'
            }>
              {progress.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            color={
              progress < 50 ? 'error' : 
              progress < 80 ? 'warning' : 
              'success'
            }
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        
        {isComplete ? (
          <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
            Pre-flight checklist complete! Aircraft is ready for takeoff.
          </Alert>
        ) : (
          <Alert severity="info" icon={<WarningIcon />} sx={{ mb: 3 }}>
            Complete all required items before proceeding with the flight.
          </Alert>
        )}

        {/* Weather alert if available */}
        {weatherData && (
          <Alert 
            severity={weatherData.isSuitable ? "success" : "warning"} 
            icon={<SunnyIcon />} 
            sx={{ mb: 3 }}
          >
            Current weather: {weatherData.temperature}°C, Wind: {weatherData.wind?.speed || 0}mph, 
            {weatherData.precipitation !== undefined && weatherData.precipitation > 0 
              ? ` Precipitation: ${weatherData.precipitation}mm` 
              : ' No precipitation'}
            {!weatherData.isSuitable && ' Weather conditions may affect flight safety.'}
          </Alert>
        )}
        
        {/* Template Management */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<UploadIcon />}
              onClick={() => setTemplateDialogOpen(true)}
              size="small"
              sx={{ mr: 1 }}
            >
              Save Template
            </Button>
            
            {templates.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => setSelectedTemplate(templates[0].id)}
                size="small"
                endIcon={<ExpandMoreIcon />}
              >
                Load Template
              </Button>
            )}
            
            {selectedTemplate && (
              <Box sx={{ position: 'absolute', zIndex: 1, mt: 1, boxShadow: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
                {templates.map(template => (
                  <Button
                    key={template.id}
                    fullWidth
                    onClick={() => handleLoadTemplate(template.id)}
                    sx={{ justifyContent: 'flex-start', p: 1 }}
                  >
                    {template.name}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowAddItem(!showAddItem)}
            size="small"
          >
            Add Item
          </Button>
        </Box>
        
        {/* Add new item form */}
        <Collapse in={showAddItem}>
          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Add New Checklist Item</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Description"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newItemCategory}
                    label="Category"
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                  >
                    <MenuItem value="equipment">Equipment</MenuItem>
                    <MenuItem value="safety">Safety</MenuItem>
                    <MenuItem value="regulatory">Regulatory</MenuItem>
                    <MenuItem value="environment">Environment</MenuItem>
                    <MenuItem value="mission">Mission-Specific</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Checkbox checked={newItemRequired} onChange={(e) => setNewItemRequired(e.target.checked)} />}
                  label="Required Item"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button variant="outlined" onClick={() => setShowAddItem(false)}>Cancel</Button>
                  <Button variant="contained" onClick={handleAddItem}>Add Item</Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
        
        {/* Checklist by categories */}
        {Object.keys(itemsByCategory).map((category) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 1.5,
                bgcolor: 'background.default',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              onClick={() => toggleCategory(category)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  label={categoryNames[category]} 
                  sx={{ 
                    mr: 2, 
                    bgcolor: getCategoryColor(category),
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
                <Typography variant="subtitle1">
                  {getCategoryCounts(category)} completed
                </Typography>
              </Box>
              {expandedCategories[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={expandedCategories[category]}>
              <FormGroup sx={{ px: 2, py: 1 }}>
                {itemsByCategory[category].map((item) => (
                  <Box key={item.id} sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 1
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={item.checked} 
                          onChange={() => handleCheckChange(item.id)}
                          color={item.required ? 'primary' : 'secondary'}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">{item.text}</Typography>
                          {item.required ? (
                            <Chip 
                              label="Required" 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                bgcolor: theme.palette.error.light,
                                color: 'white',
                                mr: 1
                              }} 
                            />
                          ) : (
                            <Chip 
                              label="Optional" 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                bgcolor: theme.palette.info.light,
                                color: 'white',
                                mr: 1
                              }} 
                            />
                          )}
                          {/* Show warning for weather-related items if applicable */}
                          {weatherData && item.id === 'weather-conditions' && !weatherData.isSuitable && (
                            <Chip 
                              label="Warning" 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                bgcolor: theme.palette.warning.main,
                                color: 'white'
                              }} 
                            />
                          )}
                        </Box>
                      }
                      sx={{ width: '90%' }}
                    />
                    {/* Only show delete button for custom items */}
                    {item.id.startsWith('custom-') && (
                      <IconButton size="small" onClick={() => handleDeleteItem(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </FormGroup>
            </Collapse>
          </Box>
        ))}
        
        {/* Template name dialog */}
        <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)}>
          <DialogTitle>Save Checklist Template</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Template Name"
              fullWidth
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} color="primary">Save</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PreFlightChecklist; 