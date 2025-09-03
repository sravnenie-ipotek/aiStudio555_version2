# 📐 Technical Specifications & Architecture Diagrams

**Document Version**: 1.0  
**Created**: 2025-09-03  
**Project**: ProjectDes AI Academy - Educational SaaS Platform

## 🏗️ System Architecture Overview

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                        ProjectDes AI Academy                        │
│                     Educational SaaS Platform                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐                ┌─────────────────────┐
        │     FRONTEND        │                │      BACKEND        │
        │     LAYER           │◄──── API ────► │      LAYER          │
        └─────────────────────┘    Calls       └─────────────────────┘
                    │                                       │
                    │            ┌─────────────────────────┼────────────────┐
                    │            │                         │                │
                    ▼            ▼                         ▼                ▼
        ┌─────────────────┐ ┌─────────────┐    ┌─────────────────┐ ┌─────────────────┐
        │   Next.js 14    │ │ Express API │    │   Strapi CMS    │ │   PostgreSQL    │
        │  App Router     │ │  Node.js    │    │   Headless      │ │   Database      │
        └─────────────────┘ └─────────────┘    └─────────────────┘ └─────────────────┘
```

### Detailed Component Architecture
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION TIER                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Server Components│  │Client Components│  │   API Routes    │                   │
│  │                 │  │                 │  │                 │                   │
│  │ • Homepage      │  │ • Forms         │  │ • Authentication│                   │
│  │ • Course Pages  │  │ • Interactions  │  │ • Contact       │                   │
│  │ • Blog Posts    │  │ • Animations    │  │ • Newsletter    │                   │
│  │ • Static Content│  │ • User Actions  │  │ • Analytics     │                   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                   │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             APPLICATION TIER                                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐              ┌─────────────────┐                            │
│  │   Strapi CMS    │              │  Express API    │                            │
│  │                 │              │   (Future)      │                            │
│  │ • Content Mgmt  │              │ • Complex Logic │                            │
│  │ • Media Library │              │ • Payments      │                            │
│  │ • Multi-language│              │ • Background    │                            │
│  │ • Admin Panel   │              │   Jobs          │                            │
│  └─────────────────┘              └─────────────────┘                            │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               DATA TIER                                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   PostgreSQL    │  │     Redis       │  │   File System   │                   │
│  │                 │  │                 │  │                 │                   │
│  │ • 28+ Models    │  │ • Sessions      │  │ • Media Assets  │                   │
│  │ • Relationships │  │ • Caching       │  │ • Uploads       │                   │
│  │ • Indexes       │  │ • Rate Limiting │  │ • Static Files  │                   │
│  │ • Backups       │  │ • Queue         │  │ • Logs          │                   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack Specifications

### Frontend Technologies
```yaml
Framework: 
  Next.js: "14.2.x"
  TypeScript: "5.3.x"
  
Styling:
  Tailwind_CSS: "3.4.x"
  Custom_CSS: "Modern CSS features, CSS Grid, Flexbox"
  Animations: "Framer Motion 11.x with lazy loading"
  
UI_Components:
  Base: "Custom component library"
  Icons: "Heroicons, custom SVG icons"
  Fonts: "Manrope, Plus Jakarta Sans (Google Fonts)"
  
State_Management:
  Server_State: "Native Next.js Server Components"
  Client_State: "React useState, useEffect hooks"
  Form_State: "React Hook Form 7.x + Zod validation"
  
Performance:
  Image_Optimization: "Next.js Image component with WebP/AVIF"
  Bundle_Splitting: "Automatic code splitting"
  Caching: "Next.js App Router caching strategy"
```

### Backend Technologies
```yaml
API_Layer:
  Next_API_Routes: "Next.js 14 App Router API routes"
  Strapi_CMS: "v4.25.9 headless CMS"
  Express_API: "Future implementation for complex operations"

Database:
  Primary: "PostgreSQL 15.x"
  ORM: "Prisma 5.8.x"
  Models: "28+ comprehensive data models"
  Migrations: "Prisma migration system"

Caching_Session:
  Redis: "7.x for session storage and caching"
  Session_Management: "Custom JWT with HTTP-only cookies"

Authentication:
  Strategy: "Custom JWT implementation"
  Password_Hashing: "bcrypt with 12 salt rounds"
  Session_Duration: "7 days access, 30 days refresh"
```

### Infrastructure & DevOps
```yaml
Containerization:
  Docker: "Multi-stage builds for production"
  Docker_Compose: "Development and production orchestration"

Process_Management:
  PM2: "Cluster mode with health checks"
  Node_Args: "--max-old-space-size=2048"
  Auto_Restart: "On failure with exponential backoff"

Reverse_Proxy:
  Nginx: "SSL termination, load balancing, security headers"
  SSL: "TLS 1.2+ with modern cipher suites"
  Rate_Limiting: "API protection and DDoS prevention"

Monitoring:
  Health_Checks: "Custom health endpoints"
  Error_Tracking: "Sentry integration"
  Performance: "Custom metrics and alerting"
  Logs: "Structured logging with Winston"
```

## 📊 Database Schema Architecture

### Entity Relationship Diagram
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CORE ENTITIES                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐         │
│  │  User   │────▶│ UserProfile  │     │ Enrollment  │◄────│ Course   │         │
│  │         │     │              │     │             │     │          │         │
│  │ • id    │     │ • userId     │     │ • userId    │     │ • id     │         │
│  │ • email │     │ • firstName  │     │ • courseId  │     │ • title  │         │
│  │ • role  │     │ • lastName   │     │ • status    │     │ • price  │         │
│  │ • active│     │ • phone      │     │ • progress  │     │ • level  │         │
│  └─────────┘     │ • bio        │     └─────────────┘     └──────────┘         │
│       │          │ • avatar     │           │                   │              │
│       │          └──────────────┘           │                   │              │
│       │                                     │                   │              │
│       ▼                                     ▼                   ▼              │
│  ┌─────────┐                         ┌─────────────┐     ┌──────────┐         │
│  │Payment  │                         │  Progress   │     │ Module   │         │
│  │         │                         │             │     │          │         │
│  │ • userId│                         │ • userId    │     │ • courseId│         │
│  │ • amount│                         │ • courseId  │     │ • title  │         │
│  │ • status│                         │ • moduleId  │     │ • order  │         │
│  │ • method│                         │ • completed │     │ • duration│         │
│  └─────────┘                         │ • timeSpent │     └──────────┘         │
│                                      └─────────────┘           │              │
│                                                                ▼              │
│                                                         ┌──────────┐         │
│                                                         │ Lesson   │         │
│                                                         │          │         │
│                                                         │ • moduleId│         │
│                                                         │ • title  │         │
│                                                         │ • content│         │
│                                                         │ • order  │         │
│                                                         └──────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                             CONTENT ENTITIES                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐        │
│  │BlogPost  │────▶│BlogCategory │     │  Media       │◄────│Tag       │        │
│  │          │     │             │     │              │     │          │        │
│  │ • title  │     │ • name      │     │ • filename   │     │ • name   │        │
│  │ • slug   │     │ • slug      │     │ • mimetype   │     │ • slug   │        │
│  │ • content│     │ • color     │     │ • size       │     │ • color  │        │
│  │ • author │     └─────────────┘     │ • url        │     └──────────┘        │
│  │ • status │                         │ • alt        │                         │
│  └──────────┘                         └──────────────┘                         │
│       │                                                                        │
│       ▼                                                                        │
│  ┌──────────┐                                                                  │
│  │BlogComment│                                                                  │
│  │          │                                                                  │
│  │ • postId │                                                                  │
│  │ • userId │                                                                  │
│  │ • content│                                                                  │
│  │ • status │                                                                  │
│  └──────────┘                                                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ANALYTICS & TRACKING                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────┐     ┌─────────────────┐     ┌─────────────────┐                  │
│  │PageView  │     │CourseAnalytics  │     │ Notification    │                  │
│  │          │     │                 │     │                 │                  │
│  │ • path   │     │ • courseId      │     │ • userId        │                  │
│  │ • userId │     │ • enrollments   │     │ • title         │                  │
│  │ • session│     │ • completions   │     │ • content       │                  │
│  │ • device │     │ • avgProgress   │     │ • type          │                  │
│  └──────────┘     │ • revenue       │     │ • read          │                  │
│                    └─────────────────┘     └─────────────────┘                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Database Models Summary
```typescript
// Database models overview
interface DatabaseModels {
  // Authentication & Users
  User: "Primary user accounts with roles"
  UserProfile: "Extended user information"
  Session: "User sessions and JWT management"
  VerificationToken: "Email verification tokens"
  PasswordResetToken: "Password reset tokens"

  // Education System
  Course: "Course catalog with metadata"
  Module: "Course modules/chapters"
  Lesson: "Individual lessons within modules"
  Category: "Course categorization"
  Tag: "Content tagging system"
  Enrollment: "User course enrollments"
  Progress: "Learning progress tracking"
  Certificate: "Course completion certificates"

  // Content Management
  BlogPost: "Blog articles and content"
  BlogCategory: "Blog categorization"
  BlogComment: "Blog post comments"
  MediaAsset: "File and image management"

  // Commerce & Payments
  Payment: "Payment transactions"
  Coupon: "Discount codes and promotions"

  // Analytics & Engagement
  PageView: "Page visit tracking"
  CourseAnalytics: "Course performance metrics"
  Notification: "User notifications system"

  // Support & Community
  Review: "Course reviews and ratings"
  Testimonial: "Customer testimonials"
  ContactSubmission: "Contact form submissions"

  // Organization
  Instructor: "Course instructors/teachers"
  Partner: "Business partners"
  Event: "Events and workshops"
  
  // System
  SystemSettings: "Application configuration"
  AuditLog: "System activity logging"
}
```

## 🔌 API Architecture Specifications

### API Endpoint Structure
```
API Architecture:
├── Next.js API Routes (User Interactions)
│   ├── /api/auth/*              # Authentication endpoints
│   ├── /api/contact             # Contact form submission  
│   ├── /api/newsletter          # Newsletter subscription
│   ├── /api/courses/[id]/enroll # Course enrollment
│   └── /api/analytics/*         # Analytics tracking
│
├── Strapi CMS API (Content Management)
│   ├── /api/homepage-hero       # Homepage sections
│   ├── /api/courses            # Course catalog
│   ├── /api/blog-posts         # Blog system
│   ├── /api/features           # Feature sections
│   └── /api/testimonials       # Customer testimonials
│
└── Direct Database (Server Components)
    ├── Prisma ORM queries       # Direct database access
    ├── Optimized queries        # Performance-optimized
    └── Type-safe operations     # TypeScript integration
```

### Data Flow Patterns
```
┌─────────────────────────────────────────────────────────────────┐
│                       DATA FLOW PATTERNS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Content Display (Read Operations):                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Browser   │───▶│Server Component│───▶│ Strapi API  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         ▲                                       │              │
│         │                                       ▼              │
│         └───────────────────────────────┌─────────────┐         │
│                                         │PostgreSQL  │         │
│                                         │  Database   │         │
│                                         └─────────────┘         │
│                                                                 │
│  User Interactions (Write Operations):                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Browser   │───▶│Client Comp. │───▶│Next.js API  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         ▲                                       │              │
│         │                                       ▼              │
│         └───────────────────────────────┌─────────────┐         │
│                                         │  Prisma     │         │
│                                         │    ORM      │         │
│                                         └─────────────┘         │
│                                                 │              │
│                                                 ▼              │
│                                         ┌─────────────┐         │
│                                         │PostgreSQL  │         │
│                                         │  Database   │         │
│                                         └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🛡️ Security Architecture

### Security Implementation Strategy
```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Network Security (Nginx)                                   │
│     ├── SSL/TLS 1.3 termination                               │
│     ├── Rate limiting (10 req/s general, 1 req/s auth)        │
│     ├── DDoS protection                                        │
│     └── IP-based access control                               │
│                                                                 │
│  2. Application Security (Next.js)                             │
│     ├── Security headers (CSP, HSTS, X-Frame-Options)         │
│     ├── Input validation (Zod schemas)                        │
│     ├── CSRF protection                                        │
│     └── XSS prevention                                         │
│                                                                 │
│  3. Authentication Security                                     │
│     ├── JWT with HTTP-only cookies                            │
│     ├── Password hashing (bcrypt, 12 rounds)                  │
│     ├── Session management                                     │
│     └── Token refresh mechanism                               │
│                                                                 │
│  4. Database Security (PostgreSQL)                             │
│     ├── Role-based access control                             │
│     ├── Row-level security policies                           │
│     ├── SQL injection prevention (Prisma)                     │
│     └── Encrypted connections                                  │
│                                                                 │
│  5. Infrastructure Security                                     │
│     ├── Container isolation                                    │
│     ├── Secret management                                      │
│     ├── Regular security updates                              │
│     └── Audit logging                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Registration/Login:                                            │
│  ┌─────────┐    POST    ┌─────────────┐    Validate    ┌──────┐ │
│  │ Client  │─────────▶ │ Next.js API │─────────────▶ │  DB  │ │
│  └─────────┘  Creds     └─────────────┘   Password     └──────┘ │
│       ▲                         │                               │
│       │          JWT +          │                               │
│       │       HTTP Cookies      │                               │
│       └─────────────────────────┘                               │
│                                                                 │
│  Protected Route Access:                                        │
│  ┌─────────┐   Request   ┌─────────────┐   Verify   ┌────────┐  │
│  │ Client  │─────────▶  │ Middleware  │─────────▶ │  JWT   │  │
│  └─────────┘  + Cookie   └─────────────┘   Token    └────────┘  │
│       ▲                         │                               │
│       │        Success/         │                               │
│       │         Redirect        │                               │
│       └─────────────────────────┘                               │
│                                                                 │
│  Token Refresh:                                                 │
│  ┌─────────┐   Refresh   ┌─────────────┐   Generate  ┌───────┐  │
│  │ Client  │─────────▶  │ Next.js API │─────────▶  │ New   │  │
│  └─────────┘   Token     └─────────────┘   Tokens    │ JWT   │  │
│       ▲                         │                    └───────┘  │
│       │         New JWT +       │                               │
│       │       HTTP Cookies      │                               │
│       └─────────────────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## ⚡ Performance Specifications

### Performance Budget & Metrics
```yaml
Core_Web_Vitals:
  FCP: "<1.5s"     # First Contentful Paint
  LCP: "<2.5s"     # Largest Contentful Paint
  FID: "<100ms"    # First Input Delay  
  CLS: "<0.1"      # Cumulative Layout Shift

Bundle_Sizes:
  Initial_JS: "<500KB"      # First load bundle
  CSS: "<150KB"             # Total stylesheet size
  Images: "WebP/AVIF optimized"
  Fonts: "2 families max, preloaded"

API_Response_Times:
  Database_Queries: "<50ms"     # Average query time
  API_Endpoints: "<200ms"       # API response time
  Strapi_Requests: "<300ms"     # CMS response time
  Static_Assets: "<100ms"       # CDN delivery time

Caching_Strategy:
  Static_Assets: "1 year cache"
  API_Responses: "1 hour cache"
  Database_Queries: "15 min cache"
  HTML_Pages: "5 min cache"
```

### Scalability Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALABILITY DESIGN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Horizontal Scaling:                                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Next.js   │    │   Next.js   │    │   Next.js   │         │
│  │ Instance 1  │    │ Instance 2  │    │ Instance 3  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │              │
│         └───────────────────┼───────────────────┘              │
│                             │                                  │
│                             ▼                                  │
│                    ┌─────────────┐                             │
│                    │   Nginx     │                             │
│                    │Load Balancer│                             │
│                    └─────────────┘                             │
│                             │                                  │
│                             ▼                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ PostgreSQL  │    │    Redis    │    │   Strapi    │         │
│  │  Primary    │    │   Cluster   │    │  Instances  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────┐                                               │
│  │ PostgreSQL  │                                               │
│  │  Read       │                                               │
│  │ Replicas    │                                               │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🧪 Testing Architecture

### Testing Strategy Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                      TESTING PYRAMID                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        ┌─────────┐                             │
│                        │   E2E   │ (10%)                       │
│                        │ Tests   │                             │
│                        └─────────┘                             │
│                    ┌─────────────────┐                         │
│                    │  Integration    │ (20%)                   │
│                    │     Tests       │                         │
│                    └─────────────────┘                         │
│            ┌─────────────────────────────────┐                 │
│            │        Unit Tests               │ (70%)           │
│            │                                 │                 │
│            └─────────────────────────────────┘                 │
│                                                                 │
│  Testing Tools:                                                │
│  ├── Unit: Vitest + React Testing Library                     │
│  ├── Integration: Playwright Component Testing                │
│  ├── E2E: Playwright + Cypress                                │
│  ├── Visual: Playwright Screenshots                           │
│  └── Accessibility: axe-core integration                      │
│                                                                 │
│  Coverage Targets:                                             │
│  ├── Unit Test Coverage: >80%                                 │
│  ├── Integration Coverage: >70%                               │
│  ├── E2E Critical Path: >90%                                  │
│  └── Accessibility: WCAG 2.1 AA                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 CI/CD Pipeline Architecture

### Deployment Pipeline Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                       CI/CD PIPELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Development Workflow:                                          │
│  ┌─────────┐   git    ┌─────────┐  webhook  ┌─────────────┐     │
│  │ Local   │ push    │ GitHub  │ ──────▶  │ GitHub      │     │
│  │  Dev    │────────▶│ Repo    │          │ Actions     │     │
│  └─────────┘         └─────────┘           └─────────────┘     │
│                                                   │            │
│                                           ┌───────▼────────┐   │
│                                           │  Quality Gates │   │
│                                           │               │   │
│                                           │ • Type Check  │   │
│                                           │ • Lint        │   │
│                                           │ • Unit Tests  │   │
│                                           │ • Build       │   │
│                                           └───────┬────────┘   │
│                                                   │            │
│                                           ┌───────▼────────┐   │
│                                           │ E2E Testing    │   │
│                                           │               │   │
│                                           │ • Playwright  │   │
│                                           │ • Accessibility│   │
│                                           │ • Performance │   │
│                                           └───────┬────────┘   │
│                                                   │            │
│                                           ┌───────▼────────┐   │
│                                           │  Deployment    │   │
│                                           │               │   │
│                                           │ • Docker Build│   │
│                                           │ • Production  │   │
│                                           │   Deploy      │   │
│                                           └────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## ✅ Technical Requirements Summary

### System Requirements
```yaml
Minimum_Server_Requirements:
  CPU: "4 cores (8 vCPU recommended)"
  RAM: "8GB (16GB recommended)"
  Storage: "100GB SSD (500GB recommended)"
  Network: "100 Mbps (1 Gbps recommended)"

Software_Dependencies:
  Node.js: "20.x LTS"
  pnpm: "9.x"
  Docker: "24.x"
  Docker_Compose: "2.x"
  PostgreSQL: "15.x"
  Redis: "7.x"
  Nginx: "1.24.x"

Development_Environment:
  OS: "macOS, Linux, Windows (with WSL2)"
  IDE: "VS Code recommended"
  Extensions: "ESLint, Prettier, TypeScript"
  Browser: "Chrome/Firefox for development"

Production_Environment:
  OS: "Ubuntu 22.04 LTS recommended"
  Container_Runtime: "Docker 24.x"
  Reverse_Proxy: "Nginx with SSL"
  SSL_Certificates: "Let's Encrypt or custom CA"
```

### Quality Metrics
```yaml
Code_Quality:
  TypeScript_Coverage: "100%"
  ESLint_Compliance: "Zero errors"
  Prettier_Formatting: "Enforced"
  Test_Coverage: ">80%"

Performance_Metrics:
  Page_Load_Time: "<3s on 3G"
  Time_to_Interactive: "<5s"
  Bundle_Size: "<500KB initial"
  API_Response_Time: "<200ms"

Security_Standards:
  OWASP_Top_10: "Addressed"
  Data_Encryption: "TLS 1.3+"
  Password_Policy: "8+ chars, complexity"
  Session_Security: "HTTP-only, secure cookies"

Accessibility_Standards:
  WCAG_Compliance: "2.1 AA"
  Keyboard_Navigation: "Full support"
  Screen_Reader: "Compatible"
  Color_Contrast: "4.5:1 minimum"
```

**Technical Specifications complete - Ready for environment setup and workflow documentation.**