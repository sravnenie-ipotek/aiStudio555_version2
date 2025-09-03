# AiStudio555 — CI/CD Infrastructure Guide

This document is the **single source of truth** for Continuous Integration and Continuous Deployment of AiStudio555 Academy. It documents the actual GitHub Actions workflows implemented in the `.github/workflows/` directory.

---

## 🎯 Objectives

- **Multi-workflow architecture** with specialized pipelines for different purposes
- **Automated testing** with unit, integration, and E2E test suites
- **Performance monitoring** with scheduled Lighthouse and load testing
- **Production deployment** with staging gates and manual approvals
- **Monorepo optimization** using pnpm + Turborepo for efficient builds

---

## 📁 Workflow Files Structure

The CI/CD system consists of 5 specialized workflow files:

```
.github/workflows/
├── ci.yml              # Main CI pipeline for PRs and pushes
├── deployment.yml      # Production deployment with staging/prod environments
├── e2e.yml            # End-to-end testing (scheduled and manual)
├── performance.yml     # Performance monitoring and testing
└── deploy.yml         # Legacy deployment (to be removed)
```

---

## 🔄 CI Pipeline — `.github/workflows/ci.yml`

**Purpose**: Main continuous integration pipeline for all code changes.

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Key Features**:
- Concurrency control to cancel outdated runs
- Dependency caching for faster builds
- Parallel job execution where possible
- Comprehensive test coverage

### Job Structure:

```yaml
jobs:
  setup:
    # Node.js and pnpm setup
    # Dependency caching
    # Cache key generation
  
  lint:
    needs: setup
    # ESLint checks
    # Prettier formatting validation
  
  typecheck:
    needs: setup
    # TypeScript compilation checks
  
  unit-tests:
    needs: setup
    # Vitest unit tests with coverage
    # Coverage thresholds: 90% branches, 95% lines
  
  build:
    needs: [lint, typecheck]
    # Turbo build for all packages
    # Build artifact caching
  
  integration-tests:
    needs: build
    # Database setup
    # API integration tests
    # Service health checks
```

---

## 🚀 Deployment Pipeline — `.github/workflows/deployment.yml`

**Purpose**: Production deployment with environment gates.

**Triggers**:
- Push to `main` branch (auto-deploy to staging)
- Tags matching `v*` (production deployment)
- Manual workflow dispatch with environment selection

**Environments**:
- **staging**: Auto-deploy on main branch changes
- **production**: Manual approval required

### Deployment Flow:

```yaml
inputs:
  environment:
    type: choice
    options: [staging, production]
  skip_tests:
    type: boolean
    default: false  # Emergency deployments only

jobs:
  test:
    if: inputs.skip_tests != true
    # Run full test suite before deployment
  
  deploy:
    needs: test
    environment: ${{ inputs.environment }}
    steps:
      - Build Docker images
      - Push to registry
      - Deploy to Vercel (frontend)
      - Deploy to Railway (API)
      - Run database migrations
      - Smoke tests
      - Rollback on failure
```

**Security**:
- Environment secrets for production credentials
- Manual approval for production deployments
- Automated rollback on deployment failure

---

## 🎭 E2E Testing — `.github/workflows/e2e.yml`

**Purpose**: Comprehensive end-to-end testing across browsers.

**Triggers**:
- Daily schedule at 2 AM UTC
- Manual workflow dispatch

**Test Configuration**:

```yaml
inputs:
  environment:
    options: [staging, production]
  browser:
    options: [all, chromium, firefox, webkit]
  test_suite:
    options: [all, smoke, regression, critical]

matrix:
  browser: [chromium, firefox, webkit]
  viewport: [desktop, tablet, mobile]
```

### Test Suites:

1. **Smoke Tests**: Critical user paths (login, checkout, navigation)
2. **Regression Tests**: Full feature coverage
3. **Accessibility Tests**: WCAG 2.1 AA compliance
4. **Visual Tests**: Screenshot comparisons

**Reporting**:
- HTML reports uploaded as artifacts
- Screenshots and videos on failure
- Slack notifications for failures

---

## ⚡ Performance Monitoring — `.github/workflows/performance.yml`

**Purpose**: Continuous performance monitoring and optimization.

**Triggers**:
- Every 6 hours (cron schedule)
- Manual workflow dispatch

**Test Types**:

```yaml
test_type:
  options:
    - lighthouse    # Core Web Vitals, SEO, Accessibility
    - load         # k6 load testing (100 concurrent users)
    - stress       # k6 stress testing (ramping to 1000 users)
    - memory       # Node.js memory profiling
```

### Performance Metrics:

**Lighthouse Targets**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

**Load Testing Thresholds**:
- p95 response time: <500ms
- Error rate: <1%
- Throughput: >100 req/s

**Monitoring**:
- Results stored in time-series database
- Grafana dashboards for visualization
- Alerts for performance regressions

---

## 🔧 Environment Configuration

### Required GitHub Secrets:

```yaml
# Deployment
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
RAILWAY_TOKEN

# Database
DATABASE_URL

# Monitoring
SENTRY_DSN
GRAFANA_API_KEY

# Notifications
SLACK_WEBHOOK_URL
```

### Environment Protection Rules:

**Staging**:
- Auto-deploy from main branch
- No manual approval required

**Production**:
- Required reviewers: 2 team members
- Deployment hours: Mon-Fri, 9 AM - 5 PM
- Wait timer: 5 minutes

---

## 🛠️ Monorepo Configuration

### Turborepo Pipeline:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

### pnpm Workspace:

```yaml
packages:
  - apps/*
  - packages/*
  - qa
```

---

## 📊 Monitoring & Observability

### Deployment Tracking:
- GitHub Deployments API integration
- Environment-specific deployment history
- Automatic rollback tracking

### Test Results:
- JUnit XML reports for all test suites
- Code coverage reports to Codecov
- Performance metrics to Grafana

### Notifications:
- Slack: Deployment status, test failures
- Email: Critical production issues
- GitHub: PR status checks

---

## 🔄 Rollback Strategy

### Automatic Rollback Triggers:
- Health check failures post-deployment
- Error rate spike (>5% in 5 minutes)
- Response time degradation (>2x baseline)

### Manual Rollback:
```bash
# Via GitHub UI
# Navigate to Deployments → Select previous deployment → Re-deploy

# Via CLI
gh workflow run deployment.yml -f environment=production -f rollback=true
```

---

## ⚠️ Best Practices

### DO:
✅ Use concurrency groups to prevent duplicate runs
✅ Cache dependencies aggressively
✅ Run tests in parallel when possible
✅ Use matrix builds for cross-browser testing
✅ Implement health checks after deployment

### DON'T:
❌ Skip tests for production deployments
❌ Store secrets in code
❌ Deploy during high-traffic hours
❌ Ignore flaky tests
❌ Mix staging and production secrets

---

## 🚨 Incident Response

### Deployment Failure:
1. Check GitHub Actions logs
2. Review Sentry for errors
3. Verify database migrations
4. Check service health endpoints
5. Initiate rollback if needed

### Performance Degradation:
1. Check Grafana dashboards
2. Review recent deployments
3. Analyze performance test results
4. Scale resources if needed
5. Implement hotfix if code issue

---

## 📚 Related Documentation

- Testing Strategy: `/qa/README.md`
- Deployment Architecture: `/Docs/DEPLOYMENT-GUIDE.md`
- Performance Budgets: `/qa/performance/README.md`
- Security Policies: `/Docs/SECURITY.md`

---

## 🔮 Future Improvements

- [ ] Blue-green deployments for zero-downtime
- [ ] Canary releases with feature flags
- [ ] Automated dependency updates with Renovate
- [ ] Cost optimization through scheduled scaling
- [ ] Multi-region deployment support