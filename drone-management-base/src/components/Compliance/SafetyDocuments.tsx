import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Document types
export type DocumentCategory = 
  | 'Pre-Flight Checklist'
  | 'Emergency Procedures'
  | 'Maintenance Protocol'
  | 'Safety Guidelines'
  | 'Regulatory Compliance'
  | 'Training Material'
  | 'Risk Assessment'
  | 'Standard Operating Procedure'
  | 'Client Requirements'
  | 'Other';

export type DocumentStatus = 'Current' | 'Under Review' | 'Archived' | 'Draft';

export interface SafetyDocument {
  id: number;
  title: string;
  category: DocumentCategory;
  status: DocumentStatus;
  createdDate: string | Date;
  lastUpdated: string | Date;
  version: string;
  author: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reviewDate?: string | Date;
  approvedBy?: string;
}

interface SafetyDocumentsProps {
  documents: SafetyDocument[];
  onAddDocument: (document: Omit<SafetyDocument, 'id'>) => void;
  onUpdateDocument: (id: number, document: Omit<SafetyDocument, 'id'>) => void;
  onDeleteDocument: (id: number) => void;
  onViewDocument: (document: SafetyDocument) => void;
  onDownloadDocument: (document: SafetyDocument) => void;
  onUploadFile: (file: File, documentId?: number) => Promise<string>;
}

const SafetyDocuments: React.FC<SafetyDocumentsProps> = ({
  documents,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onViewDocument,
  onDownloadDocument,
  onUploadFile
}) => {
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Selected document
  const [selectedDocument, setSelectedDocument] = useState<SafetyDocument | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Omit<SafetyDocument, 'id'>>({
    title: '',
    category: 'Safety Guidelines',
    status: 'Current',
    createdDate: new Date(),
    lastUpdated: new Date(),
    version: '1.0',
    author: '',
    description: ''
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      title: '',
      category: 'Safety Guidelines',
      status: 'Current',
      createdDate: new Date(),
      lastUpdated: new Date(),
      version: '1.0',
      author: '',
      description: ''
    });
    setSelectedFile(null);
    setFormErrors({});
    setIsAddDialogOpen(true);
  };
  
  // Handle opening edit dialog
  const handleOpenEditDialog = (document: SafetyDocument) => {
    setSelectedDocument(document);
    setFormData({
      ...document,
      createdDate: new Date(document.createdDate),
      lastUpdated: new Date(document.lastUpdated),
      reviewDate: document.reviewDate ? new Date(document.reviewDate) : undefined
    });
    setSelectedFile(null);
    setFormErrors({});
    setIsEditDialogOpen(true);
  };
  
  // Handle opening delete dialog
  const handleOpenDeleteDialog = (document: SafetyDocument) => {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle closing dialogs
  const handleCloseDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedDocument(null);
  };
  
  // Handle form field change
  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: ''
      });
    }
  };
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Update form data with file details
      setFormData({
        ...formData,
        fileName: file.name,
        fileSize: file.size
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title) {
      errors.title = 'Title is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (!formData.author) {
      errors.author = 'Author is required';
    }
    
    if (!formData.createdDate) {
      errors.createdDate = 'Creation date is required';
    }
    
    if (!formData.version) {
      errors.version = 'Version is required';
    }
    
    if (isAddDialogOpen && !selectedFile && !formData.fileUrl) {
      errors.file = 'A file must be uploaded';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle saving a new document
  const handleSaveNewDocument = async () => {
    if (validateForm()) {
      try {
        // If a file is selected, upload it first
        if (selectedFile) {
          setIsUploading(true);
          const fileUrl = await onUploadFile(selectedFile);
          setIsUploading(false);
          
          // Add document with file URL
          onAddDocument({
            ...formData,
            fileUrl
          });
        } else {
          // Add document without file
          onAddDocument(formData);
        }
        
        handleCloseDialogs();
      } catch (error) {
        setIsUploading(false);
        setFormErrors({
          ...formErrors,
          file: 'Error uploading file. Please try again.'
        });
      }
    }
  };
  
  // Handle updating a document
  const handleUpdateDocument = async () => {
    if (validateForm() && selectedDocument) {
      try {
        // If a file is selected, upload it first
        if (selectedFile) {
          setIsUploading(true);
          const fileUrl = await onUploadFile(selectedFile, selectedDocument.id);
          setIsUploading(false);
          
          // Update document with file URL
          onUpdateDocument(selectedDocument.id, {
            ...formData,
            fileUrl,
            lastUpdated: new Date()
          });
        } else {
          // Update document without changing file
          onUpdateDocument(selectedDocument.id, {
            ...formData,
            lastUpdated: new Date()
          });
        }
        
        handleCloseDialogs();
      } catch (error) {
        setIsUploading(false);
        setFormErrors({
          ...formErrors,
          file: 'Error uploading file. Please try again.'
        });
      }
    }
  };
  
  // Handle deleting a document
  const handleDeleteDocument = () => {
    if (selectedDocument) {
      onDeleteDocument(selectedDocument.id);
      handleCloseDialogs();
    }
  };
  
  // Format date for display
  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString();
  };
  
  // Get document status color
  const getStatusColor = (status: DocumentStatus): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'Current':
        return 'success';
      case 'Under Review':
        return 'warning';
      case 'Archived':
        return 'error';
      case 'Draft':
        return 'info';
      default:
        return 'default';
    }
  };
  
  const getCategoryIcon = (category: DocumentCategory): React.ReactNode => {
    // In a real implementation, we would have unique icons for each category
    return category.charAt(0);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Safety Documents
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Document
        </Button>
      </Box>
      
      {/* Documents Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Alert severity="info">
                    No safety documents found. Click "Add Document" to create one.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>
                    <Chip 
                      label={doc.category} 
                      size="small" 
                      icon={<Box component="span">{getCategoryIcon(doc.category)}</Box>}
                    />
                  </TableCell>
                  <TableCell>v{doc.version}</TableCell>
                  <TableCell>{formatDate(doc.lastUpdated)}</TableCell>
                  <TableCell>{doc.author}</TableCell>
                  <TableCell>
                    <Chip 
                      label={doc.status} 
                      size="small" 
                      color={getStatusColor(doc.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Document">
                      <IconButton size="small" onClick={() => onViewDocument(doc)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton size="small" onClick={() => onDownloadDocument(doc)}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenEditDialog(doc)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleOpenDeleteDialog(doc)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit Document Dialog */}
      <Dialog 
        open={isAddDialogOpen || isEditDialogOpen} 
        onClose={handleCloseDialogs} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {isAddDialogOpen ? 'Add New Safety Document' : 'Edit Safety Document'}
            </Typography>
            <IconButton onClick={handleCloseDialogs} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Document Title *"
                  fullWidth
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!formErrors.category}>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    label="Category *"
                  >
                    <MenuItem value="Pre-Flight Checklist">Pre-Flight Checklist</MenuItem>
                    <MenuItem value="Emergency Procedures">Emergency Procedures</MenuItem>
                    <MenuItem value="Maintenance Protocol">Maintenance Protocol</MenuItem>
                    <MenuItem value="Safety Guidelines">Safety Guidelines</MenuItem>
                    <MenuItem value="Regulatory Compliance">Regulatory Compliance</MenuItem>
                    <MenuItem value="Training Material">Training Material</MenuItem>
                    <MenuItem value="Risk Assessment">Risk Assessment</MenuItem>
                    <MenuItem value="Standard Operating Procedure">Standard Operating Procedure</MenuItem>
                    <MenuItem value="Client Requirements">Client Requirements</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {formErrors.category && <Typography color="error" variant="caption">{formErrors.category}</Typography>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status *</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    label="Status *"
                  >
                    <MenuItem value="Current">Current</MenuItem>
                    <MenuItem value="Under Review">Under Review</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Author *"
                  fullWidth
                  value={formData.author}
                  onChange={(e) => handleFormChange('author', e.target.value)}
                  error={!!formErrors.author}
                  helperText={formErrors.author}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Version *"
                  fullWidth
                  value={formData.version}
                  onChange={(e) => handleFormChange('version', e.target.value)}
                  error={!!formErrors.version}
                  helperText={formErrors.version}
                  margin="normal"
                  placeholder="e.g., 1.0, 2.3, etc."
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Created Date *"
                  value={formData.createdDate}
                  onChange={(newDate) => handleFormChange('createdDate', newDate)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      error={!!formErrors.createdDate}
                      helperText={formErrors.createdDate}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Next Review Date"
                  value={formData.reviewDate}
                  onChange={(newDate) => handleFormChange('reviewDate', newDate)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Approved By"
                  fullWidth
                  value={formData.approvedBy || ''}
                  onChange={(e) => handleFormChange('approvedBy', e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  margin="normal"
                  placeholder="Brief description of the document content and purpose"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Document File *
                  </Typography>
                  {isEditDialogOpen && formData.fileName && !selectedFile && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Current file: {formData.fileName}
                    </Alert>
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload File'}
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xlsx,.ppt,.pptx,.txt"
                    />
                  </Button>
                  {selectedFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {selectedFile.name}
                    </Typography>
                  )}
                  {formErrors.file && (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {formErrors.file}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={isAddDialogOpen ? handleSaveNewDocument : handleUpdateDocument}
            disabled={isUploading}
          >
            {isAddDialogOpen ? 'Save Document' : 'Update Document'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the document "{selectedDocument?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteDocument}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SafetyDocuments; 