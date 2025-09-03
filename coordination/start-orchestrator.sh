#!/bin/bash

# Multi-Claude Orchestrator Startup Script
# 
# This script starts the multi-Claude orchestration system with proper
# environment setup, safety checks, and monitoring.

set -euo pipefail  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COORDINATION_DIR="$SCRIPT_DIR"
ORCHESTRATION_DIR="$COORDINATION_DIR/orchestration"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="$COORDINATION_DIR/orchestrator.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}ERROR: $*${NC}" | tee -a "$LOG_FILE" >&2
}

warning() {
    echo -e "${YELLOW}WARNING: $*${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $*${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}ℹ️  $*${NC}" | tee -a "$LOG_FILE"
}

# Pre-flight checks
pre_flight_checks() {
    info "Running pre-flight checks..."
    
    # Check Python version
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is required but not installed"
        exit 1
    fi
    
    local python_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
    if [[ "$python_version" < "3.8" ]]; then
        error "Python 3.8+ is required, found $python_version"
        exit 1
    fi
    success "Python version: $python_version"
    
    # Check Claude Code CLI
    if ! command -v claude &> /dev/null; then
        error "Claude Code CLI is required but not found in PATH"
        error "Please install: https://claude.ai/code"
        exit 1
    fi
    success "Claude Code CLI found"
    
    # Check directory structure
    if [[ ! -d "$ORCHESTRATION_DIR" ]]; then
        error "Orchestration directory not found: $ORCHESTRATION_DIR"
        exit 1
    fi
    
    if [[ ! -f "$ORCHESTRATION_DIR/orchestrator.py" ]]; then
        error "Orchestrator script not found: $ORCHESTRATION_DIR/orchestrator.py"
        exit 1
    fi
    success "Directory structure verified"
    
    # Check file permissions
    if [[ ! -x "$ORCHESTRATION_DIR/orchestrator.py" ]]; then
        warning "Making orchestrator.py executable"
        chmod +x "$ORCHESTRATION_DIR/orchestrator.py"
    fi
    
    # Check coordination files
    if [[ ! -f "$COORDINATION_DIR/agent-workspaces/blue-agent/CLAUDE.md" ]]; then
        error "Blue agent configuration missing"
        exit 1
    fi
    
    if [[ ! -f "$COORDINATION_DIR/agent-workspaces/green-agent/CLAUDE.md" ]]; then
        error "Green agent configuration missing"
        exit 1
    fi
    
    if [[ ! -f "$COORDINATION_DIR/agent-workspaces/red-agent/CLAUDE.md" ]]; then
        error "Red agent configuration missing"
        exit 1
    fi
    success "Agent configurations verified"
    
    # Check available system resources
    local available_memory=$(free -m | awk 'NR==2{printf "%.1f", $7/1024}' 2>/dev/null || echo "unknown")
    if [[ "$available_memory" != "unknown" ]] && (( $(echo "$available_memory < 2.0" | bc -l 2>/dev/null || echo 0) )); then
        warning "Low available memory: ${available_memory}GB. Multi-agent system may be resource constrained."
    else
        success "System resources check passed"
    fi
}

# Check if orchestrator is already running
check_running() {
    local pid_file="$COORDINATION_DIR/orchestrator.pid"
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            error "Orchestrator is already running (PID: $pid)"
            info "Use './stop-orchestrator.sh' to stop it first"
            exit 1
        else
            warning "Stale PID file found, removing..."
            rm -f "$pid_file"
        fi
    fi
}

# Setup environment
setup_environment() {
    info "Setting up environment..."
    
    # Create necessary directories
    mkdir -p "$COORDINATION_DIR/logs"
    mkdir -p "$COORDINATION_DIR/orchestration/locks"
    
    # Set proper permissions
    chmod 700 "$COORDINATION_DIR"
    chmod -R 700 "$COORDINATION_DIR/orchestration"
    chmod -R 700 "$COORDINATION_DIR/agent-workspaces"
    
    # Initialize coordination files if they don't exist
    cd "$ORCHESTRATION_DIR"
    python3 -c "
from coordination_protocol import CoordinationProtocol
protocol = CoordinationProtocol('$COORDINATION_DIR')
protocol.repair_coordination_state()
print('✅ Coordination system initialized')
"
    
    success "Environment setup complete"
}

# Start the orchestrator
start_orchestrator() {
    info "Starting Multi-Claude Orchestrator..."
    
    local pid_file="$COORDINATION_DIR/orchestrator.pid"
    
    # Start orchestrator in background
    cd "$ORCHESTRATION_DIR"
    
    if [[ "${1:-}" == "--interactive" ]] || [[ "${1:-}" == "-i" ]]; then
        # Interactive mode
        info "Starting in interactive mode..."
        python3 orchestrator.py --interactive --base-path "$PROJECT_DIR"
    else
        # Daemon mode
        python3 orchestrator.py --base-path "$PROJECT_DIR" >> "$LOG_FILE" 2>&1 &
        local orchestrator_pid=$!
        
        # Save PID
        echo "$orchestrator_pid" > "$pid_file"
        
        # Wait a moment to see if it started successfully
        sleep 3
        
        if ps -p "$orchestrator_pid" > /dev/null 2>&1; then
            success "Orchestrator started successfully (PID: $orchestrator_pid)"
            info "Monitor with: ./monitor-agents.sh"
            info "View logs: tail -f $LOG_FILE"
            info "Stop with: ./stop-orchestrator.sh"
        else
            error "Orchestrator failed to start"
            if [[ -f "$pid_file" ]]; then
                rm -f "$pid_file"
            fi
            exit 1
        fi
    fi
}

# Create example tasks
create_example_tasks() {
    if [[ "${CREATE_EXAMPLE_TASKS:-}" == "true" ]]; then
        info "Creating example tasks..."
        
        sleep 5  # Wait for orchestrator to fully start
        
        cd "$ORCHESTRATION_DIR"
        
        # Create some example tasks
        python3 -c "
from orchestrator import MultiClaudeOrchestrator
import time

orchestrator = MultiClaudeOrchestrator('$PROJECT_DIR')

# Example search task (Blue Agent)
orchestrator.create_task(
    'search',
    'Find authentication patterns in ProjectDes Academy codebase',
    priority=2
)

# Example implementation task (Green Agent)  
orchestrator.create_task(
    'implement',
    'Create user profile component for dashboard',
    priority=2
)

print('✅ Example tasks created')
"
        success "Example tasks created"
    fi
}

# Display system information
show_system_info() {
    echo
    echo "🤖 Multi-Claude Orchestration System"
    echo "=====================================+"
    echo "Project: ProjectDes Academy"
    echo "Base Path: $PROJECT_DIR"
    echo "Coordination: $COORDINATION_DIR"
    echo "Log File: $LOG_FILE"
    echo
    echo "Agent Types:"
    echo "  🔵 Blue Agent  - Search & Discovery (Haiku)"
    echo "  🟢 Green Agent - Code Generation (Sonnet)" 
    echo "  🔴 Red Agent   - Critical Review (Opus)"
    echo
    echo "Management Commands:"
    echo "  ./monitor-agents.sh     - Monitor system status"
    echo "  ./stop-orchestrator.sh  - Graceful shutdown"
    echo "  ./create-task.sh        - Create new tasks"
    echo
}

# Main execution
main() {
    # Handle command line arguments
    local mode="daemon"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -i|--interactive)
                mode="interactive"
                shift
                ;;
            --create-examples)
                export CREATE_EXAMPLE_TASKS="true"
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo
                echo "Options:"
                echo "  -i, --interactive    Start in interactive mode"
                echo "  --create-examples    Create example tasks after startup"
                echo "  -h, --help          Show this help message"
                echo
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Clear screen and show header
    clear
    show_system_info
    
    # Run startup sequence
    log "Starting Multi-Claude Orchestrator..."
    
    pre_flight_checks
    check_running
    setup_environment
    
    if [[ "$mode" == "interactive" ]]; then
        start_orchestrator --interactive
    else
        start_orchestrator
        create_example_tasks
        
        echo
        success "Multi-Claude Orchestrator is now running!"
        echo
        info "Next steps:"
        echo "  1. Monitor status: ./monitor-agents.sh"
        echo "  2. Create tasks: ./create-task.sh"
        echo "  3. View logs: tail -f $LOG_FILE"
        echo
    fi
}

# Trap signals for cleanup
trap 'error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"