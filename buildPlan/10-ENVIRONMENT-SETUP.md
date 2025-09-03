# ⚙️ Environment Setup & Configuration Guide

**Document Version**: 1.0  
**Created**: 2025-09-03  
**Project**: ProjectDes AI Academy - Development Environment Setup

## 🎯 Quick Start Guide

### Prerequisites Checklist
```bash
# Required Software (must install before proceeding)
□ Node.js 20.x LTS
□ pnpm 9.x package manager
□ Docker Desktop 24.x
□ Git 2.40+
□ VS Code (recommended) or preferred IDE

# Optional but Recommended
□ Docker Compose 2.x (usually included with Docker Desktop)
□ PostgreSQL client (psql, pgAdmin, or TablePlus)
□ Redis client (RedisInsight or redis-cli)
```

### Installation Commands (macOS)
```bash
# Install Node.js via Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Install pnpm
npm install -g pnpm@9

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# Verify installations
node --version    # Should show v20.x.x
pnpm --version    # Should show 9.x.x
docker --version  # Should show 24.x.x
git --version     # Should show 2.40+
```

### Installation Commands (Ubuntu/Linux)
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm@9

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Reboot or logout/login to apply Docker group changes
# Verify installations (same as macOS)
```

### Installation Commands (Windows)
```powershell
# Install via Chocolatey (recommended)
# First install Chocolatey from: https://chocolatey.org/install

# Install required software
choco install nodejs --version=20.11.1
choco install pnpm
choco install docker-desktop
choco install git

# Or install manually:
# Node.js: https://nodejs.org/en/download/
# pnpm: npm install -g pnpm@9
# Docker Desktop: https://www.docker.com/products/docker-desktop/
# Git: https://git-scm.com/download/win

# Verify installations in PowerShell
node --version
pnpm --version
docker --version
git --version
```

## 🏗️ Project Setup

### Step 1: Clone and Initialize Project
```bash
# Navigate to your projects directory
cd /Users/michaelmishayev/Desktop/Projects/school_2/TODO/

# Initialize the project (if not already done)
# git clone <repository-url> projectdes-academy
cd projectdes-academy

# Install all dependencies
pnpm install

# Generate Prisma client
pnpm db:generate
```

### Step 2: Environment Variables Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
vim .env.local  # or use your preferred editor
```

#### .env.local Configuration
```bash
# ==============================================
# DEVELOPMENT ENVIRONMENT VARIABLES
# ==============================================

# Application
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (matches docker-compose.yml)
DATABASE_URL="postgresql://projectdes:localpassword@localhost:5432/projectdes_dev"

# Strapi CMS
STRAPI_URL="http://localhost:1337"
STRAPI_API_TOKEN="6ba76f584778637fd308f48aac27461c08af957ef205a3281c444c32859f229d923a1984ec93b9564b26db3c10e68f2ccca8983e27ec9b42483e3b8f6faca7a2a52f9b586357c4f94ad37792a7b0f271c164f661e03e4af725cf24708fd5967db6d2431c7afb9be47082538f62ab7b49cad7c68cd290f0c429b3706fbb8df2dc"

# Custom JWT Authentication
JWT_SECRET="dev-secret-change-in-production-ultra-secure-key-123"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Redis (for sessions and caching)
REDIS_URL="redis://localhost:6379"

# Email Configuration (Development - Mock)
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER="test@example.com"
SMTP_PASS="password"
FROM_EMAIL="noreply@projectdes-academy.local"
SUPPORT_EMAIL="support@projectdes-academy.local"

# Development Debugging
DEBUG=1
LOG_LEVEL="debug"

# Payment Integration (Development - Mock)
STRIPE_SECRET_KEY="sk_test_development_key"
STRIPE_WEBHOOK_SECRET="whsec_development_secret"
PAYPAL_CLIENT_ID="development_paypal_client"
PAYPAL_CLIENT_SECRET="development_paypal_secret"

# Analytics (Development)
GOOGLE_ANALYTICS_ID="G-DEVELOPMENT"
SENTRY_DSN="https://development@sentry.io/project"
```

### Step 3: Database Setup
```bash
# Start PostgreSQL and Redis via Docker
docker-compose up -d postgres redis

# Wait for services to start (check with)
docker-compose ps

# Run database migrations
pnpm db:push

# Seed database with initial data
pnpm db:seed

# Verify database connection
pnpm db:studio  # Opens Prisma Studio at http://localhost:5555
```

### Step 4: Strapi CMS Setup
```bash
# Navigate to CMS directory
cd cms

# Install Strapi dependencies
npm install

# Start Strapi in development mode
npm run develop

# First-time setup:
# 1. Go to http://localhost:1337/admin
# 2. Create admin account
# 3. Configure content types (will be automated in Phase 2)
# 4. Generate API token (already provided in env)

# Return to project root
cd ..
```

### Step 5: Start Development Server
```bash
# Start all services
pnpm dev

# This starts:
# - Next.js app on http://localhost:3000
# - Strapi CMS on http://localhost:1337
# - PostgreSQL on localhost:5432
# - Redis on localhost:6379
```

## 🐳 Docker Development Environment

### Docker Compose Services
```yaml
# docker-compose.yml overview
services:
  postgres:     # PostgreSQL database
  redis:        # Session store and caching
  pgadmin:      # Database administration (port 5050)
  adminer:      # Lightweight DB client (port 8080)
  redis-commander: # Redis management (port 8081)
```

### Docker Management Commands
```bash
# Start all services
docker-compose up -d

# View service status
docker-compose ps

# View service logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ removes all data)
docker-compose down -v

# Restart specific service
docker-compose restart postgres

# Execute commands in containers
docker-compose exec postgres psql -U projectdes -d projectdes_dev
docker-compose exec redis redis-cli
```

### Database Administration Tools

#### pgAdmin (Recommended for GUI)
```
URL: http://localhost:5050
Email: admin@projectdes.com
Password: admin123

Connection:
- Host: postgres
- Port: 5432
- Database: projectdes_dev
- Username: projectdes
- Password: localpassword
```

#### Adminer (Lightweight Alternative)
```
URL: http://localhost:8080
System: PostgreSQL
Server: postgres
Username: projectdes
Password: localpassword
Database: projectdes_dev
```

#### Redis Commander
```
URL: http://localhost:8081
Connection: Automatically connected to Redis
```

## 🔧 IDE Configuration

### VS Code Setup (Recommended)
```bash
# Install recommended extensions
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension prisma.prisma
code --install-extension ms-playwright.playwright

# Install workspace settings
# Create .vscode/settings.json (already included in project)
```

#### VS Code Settings (.vscode/settings.json)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "prisma.showPrismaDataPlatformNotification": false
}
```

#### VS Code Extensions List
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode", 
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-playwright.playwright",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

## 🧪 Testing Environment Setup

### Testing Tools Installation
```bash
# Testing dependencies are already included in package.json
# Verify testing setup
pnpm test --version   # Vitest
pnpm exec playwright --version  # Playwright

# Install Playwright browsers (first time only)
pnpm exec playwright install

# Install system dependencies for Playwright (Linux)
pnpm exec playwright install-deps
```

### Running Tests
```bash
# Unit tests
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage

# E2E tests
pnpm test:e2e          # Headless mode
pnpm test:e2e:ui       # With UI
pnpm test:e2e:debug    # Debug mode

# Specific test files
pnpm test Button.test.tsx
pnpm test:e2e login.spec.ts
```

## 🔍 Development Tools

### Database Management
```bash
# Prisma Studio (GUI for database)
pnpm db:studio         # http://localhost:5555

# Database operations
pnpm db:reset          # Reset database
pnpm db:seed           # Seed with test data
pnpm db:migrate        # Run migrations
pnpm db:generate       # Generate Prisma client
```

### Code Quality Tools
```bash
# Linting
pnpm lint              # Check all files
pnpm lint:fix          # Fix auto-fixable issues

# Type checking
pnpm type-check        # TypeScript type checking

# Formatting
pnpm format            # Format all files
pnpm format:check      # Check formatting

# Build verification
pnpm build             # Production build
pnpm start             # Start production server
```

### Performance Analysis
```bash
# Bundle analyzer
ANALYZE=true pnpm build

# Lighthouse CI (requires server running)
pnpm lighthouse

# Performance profiling
pnpm build && pnpm start
# Then use Chrome DevTools Performance tab
```

## 🚀 Development Workflow

### Daily Development Process
```bash
# 1. Start your development session
docker-compose up -d     # Start database services
pnpm dev                # Start development server

# 2. Make your changes
# - Edit code in your preferred IDE
# - Changes auto-reload in browser

# 3. Test your changes
pnpm test               # Run unit tests
pnpm test:e2e           # Run E2E tests (optional)

# 4. Quality checks
pnpm lint               # Check code quality
pnpm type-check         # Check TypeScript
pnpm format             # Format code

# 5. Database operations (if needed)
pnpm db:generate        # After schema changes
pnpm db:push            # Push schema to database
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/user-authentication
git add .
git commit -m "feat: implement user registration system"
git push origin feature/user-authentication

# Code quality pre-commit
# (Husky hooks will run linting and tests automatically)
```

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### Port Conflicts
```bash
# Check if ports are in use
lsof -i :3000  # Next.js
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :1337  # Strapi

# Kill processes if needed
kill -9 <PID>

# Or change ports in configuration files
```

#### Database Connection Issues
```bash
# Check database status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Reset database (⚠️ removes all data)
docker-compose down -v
docker-compose up -d postgres
pnpm db:push
pnpm db:seed
```

#### Node.js / pnpm Issues
```bash
# Clear pnpm cache
pnpm store prune

# Clear node_modules and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Check Node.js version
node --version  # Should be 20.x

# Switch Node.js version (if using nvm)
nvm use 20
```

#### Docker Issues
```bash
# Check Docker status
docker --version
docker-compose --version

# Restart Docker Desktop (macOS/Windows)
# System tray -> Docker -> Restart

# Clear Docker cache
docker system prune -f

# Reset Docker volumes (⚠️ removes all data)
docker-compose down -v
docker volume prune -f
```

#### Build/Runtime Errors
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev

# Clear Turbo cache
pnpm turbo clean

# Full clean build
pnpm clean
pnpm install
pnpm build
```

### Environment Validation Script
```bash
#!/bin/bash
# scripts/validate-environment.sh

echo "🔍 Validating development environment..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "Node.js: $NODE_VERSION"

# Check pnpm version
PNPM_VERSION=$(pnpm --version)
echo "pnpm: $PNPM_VERSION"

# Check Docker
DOCKER_VERSION=$(docker --version)
echo "Docker: $DOCKER_VERSION"

# Check services
echo "🐳 Checking Docker services..."
docker-compose ps

# Check database connection
echo "🗄️ Testing database connection..."
pnpm db:generate > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
fi

# Check build
echo "🏗️ Testing build..."
pnpm build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
fi

echo "✅ Environment validation complete!"
```

## 📚 Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)

### Development Tools
- [Prisma Studio](http://localhost:5555) - Database GUI
- [Strapi Admin](http://localhost:1337/admin) - CMS Admin Panel
- [pgAdmin](http://localhost:5050) - PostgreSQL Admin
- [Redis Commander](http://localhost:8081) - Redis GUI

### Quick Reference Commands
```bash
# Essential commands for daily development
pnpm dev              # Start development
pnpm test             # Run tests
pnpm build            # Build for production
pnpm lint             # Check code quality
pnpm db:studio        # Open database GUI
docker-compose up -d  # Start services
docker-compose logs -f # View logs
```

**Environment setup complete - Ready for development workflow guidelines.**