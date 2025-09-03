#!/bin/bash

# Multi-Claude Orchestrator Monitoring Script
#
# This script provides real-time monitoring of the multi-agent system
# including agent status, task queue, performance metrics, and health checks.

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
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if orchestrator is running
check_orchestrator() {
    local pid_file="$COORDINATION_DIR/orchestrator.pid"
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0  # Running
        fi
    fi
    return 1  # Not running
}

# Get system status from orchestrator
get_system_status() {
    if ! check_orchestrator; then
        echo "❌ Orchestrator not running"
        return 1
    fi
    
    cd "$ORCHESTRATION_DIR"
    python3 -c "
import json
from orchestrator import MultiClaudeOrchestrator

try:
    orchestrator = MultiClaudeOrchestrator('$PROJECT_DIR')
    status = orchestrator.get_system_status()
    print(json.dumps(status, indent=2))
except Exception as e:
    print(f'Error: {e}')
    exit(1)
"
}

# Display agent status
show_agent_status() {
    echo -e "${BLUE}🤖 AGENT STATUS${NC}"
    echo "================="
    
    local status_json=$(get_system_status 2>/dev/null)
    
    if [[ $? -eq 0 ]] && [[ -n "$status_json" ]]; then
        echo "$status_json" | python3 -c "
import json
import sys

try:
    status = json.load(sys.stdin)
    agents = status['agents']
    
    for agent_type, info in agents.items():
        emoji = {'blue': '🔵', 'green': '🟢', 'red': '🔴'}[agent_type]
        active = info['active']
        total = info['total']
        max_agents = info['max']
        
        status_color = '\\033[0;32m' if active > 0 else '\\033[1;33m'  # Green if active, yellow if none
        print(f'{emoji} {agent_type.upper()} Agent: {status_color}{active}/{max_agents} active{chr(27)}[0m ({total} total)')
        
        if agent_type == 'red' and active == 0:
            print('   🔴 Red agents start on-demand for critical tasks')

except Exception as e:
    print(f'Error parsing agent status: {e}')
"
    else
        echo -e "${RED}❌ Unable to get agent status${NC}"
    fi
}

# Display task queue status
show_task_status() {
    echo
    echo -e "${PURPLE}📋 TASK QUEUE STATUS${NC}"
    echo "===================="
    
    local status_json=$(get_system_status 2>/dev/null)
    
    if [[ $? -eq 0 ]] && [[ -n "$status_json" ]]; then
        echo "$status_json" | python3 -c "
import json
import sys

try:
    status = json.load(sys.stdin)
    pending_tasks = status['pending_tasks']
    
    total_tasks = sum(pending_tasks.values())
    if total_tasks == 0:
        print('✅ No pending tasks')
    else:
        for agent_type, count in pending_tasks.items():
            if count > 0:
                emoji = {'blue': '🔵', 'green': '🟢', 'red': '🔴'}[agent_type]
                priority_emoji = '🔴' if agent_type == 'red' else '🟡'
                print(f'{emoji} {agent_type.upper()}: {priority_emoji} {count} pending tasks')
    
    print(f'\\nTotal: {total_tasks} pending tasks')

except Exception as e:
    print(f'Error parsing task status: {e}')
"
    else
        echo -e "${RED}❌ Unable to get task status${NC}"
    fi
}

# Display coordination health
show_coordination_health() {
    echo
    echo -e "${CYAN}🏥 COORDINATION HEALTH${NC}"
    echo "======================"
    
    # Check coordination files
    local event_log="$ORCHESTRATION_DIR/event-log.jsonl"
    local task_queue="$ORCHESTRATION_DIR/task-queue.json"
    local agent_registry="$ORCHESTRATION_DIR/agent-registry.json"
    
    if [[ -f "$event_log" ]]; then
        local event_count=$(wc -l < "$event_log" 2>/dev/null || echo "0")
        echo -e "📝 Event Log: ${GREEN}✅ $event_count events${NC}"
    else
        echo -e "📝 Event Log: ${RED}❌ Missing${NC}"
    fi
    
    if [[ -f "$task_queue" ]]; then
        echo -e "📋 Task Queue: ${GREEN}✅ Present${NC}"
    else
        echo -e "📋 Task Queue: ${RED}❌ Missing${NC}"
    fi
    
    if [[ -f "$agent_registry" ]]; then
        echo -e "🤖 Agent Registry: ${GREEN}✅ Present${NC}"
    else
        echo -e "🤖 Agent Registry: ${RED}❌ Missing${NC}"
    fi
    
    # Check coordination system health
    local status_json=$(get_system_status 2>/dev/null)
    if [[ $? -eq 0 ]] && [[ -n "$status_json" ]]; then
        local coordination_healthy=$(echo "$status_json" | python3 -c "
import json
import sys
try:
    status = json.load(sys.stdin)
    print('true' if status.get('coordination_healthy', False) else 'false')
except:
    print('false')
")
        
        if [[ "$coordination_healthy" == "true" ]]; then
            echo -e "🔗 Coordination: ${GREEN}✅ Healthy${NC}"
        else
            echo -e "🔗 Coordination: ${RED}❌ Unhealthy${NC}"
        fi
    fi
}

# Display recent events
show_recent_events() {
    echo
    echo -e "${YELLOW}📊 RECENT EVENTS (Last 10)${NC}"
    echo "==========================="
    
    local event_log="$ORCHESTRATION_DIR/event-log.jsonl"
    
    if [[ -f "$event_log" ]] && [[ -s "$event_log" ]]; then
        tail -10 "$event_log" | python3 -c "
import json
import sys
from datetime import datetime

for line in sys.stdin:
    try:
        event = json.loads(line.strip())
        timestamp = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00'))
        time_str = timestamp.strftime('%H:%M:%S')
        
        event_type = event['type']
        event_emoji = {
            'task_created': '📋',
            'task_assigned': '👤',
            'task_updated': '🔄',
            'agent_registered': '🤖',
            'agent_heartbeat': '💓'
        }.get(event_type, '📝')
        
        print(f'{event_emoji} {time_str} - {event_type}')
        
        # Show relevant data
        if event_type == 'task_created':
            data = event['data']
            print(f'   Task: {data.get(\"description\", \"Unknown\")[:50]}...')
        elif event_type == 'task_assigned':
            data = event['data']
            print(f'   Agent: {data.get(\"agent_id\", \"Unknown\")}')
        elif event_type == 'agent_registered':
            data = event['data']
            agent_type = data.get('type', 'unknown')
            emoji = {'blue': '🔵', 'green': '🟢', 'red': '🔴'}.get(agent_type, '🤖')
            print(f'   {emoji} {agent_type} agent: {data.get(\"id\", \"Unknown\")}')
        
    except Exception as e:
        print(f'Error parsing event: {e}')
"
    else
        echo "No events recorded yet"
    fi
}

# Display system performance
show_performance() {
    echo
    echo -e "${GREEN}⚡ SYSTEM PERFORMANCE${NC}"
    echo "===================="
    
    # CPU and Memory usage
    if command -v ps &> /dev/null; then
        local orchestrator_pid_file="$COORDINATION_DIR/orchestrator.pid"
        if [[ -f "$orchestrator_pid_file" ]]; then
            local orchestrator_pid=$(cat "$orchestrator_pid_file")
            if ps -p "$orchestrator_pid" > /dev/null 2>&1; then
                local cpu_mem=$(ps -p "$orchestrator_pid" -o %cpu,%mem --no-headers 2>/dev/null || echo "N/A N/A")
                echo "🖥️  Orchestrator: CPU ${cpu_mem% *}%, Memory ${cpu_mem#* }%"
            fi
        fi
    fi
    
    # Claude Code processes
    local claude_processes=$(ps aux | grep -c "[c]laude code" 2>/dev/null || echo "0")
    echo "🤖 Claude Processes: $claude_processes active"
    
    # Disk usage
    if command -v du &> /dev/null; then
        local coordination_size=$(du -sh "$COORDINATION_DIR" 2>/dev/null | cut -f1)
        echo "💾 Coordination Data: $coordination_size"
    fi
}

# Live monitoring mode
live_monitor() {
    echo -e "${CYAN}🔄 LIVE MONITORING MODE${NC}"
    echo "Press Ctrl+C to exit"
    echo
    
    while true; do
        clear
        echo -e "${CYAN}Multi-Claude Orchestrator - Live Monitor${NC}"
        echo "$(date '+%Y-%m-%d %H:%M:%S')"
        echo "========================================"
        
        show_agent_status
        show_task_status
        show_coordination_health
        show_performance
        
        echo
        echo -e "${YELLOW}Refreshing in 5 seconds...${NC}"
        
        sleep 5
    done
}

# Main menu
show_menu() {
    echo
    echo -e "${BLUE}📊 MONITORING OPTIONS${NC}"
    echo "==================="
    echo "1. Agent Status"
    echo "2. Task Queue"
    echo "3. Coordination Health" 
    echo "4. Recent Events"
    echo "5. Performance"
    echo "6. Full Status"
    echo "7. Live Monitor"
    echo "8. Exit"
    echo
}

# Full status report
full_status() {
    clear
    echo -e "${CYAN}Multi-Claude Orchestrator - Full Status Report${NC}"
    echo "$(date '+%Y-%m-%d %H:%M:%S')"
    echo "==============================================="
    
    show_agent_status
    show_task_status  
    show_coordination_health
    show_recent_events
    show_performance
}

# Main execution
main() {
    # Handle command line arguments
    case "${1:-}" in
        --live|-l)
            live_monitor
            ;;
        --status|-s)
            full_status
            ;;
        --agents|-a)
            show_agent_status
            ;;
        --tasks|-t)
            show_task_status
            ;;
        --health|-h)
            show_coordination_health
            ;;
        --events|-e)
            show_recent_events
            ;;
        --performance|-p)
            show_performance
            ;;
        --help)
            echo "Usage: $0 [OPTION]"
            echo
            echo "Options:"
            echo "  -l, --live         Live monitoring mode"
            echo "  -s, --status       Full status report"
            echo "  -a, --agents       Agent status only"
            echo "  -t, --tasks        Task queue status only"
            echo "  -h, --health       Coordination health only"
            echo "  -e, --events       Recent events only"
            echo "  -p, --performance  Performance metrics only"
            echo "  --help             Show this help message"
            echo
            echo "Interactive mode (no arguments):"
            echo "  Run without arguments for interactive menu"
            exit 0
            ;;
        "")
            # Interactive mode
            while true; do
                show_menu
                read -p "Select option (1-8): " choice
                case $choice in
                    1) clear; show_agent_status; read -p "Press Enter to continue..." ;;
                    2) clear; show_task_status; read -p "Press Enter to continue..." ;;
                    3) clear; show_coordination_health; read -p "Press Enter to continue..." ;;
                    4) clear; show_recent_events; read -p "Press Enter to continue..." ;;
                    5) clear; show_performance; read -p "Press Enter to continue..." ;;
                    6) full_status; read -p "Press Enter to continue..." ;;
                    7) live_monitor ;;
                    8) echo "Goodbye!"; exit 0 ;;
                    *) echo -e "${RED}Invalid option. Please try again.${NC}" ;;
                esac
            done
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for available options"
            exit 1
            ;;
    esac
}

# Trap Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}Monitoring stopped.${NC}"; exit 0' INT

# Run main function
main "$@"