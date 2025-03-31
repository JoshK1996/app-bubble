# Multi-stage build for Node.js Express application
# Stage 1: Development - includes all dependencies and development tools
FROM node:20-alpine AS development

WORKDIR /app

# Copy package.json files for dependency installation
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 4001

# Command to run the application in development mode
CMD ["npm", "run", "dev"]

# Stage 2: Production build - builds the TypeScript code
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Install dependencies excluding dev dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 3: Production - minimal image with only the necessary files
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built JavaScript files from the build stage
COPY --from=build /app/dist ./dist

# Copy prisma schema if using Prisma
COPY --from=build /app/prisma ./prisma

# Generate Prisma client (if using Prisma)
RUN npx prisma generate

# Expose the application port
EXPOSE 4001

# Set environment variables
ENV NODE_ENV production

# Command to run the application in production mode
CMD ["node", "dist/index.js"] 