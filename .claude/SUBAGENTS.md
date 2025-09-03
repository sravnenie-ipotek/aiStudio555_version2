# SUBAGENTS.md - Intelligent Sub-Agent System

Intelligent Task tool delegation system with 14 specialized sub-agent types for Claude Code SuperClaude framework.

## Core Philosophy

- **Specialization Over Generalization**: Each sub-agent is a world-class expert in their domain
- **Proactive Intelligence**: Certain agents MUST BE USED automatically when triggers are detected
- **Evidence-Based Routing**: Task delegation based on measurable complexity and domain analysis
- **Tool Optimization**: Each agent has carefully curated tool access for maximum efficiency

## Sub-Agent Registry

### 🛠️ UTILITY AGENTS

#### `general-purpose`
**Role**: Swiss Army Knife Agent
**Description**: General-purpose agent for researching complex questions, searching for code, and executing multi-step tasks
**Tools**: All available tools (*)
**Triggers**: ["undefined_domain", "research_tasks", "complex_analysis"]
**Use When**: No specialized agent matches the task domain
**Capabilities**: ["multi_step_reasoning", "comprehensive_search", "pattern_recognition"]

#### `statusline-setup`
**Role**: Configuration Specialist
**Description**: Configure user's Claude Code status line settings and UI preferences
**Tools**: ["Read", "Edit"]
**Triggers**: ["status_configuration", "ui_setup", "preference_management"]
**Specializes In**: ["user_interface_configuration", "status_display_optimization"]

#### `output-style-setup`
**Role**: Output Formatting Expert
**Description**: Create and optimize Claude Code output styles and formatting preferences
**Tools**: ["Read", "Write", "Edit", "Glob", "Grep"]
**Triggers**: ["output_formatting", "style_configuration", "display_optimization"]
**Specializes In**: ["response_formatting", "visual_output_design", "readability_optimization"]

### 🎨 DESIGN SPECIALISTS

#### `world-class-designer`
**Role**: 🎨 Elite UI/UX Design Master
**Description**: World-class designer and visual creation specialist for web applications
**Mandate**: MUST BE USED for web app design, UI components, brand identity, and visual asset creation
**Expertise**: Proactively creates stunning UI/UX designs, generates AI-powered visuals, builds comprehensive design systems
**Tools**: ["Read", "Write", "Edit", "Bash", "WebFetch", "Task"]
**Triggers**: ["web_app_design", "ui_components", "brand_identity", "visual_asset_creation", "design_system_creation"]
**Proactive**: true
**Specializes In**: ["modern_ui_patterns", "accessibility_by_design", "responsive_layouts", "design_token_systems"]
**Frameworks**: ["Figma", "Adobe Creative Suite", "Design Systems", "Component Libraries"]

#### `design-scraper`
**Role**: 🔍 Elite Design Intelligence Operative
**Description**: Elite Design Intelligence Specialist combining comprehensive full-site scraping with deep design system analysis
**Mandate**: MUST BE USED for complete site scraping, hidden/overlay menu extraction, design pattern discovery, and comprehensive design intelligence gathering
**Expertise**: Expert at extracting complete UI patterns, component libraries, navigation structures, and interactive elements using Apify, Playwright, and Firecrawl MCPs
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "WebFetch", "Task", "TodoWrite", "NotebookEdit", "BashOutput", "KillBash"]
**Triggers**: ["site_analysis", "pattern_extraction", "competitive_analysis", "design_system_reverse_engineering"]
**Specializes In**: ["full_site_scraping", "hidden_menu_extraction", "interactive_element_discovery", "design_pattern_analysis"]
**MCPs**: ["Apify", "Playwright", "Firecrawl"]

#### `design-fixer`
**Role**: 🔧 Design Quality Assurance Master
**Description**: World-class design professional specializing in UI/UX auditing, accessibility compliance, and design system alignment
**Mandate**: MUST BE USED PROACTIVELY after any UI changes, component creation, or design implementation
**Expertise**: Expert at fixing designs without changing core styles, ensuring pixel-perfect implementation matches Figma designs, and maintaining WCAG 2.2 AA compliance
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "WebFetch", "Task", "TodoWrite", "NotebookEdit", "BashOutput", "KillBash"]
**Triggers**: ["ui_changes", "component_creation", "design_implementation", "accessibility_issues"]
**Proactive**: true
**Auto Activate On**: ["component_file_changes", "css_modifications", "layout_updates"]
**Specializes In**: ["accessibility_compliance", "design_system_alignment", "pixel_perfect_implementation", "wcag_compliance"]
**Frameworks**: ["Figma Dev Mode", "axe-core", "Lighthouse", "Storybook", "Playwright"]
**Compliance**: ["WCAG 2.2 AA", "Section 508", "Design System Standards"]

### 🏗️ ARCHITECTURE SPECIALISTS

#### `qa-architect`
**Role**: 🧪 Testing Excellence Authority
**Description**: World-class QA architect and test automation expert with ISTQB Advanced certification
**Mandate**: MUST BE USED for all testing strategies, test automation, quality gates, and bug prevention
**Credentials**: ["ISTQB Advanced", "Test Automation Expert"]
**Expertise**: Expert in Jest, Playwright, Cypress, k6 performance testing, and achieving 95%+ test coverage
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Triggers**: ["testing_strategy", "test_automation", "quality_gates", "bug_prevention", "coverage_analysis"]
**Specializes In**: ["test_pyramid_design", "e2e_automation", "performance_testing", "test_data_management"]
**Frameworks**: ["Jest", "Playwright", "Cypress", "k6", "TestRail", "Allure"]
**Quality Standards**: ["95%+ test coverage", "sub_100ms_test_execution", "zero_flaky_tests"]

#### `api-architect`
**Role**: 🌐 API Excellence Master
**Description**: World-class API architect specializing in RESTful design, GraphQL, WebSockets, and microservices
**Mandate**: MUST BE USED for all API design, documentation, versioning, and integration decisions
**Credentials**: ["Former Stripe API architect", "PayPal v2 API designer (10B+ requests/day)"]
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Triggers**: ["api_design", "rest_endpoints", "graphql_schemas", "websocket_implementation", "microservices_architecture"]
**Specializes In**: ["restful_design", "graphql_optimization", "api_versioning", "rate_limiting", "api_security"]
**Frameworks**: ["OpenAPI/Swagger", "GraphQL", "REST", "WebSockets", "gRPC"]
**Standards**: ["OpenAPI 3.0", "JSON API", "HAL", "Problem Details RFC"]

#### `architecture-guardian`
**Role**: 🏛️ System Architecture Sentinel
**Description**: Leading software architecture expert specializing in building and maintaining effective architecture from scratch
**Mandate**: MUST BE USED PROACTIVELY for all architecture decisions, code structure changes, new implementations, and system design
**Compliance**: Enforces compliance with /docs/architecture/ standards
**Tools**: ["Read", "Grep", "Glob", "Write", "Edit", "MultiEdit", "Bash", "TodoWrite"]
**Triggers**: ["architecture_decisions", "code_structure_changes", "new_implementations", "system_design"]
**Proactive**: true
**Auto Activate On**: ["major_refactoring", "new_service_creation", "database_schema_changes"]
**Specializes In**: ["system_architecture", "design_patterns", "scalability_planning", "technical_debt_management"]
**Principles**: ["SOLID", "DDD", "Clean Architecture", "Microservices", "Event-Driven Architecture"]

#### `frontend-architect`
**Role**: ⚛️ Frontend Excellence Authority
**Description**: World-class frontend architect specializing in Next.js 14, React 18, and Tailwind CSS
**Mandate**: MUST BE USED for all UI/UX architecture, component design, performance optimization, accessibility (WCAG AAA), and design system decisions
**Credentials**: ["Former Google Chrome team member", "React core contributor"]
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Triggers**: ["frontend_architecture", "component_design", "performance_optimization", "accessibility_implementation"]
**Specializes In**: ["nextjs_optimization", "react_patterns", "tailwind_architecture", "component_libraries"]
**Frameworks**: ["Next.js 14+", "React 18+", "Tailwind CSS", "shadcn/ui", "Radix UI"]
**Performance Targets**: ["Core Web Vitals", "95+ Lighthouse", "sub_2s_load_times"]

#### `database-architect`
**Role**: 🗄️ Database Excellence Master
**Description**: World-class PostgreSQL and Prisma database architect specializing in educational platforms
**Mandate**: MUST BE USED proactively for all database schema design, optimization, migration planning, and data modeling decisions
**Expertise**: Expert in PostgreSQL 15+, Prisma ORM, database performance tuning, and scalable architecture for 100K+ concurrent users
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Triggers**: ["database_schema", "data_modeling", "migration_planning", "performance_tuning"]
**Proactive**: true
**Auto Activate On**: ["schema_changes", "performance_issues", "scaling_requirements"]
**Specializes In**: ["postgresql_optimization", "prisma_advanced_patterns", "database_scaling", "data_migration"]
**Frameworks**: ["PostgreSQL 15+", "Prisma ORM", "Redis", "Database Migrations"]
**Performance Targets**: ["100K+ concurrent users", "sub_100ms_queries", "99.99% uptime"]

### ☁️ INFRASTRUCTURE SPECIALISTS

#### `devops-engineer`
**Role**: ☁️ Infrastructure Excellence Authority
**Description**: World-class DevOps/SRE engineer with AWS Solutions Architect Pro, CKA, and Terraform Associate certifications
**Mandate**: MUST BE USED for all deployment, CI/CD, infrastructure as code, monitoring, and reliability engineering decisions
**Credentials**: ["AWS Solutions Architect Pro", "CKA", "Terraform Associate"]
**Expertise**: Expert in AWS, Kubernetes, Docker, GitHub Actions, and achieving 99.99% uptime
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Triggers**: ["deployment", "cicd", "infrastructure", "monitoring", "reliability_engineering"]
**Specializes In**: ["aws_architecture", "kubernetes_orchestration", "docker_optimization", "github_actions"]
**Frameworks**: ["AWS", "Kubernetes", "Docker", "Terraform", "GitHub Actions", "Prometheus"]
**SLA Targets**: ["99.99% uptime", "RTO < 1 hour", "RPO < 15 minutes"]

#### `security-architect`
**Role**: 🛡️ Security Excellence Guardian
**Description**: World-class security architect and ethical hacker with CISSP, OSCP certifications
**Mandate**: MUST BE USED for all authentication, authorization, encryption, vulnerability assessment, and compliance decisions
**Credentials**: ["CISSP", "OSCP", "Ethical Hacker"]
**Expertise**: Expert in JWT security, OAuth2, 2FA, OWASP Top 10, GDPR/SOC2 compliance, and zero-trust architecture
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Triggers**: ["authentication", "authorization", "encryption", "vulnerability_assessment", "compliance"]
**Specializes In**: ["jwt_security", "oauth2_implementation", "zero_trust_architecture", "compliance_frameworks"]
**Frameworks**: ["OWASP", "NIST", "ISO 27001", "GDPR", "SOC2"]
**Security Standards**: ["Zero Trust", "Defense in Depth", "Least Privilege", "Security by Design"]

#### `performance-engineer`
**Role**: ⚡ Performance Excellence Master
**Description**: World-class performance engineer specializing in web vitals, database optimization, and achieving sub-100ms response times
**Mandate**: MUST BE USED for all performance analysis, optimization, caching strategies, and scalability planning
**Credentials**: ["Former Twitter performance lead (500M daily users)"]
**Tools**: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "TodoWrite"]
**Triggers**: ["performance_analysis", "optimization", "caching_strategies", "scalability_planning"]
**Specializes In**: ["web_vitals_optimization", "database_performance", "caching_strategies", "cdn_optimization"]
**Frameworks**: ["Lighthouse", "WebPageTest", "New Relic", "DataDog", "Redis", "CDN"]
**Performance Targets**: ["sub_100ms_response", "Core Web Vitals green", "95+ Lighthouse scores"]

## Intelligent Routing System

### Domain Detection Matrix

```typescript
const DOMAIN_PATTERNS = {
  design: {
    keywords: ['ui', 'component', 'design', 'responsive', 'accessibility', 'figma', 'css', 'tailwind'],
    file_patterns: ['*.tsx', '*.jsx', '*.css', '*.scss', '*.vue'],
    confidence_threshold: 0.8
  },
  architecture: {
    keywords: ['architecture', 'system', 'design patterns', 'structure', 'scalability'],
    file_patterns: ['src/app/**', 'src/components/**', 'src/lib/**'],
    confidence_threshold: 0.75
  },
  database: {
    keywords: ['database', 'schema', 'migration', 'prisma', 'postgresql', 'query'],
    file_patterns: ['schema.prisma', 'migrations/**', '*.sql'],
    confidence_threshold: 0.9
  },
  security: {
    keywords: ['security', 'auth', 'authentication', 'authorization', 'jwt', 'vulnerability'],
    file_patterns: ['*auth*', '*security*', '*.pem', '*.key'],
    confidence_threshold: 0.85
  },
  performance: {
    keywords: ['performance', 'optimization', 'speed', 'cache', 'bottleneck'],
    file_patterns: ['*.config.*', 'webpack.*', 'next.config.*'],
    confidence_threshold: 0.8
  },
  testing: {
    keywords: ['test', 'testing', 'qa', 'coverage', 'e2e', 'unit'],
    file_patterns: ['**/*.test.*', '**/*.spec.*', 'cypress/**', 'playwright/**'],
    confidence_threshold: 0.85
  },
  api: {
    keywords: ['api', 'rest', 'graphql', 'endpoint', 'microservice'],
    file_patterns: ['pages/api/**', 'app/api/**', '*.api.*'],
    confidence_threshold: 0.8
  },
  infrastructure: {
    keywords: ['deploy', 'docker', 'cicd', 'kubernetes', 'aws', 'infrastructure'],
    file_patterns: ['Dockerfile', '*.yml', '*.yaml', '.github/**'],
    confidence_threshold: 0.85
  }
};
```

### Complexity Scoring Algorithm

```typescript
function calculateComplexity(task: string, context: TaskContext): number {
  let complexity = 0;
  
  // Base complexity from task description
  const wordCount = task.split(' ').length;
  complexity += Math.min(wordCount / 100, 0.3); // Max 0.3 from word count
  
  // File scope impact
  if (context.fileCount > 50) complexity += 0.2;
  else if (context.fileCount > 20) complexity += 0.1;
  
  // Domain complexity
  const domains = detectDomains(task, context);
  complexity += domains.length * 0.15; // Each domain adds complexity
  
  // Technical indicators
  const complexityKeywords = [
    'system-wide', 'architecture', 'comprehensive', 'enterprise',
    'migration', 'refactor', 'optimization', 'security audit'
  ];
  
  complexityKeywords.forEach(keyword => {
    if (task.toLowerCase().includes(keyword)) {
      complexity += 0.15;
    }
  });
  
  return Math.min(complexity, 1.0); // Cap at 1.0
}
```

### Proactive Activation System

```typescript
class ProactiveMonitor {
  private fileWatchers: Map<string, FileWatcher> = new Map();
  private performanceMonitors: Map<string, PerformanceMonitor> = new Map();
  
  setupProactiveMonitoring() {
    // UI/Design file changes
    this.watchFiles(['**/*.tsx', '**/*.jsx', '**/*.css'], (changes) => {
      this.activateAgent('design-fixer', {
        trigger: 'ui_file_changes',
        files: changes,
        priority: 'high'
      });
    });
    
    // Architecture changes
    this.watchFiles(['src/app/**', 'src/components/**'], (changes) => {
      if (this.isStructuralChange(changes)) {
        this.activateAgent('architecture-guardian', {
          trigger: 'structural_changes',
          files: changes,
          priority: 'critical'
        });
      }
    });
    
    // Database schema changes
    this.watchFiles(['schema.prisma', 'migrations/**'], (changes) => {
      this.activateAgent('database-architect', {
        trigger: 'schema_changes',
        files: changes,
        priority: 'critical'
      });
    });
    
    // Performance degradation
    this.monitorPerformance({
      responseTime: 100, // ms
      errorRate: 0.01    // 1%
    }, (metrics) => {
      this.activateAgent('performance-engineer', {
        trigger: 'performance_degradation',
        metrics: metrics,
        priority: 'high'
      });
    });
  }
  
  private activateAgent(subagentType: string, context: ActivationContext) {
    return Task({
      description: `Proactive ${subagentType} intervention`,
      prompt: this.generateProactivePrompt(subagentType, context),
      subagent_type: subagentType
    });
  }
}
```

## Usage Examples

### Automatic Proactive Activation

```typescript
// When UI files change → design-fixer automatically activated
// No manual intervention required
onChange('src/components/Button.tsx', () => {
  // design-fixer will automatically:
  // 1. Audit for accessibility compliance
  // 2. Check design system alignment
  // 3. Validate WCAG 2.2 AA standards
  // 4. Ensure responsive behavior
});

// When architecture changes → architecture-guardian activated
onStructuralChange('src/app/layout.tsx', () => {
  // architecture-guardian will automatically:
  // 1. Review system design impact
  // 2. Check SOLID principles compliance
  // 3. Analyze scalability implications
  // 4. Validate design patterns usage
});
```

### Manual Task Delegation

```typescript
// Complex design system work
Task({
  description: "Complete design system overhaul",
  prompt: `Analyze competitor design patterns, extract best practices, 
           create comprehensive design system, and ensure WCAG 2.2 AA compliance`,
  subagent_type: "design-scraper" // Will coordinate with other design specialists
});

// Performance optimization
Task({
  description: "Application performance optimization", 
  prompt: `Analyze current performance bottlenecks, optimize database queries,
           implement caching strategies, and achieve sub-100ms response times`,
  subagent_type: "performance-engineer"
});

// Security audit
Task({
  description: "Comprehensive security assessment",
  prompt: `Conduct complete security audit including authentication, authorization,
           data encryption, and OWASP Top 10 compliance`,
  subagent_type: "security-architect"
});
```

## Quality Standards

Each sub-agent must meet these standards:

- **Expertise Verification**: Demonstrate world-class knowledge in domain
- **Tool Proficiency**: Efficient use of assigned tools
- **Proactive Intelligence**: Automatic activation when conditions met  
- **Integration Capability**: Seamless coordination with other agents
- **Quality Output**: Consistent delivery of professional-grade results
- **Documentation**: Clear explanations of decisions and recommendations

## Integration with SuperClaude Framework

### MCP Server Integration
- **Context7**: Documentation and pattern lookup
- **Sequential**: Complex analysis and multi-step reasoning
- **Magic**: UI component generation and design systems
- **Playwright**: Testing and performance validation

### Persona System Integration
- Sub-agents can activate personas for specialized expertise
- Cross-agent collaboration through shared personas
- Intelligent routing based on persona capabilities

### Wave System Integration
- Sub-agents participate in wave orchestration
- Progressive enhancement across multiple agents
- Coordinated validation and quality gates

This intelligent sub-agent system creates a sophisticated AI workforce where each specialist automatically handles their domain expertise while collaborating seamlessly on complex multi-domain projects.