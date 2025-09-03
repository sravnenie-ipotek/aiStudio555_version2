/**
 * Playwright Configuration for ProjectDes Academy
 * Comprehensive E2E testing with performance and accessibility validation
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  
  // Global test settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Fail build if test fails
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: './test-results/html-report' }],
    ['json', { outputFile: './test-results/results.json' }],
    ['junit', { outputFile: './test-results/junit.xml' }],
    ['list']
  ],
  
  // Global test setup
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Performance monitoring
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Accessibility testing
    launchOptions: {
      args: ['--disable-web-security', '--disable-features=TranslateUI']
    }
  },

  // Multi-browser testing configuration
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Performance monitoring
        contextOptions: {
          recordVideo: {
            dir: './test-results/videos'
          }
        }
      }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    },

    // Tablet
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] }
    }
  ],

  // Development server configuration
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup.js'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.js')
});