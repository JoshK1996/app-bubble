# -----------------------------------------------
# Drone Management Backend Dockerfile
# 
# Multi-stage build with development, build, and production stages
# -----------------------------------------------

# --- Development Stage ---
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose API port
EXPOSE 5000

# Start development server with hot-reloading
CMD ["npm", "run", "dev"]

# --- Build Stage ---
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application and Prisma schema from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Expose API port
EXPOSE 5000

# Start production server
CMD ["node", "dist/server.js"] 