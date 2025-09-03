# Database Infrastructure Setup

## Overview

The ProjectDes Academy platform uses a multi-database architecture with PostgreSQL to separate concerns and improve scalability.

## Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Server (Docker)                    │
│                    localhost:5432                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  projectdes_academy   │  │  Redis Cache         │        │
│  │  (Main App + CMS)     │  │  localhost:6379      │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  ┌──────────────────────┐                                   │
│  │  projectdes_dev       │                                   │
│  │  (Legacy - To Remove) │                                   │
│  └──────────────────────┘                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Databases

### 1. projectdes_academy (Main Application & CMS Database)
- **Purpose**: Shared database for both the main application and Strapi CMS
- **Connection String**: `postgresql://projectdes:localpassword@localhost:5432/projectdes_academy`
- **Schema Management**: 
  - **Prisma**: Manages application tables (User, Course, Enrollment, Payment, etc.)
  - **Strapi**: Manages CMS tables (strapi_* prefixed tables for content, media, translations)
- **Table Separation**: Tables are separated by prefix to avoid conflicts

### 2. projectdes_dev (Legacy Database)
- **Purpose**: Original database from previous version
- **Connection String**: `postgresql://projectdes:localpassword@localhost:5432/projectdes_dev`
- **Status**: To be removed after data migration is complete
- **Note**: Not used by the new academy platform

## Docker Configuration

### PostgreSQL Container
```yaml
Container: projectdes-db
Image: postgres:15-alpine
Port: 5432
User: projectdes
Password: localpassword (development only)
```

### Redis Container
```yaml
Container: projectdes-redis
Image: redis:7-alpine
Port: 6379
Databases:
  - DB 0: Default
  - DB 1: Sessions (legacy)
  - DB 2: Academy application
```

## Environment Configuration

### Development Environment Files

#### `.env.academy` (Academy Application)
```env
# Shared database for both Prisma and Strapi
DATABASE_URL=postgresql://projectdes:localpassword@localhost:5432/projectdes_academy

# Strapi uses the same database
STRAPI_DATABASE_NAME=projectdes_academy
```

#### `.env` (Legacy - Not Used)
```env
DATABASE_URL=postgresql://projectdes:localpassword@localhost:5432/projectdes_dev
```

## Database Management Commands

### Connect to Databases
```bash
# Connect to Academy database (contains both app and CMS data)
docker exec -it projectdes-db psql -U projectdes -d projectdes_academy

# Connect to Legacy database (if needed for migration)
docker exec -it projectdes-db psql -U projectdes -d projectdes_dev
```

### Backup Commands
```bash
# Backup Academy database (includes all app and CMS data)
docker exec projectdes-db pg_dump -U projectdes projectdes_academy > backup_academy_$(date +%Y%m%d).sql

# Backup all databases
docker exec projectdes-db pg_dumpall -U projectdes > backup_all_$(date +%Y%m%d).sql
```

### Restore Commands
```bash
# Restore Academy database
docker exec -i projectdes-db psql -U projectdes projectdes_academy < backup_academy.sql
```

## Prisma Setup

### Initialize Prisma for Academy Database
```bash
cd packages/db

# Use academy environment
export DATABASE_URL=postgresql://projectdes:localpassword@localhost:5432/projectdes_academy

# Generate Prisma client
pnpm prisma generate

# Create initial migration
pnpm prisma migrate dev --name init

# Seed database (if seed file exists)
pnpm prisma db seed
```

### Prisma Commands
```bash
# View database in Prisma Studio
pnpm prisma studio

# Reset database (WARNING: Deletes all data)
pnpm prisma migrate reset

# Deploy migrations to production
pnpm prisma migrate deploy
```

## Strapi Setup

### Initialize Strapi CMS
```bash
cd cms

# Install Strapi dependencies
npm install @strapi/strapi@latest @strapi/plugin-users-permissions @strapi/plugin-i18n

# Start Strapi (uses shared database)
npm run develop
```

### Strapi Configuration
```javascript
// cms/config/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'projectdes_academy'), // Shared database
      user: env('DATABASE_USERNAME', 'projectdes'),
      password: env('DATABASE_PASSWORD', 'localpassword'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
```

**Note**: Strapi tables use `strapi_` prefix to avoid conflicts with Prisma-managed tables.

## Database Schema Overview

### Core Models (projectdes_academy)

#### User Management
- **User**: Core user accounts
- **UserRole**: STUDENT, INSTRUCTOR, ADMIN, SUPER_ADMIN
- **UserProfile**: Extended user information

#### Course System
- **Course**: Course definitions
- **Category**: Course categories
- **Lesson**: Individual lessons
- **Enrollment**: Student enrollments
- **LessonProgress**: Progress tracking

#### Content Management
- **BlogPost**: Blog articles
- **Translation**: Multi-language support (ru, en, he)
- **MediaAsset**: Central media repository
- **NavigationItem**: Menu structure

#### Business Logic
- **Payment**: Payment transactions
- **Certificate**: Course certificates
- **Review**: Course reviews
- **Campaign**: Marketing campaigns

#### Support Systems
- **Instructor**: Instructor profiles
- **Partner**: Business partners
- **Testimonial**: Student testimonials
- **Event**: Educational events
- **Announcement**: System announcements

### Content Types (Strapi-managed in projectdes_academy)

Managed by Strapi CMS (with strapi_ prefix):
- Translations (UI strings with approval workflow)
- Media library (uploaded files and assets)
- Static pages content
- Marketing content
- Email templates
- Site configuration

## Migration Strategy

### Phase 1: Database Setup ✅
- Created projectdes_academy database (shared for app + CMS)
- Configured environment files
- Set up Docker containers

### Phase 2: Schema Migration ✅
1. Applied Prisma migrations to projectdes_academy
2. Set up Strapi using same database with table prefixes
3. Configured content types in Strapi

### Phase 3: Data Migration
1. Export data from projectdes_dev
2. Transform data to new schema
3. Import to projectdes_academy
4. Verify data integrity

### Phase 4: Application Integration
1. Update application to use new database
2. Connect Strapi CMS
3. Test all functionality
4. Deploy to staging

## Security Notes

### Development Environment
- Default passwords are for development only
- Never commit .env files to version control
- Use strong passwords in production

### Production Recommendations
- Use environment variables for all credentials
- Enable SSL for database connections
- Implement database backup automation
- Use connection pooling
- Enable query logging for debugging
- Implement row-level security where needed

## Monitoring

### Health Checks
```bash
# Check PostgreSQL status
docker exec projectdes-db pg_isready -U projectdes

# Check database sizes
docker exec projectdes-db psql -U projectdes -d postgres -c "
  SELECT datname, pg_size_pretty(pg_database_size(datname)) as size 
  FROM pg_database 
  WHERE datname LIKE 'projectdes%';"

# Check active connections
docker exec projectdes-db psql -U projectdes -d postgres -c "
  SELECT datname, count(*) 
  FROM pg_stat_activity 
  WHERE datname LIKE 'projectdes%' 
  GROUP BY datname;"
```

## Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if PostgreSQL is running
docker ps | grep projectdes-db

# Restart PostgreSQL
docker-compose restart postgres
```

#### Permission Denied
```bash
# Grant permissions
docker exec projectdes-db psql -U projectdes -d postgres -c "
  GRANT ALL PRIVILEGES ON DATABASE projectdes_academy TO projectdes;"
```

#### Migration Errors
```bash
# Reset and retry
cd packages/db
pnpm prisma migrate reset
pnpm prisma migrate dev
```

## Next Steps

1. ✅ Created projectdes_academy database (shared for app + CMS)
2. ✅ Applied Prisma migrations
3. ✅ Set up Strapi CMS using shared database
4. ✅ Configured content types in Strapi with approval workflow
5. ⏳ Complete data migration from projectdes_dev
6. ⏳ Remove legacy projectdes_dev database
7. ✅ Application code using new database
8. ⏳ Full system testing in production environment