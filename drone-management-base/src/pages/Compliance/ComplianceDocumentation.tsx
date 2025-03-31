import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Tabs,
  Tab,
  Divider,
  Badge,
  Avatar,
  Alert,
  AlertTitle,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  FileCopy as DocumentIcon,
  VerifiedUser as CertificateIcon,
  AirplanemodeActive as DroneIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  EventAvailable as CalendarIcon,
  Visibility as ViewIcon,
  Description as FileIcon,
  Share as ShareIcon,
  FlightTakeoff as FlightIcon
} from '@mui/icons-material';
import FAALicenseManager from '../../components/Compliance/FAALicenseManager';
import FlightLogSystem from '../../components/Compliance/FlightLogSystem';
import SafetyDocuments from '../../components/Compliance/SafetyDocuments';
import useComplianceManagement from '../../hooks/useComplianceManagement';

// Define status types
type LicenseStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'Pending Renewal';
type DocumentStatus = 'Active' | 'Draft' | 'Archived' | 'Needs Update';

// License interface
interface License {
  id: number;
  type: string;
  licenseNumber: string;
  pilotName: string;
  issuedDate: string;
  expiryDate: string;
  status: LicenseStatus;
  attachments: number;
  notes: string;
}

// Document interface
interface Document {
  id: number;
  name: string;
  category: string;
  lastUpdated: string;
  status: DocumentStatus;
  version: string;
  createdBy: string;
  attachments: number;
}

// Checklist interface
interface Checklist {
  id: number;
  name: string;
  category: string;
  lastCompleted: string;
  nextDue: string;
  completedBy: string;
  items: ChecklistItem[];
}

// Checklist item interface
interface ChecklistItem {
  id: number;
  description: string;
  completed: boolean;
  mandatory: boolean;
}

/**
 * Compliance & Documentation page component
 */
const ComplianceDocumentation: React.FC = () => {
  const theme = useTheme();
  
  const [activeTab, setActiveTab] = useState(0);
  
  // Use our compliance management hook
  const compliance = useComplianceManagement();
  
  // Calculate alerts
  const alerts = compliance.calculateComplianceAlerts();
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Compliance & Documentation
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Compliance Alerts
        </Typography>
        
        {alerts.total === 0 ? (
          <Alert severity="success">
            <AlertTitle>All Clear</AlertTitle>
            No compliance alerts at this time.
          </Alert>
        ) : (
          <Alert severity="warning">
            <AlertTitle>Attention Required</AlertTitle>
            You have {alerts.total} compliance items that need your attention.
          </Alert>
        )}
        
        {alerts.expiringLicenses.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning">
              <AlertTitle>Expiring Licenses</AlertTitle>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {alerts.expiringLicenses.map(license => (
                  <Box component="li" key={license.id}>
                    {license.type} - {license.licenseNumber} expires on {new Date(license.expiryDate).toLocaleDateString()}
                  </Box>
                ))}
              </Box>
            </Alert>
          </Box>
        )}
        
        {alerts.reviewDueDocuments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              <AlertTitle>Documents Due for Review</AlertTitle>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {alerts.reviewDueDocuments.map(doc => (
                  <Box component="li" key={doc.id}>
                    {doc.title} - Review due on {doc.reviewDate ? new Date(doc.reviewDate).toLocaleDateString() : 'Unknown'}
                  </Box>
                ))}
              </Box>
            </Alert>
          </Box>
        )}
      </Box>
      
      {/* Compliance Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CertificateIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Licenses & Registrations
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">
                  Valid
                </Typography>
                <Chip 
                  label={compliance.licenses.filter(l => l.status === 'Valid').length} 
                  color="success" 
                  size="small" 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1">
                  Expiring Soon
                </Typography>
                <Chip 
                  label={compliance.licenses.filter(l => l.status === 'Expiring Soon').length} 
                  color="warning" 
                  size="small" 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1">
                  Expired
                </Typography>
                <Chip 
                  label={compliance.licenses.filter(l => l.status === 'Expired').length} 
                  color="error" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FlightIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Flight Logs
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">
                  Total Flights
                </Typography>
                <Chip 
                  label={compliance.flightLogs.length} 
                  color="primary" 
                  size="small" 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1">
                  Flight Hours
                </Typography>
                <Chip 
                  label={Math.round(compliance.flightLogs.reduce((acc, log) => acc + log.duration, 0) / 60)} 
                  color="info" 
                  size="small" 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1">
                  Drones Used
                </Typography>
                <Chip 
                  label={new Set(compliance.flightLogs.map(log => log.droneId)).size} 
                  color="success" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Safety Documents
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">
                  Current
                </Typography>
                <Chip 
                  label={compliance.safetyDocuments.filter(d => d.status === 'Current').length} 
                  color="success" 
                  size="small" 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1">
                  Under Review
                </Typography>
                <Chip 
                  label={compliance.safetyDocuments.filter(d => d.status === 'Under Review').length} 
                  color="warning" 
                  size="small" 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body1">
                  Categories
                </Typography>
                <Chip 
                  label={new Set(compliance.safetyDocuments.map(d => d.category)).size} 
                  color="info" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for different compliance sections */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="compliance tabs">
            <Tab label="Licenses & Registrations" />
            <Tab label="Flight Logs" />
            <Tab label="Safety Documents" />
          </Tabs>
        </Box>
        
        {/* License Tab */}
        {activeTab === 0 && (
          <Box sx={{ py: 3 }}>
            <FAALicenseManager
              licenses={compliance.licenses}
              onAddLicense={compliance.addLicense}
              onUpdateLicense={compliance.updateLicense}
              onDeleteLicense={compliance.deleteLicense}
              onSendReminder={compliance.sendLicenseReminder}
              onExportCsv={compliance.exportLicensesToCsv}
              onImportCsv={compliance.importLicensesFromCsv}
            />
          </Box>
        )}
        
        {/* Flight Logs Tab */}
        {activeTab === 1 && (
          <Box sx={{ py: 3 }}>
            <FlightLogSystem
              flightLogs={compliance.flightLogs}
              onAddFlightLog={compliance.addFlightLog}
              onUpdateFlightLog={compliance.updateFlightLog}
              onDeleteFlightLog={compliance.deleteFlightLog}
              onExportLogs={compliance.exportFlightLogs}
              pilots={compliance.pilots}
              drones={compliance.drones}
            />
          </Box>
        )}
        
        {/* Safety Documents Tab */}
        {activeTab === 2 && (
          <Box sx={{ py: 3 }}>
            <SafetyDocuments
              documents={compliance.safetyDocuments}
              onAddDocument={compliance.addSafetyDocument}
              onUpdateDocument={compliance.updateSafetyDocument}
              onDeleteDocument={compliance.deleteSafetyDocument}
              onViewDocument={compliance.viewSafetyDocument}
              onDownloadDocument={compliance.downloadSafetyDocument}
              onUploadFile={compliance.uploadDocumentFile}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ComplianceDocumentation; 