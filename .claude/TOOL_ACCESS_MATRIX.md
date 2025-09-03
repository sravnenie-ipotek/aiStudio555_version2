# TOOL_ACCESS_MATRIX.md - Sub-Agent Tool Configuration

Comprehensive tool access matrix and configuration for all 14 specialized sub-agents in Claude Code SuperClaude framework.

## Tool Access Philosophy

**Principle**: Each sub-agent has carefully curated tool access optimized for their domain expertise and workflow requirements. Tools are assigned based on:

1. **Core Functionality**: Essential tools for the agent's primary responsibilities
2. **Domain Expertise**: Specialized tools that enhance domain-specific capabilities  
3. **Workflow Optimization**: Tools that create efficient workflows for common tasks
4. **Security & Safety**: Restricted access to prevent conflicts and maintain system integrity

## Universal Tool Categories

### Core Tools (Available to Most Agents)
- **Read**: File content analysis and understanding
- **Write**: Creating new files and content
- **Edit**: Modifying existing files with precision
- **MultiEdit**: Batch editing across multiple files
- **Grep**: Advanced pattern searching and code analysis
- **Glob**: File pattern matching and discovery
- **TodoWrite**: Task management and progress tracking

### Specialized Tools (Domain-Specific Access)
- **Bash**: System operations, package management, testing
- **WebFetch**: External content retrieval and analysis
- **Task**: Sub-agent delegation and coordination
- **Notebook Tools**: Data analysis and documentation
- **Output Monitoring**: Process management and monitoring

## Sub-Agent Tool Access Matrix

### 🛠️ UTILITY AGENTS

#### `general-purpose`
**Tools**: ALL AVAILABLE TOOLS (*)
**Rationale**: Swiss Army Knife agent needs maximum flexibility
**Restrictions**: None
**Special Capabilities**:
- Full tool suite access for undefined domains
- Can coordinate with any system component
- Fallback option when no specialist matches

```typescript
const GENERAL_PURPOSE_TOOLS = [
  'Read', 'Write', 'Edit', 'MultiEdit', 'Grep', 'Glob', 
  'Bash', 'WebFetch', 'Task', 'TodoWrite', 'NotebookEdit',
  'BashOutput', 'KillBash', 'ExitPlanMode'
];
```

#### `statusline-setup`
**Tools**: ["Read", "Edit"]
**Rationale**: Configuration specialist focused on settings files
**Workflow**: Read current config → Edit settings → Validate changes
**Restrictions**: No file creation, no system operations

```typescript
const STATUSLINE_SETUP_TOOLS = ['Read', 'Edit'];
```

#### `output-style-setup`
**Tools**: ["Read", "Write", "Edit", "Glob", "Grep"]
**Rationale**: Style configuration with pattern matching capabilities
**Workflow**: Search patterns → Read templates → Create/edit styles
**Restrictions**: No system operations, no delegation

```typescript
const OUTPUT_STYLE_SETUP_TOOLS = ['Read', 'Write', 'Edit', 'Glob', 'Grep'];
```

### 🎨 DESIGN SPECIALISTS

#### `world-class-designer`
**Tools**: ["Read", "Write", "Edit", "Bash", "WebFetch", "Task"]
**Rationale**: Creative design work with external inspiration and system integration
**Special Capabilities**:
- **WebFetch**: Research design trends, gather inspiration
- **Bash**: Install design tools, optimize assets
- **Task**: Coordinate with other design specialists

```typescript
const WORLD_CLASS_DESIGNER_TOOLS = [
  'Read',      // Analyze existing designs
  'Write',     // Create new components and styles
  'Edit',      // Refine existing designs
  'Bash',      // Install design tools, optimize assets
  'WebFetch',  // Research trends, gather inspiration
  'Task'       // Coordinate with design team
];

// Specialized workflows
const DESIGNER_WORKFLOWS = {
  component_creation: ['Read', 'WebFetch', 'Write', 'Bash'],
  design_system: ['Read', 'Edit', 'Write', 'Task'],
  inspiration_gathering: ['WebFetch', 'Read', 'Write'],
  asset_optimization: ['Read', 'Bash', 'Edit']
};
```

#### `design-scraper`
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "WebFetch", "Task", "TodoWrite", "NotebookEdit", "BashOutput", "KillBash"]
**Rationale**: Advanced web scraping and analysis requires comprehensive toolset
**Special Capabilities**:
- **WebFetch**: Primary scraping capability
- **BashOutput/KillBash**: Process monitoring for long-running scrapes
- **NotebookEdit**: Document findings and analysis
- **MultiEdit**: Batch process scraped data

```typescript
const DESIGN_SCRAPER_TOOLS = [
  'Read',         // Analyze scraped content
  'Write',        // Document findings
  'Edit',         // Refine analysis
  'MultiEdit',    // Batch process data
  'Bash',         // Run scraping tools
  'Grep',         // Pattern extraction
  'Glob',         // File discovery
  'WebFetch',     // Primary scraping
  'Task',         // Coordinate analysis
  'TodoWrite',    // Track scraping tasks
  'NotebookEdit', // Document analysis
  'BashOutput',   // Monitor processes
  'KillBash'      // Terminate long processes
];

// MCP Integration
const DESIGN_SCRAPER_MCPS = ['Apify', 'Playwright', 'Firecrawl'];
```

#### `design-fixer`
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "WebFetch", "Task", "TodoWrite", "NotebookEdit", "BashOutput", "KillBash"]
**Rationale**: Quality assurance requires comprehensive analysis and testing tools
**Special Capabilities**:
- **Bash**: Run accessibility testing tools (axe-core, Lighthouse)
- **Grep**: Find accessibility issues and patterns
- **MultiEdit**: Fix issues across multiple files
- **NotebookEdit**: Document compliance reports

```typescript
const DESIGN_FIXER_TOOLS = [
  'Read',         // Analyze UI components
  'Write',        // Create compliance reports
  'Edit',         // Fix accessibility issues
  'MultiEdit',    // Batch fix across files
  'Bash',         // Run testing tools
  'Grep',         // Find accessibility issues
  'Glob',         // Discover UI files
  'WebFetch',     // Research WCAG guidelines
  'Task',         // Coordinate with QA
  'TodoWrite',    // Track fixes
  'NotebookEdit', // Document compliance
  'BashOutput',   // Monitor test execution
  'KillBash'      // Stop long tests
];

// Accessibility testing integration
const DESIGN_FIXER_FRAMEWORKS = [
  'axe-core',    // Accessibility testing
  'Lighthouse',  // Performance and accessibility
  'Storybook',   // Component testing
  'Playwright'   // E2E accessibility tests
];
```

### 🏗️ ARCHITECTURE SPECIALISTS

#### `qa-architect`
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Rationale**: Testing requires code analysis, test creation, and execution
**Special Capabilities**:
- **Bash**: Execute test suites, manage test environments
- **MultiEdit**: Create comprehensive test suites
- **Grep**: Find test gaps and patterns

```typescript
const QA_ARCHITECT_TOOLS = [
  'Read',      // Analyze code for testing
  'Write',     // Create test files
  'Edit',      // Modify existing tests
  'MultiEdit', // Batch test creation
  'Bash',      // Execute test suites
  'Grep',      // Find test patterns
  'Glob',      // Discover test files
  'TodoWrite'  // Track testing progress
];

// Testing framework integration
const QA_TESTING_FRAMEWORKS = [
  'Jest',      // Unit testing
  'Playwright', // E2E testing
  'Cypress',   // E2E testing
  'k6',        // Performance testing
  'TestRail',  // Test management
  'Allure'     // Test reporting
];
```

#### `api-architect`
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Rationale**: API design requires documentation, testing, and validation
**Special Capabilities**:
- **Bash**: Test API endpoints, manage OpenAPI tools
- **Write**: Create API documentation and schemas
- **MultiEdit**: Update multiple API endpoints

```typescript
const API_ARCHITECT_TOOLS = [
  'Read',      // Analyze existing APIs
  'Write',     // Create API documentation
  'Edit',      // Modify API endpoints
  'MultiEdit', // Batch API updates
  'Bash',      // Test APIs, validate schemas
  'Grep',      // Find API patterns
  'Glob',      // Discover API files
  'TodoWrite'  // Track API development
];

// API framework integration
const API_FRAMEWORKS = [
  'OpenAPI/Swagger', // API documentation
  'GraphQL',        // Query language
  'REST',           // API design
  'WebSockets',     // Real-time APIs
  'gRPC'            // High-performance APIs
];
```

#### `architecture-guardian`
**Tools**: ["Read", "Grep", "Glob", "Write", "Edit", "MultiEdit", "Bash", "TodoWrite"]
**Rationale**: Architecture oversight requires comprehensive code analysis and documentation
**Special Capabilities**:
- **Grep/Glob**: Analyze codebase structure and patterns
- **MultiEdit**: Implement architectural changes across files
- **Bash**: Run architecture analysis tools

```typescript
const ARCHITECTURE_GUARDIAN_TOOLS = [
  'Read',      // Analyze system architecture
  'Grep',      // Find architectural patterns
  'Glob',      // Discover system components
  'Write',     // Create architecture docs
  'Edit',      // Modify architectural elements
  'MultiEdit', // Implement structural changes
  'Bash',      // Run analysis tools
  'TodoWrite'  // Track architectural tasks
];

// Architecture principles enforcement
const ARCHITECTURE_PRINCIPLES = [
  'SOLID',                    // Design principles
  'DDD',                     // Domain-driven design
  'Clean Architecture',       // Layered architecture
  'Microservices',           // Service architecture
  'Event-Driven Architecture' // Event-based systems
];
```

#### `frontend-architect`
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Rationale**: Frontend architecture requires component analysis, performance testing, and optimization
**Special Capabilities**:
- **Bash**: Build optimization, performance testing
- **Grep**: Find component patterns and issues
- **MultiEdit**: Implement architectural changes

```typescript
const FRONTEND_ARCHITECT_TOOLS = [
  'Read',      // Analyze components
  'Write',     // Create component docs
  'Edit',      // Optimize components
  'MultiEdit', // Batch component updates
  'Bash',      // Build and test
  'Grep',      // Find patterns
  'Glob',      // Discover components
  'TodoWrite'  // Track frontend tasks
];

// Frontend framework optimization
const FRONTEND_FRAMEWORKS = [
  'Next.js 14+',  // React framework
  'React 18+',    // Component library
  'Tailwind CSS', // Styling framework
  'shadcn/ui',    // Component system
  'Radix UI'      // Primitive components
];

// Performance targets
const FRONTEND_TARGETS = [
  'Core Web Vitals',    // Google performance metrics
  '95+ Lighthouse',     // Performance score
  'sub_2s_load_times'   // Loading performance
];
```

#### `database-architect`
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Rationale**: Database work requires schema analysis, migration management, and performance testing
**Special Capabilities**:
- **Bash**: Run database commands, migrations, performance tests
- **Write**: Create migration files and documentation
- **MultiEdit**: Update multiple schema files

```typescript
const DATABASE_ARCHITECT_TOOLS = [
  'Read',      // Analyze schemas
  'Write',     // Create migrations
  'Edit',      // Modify schemas
  'MultiEdit', // Batch schema updates
  'Bash',      // DB operations
  'Grep',      // Find DB patterns
  'Glob',      // Discover DB files
  'TodoWrite'  // Track DB tasks
];

// Database framework integration
const DATABASE_FRAMEWORKS = [
  'PostgreSQL 15+',    // Primary database
  'Prisma ORM',        // Database toolkit
  'Redis',             // Caching layer
  'Database Migrations' // Schema management
];

// Performance targets
const DATABASE_TARGETS = [
  '100K+ concurrent users', // Scalability
  'sub_100ms_queries',     // Query performance
  '99.99% uptime'          // Reliability
];
```

### ☁️ INFRASTRUCTURE SPECIALISTS

#### `devops-engineer`
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Rationale**: Infrastructure management requires comprehensive system access and automation
**Special Capabilities**:
- **Bash**: Primary tool for infrastructure operations
- **Write**: Create infrastructure as code
- **MultiEdit**: Update configurations across environments

```typescript
const DEVOPS_ENGINEER_TOOLS = [
  'Read',      // Analyze configs
  'Write',     // Create IaC files
  'Edit',      // Modify deployments
  'MultiEdit', // Batch config updates
  'Bash',      // Primary operations tool
  'Grep',      // Find config patterns
  'Glob',      // Discover config files
  'TodoWrite'  // Track deployments
];

// DevOps framework integration
const DEVOPS_FRAMEWORKS = [
  'AWS',           // Cloud platform
  'Kubernetes',    // Container orchestration
  'Docker',        // Containerization
  'Terraform',     // Infrastructure as code
  'GitHub Actions', // CI/CD
  'Prometheus'     // Monitoring
];

// SLA targets
const DEVOPS_TARGETS = [
  '99.99% uptime',    // Reliability
  'RTO < 1 hour',     // Recovery time
  'RPO < 15 minutes'  // Recovery point
];
```

#### `security-architect`
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Rationale**: Security requires code analysis, penetration testing, and compliance documentation
**Special Capabilities**:
- **Bash**: Run security scanning tools
- **Grep**: Find security vulnerabilities and patterns
- **Write**: Create security documentation and policies

```typescript
const SECURITY_ARCHITECT_TOOLS = [
  'Read',      // Analyze security
  'Write',     // Create security docs
  'Edit',      // Fix vulnerabilities
  'MultiEdit', // Batch security fixes
  'Bash',      // Security tools
  'Grep',      // Find vulnerabilities
  'Glob',      // Security file discovery
  'TodoWrite'  // Track security tasks
];

// Security framework integration
const SECURITY_FRAMEWORKS = [
  'OWASP',     // Security standards
  'NIST',      // Security framework
  'ISO 27001', // Security management
  'GDPR',      // Data protection
  'SOC2'       // Security controls
];

// Security standards
const SECURITY_STANDARDS = [
  'Zero Trust',         // Security architecture
  'Defense in Depth',   // Layered security
  'Least Privilege',    // Access control
  'Security by Design'  // Secure development
];
```

#### `performance-engineer`
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Rationale**: Performance optimization requires benchmarking, profiling, and code analysis
**Special Capabilities**:
- **Bash**: Run performance tests and profiling tools
- **Grep**: Find performance bottlenecks
- **Write**: Create performance documentation and reports

```typescript
const PERFORMANCE_ENGINEER_TOOLS = [
  'Read',      // Analyze performance
  'Write',     // Create reports
  'Edit',      // Optimize code
  'MultiEdit', // Batch optimizations
  'Bash',      // Performance tools
  'Grep',      // Find bottlenecks
  'Glob',      // Discover perf files
  'TodoWrite'  // Track optimizations
];

// Performance framework integration
const PERFORMANCE_FRAMEWORKS = [
  'Lighthouse',   // Web performance
  'WebPageTest',  // Performance testing
  'New Relic',    // APM monitoring
  'DataDog',      // Performance monitoring
  'Redis',        // Caching
  'CDN'           // Content delivery
];

// Performance targets
const PERFORMANCE_TARGETS = [
  'sub_100ms_response',      // API performance
  'Core Web Vitals green',   // Web performance
  '95+ Lighthouse scores'    // Overall performance
];
```

## Tool Optimization Patterns

### Workflow-Based Tool Selection

```typescript
interface ToolWorkflow {
  name: string;
  tools: string[];
  sequence: string[];
  parallelizable: boolean;
  estimatedTime: string;
}

const COMMON_WORKFLOWS: Record<string, ToolWorkflow[]> = {
  'design-fixer': [
    {
      name: 'accessibility_audit',
      tools: ['Read', 'Bash', 'Grep', 'Edit', 'TodoWrite'],
      sequence: ['Read', 'Bash', 'Grep', 'Edit', 'TodoWrite'],
      parallelizable: false,
      estimatedTime: '5-10 minutes'
    },
    {
      name: 'design_system_compliance',
      tools: ['Read', 'Grep', 'MultiEdit', 'Write'],
      sequence: ['Read', 'Grep', 'MultiEdit', 'Write'],
      parallelizable: true,
      estimatedTime: '3-7 minutes'
    }
  ],
  
  'performance-engineer': [
    {
      name: 'performance_analysis',
      tools: ['Read', 'Bash', 'Grep', 'Write', 'TodoWrite'],
      sequence: ['Read', 'Bash', 'Grep', 'Write', 'TodoWrite'],
      parallelizable: false,
      estimatedTime: '10-15 minutes'
    },
    {
      name: 'optimization_implementation',
      tools: ['Read', 'Edit', 'MultiEdit', 'Bash'],
      sequence: ['Read', 'Edit', 'MultiEdit', 'Bash'],
      parallelizable: true,
      estimatedTime: '15-30 minutes'
    }
  ]
};
```

### Tool Safety and Restrictions

```typescript
interface ToolRestrictions {
  agent: string;
  tool: string;
  restrictions: string[];
  safetyLevel: 'low' | 'medium' | 'high' | 'critical';
}

const TOOL_RESTRICTIONS: ToolRestrictions[] = [
  {
    agent: 'design-fixer',
    tool: 'Bash',
    restrictions: [
      'Only accessibility and performance testing tools',
      'No system modifications',
      'Read-only operations for security'
    ],
    safetyLevel: 'medium'
  },
  {
    agent: 'security-architect',
    tool: 'Bash',
    restrictions: [
      'Security scanning tools only',
      'No destructive operations',
      'Audit trail required for all actions'
    ],
    safetyLevel: 'critical'
  },
  {
    agent: 'database-architect',
    tool: 'Bash',
    restrictions: [
      'Database operations in development only',
      'Backup verification before migrations',
      'Transaction rollback capability required'
    ],
    safetyLevel: 'critical'
  }
];
```

### Tool Performance Optimization

```typescript
interface ToolPerformance {
  tool: string;
  averageExecutionTime: number; // ms
  memoryUsage: number; // MB
  cpuIntensive: boolean;
  cacheable: boolean;
  parallelizable: boolean;
}

const TOOL_PERFORMANCE_MATRIX: ToolPerformance[] = [
  {
    tool: 'Read',
    averageExecutionTime: 50,
    memoryUsage: 5,
    cpuIntensive: false,
    cacheable: true,
    parallelizable: true
  },
  {
    tool: 'Grep',
    averageExecutionTime: 200,
    memoryUsage: 15,
    cpuIntensive: true,
    cacheable: true,
    parallelizable: true
  },
  {
    tool: 'Bash',
    averageExecutionTime: 2000,
    memoryUsage: 50,
    cpuIntensive: true,
    cacheable: false,
    parallelizable: false
  },
  {
    tool: 'MultiEdit',
    averageExecutionTime: 500,
    memoryUsage: 25,
    cpuIntensive: false,
    cacheable: false,
    parallelizable: false
  }
];
```

## Quality Standards

### Tool Access Validation
- Each agent must demonstrate proficiency with assigned tools
- Tool combinations must support complete workflows
- No redundant tool access without justification
- Security-sensitive tools require additional validation

### Performance Requirements
- Tool execution time <2 seconds for simple operations
- Memory usage <100MB per agent instance  
- CPU usage <30% average per agent
- Parallel tool execution where possible

### Safety Protocols
- No destructive operations without user confirmation
- Audit trail for all system-modifying operations
- Rollback capability for critical operations
- Restricted access to production environments

This comprehensive tool access matrix ensures each specialized sub-agent has optimal tool access for maximum efficiency while maintaining system security and reliability.