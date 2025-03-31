# -----------------------------------------------
# Drone Management Frontend Dockerfile
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

# Expose development server port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]

# --- Build Stage ---
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine AS production

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration if any
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"] 