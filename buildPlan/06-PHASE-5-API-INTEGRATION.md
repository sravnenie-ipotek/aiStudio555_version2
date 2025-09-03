# 🔌 Phase 5: API Integration & Functionality Implementation

**Duration**: 6-7 hours  
**Priority**: Critical - Advanced functionality and integrations  
**Dependencies**: Phases 1-4 (Foundation through Next.js Development)

## 🏗️ API Architecture Integration

### 5.1 Three-Tier API Strategy
```
Frontend (Next.js) Integration Layer:
├── Server Components → Direct Strapi API calls
├── Next.js API Routes → User interactions & auth
├── Client Components → Real-time features
└── External APIs → Future integrations (Stripe, Email)

Data Flow:
Next.js Server Components ──→ Strapi CMS API ──→ PostgreSQL
Next.js API Routes ──────────→ Prisma ORM ──→ PostgreSQL  
Express API (Future) ────────→ Prisma ORM ──→ PostgreSQL
```

### 5.2 Strapi CMS Integration Implementation

#### 5.2.1 Strapi API Client Setup
```typescript
// lib/strapi.ts - Strapi API Client
interface StrapiResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number  
      pageCount: number
      total: number
    }
  }
}

interface StrapiConfig {
  baseURL: string
  apiToken: string
  timeout: number
  cache: RequestInit['next']
}

class StrapiAPI {
  private config: StrapiConfig

  constructor() {
    this.config = {
      baseURL: process.env.STRAPI_URL || 'http://localhost:1337',
      apiToken: process.env.STRAPI_API_TOKEN!,
      timeout: 10000,
      cache: { revalidate: 3600 } // 1 hour cache
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseURL}/api${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      next: this.config.cache,
      ...options
    })

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Homepage Content
  async getHomepageHero() {
    return this.request('/homepage-hero?populate=*')
  }

  async getFeatures() {
    return this.request('/features?sort=order:asc')
  }

  async getTestimonials() {
    return this.request('/testimonials?filters[isVerified][$eq]=true&populate=*')
  }

  // Course System
  async getCourses(params?: CourseQueryParams): Promise<StrapiResponse<Course>> {
    const query = this.buildQuery(params)
    return this.request(`/courses?${query}`)
  }

  async getCourseBySlug(slug: string): Promise<StrapiResponse<Course>> {
    return this.request(`/courses?filters[slug][$eq]=${slug}&populate=*`)
  }

  async getCourseCategories(): Promise<StrapiResponse<CourseCategory>> {
    return this.request('/course-categories?sort=name:asc')
  }

  // Blog System
  async getBlogPosts(params?: BlogQueryParams): Promise<StrapiResponse<BlogPost>> {
    const query = this.buildQuery(params)
    return this.request(`/blog-posts?${query}`)
  }

  async getBlogPostBySlug(slug: string): Promise<StrapiResponse<BlogPost>> {
    return this.request(`/blog-posts?filters[slug][$eq]=${slug}&populate=*`)
  }

  // Utility method for building queries
  private buildQuery(params?: Record<string, any>): string {
    if (!params) return ''
    
    const searchParams = new URLSearchParams()
    
    // Handle pagination
    if (params.page) searchParams.set('pagination[page]', params.page)
    if (params.pageSize) searchParams.set('pagination[pageSize]', params.pageSize)
    
    // Handle population
    if (params.populate) searchParams.set('populate', params.populate)
    
    // Handle filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        searchParams.set(`filters[${key}]`, String(value))
      })
    }
    
    // Handle sorting
    if (params.sort) searchParams.set('sort', params.sort)
    
    return searchParams.toString()
  }
}

export const strapiAPI = new StrapiAPI()
```

#### 5.2.2 Server Component Integration
```typescript
// Server Components with Strapi integration
export async function HomepageServer() {
  try {
    // Parallel data fetching for better performance
    const [heroData, featuresData, testimonialsData, coursesData] = await Promise.all([
      strapiAPI.getHomepageHero(),
      strapiAPI.getFeatures(),
      strapiAPI.getTestimonials(),
      strapiAPI.getCourses({ 
        populate: 'thumbnail,category,instructor',
        pageSize: 6,
        sort: 'createdAt:desc'
      })
    ])

    return (
      <main>
        <HeroSection data={heroData.data} />
        <FeaturesSection data={featuresData.data} />
        <CoursesPreview data={coursesData.data} />
        <TestimonialsSection data={testimonialsData.data} />
      </main>
    )
  } catch (error) {
    console.error('Homepage data fetch error:', error)
    return <ErrorFallback message="Unable to load page content" />
  }
}
```

## 📝 Advanced Form Implementation

### 5.3 Form Processing System

#### 5.3.1 Contact Form API Route
```typescript
// app/api/contact/route.ts - Enhanced contact form
import { z } from 'zod'
import { NextResponse } from 'next/server'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
  phone: z.string().optional(),
  company: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = contactSchema.parse(body)
    
    // Store in database (future implementation)
    // await prisma.contactSubmission.create({
    //   data: validatedData
    // })

    // Mock email service
    await mockEmailService.sendContactForm(validatedData)
    
    // Log for development
    console.log('📧 Contact Form Submission:', {
      timestamp: new Date().toISOString(),
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message.substring(0, 100) + '...'
    })

    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
```

#### 5.3.2 Newsletter Signup Implementation
```typescript
// app/api/newsletter/route.ts
import { z } from 'zod'

const newsletterSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  interests: z.array(z.string()).optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, firstName, interests } = newsletterSchema.parse(body)

    // Check for existing subscription
    // const existingSubscription = await prisma.newsletterSubscription.findUnique({
    //   where: { email }
    // })

    // if (existingSubscription) {
    //   return NextResponse.json(
    //     { error: 'Email already subscribed' },
    //     { status: 409 }
    //   )
    // }

    // Store subscription
    // await prisma.newsletterSubscription.create({
    //   data: { email, firstName, interests, subscribedAt: new Date() }
    // })

    // Mock email welcome
    console.log('📰 Newsletter Subscription:', {
      email,
      firstName,
      interests,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
```

### 5.4 Authentication API Enhancement

#### 5.4.1 Complete Authentication System
```typescript
// lib/auth.ts - Authentication utilities
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
  private static readonly REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

  static generateTokens(user: { id: string, email: string, role: string }) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_EXPIRES_IN }
    )

    return { accessToken, refreshToken }
  }

  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload
      return decoded
    } catch {
      return null
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static setAuthCookies(accessToken: string, refreshToken: string) {
    const cookieStore = cookies()
    
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })
  }

  static clearAuthCookies() {
    const cookieStore = cookies()
    cookieStore.delete('accessToken')
    cookieStore.delete('refreshToken')
  }
}
```

#### 5.4.2 User Registration API
```typescript
// app/api/auth/register/route.ts
import { z } from 'zod'
import { AuthService } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create user
    const hashedPassword = await AuthService.hashPassword(password)
    
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    })

    // Generate tokens
    const { accessToken, refreshToken } = AuthService.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Set cookies
    AuthService.setAuthCookies(accessToken, refreshToken)

    // Mock welcome email
    console.log('🎉 New User Registration:', {
      name: `${firstName} ${lastName}`,
      email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
```

## 🛒 E-commerce Preparation

### 5.5 Course Enrollment System Foundation

#### 5.5.1 Enrollment API Structure
```typescript
// app/api/courses/[courseId]/enroll/route.ts - Course enrollment
import { getCurrentUser } from '@/lib/auth/server'

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const courseId = params.courseId

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true, isActive: true }
    })

    if (!course || !course.isActive) {
      return NextResponse.json(
        { error: 'Course not found or inactive' },
        { status: 404 }
      )
    }

    // Check existing enrollment
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      )
    }

    // Create enrollment (free courses) or payment intent (paid courses)
    if (course.price === 0) {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: courseId,
          enrolledAt: new Date(),
          status: 'ACTIVE'
        }
      })

      return NextResponse.json({
        success: true,
        enrollment,
        message: 'Successfully enrolled in course'
      })
    } else {
      // For paid courses, create payment intent (future Stripe integration)
      return NextResponse.json({
        requiresPayment: true,
        course: {
          id: course.id,
          title: course.title,
          price: course.price
        },
        message: 'Payment required for enrollment'
      })
    }

  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Enrollment failed' },
      { status: 500 }
    )
  }
}
```

#### 5.5.2 Payment Integration Preparation
```typescript
// lib/payments/stripe.ts - Stripe integration structure
interface PaymentIntent {
  courseId: string
  userId: string
  amount: number
  currency: string
}

export class PaymentService {
  private static stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
  })

  static async createPaymentIntent(data: PaymentIntent) {
    // Future implementation
    console.log('💳 Payment Intent Created (Mock):', {
      course: data.courseId,
      user: data.userId,
      amount: data.amount,
      currency: data.currency
    })

    return {
      id: 'mock_payment_intent',
      clientSecret: 'mock_client_secret',
      status: 'requires_payment_method'
    }
  }

  static async confirmPayment(paymentIntentId: string) {
    // Future implementation
    console.log('✅ Payment Confirmed (Mock):', paymentIntentId)
    
    return {
      status: 'succeeded',
      amount: 99900, // $999.00 in cents
      currency: 'usd'
    }
  }
}
```

## 📊 Analytics & Tracking

### 5.6 Analytics Integration

#### 5.6.1 Page View Tracking
```typescript
// app/api/analytics/pageview/route.ts
export async function POST(request: Request) {
  try {
    const { pathname, referrer, userAgent } = await request.json()
    
    // Mock analytics tracking
    console.log('📊 Page View Tracked:', {
      page: pathname,
      referrer,
      timestamp: new Date().toISOString(),
      userAgent: userAgent?.substring(0, 100)
    })

    // Future implementation: Store in database
    // await prisma.pageView.create({
    //   data: {
    //     pathname,
    //     referrer,
    //     userAgent,
    //     timestamp: new Date()
    //   }
    // })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
```

#### 5.6.2 Course Progress Tracking
```typescript
// app/api/courses/[courseId]/progress/route.ts
export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { moduleId, lessonId, progressPercentage, timeSpent } = await request.json()

    // Mock progress tracking
    console.log('📈 Course Progress Updated:', {
      user: user.id,
      course: params.courseId,
      module: moduleId,
      lesson: lessonId,
      progress: progressPercentage,
      timeSpent,
      timestamp: new Date().toISOString()
    })

    // Future implementation: Update progress in database
    // await prisma.progress.upsert({
    //   where: {
    //     userId_courseId_moduleId_lessonId: {
    //       userId: user.id,
    //       courseId: params.courseId,
    //       moduleId,
    //       lessonId
    //     }
    //   },
    //   update: {
    //     progressPercentage,
    //     timeSpentMinutes: timeSpent,
    //     lastAccessedAt: new Date()
    //   },
    //   create: {
    //     userId: user.id,
    //     courseId: params.courseId,
    //     moduleId,
    //     lessonId,
    //     progressPercentage,
    //     timeSpentMinutes: timeSpent
    //   }
    // })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Progress tracking error:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
```

## 🔄 Error Handling & Resilience

### 5.7 API Error Handling Strategy

#### 5.7.1 Global Error Handler
```typescript
// lib/errors.ts - Centralized error handling
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const errorHandler = (error: Error) => {
  console.error('API Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  // Default server error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

#### 5.7.2 Rate Limiting Implementation
```typescript
// lib/rate-limit.ts - API rate limiting
import { LRUCache } from 'lru-cache'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const cache = new LRUCache<string, RateLimitEntry>({
  max: 1000,
  ttl: 60 * 1000 // 1 minute
})

export function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60 * 1000
) {
  const now = Date.now()
  const entry = cache.get(identifier)

  if (!entry || now > entry.resetTime) {
    cache.set(identifier, {
      count: 1,
      resetTime: now + window
    })
    return { success: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { 
      success: false, 
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  entry.count++
  cache.set(identifier, entry)

  return { 
    success: true, 
    remaining: limit - entry.count
  }
}
```

## ✅ Phase 5 Deliverables

### 5.8 Completion Checklist
- [ ] Complete Strapi API integration with type safety
- [ ] Advanced form processing with validation
- [ ] Enhanced authentication system with JWT
- [ ] Course enrollment system foundation  
- [ ] Payment integration preparation (Stripe)
- [ ] Analytics and progress tracking (mocked)
- [ ] Comprehensive error handling
- [ ] API rate limiting implementation
- [ ] Newsletter subscription system
- [ ] User dashboard preparation

### 5.9 API Endpoints Summary
```javascript
const apiEndpoints = {
  // Authentication
  'POST /api/auth/login': 'User login with JWT',
  'POST /api/auth/register': 'User registration',
  'POST /api/auth/logout': 'User logout',
  'POST /api/auth/refresh': 'Token refresh',
  
  // Forms
  'POST /api/contact': 'Contact form submission',
  'POST /api/newsletter': 'Newsletter subscription',
  
  // Courses
  'GET /api/courses': 'Course catalog with filtering',
  'GET /api/courses/[slug]': 'Individual course data',
  'POST /api/courses/[id]/enroll': 'Course enrollment',
  'POST /api/courses/[id]/progress': 'Progress tracking',
  
  // Analytics
  'POST /api/analytics/pageview': 'Page view tracking',
  'POST /api/analytics/event': 'Custom event tracking',
  
  // User
  'GET /api/user/profile': 'User profile data',
  'PUT /api/user/profile': 'Profile updates'
}
```

## 🔜 Phase 6 Preparation
- Complete API integration with mock functionality
- Error handling and resilience implemented
- Authentication system fully functional  
- Forms processing all user inputs
- Analytics tracking established
- Ready for comprehensive testing

**Phase 5 establishes complete API integration and advanced functionality.**