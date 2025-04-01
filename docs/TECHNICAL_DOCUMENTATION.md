# Construction Material Tracking System - Technical Documentation

## System Overview

The Construction Material Tracking System is a comprehensive solution for tracking construction materials throughout their lifecycle, from estimation to installation. The system enables real-time tracking, QR code scanning, and historical audit trails for all material operations.

## Technology Stack

### Frontend
- **Framework**: React.js (Create React App)
- **UI Library**: Material-UI
- **State Management**: React Hooks and Context API
- **API Communication**: Amplify API (GraphQL)
- **Authentication**: Amplify Auth
- **QR Code Scanning**: react-zxing
- **QR Code Generation**: react-qr-code
- **File Processing**: xlsx.js
- **Offline Support**: Service Workers, IndexedDB

### Backend
- **API**: AWS AppSync (GraphQL)
- **Authentication**: Amazon Cognito
- **Compute**: AWS Lambda
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **CDN**: Amazon CloudFront
- **Deployment**: AWS Amplify, AWS SAM

## Project Structure

```
construction-tracker/
├── packages/
│   ├── client/                  # Frontend React application
│   │   ├── public/              # Static files
│   │   │   ├── serviceWorker.js # Service worker for offline support
│   │   │   └── manifest.json    # PWA manifest
│   │   ├── src/
│   │   │   ├── components/      # Reusable React components
│   │   │   ├── contexts/        # React context providers
│   │   │   ├── graphql/         # GraphQL queries and mutations
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── pages/           # Page components
│   │   │   ├── utils/           # Utility functions
│   │   │   └── App.js           # Main application component
│   ├── api/                     # Backend API and Lambda functions
│   │   ├── functions/           # Lambda function implementations
│   │   ├── resolvers/           # AppSync resolver templates
│   │   ├── schema.graphql       # GraphQL schema
│   │   └── template.yaml        # AWS SAM template
├── docs/                        # Documentation
├── ARCHITECTURE.md              # System architecture overview
└── DEPLOYMENT.md                # Deployment guide
```

## Core Data Models

### Job
Represents a construction project with associated materials.

```graphql
type Job @model
  @auth(rules: [
    { allow: groups, groups: ["Admin", "Estimator", "Detailer", "Purchaser", "WarehouseStaff", "FieldInstaller"], operations: [read] },
    { allow: groups, groups: ["Admin", "Estimator"], operations: [create, update, delete] }
  ]) {
  id: ID!
  jobNumber: String!
  jobName: String!
  client: String
  location: String
  description: String
  startDate: AWSDate
  endDate: AWSDate
  status: JobStatus!
  materials: [Material] @hasMany(indexName: "byJob", fields: ["id"])
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}
```

### Material
Represents a construction material that is tracked through its lifecycle.

```graphql
type Material @model
  @auth(rules: [
    { allow: groups, groups: ["Admin", "Estimator", "Detailer", "Purchaser", "WarehouseStaff", "FieldInstaller"], operations: [read] },
    { allow: groups, groups: ["Admin", "Estimator", "Detailer"], operations: [create, update] },
    { allow: groups, groups: ["Admin"], operations: [delete] }
  ]) {
  id: ID!
  job: Job @belongsTo(fields: ["jobId"])
  jobId: ID! @index(name: "byJob")
  materialIdentifier: String!
  description: String
  materialType: String
  systemType: String
  qrCodeData: String!
  status: MaterialStatus!
  quantityEstimated: Float
  unitOfMeasure: String
  costEstimated: Float
  locationLevel: String
  locationZone: String
  detailDrawingId: String
  createdBy: String
  lastUpdatedBy: String
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}
```

### MaterialHistory
Tracks all changes made to a material for auditing purposes.

```graphql
type MaterialHistory 
  @auth(rules: [
    { allow: groups, groups: ["Admin", "Estimator", "Detailer", "Purchaser", "WarehouseStaff", "FieldInstaller"], operations: [read] },
    { allow: groups, groups: ["Admin"], operations: [delete] }
  ]) {
  id: ID!
  materialId: ID! @index(name: "byMaterialId")
  timestamp: AWSDateTime!
  action: String!
  fieldName: String
  oldValue: String
  newValue: String
  userId: String
  notes: String
}
```

## Authentication and Authorization

### User Groups and Roles

The system implements role-based access control using Cognito User Groups:

1. **Admin**: Full access to all system features
2. **Estimator**: Create and manage jobs, create and update materials
3. **Detailer**: Update material details and status
4. **Purchaser**: View materials and update procurement status
5. **WarehouseStaff**: Manage material fabrication and shipping
6. **FieldInstaller**: Update material status on-site

### GraphQL Authorization

Authorization is implemented at the GraphQL schema level using AppSync `@auth` directives:

```graphql
@auth(rules: [
  { allow: groups, groups: ["Admin", "Estimator", "Detailer", "Purchaser", "WarehouseStaff", "FieldInstaller"], operations: [read] },
  { allow: groups, groups: ["Admin", "Estimator", "Detailer"], operations: [create, update] },
  { allow: groups, groups: ["Admin"], operations: [delete] }
])
```

## Lambda Functions

### 1. Update Material Status

**Function**: `updateMaterialStatus`

**Purpose**: Updates the status of a material and records the change in the history table.

**Key Features**:
- Validates the status transition is allowed
- Updates the material record
- Creates a history record for auditing
- Returns data in the format expected by AppSync

### 2. List Material History

**Function**: `listMaterialHistory`

**Purpose**: Retrieves the history records for a specific material.

**Key Features**:
- Uses a DynamoDB Global Secondary Index for efficient queries
- Implements pagination with tokens
- Sorts by timestamp (newest first)

### 3. Get Material by QR Code

**Function**: `getMaterialByQrCode`

**Purpose**: Retrieves a material using its QR code data.

**Key Features**:
- Uses a DynamoDB Global Secondary Index for efficient lookup
- Handles pagination
- Provides error handling for non-existent QR codes

### 4. Process Excel Import

**Function**: `processExcelImport`

**Purpose**: Processes Excel file imports to create or update materials.

**Key Features**:
- Downloads and parses Excel files from S3
- Validates required columns
- Creates or updates materials in DynamoDB
- Creates history records for each change
- Emits events for real-time updates
- Handles batch processing with error recovery

## Real-time Updates

Real-time updates are implemented using AppSync subscriptions:

```graphql
type Subscription {
  onMaterialStatusChanged(materialId: ID!): StatusUpdateResponse
    @aws_subscribe(mutations: ["updateMaterialStatus"])
  
  onMaterialImported(jobId: ID!): Material
    @aws_subscribe(mutations: ["processExcelImport"])
}
```

Clients can subscribe to these events to receive real-time updates when:
1. A material's status changes
2. New materials are imported from Excel

## Offline Support

The application implements Progressive Web App (PWA) features for offline support:

### 1. Service Worker

The service worker (`serviceWorker.js`) handles:
- Caching of application assets
- Intercepting network requests
- Serving cached content when offline
- Background sync when connectivity is restored

### 2. Local Storage

The application uses:
- IndexedDB for storing material data offline
- Queue for storing pending operations
- Background sync for reconciling changes when online

## Database Design

### DynamoDB Tables

1. **Material Table**
   - Primary Key: `id` (String)
   - GSI: `byJob` (Hash Key: `jobId`)
   - GSI: `jobId-materialIdentifier-index` (Hash Key: `jobId`, Range Key: `materialIdentifier`)
   - GSI: `qrCodeData-index` (Hash Key: `qrCodeData`)

2. **History Table**
   - Primary Key: `id` (String)
   - GSI: `materialId-timestamp-index` (Hash Key: `materialId`, Range Key: `timestamp`)
   - GSI: `byMaterialId` (Hash Key: `materialId`)

### Access Patterns

1. Get material by ID
2. Get material by QR code
3. Get all materials for a job
4. Get material history sorted by timestamp
5. Find material by identifier within a job

## API Integration Points

### Frontend to API Integration

The frontend uses Amplify to communicate with the AppSync API:

```javascript
// Example: Fetch material data
const fetchMaterial = async (materialId) => {
  try {
    const result = await API.graphql({
      query: getMaterial,
      variables: { id: materialId }
    });
    return result.data.getMaterial;
  } catch (error) {
    console.error('Error fetching material:', error);
    throw error;
  }
};

// Example: Update material status
const updateStatus = async (materialId, newStatus, notes) => {
  try {
    const result = await API.graphql({
      query: updateMaterialStatus,
      variables: {
        materialId,
        status: newStatus,
        notes
      }
    });
    return result.data.updateMaterialStatus;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};
```

### Real-time Subscriptions

```javascript
// Example: Subscribe to material status changes
const subscribeToStatusChanges = (materialId, onUpdate) => {
  const subscription = API.graphql({
    query: onMaterialStatusChanged,
    variables: { materialId }
  }).subscribe({
    next: (result) => {
      const data = result.value.data.onMaterialStatusChanged;
      onUpdate(data);
    },
    error: (error) => console.error('Subscription error:', error)
  });
  
  return subscription;
};
```

## Error Handling

### Client-Side Error Handling

```javascript
try {
  // API call
} catch (error) {
  if (error.errors && error.errors.length > 0) {
    // GraphQL errors
    const message = error.errors[0].message;
    // Display error to user
  } else {
    // Network or other errors
    // Handle offline case
  }
}
```

### Lambda Error Handling

```javascript
try {
  // Operation logic
} catch (error) {
  console.error('Error details:', error);
  return formatErrorResponse('User-friendly error message');
}

function formatErrorResponse(message) {
  const error = new Error(message);
  error.name = 'UserInputError';
  throw error;
}
```

## Performance Considerations

### DynamoDB Optimization

1. **Use appropriate indexes**: Each access pattern has a dedicated GSI
2. **Avoid table scans**: All queries use key conditions
3. **Use projection expressions**: Only retrieve needed attributes

### Lambda Optimization

1. **Optimize memory allocation**: Higher memory for Excel processing
2. **Reuse connections**: Initialize AWS clients outside handler
3. **Implement timeouts**: Prevent long-running functions

### Frontend Optimization

1. **Implement code splitting**: Reduce initial load time
2. **Use React.memo and useMemo**: Prevent unnecessary renders
3. **Optimize bundle size**: Only import needed components

## Security Considerations

### Data Validation

All inputs are validated at multiple levels:
1. Frontend form validation
2. GraphQL schema validation
3. Lambda function validation

### Authentication

1. JWT tokens are short-lived
2. Refresh tokens for session management
3. Multi-factor authentication support

### Authorization

1. Fine-grained access control with @auth directives
2. Role-based permissions
3. Least privilege principle

## Monitoring and Debugging

### CloudWatch Logs

All Lambda functions log:
1. Input events (sanitized)
2. Processing steps
3. Errors with stack traces

### Metrics and Alarms

1. Lambda invocation count and duration
2. DynamoDB read/write capacity
3. API error rate

## Extension Points

### Custom Status Workflows

The status transition rules can be customized in:
1. `updateMaterialStatus` Lambda function
2. Frontend validation logic

### Adding New Material Types

To add new material types:
1. Update the frontend form components
2. Update validation logic
3. No schema changes required

### Integration with Other Systems

Integration points are available for:
1. ERP systems via EventBridge
2. Accounting systems via Lambda functions
3. External reporting tools via AppSync API 