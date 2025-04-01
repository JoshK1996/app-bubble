import { useState } from 'react';
import { API, Storage } from 'aws-amplify';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  MenuItem,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { processExcelImport } from '../graphql/mutations';

function ImportPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // In a real app, this would be fetched from API
  const mockJobs = [
    { id: 'job-1', jobNumber: 'J-001', jobName: 'Downtown Hospital Project' },
    { id: 'job-2', jobNumber: 'J-002', jobName: 'Office Tower Renovation' },
    { id: 'job-3', jobNumber: 'J-003', jobName: 'School District HVAC Upgrade' }
  ];
  
  const steps = ['Select Job', 'Choose File', 'Upload & Process'];
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      // Move to next step
      setActiveStep(2);
    }
  };
  
  const handleJobChange = (event) => {
    setSelectedJobId(event.target.value);
    // Move to next step if job is selected
    if (event.target.value) {
      setActiveStep(1);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !selectedJobId) {
      setError('Please select both a job and a file');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Upload file to S3
      const filename = `imports/${selectedJobId}/${Date.now()}-${selectedFile.name}`;
      await Storage.put(filename, selectedFile, {
        contentType: selectedFile.type,
        progressCallback(progress) {
          const progressPercentage = (progress.loaded / progress.total) * 100;
          setUploadProgress(progressPercentage);
        }
      });
      
      // In a real app, this would call the GraphQL mutation
      // const response = await API.graphql({
      //   query: processExcelImport,
      //   variables: {
      //     jobId: selectedJobId,
      //     fileKey: filename
      //   }
      // });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful response
      setSuccessMessage('Excel file uploaded and processed successfully. 25 materials were imported.');
      
      // Reset state
      setSelectedFile(null);
      setUploadProgress(0);
      setActiveStep(0);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload or process the file. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Import Materials
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        {activeStep === 0 && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Select the job to import materials for:
            </Typography>
            <TextField
              select
              fullWidth
              label="Select Job"
              value={selectedJobId}
              onChange={handleJobChange}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              {mockJobs.map((job) => (
                <MenuItem key={job.id} value={job.id}>
                  {job.jobNumber} - {job.jobName}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}
        
        {activeStep === 1 && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Upload an Excel file containing your materials data:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Select Excel File
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                Supported formats: .xlsx, .xls (max 10MB)
              </Typography>
            </Box>
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Review and confirm your upload:
            </Typography>
            
            <Box sx={{ my: 2 }}>
              <Typography variant="body2">
                <strong>Selected Job:</strong> {mockJobs.find(job => job.id === selectedJobId)?.jobName}
              </Typography>
              <Typography variant="body2">
                <strong>File:</strong> {selectedFile?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Size:</strong> {Math.round(selectedFile?.size / 1024)} KB
              </Typography>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
                <CircularProgress variant={uploadProgress > 0 ? "determinate" : "indeterminate"} value={uploadProgress} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {uploadProgress < 100 ? 'Uploading file...' : 'Processing materials...'}
                </Typography>
              </Box>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleUpload}
                sx={{ mt: 2 }}
              >
                Upload and Process
              </Button>
            )}
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Excel File Requirements
        </Typography>
        <Typography variant="body2" paragraph>
          Your Excel file should contain the following columns:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Box component="li">
            <Typography variant="body2"><strong>materialIdentifier</strong> - A unique identifier for the material (optional)</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2"><strong>description</strong> - Description of the material (required)</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2"><strong>materialType</strong> - Type of material (PIPE, VALVE, FITTING, EQUIPMENT, SPOOL, DUCT, OTHER)</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2"><strong>systemType</strong> - System type (CHW, HHW, COND, DUCT_EXHAUST, DRAIN, OTHER)</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2"><strong>locationLevel</strong> - Building level/floor (optional)</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2"><strong>locationZone</strong> - Zone within level (optional)</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2"><strong>quantityEstimated</strong> - Estimated quantity (numeric, default: 1)</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2"><strong>unitOfMeasure</strong> - Unit of measure (EA, FT, etc., default: EA)</Typography>
          </Box>
        </Box>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          // In a real app, this would download a template file
          onClick={() => console.log('Download template clicked')}
        >
          Download Template
        </Button>
      </Paper>
    </Box>
  );
}

export default ImportPage; 