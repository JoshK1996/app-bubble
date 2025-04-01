# Construction Material Tracking System - Architecture Overview

## System Architecture

The Construction Material Tracking System is built using a modern serverless architecture on AWS, providing a scalable, reliable, and cost-effective solution for tracking construction materials throughout their lifecycle.

```
┌─────────────────┐     ┌────────────────┐     ┌────────────────────────┐
│                 │     │                │     │                        │
│  React Web App  │────▶│  AWS Amplify   │────▶│  Amazon CloudFront CDN │
│                 │     │   Hosting      │     │                        │
└─────────────────┘     └────────────────┘     └────────────────────────┘
         │                                                   │
         │                                                   │
         ▼                                                   ▼
┌─────────────────┐     ┌────────────────┐     ┌────────────────────────┐
│                 │     │                │     │                        │
│  AWS Cognito    │◀───▶│  AWS AppSync   │◀───▶│  AWS Lambda Functions  │
│  User Pool      │     │  GraphQL API   │     │                        │
└─────────────────┘     └────────────────┘     └────────────────────────┘
                                │                          │
                                │                          │
                                ▼                          ▼
                        ┌────────────────┐     ┌────────────────────────┐
                        │                │     │                        │
                        │  Amazon S3     │     │  Amazon DynamoDB       │
                        │  Storage       │     │  Database              │
                        └────────────────┘     └────────────────────────┘
```

## Core Components

### Frontend

1. **React Web Application**
   - Built with React.js and Material-UI
   - Progressive Web App capabilities for offline use
   - Responsive design for both desktop and mobile devices
   - QR code scanning integration
   - Excel file import/export functionality

2. **AWS Amplify Hosting**
   - Hosts the web application
   - Provides CI/CD pipeline for continuous deployment
   - Manages environment variables
   - Handles routing and custom domains

3. **Amazon CloudFront CDN**
   - Global content delivery network
   - Caches static assets for faster loading
   - SSL/TLS encryption for secure connections

### Authentication & Authorization

4. **AWS Cognito User Pool**
   - User authentication and management
   - Role-based access control (RBAC)
   - Multi-factor authentication support
   - User group management

### API & Backend

5. **AWS AppSync GraphQL API**
   - GraphQL schema definition
   - Real-time data with WebSocket subscriptions
   - Authorization via Cognito integration
   - Resolver mapping templates
   - Caching for improved performance

6. **AWS Lambda Functions**
   - Serverless compute for business logic
   - Event-driven architecture
   - Specialized functions for different operations:
     - `updateMaterialStatus`: Updates material status and records history
     - `listMaterialHistory`: Retrieves history records for materials
     - `getMaterialByQrCode`: Retrieves materials by QR code
     - `processExcelImport`: Processes Excel imports into DynamoDB

### Data Storage

7. **Amazon DynamoDB**
   - NoSQL database for materials, jobs, and history
   - Schema-less design for flexibility
   - Global Secondary Indexes for efficient queries
   - Auto-scaling capabilities for handling load
   - Main tables:
     - `Material`: Stores material information
     - `Job`: Stores job information
     - `MaterialHistory`: Stores audit trail of all material changes

8. **Amazon S3**
   - Storage for Excel imports/exports
   - Stores application assets
   - Backup storage

## Data Flow

### User Authentication Flow

1. User enters credentials in the web application
2. Credentials are sent to Cognito User Pool for authentication
3. Upon successful authentication, Cognito returns JWT tokens
4. The application stores tokens in browser storage
5. Tokens are included in subsequent API requests for authorization

### Material Scanning and Updates

1. User scans a QR code using the mobile device camera
2. QR code data is sent to the AppSync API via the `materialByQrCode` query
3. Lambda function queries DynamoDB using the QR code data
4. Material information is returned to the user
5. When updating status:
   - Status update request is sent to the AppSync API
   - Lambda function validates the status transition
   - DynamoDB material record is updated
   - A new history record is created
   - Real-time update is published via AppSync subscriptions

### Excel Import Process

1. User selects a job and uploads an Excel file
2. File is uploaded to S3 bucket
3. S3 upload triggers Lambda function or direct API call is made
4. Lambda function:
   - Validates the Excel format
   - Processes each row
   - Creates or updates materials in DynamoDB
   - Creates history records for changes
   - Returns processing results
5. Real-time updates are published via AppSync subscriptions

## Offline Capabilities

The system implements a Progressive Web App approach with:

1. **Service Worker**
   - Caches application assets
   - Intercepts network requests
   - Serves cached content when offline

2. **IndexedDB**
   - Stores data locally
   - Queues operations when offline
   - Syncs when connectivity is restored

3. **SyncManager**
   - Tracks pending operations
   - Executes background sync when online
   - Handles conflict resolution

## Security Design

1. **Authentication**
   - JWT-based authentication
   - Token expiration and refresh
   - HTTPS everywhere

2. **Authorization**
   - Fine-grained access control in GraphQL schema
   - Role-based permissions
   - Field-level security

3. **Data Security**
   - Encryption at rest (DynamoDB, S3)
   - Encryption in transit (HTTPS/WSS)
   - Input validation and sanitization
   - Data access auditing

## Scalability Considerations

The serverless architecture provides:

1. **Auto-scaling**
   - Lambda functions scale with requests
   - DynamoDB scales with throughput
   - No server management needed

2. **Performance**
   - DynamoDB GSIs for efficient queries
   - AppSync caching
   - CloudFront edge caching

3. **Cost Efficiency**
   - Pay-per-use model
   - No idle resources
   - Resource optimization

## Integration Points

1. **Client-side Integrations**
   - Camera API for QR scanning
   - File API for Excel handling
   - Service Workers API for offline support
   - Web Push API for notifications
   - Storage APIs for local data

2. **AWS Service Integrations**
   - AppSync ↔ Lambda ↔ DynamoDB
   - S3 ↔ Lambda for file processing
   - EventBridge for event-driven operations
   - Cognito ↔ AppSync for authorization
   - CloudWatch for monitoring and logging

## Monitoring and Observability

1. **CloudWatch**
   - Logs from Lambda functions
   - Metrics for API operations
   - Alarms for error conditions
   - Dashboards for key metrics

2. **X-Ray**
   - Distributed tracing
   - Performance bottleneck identification
   - Service map visualization 