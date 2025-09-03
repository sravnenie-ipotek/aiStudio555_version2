# 🚀 Phase 7: Production Preparation & Deployment Strategy

**Duration**: 3-4 hours  
**Priority**: Critical - Production readiness and deployment pipeline  
**Dependencies**: Phases 1-6 (Complete tested application)

## 🏗️ Production Architecture Overview

### 7.1 Deployment Environment Strategy
```
Production Environment:
├── Custom Server Infrastructure (User-provided)
├── Docker Containerization
├── PM2 Process Management  
├── PostgreSQL Database
├── Redis Session Store
├── Nginx Reverse Proxy (recommended)
└── SSL/TLS Termination
```

### 7.2 Container Strategy

#### 7.2.1 Multi-Stage Docker Build
```dockerfile
# Dockerfile.production
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile --prod

FROM base AS builder  
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy packages
COPY --from=deps --chown=nextjs:nodejs /app/packages ./packages

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
```

#### 7.2.2 Production Docker Compose
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - STRAPI_URL=${STRAPI_URL}
      - STRAPI_API_TOKEN=${STRAPI_API_TOKEN}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
      - JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  strapi:
    build:
      context: ./cms
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - STRAPI_DATABASE_CLIENT=postgres
      - JWT_SECRET=${STRAPI_JWT_SECRET}
    ports:
      - "1337:1337"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - strapi_uploads:/app/public/uploads

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
      - strapi
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  strapi_uploads:

networks:
  default:
    driver: bridge
```

## ⚙️ Environment Configuration

### 7.3 Production Environment Variables
```bash
# .env.production
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Application
NEXT_PUBLIC_APP_URL=https://projectdes-academy.com
NEXT_PUBLIC_STRAPI_URL=https://cms.projectdes-academy.com

# Database
DATABASE_URL=postgresql://username:password@postgres:5432/projectdes_production
POSTGRES_DB=projectdes_production
POSTGRES_USER=projectdes_user
POSTGRES_PASSWORD=secure_production_password

# Redis
REDIS_URL=redis://redis:6379

# Strapi CMS
STRAPI_URL=http://strapi:1337
STRAPI_API_TOKEN=6ba76f584778637fd308f48aac27461c08af957ef205a3281c444c32859f229d923a1984ec93b9564b26db3c10e68f2ccca8983e27ec9b42483e3b8f6faca7a2a52f9b586357c4f94ad37792a7b0f271c164f661e03e4af725cf24708fd5967db6d2431c7afb9be47082538f62ab7b49cad7c68cd290f0c429b3706fbb8df2dc
STRAPI_JWT_SECRET=secure_strapi_jwt_secret_production

# Authentication
JWT_SECRET=ultra_secure_jwt_secret_for_production_use_only
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Service (Configure with actual provider)
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=noreply@projectdes-academy.com
SMTP_PASS=secure_smtp_password
FROM_EMAIL=noreply@projectdes-academy.com
SUPPORT_EMAIL=support@projectdes-academy.com

# Payment Processing (Configure when implementing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=live_paypal_client_id
PAYPAL_CLIENT_SECRET=live_paypal_client_secret

# Monitoring & Analytics
SENTRY_DSN=https://...@sentry.io/...
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Security
ALLOWED_ORIGINS=https://projectdes-academy.com,https://www.projectdes-academy.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Performance
MAX_OLD_SPACE_SIZE=2048
```

### 7.4 PM2 Production Configuration
```javascript
// ecosystem.config.production.js
module.exports = {
  apps: [
    {
      name: 'projectdes-academy',
      script: 'apps/web/server.js',
      cwd: '/app',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/app/logs/err.log',
      out_file: '/app/logs/out.log',
      log_file: '/app/logs/combined.log',
      time: true,
      max_memory_restart: '2G',
      node_args: '--max-old-space-size=2048',
      
      // Auto-restart configuration
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Monitoring
      monitoring: true,
      pmx: true,
      
      // Health checks
      health_check_http: {
        url: 'http://localhost:3000/api/health',
        interval: 30000,
        timeout: 5000,
        max_fails: 3
      }
    },
    
    {
      name: 'projectdes-strapi',
      script: 'npm',
      args: 'run start',
      cwd: '/app/cms',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 1337
      },
      error_file: '/app/logs/strapi-err.log',
      out_file: '/app/logs/strapi-out.log',
      log_file: '/app/logs/strapi-combined.log',
      time: true,
      max_memory_restart: '1G'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:projectdes/ai-academy.git',
      path: '/var/www/projectdes-academy',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.production.js --env production',
      'pre-setup': ''
    }
  }
}
```

## 🔒 Security Hardening

### 7.5 Nginx Production Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
        keepalive 32;
    }

    upstream strapi {
        server strapi:1337;
        keepalive 32;
    }

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Main application
    server {
        listen 80;
        listen 443 ssl http2;
        server_name projectdes-academy.com www.projectdes-academy.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Redirect HTTP to HTTPS
        if ($scheme != "https") {
            return 301 https://$server_name$request_uri;
        }

        # Security
        client_max_body_size 10M;
        
        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # Static assets
        location /_next/static/ {
            proxy_pass http://app;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, immutable";
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Auth endpoints with stricter limits
        location ~ ^/api/auth/(login|register) {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Main application
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Strapi CMS (admin)
    server {
        listen 443 ssl http2;
        server_name cms.projectdes-academy.com;

        # SSL configuration (same as above)
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Restrict access to admin panel
        allow 10.0.0.0/8;     # Internal network
        allow 192.168.0.0/16; # Private network
        deny all;

        location / {
            proxy_pass http://strapi;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### 7.6 Database Security
```sql
-- production-security.sql
-- Create dedicated database user
CREATE USER projectdes_app WITH PASSWORD 'secure_app_password';

-- Grant minimal required permissions
GRANT CONNECT ON DATABASE projectdes_production TO projectdes_app;
GRANT USAGE ON SCHEMA public TO projectdes_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO projectdes_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO projectdes_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO projectdes_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO projectdes_app;

-- Configure connection limits
ALTER USER projectdes_app CONNECTION LIMIT 20;

-- Enable row level security on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY users_own_data ON users
    FOR ALL TO projectdes_app
    USING (id = current_setting('app.user_id')::uuid);
```

## 📊 Monitoring & Observability

### 7.7 Health Check System
```typescript
// app/api/health/route.ts - Production health checks
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      strapi: await checkStrapi(),
      diskSpace: await checkDiskSpace(),
      memory: checkMemoryUsage()
    }
  }

  const isHealthy = Object.values(checks.checks).every(check => check.status === 'healthy')
  
  return Response.json(checks, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', responseTime: '<10ms' }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}

async function checkRedis() {
  try {
    const redis = new Redis(process.env.REDIS_URL)
    await redis.ping()
    await redis.quit()
    return { status: 'healthy', responseTime: '<5ms' }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}

async function checkStrapi() {
  try {
    const response = await fetch(`${process.env.STRAPI_URL}/_health`, {
      timeout: 5000
    })
    return { 
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime: response.headers.get('x-response-time') || 'unknown'
    }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}

async function checkDiskSpace() {
  try {
    const stats = await fs.promises.statfs('/')
    const free = stats.bavail * stats.bsize
    const total = stats.blocks * stats.bsize
    const used = total - free
    const usedPercentage = (used / total) * 100

    return {
      status: usedPercentage < 90 ? 'healthy' : 'warning',
      freeSpace: `${Math.round(free / 1024 / 1024 / 1024)}GB`,
      usedPercentage: `${Math.round(usedPercentage)}%`
    }
  } catch (error) {
    return { status: 'unknown', error: error.message }
  }
}

function checkMemoryUsage() {
  const usage = process.memoryUsage()
  const totalMemory = usage.rss + usage.heapUsed + usage.external
  const memoryLimitMB = parseInt(process.env.MAX_OLD_SPACE_SIZE || '2048')
  const usedPercentage = (usage.heapUsed / (memoryLimitMB * 1024 * 1024)) * 100

  return {
    status: usedPercentage < 80 ? 'healthy' : 'warning',
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    usedPercentage: `${Math.round(usedPercentage)}%`
  }
}
```

### 7.8 Application Monitoring
```typescript
// lib/monitoring.ts - Production monitoring
import * as Sentry from '@sentry/nextjs'

export function initializeMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
      beforeSend(event) {
        // Filter sensitive data
        if (event.request) {
          delete event.request.cookies
          if (event.request.data) {
            delete event.request.data.password
            delete event.request.data.confirmPassword
          }
        }
        return event
      }
    })
  }
}

export function trackPerformanceMetric(name: string, value: number, tags?: Record<string, string>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.metrics.gauge(name, value, { tags })
  }
}

export function trackBusinessMetric(event: string, data: Record<string, any>) {
  // Course enrollment tracking
  if (event === 'course_enrolled') {
    trackPerformanceMetric('course_enrollments', 1, {
      course_id: data.courseId,
      user_type: data.userType
    })
  }

  // User registration tracking
  if (event === 'user_registered') {
    trackPerformanceMetric('user_registrations', 1, {
      source: data.source || 'direct'
    })
  }

  // Form submission tracking
  if (event === 'form_submitted') {
    trackPerformanceMetric('form_submissions', 1, {
      form_type: data.formType
    })
  }
}
```

## 🔄 Backup & Recovery

### 7.9 Database Backup Strategy
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

DB_NAME=${POSTGRES_DB}
DB_USER=${POSTGRES_USER}
DB_HOST=${DB_HOST:-localhost}
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/projectdes_${DATE}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME --clean --no-owner --no-privileges > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (configure with your provider)
# aws s3 cp "${BACKUP_FILE}.gz" s3://projectdes-backups/database/
# or
# gsutil cp "${BACKUP_FILE}.gz" gs://projectdes-backups/database/

echo "Database backup completed: ${BACKUP_FILE}.gz"
```

### 7.10 Disaster Recovery Plan
```yaml
# disaster-recovery.yml
recovery_procedures:
  database_failure:
    steps:
      1. "Switch to read-only mode"
      2. "Restore from latest backup"
      3. "Verify data integrity"
      4. "Resume normal operations"
    rto: "< 1 hour"  # Recovery Time Objective
    rpo: "< 15 minutes"  # Recovery Point Objective

  application_failure:
    steps:
      1. "Check application logs"
      2. "Restart PM2 processes"
      3. "If persist, rollback to previous version"
      4. "Investigate and fix issues"
    rto: "< 15 minutes"
    rpo: "0 minutes"

  server_failure:
    steps:
      1. "Activate backup server"
      2. "Restore database from backup"
      3. "Deploy latest application version"
      4. "Update DNS if necessary"
    rto: "< 2 hours"
    rpo: "< 30 minutes"
```

## 📈 Performance Optimization

### 7.11 Production Optimizations
```javascript
// next.config.production.js
const nextConfig = {
  output: 'standalone',
  
  // Optimization
  swcMinify: true,
  compress: true,
  
  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        }
      ]
    }
  ],

  // Image optimization
  images: {
    domains: ['cms.projectdes-academy.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // Bundle analyzer (conditional)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(new BundleAnalyzerPlugin())
      return config
    }
  }),

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizeCss: true,
    optimizeServerReact: true
  }
}

module.exports = nextConfig
```

## ✅ Phase 7 Deliverables

### 7.12 Completion Checklist
- [ ] Production Docker containers configured
- [ ] PM2 process management setup
- [ ] Nginx reverse proxy configuration
- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured
- [ ] Database security hardening
- [ ] Health check endpoints implemented
- [ ] Monitoring and alerting setup
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] Performance optimizations applied
- [ ] Security headers and CSP configured

### 7.13 Deployment Artifacts
```javascript
const deploymentArtifacts = {
  containers: {
    "app": "Next.js application with PM2",
    "postgres": "PostgreSQL 15 with security",
    "redis": "Redis 7 for sessions",
    "strapi": "Strapi CMS with authentication",
    "nginx": "Reverse proxy with SSL"
  },

  configurations: {
    "docker-compose.production.yml": "Production container orchestration",
    "nginx.conf": "Reverse proxy configuration",
    "ecosystem.config.production.js": "PM2 process management",
    ".env.production": "Production environment variables"
  },

  scripts: {
    "deploy.sh": "Automated deployment script",
    "backup-database.sh": "Database backup automation",
    "health-check.sh": "System health monitoring",
    "ssl-renewal.sh": "SSL certificate renewal"
  },

  monitoring: {
    "health-endpoints": "Application health checks",
    "sentry-integration": "Error tracking and monitoring",
    "performance-metrics": "Application performance tracking",
    "business-metrics": "User engagement and conversion tracking"
  }
}
```

### 7.14 Go-Live Checklist
```bash
# Pre-deployment checklist
□ All environment variables configured
□ SSL certificates installed and valid
□ Database migrations tested
□ Backup procedures tested
□ Health checks passing
□ Performance tests passing
□ Security scan completed
□ DNS configuration updated
□ CDN configured (if using)
□ Monitoring alerts configured

# Post-deployment verification
□ Application accessible via HTTPS
□ All pages loading correctly
□ Forms submitting successfully
□ User registration/login working
□ Database connectivity confirmed
□ Health endpoints responding
□ SSL certificate valid
□ Performance within targets
□ Error monitoring active
□ Backup job scheduled
```

## 🔧 Maintenance & Updates

### 7.15 Update Strategy
```bash
#!/bin/bash
# scripts/update-deployment.sh

set -e

echo "Starting deployment update..."

# 1. Backup current state
./scripts/backup-database.sh

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies
pnpm install --frozen-lockfile

# 4. Run database migrations
pnpm db:migrate

# 5. Build application
pnpm build

# 6. Restart services with zero downtime
pm2 reload ecosystem.config.production.js --env production

# 7. Verify deployment
sleep 30
curl -f http://localhost:3000/api/health || {
  echo "Health check failed! Rolling back..."
  pm2 reload ecosystem.config.production.js --env production
  exit 1
}

echo "Deployment completed successfully!"
```

## 🔜 Post-Deployment

### 7.16 Ongoing Maintenance Tasks
```javascript
const maintenanceTasks = {
  daily: [
    "Check application health endpoints",
    "Review error logs and alerts",
    "Monitor database performance",
    "Check backup completion"
  ],
  
  weekly: [
    "Security updates check",
    "Performance metrics review",  
    "User activity analysis",
    "Database maintenance"
  ],
  
  monthly: [
    "Security audit",
    "Disaster recovery test",
    "Capacity planning review",
    "Performance optimization"
  ]
}
```

**Phase 7 delivers a production-ready, secure, and scalable educational platform ready for deployment to custom server infrastructure.**