# SrcBook SaaS Platform

This is a monorepo for the SrcBook SaaS platform, which transforms the existing SrcBook repository into a full-featured SaaS application with deployment capabilities, custom domains, and comprehensive subscription management.

## Project Structure

The project follows a monorepo structure with the following components:

- `demo-app/`: A demo Express application showcasing core SaaS features with mock data
- `packages/`: Contains the individual packages/services of the platform

## Demo Server

The demo server provides a simplified version of the SrcBook SaaS platform with the following features:

- Mock user authentication
- Workspace and project management
- API endpoints for core functionality
- Simple web interface for testing

### Running the Demo

1. Navigate to the demo-app directory:
   ```
   cd srcbook-saas/demo-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   node ./bin/www
   ```

4. The server will be running at:
   - Web interface: http://localhost:5000/
   - API health check: http://localhost:5000/health
   - API endpoints:
     - GET /api/users
     - GET /api/workspaces
     - GET /api/projects
     - POST /api/auth/login (email: admin@example.com, password: admin123)

## API Overview

The demo includes the following API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | API health check |
| POST | /api/auth/login | User authentication |
| GET | /api/users/me | Current user profile |
| GET | /api/users | List all users |
| GET | /api/workspaces | List all workspaces |
| GET | /api/workspaces/:id | Get workspace details |
| GET | /api/projects | List all projects |
| GET | /api/workspaces/:workspaceId/projects | List workspace projects |

## Development

This is a simplified demo environment. In a real production environment, this would be connected to:

- Authentication service with real user accounts
- Database for storing user data, workspaces, and projects
- Deployment services for managing deployments to custom domains
- Billing and subscription management
- Monitoring and analytics services

The actual implementation would use production-ready infrastructure with proper security, scalability, and reliability considerations.