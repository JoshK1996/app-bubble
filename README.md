# Construction Material Tracking System

A real-time system for tracking construction materials throughout their lifecycle, from estimation to installation.

## Tech Stack

- **Frontend**: React.js with Material UI
- **Mobile**: PWA capabilities
- **Backend**: AWS AppSync (GraphQL) with Lambda Resolvers
- **Database**: AWS RDS PostgreSQL
- **Authentication**: AWS Cognito
- **Storage**: AWS S3
- **Hosting**: AWS Amplify

## Project Structure

The project is organized as a monorepo using npm workspaces:

```
construction-tracker/
├── amplify/               # AWS Amplify configuration and backends
├── packages/              # Application packages
│   ├── client/            # React frontend application
│   │   ├── public/        # Static assets
│   │   └── src/           # Source code
│   │       ├── components/  # Reusable UI components
│   │       ├── contexts/    # React contexts for state management
│   │       ├── graphql/     # GraphQL operations (queries, mutations, subscriptions)
│   │       ├── pages/       # Page components
│   │       └── utils/       # Utilities and helpers
│   └── server/            # Express server for Lambda functions (local development)
└── README.md              # This documentation
```

## Getting Started

### Prerequisites

- Node.js v14 or later
- npm v7 or later
- AWS account with appropriate permissions
- AWS CLI configured locally
- Amplify CLI installed globally

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd construction-tracker
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Initialize Amplify (if not already done)
   ```
   amplify init
   ```

4. Push the Amplify resources
   ```
   amplify push
   ```

5. Start the development server
   ```
   npm run dev
   ```

## Features

### User Roles

- **Admin**: Full access to all features, including user and job management
- **Estimator**: Import material lists, create estimates
- **Detailer**: Assign spool IDs, prepare for fabrication
- **Purchaser**: Track procurement, update stock status
- **WarehouseStaff**: Manage inventory, shipping, and receiving
- **FieldInstaller**: Scan received materials, update installation status

### Core Functionality

- **Authentication**: Role-based access with secure login
- **Job Management**: Create, view, and manage construction jobs
- **Material Tracking**: Track materials through their lifecycle
- **Real-time Updates**: Live data synchronization using GraphQL subscriptions
- **QR Code Scanning**: Mobile-friendly material identification and status updates
- **Excel Import/Export**: Easily import material lists from Excel spreadsheets
- **Audit Trail**: Complete history of all material status changes

## AWS Resources Used

- **Cognito User Pool**: User authentication and authorization
- **Cognito Identity Pool**: Secure access to AWS services
- **AppSync API**: GraphQL API for data operations
- **Lambda Functions**: Business logic execution, data processing
- **S3 Buckets**: Storage for Excel files, QR codes, and assets
- **RDS PostgreSQL**: Relational database storage
- **CloudFormation**: Infrastructure as code

## Development Workflow

### Adding a New Feature

1. Create or modify GraphQL schema in `amplify/schema.graphql`
2. Run `amplify push` to update AWS resources
3. Update or add React components in `packages/client/src`
4. Test locally using `npm run dev`
5. Commit and push changes

### Local Development with Mock API

For faster development cycles, you can use local mocking:

```
amplify mock api
```

This will start a local GraphQL API server that simulates the AWS AppSync service.

## Deployment

### Frontend

The frontend is automatically deployed through AWS Amplify Console whenever changes are pushed to the main branch.

### Backend Services

Backend resources (API, Auth, Functions, etc.) are deployed using the Amplify CLI:

```
amplify push
```

## Next Steps

1. **Complete AWS Amplify Setup**
   - Finish configuring authentication with proper user groups
   - Set up API with Lambda resolvers connected to RDS

2. **Database Implementation**
   - Configure RDS PostgreSQL instance
   - Run schema creation scripts
   - Implement data migration strategy

3. **Real-time Subscription Testing**
   - Test with multiple concurrent users
   - Optimize subscription performance

4. **Mobile Testing**
   - Test QR code scanning on various devices
   - Verify PWA installation and offline capabilities

5. **Security Review**
   - Audit access permissions
   - Implement row-level security in RDS
   - Review authentication flows

## Documentation

For detailed API documentation, see the [API Documentation](./docs/api.md).

For AWS infrastructure details, see the [Architecture Documentation](./docs/architecture.md).

## License

This project is proprietary and confidential. 