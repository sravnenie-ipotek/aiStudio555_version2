# 🏗️ Phase 1: Monorepo Foundation & Infrastructure Setup

**Duration**: 2-3 hours  
**Priority**: Critical - Everything depends on this foundation

## 📁 Directory Structure Creation

### 1.1 Complete Monorepo Structure
```
projectdes-academy/
├── Root Configuration
│   ├── package.json              # Monorepo root with Turborepo
│   ├── pnpm-workspace.yaml       # pnpm workspace definition
│   ├── turbo.json                # Build pipeline configuration
│   ├── tsconfig.json             # TypeScript base config
│   ├── .eslintrc.js              # ESLint rules
│   ├── .prettierrc               # Code formatting
│   └── .gitignore                # Git exclusions
│
├── apps/                         # Applications
│   ├── web/                      # Next.js 14 Frontend
│   └── api/                      # Express API (structure only)
│
├── packages/                     # Shared packages
│   ├── db/                       # Prisma + Database
│   ├── types/                    # TypeScript types
│   └── utils/                    # Shared utilities
│
├── cms/                          # Strapi CMS
├── qa/                           # Testing framework
│   ├── cypress/                  # E2E tests
│   └── playwright/               # E2E + Visual tests
│
├── config/                       # Configuration files
│   ├── docker/                   # Docker configurations
│   └── pm2/                      # Process management
│
├── .github/                      # CI/CD workflows
│   └── workflows/
│
└── docs/                         # Documentation
```

## 🔧 Package Management Configuration

### 1.2 pnpm Workspace Setup
```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"      # Next.js app, Express API
  - "packages/*"  # Shared libraries
  - "cms"         # Strapi CMS
  - "qa"          # Testing suites
```

### 1.3 Turborepo Pipeline
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build", "db:generate"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["db:generate"]
    },
    "db:generate": {
      "cache": false,
      "inputs": ["prisma/schema.prisma"]
    }
  }
}
```

## 🐳 Docker Infrastructure Setup

### 1.4 Docker Compose Services
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: projectdes_dev
      POSTGRES_USER: projectdes
      POSTGRES_PASSWORD: localpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U projectdes"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@projectdes.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres
```

## 📦 Shared Packages Structure

### 1.5 Database Package (packages/db/)
```
packages/db/
├── package.json
├── prisma/
│   ├── schema.prisma        # 28+ models from baseInfrastructure
│   ├── migrations/          # Database migrations
│   └── seed.ts             # Initial data seeding
├── src/
│   ├── index.ts            # Prisma client export
│   └── types.ts            # Database types
└── scripts/
    ├── seed.ts             # Database seeding
    └── backup.ts           # Backup utilities
```

### 1.6 Types Package (packages/types/)
```
packages/types/
├── package.json
└── src/
    ├── api.ts              # API response types
    ├── auth.ts             # Authentication types
    ├── course.ts           # Course-related types
    ├── user.ts             # User types
    └── index.ts            # Exports
```

### 1.7 Utils Package (packages/utils/)
```
packages/utils/
├── package.json
└── src/
    ├── validation.ts       # Zod schemas
    ├── formatting.ts       # Data formatters
    ├── auth.ts            # JWT utilities
    ├── api.ts             # API helpers
    └── index.ts           # Exports
```

## 🔨 Build System Configuration

### 1.8 TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "strict": false,           // Moderate strictness
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/db": ["./packages/db/src"],
      "@/types": ["./packages/types/src"],
      "@/utils": ["./packages/utils/src"]
    }
  }
}
```

### 1.9 ESLint Configuration
```javascript
module.exports = {
  extends: ["@next/eslint-config-next", "@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off"
  }
};
```

## 🌐 Environment Configuration

### 1.10 Environment Variables Setup
```bash
# .env.local
NODE_ENV=development

# Database
DATABASE_URL="postgresql://projectdes:localpassword@localhost:5432/projectdes_dev"

# Strapi
STRAPI_URL="http://localhost:1337"
STRAPI_API_TOKEN="6ba76f584778637fd308f48aac27461c08af957ef205a3281c444c32859f229d923a1984ec93b9564b26db3c10e68f2ccca8983e27ec9b42483e3b8f6faca7a2a52f9b586357c4f94ad37792a7b0f271c164f661e03e4af725cf24708fd5967db6d2431c7afb9be47082538f62ab7b49cad7c68cd290f0c429b3706fbb8df2dc"

# JWT Authentication
JWT_SECRET="temp-dev-secret-change-later"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Development
NEXT_TELEMETRY_DISABLED=1
```

## ✅ Phase 1 Deliverables

### 1.11 Completion Checklist
- [ ] Complete monorepo directory structure
- [ ] pnpm workspace configuration
- [ ] Turborepo pipeline setup
- [ ] Docker Compose infrastructure
- [ ] TypeScript configuration with path aliases
- [ ] ESLint and Prettier setup
- [ ] Environment variables configuration
- [ ] All package.json files created
- [ ] Git repository initialized
- [ ] Development scripts functional

### 1.12 Validation Commands
```bash
# Test monorepo setup
cd projectdes-academy
pnpm install
pnpm build       # Should build all packages
pnpm dev         # Should start development servers

# Test Docker infrastructure
docker-compose up -d postgres redis
docker-compose ps    # Should show running services

# Test database connection
pnpm db:generate
pnpm db:push
```

## 🚧 Common Issues & Solutions

### 1.13 Troubleshooting
1. **Port conflicts**: Ensure ports 5432, 6379, 5050, 8080 are available
2. **Permission issues**: Check Docker permissions on macOS
3. **pnpm version**: Ensure pnpm 9+ is installed
4. **Node version**: Requires Node.js 20+
5. **TypeScript paths**: Verify path aliases work across packages

## 🔜 Next Phase Preparation
- Foundation ready for Webflow content analysis
- Database schema ready for migration
- Development environment validated
- Team ready for content extraction phase

**Phase 1 establishes the robust foundation for the entire project.**