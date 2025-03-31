import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Box,
} from '@mui/material';
import { ClientCommunication, ClientCommunicationType } from '../../types/clientTypes';

interface CommunicationDialogProps {
  open: boolean;
  clientId: number;
  communication?: ClientCommunication;
  onClose: () => void;
  onSave: (communication: ClientCommunication) => void;
}

const CommunicationDialog: React.FC<CommunicationDialogProps> = ({
  open,
  clientId,
  communication,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ClientCommunication>({
    id: 0,
    clientId: clientId,
    type: ClientCommunicationType.EMAIL,
    date: new Date().toISOString(),
    subject: '',
    content: '',
    userId: 1, // Hardcoded for now, would come from auth context in a real app
    userName: 'Current User', // Hardcoded for now, would come from auth context in a real app
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (communication) {
      setFormData(communication);
    } else {
      setFormData({
        id: Date.now(),
        clientId: clientId,
        type: ClientCommunicationType.EMAIL,
        date: new Date().toISOString(),
        subject: '',
        content: '',
        userId: 1,
        userName: 'Current User',
      });
    }
    setErrors({});
  }, [communication, clientId, open]);

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

  const handleTypeChange = (e: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      type: e.target.value as ClientCommunicationType,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {communication ? 'Edit Communication' : 'Add Communication'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Communication Type</InputLabel>
              <Select
                value={formData.type}
                onChange={handleTypeChange}
                label="Communication Type"
              >
                {Object.values(ClientCommunicationType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Date & Time"
              name="date"
              value={formData.date ? new Date(formData.date).toISOString().substring(0, 16) : ''}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={!!errors.subject}
              helperText={errors.subject}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              error={!!errors.content}
              helperText={errors.content}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                This communication will be recorded as created by: {formData.userName}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommunicationDialog; 