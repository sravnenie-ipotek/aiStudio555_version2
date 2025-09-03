#!/bin/bash

# Multi-Claude Orchestrator Stop Script
#
# This script gracefully stops the multi-agent orchestration system,
# ensuring all agents complete their current tasks and coordination
# state is properly saved.

set -euo pipefail

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

# Check if orchestrator is running
check_orchestrator() {
    local pid_file="$COORDINATION_DIR/orchestrator.pid"
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "$pid"
            return 0
        else
            # Stale PID file
            rm -f "$pid_file"
            return 1
        fi
    fi
    return 1
}

# Get running agent processes
get_agent_processes() {
    # Find Claude Code processes that might be our agents
    ps aux | grep -E "(claude.*code|coordination)" | grep -v grep | awk '{print $2}' || true
}

# Graceful shutdown
graceful_shutdown() {
    local orchestrator_pid="$1"
    local timeout="${2:-30}"
    
    info "Initiating graceful shutdown..."
    info "Sending TERM signal to orchestrator (PID: $orchestrator_pid)"
    
    # Send SIGTERM for graceful shutdown
    kill -TERM "$orchestrator_pid" 2>/dev/null || {
        warning "Failed to send TERM signal to orchestrator"
        return 1
    }
    
    # Wait for graceful shutdown
    local elapsed=0
    while ps -p "$orchestrator_pid" > /dev/null 2>&1; do
        if [[ $elapsed -ge $timeout ]]; then
            warning "Graceful shutdown timeout after ${timeout}s"
            return 1
        fi
        
        echo -n "."
        sleep 1
        ((elapsed++))
    done
    
    echo
    success "Orchestrator shut down gracefully"
    return 0
}

# Force shutdown
force_shutdown() {
    info "Initiating force shutdown..."
    
    # Get orchestrator PID
    local orchestrator_pid
    orchestrator_pid=$(check_orchestrator) || {
        warning "No running orchestrator found"
        return 0
    }
    
    # Force kill orchestrator
    info "Force killing orchestrator (PID: $orchestrator_pid)"
    kill -KILL "$orchestrator_pid" 2>/dev/null || true
    
    # Find and kill agent processes
    local agent_pids
    agent_pids=$(get_agent_processes)
    
    if [[ -n "$agent_pids" ]]; then
        info "Force killing agent processes..."
        echo "$agent_pids" | while read -r pid; do
            if [[ -n "$pid" ]] && ps -p "$pid" > /dev/null 2>&1; then
                info "  Killing process: $pid"
                kill -KILL "$pid" 2>/dev/null || true
            fi
        done
    fi
    
    success "Force shutdown complete"
}

# Wait for pending tasks to complete
wait_for_tasks() {
    local timeout="${1:-60}"
    
    info "Waiting for pending tasks to complete (timeout: ${timeout}s)..."
    
    local elapsed=0
    while [[ $elapsed -lt $timeout ]]; do
        # Check if there are any in-progress tasks
        local in_progress_count=0
        
        if [[ -f "$ORCHESTRATION_DIR/task-queue.json" ]]; then
            in_progress_count=$(python3 -c "
import json
import sys

try:
    with open('$ORCHESTRATION_DIR/task-queue.json') as f:
        data = json.load(f)
    
    count = 0
    for task in data.get('tasks', {}).values():
        if task.get('status') in ['assigned', 'in_progress']:
            count += 1
    
    print(count)
except:
    print(0)
" 2>/dev/null || echo "0")
        fi
        
        if [[ "$in_progress_count" -eq 0 ]]; then
            success "All tasks completed"
            return 0
        fi
        
        info "  $in_progress_count tasks still in progress..."
        sleep 5
        ((elapsed+=5))
    done
    
    warning "Timeout waiting for tasks to complete"
    return 1
}

# Save coordination state
save_coordination_state() {
    info "Saving coordination state..."
    
    # Create backup of coordination files
    local backup_dir="$COORDINATION_DIR/backups/shutdown-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    if [[ -f "$ORCHESTRATION_DIR/event-log.jsonl" ]]; then
        cp "$ORCHESTRATION_DIR/event-log.jsonl" "$backup_dir/" || warning "Failed to backup event log"
    fi
    
    if [[ -f "$ORCHESTRATION_DIR/task-queue.json" ]]; then
        cp "$ORCHESTRATION_DIR/task-queue.json" "$backup_dir/" || warning "Failed to backup task queue"
    fi
    
    if [[ -f "$ORCHESTRATION_DIR/agent-registry.json" ]]; then
        cp "$ORCHESTRATION_DIR/agent-registry.json" "$backup_dir/" || warning "Failed to backup agent registry"
    fi
    
    # Force rebuild of coordination state to ensure consistency
    cd "$ORCHESTRATION_DIR"
    python3 -c "
from coordination_protocol import CoordinationProtocol
try:
    protocol = CoordinationProtocol('$COORDINATION_DIR')
    protocol.repair_coordination_state()
    print('✅ Coordination state saved and verified')
except Exception as e:
    print(f'⚠️ Warning: {e}')
" || warning "Failed to verify coordination state"
    
    success "Coordination state backup created: $backup_dir"
}

# Cleanup resources
cleanup_resources() {
    info "Cleaning up resources..."
    
    # Remove PID file
    local pid_file="$COORDINATION_DIR/orchestrator.pid"
    if [[ -f "$pid_file" ]]; then
        rm -f "$pid_file"
        success "Removed PID file"
    fi
    
    # Clean up lock files
    if [[ -d "$ORCHESTRATION_DIR/locks" ]]; then
        find "$ORCHESTRATION_DIR/locks" -name "*.lock" -delete 2>/dev/null || true
        success "Cleaned up lock files"
    fi
    
    # Clean up temporary files
    find "$COORDINATION_DIR" -name "*.tmp.*" -delete 2>/dev/null || true
    
    success "Resource cleanup complete"
}

# Show shutdown status
show_status() {
    echo
    echo -e "${BLUE}🛑 SHUTDOWN STATUS${NC}"
    echo "=================="
    
    # Check orchestrator
    if check_orchestrator > /dev/null 2>&1; then
        echo -e "Orchestrator: ${RED}❌ Still running${NC}"
    else
        echo -e "Orchestrator: ${GREEN}✅ Stopped${NC}"
    fi
    
    # Check agent processes
    local agent_count
    agent_count=$(get_agent_processes | wc -l)
    
    if [[ "$agent_count" -gt 0 ]]; then
        echo -e "Agent Processes: ${RED}❌ $agent_count still running${NC}"
    else
        echo -e "Agent Processes: ${GREEN}✅ All stopped${NC}"
    fi
    
    # Check coordination files
    if [[ -f "$ORCHESTRATION_DIR/task-queue.json" ]]; then
        local pending_tasks
        pending_tasks=$(python3 -c "
import json
try:
    with open('$ORCHESTRATION_DIR/task-queue.json') as f:
        data = json.load(f)
    
    count = 0
    for task in data.get('tasks', {}).values():
        if task.get('status') in ['pending', 'assigned', 'in_progress']:
            count += 1
    
    print(count)
except:
    print('unknown')
" 2>/dev/null || echo "unknown")
        
        if [[ "$pending_tasks" == "0" ]]; then
            echo -e "Pending Tasks: ${GREEN}✅ None${NC}"
        else
            echo -e "Pending Tasks: ${YELLOW}⚠️ $pending_tasks remaining${NC}"
        fi
    else
        echo -e "Coordination: ${YELLOW}⚠️ Files not accessible${NC}"
    fi
}

# Main shutdown sequence
main() {
    local force_mode=false
    local wait_for_tasks_mode=true
    local graceful_timeout=30
    local task_timeout=60
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--force)
                force_mode=true
                shift
                ;;
            --no-wait)
                wait_for_tasks_mode=false
                shift
                ;;
            --timeout)
                graceful_timeout="$2"
                shift 2
                ;;
            --task-timeout)
                task_timeout="$2"
                shift 2
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo
                echo "Options:"
                echo "  -f, --force           Force shutdown (kill processes immediately)"
                echo "  --no-wait            Don't wait for tasks to complete"
                echo "  --timeout SECONDS    Graceful shutdown timeout (default: 30)"
                echo "  --task-timeout SEC   Task completion timeout (default: 60)"
                echo "  -h, --help           Show this help message"
                echo
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Show header
    echo -e "${BLUE}🛑 Multi-Claude Orchestrator Shutdown${NC}"
    echo "====================================="
    
    # Check if orchestrator is running
    local orchestrator_pid
    orchestrator_pid=$(check_orchestrator) || {
        info "Orchestrator is not running"
        show_status
        cleanup_resources
        exit 0
    }
    
    log "Starting shutdown sequence for orchestrator PID: $orchestrator_pid"
    
    if [[ "$force_mode" == true ]]; then
        # Force shutdown mode
        warning "Force mode enabled - processes will be killed immediately"
        force_shutdown
    else
        # Graceful shutdown mode
        info "Graceful shutdown mode enabled"
        
        # Wait for tasks to complete if requested
        if [[ "$wait_for_tasks_mode" == true ]]; then
            if ! wait_for_tasks "$task_timeout"; then
                warning "Some tasks did not complete in time"
                read -p "Continue with shutdown anyway? (y/N): " -r
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    info "Shutdown cancelled"
                    exit 0
                fi
            fi
        fi
        
        # Save coordination state before shutdown
        save_coordination_state
        
        # Attempt graceful shutdown
        if ! graceful_shutdown "$orchestrator_pid" "$graceful_timeout"; then
            warning "Graceful shutdown failed, attempting force shutdown..."
            force_shutdown
        fi
    fi
    
    # Cleanup and final status
    cleanup_resources
    show_status
    
    success "Multi-Claude Orchestrator shutdown complete"
    
    echo
    info "To restart the orchestrator, run: ./start-orchestrator.sh"
}

# Trap signals
trap 'error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"