# SUBAGENT_ROUTER.md - Intelligent Routing Algorithm

Advanced routing system for automatic sub-agent selection and task delegation in Claude Code SuperClaude framework.

## Core Routing Algorithm

### Primary Routing Function

```typescript
interface TaskContext {
  fileChanges?: string[];
  fileCount: number;
  directoryCount: number;
  domains: string[];
  complexity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  structuralChanges: boolean;
  performanceIssues: boolean;
  securityConcerns: boolean;
}

interface RoutingResult {
  subagentType: string;
  confidence: number;
  reasoning: string;
  proactive: boolean;
  fallback?: string;
}

function routeTaskToSubagent(taskDescription: string, context: TaskContext): RoutingResult {
  // Step 1: Check for proactive triggers (highest priority)
  const proactiveResult = checkProactiveTriggers(context);
  if (proactiveResult.confidence > 0.9) {
    return proactiveResult;
  }

  // Step 2: Domain analysis and complexity scoring
  const domains = analyzeDomains(taskDescription, context);
  const complexity = calculateComplexity(taskDescription, context);
  const toolsNeeded = analyzeRequiredTools(taskDescription);

  // Step 3: Multi-factor intelligent selection
  return intelligentSubagentSelection({
    taskDescription,
    domains,
    complexity,
    toolsNeeded,
    context,
    proactiveResult
  });
}
```

### Proactive Trigger Detection

```typescript
function checkProactiveTriggers(context: TaskContext): RoutingResult {
  const triggers: Array<{type: string, confidence: number, agent: string}> = [];

  // UI/Design file changes
  if (context.fileChanges?.some(f => /\.(tsx|jsx|css|scss|vue)$/.test(f))) {
    triggers.push({
      type: 'ui_changes',
      confidence: 0.95,
      agent: 'design-fixer'
    });
  }

  // Architecture structural changes
  if (context.structuralChanges || 
      context.fileChanges?.some(f => f.includes('src/app/') || f.includes('src/components/'))) {
    triggers.push({
      type: 'architecture_changes',
      confidence: 0.92,
      agent: 'architecture-guardian'
    });
  }

  // Database schema changes
  if (context.fileChanges?.some(f => f.includes('schema.prisma') || f.includes('migrations'))) {
    triggers.push({
      type: 'database_changes',
      confidence: 0.98,
      agent: 'database-architect'
    });
  }

  // Performance issues
  if (context.performanceIssues) {
    triggers.push({
      type: 'performance_issues',
      confidence: 0.90,
      agent: 'performance-engineer'
    });
  }

  // Security concerns
  if (context.securityConcerns || 
      context.fileChanges?.some(f => f.includes('auth') || f.includes('security'))) {
    triggers.push({
      type: 'security_issues',
      confidence: 0.93,
      agent: 'security-architect'
    });
  }

  // Return highest confidence trigger
  if (triggers.length > 0) {
    const topTrigger = triggers.sort((a, b) => b.confidence - a.confidence)[0];
    return {
      subagentType: topTrigger.agent,
      confidence: topTrigger.confidence,
      reasoning: `Proactive activation due to ${topTrigger.type}`,
      proactive: true
    };
  }

  return { subagentType: '', confidence: 0, reasoning: '', proactive: false };
}
```

### Domain Analysis Engine

```typescript
interface DomainPattern {
  keywords: string[];
  filePatterns: RegExp[];
  contextIndicators: string[];
  confidenceThreshold: number;
  weight: number;
}

const DOMAIN_PATTERNS: Record<string, DomainPattern> = {
  design: {
    keywords: ['ui', 'component', 'design', 'responsive', 'accessibility', 'figma', 'css', 'tailwind', 'styling', 'layout'],
    filePatterns: [/\.(tsx|jsx|css|scss|vue|html)$/, /components\//, /styles\//],
    contextIndicators: ['user interface', 'visual design', 'user experience', 'mobile responsive'],
    confidenceThreshold: 0.7,
    weight: 1.0
  },
  
  architecture: {
    keywords: ['architecture', 'system', 'design patterns', 'structure', 'scalability', 'framework', 'modules'],
    filePatterns: [/src\/app\//, /src\/components\//, /src\/lib\//, /config\./],
    contextIndicators: ['system design', 'code structure', 'architectural patterns', 'scalability'],
    confidenceThreshold: 0.75,
    weight: 1.2
  },
  
  database: {
    keywords: ['database', 'schema', 'migration', 'prisma', 'postgresql', 'query', 'orm', 'sql'],
    filePatterns: [/schema\.prisma/, /migrations\//, /\.sql$/, /database\//],
    contextIndicators: ['data model', 'database design', 'data persistence', 'schema changes'],
    confidenceThreshold: 0.8,
    weight: 1.1
  },
  
  security: {
    keywords: ['security', 'auth', 'authentication', 'authorization', 'jwt', 'vulnerability', 'encryption', 'compliance'],
    filePatterns: [/auth/, /security/, /\.(pem|key)$/, /middleware\/auth/],
    contextIndicators: ['user security', 'data protection', 'access control', 'vulnerability'],
    confidenceThreshold: 0.8,
    weight: 1.3
  },
  
  performance: {
    keywords: ['performance', 'optimization', 'speed', 'cache', 'bottleneck', 'latency', 'throughput'],
    filePatterns: [/\.config\./, /webpack\./, /next\.config/, /performance/],
    contextIndicators: ['speed optimization', 'performance tuning', 'load time', 'response time'],
    confidenceThreshold: 0.75,
    weight: 1.1
  },
  
  testing: {
    keywords: ['test', 'testing', 'qa', 'coverage', 'e2e', 'unit', 'integration', 'cypress', 'playwright'],
    filePatterns: [/\.(test|spec)\./, /cypress\//, /playwright\//, /__tests__/],
    contextIndicators: ['test automation', 'quality assurance', 'test coverage', 'testing strategy'],
    confidenceThreshold: 0.8,
    weight: 1.0
  },
  
  api: {
    keywords: ['api', 'rest', 'graphql', 'endpoint', 'microservice', 'webhook', 'integration'],
    filePatterns: [/pages\/api\//, /app\/api\//, /\.api\./, /endpoints/],
    contextIndicators: ['api design', 'service integration', 'data exchange', 'web services'],
    confidenceThreshold: 0.75,
    weight: 1.1
  },
  
  infrastructure: {
    keywords: ['deploy', 'docker', 'cicd', 'kubernetes', 'aws', 'infrastructure', 'devops', 'deployment'],
    filePatterns: [/Dockerfile/, /\.(yml|yaml)$/, /\.github\//, /terraform/],
    contextIndicators: ['deployment', 'infrastructure', 'devops', 'cloud services'],
    confidenceThreshold: 0.8,
    weight: 1.2
  }
};

function analyzeDomains(taskDescription: string, context: TaskContext): Array<{domain: string, confidence: number}> {
  const results: Array<{domain: string, confidence: number}> = [];
  const taskLower = taskDescription.toLowerCase();
  
  for (const [domainName, pattern] of Object.entries(DOMAIN_PATTERNS)) {
    let score = 0;
    
    // Keyword matching (40% weight)
    const keywordMatches = pattern.keywords.filter(keyword => 
      taskLower.includes(keyword.toLowerCase())
    ).length;
    score += (keywordMatches / pattern.keywords.length) * 0.4 * pattern.weight;
    
    // File pattern matching (30% weight)
    if (context.fileChanges) {
      const fileMatches = context.fileChanges.filter(file =>
        pattern.filePatterns.some(regex => regex.test(file))
      ).length;
      score += (fileMatches / (context.fileChanges.length || 1)) * 0.3 * pattern.weight;
    }
    
    // Context indicator matching (30% weight)
    const contextMatches = pattern.contextIndicators.filter(indicator =>
      taskLower.includes(indicator.toLowerCase())
    ).length;
    score += (contextMatches / pattern.contextIndicators.length) * 0.3 * pattern.weight;
    
    // Apply confidence threshold
    if (score >= pattern.confidenceThreshold) {
      results.push({
        domain: domainName,
        confidence: Math.min(score, 1.0)
      });
    }
  }
  
  return results.sort((a, b) => b.confidence - a.confidence);
}
```

### Complexity Calculation

```typescript
interface ComplexityFactors {
  wordCount: number;
  fileScope: number;
  domainCount: number;
  technicalKeywords: number;
  urgencyLevel: number;
  structuralImpact: number;
}

function calculateComplexity(taskDescription: string, context: TaskContext): number {
  const factors: ComplexityFactors = {
    wordCount: 0,
    fileScope: 0,
    domainCount: 0,
    technicalKeywords: 0,
    urgencyLevel: 0,
    structuralImpact: 0
  };
  
  // Word count complexity (max 0.2)
  const wordCount = taskDescription.split(' ').length;
  factors.wordCount = Math.min(wordCount / 200, 0.2);
  
  // File scope complexity (max 0.25)
  if (context.fileCount > 100) factors.fileScope = 0.25;
  else if (context.fileCount > 50) factors.fileScope = 0.2;
  else if (context.fileCount > 20) factors.fileScope = 0.15;
  else if (context.fileCount > 10) factors.fileScope = 0.1;
  else factors.fileScope = 0.05;
  
  // Domain complexity (max 0.2)
  factors.domainCount = Math.min(context.domains.length * 0.05, 0.2);
  
  // Technical keyword complexity (max 0.15)
  const complexityKeywords = [
    'system-wide', 'architecture', 'comprehensive', 'enterprise',
    'migration', 'refactor', 'optimization', 'security audit',
    'performance tuning', 'scalability', 'microservices',
    'real-time', 'distributed', 'async', 'concurrent'
  ];
  
  const keywordMatches = complexityKeywords.filter(keyword =>
    taskDescription.toLowerCase().includes(keyword)
  ).length;
  factors.technicalKeywords = Math.min(keywordMatches * 0.03, 0.15);
  
  // Urgency level complexity (max 0.1)
  const urgencyMap = { low: 0.02, medium: 0.05, high: 0.08, critical: 0.1 };
  factors.urgencyLevel = urgencyMap[context.urgency] || 0.05;
  
  // Structural impact complexity (max 0.1)
  if (context.structuralChanges) factors.structuralImpact = 0.1;
  else if (context.fileChanges?.some(f => f.includes('src/app/'))) factors.structuralImpact = 0.07;
  else factors.structuralImpact = 0.02;
  
  // Calculate total complexity
  const totalComplexity = Object.values(factors).reduce((sum, value) => sum + value, 0);
  return Math.min(totalComplexity, 1.0);
}
```

### Intelligent Agent Selection

```typescript
interface SelectionParams {
  taskDescription: string;
  domains: Array<{domain: string, confidence: number}>;
  complexity: number;
  toolsNeeded: string[];
  context: TaskContext;
  proactiveResult: RoutingResult;
}

function intelligentSubagentSelection(params: SelectionParams): RoutingResult {
  const { domains, complexity, context, proactiveResult } = params;
  
  // If proactive trigger exists but below threshold, consider it as a factor
  let baseConfidence = 0;
  let selectedAgent = '';
  let reasoning = '';
  
  if (domains.length === 0) {
    return {
      subagentType: 'general-purpose',
      confidence: 0.6,
      reasoning: 'No specific domain detected, using general-purpose agent',
      proactive: false,
      fallback: 'general-purpose'
    };
  }
  
  const primaryDomain = domains[0];
  
  // Domain-specific routing with complexity adjustment
  const domainRoutes: Record<string, (complexity: number, context: TaskContext) => RoutingResult> = {
    design: (complexity, context) => routeDesignSpecialist(complexity, context),
    architecture: () => ({
      subagentType: 'architecture-guardian',
      confidence: Math.min(0.85 + complexity * 0.1, 0.95),
      reasoning: `Architecture domain with complexity ${complexity.toFixed(2)}`,
      proactive: false
    }),
    database: () => ({
      subagentType: 'database-architect',
      confidence: Math.min(0.88 + complexity * 0.1, 0.97),
      reasoning: `Database domain with complexity ${complexity.toFixed(2)}`,
      proactive: false
    }),
    security: () => ({
      subagentType: 'security-architect',
      confidence: Math.min(0.90 + complexity * 0.08, 0.98),
      reasoning: `Security domain with complexity ${complexity.toFixed(2)}`,
      proactive: false
    }),
    performance: () => ({
      subagentType: 'performance-engineer',
      confidence: Math.min(0.85 + complexity * 0.1, 0.95),
      reasoning: `Performance domain with complexity ${complexity.toFixed(2)}`,
      proactive: false
    }),
    testing: () => ({
      subagentType: 'qa-architect',
      confidence: Math.min(0.87 + complexity * 0.08, 0.95),
      reasoning: `Testing domain with complexity ${complexity.toFixed(2)}`,
      proactive: false
    }),
    api: () => ({
      subagentType: 'api-architect',
      confidence: Math.min(0.86 + complexity * 0.09, 0.95),
      reasoning: `API domain with complexity ${complexity.toFixed(2)}`,
      proactive: false
    }),
    infrastructure: () => ({
      subagentType: 'devops-engineer',
      confidence: Math.min(0.88 + complexity * 0.1, 0.97),
      reasoning: `Infrastructure domain with complexity ${complexity.toFixed(2)}`,
      proactive: false
    })
  };
  
  const routeFunction = domainRoutes[primaryDomain.domain];
  if (routeFunction) {
    const result = routeFunction(complexity, context);
    // Factor in proactive trigger if it exists
    if (proactiveResult.confidence > 0.5 && 
        proactiveResult.subagentType === result.subagentType) {
      result.confidence = Math.min(result.confidence + 0.1, 0.98);
      result.reasoning += ' (reinforced by proactive trigger)';
    }
    return result;
  }
  
  // Fallback to general purpose
  return {
    subagentType: 'general-purpose',
    confidence: 0.5,
    reasoning: `Unmatched domain ${primaryDomain.domain}, using general-purpose agent`,
    proactive: false,
    fallback: 'general-purpose'
  };
}

function routeDesignSpecialist(complexity: number, context: TaskContext): RoutingResult {
  // Check for scraping/analysis patterns
  if (context.domains.includes('site_analysis') || 
      context.domains.includes('pattern_extraction')) {
    return {
      subagentType: 'design-scraper',
      confidence: Math.min(0.92 + complexity * 0.06, 0.98),
      reasoning: 'Design analysis and pattern extraction required',
      proactive: false
    };
  }
  
  // Check for audit/accessibility focus
  if (context.domains.includes('accessibility') ||
      context.domains.includes('audit') ||
      context.fileChanges?.length > 0) {
    return {
      subagentType: 'design-fixer',
      confidence: Math.min(0.89 + complexity * 0.08, 0.97),
      reasoning: 'Design audit and accessibility compliance needed',
      proactive: false
    };
  }
  
  // Default to world-class-designer for creation tasks
  return {
    subagentType: 'world-class-designer',
    confidence: Math.min(0.85 + complexity * 0.1, 0.95),
    reasoning: 'Creative design work and component creation',
    proactive: false
  };
}
```

### Tool Analysis Engine

```typescript
function analyzeRequiredTools(taskDescription: string): string[] {
  const toolPatterns: Record<string, RegExp[]> = {
    'Read': [/read|view|examine|inspect|analyze existing/i],
    'Write': [/create|write|generate|build new/i],
    'Edit': [/modify|update|change|fix|refactor/i],
    'MultiEdit': [/multiple files|batch edit|systematic changes/i],
    'Grep': [/search|find|locate|pattern/i],
    'Glob': [/files matching|file patterns|directory scan/i],
    'Bash': [/install|run|execute|command|script/i],
    'WebFetch': [/fetch|scrape|analyze website|get from url/i],
    'Task': [/complex|multi-step|delegate|coordinate/i]
  };
  
  const requiredTools: string[] = [];
  
  for (const [tool, patterns] of Object.entries(toolPatterns)) {
    if (patterns.some(pattern => pattern.test(taskDescription))) {
      requiredTools.push(tool);
    }
  }
  
  return requiredTools;
}
```

## Routing Decision Matrix

| Domain | Primary Agent | Secondary Agent | Conditions | Confidence |
|--------|---------------|-----------------|------------|------------|
| Design + Creation | world-class-designer | design-fixer | New components, design systems | 0.90-0.95 |
| Design + Analysis | design-scraper | world-class-designer | Site analysis, pattern extraction | 0.92-0.98 |
| Design + Audit | design-fixer | world-class-designer | Accessibility, compliance | 0.89-0.97 |
| Architecture | architecture-guardian | frontend-architect | System changes, patterns | 0.85-0.95 |
| Database | database-architect | architecture-guardian | Schema, performance, data | 0.88-0.97 |
| Security | security-architect | architecture-guardian | Auth, vulnerabilities, compliance | 0.90-0.98 |
| Performance | performance-engineer | database-architect | Optimization, bottlenecks | 0.85-0.95 |
| Testing | qa-architect | performance-engineer | Test strategy, automation | 0.87-0.95 |
| API | api-architect | security-architect | Endpoints, integration | 0.86-0.95 |
| Infrastructure | devops-engineer | security-architect | Deploy, CI/CD, monitoring | 0.88-0.97 |
| Multi-domain | architecture-guardian | domain-specific | 3+ domains, high complexity | 0.75-0.85 |
| Unknown | general-purpose | - | No clear domain match | 0.50-0.60 |

## Quality Metrics

### Routing Accuracy Targets
- **Domain Detection**: >95% accuracy for single-domain tasks
- **Multi-domain Routing**: >85% accuracy for complex tasks
- **Proactive Activation**: >98% accuracy for trigger detection
- **Tool Prediction**: >90% accuracy for required tools

### Performance Targets
- **Routing Decision**: <50ms for simple tasks, <200ms for complex
- **Domain Analysis**: <100ms for standard patterns
- **Complexity Calculation**: <10ms for all scenarios
- **Memory Usage**: <10MB for routing engine

### Fallback Strategies
- **Domain Uncertainty**: Route to general-purpose with explanation
- **Agent Unavailable**: Use secondary agent from matrix
- **High Complexity**: Route to architecture-guardian for coordination
- **Tool Conflicts**: Prioritize by agent specialization and tool access