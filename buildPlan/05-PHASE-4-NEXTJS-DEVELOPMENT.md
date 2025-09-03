# ⚛️ Phase 4: Next.js 14 Application Development Plan

**Duration**: 8-10 hours  
**Priority**: Critical - Core application implementation  
**Dependencies**: Phases 1-3 (Foundation, Content, Styling)

## 🏗️ Next.js 14 App Router Architecture

### 4.1 Application Structure
```
apps/web/
├── src/
│   ├── app/                     # App Router (Next.js 14)
│   │   ├── (auth)/             # Route groups
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── courses/
│   │   │   ├── page.tsx        # Course catalog
│   │   │   └── [slug]/         # Individual course
│   │   ├── blog/
│   │   │   ├── page.tsx        # Blog listing
│   │   │   └── [slug]/         # Blog post
│   │   ├── about/
│   │   ├── contact/
│   │   ├── pricing/
│   │   ├── api/                # API routes
│   │   │   ├── auth/
│   │   │   ├── contact/
│   │   │   └── newsletter/
│   │   ├── globals.css
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── loading.tsx        # Loading UI
│   │   ├── error.tsx          # Error boundary
│   │   └── not-found.tsx      # 404 page
│   ├── components/
│   ├── lib/
│   └── types/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### 4.2 Server vs Client Components Strategy
```typescript
// Server Components (Default)
const serverComponentsUseCases = {
  dataFetching: "Direct Strapi API calls for content",
  seo: "Meta tags and structured data generation", 
  initialPageLoad: "Static/cached content rendering",
  
  examples: [
    "Homepage sections from Strapi",
    "Course catalog listings", 
    "Blog post content",
    "About/Contact page content"
  ]
}

// Client Components ('use client')
const clientComponentsUseCases = {
  interactivity: "User interactions and state management",
  animations: "Framer Motion animations",
  forms: "Form handling and validation",
  
  examples: [
    "Contact forms",
    "Search and filters",
    "Authentication forms",
    "Interactive animations",
    "Shopping cart (future)"
  ]
}
```

## 📄 Page Implementation Strategy

### 4.3 Homepage Development

#### 4.3.1 Homepage Structure
```typescript
// app/page.tsx - Homepage Server Component
export default async function HomePage() {
  // Direct Strapi API calls
  const heroData = await fetchFromStrapi('/api/homepage-hero')
  const features = await fetchFromStrapi('/api/features')
  const testimonials = await fetchFromStrapi('/api/testimonials')
  const courses = await fetchFromStrapi('/api/courses?populate=*&pagination[limit]=6')
  
  return (
    <main>
      <HeroSection data={heroData} />
      <FeaturesSection data={features} />
      <CoursesPreview data={courses} />
      <TestimonialsSection data={testimonials} />
      <CTASection />
    </main>
  )
}

// Server-side data fetching with caching
async function fetchFromStrapi(endpoint: string) {
  const response = await fetch(`${process.env.STRAPI_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  
  return response.json()
}
```

#### 4.3.2 Homepage Components
```typescript
interface HeroSectionProps {
  data: {
    title: string
    subtitle: string
    description: string
    primaryCTA: ButtonData
    secondaryCTA: ButtonData
    heroImage: MediaData
  }
}

const HeroSection: React.FC<HeroSectionProps> = ({ data }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 mb-6">
          {data.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {data.description}  
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" href={data.primaryCTA.href}>
            {data.primaryCTA.text}
          </Button>
          <Button variant="outline" size="lg" href={data.secondaryCTA.href}>
            {data.secondaryCTA.text}
          </Button>
        </div>
      </div>
    </section>
  )
}
```

### 4.4 Course System Implementation

#### 4.4.1 Course Catalog Page
```typescript
// app/courses/page.tsx
interface CoursesPageProps {
  searchParams: { 
    category?: string
    level?: string
    search?: string
  }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  // Build Strapi query from search params
  const strapiQuery = buildStrapiQuery({
    populate: ['thumbnail', 'category', 'instructor'],
    filters: {
      ...(searchParams.category && { 
        category: { slug: searchParams.category }
      }),
      ...(searchParams.level && { 
        level: searchParams.level
      }),
      ...(searchParams.search && {
        title: { $containsi: searchParams.search }
      })
    }
  })

  const coursesData = await fetchFromStrapi(`/api/courses?${strapiQuery}`)
  const categoriesData = await fetchFromStrapi('/api/course-categories')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <CourseFilters categories={categoriesData.data} />
      <CourseGrid courses={coursesData.data} />
      <CoursePagination meta={coursesData.meta} />
    </div>
  )
}
```

#### 4.4.2 Individual Course Page
```typescript
// app/courses/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await fetchFromStrapi(`/api/courses?filters[slug]=${params.slug}&populate=*`)
  
  return {
    title: course.data[0].attributes.title,
    description: course.data[0].attributes.shortDescription,
    openGraph: {
      title: course.data[0].attributes.title,
      description: course.data[0].attributes.shortDescription,
      images: [course.data[0].attributes.thumbnail.data.attributes.url]
    }
  }
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const courseData = await fetchFromStrapi(
    `/api/courses?filters[slug]=${params.slug}&populate[0]=thumbnail&populate[1]=instructor&populate[2]=modules.lessons`
  )

  const course = courseData.data[0].attributes
  
  return (
    <article className="max-w-4xl mx-auto px-4 py-16">
      <CourseHeader course={course} />
      <CourseContent course={course} />
      <CourseModules modules={course.modules} />
      <CourseEnrollment courseId={courseData.data[0].id} />
    </article>
  )
}
```

### 4.5 Blog System Implementation

#### 4.5.1 Blog Listing Page
```typescript
// app/blog/page.tsx
export default async function BlogPage({ searchParams }: {
  searchParams: { category?: string, page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const pageSize = 12

  const blogQuery = buildStrapiQuery({
    populate: ['featuredImage', 'author', 'category'],
    pagination: { page, pageSize },
    sort: ['publishedAt:desc'],
    ...(searchParams.category && {
      filters: { category: { slug: searchParams.category } }
    })
  })

  const [postsData, categoriesData] = await Promise.all([
    fetchFromStrapi(`/api/blog-posts?${blogQuery}`),
    fetchFromStrapi('/api/blog-categories')
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <BlogHeader />
      <BlogCategories categories={categoriesData.data} />
      <BlogGrid posts={postsData.data} />
      <BlogPagination meta={postsData.meta} />
    </div>
  )
}
```

#### 4.5.2 Blog Post Page
```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const postData = await fetchFromStrapi(
    `/api/blog-posts?filters[slug]=${params.slug}&populate[0]=featuredImage&populate[1]=author&populate[2]=category&populate[3]=tags`
  )

  const post = postData.data[0].attributes

  return (
    <article className="max-w-4xl mx-auto px-4 py-16">
      <BlogPostHeader post={post} />
      <BlogPostContent content={post.content} />
      <BlogPostMeta post={post} />
      <BlogPostShare slug={params.slug} title={post.title} />
    </article>
  )
}
```

## 🔐 Authentication System Integration

### 4.6 Custom JWT Authentication

#### 4.6.1 Authentication API Routes
```typescript
// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json()

  try {
    // Validate credentials against database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true }
    })

    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    )

    // Set HTTP-only cookies
    const response = NextResponse.json({ 
      user: { id: user.id, email: user.email, role: user.role }
    })
    
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
```

#### 4.6.2 Authentication Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value

  // Protected routes
  const protectedPaths = ['/dashboard', '/profile', '/courses/enrolled']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!)
      // Add user info to headers for server components
      const response = NextResponse.next()
      response.headers.set('x-user-token', token)
      return response
    } catch {
      // Invalid token - redirect to login
      if (isProtectedPath) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/courses/enrolled/:path*']
}
```

### 4.7 Form Implementation with Validation

#### 4.7.1 Contact Form Component
```typescript
// components/forms/ContactForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        // Mock success - console.log for now
        console.log('Contact form submitted:', data)
        reset()
        // Show success message
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      // Show error message
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          {...register('name')}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Similar fields for email, subject, message */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
```

#### 4.7.2 Mock API Route for Contact Form
```typescript
// app/api/contact/route.ts
export async function POST(request: Request) {
  const formData = await request.json()
  
  // Mock email functionality
  console.log('📧 Mock Email Service - Contact Form Submission:')
  console.log('To: admin@projectdes.com')
  console.log('From:', formData.email)
  console.log('Subject:', formData.subject)
  console.log('Message:', formData.message)
  console.log('Sender:', formData.name)
  
  // TODO: Replace with real email service integration
  // await emailService.send({
  //   to: 'admin@projectdes.com',
  //   from: formData.email,
  //   subject: `Contact Form: ${formData.subject}`,
  //   html: generateEmailTemplate(formData)
  // })

  return Response.json({ 
    success: true, 
    message: 'Message sent successfully (mock)' 
  })
}
```

## 🧩 Component Architecture

### 4.8 Reusable Component Library

#### 4.8.1 UI Components
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  href,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50'
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`

  if (href) {
    return <Link href={href} className={className}>{children}</Link>
  }

  return <button className={className} {...props}>{children}</button>
}
```

### 4.9 Layout Components

#### 4.9.1 Root Layout
```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-manrope'
})

export const metadata: Metadata = {
  title: 'ProjectDes AI Academy - Master AI Transformation',
  description: 'Professional AI education platform with job placement guarantees',
  keywords: 'AI education, machine learning, job placement, certification',
  authors: [{ name: 'ProjectDes Team' }],
  openGraph: {
    title: 'ProjectDes AI Academy',
    description: 'Master AI Transformation with Expert Guidance',
    images: ['/images/og-image.jpg'],
    type: 'website'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

## ✅ Phase 4 Deliverables

### 4.10 Completion Checklist
- [ ] Next.js 14 app with App Router configured
- [ ] All 24+ pages implemented as Server/Client Components
- [ ] Strapi integration with direct API calls
- [ ] Custom JWT authentication system  
- [ ] Form validation with Zod + React Hook Form
- [ ] Mock email functionality for forms
- [ ] Responsive component library
- [ ] SEO optimization with metadata API
- [ ] Error boundaries and loading states
- [ ] TypeScript types for all components

### 4.11 Performance Targets
```javascript
const performanceGoals = {
  FCP: "<1.5s",           // First Contentful Paint
  LCP: "<2.5s",           // Largest Contentful Paint  
  CLS: "<0.1",            // Cumulative Layout Shift
  FID: "<100ms",          // First Input Delay
  bundleSize: "<500KB",   // Initial bundle size
  serverResponse: "<200ms" // API response time
}
```

## 🧪 Testing Strategy

### 4.12 Component Testing
```typescript
// Testing framework setup
const testingStack = {
  unitTests: "Vitest + React Testing Library",
  integration: "Playwright component testing",
  e2e: "Playwright full browser testing",
  visual: "Playwright visual comparisons",
  accessibility: "axe-core integration"
}
```

## 🔜 Phase 5 Preparation
- Complete Next.js application with all pages
- Authentication system functional  
- Forms working with mock email
- Component library established
- Performance optimized
- Ready for advanced API integrations

**Phase 4 delivers the complete functional Next.js application.**