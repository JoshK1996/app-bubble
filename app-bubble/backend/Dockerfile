# Multi-stage Dockerfile for the backend

# ---------------------------------------
# Development Stage
# ---------------------------------------
FROM node:18-alpine as development

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose development port
EXPOSE 4000

# Start development server
CMD ["npm", "run", "dev"]

# ---------------------------------------
# Build Stage
# ---------------------------------------
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# ---------------------------------------
# Production Stage
# ---------------------------------------
FROM node:18-alpine as production

# Set working directory
WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma

# Expose production port
EXPOSE 4000

# Start production server
CMD ["node", "dist/index.js"] 