# Task Management Bubble

A modern, containerized task management application with a React frontend and Node.js backend.

## Project Structure

```
app-bubble/
├── frontend/               # React frontend application
│   ├── Dockerfile          # Multi-stage Docker configuration for the frontend
│   ├── nginx.conf          # NGINX configuration for production
│   ├── package.json        # Frontend dependencies and scripts
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── ...
├── backend/                # Node.js backend application
│   ├── Dockerfile          # Docker configuration for the backend
│   ├── package.json        # Backend dependencies and scripts
│   ├── prisma/             # Database schema and migrations
│   │   └── schema.prisma
│   └── src/
│       ├── features/       # Feature-based modules
│       │   ├── boards/
│       │   ├── columns/
│       │   ├── tasks/
│       │   └── users/
│       ├── middleware/     # Express middleware
│       ├── shared/         # Shared utilities and services
│       └── index.ts        # Application entry point
└── docker-compose.yml      # Docker Compose configuration for local development
```

## Technologies Used

### Frontend
- React with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- NGINX for production serving

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database

### DevOps
- Docker for containerization
- Docker Compose for local development

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- Git

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/app-bubble.git
cd app-bubble
```

2. Start the application using Docker Compose:
```bash
docker-compose up
```

This will start both the frontend and backend services:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### Development Without Docker

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
npm run dev
```

## Features

- Kanban board-style task management
- User authentication and authorization
- Task creation, assignment, and tracking
- Board and column customization
- Responsive design for mobile and desktop

## Environment Variables

### Backend
Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_bubble
JWT_SECRET=your_jwt_secret
PORT=4000
NODE_ENV=development
```

## API Documentation

The backend provides a RESTful API with the following endpoints:

- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/boards` - Board operations
- `/api/columns` - Column operations
- `/api/tasks` - Task operations

## Docker Deployment

To build and run the Docker containers for production:

```bash
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 