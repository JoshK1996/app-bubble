# Drone Management System

A comprehensive solution for drone fleet management, mission planning, and real-time monitoring.

## Features

- **Drone Fleet Management**: Register, track, and maintain your drone fleet
- **User Management**: Role-based access control (Admin, Operator, Viewer)
- **Mission Planning**: Plan and schedule drone missions with waypoints
- **Real-time Monitoring**: Track drone location, status, and telemetry data
- **Flight Logs**: Comprehensive logging of all drone activities
- **Maintenance Tracking**: Schedule and track drone maintenance
- **Reporting**: Generate detailed reports on drone operations
- **Weather Integration**: Check weather conditions for mission planning

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL (via Prisma ORM) for relational data
- MongoDB for telemetry and log data
- JWT authentication
- WebSockets for real-time communication

### Frontend
- React with TypeScript
- Redux for state management
- Mapbox for mapping and geospatial features
- Material-UI for component library
- Chart.js for data visualization

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/drone-management-system.git
   cd drone-management-system
   ```

2. Set up environment variables
   ```bash
   cp backend/.env.example backend/.env
   # Edit the .env file with your configuration
   ```

3. Start the application with Docker Compose
   ```bash
   docker-compose up
   ```

4. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/v1

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev
```

## API Documentation

API documentation is available at http://localhost:5000/api/v1/docs when the server is running.

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

The application is containerized and can be deployed to any environment supporting Docker.

### Production Deployment
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Architecture

```
├── backend/                # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── features/       # Feature modules
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Prisma ORM schema and migrations
│   └── tests/              # Test files
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── assets/         # Static assets
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── tests/              # Test files
│
└── docker-compose.yml      # Docker Compose configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 