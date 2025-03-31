// Client types for the application

export enum ClientStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PROSPECT = 'Prospect',
  ARCHIVED = 'Archived',
}

export enum ClientType {
  INDIVIDUAL = 'Individual',
  BUSINESS = 'Business',
  GOVERNMENT = 'Government',
  NONPROFIT = 'Non-Profit',
}

export enum ClientCommunicationType {
  EMAIL = 'Email',
  PHONE = 'Phone',
  MEETING = 'Meeting',
  VIDEO_CALL = 'Video Call',
  MESSAGE = 'Message',
  OTHER = 'Other',
}

export interface ClientContact {
  id: number;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface ClientCommunication {
  id: number;
  clientId: number;
  type: ClientCommunicationType;
  date: string;
  subject: string;
  content: string;
  userId: number; // user who made the communication
  userName: string;
}

export interface ClientDocument {
  id: number;
  clientId: number;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  version: number;
  tags?: string[];
}

export interface Client {
  id: number;
  name: string;
  status: ClientStatus;
  type: ClientType;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  industry?: string;
  notes?: string;
  contacts: ClientContact[];
  createdAt: string;
  updatedAt?: string;
  totalMissions: number;
  totalValue: number;
  avgMissionValue: number;
}

// Mock data creator function
export const createMockClients = (count: number = 10): Client[] => {
  const clients: Client[] = [];
  const statuses = Object.values(ClientStatus);
  const types = Object.values(ClientType);
  
  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const totalMissions = Math.floor(Math.random() * 50);
    const totalValue = Math.floor(Math.random() * 100000) + 5000;
    
    clients.push({
      id: i,
      name: `Client ${i}`,
      status,
      type,
      address: {
        street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'][Math.floor(Math.random() * 5)],
        state: ['NY', 'CA', 'IL', 'TX', 'FL'][Math.floor(Math.random() * 5)],
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'USA',
      },
      email: `client${i}@example.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://client${i}.example.com`,
      taxId: `TAX-${Math.floor(Math.random() * 900000) + 100000}`,
      industry: ['Technology', 'Construction', 'Agriculture', 'Real Estate', 'Energy', 'Media'][Math.floor(Math.random() * 6)],
      notes: `Client ${i} notes go here. This client is ${status.toLowerCase()} and is a ${type.toLowerCase()}.`,
      contacts: [
        {
          id: i * 10 + 1,
          name: `Contact ${i}A`,
          position: 'CEO',
          email: `contact${i}a@example.com`,
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          isPrimary: true,
        },
        {
          id: i * 10 + 2,
          name: `Contact ${i}B`,
          position: 'Project Manager',
          email: `contact${i}b@example.com`,
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          isPrimary: false,
        },
      ],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      totalMissions,
      totalValue,
      avgMissionValue: totalMissions > 0 ? Math.floor(totalValue / totalMissions) : 0,
    });
  }
  
  return clients;
};

// Mock communication data creator
export const createMockClientCommunications = (clientId: number, count: number = 5): ClientCommunication[] => {
  const communications: ClientCommunication[] = [];
  const types = Object.values(ClientCommunicationType);
  
  for (let i = 1; i <= count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    
    communications.push({
      id: clientId * 100 + i,
      clientId,
      type,
      date: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
      subject: `${type} communication ${i}`,
      content: `This is a sample ${type.toLowerCase()} communication with client ${clientId}. Message number ${i}.`,
      userId: Math.floor(Math.random() * 5) + 1,
      userName: `User ${Math.floor(Math.random() * 5) + 1}`,
    });
  }
  
  return communications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Mock document data creator
export const createMockClientDocuments = (clientId: number, count: number = 3): ClientDocument[] => {
  const documents: ClientDocument[] = [];
  const fileTypes = ['pdf', 'docx', 'xlsx', 'jpg', 'png'];
  const docNames = ['Contract', 'Proposal', 'Invoice', 'Agreement', 'Report', 'Certificate'];
  
  for (let i = 1; i <= count; i++) {
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const docName = docNames[Math.floor(Math.random() * docNames.length)];
    const fileSize = Math.floor(Math.random() * 10000) + 100; // in KB
    
    documents.push({
      id: clientId * 100 + i,
      clientId,
      name: `${docName} ${i}`,
      description: `${docName} document for client ${clientId}`,
      fileUrl: `/mock/documents/client_${clientId}_doc_${i}.${fileType}`,
      fileType,
      fileSize,
      uploadDate: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
      version: Math.floor(Math.random() * 3) + 1,
      tags: [`client-${clientId}`, docName.toLowerCase(), fileType],
    });
  }
  
  return documents.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
}; 