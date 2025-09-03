# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProjectDes AI Academy is an educational SaaS platform built with enterprise-grade architecture. The project converts a Webflow template into a modern, scalable platform using Next.js 14, Strapi CMS, and PostgreSQL.

**Architecture**: Monorepo (Turborepo + pnpm)  
**Primary Directory**: `TODO/projectdes-academy/`  
**Source Material**: `newCode/` (Webflow conversion assets)  

## Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript 5.3** (strict mode)
- **Tailwind CSS 3.4** with custom design system
- **Framer Motion** for animations
- **React Hook Form + Zod** for validation
- **Custom JWT authentication** (not NextAuth)

### Backend
- **Strapi v4.25.9** (headless CMS)
- **PostgreSQL 15** with Prisma ORM
- **Express API** for custom endpoints
- **Redis** for session caching

### Infrastructure
- **Docker + Docker Compose** for development
- **PM2** for process management
- **Nginx** for reverse proxy
- **Turborepo** for monorepo management

## Development Commands

### Essential Commands
```bash
# Development
pnpm dev                    # Start all services (Next.js + API + Strapi + DB)
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all packages
pnpm type-check            # TypeScript validation

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:push              # Push schema to database
pnpm db:migrate           # Run migrations
pnpm db:seed              # Seed development data
pnpm db:studio            # Open Prisma Studio

# Testing
pnpm test:unit            # Unit tests only
pnpm test:e2e             # End-to-end tests
```

### Package-Specific Commands
```bash
# Web app (Next.js)
cd apps/web && pnpm dev   # Port 3000

# API server
cd apps/api && pnpm dev   # Port 3001

# Run single test file
pnpm test UserProfile.test.tsx

# Test with coverage
pnpm test --coverage
```

## Architecture Overview

### Monorepo Structure
```
TODO/projectdes-academy/
├── apps/
│   ├── web/              # Next.js 14 frontend (port 3000)
│   └── api/              # Express API server (port 3001)
├── packages/
│   ├── db/               # Prisma schema + client
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Shared utilities
│   └── ui/               # Shared UI components
├── cms/                  # Strapi CMS configuration
└── qa/                   # Testing utilities
```

### Database Architecture
The system uses a comprehensive 28+ model schema with:
- **Multi-language support** (EN, RU, HE) via JSON fields
- **Course hierarchy**: Categories → Courses → Modules → Lessons
- **Progress tracking**: Enrollment → Progress → Certificates
- **Content management**: MediaAssets, Blog, Events, Campaigns
- **Full audit trails** with timestamps and soft deletes

Key models: `User`, `Course`, `Enrollment`, `Progress`, `Payment`, `Review`

### Authentication System
Custom JWT implementation with:
- `Session` model for token management  
- Role-based access (STUDENT, INSTRUCTOR, ADMIN, SUPPORT)
- Secure password hashing with bcrypt
- Session tracking with IP/user agent logging

### API Architecture
Dual backend approach:
1. **Strapi CMS** (port 1337) - Content management, courses, media
2. **Custom Express API** (port 3001) - Authentication, payments, custom logic
3. **Next.js API Routes** - Middleware, server actions

## Key Configuration Files

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://projectdes:localpassword@localhost:5432/projectdes_dev"

# Strapi
STRAPI_URL="http://localhost:1337"
STRAPI_API_TOKEN="6ba76f584778637fd308f48aac27461c08af957ef205a3281c444c32859f229d923a1984ec93b9564b26db3c10e68f2ccca8983e27ec9b42483e3b8f6faca7a2a52f9b586357c4f94ad37792a7b0f271c164f661e03e4af725cf24708fd5967db6d2431c7afb9be47082538f62ab7b49cad7c68cd290f0c429b3706fbb8df2dc"

# JWT
JWT_SECRET="temp-dev-secret-change-later"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
```

### Database Schema Location
Main schema file: `/schema.prisma` (root level - shared across packages)
Package schema: `packages/db/prisma/schema.prisma`

## Development Patterns

### Component Architecture
- **Server Components** by default for data fetching
- **Client Components** only when needed (forms, interactions)
- Co-located types: `ComponentName.types.ts` alongside components
- Consistent props interface: `ComponentNameProps`

### Data Fetching Strategy
1. **Server Components** with built-in caching for static data
2. **SWR/React Query** for client-side dynamic data
3. **Strapi API integration** via custom client in `lib/api.ts`
4. **Prisma queries** in API routes with proper error handling

### Styling Architecture
Hybrid approach:
- **Tailwind CSS** for utility classes and rapid development
- **Custom CSS** for complex animations and Webflow compatibility
- **Design tokens** for consistent spacing, colors, typography
- **Mobile-first** responsive design

### Multi-language Support
JSON-based translations stored in database:
```typescript
// Example: Course title in multiple languages
{
  title: {
    "en": "Introduction to AI",
    "ru": "Введение в ИИ", 
    "he": "מבוא לבינה מלאכותית"
  }
}
```

## Quality Standards

### Testing Requirements
- **Unit tests**: >80% coverage for components and utilities
- **Integration tests**: >70% coverage for API routes and forms
- **E2E tests**: Critical user journeys (registration, enrollment, payments)
- **Visual tests**: Component snapshots and responsive design

### Performance Targets
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Bundle size**: <500KB initial, <2MB total
- **API response**: <200ms for standard queries
- **Database**: <100ms for indexed queries

### Security Implementation
- **Input validation** with Zod schemas on all endpoints
- **SQL injection protection** via Prisma (parameterized queries)
- **XSS protection** with sanitized inputs and CSP headers
- **Authentication** with secure JWT and session management
- **Rate limiting** on all public APIs

## Common Development Tasks

### Adding New Course Content
1. Update Strapi content types if needed
2. Modify Prisma schema for new fields
3. Run `pnpm db:generate && pnpm db:push`
4. Update TypeScript types in `packages/types/`
5. Create/update React components for display

### Implementing New Authentication Features
1. Update `User` model in schema.prisma
2. Modify JWT payload structure in `lib/auth.ts`
3. Update API middleware in `apps/api/middleware/auth.ts`
4. Add new protected routes or permissions

### Adding Multi-language Content
1. Ensure database field uses JSON type for translations
2. Update TypeScript interfaces with locale keys
3. Implement language switching in components
4. Add translation management in Strapi admin

## Troubleshooting

### Common Development Issues
- **Prisma client out of sync**: Run `pnpm db:generate`
- **Port conflicts**: Check Docker containers with `docker ps`
- **Type errors after schema changes**: Restart TypeScript server
- **Cache issues**: Clear Next.js cache with `rm -rf .next`

### Database Connection Issues
1. Ensure PostgreSQL container is running: `docker ps`
2. Check DATABASE_URL in .env files
3. Verify network connectivity: `docker network ls`
4. Reset database: `docker-compose down -v && docker-compose up -d`

### Build Failures
1. Check Node.js version (>= 20.0.0)
2. Verify pnpm version (>= 9.0.0)  
3. Clear dependencies: `rm -rf node_modules && pnpm install`
4. Check for TypeScript errors: `pnpm type-check`

## Project Context

### Business Requirements
Educational platform supporting:
- Multi-language course content (EN/RU/HE)
- Student progress tracking and certificates
- Instructor management and content creation
- Payment processing and subscription management
- Blog and marketing content management
- Mobile-responsive design for all devices

### Development Phase Status
The project follows a 7-phase implementation approach:
1. ✅ Foundation setup (Monorepo + Docker)
2. 🔄 Content migration (Webflow → Strapi) 
3. ⏳ Styling implementation (Tailwind + Custom CSS)
4. ⏳ Next.js development (Components + Pages)
5. ⏳ API integration (Authentication + Payments)
6. ⏳ Testing implementation (Unit + E2E)
7. ⏳ Production deployment (Docker + Nginx)

Comprehensive documentation available in `buildPlan/` directory with phase-specific implementation guides.