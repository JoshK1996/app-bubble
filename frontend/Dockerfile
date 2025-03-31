# Multi-stage Dockerfile for the frontend

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

# Expose development port
EXPOSE 3000

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

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ---------------------------------------
# Production Stage
# ---------------------------------------
FROM nginx:alpine as production

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose production port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 