import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Paper,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Client, ClientStatus, ClientType, ClientContact } from '../../types/clientTypes';

interface ClientFormProps {
  client?: Client;
  open: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
}

const emptyClient: Client = {
  id: 0,
  name: '',
  status: ClientStatus.PROSPECT,
  type: ClientType.BUSINESS,
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  },
  email: '',
  phone: '',
  website: '',
  taxId: '',
  industry: '',
  notes: '',
  contacts: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totalMissions: 0,
  totalValue: 0,
  avgMissionValue: 0,
};

const emptyContact: ClientContact = {
  id: 0,
  name: '',
  position: '',
  email: '',
  phone: '',
  isPrimary: false,
};

const ClientForm: React.FC<ClientFormProps> = ({
  client,
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Client>(emptyClient);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<ClientContact>(emptyContact);
  const [contactIndex, setContactIndex] = useState<number | null>(null);

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData(emptyClient);
    }
    setErrors({});
  }, [client, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields with dot notation (e.g., address.street)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'address') {
        // Create a properly typed address object
        const currentAddress = formData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        };
        
        setFormData({
          ...formData,
          address: {
            ...currentAddress,
            [child]: value
          }
        });
      } 
      // We only have address as a nested object now, but this can be extended for future fields
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
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

  const handleNestedChange = handleChange;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.phone && !/^[\d\s()+-]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (formData.website && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/.test(formData.website)) {
      newErrors.website = 'Invalid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const updatedClient: Client = {
        ...formData,
        updatedAt: new Date().toISOString(),
        // If it's a new client, assign an ID
        id: formData.id || Date.now(),
      };

      onSave(updatedClient);
    }
  };

  const openContactForm = (contact?: ClientContact, index?: number) => {
    if (contact) {
      setCurrentContact(contact);
      setContactIndex(index ?? null);
    } else {
      setCurrentContact({
        ...emptyContact,
        id: Date.now(),
      });
      setContactIndex(null);
    }
    setContactFormOpen(true);
  };

  const closeContactForm = () => {
    setContactFormOpen(false);
    setCurrentContact(emptyContact);
    setContactIndex(null);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentContact({
      ...currentContact,
      [name]: value,
    });
  };

  const handleIsPrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentContact({
      ...currentContact,
      isPrimary: e.target.checked,
    });
  };

  const saveContact = () => {
    if (contactIndex !== null) {
      // Update existing contact
      const updatedContacts = [...formData.contacts];
      updatedContacts[contactIndex] = currentContact;

      // If this contact is set as primary, update other contacts
      if (currentContact.isPrimary) {
        updatedContacts.forEach((contact, idx) => {
          if (idx !== contactIndex) {
            contact.isPrimary = false;
          }
        });
      }

      setFormData({
        ...formData,
        contacts: updatedContacts,
      });
    } else {
      // Add new contact
      const updatedContacts = [...formData.contacts];
      
      // If this contact is set as primary, update other contacts
      if (currentContact.isPrimary) {
        updatedContacts.forEach(contact => {
          contact.isPrimary = false;
        });
      }
      
      updatedContacts.push(currentContact);
      
      setFormData({
        ...formData,
        contacts: updatedContacts,
      });
    }

    closeContactForm();
  };

  const deleteContact = (index: number) => {
    const updatedContacts = [...formData.contacts];
    updatedContacts.splice(index, 1);
    setFormData({
      ...formData,
      contacts: updatedContacts,
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{client ? 'Edit Client' : 'Add Client'}</Typography>
            <IconButton edge="end" color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Client Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleSelectChange}
                  >
                    {Object.values(ClientStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    label="Type"
                    onChange={handleSelectChange}
                  >
                    {Object.values(ClientType).map((type) => (
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
                  label="Email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  error={!!errors.website}
                  helperText={errors.website}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Industry"
                  name="industry"
                  value={formData.industry || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax ID"
                  name="taxId"
                  value={formData.taxId || ''}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom>
              Address
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={formData.address?.street || ''}
                  onChange={handleNestedChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address?.city || ''}
                  onChange={handleNestedChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  name="address.state"
                  value={formData.address?.state || ''}
                  onChange={handleNestedChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip/Postal Code"
                  name="address.zipCode"
                  value={formData.address?.zipCode || ''}
                  onChange={handleNestedChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="address.country"
                  value={formData.address?.country || 'USA'}
                  onChange={handleNestedChange}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom>
              Contacts
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">Contact List</Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => openContactForm()}
                >
                  Add Contact
                </Button>
              </Box>
              
              {formData.contacts.length > 0 ? (
                <Grid container spacing={2}>
                  {formData.contacts.map((contact, index) => (
                    <Grid item xs={12} key={contact.id}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle2">
                              {contact.name}
                              {contact.isPrimary && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="primary"
                                  sx={{ ml: 1 }}
                                >
                                  (Primary)
                                </Typography>
                              )}
                            </Typography>
                            {contact.position && (
                              <Typography variant="body2" color="text.secondary">
                                {contact.position}
                              </Typography>
                            )}
                            {contact.email && (
                              <Typography variant="body2">
                                Email: {contact.email}
                              </Typography>
                            )}
                            {contact.phone && (
                              <Typography variant="body2">
                                Phone: {contact.phone}
                              </Typography>
                            )}
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openContactForm(contact, index)}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => deleteContact(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No contacts added yet. Click "Add Contact" to add one.
                </Typography>
              )}
            </Paper>

            <Typography variant="subtitle1" gutterBottom>
              Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Save Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Form Dialog */}
      <Dialog open={contactFormOpen} onClose={closeContactForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {contactIndex !== null ? 'Edit Contact' : 'Add Contact'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={currentContact.name}
                onChange={handleContactChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={currentContact.position || ''}
                onChange={handleContactChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={currentContact.email || ''}
                onChange={handleContactChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={currentContact.phone || ''}
                onChange={handleContactChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl>
                <label>
                  <input
                    type="checkbox"
                    name="isPrimary"
                    checked={currentContact.isPrimary}
                    onChange={handleIsPrimaryChange}
                  />
                  {' '}Set as primary contact
                </label>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeContactForm}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={saveContact}>
            Save Contact
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientForm; 