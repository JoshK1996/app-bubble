# Multi-stage build for backend service

# --------------------------------------
# Development stage
# --------------------------------------
FROM node:18-alpine AS development

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose API port
EXPOSE 5000

# Start development server with hot-reloading
CMD ["npm", "run", "dev"]

# --------------------------------------
# Build stage
# --------------------------------------
FROM node:18-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies (production only)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# --------------------------------------
# Production stage
# --------------------------------------
FROM node:18-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built app from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Expose API port
EXPOSE 5000

# Start production server
CMD ["node", "dist/server.js"] 