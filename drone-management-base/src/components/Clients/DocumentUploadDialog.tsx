import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Attachment as AttachmentIcon,
} from '@mui/icons-material';
import { ClientDocument } from '../../types/clientTypes';

interface DocumentUploadDialogProps {
  open: boolean;
  clientId: number;
  document?: ClientDocument;
  onClose: () => void;
  onSave: (document: ClientDocument) => void;
}

// File types that can be uploaded
const allowedFileTypes = [
  { type: 'application/pdf', extension: 'pdf', name: 'PDF Document' },
  { type: 'application/msword', extension: 'doc', name: 'Word Document' },
  { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx', name: 'Word Document' },
  { type: 'application/vnd.ms-excel', extension: 'xls', name: 'Excel Spreadsheet' },
  { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx', name: 'Excel Spreadsheet' },
  { type: 'image/jpeg', extension: 'jpg', name: 'JPEG Image' },
  { type: 'image/png', extension: 'png', name: 'PNG Image' },
];

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  clientId,
  document: documentProp,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ClientDocument>({
    id: 0,
    clientId: clientId,
    name: '',
    description: '',
    fileUrl: '',
    fileType: '',
    fileSize: 0,
    uploadDate: new Date().toISOString(),
    version: 1,
    tags: [],
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (documentProp) {
      setFormData(documentProp);
    } else {
      setFormData({
        id: Date.now(),
        clientId: clientId,
        name: '',
        description: '',
        fileUrl: '',
        fileType: '',
        fileSize: 0,
        uploadDate: new Date().toISOString(),
        version: 1,
        tags: [],
      });
    }
    setErrors({});
    setFile(null);
    setUploadProgress(0);
    setUploading(false);
  }, [documentProp, clientId, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if file type is allowed
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      const fileType = allowedFileTypes.find(type => 
        type.extension === fileExtension || type.type === selectedFile.type
      );
      
      if (!fileType) {
        setErrors({
          ...errors,
          file: 'File type not allowed. Please upload a PDF, Word, Excel, or image file.',
        });
        return;
      }
      
      setFile(selectedFile);
      setFormData({
        ...formData,
        name: formData.name || selectedFile.name.split('.')[0],
        fileType: fileExtension,
        fileSize: Math.round(selectedFile.size / 1024), // Convert to KB
      });
      
      // Clear file error if exists
      if (errors.file) {
        setErrors({
          ...errors,
          file: '',
        });
      }
    }
  };

  const handleDocTypeChange = (e: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      fileType: e.target.value,
    });
  };

  const simulateUpload = () => {
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prevProgress => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setUploading(false);
          setFormData({
            ...formData,
            fileUrl: `/mock/documents/client_${clientId}_doc_${Date.now()}.${formData.fileType}`,
          });
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Document name is required';
    }

    if (!file && !documentProp) {
      newErrors.file = 'Please select a file to upload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // If there's a file selected but not uploaded yet, simulate upload first
      if (file && !formData.fileUrl) {
        simulateUpload();
        return;
      }
      
      onSave(formData);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToDelete) || [],
    });
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const fileUploadReplacementRef = React.useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {documentProp ? 'Update Document' : 'Upload Document'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {!documentProp && (
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: theme => theme.palette.action.hover,
                  '&:hover': {
                    backgroundColor: theme => theme.palette.action.selected,
                  },
                  mb: 2,
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept={allowedFileTypes.map(type => type.type).join(',')}
                />
                {file ? (
                  <Box>
                    <AttachmentIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFormData({
                          ...formData,
                          fileUrl: '',
                          fileType: '',
                          fileSize: 0,
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <UploadIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Drag & Drop or Click to Upload
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supported formats: PDF, Word, Excel, JPEG, PNG
                    </Typography>
                  </Box>
                )}
                {errors.file && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {errors.file}
                  </Typography>
                )}
              </Paper>
              
              {uploading && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Grid>
          )}
          
          <Grid item xs={12} sm={documentProp ? 8 : 6}>
            <TextField
              fullWidth
              label="Document Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={documentProp ? 4 : 6}>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={formData.fileType}
                onChange={handleDocTypeChange}
                label="Document Type"
                disabled={!!file}
              >
                {allowedFileTypes.map((type) => (
                  <MenuItem key={type.extension} value={type.extension}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  size="small"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </Box>
          </Grid>
          
          {documentProp && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Document
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachmentIcon color="primary" />
                  <Typography variant="body2">
                    {documentProp.name}.{documentProp.fileType} ({Math.round(documentProp.fileSize / 1024)} KB)
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Uploaded on {new Date(documentProp.uploadDate).toLocaleDateString()} • Version {documentProp.version}
                </Typography>
              </Box>
            </Grid>
          )}
          
          {documentProp && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                To replace this document with a new version, click the button below. The version number will be incremented automatically.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => fileUploadReplacementRef.current?.click()}
              >
                Upload New Version
              </Button>
              <input
                id="file-upload-replacement"
                ref={fileUploadReplacementRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept={allowedFileTypes.map(type => type.type).join(',')}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : documentProp ? 'Update Document' : 'Upload Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentUploadDialog; 