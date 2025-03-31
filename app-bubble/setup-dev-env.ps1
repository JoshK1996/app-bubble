# Development Environment Setup Script for App Bubble
# This script helps set up a development environment without requiring Docker

Write-Host "Setting up App Bubble Task Management development environment..." -ForegroundColor Green

# Ensure we're in the correct directory
Set-Location -Path $PSScriptRoot

# Update environment settings for running without Docker
Write-Host "Configuring environment for local development..." -ForegroundColor Cyan

# Create or update .env file for backend
$envContent = @"
# Node environment
NODE_ENV=development

# Server configuration
PORT=4000

# Database configuration - using in-memory/local SQLite for Prisma
# For development without Docker, we'll use SQLite for simplicity
DATABASE_TYPE=postgres
DATABASE_URL=file:./dev.db

# JWT configuration
JWT_SECRET=development_secret_key_change_in_production
JWT_EXPIRATION=1d

# CORS configuration
CORS_ORIGIN=http://localhost:3000
"@

$envFilePath = Join-Path -Path $PSScriptRoot -ChildPath "backend\.env"
Set-Content -Path $envFilePath -Value $envContent
Write-Host "Created .env file for backend with SQLite configuration" -ForegroundColor Green

# Update Prisma schema to use SQLite
$prismaSchemaPath = Join-Path -Path $PSScriptRoot -ChildPath "backend\prisma\schema.prisma"
$prismaSchemaContent = Get-Content -Path $prismaSchemaPath -Raw
$updatedPrismaSchema = $prismaSchemaContent -replace "provider = ""postgresql""", "provider = ""sqlite"""
Set-Content -Path $prismaSchemaPath -Value $updatedPrismaSchema
Write-Host "Updated Prisma schema to use SQLite provider" -ForegroundColor Green

# Install dependencies if needed
Write-Host "Checking and installing dependencies..." -ForegroundColor Cyan

# Backend dependencies
Push-Location -Path (Join-Path -Path $PSScriptRoot -ChildPath "backend")
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Backend dependencies already installed" -ForegroundColor Green
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npm run prepare

Pop-Location

# Frontend dependencies
Push-Location -Path (Join-Path -Path $PSScriptRoot -ChildPath "frontend")
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Frontend dependencies already installed" -ForegroundColor Green
}
Pop-Location

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "`nTo start the backend:" -ForegroundColor Cyan
Write-Host "cd backend; npm run dev" -ForegroundColor White
Write-Host "`nTo start the frontend:" -ForegroundColor Cyan
Write-Host "cd frontend; npm run dev" -ForegroundColor White
Write-Host "`nBackend will be available at: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan 