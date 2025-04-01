import { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import MaterialList from '../components/MaterialList';

function MaterialsListPage() {
  const [selectedJobId, setSelectedJobId] = useState(null);
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Materials
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          // In a real app, this would navigate to a create material page
          // or open a modal
          onClick={() => console.log('Add material clicked')}
        >
          Add Material
        </Button>
      </Box>
      
      {/* Could add job selection dropdown here */}
      
      {/* Materials list component */}
      <MaterialList jobId={selectedJobId} />
    </Box>
  );
}

export default MaterialsListPage; 