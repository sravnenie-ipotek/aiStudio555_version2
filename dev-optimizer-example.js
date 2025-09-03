#!/usr/bin/env node
/**
 * ProjectDes Academy Development Optimizer
 * 
 * Single-agent workflow optimization for enhanced development velocity
 * Replaces complex multi-agent architecture with practical automation
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class DevOptimizer {
    constructor() {
        this.projectRoot = process.cwd();
        this.startTime = Date.now();
        this.operations = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().substr(11, 8);
        const symbols = {
            info: '🔧',
            success: '✅', 
            warning: '⚠️',
            error: '❌',
            performance: '⚡'
        };
        console.log(`${symbols[type]} [${timestamp}] ${message}`);
    }

    async checkEnvironment() {
        this.log('Validating development environment...', 'info');
        
        const checks = [
            { cmd: 'node --version', name: 'Node.js' },
            { cmd: 'pnpm --version', name: 'pnpm' },
            { cmd: 'docker --version', name: 'Docker' }
        ];

        for (const check of checks) {
            try {
                const version = execSync(check.cmd, { encoding: 'utf-8' }).trim();
                this.log(`${check.name}: ${version}`, 'success');
            } catch (error) {
                this.log(`${check.name}: Not found`, 'warning');
            }
        }
    }

    async runParallelOperations(operations) {
        this.log(`Running ${operations.length} operations in parallel...`, 'performance');
        
        const promises = operations.map(op => {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                const process = spawn('pnpm', op.args, {
                    cwd: this.projectRoot,
                    stdio: 'pipe'
                });

                let stdout = '';
                let stderr = '';

                process.stdout.on('data', (data) => stdout += data);
                process.stderr.on('data', (data) => stderr += data);

                process.on('close', (code) => {
                    const duration = Date.now() - startTime;
                    resolve({
                        name: op.name,
                        code,
                        stdout,
                        stderr,
                        duration,
                        success: code === 0
                    });
                });
            });
        });

        const results = await Promise.all(promises);
        
        // Report results
        let totalTime = 0;
        let successCount = 0;
        
        results.forEach(result => {
            totalTime = Math.max(totalTime, result.duration);
            if (result.success) {
                this.log(`${result.name}: ✅ ${result.duration}ms`, 'success');
                successCount++;
            } else {
                this.log(`${result.name}: ❌ ${result.duration}ms`, 'error');
                if (result.stderr) {
                    console.log(result.stderr);
                }
            }
        });

        this.log(`Parallel execution completed: ${successCount}/${results.length} passed in ${totalTime}ms`, 'performance');
        return results;
    }

    async smartTest() {
        this.log('Starting smart test execution...', 'info');
        
        // Analyze changed files (simplified version)
        const operations = [
            { name: 'Type Check', args: ['type-check'] },
            { name: 'Lint', args: ['lint'] },
            { name: 'Unit Tests', args: ['test:unit'] }
        ];

        const results = await this.runParallelOperations(operations);
        
        // If all passed, run integration tests
        if (results.every(r => r.success)) {
            this.log('Running integration tests...', 'info');
            try {
                execSync('pnpm test:integration', { stdio: 'inherit' });
                this.log('All tests passed!', 'success');
            } catch (error) {
                this.log('Integration tests failed', 'error');
            }
        }
    }

    async buildValidated() {
        this.log('Starting validated build process...', 'info');
        
        // Quality gates before build
        const preChecks = [
            { name: 'Lint Check', args: ['lint'] },
            { name: 'Type Check', args: ['type-check'] }
        ];

        const checkResults = await this.runParallelOperations(preChecks);
        
        if (!checkResults.every(r => r.success)) {
            this.log('Pre-build checks failed. Build aborted.', 'error');
            return false;
        }

        // Proceed with build
        this.log('Pre-checks passed. Building...', 'success');
        try {
            execSync('pnpm build', { stdio: 'inherit' });
            this.log('Build completed successfully', 'success');
            
            // Post-build validation
            this.log('Running post-build validation...', 'info');
            // Add bundle analysis, size checks, etc.
            
            return true;
        } catch (error) {
            this.log('Build failed', 'error');
            return false;
        }
    }

    async devOptimized() {
        this.log('Starting optimized development server...', 'info');
        
        // Pre-flight checks
        await this.checkEnvironment();
        
        // Start services in optimal order
        const services = [
            { name: 'Database', cmd: 'docker-compose up -d postgres redis' },
            { name: 'API Server', cmd: 'pnpm dev:api' },
            { name: 'Web Server', cmd: 'pnpm dev:web' }
        ];

        this.log('Starting all services...', 'info');
        
        // Start database first
        try {
            execSync(services[0].cmd, { stdio: 'inherit' });
            this.log('Database services started', 'success');
        } catch (error) {
            this.log('Database startup failed', 'error');
            return;
        }

        // Start API and Web in parallel
        const devProcesses = services.slice(1).map(service => {
            this.log(`Starting ${service.name}...`, 'info');
            return spawn('pnpm', service.cmd.split(' ').slice(1), {
                stdio: 'inherit'
            });
        });

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            this.log('Shutting down services...', 'info');
            devProcesses.forEach(proc => proc.kill('SIGTERM'));
            process.exit(0);
        });
    }

    async qaFull() {
        this.log('Starting comprehensive QA suite...', 'info');
        
        const qaOperations = [
            { name: 'Unit Tests', args: ['test:unit'] },
            { name: 'Integration Tests', args: ['test:integration'] },
            { name: 'Lint Check', args: ['lint'] },
            { name: 'Type Check', args: ['type-check'] }
        ];

        const results = await this.runParallelOperations(qaOperations);
        
        if (results.every(r => r.success)) {
            this.log('Starting E2E tests...', 'info');
            try {
                execSync('pnpm test:e2e', { stdio: 'inherit' });
                this.log('All QA checks passed!', 'success');
            } catch (error) {
                this.log('E2E tests failed', 'error');
            }
        }
        
        // Generate QA report
        this.generateQAReport(results);
    }

    generateQAReport(results) {
        const totalTime = Date.now() - this.startTime;
        const report = {
            timestamp: new Date().toISOString(),
            totalTime: totalTime,
            results: results,
            success: results.every(r => r.success)
        };

        fs.writeFileSync(
            path.join(this.projectRoot, 'qa-report.json'),
            JSON.stringify(report, null, 2)
        );

        this.log(`QA report generated: qa-report.json`, 'success');
    }
}

// CLI Interface
const optimizer = new DevOptimizer();
const command = process.argv[2];

switch (command) {
    case 'dev':
        optimizer.devOptimized();
        break;
    case 'test':
        optimizer.smartTest();
        break;
    case 'build':
        optimizer.buildValidated();
        break;
    case 'qa':
        optimizer.qaFull();
        break;
    default:
        console.log(`
🔧 ProjectDes Academy Development Optimizer

Usage:
  node scripts/dev-optimizer.js <command>

Commands:
  dev     Start optimized development environment
  test    Run smart test suite with parallel execution
  build   Run validated build with quality gates  
  qa      Run comprehensive QA suite

Examples:
  node scripts/dev-optimizer.js dev    # Start dev with all services
  node scripts/dev-optimizer.js test   # Run smart tests
  node scripts/dev-optimizer.js build  # Validated build
  node scripts/dev-optimizer.js qa     # Full QA suite
        `);
}