# Construction Material Tracking System Deployment Guide

This guide provides detailed instructions for deploying the Construction Material Tracking System to AWS.

## Prerequisites

Before you begin deployment, ensure you have the following:

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js (v14 or later) and npm
4. Git

## Deployment Steps

The deployment consists of two main parts:
1. Backend (API, Lambda functions, and DynamoDB)
2. Frontend (React web application)

### Part 1: Backend Deployment

#### Step 1: Set up the AWS Amplify environment

```bash
# Navigate to the project root
cd construction-tracker

# Initialize Amplify if not already done
amplify init

# Follow the prompts to configure your environment:
# - Enter a name for the project
# - Choose your default editor
# - Choose the type of app (javascript)
# - Choose framework (react)
# - Source directory path (src)
# - Distribution directory path (build)
# - Build command (npm run build)
# - Start command (npm start)
# - Choose AWS profile to use
```

#### Step 2: Add Authentication

```bash
# Add authentication
amplify add auth

# Configure according to your requirements:
# - Choose default configuration or manual setup
# - Set up email/password authentication
# - Configure multi-factor authentication if needed
# - Configure user attributes as needed (name, email, etc.)
```

#### Step 3: Add GraphQL API

```bash
# Add API
amplify add api

# Choose GraphQL
# Choose authorization type (Amazon Cognito User Pool)
# Use the schema provided in the packages/api/schema.graphql
# Choose conflict detection strategy
```

#### Step 4: Deploy the SAM Template for Lambda Functions

```bash
# Navigate to the API directory
cd packages/api

# Package the SAM template
sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket YOUR_DEPLOYMENT_BUCKET

# Deploy the packaged template
sam deploy \
    --template-file packaged.yaml \
    --stack-name construction-tracker-api \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides Environment=dev
```

#### Step 5: Update Amplify API Configuration to Use Lambda Functions

Edit your Amplify API configuration to use the deployed Lambda functions as resolvers for the GraphQL operations.

```bash
# Push Amplify changes
amplify push
```

### Part 2: Frontend Deployment

#### Step 1: Configure the Environment

Create a `.env` file in the `packages/client` directory with the necessary environment variables:

```
REACT_APP_API_ENDPOINT=YOUR_APPSYNC_ENDPOINT
REACT_APP_REGION=YOUR_AWS_REGION
REACT_APP_USER_POOL_ID=YOUR_COGNITO_USER_POOL_ID
REACT_APP_USER_POOL_WEB_CLIENT_ID=YOUR_COGNITO_CLIENT_ID
REACT_APP_IDENTITY_POOL_ID=YOUR_IDENTITY_POOL_ID
REACT_APP_S3_BUCKET=YOUR_S3_BUCKET_FOR_IMPORTS
```

#### Step 2: Build the Frontend

```bash
# Navigate to the client directory
cd packages/client

# Install dependencies
npm install

# Build for production
npm run build
```

#### Step 3: Deploy to Amplify Hosting

```bash
# Add hosting to Amplify
amplify add hosting

# Choose Amazon CloudFront and S3
# Set up with HTTPS and redirect HTTP to HTTPS

# Deploy to hosting
amplify publish
```

### Part 3: Post-Deployment Steps

#### Create Initial Admin User

1. Go to the AWS Console
2. Navigate to Cognito User Pools
3. Select your user pool
4. Create a user with admin privileges
5. Set temporary password and necessary attributes

#### Configure S3 CORS Settings

Ensure your S3 bucket for Excel imports has appropriate CORS settings:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

#### Set Up CloudWatch Alarms

Set up CloudWatch alarms to monitor API performance and Lambda function errors.

## Advanced Configuration

### Custom Domain Name

To use a custom domain name:

1. Register a domain in Route 53 or use an existing domain
2. Configure SSL certificate in ACM
3. Set up custom domain in Amplify:

```bash
amplify add custom-domain
```

### Monitoring and Logging

Configure advanced monitoring:

1. Set up CloudWatch dashboards for key metrics
2. Configure log retention policies
3. Set up SNS notifications for critical errors

### Backup Strategy

1. Configure DynamoDB point-in-time recovery
2. Set up S3 versioning for the import bucket

## Troubleshooting

### Common Issues

1. **API Gateway CORS Issues**
   - Ensure CORS settings are properly configured in your API Gateway

2. **Lambda Permission Errors**
   - Check IAM roles and ensure Lambda functions have proper permissions

3. **Authentication Issues**
   - Verify Cognito configuration
   - Check client-side authentication setup

## Security Considerations

1. **IAM Best Practices**
   - Use least privilege principle for all IAM roles
   - Regularly audit IAM permissions

2. **Data Encryption**
   - Ensure data is encrypted at rest and in transit
   - Use AWS KMS for managing encryption keys

3. **Regular Updates**
   - Keep all dependencies updated
   - Apply security patches promptly

## Performance Optimization

1. **DynamoDB Optimization**
   - Monitor read/write capacity
   - Consider using DAX for caching

2. **Lambda Performance**
   - Optimize memory settings
   - Monitor cold start times

3. **Frontend Performance**
   - Implement code splitting
   - Use CDN caching effectively

## Contact

For support or questions regarding deployment, contact the system administrator. 