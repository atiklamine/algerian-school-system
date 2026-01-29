# Algerian School System - Automated Setup Script
# This script prepares the environment, installs dependencies, and sets up the database.

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Automated Setup for Algerian School System..." -ForegroundColor Cyan

# 1. Create Tools Directory
$toolsDir = Join-Path $PSScriptRoot "tools"
if (-not (Test-Path $toolsDir)) {
    Write-Host "📁 Creating tools directory..." -ForegroundColor Green
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
}

# 2. Check Prerequisites
Write-Host "🔍 Checking for Node.js..."
$nodeVersion = & node -v 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed locally." -ForegroundColor Red
    Write-Host "💡 Please install Node.js (v18+) from https://nodejs.org/" -ForegroundColor Yellow
    # Note: Automated portable download is complex due to architecture and OS versioning.
    # We advocate for standard installation for long-term stability.
} else {
    Write-Host "✅ Found Node.js: $nodeVersion" -ForegroundColor Green
}

# 3. Setup Environment Files
Write-Host "📄 Setting up environment files..." -ForegroundColor Green

# Backend .env
$backendEnv = Join-Path $PSScriptRoot "backend\.env"
if (-not (Test-Path $backendEnv)) {
    Copy-Item (Join-Path $PSScriptRoot "backend\.env.example") $backendEnv
    Write-Host "   Created backend/.env from template."
} else {
    Write-Host "   backend/.env already exists. Skipping." -ForegroundColor Gray
}

# Frontend .env
$frontendEnv = Join-Path $PSScriptRoot "frontend2\.env"
if (-not (Test-Path $frontendEnv)) {
    Copy-Item (Join-Path $PSScriptRoot "frontend2\.env.example") $frontendEnv
    Write-Host "   Created frontend2/.env from template."
} else {
    Write-Host "   frontend2/.env already exists. Skipping." -ForegroundColor Gray
}

# 4. Install Dependencies
Write-Host "📦 Installing Backend dependencies..." -ForegroundColor Green
Set-Location (Join-Path $PSScriptRoot "backend")
npm install

Write-Host "📦 Installing Frontend dependencies..." -ForegroundColor Green
Set-Location (Join-Path $PSScriptRoot "frontend2")
npm install

# 5. Database Setup (Optional/Prompt)
Set-Location $PSScriptRoot
$confirmDB = Read-Host "Do you want to run Prisma migrations and seeding? (requires Postgres running) [y/N]"
if ($confirmDB -eq "y") {
    Set-Location (Join-Path $PSScriptRoot "backend")
    Write-Host "🔄 Running Prisma migrations..." -ForegroundColor Green
    npx prisma generate
    npx prisma migrate dev --name init
    Write-Host "🌱 Seeding database..." -ForegroundColor Green
    npm run prisma:seed
}

Write-Host "`n✨ Setup Complete!" -ForegroundColor Cyan
Write-Host "To start the app:"
Write-Host "1. In terminal 1: cd backend; npm run dev"
Write-Host "2. In terminal 2: cd frontend2; npm run dev"
