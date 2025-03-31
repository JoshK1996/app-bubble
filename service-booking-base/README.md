# APP BUBBLE: On-Demand Service Booking Framework

A foundational framework for building on-demand service booking applications. This framework provides the essential components and architecture to develop applications like home services, professional consultations, or appointment systems.

## Project Philosophy & AI/Human Readability

This framework is specifically designed with clarity, standardization, comprehensive commenting, and structure optimized for both future AI interaction and human maintainability. The codebase emphasizes:

- Explicit, descriptive naming conventions
- Thorough documentation and code comments
- Consistent architecture and patterns
- Clear separation of concerns
- Standards compliance (Airbnb TypeScript style guide)

The goal is to provide a codebase that can be easily understood, analyzed, and modified by both AI agents and human developers with minimal context.

## Technology Stack

### Backend
- Node.js with Express framework
- TypeScript for static typing
- PostgreSQL database with Prisma ORM
- MongoDB support via Mongoose ODM
- JWT-based authentication
- Zod for validation
- Winston for logging

### Frontend
- React.js with Vite
- TypeScript
- React Router v6
- React Context API for state management
- Axios for API integration

## Folder Structure Explanation

```
service-booking-base/
├── backend/                        # Backend application
│   ├── prisma/                     # Prisma ORM schema and migrations
│   ├── src/                        # Source code
│   │   ├── config/                 # Configuration files
│   │   ├── features/               # Feature-based modules
│   │   │   ├── users/              # User authentication & profiles
│   │   │   ├── services/           # Service listings
│   │   │   ├── bookings/           # Booking management
│   │   │   └── reviews/            # Ratings & reviews
│   │   ├── middleware/             # Express middleware
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── utils/                  # Utility functions
│   │   ├── app.ts                  # Express app setup
│   │   └── server.ts               # Server entry point
│   ├── .env.example                # Environment variables template
│   ├── package.json                # Dependencies and scripts
│   └── tsconfig.json               # TypeScript configuration
├── frontend/                       # Frontend application
│   ├── src/                        # Source code
│   │   ├── assets/                 # Static assets
│   │   ├── components/             # React components
│   │   │   ├── common/             # Shared UI components
│   │   │   └── features/           # Feature-specific components
│   │   ├── contexts/               # React Context providers
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── pages/                  # Page components
│   │   ├── routes/                 # Routing configuration
│   │   ├── services/               # API client functions
│   │   └── types/                  # TypeScript type definitions
│   ├── package.json                # Dependencies and scripts
│   ├── tsconfig.json               # TypeScript configuration
│   └── vite.config.ts              # Vite configuration
├── docker-compose.yml              # Docker Compose configuration
└── README.md                       # Project documentation
```

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL or MongoDB
- Docker and Docker Compose (optional)

### Local Setup
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/service-booking-base.git
   cd service-booking-base
   ```

2. Backend setup
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run db:migrate:postgres # If using PostgreSQL
   ```

3. Frontend setup
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

### Development Mode
1. Start the backend
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend
   ```bash
   cd frontend
   npm run dev
   ```

### Using Docker
```bash
docker-compose up
```

## API Documentation

Once the application is running, API documentation is available at:
```
http://localhost:5000/api-docs
```

### Key API Resources
- `/api/v1/auth` - Authentication endpoints
- `/api/v1/users` - User profile management
- `/api/v1/services` - Service listings
- `/api/v1/bookings` - Booking operations
- `/api/v1/reviews` - Ratings and reviews

## Database

### Configuration
The application can use either PostgreSQL or MongoDB as the database backend. This is configurable via the `DATABASE_TYPE` environment variable:

```
DATABASE_TYPE=postgres # or mongo
```

### Core Models
- **User**: Customer and provider profiles with differentiated roles
- **Service**: Service listings offered by providers
- **Booking**: Service booking requests with status tracking
- **Review**: Ratings and feedback for completed services

## Testing and Verification

### Setting Up Test Environment
1. Configure test database in `.env`:
   ```
   TEST_DATABASE_URL=postgresql://username:password@localhost:5432/service_booking_test
   TEST_MONGODB_URI=mongodb://localhost:27017/service_booking_test
   ```

2. Run all tests:
   ```bash
   npm test
   ```

This command will run linting, formatting checks, and all tests. A successful run will exit with code 0, indicating the framework's baseline integrity is verified.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development, test, production) | development |
| PORT | Server port | 5000 |
| API_PREFIX | API endpoint prefix | /api/v1 |
| JWT_SECRET | Secret key for JWT signing | (required) |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| DATABASE_TYPE | Database type (postgres or mongo) | postgres |
| DATABASE_URL | PostgreSQL connection string | (required for postgres) |
| MONGODB_URI | MongoDB connection string | (required for mongo) |
| CORS_ORIGIN | Allowed CORS origins (comma-separated) | * |
| LOG_LEVEL | Logging level | info | 