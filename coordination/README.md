# Multi-Claude Orchestration System

## ⚠️ CRITICAL SAFETY PROTOCOLS

This system implements file-based coordination between multiple Claude Code instances using event-sourcing and atomic operations to prevent race conditions.

## Architecture Overview

```
/coordination/
├── orchestration/
│   ├── event-log.jsonl          # Append-only event store (CRITICAL)
│   ├── task-queue.json          # Current task state (derived from events)
│   ├── agent-registry.json      # Active agent tracking
│   └── locks/                   # File-based locking mechanism
├── shared-context/
│   ├── project-state.md         # Read-only project status
│   ├── requirements.md          # Consolidated requirements
│   └── architecture.md          # System architecture notes
└── agent-workspaces/
    ├── blue-agent/              # Search & Discovery (Haiku)
    ├── green-agent/             # Code Generation (Sonnet)
    └── red-agent/               # Critical Review (Opus)
```

## Safety Guarantees

1. **Atomic Operations**: All coordination updates use atomic file operations
2. **Event Sourcing**: Complete audit trail of all agent interactions
3. **Process Isolation**: Agents cannot access each other's workspaces
4. **Conflict Resolution**: File locking with timeout-based deadlock prevention
5. **Error Recovery**: Automatic rollback and retry mechanisms

## Agent Roles

- **🔵 Blue Agent (60% of tasks)**: Search, analysis, pattern finding
- **🟢 Green Agent (35% of tasks)**: Code generation, implementation, fixes
- **🔴 Red Agent (5% of tasks)**: Security audits, architecture review

## Usage

```bash
# Start orchestration system
./start-orchestrator.sh

# Monitor system status
./monitor-agents.sh

# Stop all agents safely
./stop-orchestrator.sh
```

## Emergency Procedures

- **File Corruption**: `./repair-coordination.sh` rebuilds state from event log
- **Agent Crash**: Automatic restart with task reassignment
- **Deadlock Detection**: Automatic resolution with task redistribution
- **Resource Exhaustion**: Graceful degradation with priority queueing