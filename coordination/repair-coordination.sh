#!/bin/bash

# Multi-Claude Coordination Repair Script
#
# This script repairs corrupted coordination state, recovers from failures,
# and performs maintenance tasks to ensure system health.

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
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="$COORDINATION_DIR/repair.log"

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

# Diagnose coordination system
diagnose_system() {
    echo -e "${PURPLE}🔍 SYSTEM DIAGNOSIS${NC}"
    echo "==================="
    
    local issues=0
    
    # Check directory structure
    info "Checking directory structure..."
    
    local required_dirs=(
        "$ORCHESTRATION_DIR"
        "$ORCHESTRATION_DIR/locks"
        "$COORDINATION_DIR/agent-workspaces/blue-agent"
        "$COORDINATION_DIR/agent-workspaces/green-agent" 
        "$COORDINATION_DIR/agent-workspaces/red-agent"
        "$COORDINATION_DIR/shared-context"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            error "Missing directory: $dir"
            ((issues++))
        else
            success "Directory exists: $dir"
        fi
    done
    
    # Check coordination files
    info "Checking coordination files..."
    
    local event_log="$ORCHESTRATION_DIR/event-log.jsonl"
    local task_queue="$ORCHESTRATION_DIR/task-queue.json"
    local agent_registry="$ORCHESTRATION_DIR/agent-registry.json"
    
    # Event log
    if [[ ! -f "$event_log" ]]; then
        warning "Event log missing: $event_log"
        ((issues++))
    elif [[ ! -r "$event_log" ]]; then
        error "Event log not readable: $event_log"
        ((issues++))
    else
        local event_count=$(wc -l < "$event_log" 2>/dev/null || echo "0")
        success "Event log: $event_count events"
        
        # Check for corrupted events
        local corrupted_events=0
        while IFS= read -r line; do
            if [[ -n "$line" ]]; then
                if ! echo "$line" | python3 -c "import json, sys; json.load(sys.stdin)" >/dev/null 2>&1; then
                    ((corrupted_events++))
                fi
            fi
        done < "$event_log"
        
        if [[ $corrupted_events -gt 0 ]]; then
            warning "Found $corrupted_events corrupted events in log"
            ((issues++))
        fi
    fi
    
    # Task queue
    if [[ ! -f "$task_queue" ]]; then
        warning "Task queue missing: $task_queue"
        ((issues++))
    elif ! python3 -c "import json; json.load(open('$task_queue'))" >/dev/null 2>&1; then
        error "Task queue corrupted: $task_queue"
        ((issues++))
    else
        local task_count=$(python3 -c "
import json
with open('$task_queue') as f:
    data = json.load(f)
print(len(data.get('tasks', {})))
" 2>/dev/null || echo "0")
        success "Task queue: $task_count tasks"
    fi
    
    # Agent registry
    if [[ ! -f "$agent_registry" ]]; then
        warning "Agent registry missing: $agent_registry"
        ((issues++))
    elif ! python3 -c "import json; json.load(open('$agent_registry'))" >/dev/null 2>&1; then
        error "Agent registry corrupted: $agent_registry"
        ((issues++))
    else
        local agent_count=$(python3 -c "
import json
with open('$agent_registry') as f:
    data = json.load(f)
print(len(data.get('agents', {})))
" 2>/dev/null || echo "0")
        success "Agent registry: $agent_count agents"
    fi
    
    # Check agent configurations
    info "Checking agent configurations..."
    
    local agent_configs=(
        "$COORDINATION_DIR/agent-workspaces/blue-agent/CLAUDE.md"
        "$COORDINATION_DIR/agent-workspaces/green-agent/CLAUDE.md"
        "$COORDINATION_DIR/agent-workspaces/red-agent/CLAUDE.md"
    )
    
    for config in "${agent_configs[@]}"; do
        if [[ ! -f "$config" ]]; then
            error "Missing agent config: $config"
            ((issues++))
        else
            success "Agent config exists: $(basename $(dirname $config))"
        fi
    done
    
    # Check file permissions
    info "Checking file permissions..."
    
    local coordination_perms=$(stat -c %a "$COORDINATION_DIR" 2>/dev/null || stat -f %A "$COORDINATION_DIR" 2>/dev/null || echo "unknown")
    if [[ "$coordination_perms" != "700" ]] && [[ "$coordination_perms" != "unknown" ]]; then
        warning "Coordination directory permissions: $coordination_perms (should be 700)"
        ((issues++))
    fi
    
    # Summary
    echo
    if [[ $issues -eq 0 ]]; then
        success "System diagnosis complete: No issues found"
        return 0
    else
        warning "System diagnosis complete: $issues issues found"
        return $issues
    fi
}

# Repair directory structure
repair_directories() {
    info "Repairing directory structure..."
    
    # Create missing directories
    mkdir -p "$ORCHESTRATION_DIR/locks"
    mkdir -p "$COORDINATION_DIR/agent-workspaces/blue-agent"
    mkdir -p "$COORDINATION_DIR/agent-workspaces/green-agent"
    mkdir -p "$COORDINATION_DIR/agent-workspaces/red-agent"
    mkdir -p "$COORDINATION_DIR/shared-context"
    mkdir -p "$COORDINATION_DIR/backups"
    mkdir -p "$COORDINATION_DIR/logs"
    
    # Set correct permissions
    chmod 700 "$COORDINATION_DIR"
    chmod -R 700 "$COORDINATION_DIR/orchestration"
    chmod -R 700 "$COORDINATION_DIR/agent-workspaces"
    
    success "Directory structure repaired"
}

# Repair coordination files
repair_coordination_files() {
    info "Repairing coordination files..."
    
    # Create backup of current files
    local backup_dir="$COORDINATION_DIR/backups/repair-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    for file in event-log.jsonl task-queue.json agent-registry.json; do
        local filepath="$ORCHESTRATION_DIR/$file"
        if [[ -f "$filepath" ]]; then
            cp "$filepath" "$backup_dir/" || warning "Failed to backup $file"
        fi
    done
    
    info "Created backup: $backup_dir"
    
    # Repair using coordination protocol
    cd "$ORCHESTRATION_DIR"
    python3 -c "
from coordination_protocol import CoordinationProtocol
import os

try:
    protocol = CoordinationProtocol('$COORDINATION_DIR')
    
    # Repair coordination state from event log
    success = protocol.repair_coordination_state()
    
    if success:
        print('✅ Coordination state repaired successfully')
    else:
        print('❌ Failed to repair coordination state')
        exit(1)
        
except Exception as e:
    print(f'❌ Error during repair: {e}')
    exit(1)
"
    
    if [[ $? -eq 0 ]]; then
        success "Coordination files repaired"
    else
        error "Failed to repair coordination files"
        return 1
    fi
}

# Clean orphaned resources
clean_orphaned_resources() {
    info "Cleaning orphaned resources..."
    
    # Clean old lock files
    find "$ORCHESTRATION_DIR/locks" -name "*.lock" -mtime +1 -delete 2>/dev/null || true
    
    # Clean temporary files
    find "$COORDINATION_DIR" -name "*.tmp.*" -delete 2>/dev/null || true
    
    # Clean old backups (keep last 10)
    if [[ -d "$COORDINATION_DIR/backups" ]]; then
        ls -1t "$COORDINATION_DIR/backups" | tail -n +11 | while read -r old_backup; do
            if [[ -d "$COORDINATION_DIR/backups/$old_backup" ]]; then
                rm -rf "$COORDINATION_DIR/backups/$old_backup"
                info "Removed old backup: $old_backup"
            fi
        done
    fi
    
    # Clean old logs (keep last 30 days)
    find "$COORDINATION_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    success "Orphaned resources cleaned"
}

# Validate repaired state
validate_state() {
    info "Validating repaired state..."
    
    # Test coordination protocol
    cd "$ORCHESTRATION_DIR"
    python3 -c "
from coordination_protocol import CoordinationProtocol
import json

try:
    protocol = CoordinationProtocol('$COORDINATION_DIR')
    
    # Test basic operations
    print('Testing coordination protocol...')
    
    # Test task creation
    task_id = protocol.create_task('test', 'System validation test', priority=3)
    print(f'✅ Task creation: {task_id}')
    
    # Test task queue reading
    with open(protocol.task_queue_path) as f:
        queue_data = json.load(f)
    
    if task_id in queue_data['tasks']:
        print('✅ Task queue: readable and consistent')
    else:
        print('❌ Task queue: inconsistent state')
        exit(1)
    
    # Test agent registry
    with open(protocol.agent_registry_path) as f:
        registry_data = json.load(f)
    
    print('✅ Agent registry: readable')
    
    # Test event log
    with open(protocol.event_log_path) as f:
        event_count = sum(1 for line in f if line.strip())
    
    print(f'✅ Event log: {event_count} events')
    
    print('✅ All validation tests passed')
    
except Exception as e:
    print(f'❌ Validation failed: {e}')
    exit(1)
"
    
    if [[ $? -eq 0 ]]; then
        success "State validation passed"
        return 0
    else
        error "State validation failed"
        return 1
    fi
}

# Performance optimization
optimize_system() {
    info "Performing system optimization..."
    
    # Compress old event logs
    local event_log="$ORCHESTRATION_DIR/event-log.jsonl"
    if [[ -f "$event_log" ]]; then
        local event_count=$(wc -l < "$event_log")
        if [[ $event_count -gt 10000 ]]; then
            warning "Event log has $event_count events, consider archiving"
            
            # Create compressed archive of old events
            local archive_file="$COORDINATION_DIR/logs/events-$(date +%Y%m%d-%H%M%S).jsonl.gz"
            gzip -c "$event_log" > "$archive_file" || warning "Failed to archive events"
            
            # Keep only recent events (last 1000)
            tail -1000 "$event_log" > "$event_log.tmp"
            mv "$event_log.tmp" "$event_log"
            
            info "Archived old events to: $archive_file"
        fi
    fi
    
    # Optimize file permissions for performance
    find "$COORDINATION_DIR" -type f -exec chmod 600 {} \\; 2>/dev/null || true
    find "$COORDINATION_DIR" -type d -exec chmod 700 {} \\; 2>/dev/null || true
    
    success "System optimization complete"
}

# Emergency recovery
emergency_recovery() {
    warning "EMERGENCY RECOVERY MODE"
    echo "======================"
    
    info "This will reset the coordination system to a clean state"
    info "All current tasks and agent state will be lost"
    echo
    read -p "Are you sure you want to continue? (type 'RESET' to confirm): " -r
    
    if [[ "$REPLY" != "RESET" ]]; then
        info "Emergency recovery cancelled"
        return 0
    fi
    
    # Create emergency backup
    local emergency_backup="$COORDINATION_DIR/backups/emergency-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$emergency_backup"
    
    cp -r "$ORCHESTRATION_DIR" "$emergency_backup/" 2>/dev/null || warning "Partial backup created"
    info "Emergency backup created: $emergency_backup"
    
    # Reset coordination system
    rm -f "$ORCHESTRATION_DIR/event-log.jsonl"
    rm -f "$ORCHESTRATION_DIR/task-queue.json"
    rm -f "$ORCHESTRATION_DIR/agent-registry.json"
    rm -rf "$ORCHESTRATION_DIR/locks"
    
    # Reinitialize
    repair_directories
    repair_coordination_files
    
    success "Emergency recovery complete"
    warning "System has been reset to clean state"
}

# Main repair menu
main_menu() {
    while true; do
        echo
        echo -e "${BLUE}🔧 COORDINATION REPAIR MENU${NC}"
        echo "==========================="
        echo "1. Diagnose System"
        echo "2. Repair All Issues"
        echo "3. Repair Directories"
        echo "4. Repair Coordination Files"
        echo "5. Clean Orphaned Resources"
        echo "6. Validate State"
        echo "7. Optimize System"
        echo "8. Emergency Recovery"
        echo "9. Exit"
        echo
        
        read -p "Select option (1-9): " choice
        
        case $choice in
            1) diagnose_system; read -p "Press Enter to continue..." ;;
            2) repair_all; read -p "Press Enter to continue..." ;;
            3) repair_directories; read -p "Press Enter to continue..." ;;
            4) repair_coordination_files; read -p "Press Enter to continue..." ;;
            5) clean_orphaned_resources; read -p "Press Enter to continue..." ;;
            6) validate_state; read -p "Press Enter to continue..." ;;
            7) optimize_system; read -p "Press Enter to continue..." ;;
            8) emergency_recovery; read -p "Press Enter to continue..." ;;
            9) echo "Goodbye!"; exit 0 ;;
            *) echo -e "${RED}Invalid option. Please try again.${NC}" ;;
        esac
    done
}

# Repair all issues
repair_all() {
    echo -e "${PURPLE}🔧 COMPREHENSIVE REPAIR${NC}"
    echo "======================="
    
    log "Starting comprehensive repair..."
    
    # Stop orchestrator if running
    if pgrep -f "orchestrator.py" > /dev/null; then
        warning "Orchestrator is running, please stop it first"
        read -p "Stop orchestrator now? (y/N): " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            "$SCRIPT_DIR/stop-orchestrator.sh" --force
        else
            error "Cannot repair while orchestrator is running"
            return 1
        fi
    fi
    
    repair_directories
    repair_coordination_files
    clean_orphaned_resources
    
    if validate_state; then
        optimize_system
        success "Comprehensive repair completed successfully"
    else
        error "Repair completed but validation failed"
        return 1
    fi
}

# Main execution
main() {
    # Handle command line arguments
    case "${1:-}" in
        --diagnose|-d)
            diagnose_system
            ;;
        --repair-all|-a)
            repair_all
            ;;
        --repair-dirs)
            repair_directories
            ;;
        --repair-files)
            repair_coordination_files
            ;;
        --clean)
            clean_orphaned_resources
            ;;
        --validate|-v)
            validate_state
            ;;
        --optimize|-o)
            optimize_system
            ;;
        --emergency)
            emergency_recovery
            ;;
        --help|-h)
            echo "Usage: $0 [OPTION]"
            echo
            echo "Options:"
            echo "  -d, --diagnose      Diagnose system issues"
            echo "  -a, --repair-all    Repair all detected issues"
            echo "  --repair-dirs       Repair directory structure only"
            echo "  --repair-files      Repair coordination files only"
            echo "  --clean             Clean orphaned resources only"
            echo "  -v, --validate      Validate system state"
            echo "  -o, --optimize      Optimize system performance"
            echo "  --emergency         Emergency recovery (resets system)"
            echo "  -h, --help          Show this help message"
            echo
            echo "Interactive mode (no arguments):"
            echo "  Run without arguments for interactive menu"
            exit 0
            ;;
        "")
            # Interactive mode
            clear
            echo -e "${BLUE}🔧 Multi-Claude Coordination Repair${NC}"
            echo "==================================="
            echo "$(date '+%Y-%m-%d %H:%M:%S')"
            echo
            main_menu
            ;;
        *)
            error "Unknown option: $1"
            echo "Use --help for available options"
            exit 1
            ;;
    esac
}

# Trap signals
trap 'error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"