# Database Infrastructure Documentation

## Overview

This document provides comprehensive documentation for the ProjectDes Academy database schema. The database uses PostgreSQL with Prisma ORM for type-safe database access and migrations.

## Database Configuration

```
Provider: PostgreSQL 15+
ORM: Prisma
Connection: DATABASE_URL environment variable
```

## Core Enumerations

### Locale
Supported languages for multi-language content:
- `ru` - Russian (default)
- `en` - English  
- `he` - Hebrew

### UserRole
User permission levels:
- `STUDENT` - Regular student user
- `INSTRUCTOR` - Course instructor
- `ADMIN` - Administrative user
- `SUPER_ADMIN` - Super administrator

### CourseStatus
Course publication states:
- `DRAFT` - Under development
- `PUBLISHED` - Available to students
- `ARCHIVED` - No longer available

### EnrollmentStatus
Student enrollment states:
- `PENDING` - Awaiting payment/approval
- `ACTIVE` - Currently enrolled
- `COMPLETED` - Course completed
- `CANCELLED` - Enrollment cancelled

### PaymentStatus
Payment transaction states:
- `PENDING` - Awaiting processing
- `PROCESSING` - Being processed
- `COMPLETED` - Successfully completed
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

### MediaType
Media asset types:
- `IMAGE` - Image files
- `VIDEO` - Video content
- `DOCUMENT` - Documents/PDFs
- `AUDIO` - Audio files

### AnnouncementType
Announcement categories:
- `GENERAL` - General announcements
- `COURSE` - Course-specific
- `SYSTEM` - System notifications
- `PROMOTION` - Promotional content

## Core Tables

### User
Primary user account table for all system users.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email address |
| passwordHash | String? | Hashed password (nullable for OAuth) |
| firstName | String? | User's first name |
| lastName | String? | User's last name |
| role | UserRole | User permission level |
| locale | Locale | Preferred language |
| avatarId | String? | Reference to MediaAsset |
| phone | String? | Contact phone number |
| bio | Json? | Rich text bio (TipTap JSON) |
| linkedin | String? | LinkedIn profile URL |
| website | String? | Personal website |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| lastLoginAt | DateTime? | Last login timestamp |
| emailVerifiedAt | DateTime? | Email verification timestamp |

**Relations:**
- Has many enrollments
- Has many instructor courses (as instructor)
- Has many blog posts (as author)
- Has many payments
- Has many certificates
- Has many reviews

### Course
Course content and metadata.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| slug | String | URL-friendly identifier |
| locale | Locale | Course language |
| title | String | Course title |
| subtitle | String? | Course subtitle |
| description | Json | Rich text description (TipTap JSON) |
| syllabus | Json? | Course structure and modules |
| status | CourseStatus | Publication status |
| price | Decimal | Course price |
| discountPrice | Decimal? | Discounted price if applicable |
| currency | String | Currency code (default: USD) |
| duration | String? | Course duration (e.g., "8 weeks") |
| totalHours | Int? | Total course hours |
| level | String? | Difficulty level |
| thumbnailId | String? | Reference to thumbnail MediaAsset |
| coverImageId | String? | Reference to cover MediaAsset |
| introVideoId | String? | Reference to intro video MediaAsset |
| instructorId | String | Reference to instructor User |
| categoryId | String? | Reference to Category |
| metaTitle | String? | SEO meta title |
| metaDescription | String? | SEO meta description |
| keywords | String[] | SEO keywords array |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| publishedAt | DateTime? | Publication timestamp |

**Relations:**
- Belongs to instructor (User)
- Belongs to category
- Has many enrollments
- Has many lessons
- Has many reviews
- Has many certificates

### Category
Course categorization and hierarchy.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| slug | String | URL-friendly identifier |
| locale | Locale | Category language |
| name | String | Category name |
| description | String? | Category description |
| icon | String? | Icon identifier |
| order | Int | Display order |
| parentId | String? | Parent category reference |

**Relations:**
- Has many courses
- Belongs to parent category
- Has many child categories

### Lesson
Individual course lessons.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Lesson title |
| description | String? | Lesson description |
| content | Json | Rich text content (TipTap JSON) |
| videoUrl | String? | Video URL |
| duration | Int? | Duration in minutes |
| order | Int | Display order |
| courseId | String | Reference to Course |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- Belongs to course
- Has many attachments (MediaAsset)
- Has many progress records

### Enrollment
Student course enrollments.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| status | EnrollmentStatus | Enrollment status |
| progress | Int | Progress percentage (0-100) |
| userId | String | Reference to User |
| courseId | String | Reference to Course |
| paymentId | String? | Reference to Payment |
| enrolledAt | DateTime | Enrollment timestamp |
| startedAt | DateTime? | Course start timestamp |
| completedAt | DateTime? | Completion timestamp |
| expiresAt | DateTime? | Expiration timestamp |

**Relations:**
- Belongs to user
- Belongs to course
- Belongs to payment
- Has many lesson progress records

### LessonProgress
Individual lesson completion tracking.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| completed | Boolean | Completion status |
| progress | Int | Progress percentage (0-100) |
| lastViewedAt | DateTime? | Last viewed timestamp |
| enrollmentId | String | Reference to Enrollment |
| lessonId | String | Reference to Lesson |

**Relations:**
- Belongs to enrollment
- Belongs to lesson

## Content Tables

### BlogPost
Blog content management.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| slug | String | URL-friendly identifier |
| locale | Locale | Post language |
| title | String | Post title |
| excerpt | String? | Post excerpt |
| content | Json | Rich text content (TipTap JSON) |
| thumbnailId | String? | Reference to MediaAsset |
| authorId | String | Reference to author User |
| categoryId | String? | Reference to BlogCategory |
| metaTitle | String? | SEO meta title |
| metaDescription | String? | SEO meta description |
| keywords | String[] | SEO keywords |
| isPublished | Boolean | Publication status |
| isFeatured | Boolean | Featured flag |
| viewCount | Int | View counter |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| publishedAt | DateTime? | Publication timestamp |

**Relations:**
- Belongs to author (User)
- Belongs to category
- Has many tags

### BlogCategory
Blog categorization.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| slug | String | URL-friendly identifier |
| locale | Locale | Category language |
| name | String | Category name |
| description | String? | Category description |

**Relations:**
- Has many blog posts

### Tag
Content tagging system.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Tag name (unique) |
| slug | String | URL-friendly identifier (unique) |

**Relations:**
- Belongs to many blog posts

## Translation & CMS Tables

**Note**: Translation and Navigation tables are managed by Strapi CMS, not Prisma. They reside in the same database (projectdes_academy) but use the `strapi_` table prefix to avoid conflicts.

### Strapi-Managed Content Types:
- **Translations**: UI strings with approval workflow (strapi_translations)
- **Navigation Items**: Menu structure (strapi_navigation_items)
- **Media Assets**: Uploaded files (strapi_files)
- **Admin Users**: CMS users with roles (strapi_admin_users)

These tables are automatically created and managed by Strapi. Do not modify them directly through Prisma migrations.

## Media & Assets

### MediaAsset
Centralized media management.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| key | String? | Asset key |
| type | MediaType | Asset type |
| url | String | Asset URL |
| alternativeText | String? | Alt text for accessibility |
| caption | String? | Asset caption |
| width | Int? | Width in pixels |
| height | Int? | Height in pixels |
| size | Int? | File size in bytes |
| mimeType | String? | MIME type |
| metadata | Json? | Additional metadata |
| page | String? | Page identifier |
| section | String? | Section identifier |
| language | Locale? | Language variant |
| order | Int | Display order |
| isActive | Boolean | Active status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- Used by users (avatars)
- Used by courses (thumbnails, covers, intro videos)
- Used by lessons (attachments)
- Used by blog posts (thumbnails)
- Used by instructors (avatars)
- Used by partners (logos)
- Used by testimonials (avatars)
- Used by events (covers)
- Used by campaigns (banners)

## Business Tables

### Payment
Payment transaction records.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| amount | Decimal | Payment amount |
| currency | String | Currency code (default: USD) |
| status | PaymentStatus | Payment status |
| method | String? | Payment method (stripe, paypal) |
| transactionId | String? | External transaction ID (unique) |
| userId | String | Reference to User |
| metadata | Json? | Additional payment data |
| failureReason | String? | Failure reason if applicable |
| createdAt | DateTime | Creation timestamp |
| processedAt | DateTime? | Processing timestamp |
| completedAt | DateTime? | Completion timestamp |

**Relations:**
- Belongs to user
- Has many enrollments

### Certificate
Course completion certificates.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| certificateNumber | String | Certificate number (unique) |
| userId | String | Reference to User |
| courseId | String | Reference to Course |
| issuedAt | DateTime | Issue timestamp |
| expiresAt | DateTime? | Expiration timestamp |

**Relations:**
- Belongs to user
- Belongs to course

### Review
Course reviews and ratings.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| rating | Int | Rating (1-5) |
| comment | String? | Review comment |
| userId | String | Reference to User |
| courseId | String | Reference to Course |
| isPublished | Boolean | Publication status |
| isVerified | Boolean | Verification status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relations:**
- Belongs to user
- Belongs to course

## Additional Tables

### Instructor
Instructor profiles (separate from User).

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| locale | Locale | Profile language |
| name | String | Instructor name |
| company | String? | Company affiliation |
| bio | Json? | Rich text bio (TipTap JSON) |
| avatarId | String? | Reference to MediaAsset |
| linkedin | String? | LinkedIn profile |
| website | String? | Personal website |

**Relations:**
- Has avatar (MediaAsset)

### Partner
Partnership and sponsor information.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| locale | Locale | Partner language |
| name | String | Partner name |
| logoId | String? | Reference to MediaAsset |
| url | String? | Partner website |
| blurb | String? | Short description |
| order | Int | Display order |

**Relations:**
- Has logo (MediaAsset)

### Testimonial
Student testimonials.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| locale | Locale | Testimonial language |
| studentName | String | Student name |
| avatarId | String? | Reference to MediaAsset |
| quote | String | Testimonial text |
| courseTitle | String? | Related course title |
| order | Int | Display order |
| isPublished | Boolean | Publication status |

**Relations:**
- Has avatar (MediaAsset)

### Event
Educational events and webinars.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| locale | Locale | Event language |
| slug | String | URL-friendly identifier |
| title | String | Event title |
| description | Json | Rich text description (TipTap JSON) |
| startAt | DateTime | Event start time |
| endAt | DateTime? | Event end time |
| location | String? | Physical location |
| streamingUrl | String? | Streaming URL |
| registerUrl | String? | Registration URL |
| coverId | String? | Reference to MediaAsset |
| isPublished | Boolean | Publication status |

**Relations:**
- Has cover (MediaAsset)

### LegalDocument
Legal documents and policies.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| locale | Locale | Document language |
| slug | String | URL-friendly identifier |
| title | String | Document title |
| body | Json | Rich text content (TipTap JSON) |
| isPublished | Boolean | Publication status |
| updatedAt | DateTime | Last update timestamp |

### Campaign
Marketing campaigns and promotions.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| locale | Locale | Campaign language |
| slug | String | URL-friendly identifier |
| title | String | Campaign title |
| body | Json | Rich text content (TipTap JSON) |
| bannerId | String? | Reference to MediaAsset |
| discountPct | Int? | Discount percentage |
| startsAt | DateTime? | Campaign start time |
| endsAt | DateTime? | Campaign end time |
| active | Boolean | Active status |

**Relations:**
- Has banner (MediaAsset)

### Announcement
System announcements and notifications.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| locale | Locale | Announcement language |
| kind | AnnouncementType | Announcement type |
| title | String | Announcement title |
| message | String? | Announcement message |
| startsAt | DateTime? | Display start time |
| endsAt | DateTime? | Display end time |
| priority | Int | Display priority |
| isPublished | Boolean | Publication status |

### CareerResource
Career development resources.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| locale | Locale | Resource language |
| kind | String | Resource type (article, link, template) |
| title | String | Resource title |
| description | String? | Resource description |
| url | String? | Resource URL |
| isPublished | Boolean | Publication status |
| order | Int | Display order |

## Database Indexes

### Performance Indexes
- User: email, role
- Course: status + locale, instructorId, categoryId
- Category: locale + order
- Lesson: courseId + order
- Enrollment: status, userId + courseId
- BlogPost: isPublished + locale, authorId
- MediaAsset: type, page, isActive

### Unique Constraints
- User: email
- Course: slug + locale
- Category: slug + locale
- Enrollment: userId + courseId
- Certificate: userId + courseId, certificateNumber
- Review: userId + courseId
- BlogPost: slug + locale
- BlogCategory: slug + locale
- Tag: name, slug
- Event: slug + locale
- LegalDocument: slug + locale
- Campaign: slug + locale
- Payment: transactionId
- LessonProgress: enrollmentId + lessonId

## Migration Strategy

1. **Phase 1**: Core tables (User, Course, Category)
2. **Phase 2**: Content tables (BlogPost, Tags, etc.)
3. **Phase 3**: Learning tables (Lesson, Enrollment, Progress)
4. **Phase 4**: Business tables (Payment, Certificate, Review)
5. **Phase 5**: Supporting tables (all remaining)
6. **Phase 6**: Strapi CMS setup (Translations, Media, Navigation)

## Data Relationships Summary

### User-Centric Relations
- User → Enrollments → Courses
- User → Payments → Enrollments
- User → Certificates → Courses
- User → Reviews → Courses
- User → BlogPosts (as author)
- User → Courses (as instructor)

### Course-Centric Relations
- Course → Lessons → LessonProgress
- Course → Enrollments → Users
- Course → Reviews → Users
- Course → Certificates → Users
- Course → Category
- Course → Instructor (User)

### Content Relations
- BlogPost → Author (User)
- BlogPost → Category
- BlogPost → Tags
- Strapi-managed: Translations, Navigation (separate tables)

### Media Relations
- MediaAsset → Multiple entities (polymorphic)
- Central repository for all media files
- Language-specific variants supported

## Notes

1. All rich text content uses TipTap JSON format for consistency
2. UUID is used for all primary keys for better distribution
3. Soft deletes can be implemented using isActive/isDeleted flags
4. Audit logs should be implemented separately for compliance
5. Consider implementing database-level RLS (Row Level Security) for multi-tenancy
6. Regular backup strategy required for production deployment