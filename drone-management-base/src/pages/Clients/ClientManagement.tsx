import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Container } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClientList, 
  ClientDetail, 
  ClientForm, 
  CommunicationDialog, 
  DocumentUploadDialog 
} from '../../components/Clients';
import { 
  Client, 
  ClientStatus, 
  ClientType, 
  ClientCommunication, 
  ClientDocument,
  createMockClients,
  createMockClientCommunications,
  createMockClientDocuments,
} from '../../types/clientTypes';

const ClientManagement: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewingClient, setIsViewingClient] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isCommunicationDialogOpen, setIsCommunicationDialogOpen] = useState(false);
  const [selectedClientIdForComm, setSelectedClientIdForComm] = useState<number | null>(null);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedClientIdForDoc, setSelectedClientIdForDoc] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load mock clients
    const mockClients = createMockClients(15);
    setClients(mockClients);
    
    // If ID param exists, find and select that client
    if (id) {
      const clientId = parseInt(id, 10);
      const client = mockClients.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
        setIsViewingClient(true);
      } else {
        // Client not found, navigate back to clients list
        navigate('/clients');
        setErrorMessage(`Client with ID ${id} not found`);
      }
    }
  }, [id, navigate]);

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsViewingClient(true);
    // Update URL without reload
    navigate(`/clients/${client.id}`, { replace: true });
  };

  const handleBackToList = () => {
    setIsViewingClient(false);
    setSelectedClient(null);
    // Update URL without reload
    navigate('/clients', { replace: true });
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setIsClientFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientFormOpen(true);
  };

  const handleDeleteClient = (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== clientId));
      setSuccessMessage('Client deleted successfully');
    }
  };

  const handleSaveClient = (client: Client) => {
    if (editingClient) {
      // Update existing client
      setClients(clients.map(c => c.id === client.id ? client : c));
      setSuccessMessage('Client updated successfully');
    } else {
      // Add new client
      setClients([...clients, client]);
      setSuccessMessage('Client added successfully');
    }
    setIsClientFormOpen(false);
  };

  const handleCloseClientForm = () => {
    setIsClientFormOpen(false);
    setEditingClient(null);
  };

  const handleAddCommunication = (clientId: number) => {
    setSelectedClientIdForComm(clientId);
    setIsCommunicationDialogOpen(true);
  };

  const handleSaveCommunication = (communication: ClientCommunication) => {
    // In a real app, this would save to the backend
    setSuccessMessage('Communication recorded successfully');
    setIsCommunicationDialogOpen(false);
    setSelectedClientIdForComm(null);
  };

  const handleCloseCommunicationDialog = () => {
    setIsCommunicationDialogOpen(false);
    setSelectedClientIdForComm(null);
  };

  const handleAddDocument = (clientId: number) => {
    setSelectedClientIdForDoc(clientId);
    setIsDocumentDialogOpen(true);
  };

  const handleSaveDocument = (document: ClientDocument) => {
    // In a real app, this would save to the backend
    setSuccessMessage('Document uploaded successfully');
    setIsDocumentDialogOpen(false);
    setSelectedClientIdForDoc(null);
  };

  const handleCloseDocumentDialog = () => {
    setIsDocumentDialogOpen(false);
    setSelectedClientIdForDoc(null);
  };

  const handleEmailClient = (client: Client) => {
    if (client.email) {
      window.open(`mailto:${client.email}`, '_blank');
    } else {
      setErrorMessage('No email address available for this client');
    }
  };

  const handleCallClient = (client: Client) => {
    if (client.phone) {
      window.open(`tel:${client.phone.replace(/\D/g, '')}`, '_blank');
    } else {
      setErrorMessage('No phone number available for this client');
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 2 }}>
        {isViewingClient && selectedClient ? (
          <ClientDetail
            client={selectedClient}
            onEdit={handleEditClient}
            onBack={handleBackToList}
            onAddCommunication={handleAddCommunication}
            onAddDocument={handleAddDocument}
          />
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                Client Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddClient}
              >
                Add Client
              </Button>
            </Box>
            
            <ClientList
              clients={clients}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              onAddClient={handleAddClient}
              onEmailClient={handleEmailClient}
              onCallClient={handleCallClient}
            />
          </>
        )}

        {/* Client Form Dialog */}
        <ClientForm
          client={editingClient || undefined}
          open={isClientFormOpen}
          onClose={handleCloseClientForm}
          onSave={handleSaveClient}
        />

        {/* Communication Dialog */}
        {selectedClientIdForComm && (
          <CommunicationDialog
            open={isCommunicationDialogOpen}
            clientId={selectedClientIdForComm}
            onClose={handleCloseCommunicationDialog}
            onSave={handleSaveCommunication}
          />
        )}

        {/* Document Upload Dialog */}
        {selectedClientIdForDoc && (
          <DocumentUploadDialog
            open={isDocumentDialogOpen}
            clientId={selectedClientIdForDoc}
            onClose={handleCloseDocumentDialog}
            onSave={handleSaveDocument}
          />
        )}

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ClientManagement; 