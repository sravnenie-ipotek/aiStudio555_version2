# SUBAGENT_USAGE_GUIDE.md - Complete Usage Documentation

Comprehensive usage guide for the intelligent sub-agent system in Claude Code SuperClaude framework.

## Quick Start Guide

### Basic Usage Pattern

```typescript
// Simple task delegation
Task({
  description: "Create responsive navigation component",
  prompt: "Design and implement a mobile-first navigation component with accessibility features",
  subagent_type: "world-class-designer"
});
```

### Automatic Routing (Recommended)

```typescript
// Let the routing system choose the best agent
Task({
  description: "Audit security vulnerabilities in authentication system",
  prompt: "Comprehensive security review of JWT implementation and user authentication flow"
  // subagent_type will be automatically determined as 'security-architect'
});
```

## Agent Selection Guide

### When to Use Each Agent

#### 🛠️ Utility Agents

**`general-purpose`**
```typescript
// Use when: No clear domain specialty needed
Task({
  description: "Research best practices for TypeScript configuration",
  prompt: "Find and analyze current TypeScript configuration best practices for Next.js projects",
  subagent_type: "general-purpose"
});
```

**`statusline-setup`**
```typescript
// Use when: Configuring Claude Code UI settings
Task({
  description: "Configure status line display",
  prompt: "Update Claude Code status line to show current file, line number, and git branch",
  subagent_type: "statusline-setup"
});
```

**`output-style-setup`**
```typescript
// Use when: Customizing Claude Code output formatting
Task({
  description: "Create custom output style",
  prompt: "Design a minimalist output style with syntax highlighting for TypeScript",
  subagent_type: "output-style-setup"
});
```

#### 🎨 Design Specialists

**`world-class-designer`** ⭐ PROACTIVE
```typescript
// Use when: Creating new UI components, design systems, visual assets
Task({
  description: "Design modern dashboard interface",
  prompt: `Create a comprehensive dashboard design with:
  - Clean, modern aesthetic following Material Design principles
  - Responsive grid layout for charts and metrics
  - Dark/light theme support
  - Accessible color palette (WCAG AA compliant)
  - Interactive elements with hover states`,
  subagent_type: "world-class-designer"
});

// Automatic activation when design work detected
// No manual trigger needed for UI component creation
```

**`design-scraper`**
```typescript
// Use when: Analyzing competitor designs, extracting patterns
Task({
  description: "Analyze educational platform designs",
  prompt: `Scrape and analyze top 10 educational platform websites:
  - Extract UI patterns and component structures
  - Identify common navigation patterns
  - Document color schemes and typography choices
  - Create component library suggestions based on findings`,
  subagent_type: "design-scraper"
});
```

**`design-fixer`** ⭐ PROACTIVE
```typescript
// Use when: Auditing UI for accessibility, fixing design issues
Task({
  description: "Accessibility compliance audit",
  prompt: `Comprehensive accessibility review:
  - WCAG 2.2 AA compliance verification
  - Screen reader compatibility testing
  - Keyboard navigation validation
  - Color contrast ratio analysis
  - Focus management review`,
  subagent_type: "design-fixer"
});

// Automatic activation after UI file changes
// Monitors: *.tsx, *.jsx, *.css, *.scss files
```

#### 🏗️ Architecture Specialists

**`qa-architect`**
```typescript
// Use when: Testing strategy, quality assurance, test automation
Task({
  description: "Comprehensive testing strategy",
  prompt: `Design and implement testing strategy:
  - Unit test coverage >95% for critical components
  - Integration testing for API endpoints
  - E2E testing for user journeys
  - Performance testing with k6
  - Visual regression testing setup`,
  subagent_type: "qa-architect"
});
```

**`api-architect`**
```typescript
// Use when: API design, documentation, integration
Task({
  description: "RESTful API design for course management",
  prompt: `Design comprehensive course management API:
  - RESTful endpoint design following OpenAPI 3.0
  - Authentication and authorization patterns
  - Rate limiting and caching strategies
  - Error handling and validation
  - API versioning strategy`,
  subagent_type: "api-architect"
});
```

**`architecture-guardian`** ⭐ PROACTIVE
```typescript
// Use when: System architecture, design patterns, structural changes
Task({
  description: "Microservices architecture review",
  prompt: `Comprehensive architecture analysis:
  - Service boundary definition
  - Data consistency patterns
  - Inter-service communication design
  - Scalability and performance considerations
  - Technical debt assessment`,
  subagent_type: "architecture-guardian"
});

// Automatic activation on structural changes
// Monitors: src/app/**, src/components/**, *.config.* files
```

**`frontend-architect`**
```typescript
// Use when: Frontend architecture, component design, performance optimization
Task({
  description: "Next.js performance optimization",
  prompt: `Optimize React application for performance:
  - Core Web Vitals improvement (LCP, FID, CLS)
  - Bundle size optimization and code splitting
  - Image optimization and lazy loading
  - Server-side rendering optimization
  - Client-side caching strategy`,
  subagent_type: "frontend-architect"
});
```

**`database-architect`** ⭐ PROACTIVE
```typescript
// Use when: Database design, performance tuning, migrations
Task({
  description: "Educational platform database optimization",
  prompt: `Optimize database for 100K+ concurrent users:
  - Schema design for course management system
  - Index optimization for common queries
  - Migration strategy for data model changes
  - Performance monitoring and alerting setup
  - Backup and disaster recovery planning`,
  subagent_type: "database-architect"
});

// Automatic activation on database changes
// Monitors: schema.prisma, migrations/**, *.sql files
```

#### ☁️ Infrastructure Specialists

**`devops-engineer`**
```typescript
// Use when: Deployment, CI/CD, infrastructure automation
Task({
  description: "Production deployment pipeline",
  prompt: `Set up enterprise-grade deployment pipeline:
  - Docker containerization with multi-stage builds
  - Kubernetes orchestration with auto-scaling
  - CI/CD pipeline with GitHub Actions
  - Infrastructure as code with Terraform
  - Monitoring and alerting with Prometheus`,
  subagent_type: "devops-engineer"
});
```

**`security-architect`** ⭐ PROACTIVE
```typescript
// Use when: Security audits, compliance, vulnerability assessment
Task({
  description: "Zero-trust security implementation",
  prompt: `Implement comprehensive security architecture:
  - JWT security best practices
  - OAuth2/OIDC implementation
  - API security and rate limiting
  - Data encryption at rest and in transit
  - GDPR compliance validation`,
  subagent_type: "security-architect"
});

// Automatic activation on security events
// Monitors: auth files, security alerts, dependency vulnerabilities
```

**`performance-engineer`** ⭐ PROACTIVE
```typescript
// Use when: Performance optimization, bottleneck analysis
Task({
  description: "Application performance optimization",
  prompt: `Optimize application for sub-100ms response times:
  - Database query optimization
  - Caching strategy implementation
  - API response time optimization
  - Frontend rendering performance
  - Resource usage optimization`,
  subagent_type: "performance-engineer"
});

// Automatic activation on performance degradation
// Monitors: Response times, error rates, resource usage
```

## Advanced Usage Patterns

### Multi-Agent Coordination

```typescript
// Complex workflow with multiple specialists
async function comprehensiveSecurityAudit() {
  // 1. Security architect performs initial assessment
  const securityAssessment = await Task({
    description: "Initial security assessment",
    prompt: "Comprehensive security vulnerability analysis",
    subagent_type: "security-architect"
  });
  
  // 2. Architecture guardian reviews system impact
  const architectureReview = await Task({
    description: "Architecture security review",
    prompt: "Review security findings impact on system architecture",
    subagent_type: "architecture-guardian"
  });
  
  // 3. QA architect creates security test plan
  const testPlan = await Task({
    description: "Security testing strategy",
    prompt: "Create comprehensive security testing plan based on findings",
    subagent_type: "qa-architect"
  });
}
```

### Proactive Agent Workflows

```typescript
// Proactive agents work automatically
class ProactiveWorkflow {
  setupFileWatching() {
    // design-fixer automatically activates on UI changes
    onFileChange('src/components/**/*.tsx', (changes) => {
      // Automatic design-fixer activation
      // No manual intervention required
    });
    
    // database-architect automatically activates on schema changes
    onFileChange('schema.prisma', (changes) => {
      // Automatic database-architect activation
      // Reviews migration safety and performance impact
    });
    
    // security-architect automatically activates on security events
    onSecurityEvent(['auth_failure', 'vulnerability_detected'], (event) => {
      // Automatic security-architect activation
      // Immediate threat assessment and response
    });
  }
}
```

### Complex Project Workflows

```typescript
// Large-scale project implementation
async function implementEducationalPlatform() {
  // Phase 1: Architecture and Design
  const architecturePlan = await Task({
    description: "Educational platform architecture",
    prompt: "Design scalable architecture for 100K+ users educational platform",
    subagent_type: "architecture-guardian"
  });
  
  const databaseDesign = await Task({
    description: "Database schema design",
    prompt: "Design comprehensive database schema for courses, users, and progress tracking",
    subagent_type: "database-architect"
  });
  
  const apiDesign = await Task({
    description: "API architecture design",
    prompt: "Design RESTful API architecture for educational platform",
    subagent_type: "api-architect"
  });
  
  // Phase 2: Security and Performance
  const securityFramework = await Task({
    description: "Security architecture",
    prompt: "Implement zero-trust security architecture with GDPR compliance",
    subagent_type: "security-architect"
  });
  
  const performanceStrategy = await Task({
    description: "Performance optimization strategy",
    prompt: "Design performance optimization strategy for educational platform",
    subagent_type: "performance-engineer"
  });
  
  // Phase 3: Implementation and Testing
  const frontendArchitecture = await Task({
    description: "Frontend component architecture",
    prompt: "Design React component architecture with Next.js optimization",
    subagent_type: "frontend-architect"
  });
  
  const testingStrategy = await Task({
    description: "Comprehensive testing strategy",
    prompt: "Design testing strategy with 95%+ coverage for educational platform",
    subagent_type: "qa-architect"
  });
  
  // Phase 4: Design and UX
  const designSystem = await Task({
    description: "Educational platform design system",
    prompt: "Create comprehensive design system for educational platform",
    subagent_type: "world-class-designer"
  });
  
  // Phase 5: Deployment and Infrastructure
  const deploymentPipeline = await Task({
    description: "Production deployment pipeline",
    prompt: "Set up enterprise deployment pipeline with Kubernetes",
    subagent_type: "devops-engineer"
  });
}
```

## Best Practices

### 1. Agent Selection Strategy

```typescript
// ✅ Good: Let routing system choose automatically
Task({
  description: "Optimize database queries for better performance",
  prompt: "Analyze and optimize slow database queries in user management system"
  // Routing system will select 'database-architect' or 'performance-engineer'
});

// ❌ Avoid: Forcing wrong specialist
Task({
  description: "Design user interface components",
  prompt: "Create responsive navigation components",
  subagent_type: "database-architect" // Wrong specialist!
});
```

### 2. Clear Task Descriptions

```typescript
// ✅ Good: Specific, actionable description
Task({
  description: "Implement OAuth2 authentication with JWT tokens",
  prompt: `Implement secure authentication system:
  - OAuth2 authorization code flow
  - JWT token management with refresh tokens
  - PKCE for enhanced security
  - Rate limiting for auth endpoints
  - Session management with Redis`,
  subagent_type: "security-architect"
});

// ❌ Avoid: Vague description
Task({
  description: "Make it secure",
  prompt: "Add security stuff",
  subagent_type: "security-architect"
});
```

### 3. Leverage Proactive Agents

```typescript
// ✅ Good: Let proactive agents work automatically
// Just modify UI files - design-fixer will activate automatically
editFile('src/components/Button.tsx', {
  // Make accessibility improvements
  // design-fixer will automatically audit changes
});

// ❌ Avoid: Manual activation when proactive agent available
Task({
  description: "Check accessibility after UI changes",
  prompt: "Audit UI changes for accessibility compliance",
  subagent_type: "design-fixer" // Unnecessary - would activate automatically
});
```

### 4. Coordinate Related Agents

```typescript
// ✅ Good: Logical agent coordination
async function secureApiImplementation() {
  // 1. API design
  const apiSpec = await Task({
    description: "API specification design",
    subagent_type: "api-architect"
  });
  
  // 2. Security implementation
  const securityImplementation = await Task({
    description: "API security implementation",
    subagent_type: "security-architect"
  });
  
  // 3. Performance optimization
  const performanceOptimization = await Task({
    description: "API performance optimization",
    subagent_type: "performance-engineer"
  });
  
  // 4. Testing strategy
  const testingPlan = await Task({
    description: "API testing implementation",
    subagent_type: "qa-architect"
  });
}
```

## Common Patterns

### Error Handling and Fallbacks

```typescript
async function robustTaskExecution(taskDescription: string, preferredAgent?: string) {
  try {
    // Try preferred agent first
    const result = await Task({
      description: taskDescription,
      subagent_type: preferredAgent
    });
    
    return result;
  } catch (error) {
    // Fallback to general-purpose agent
    console.log(`Preferred agent failed, using general-purpose fallback`);
    
    return await Task({
      description: taskDescription,
      subagent_type: "general-purpose"
    });
  }
}
```

### Progress Tracking

```typescript
class SubAgentProgressTracker {
  private taskProgress: Map<string, TaskProgress> = new Map();
  
  async trackTask(description: string, agentType: string) {
    const taskId = generateTaskId();
    
    this.taskProgress.set(taskId, {
      description,
      agentType,
      status: 'in_progress',
      startTime: new Date()
    });
    
    try {
      const result = await Task({
        description,
        subagent_type: agentType
      });
      
      this.taskProgress.set(taskId, {
        ...this.taskProgress.get(taskId),
        status: 'completed',
        endTime: new Date(),
        result
      });
      
      return result;
    } catch (error) {
      this.taskProgress.set(taskId, {
        ...this.taskProgress.get(taskId),
        status: 'failed',
        endTime: new Date(),
        error: error.message
      });
      
      throw error;
    }
  }
}
```

## Performance Optimization

### Batch Operations

```typescript
// ✅ Good: Batch related tasks
async function batchOptimization() {
  const tasks = await Promise.all([
    Task({
      description: "Database query optimization",
      subagent_type: "database-architect"
    }),
    Task({
      description: "Frontend performance optimization",
      subagent_type: "frontend-architect"
    }),
    Task({
      description: "API response optimization",
      subagent_type: "performance-engineer"
    })
  ]);
  
  return tasks;
}
```

### Caching Strategies

```typescript
class AgentResultCache {
  private cache: Map<string, CachedResult> = new Map();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes
  
  async getCachedOrExecute(description: string, agentType: string) {
    const cacheKey = `${agentType}:${hashDescription(description)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached)) {
      return cached.result;
    }
    
    const result = await Task({
      description,
      subagent_type: agentType
    });
    
    this.cache.set(cacheKey, {
      result,
      timestamp: new Date(),
      agentType
    });
    
    return result;
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### Agent Not Responding
```typescript
// Check agent availability and fallback
async function robustExecution(taskDescription: string) {
  const timeout = 30000; // 30 seconds
  
  try {
    const result = await Promise.race([
      Task({ description: taskDescription }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Agent timeout')), timeout)
      )
    ]);
    
    return result;
  } catch (error) {
    if (error.message === 'Agent timeout') {
      // Fallback to general-purpose
      return await Task({
        description: taskDescription,
        subagent_type: "general-purpose"
      });
    }
    
    throw error;
  }
}
```

#### Wrong Agent Selection
```typescript
// Validate agent selection
function validateAgentSelection(description: string, selectedAgent: string): boolean {
  const domainKeywords = {
    'design-fixer': ['ui', 'accessibility', 'wcag', 'design'],
    'security-architect': ['security', 'auth', 'vulnerability', 'compliance'],
    'performance-engineer': ['performance', 'optimization', 'speed', 'bottleneck']
  };
  
  const keywords = domainKeywords[selectedAgent] || [];
  const descriptionLower = description.toLowerCase();
  
  return keywords.some(keyword => descriptionLower.includes(keyword));
}
```

#### Resource Conflicts
```typescript
// Prevent resource conflicts between agents
class AgentResourceManager {
  private activeAgents: Set<string> = new Set();
  private resourceLocks: Map<string, string> = new Map();
  
  async executeWithResourceLock(description: string, agentType: string, resources: string[]) {
    // Check for resource conflicts
    const conflicts = resources.filter(resource => this.resourceLocks.has(resource));
    
    if (conflicts.length > 0) {
      throw new Error(`Resource conflict: ${conflicts.join(', ')} already locked`);
    }
    
    // Lock resources
    resources.forEach(resource => this.resourceLocks.set(resource, agentType));
    this.activeAgents.add(agentType);
    
    try {
      const result = await Task({
        description,
        subagent_type: agentType
      });
      
      return result;
    } finally {
      // Release resources
      resources.forEach(resource => this.resourceLocks.delete(resource));
      this.activeAgents.delete(agentType);
    }
  }
}
```

## Monitoring and Analytics

### Agent Performance Tracking

```typescript
class AgentAnalytics {
  private metrics: Map<string, AgentMetrics> = new Map();
  
  trackAgentExecution(agentType: string, duration: number, success: boolean) {
    const current = this.metrics.get(agentType) || {
      totalExecutions: 0,
      successfulExecutions: 0,
      averageDuration: 0,
      failureRate: 0
    };
    
    current.totalExecutions++;
    if (success) current.successfulExecutions++;
    current.averageDuration = (current.averageDuration * (current.totalExecutions - 1) + duration) / current.totalExecutions;
    current.failureRate = 1 - (current.successfulExecutions / current.totalExecutions);
    
    this.metrics.set(agentType, current);
  }
  
  getTopPerformingAgents(): AgentPerformanceReport[] {
    return Array.from(this.metrics.entries())
      .map(([agentType, metrics]) => ({ agentType, ...metrics }))
      .sort((a, b) => (1 - a.failureRate) - (1 - b.failureRate));
  }
}
```

This comprehensive usage guide provides everything needed to effectively use the intelligent sub-agent system for maximum productivity and quality outcomes.