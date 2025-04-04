# app-bubble
Group framework
APP BUBBLE: Product Requirements Checklist (PRC) & AI Generation Rules
Version: 1.0
Project Goal: To generate a set of distinct, high-quality, reusable application framework starter kits ("Bubbles") for popular app types, specifically optimized for future comprehension, modification, and utilization by AI code generation agents.

1. Overview & Core Instruction
1.1. Project Title: APP BUBBLE - AI-Generated Application Frameworks

1.2. Overall Goal: Generate six foundational, well-structured, robustly tested, and thoroughly documented code framework starter kits (Bubbles) for common application types frequently requested in freelance scenarios.

1.3. Explicit Goal for AI Comprehension (Critical Rule): These frameworks MUST be designed with exceptional clarity, consistency, and adherence to standards to facilitate maximum understandability, analysis, and modification by future AI agents. Prioritize explicit code, descriptive naming, standard patterns, and comprehensive documentation over concise but potentially obscure implementations. This is a primary directive.

1.4. Target Audience (for this PRC): AI Code Generation Agent.

1.5. End User (of generated frameworks): Software Developer utilizing these Bubbles as verified starting points, potentially with further AI assistance.

1.6. Core Instruction: Generate the six distinct application framework Bubbles detailed below, ensuring each strictly adheres to ALL General Requirements (Section 2) and its specific requirements (Section 3).

2. General Requirements & Rules (Applicable to ALL SIX Bubbles)
2.1. Technology Stack (Strict):

Backend: Node.js, Express.js framework. Language: TypeScript.

Frontend (Web): React.js (using Vite tooling). Language: TypeScript.

Database:

Support for both PostgreSQL (via Prisma ORM) AND MongoDB (via Mongoose ODM).

Implementation MUST allow selection via a single environment variable (e.g., DATABASE_TYPE=postgres or DATABASE_TYPE=mongo). The codebase should adapt accordingly (using conditional logic where necessary, perhaps via repository pattern implementation).

Include necessary schema definitions for both DB types relevant to the Bubble's features.

Include Prisma schema.prisma and initial migration setup. Include Mongoose schema files.

API: RESTful API design. Automatically generate OpenAPI (Swagger) v3 documentation from code comments/decorators (e.g., using tsoa, swagger-jsdoc, or similar compatible libraries) accessible via a dedicated endpoint (e.g., /api-docs).

2.2. Architecture & Design Philosophy (AI Readability Focus - Strict Rules):

Structure: Employ a clear, standard Feature-Based Directory Structure (e.g., /src/features/users/, /src/features/posts/ containing feature-specific routes, controllers, services, data validation, types/interfaces, database models/schemas, and tests). Consistency across Bubbles is mandatory.

Principles: Adhere strictly to Separation of Concerns (SoC) and aim for SOLID principles where applicable. Modules must have single, well-defined responsibilities.

Simplicity & Explicitness: Rule: Prioritize clear, explicit, and easy-to-follow code over complex or overly "clever" implementations. If multiple approaches exist, choose the most readable and maintainable one for AI parsing.

TypeScript Usage: Leverage TypeScript's static typing features extensively (interfaces, types, generics, enums) for clarity and self-documentation. Avoid any type where possible.

2.3. Authentication & Authorization (Standard Implementation):

Method: Implement stateless JWT (JSON Web Token) based authentication.

Endpoints (Mandatory):

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me  (authenticated route returning current user)
Use code with caution.
Middleware: Include middleware to protect routes, verifying JWT validity.

RBAC Stubs: Implement basic Role-Based Access Control stubs. User model must have a role field (e.g., enum Role { USER, ADMIN, PROVIDER }). Include example middleware (e.g., requireAdmin, requireRole(Role.PROVIDER)) demonstrating how to protect endpoints based on roles relevant to the specific Bubble.

2.4. Code Quality, Conventions & Naming (Mandatory Rules - Critical for AI):

Style Guide: Strictly enforce the Airbnb TypeScript Style Guide. Configure ESLint and Prettier (include .eslintrc.js, .prettierrc.js, .prettierignore) to automatically enforce this. Generated code MUST be lint-free and formatted correctly.

Naming Convention (Rule): Use highly descriptive, unambiguous, full-word names for everything: files, folders, variables, functions, classes, interfaces, types, database entities/columns, API endpoints, test descriptions. Names MUST clearly convey intent. No cryptic abbreviations. (e.g., submitUserProfileUpdate not subProfUpd).

Comments (Rule):

Use TSDoc comment blocks (/** ... */) for all exported functions, classes, types, and interfaces.

Include inline comments explaining the purpose (// Purpose: ...) or rationale (// Rationale: ...) for non-obvious code sections or design choices.

Add file-level comments explaining the responsibility of major modules/services.

2.5. Configuration Management (Strict Rule):

Method: Use environment variables exclusively via .env files (loaded with dotenv).

Documentation: Provide a comprehensive .env.example file listing all required variables with clear explanations and sensible defaults/placeholders. No hardcoded configuration values allowed.

2.6. Database Setup:

Prisma: Define clear models in schema.prisma. Generate initial migration file. Include package.json scripts for common Prisma commands (migrate dev, generate, studio).

Mongoose: Define clear Schemas in dedicated files (e.g., /src/features/featureX/featureX.schema.ts).

Interaction Pattern: Implement a basic repository pattern or similar abstraction layer in services to isolate database interaction logic, facilitating the dual DB support.

2.7. Frontend Structure (React + TypeScript + Vite - Consistent Structure Rule):

Organization (Rule): Use a consistent structure across all Bubbles: src/components/ (common/, features/), src/pages/, src/services/ (API clients), src/hooks/, src/contexts/ or src/store/ (state management), src/types/, src/routes/, src/assets/.

Routing: Use react-router-dom v6 for routing configuration. Include basic public/private route setup.

State Management: Use React Context API or Zustand for basic global state (e.g., auth status, user profile). Provide clear examples.

API Integration: Implement typed API client functions in src/services/ using axios or fetch for all backend endpoints. Use shared TypeScript types between frontend and backend where possible (e.g., via a shared types package/directory if feasible, or duplication with clear documentation).

UI: Placeholder components/pages for core features. Minimal styling (plain CSS Modules or basic Tailwind CSS setup - include Tailwind config if used). Focus is on structure, state, and API plumbing, not aesthetics.

2.8. Testing & Verification (Mandatory & Rigorous Rules):

Frameworks: Backend: Jest + Supertest. Frontend: Vitest + React Testing Library.

Backend Test Coverage (Rule):

Unit tests for significant helper functions or complex logic within services.

Integration tests covering ALL generated API endpoints. Tests must validate:

Success responses (2xx status codes, correct payload structure).

Input validation errors (4xx status codes).

Authentication errors (401 Unauthorized).

Authorization errors (403 Forbidden using RBAC stubs).

Not Found errors (404).

Tests MUST run against a dedicated test database instance (configured via separate env vars).

Frontend Test Coverage (Rule):

Basic rendering tests (render()) for all pages and significant components.

Basic interaction tests for essential UI elements (e.g., form input changes, button clicks triggering mocked service calls). Use msw (Mock Service Worker) or Vitest's mocking features to mock API responses.

Test Execution Script (Rule): Provide package.json scripts:

"scripts": {
  "test": "npm run lint && npm run format --check && npm run test:backend && npm run test:frontend",
  "test:backend": "jest --config ./backend/jest.config.js",
  "test:frontend": "vitest run --config ./frontend/vite.config.ts",
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
Use code with caution.
Json
(Note: Adjust paths and specific commands based on final project structure)

The main test script MUST exit with code 0 on success, non-zero on failure.

Code Generation Quality (Rule): The AI agent MUST generate application code and test code that is logically sound, syntactically correct, and designed such that ALL generated tests (npm test) pass without modification when executed in a correctly configured environment (as documented in the README). Code must also pass npm run lint.

2.9. Containerization (Standard Setup):

Backend: Multi-stage Dockerfile optimized for development (with hot-reloading via tools like nodemon) and production builds.

Frontend: Multi-stage Dockerfile (build static assets, serve via Nginx or similar lightweight server).

Orchestration: docker-compose.yml file to easily run: backend service, frontend service, PostgreSQL service, MongoDB service. Must be configurable via the shared .env file.

2.10. Documentation (README.md - Comprehensive & AI-Focused Rule):

Mandatory File: Each Bubble repository MUST contain a detailed README.md.

Content Requirements (Rule):

Project Title (e.g., "APP BUBBLE: Social Network Lite Framework") & High-Level Overview.

"Project Philosophy & AI Readability" Section: Explicitly state the goal of clarity and standardization for AI interaction.

Technology Stack list.

"Folder Structure Explanation" Section (Critical for AI): Detailed tree view and explanation of the purpose of every major directory and key file type. Must be extremely clear.

"Setup & Installation": Step-by-step local setup (prerequisites, clone, install dependencies, .env setup).

"Running the Application": Commands for dev mode (backend, frontend) and using docker-compose up.

"API Documentation": Link to the running Swagger UI (/api-docs) and brief overview of API resources.

"Database": How to configure (Postgres/Mongo via env var), run Prisma migrations. Overview of core models/schemas.

"Testing and Verification" Section (Critical):

Instructions for setting up the test environment (e.g., test database env vars).

Exact command (npm test) to run all checks (lint, format, tests).

How to interpret PASS/FAIL output.

Statement reinforcing that passing tests verifies baseline framework integrity.

"Environment Variables": List all variables from .env.example with descriptions.

2.11. AI Interaction Design Principles (Apply Throughout - Rules):

Standard Libraries: Strongly prefer mainstream, well-documented libraries (Express, React, Prisma, Mongoose, Jest, Vitest, Zustand, Axios, react-router-dom, etc.).

Explicit Modules: Use clear ES Module import/export. Avoid overly complex dependency injection magic; favor clear instantiation or simple function calls.

Predictable Flow: Structure code for standard, traceable data flow patterns.

Configuration Centralization: All configuration MUST be externalized to .env.

3. Specific Framework "Bubble" Requirements
(For each Bubble, apply all General Requirements from Section 2 and add these specifics)

3.1. Bubble: Social Network Lite

Core Features: User Profiles, Text Posts, Follow/Unfollow, Chronological Feed (followed users).

Models: User (profile fields), Post, Follow.

API: CRUD Posts (user), Get Feed, Follow/Unfollow, Get User Profile (+ posts), List Users.

Frontend: Pages(Feed, Profile, UserList), Components(PostItem, ProfileCard, FollowButton, CreatePostForm).

3.2. Bubble: E-commerce Platform Base

Core Features: Product Catalog (list, detail), Categories, Cart (add/remove/view), Basic Order Placement (records order, no payment), Order History. Admin stubs.

Models: User (role: CUSTOMER, ADMIN), Product, Category, Cart, CartItem, Order, OrderItem.

API: Public(List/View Products, Manage Cart), User(Create Order, View History), Admin(CRUD Products/Categories - RBAC).

Frontend: Pages(ProductList, ProductDetail, Cart, CheckoutStub, OrderHistory, AdminProductStub), Components(ProductCard, CategoryFilter, CartItem, MiniCart).

3.3. Bubble: On-Demand Service Booking Base

Core Features: User Roles (CUSTOMER, PROVIDER), Service Listings, Booking Request Flow (request, accept/decline), Differentiated Profiles, Rating/Review Structure stubs.

Models: User (role, profile, location stub, rating stub), Service, Booking (status enum), Review stub.

API: List/View Services, Create Booking, View Bookings (Customer/Provider), Update Booking Status (Provider), Create Review stub.

Frontend: Pages(ServiceDiscovery, ServiceDetail, MyBookings, ProviderDashboard), Components(ServiceCard, BookingRequestItem, RatingInputStub).

3.4. Bubble: Task Management / Productivity Base

Core Features: Boards, Columns/Lists within Boards, Task CRUD (title, desc, status, assignee stub, deadline stub).

Models: User, Board, TaskList/Column (order field), Task.

API: CRUD Boards, CRUD Columns, CRUD Tasks, Reorder stubs.

Frontend: Pages(Dashboard, BoardView), Components(BoardCard, TaskColumn, TaskCard, CreateTaskForm). Rule: Include basic Drag-and-Drop stub between columns using @dnd-kit/core.

3.5. Bubble: Real-time Chat Base

Core Features: 1-on-1 Chat, Basic Group Chat Rooms (stubs), Real-time Messages, History.

Models: User, ChatRoom, Message, Participant.

API: Get Rooms, Get Messages, Send Message (REST + WebSocket).

Real-time (Rule): Implement WebSocket server (socket.io) for connection, room joining, message broadcasting (new_message), basic presence stubs.

Frontend: Pages(ChatInterface), Components(ChatList, ChatWindow, MessageBubble, MessageInput). Rule: Implement socket.io-client logic.

3.6. Bubble: Content Delivery / Blog Base

Core Features: Posts (rich text stub), Categories/Tags, Public Views, Admin/Author CRUD stubs.

Models: User (role: READER, AUTHOR, ADMIN), Post (status: DRAFT, PUBLISHED), Category, Tag, Pivots.

API: Public(List/View Posts), Author/Admin(CRUD Posts/Categories/Tags - RBAC).

Frontend: Pages(Home, PostDetail, Archive, AdminDashboardStub), Components(PostPreview, PostContent, CategoryList, TagCloud). Rule: Include basic Rich Text Editor stub (e.g., react-quill) in admin forms.

4. Deliverables
4.1. Six distinct codebases, one for each Bubble specified in Section 3.

4.2. Git Repository Structure: Each codebase structured as a ready-to-initialize Git repository.

4.3. Contents per Repository (Mandatory):

/backend or / containing Backend source (Node/Express/TS).

/frontend or / containing Frontend source (React/Vite/TS).

Database setup (Prisma files, Mongoose schemas).

All required configuration files (.env.example, linters, formatters, tsconfig.json, etc.).

Comprehensive Testing Suite (backend + frontend) as per rule 2.8.

Automated Test Execution Scripts in package.json as per rule 2.8.

Docker configuration (Dockerfile x2, docker-compose.yml).

The Comprehensive README.md as per rule 2.10.

5. Non-Goals (What NOT to Build)
Fully functional, production-ready, feature-complete applications.

Complex or niche-specific business logic beyond the specified core features.

Sophisticated UI/UX design or heavy/polished styling.

Payment gateway integrations.

Advanced features (complex analytics, ML, real-time collab beyond chat, ElasticSearch, etc.).

Extensive database seeding.

Cloud provider-specific deployment scripts.

AI-Executed Runtime Verification: AI generates code designed to pass tests; user executes tests for verification.

End-to-End (E2E) browser automation tests.
