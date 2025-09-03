# 🧪 Phase 6: Testing & Quality Assurance Strategy

**Duration**: 4-5 hours  
**Priority**: Critical - Quality gates and reliability assurance  
**Dependencies**: Phases 1-5 (Complete application functionality)

## 🎯 Testing Framework Architecture

### 6.1 Multi-Layer Testing Strategy
```
Testing Pyramid:
├── Unit Tests (70%)           # Vitest + React Testing Library
├── Integration Tests (20%)    # Playwright Component Testing  
├── E2E Tests (10%)           # Playwright + Cypress
└── Visual Tests              # Playwright Visual Comparisons

Quality Gates:
├── Type Safety               # TypeScript strict mode
├── Code Quality              # ESLint + Prettier
├── Performance               # Lighthouse CI  
├── Accessibility             # axe-core integration
└── Security                  # OWASP compliance
```

### 6.2 Testing Tools Configuration

#### 6.2.1 Vitest Setup (Unit Tests)
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/test/**',
        'src/types/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/db': path.resolve(__dirname, '../packages/db/src'),
      '@/types': path.resolve(__dirname, '../packages/types/src'),
      '@/utils': path.resolve(__dirname, '../packages/utils/src')
    }
  }
})
```

#### 6.2.2 Playwright Configuration (E2E + Visual)
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './qa/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }],
    ['json', { outputFile: 'results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    // Desktop Browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    },

    // Visual Testing
    {
      name: 'visual-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      testDir: './qa/playwright/visual'
    }
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
```

#### 6.2.3 Cypress Configuration (Complex E2E)
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'qa/cypress/support/e2e.ts',
    specPattern: 'qa/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    setupNodeEvents(on, config) {
      // Accessibility testing
      require('cypress-axe/commands')
      
      // Coverage reporting
      require('@cypress/code-coverage/task')(on, config)
      
      return config
    },

    env: {
      coverage: true,
      codeCoverage: {
        exclude: ['cypress/**/*.*']
      }
    }
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.cy.{js,ts,jsx,tsx}',
    supportFile: 'qa/cypress/support/component.ts'
  }
})
```

## 🔬 Unit Testing Strategy

### 6.3 Component Testing Framework

#### 6.3.1 UI Component Tests
```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="primary">Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600', 'text-white')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders as link when href provided', () => {
    render(<Button href="/test">Link Button</Button>)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test')
  })

  it('disables interaction when disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50')
  })
})
```

#### 6.3.2 Form Validation Tests
```typescript
// src/components/forms/ContactForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContactForm } from './ContactForm'

// Mock fetch
global.fetch = vi.fn()

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
      expect(screen.getByText('Subject must be at least 5 characters')).toBeInTheDocument()
      expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Message sent successfully' })
    } as Response)

    const user = userEvent.setup()
    render(<ContactForm />)

    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
    await user.type(screen.getByLabelText(/message/i), 'This is a test message')

    // Submit
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'This is a test message'
        })
      })
    })
  })

  it('handles submission errors gracefully', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const user = userEvent.setup()
    render(<ContactForm />)

    // Fill and submit form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject')  
    await user.type(screen.getByLabelText(/message/i), 'This is a test message')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
    })
  })
})
```

### 6.4 API Route Testing

#### 6.4.1 Authentication API Tests
```typescript
// src/app/api/auth/login/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  }
}))

vi.mock('bcryptjs', () => ({
  compare: vi.fn()
}))

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn()
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid request body', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid' }) // Missing password
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('returns 401 for invalid credentials', async () => {
    const { prisma } = await import('@/lib/prisma')
    const bcrypt = await import('bcryptjs')
    
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)
    
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
    
    const data = await response.json()
    expect(data.error).toBe('Invalid credentials')
  })

  it('returns user data and sets cookies for valid credentials', async () => {
    const { prisma } = await import('@/lib/prisma')
    const bcrypt = await import('bcryptjs')
    const jwt = await import('jsonwebtoken')
    
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'STUDENT'
    }
    
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser)
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true)
    vi.mocked(jwt.sign).mockReturnValue('mock-token')
    
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.user).toEqual({
      id: '1',
      email: 'test@example.com',
      role: 'STUDENT'
    })
    
    // Check that cookies are set
    const cookies = response.headers.get('set-cookie')
    expect(cookies).toContain('accessToken=mock-token')
  })
})
```

## 🎭 End-to-End Testing

### 6.5 Playwright E2E Tests

#### 6.5.1 User Journey Tests
```typescript
// qa/playwright/e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('completes registration with valid data', async ({ page }) => {
    // Fill registration form
    await page.fill('[data-testid="firstName"]', 'John')
    await page.fill('[data-testid="lastName"]', 'Doe')
    await page.fill('[data-testid="email"]', `test-${Date.now()}@example.com`)
    await page.fill('[data-testid="password"]', 'SecurePass123!')
    await page.fill('[data-testid="confirmPassword"]', 'SecurePass123!')

    // Accept terms
    await page.check('[data-testid="acceptTerms"]')

    // Submit form
    await page.click('[data-testid="submitRegistration"]')

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page).toHaveURL('/dashboard')
  })

  test('displays validation errors for invalid data', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="submitRegistration"]')

    // Check validation messages
    await expect(page.locator('text=First name is required')).toBeVisible()
    await expect(page.locator('text=Last name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('prevents registration with existing email', async ({ page }) => {
    // Fill with existing email
    await page.fill('[data-testid="firstName"]', 'Jane')
    await page.fill('[data-testid="lastName"]', 'Doe')
    await page.fill('[data-testid="email"]', 'existing@example.com')
    await page.fill('[data-testid="password"]', 'SecurePass123!')
    await page.fill('[data-testid="confirmPassword"]', 'SecurePass123!')
    await page.check('[data-testid="acceptTerms"]')

    await page.click('[data-testid="submitRegistration"]')

    // Verify error message
    await expect(page.locator('text=User with this email already exists')).toBeVisible()
  })
})
```

#### 6.5.2 Course Interaction Tests
```typescript
// qa/playwright/e2e/course-interaction.spec.ts  
import { test, expect } from '@playwright/test'

test.describe('Course Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Login before tests
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'student@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="loginButton"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('browses and filters course catalog', async ({ page }) => {
    await page.goto('/courses')
    
    // Verify initial course grid
    await expect(page.locator('[data-testid="course-card"]')).toHaveCount(12)
    
    // Filter by category
    await page.selectOption('[data-testid="categoryFilter"]', 'machine-learning')
    await page.waitForLoadState('networkidle')
    
    // Verify filtered results
    const filteredCourses = page.locator('[data-testid="course-card"]')
    await expect(filteredCourses.first()).toContainText('Machine Learning')
    
    // Search for specific course
    await page.fill('[data-testid="searchInput"]', 'AI Fundamentals')
    await page.press('[data-testid="searchInput"]', 'Enter')
    await page.waitForLoadState('networkidle')
    
    // Verify search results
    await expect(page.locator('[data-testid="course-card"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="course-title"]')).toContainText('AI Fundamentals')
  })

  test('enrolls in free course', async ({ page }) => {
    await page.goto('/courses/ai-fundamentals')
    
    // Verify course details
    await expect(page.locator('[data-testid="course-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="course-price"]')).toContainText('Free')
    
    // Enroll in course
    await page.click('[data-testid="enrollButton"]')
    
    // Verify enrollment success
    await expect(page.locator('[data-testid="enrollment-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="startCourseButton"]')).toBeVisible()
    
    // Navigate to course content
    await page.click('[data-testid="startCourseButton"]')
    await expect(page).toHaveURL(/\/courses\/ai-fundamentals\/learn/)
  })

  test('tracks course progress', async ({ page }) => {
    // Navigate to enrolled course
    await page.goto('/courses/ai-fundamentals/learn')
    
    // Complete first lesson
    await page.click('[data-testid="lesson-1"]')
    await page.waitForTimeout(2000) // Simulate reading time
    await page.click('[data-testid="markCompleteButton"]')
    
    // Verify progress update
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '10')
    await expect(page.locator('[data-testid="lesson-1-status"]')).toContainText('Completed')
    
    // Navigate to next lesson
    await page.click('[data-testid="nextLessonButton"]')
    await expect(page.locator('[data-testid="lesson-2"]')).toBeVisible()
  })
})
```

### 6.6 Visual Regression Testing

#### 6.6.1 Homepage Visual Tests
```typescript
// qa/playwright/visual/homepage.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Homepage Visual Tests', () => {
  test('matches homepage design', async ({ page }) => {
    await page.goto('/')
    
    // Wait for content to load
    await page.waitForLoadState('networkidle')
    
    // Full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      threshold: 0.2
    })
  })

  test('hero section responsive design', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const heroSection = page.locator('[data-testid="hero-section"]')
      await expect(heroSection).toHaveScreenshot(
        `hero-${viewport.width}x${viewport.height}.png`,
        { threshold: 0.1 }
      )
    }
  })

  test('course cards grid layout', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const coursesSection = page.locator('[data-testid="courses-preview"]')
    await expect(coursesSection).toHaveScreenshot('courses-grid.png', {
      threshold: 0.1
    })
  })

  test('navigation states', async ({ page }) => {
    await page.goto('/')
    
    // Default navigation
    const navigation = page.locator('[data-testid="main-navigation"]')
    await expect(navigation).toHaveScreenshot('nav-default.png')
    
    // Hover states
    await page.hover('[data-testid="courses-menu"]')
    await expect(navigation).toHaveScreenshot('nav-courses-hover.png')
    
    // Mobile navigation
    await page.setViewportSize({ width: 375, height: 667 })
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toHaveScreenshot('mobile-menu.png')
  })
})
```

## ♿ Accessibility Testing

### 6.7 Accessibility Compliance

#### 6.7.1 axe-core Integration
```typescript
// qa/playwright/accessibility/wcag-compliance.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('homepage meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('course pages are accessible', async ({ page }) => {
    await page.goto('/courses/ai-fundamentals')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('forms have proper labeling and keyboard navigation', async ({ page }) => {
    await page.goto('/contact')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab') // First input
    await expect(page.locator('[data-testid="name"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Second input
    await expect(page.locator('[data-testid="email"]')).toBeFocused()
    
    // Test screen reader support
    const nameInput = page.locator('[data-testid="name"]')
    await expect(nameInput).toHaveAttribute('aria-label')
    await expect(nameInput).toHaveAttribute('aria-required', 'true')
    
    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="contact-form"]')
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
```

#### 6.7.2 Keyboard Navigation Tests
```typescript
// qa/playwright/accessibility/keyboard-navigation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Keyboard Navigation', () => {
  test('main navigation is fully keyboard accessible', async ({ page }) => {
    await page.goto('/')
    
    // Start from the skip link
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="skip-to-main"]')).toBeFocused()
    
    // Navigate through header
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="logo"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="nav-courses"]')).toBeFocused()
    
    // Test dropdown navigation with arrow keys
    await page.keyboard.press('Enter') // Open dropdown
    await page.keyboard.press('ArrowDown') // First item
    await expect(page.locator('[data-testid="nav-dropdown-item-1"]')).toBeFocused()
    
    await page.keyboard.press('ArrowDown') // Second item
    await expect(page.locator('[data-testid="nav-dropdown-item-2"]')).toBeFocused()
    
    await page.keyboard.press('Escape') // Close dropdown
    await expect(page.locator('[data-testid="nav-courses"]')).toBeFocused()
  })

  test('form navigation follows logical tab order', async ({ page }) => {
    await page.goto('/register')
    
    const expectedTabOrder = [
      '[data-testid="firstName"]',
      '[data-testid="lastName"]',
      '[data-testid="email"]',
      '[data-testid="password"]',
      '[data-testid="confirmPassword"]',
      '[data-testid="acceptTerms"]',
      '[data-testid="submitRegistration"]'
    ]

    for (let i = 0; i < expectedTabOrder.length; i++) {
      await page.keyboard.press('Tab')
      await expect(page.locator(expectedTabOrder[i])).toBeFocused()
    }
  })
})
```

## ⚡ Performance Testing

### 6.8 Lighthouse CI Integration

#### 6.8.1 Performance Budget Tests
```typescript
// qa/playwright/performance/lighthouse.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('homepage meets performance budget', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => document.readyState === 'complete')
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        LCP: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      }
    })

    // Performance budget assertions
    expect(metrics.FCP).toBeLessThan(1500) // < 1.5s First Contentful Paint
    expect(metrics.LCP).toBeLessThan(2500) // < 2.5s Largest Contentful Paint
    expect(metrics.domContentLoaded).toBeLessThan(1000) // < 1s DOM loaded
    expect(metrics.loadComplete).toBeLessThan(3000) // < 3s full load
  })

  test('course pages load within budget', async ({ page }) => {
    await page.goto('/courses')
    
    const startTime = Date.now()
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(2000) // < 2s load time
    
    // Check bundle size impact
    const resourceSizes = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('.js'))
        .reduce((total, entry) => total + (entry as any).transferSize, 0)
    })

    expect(resourceSizes).toBeLessThan(500 * 1024) // < 500KB JS bundle
  })
})
```

### 6.9 Load Testing Strategy

#### 6.9.1 API Load Tests
```typescript
// qa/load-testing/api-load.spec.ts
import { test, expect } from '@playwright/test'

test.describe('API Load Tests', () => {
  test('handles concurrent course API requests', async ({ browser }) => {
    const promises = []
    const concurrentUsers = 10
    
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        browser.newPage().then(async page => {
          const startTime = Date.now()
          const response = await page.request.get('/api/courses')
          const endTime = Date.now()
          
          expect(response.status()).toBe(200)
          expect(endTime - startTime).toBeLessThan(1000) // < 1s response
          
          await page.close()
          return endTime - startTime
        })
      )
    }

    const results = await Promise.all(promises)
    const avgResponseTime = results.reduce((a, b) => a + b, 0) / results.length
    
    expect(avgResponseTime).toBeLessThan(500) // < 500ms average
  })
})
```

## ✅ Phase 6 Deliverables

### 6.10 Completion Checklist
- [ ] Complete unit test suite with >80% coverage
- [ ] Integration tests for all components
- [ ] E2E tests for critical user journeys
- [ ] Visual regression testing setup
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Performance testing with budgets
- [ ] Cross-browser compatibility tests
- [ ] Mobile device testing
- [ ] API load testing
- [ ] Security testing framework

### 6.11 Quality Metrics Dashboard
```javascript
const qualityMetrics = {
  testCoverage: {
    unit: ">80%",
    integration: ">70%",
    e2e: ">90% critical paths"
  },
  
  performance: {
    FCP: "<1.5s",
    LCP: "<2.5s",
    CLS: "<0.1",
    bundleSize: "<500KB"
  },
  
  accessibility: {
    wcag2aa: "100% compliance",
    keyboardNav: "Full support",
    screenReader: "Full support"
  },
  
  browsers: {
    chrome: "Latest + 2 versions",
    firefox: "Latest + 2 versions",
    safari: "Latest + 2 versions",
    mobile: "iOS Safari + Chrome Mobile"
  }
}
```

### 6.12 CI/CD Integration
```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:unit --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm playwright install
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:a11y

  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm lighthouse-ci
```

## 🔜 Phase 7 Preparation
- Complete testing framework implemented
- Quality gates established and passing
- Performance benchmarks validated
- Accessibility compliance verified
- Ready for production deployment preparation

**Phase 6 ensures enterprise-grade quality and reliability.**