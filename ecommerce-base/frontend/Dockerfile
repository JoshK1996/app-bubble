# Multi-stage build for React application
# Stage 1: Development - includes all dependencies and development tools
FROM node:20-alpine AS development

WORKDIR /app

# Copy package.json files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 2: Build - builds the static assets
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production - serves the static assets with Nginx
FROM nginx:alpine AS production

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the web server port
EXPOSE 80

# Command to run the web server
CMD ["nginx", "-g", "daemon off;"] 