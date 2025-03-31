import { useState, useCallback } from 'react';
import { 
  License, 
  LicenseStatus 
} from '../components/Compliance/FAALicenseManager';
import {
  FlightLog,
  FlightPurpose,
  WeatherCondition
} from '../components/Compliance/FlightLogSystem';
import {
  SafetyDocument,
  DocumentCategory,
  DocumentStatus
} from '../components/Compliance/SafetyDocuments';

// Generate a random id for new items
const generateId = (): number => Math.floor(Math.random() * 10000);

// Sample data for licenses
const sampleLicenses: License[] = [
  {
    id: 1,
    type: 'Part 107 Remote Pilot Certificate',
    licenseNumber: 'FAA-P107-12345',
    pilotName: 'John Smith',
    issuedDate: new Date(2022, 5, 15),
    expiryDate: new Date(2024, 5, 15),
    status: 'Valid',
    attachments: 2,
    notes: 'Primary commercial drone operator',
    issuer: 'Federal Aviation Administration',
    warningThreshold: 90,
    reminderSent: false,
    renewalUrl: 'https://faadronezone.faa.gov/'
  },
  {
    id: 2,
    type: 'Drone Registration - Commercial',
    licenseNumber: 'FA1234567',
    pilotName: 'Phantom Pro X',
    issuedDate: new Date(2023, 1, 10),
    expiryDate: new Date(2026, 1, 10),
    status: 'Valid',
    attachments: 1,
    notes: 'Primary inspection drone for construction sites',
    issuer: 'Federal Aviation Administration',
    warningThreshold: 90,
    reminderSent: false,
    droneId: 1
  },
  {
    id: 3,
    type: 'FAA Waiver - Night Operations',
    licenseNumber: 'WAIVER-N-987654',
    pilotName: 'Sarah Johnson',
    issuedDate: new Date(2023, 3, 20),
    expiryDate: new Date(2023, 9, 20),
    status: 'Expiring Soon',
    attachments: 3,
    notes: 'Covers night operations in the downtown area for infrastructure inspection',
    issuer: 'Federal Aviation Administration',
    warningThreshold: 60,
    reminderSent: true,
    lastReminderDate: new Date(2023, 8, 15),
    associatedDrones: ['Phantom Pro X', 'SkyView Max'],
    authorityContactInfo: 'FAA Regional Office: (555) 123-4567'
  },
  {
    id: 4,
    type: 'Insurance Certificate',
    licenseNumber: 'INS-DRONE-5678',
    pilotName: 'Drone Operations LLC',
    issuedDate: new Date(2023, 0, 1),
    expiryDate: new Date(2023, 11, 31),
    status: 'Valid',
    attachments: 1,
    notes: 'Liability insurance covering all drone operations up to $1M',
    issuer: 'DroneGuard Insurance Co.',
    warningThreshold: 30,
    reminderSent: false,
    renewalUrl: 'https://droneguardinsurance.com/renew'
  },
  {
    id: 5,
    type: 'Part 107 Knowledge Test',
    licenseNumber: 'TEST-107-45678',
    pilotName: 'Michael Brown',
    issuedDate: new Date(2023, 7, 5),
    expiryDate: new Date(2025, 7, 5),
    status: 'Valid',
    attachments: 0,
    notes: 'New pilot in training',
    issuer: 'Federal Aviation Administration',
    warningThreshold: 90,
    reminderSent: false
  }
];

// Sample data for flight logs
const sampleFlightLogs: FlightLog[] = [
  {
    id: 1,
    date: new Date(2023, 8, 15),
    pilot: 'John Smith',
    droneId: 1,
    droneName: 'Phantom Pro X',
    startTime: new Date(2023, 8, 15, 10, 0),
    endTime: new Date(2023, 8, 15, 10, 25),
    duration: 25,
    location: '123 Main St, Anytown, USA',
    purpose: 'Inspection',
    weatherConditions: 'Clear',
    notes: 'Routine building inspection, all went well',
    batteryLevels: {
      start: 100,
      end: 65
    },
    maxAltitude: 120,
    maxDistance: 800
  },
  {
    id: 2,
    date: new Date(2023, 8, 17),
    pilot: 'Sarah Johnson',
    droneId: 2,
    droneName: 'SkyView Max',
    startTime: new Date(2023, 8, 17, 14, 30),
    endTime: new Date(2023, 8, 17, 15, 15),
    duration: 45,
    location: 'City Park, Anytown, USA',
    purpose: 'Mapping/Survey',
    weatherConditions: 'Partly Cloudy',
    notes: 'Park area mapping project for city planning',
    batteryLevels: {
      start: 100,
      end: 40
    },
    flightPath: 'path_data_2.gpx',
    hasMedia: true,
    mediaLocations: ['survey_photos/batch1', 'survey_photos/batch2']
  },
  {
    id: 3,
    date: new Date(2023, 8, 20),
    pilot: 'John Smith',
    droneId: 3,
    droneName: 'Surveyor One',
    startTime: new Date(2023, 8, 20, 8, 0),
    endTime: new Date(2023, 8, 20, 8, 40),
    duration: 40,
    location: 'Construction Site #5, Anytown, USA',
    purpose: 'Inspection',
    weatherConditions: 'Cloudy',
    notes: 'Progress monitoring for construction site',
    batteryLevels: {
      start: 95,
      end: 45
    },
    incidents: 'Brief signal loss at east corner of site, recovered quickly',
    maxAltitude: 200,
    maxDistance: 1200
  },
  {
    id: 4,
    date: new Date(2023, 8, 25),
    pilot: 'Sarah Johnson',
    droneId: 1,
    droneName: 'Phantom Pro X',
    startTime: new Date(2023, 8, 25, 19, 30),
    endTime: new Date(2023, 8, 25, 20, 0),
    duration: 30,
    location: 'Downtown Bridge, Anytown, USA',
    purpose: 'Photography',
    weatherConditions: 'Clear',
    notes: 'Night photography session, operating under night waiver',
    batteryLevels: {
      start: 100,
      end: 60
    },
    hasMedia: true,
    mediaLocations: ['bridge_photos/night_session']
  }
];

// Sample data for safety documents
const sampleSafetyDocuments: SafetyDocument[] = [
  {
    id: 1,
    title: 'Standard Operating Procedures for Commercial Drone Operations',
    category: 'Standard Operating Procedure',
    status: 'Current',
    createdDate: new Date(2023, 2, 15),
    lastUpdated: new Date(2023, 2, 15),
    version: '1.2',
    author: 'Operations Team',
    description: 'Comprehensive guide for all standard drone operations including pre-flight checklists, communication protocols, and emergency procedures.',
    fileName: 'SOP_Drone_Operations_v1.2.pdf',
    fileSize: 2450000,
    reviewDate: new Date(2023, 11, 15),
    approvedBy: 'Jane Wilson, Operations Director'
  },
  {
    id: 2,
    title: 'Emergency Response Plan',
    category: 'Emergency Procedures',
    status: 'Current',
    createdDate: new Date(2023, 5, 10),
    lastUpdated: new Date(2023, 7, 5),
    version: '2.0',
    author: 'Safety Committee',
    description: 'Procedures to follow in case of equipment failure, accidents, or other emergency situations during drone operations.',
    fileName: 'Emergency_Response_Plan_v2.0.docx',
    fileSize: 1750000,
    reviewDate: new Date(2024, 1, 1),
    approvedBy: 'Safety Committee Board'
  },
  {
    id: 3,
    title: 'Pre-Flight Inspection Checklist',
    category: 'Pre-Flight Checklist',
    status: 'Current',
    createdDate: new Date(2023, 4, 5),
    lastUpdated: new Date(2023, 4, 5),
    version: '1.0',
    author: 'Technical Team',
    description: 'Comprehensive checklist for ensuring all equipment is in proper working order before flight.',
    fileName: 'Pre_Flight_Checklist_v1.0.pdf',
    fileSize: 980000,
    approvedBy: 'Maintenance Manager'
  },
  {
    id: 4,
    title: 'Risk Assessment Template for Drone Operations',
    category: 'Risk Assessment',
    status: 'Under Review',
    createdDate: new Date(2023, 6, 12),
    lastUpdated: new Date(2023, 8, 20),
    version: '0.9',
    author: 'Risk Management Team',
    description: 'Template for assessing potential risks for drone operations in various environments.',
    fileName: 'Risk_Assessment_Template_v0.9.xlsx',
    fileSize: 1200000,
    reviewDate: new Date(2023, 9, 30)
  },
  {
    id: 5,
    title: 'Part 107 Compliance Guide',
    category: 'Regulatory Compliance',
    status: 'Current',
    createdDate: new Date(2023, 3, 20),
    lastUpdated: new Date(2023, 6, 1),
    version: '2.1',
    author: 'Legal Department',
    description: 'Guide for ensuring all operations comply with FAA Part 107 regulations for commercial drone operations.',
    fileName: 'Part_107_Compliance_Guide_v2.1.pdf',
    fileSize: 3200000,
    reviewDate: new Date(2023, 11, 1),
    approvedBy: 'Legal Counsel'
  }
];

export interface ComplianceContextType {
  // Licenses
  licenses: License[];
  addLicense: (license: Omit<License, 'id'>) => void;
  updateLicense: (id: number, license: Omit<License, 'id'>) => void;
  deleteLicense: (id: number) => void;
  sendLicenseReminder: (id: number) => void;
  exportLicensesToCsv: () => void;
  importLicensesFromCsv: (file: File) => void;
  
  // Flight Logs
  flightLogs: FlightLog[];
  addFlightLog: (log: Omit<FlightLog, 'id'>) => void;
  updateFlightLog: (id: number, log: Omit<FlightLog, 'id'>) => void;
  deleteFlightLog: (id: number) => void;
  exportFlightLogs: () => void;
  
  // Safety Documents
  safetyDocuments: SafetyDocument[];
  addSafetyDocument: (document: Omit<SafetyDocument, 'id'>) => void;
  updateSafetyDocument: (id: number, document: Omit<SafetyDocument, 'id'>) => void;
  deleteSafetyDocument: (id: number) => void;
  viewSafetyDocument: (document: SafetyDocument) => void;
  downloadSafetyDocument: (document: SafetyDocument) => void;
  uploadDocumentFile: (file: File, documentId?: number) => Promise<string>;
  
  // Pilots and Drones for Reference
  pilots: string[];
  drones: Array<{ id: number; name: string }>;
  
  // Alert Management
  calculateExpiringLicenses: () => License[];
  calculateComplianceAlerts: () => { 
    expiringLicenses: License[]; 
    reviewDueDocuments: SafetyDocument[];
    total: number;
  };
}

export const useComplianceManagement = (): ComplianceContextType => {
  // State for licenses
  const [licenses, setLicenses] = useState<License[]>(sampleLicenses);
  
  // State for flight logs
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>(sampleFlightLogs);
  
  // State for safety documents
  const [safetyDocuments, setSafetyDocuments] = useState<SafetyDocument[]>(sampleSafetyDocuments);
  
  // Sample pilots and drones for reference
  const pilots = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'Robert Wilson'];
  const drones = [
    { id: 1, name: 'Phantom Pro X' },
    { id: 2, name: 'SkyView Max' },
    { id: 3, name: 'Surveyor One' },
    { id: 4, name: 'AgriDrone 3000' },
    { id: 5, name: 'Inspection Mini' }
  ];
  
  // License Management
  const addLicense = useCallback((license: Omit<License, 'id'>) => {
    const newLicense: License = {
      id: generateId(),
      ...license
    };
    setLicenses(prevLicenses => [...prevLicenses, newLicense]);
  }, []);
  
  const updateLicense = useCallback((id: number, license: Omit<License, 'id'>) => {
    setLicenses(prevLicenses => 
      prevLicenses.map(l => l.id === id ? { ...license, id } : l)
    );
  }, []);
  
  const deleteLicense = useCallback((id: number) => {
    setLicenses(prevLicenses => prevLicenses.filter(l => l.id !== id));
  }, []);
  
  const sendLicenseReminder = useCallback((id: number) => {
    // In a real app, this would send an email or notification
    setLicenses(prevLicenses => 
      prevLicenses.map(l => {
        if (l.id === id) {
          return { 
            ...l, 
            reminderSent: true,
            lastReminderDate: new Date()
          };
        }
        return l;
      })
    );
    console.log(`Reminder sent for license ID: ${id}`);
  }, []);
  
  const exportLicensesToCsv = useCallback(() => {
    // In a real app, this would generate and download a CSV file
    console.log('Exporting licenses to CSV...');
    console.log(licenses);
    alert('Licenses exported to CSV');
  }, [licenses]);
  
  const importLicensesFromCsv = useCallback((file: File) => {
    // In a real app, this would parse the CSV and add the licenses
    console.log(`Importing licenses from file: ${file.name}`);
    
    // Simulate adding a sample license after import
    const newLicense: License = {
      id: generateId(),
      type: 'Imported License',
      licenseNumber: `IMP-${Math.floor(Math.random() * 10000)}`,
      pilotName: 'Imported Pilot',
      issuedDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: 'Valid',
      attachments: 0,
      notes: `Imported from ${file.name}`,
      issuer: 'Federal Aviation Administration',
      warningThreshold: 90,
      reminderSent: false
    };
    
    setLicenses(prevLicenses => [...prevLicenses, newLicense]);
    alert(`Successfully imported licenses from ${file.name}`);
  }, []);
  
  // Flight Log Management
  const addFlightLog = useCallback((log: Omit<FlightLog, 'id'>) => {
    const newLog: FlightLog = {
      id: generateId(),
      ...log
    };
    setFlightLogs(prevLogs => [...prevLogs, newLog]);
  }, []);
  
  const updateFlightLog = useCallback((id: number, log: Omit<FlightLog, 'id'>) => {
    setFlightLogs(prevLogs => 
      prevLogs.map(l => l.id === id ? { ...log, id } : l)
    );
  }, []);
  
  const deleteFlightLog = useCallback((id: number) => {
    setFlightLogs(prevLogs => prevLogs.filter(l => l.id !== id));
  }, []);
  
  const exportFlightLogs = useCallback(() => {
    // In a real app, this would generate and download a CSV file
    console.log('Exporting flight logs...');
    console.log(flightLogs);
    alert('Flight logs exported');
  }, [flightLogs]);
  
  // Safety Document Management
  const addSafetyDocument = useCallback((document: Omit<SafetyDocument, 'id'>) => {
    const newDocument: SafetyDocument = {
      id: generateId(),
      ...document
    };
    setSafetyDocuments(prevDocs => [...prevDocs, newDocument]);
  }, []);
  
  const updateSafetyDocument = useCallback((id: number, document: Omit<SafetyDocument, 'id'>) => {
    setSafetyDocuments(prevDocs => 
      prevDocs.map(d => d.id === id ? { ...document, id } : d)
    );
  }, []);
  
  const deleteSafetyDocument = useCallback((id: number) => {
    setSafetyDocuments(prevDocs => prevDocs.filter(d => d.id !== id));
  }, []);
  
  const viewSafetyDocument = useCallback((document: SafetyDocument) => {
    // In a real app, this would open the document for viewing
    console.log(`Viewing document: ${document.title}`);
    alert(`Viewing document: ${document.title}`);
  }, []);
  
  const downloadSafetyDocument = useCallback((document: SafetyDocument) => {
    // In a real app, this would download the document
    console.log(`Downloading document: ${document.title}`);
    alert(`Document downloaded: ${document.title}`);
  }, []);
  
  const uploadDocumentFile = useCallback(async (file: File, documentId?: number): Promise<string> => {
    // In a real app, this would upload the file to a server and return the URL
    console.log(`Uploading file: ${file.name} for document ID: ${documentId || 'new'}`);
    
    // Simulate a delay for upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a fake URL
    const fakeUrl = `https://example.com/documents/${file.name.replace(/\s+/g, '_')}`;
    console.log(`File uploaded successfully. URL: ${fakeUrl}`);
    
    return fakeUrl;
  }, []);
  
  // Alert Management
  const calculateExpiringLicenses = useCallback((): License[] => {
    const now = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(now.getDate() + 90);
    
    return licenses.filter(license => {
      const expiryDate = new Date(license.expiryDate);
      return expiryDate > now && expiryDate <= ninetyDaysFromNow;
    });
  }, [licenses]);
  
  const calculateComplianceAlerts = useCallback(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    // Check for expiring licenses
    const expiringLicenses = licenses.filter(license => {
      const expiryDate = new Date(license.expiryDate);
      const warningDate = new Date(expiryDate);
      warningDate.setDate(warningDate.getDate() - license.warningThreshold);
      
      return expiryDate > now && now >= warningDate;
    });
    
    // Check for documents due for review
    const reviewDueDocuments = safetyDocuments.filter(doc => {
      if (!doc.reviewDate) return false;
      
      const reviewDate = new Date(doc.reviewDate);
      return reviewDate > now && reviewDate <= thirtyDaysFromNow;
    });
    
    return {
      expiringLicenses,
      reviewDueDocuments,
      total: expiringLicenses.length + reviewDueDocuments.length
    };
  }, [licenses, safetyDocuments]);
  
  return {
    // Licenses
    licenses,
    addLicense,
    updateLicense,
    deleteLicense,
    sendLicenseReminder,
    exportLicensesToCsv,
    importLicensesFromCsv,
    
    // Flight Logs
    flightLogs,
    addFlightLog,
    updateFlightLog,
    deleteFlightLog,
    exportFlightLogs,
    
    // Safety Documents
    safetyDocuments,
    addSafetyDocument,
    updateSafetyDocument,
    deleteSafetyDocument,
    viewSafetyDocument,
    downloadSafetyDocument,
    uploadDocumentFile,
    
    // Pilots and Drones for Reference
    pilots,
    drones,
    
    // Alert Management
    calculateExpiringLicenses,
    calculateComplianceAlerts
  };
};

export default useComplianceManagement; 