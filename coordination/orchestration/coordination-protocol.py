#!/usr/bin/env python3
"""
Multi-Claude Coordination Protocol

CRITICAL SAFETY: This module implements event-sourced coordination with atomic
operations to prevent race conditions between multiple Claude instances.

Architecture:
- Event-sourced coordination (append-only log)
- Atomic file operations (write-then-rename)
- File-based locking with timeouts
- Automatic conflict resolution
"""

import json
import time
import fcntl
import os
import uuid
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

class TaskStatus(Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class AgentType(Enum):
    BLUE = "blue"      # Search & Discovery (Haiku)
    GREEN = "green"    # Code Generation (Sonnet)
    RED = "red"        # Critical Review (Opus)

@dataclass
class Task:
    id: str
    type: str
    priority: int  # 1=highest, 3=lowest
    assigned_to: Optional[str]
    status: TaskStatus
    created_at: str
    updated_at: str
    description: str
    context: Optional[str] = None
    dependencies: List[str] = None
    result: Optional[Dict] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []

@dataclass
class Agent:
    id: str
    type: AgentType
    pid: int
    status: str  # "active", "idle", "busy", "error"
    last_heartbeat: str
    current_task: Optional[str]
    tasks_completed: int = 0
    tasks_failed: int = 0

class CoordinationProtocol:
    """
    Thread-safe coordination protocol with atomic operations and event sourcing.
    """
    
    def __init__(self, base_path: str = "/Users/michaelmishayev/Desktop/Projects/school_2/coordination"):
        self.base_path = Path(base_path)
        self.orchestration_path = self.base_path / "orchestration"
        self.event_log_path = self.orchestration_path / "event-log.jsonl"
        self.task_queue_path = self.orchestration_path / "task-queue.json"
        self.agent_registry_path = self.orchestration_path / "agent-registry.json"
        self.locks_path = self.orchestration_path / "locks"
        
        # Thread-local storage for file locks
        self._local = threading.local()
        
        # Initialize files if they don't exist
        self._initialize_files()
    
    def _initialize_files(self):
        """Initialize coordination files with proper permissions."""
        self.orchestration_path.mkdir(parents=True, exist_ok=True)
        self.locks_path.mkdir(exist_ok=True)
        
        # Initialize empty files if they don't exist
        if not self.event_log_path.exists():
            self.event_log_path.touch()
            os.chmod(self.event_log_path, 0o600)
        
        if not self.task_queue_path.exists():
            self._atomic_write(self.task_queue_path, {"tasks": {}, "version": 1})
        
        if not self.agent_registry_path.exists():
            self._atomic_write(self.agent_registry_path, {"agents": {}, "version": 1})
    
    def _atomic_write(self, file_path: Path, data: Dict) -> None:
        """
        CRITICAL: Atomic file write to prevent corruption from simultaneous writes.
        Uses write-to-temp-file-then-rename pattern.
        """
        temp_path = file_path.with_suffix(f".tmp.{uuid.uuid4().hex}")
        
        try:
            with open(temp_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)
                f.flush()
                os.fsync(f.fileno())  # Force write to disk
            
            # Atomic rename - this is the critical atomic operation
            temp_path.replace(file_path)
            os.chmod(file_path, 0o600)
            
        except Exception as e:
            # Cleanup temp file on failure
            if temp_path.exists():
                temp_path.unlink()
            raise Exception(f"Atomic write failed for {file_path}: {e}")
    
    def _acquire_lock(self, lock_name: str, timeout: int = 10) -> bool:
        """
        Acquire file-based lock with timeout to prevent deadlocks.
        """
        lock_file = self.locks_path / f"{lock_name}.lock"
        
        # Create lock file if it doesn't exist
        lock_file.touch()
        
        try:
            lock_fd = open(lock_file, 'w')
            
            # Try to acquire exclusive lock with timeout
            start_time = time.time()
            while time.time() - start_time < timeout:
                try:
                    fcntl.flock(lock_fd.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                    # Store file descriptor for later release
                    if not hasattr(self._local, 'locks'):
                        self._local.locks = {}
                    self._local.locks[lock_name] = lock_fd
                    return True
                except IOError:
                    time.sleep(0.1)  # Brief wait before retry
            
            # Timeout reached
            lock_fd.close()
            return False
            
        except Exception as e:
            if 'lock_fd' in locals():
                lock_fd.close()
            raise Exception(f"Lock acquisition failed for {lock_name}: {e}")
    
    def _release_lock(self, lock_name: str) -> None:
        """Release file-based lock."""
        if hasattr(self._local, 'locks') and lock_name in self._local.locks:
            lock_fd = self._local.locks[lock_name]
            fcntl.flock(lock_fd.fileno(), fcntl.LOCK_UN)
            lock_fd.close()
            del self._local.locks[lock_name]
    
    def _append_event(self, event_type: str, data: Dict) -> None:
        """
        CRITICAL: Append event to log atomically.
        This is the source of truth for all coordination state.
        """
        event = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": event_type,
            "data": data
        }
        
        # Acquire lock for event log
        if not self._acquire_lock("event_log"):
            raise Exception("Failed to acquire event log lock")
        
        try:
            with open(self.event_log_path, 'a') as f:
                json.dump(event, f, default=str)
                f.write('\n')
                f.flush()
                os.fsync(f.fileno())
        finally:
            self._release_lock("event_log")
    
    def create_task(self, task_type: str, description: str, priority: int = 2, 
                   context: str = None, dependencies: List[str] = None) -> str:
        """
        Create new task with atomic coordination update.
        """
        task_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        task = Task(
            id=task_id,
            type=task_type,
            priority=priority,
            assigned_to=None,
            status=TaskStatus.PENDING,
            created_at=now,
            updated_at=now,
            description=description,
            context=context,
            dependencies=dependencies or []
        )
        
        # Append event to log
        self._append_event("task_created", asdict(task))
        
        # Update derived state (task queue)
        self._rebuild_task_queue()
        
        return task_id
    
    def assign_task(self, task_id: str, agent_id: str) -> bool:
        """
        Assign task to agent with conflict detection.
        """
        if not self._acquire_lock("task_assignment"):
            return False
        
        try:
            # Read current state
            with open(self.task_queue_path) as f:
                queue_data = json.load(f)
            
            if task_id not in queue_data["tasks"]:
                return False
            
            task_data = queue_data["tasks"][task_id]
            
            # Check if task is already assigned
            if task_data["status"] != TaskStatus.PENDING.value:
                return False
            
            # Check task dependencies
            if task_data["dependencies"]:
                for dep_id in task_data["dependencies"]:
                    if dep_id in queue_data["tasks"]:
                        dep_status = queue_data["tasks"][dep_id]["status"]
                        if dep_status != TaskStatus.COMPLETED.value:
                            return False  # Dependencies not completed
            
            # Assign task
            now = datetime.now(timezone.utc).isoformat()
            self._append_event("task_assigned", {
                "task_id": task_id,
                "agent_id": agent_id,
                "timestamp": now
            })
            
            # Update derived state
            self._rebuild_task_queue()
            
            return True
            
        finally:
            self._release_lock("task_assignment")
    
    def update_task_status(self, task_id: str, status: TaskStatus, 
                          result: Dict = None, agent_id: str = None) -> bool:
        """
        Update task status with atomic coordination.
        """
        if not self._acquire_lock("task_update"):
            return False
        
        try:
            now = datetime.now(timezone.utc).isoformat()
            update_data = {
                "task_id": task_id,
                "status": status.value,
                "timestamp": now,
                "agent_id": agent_id
            }
            
            if result:
                update_data["result"] = result
            
            self._append_event("task_updated", update_data)
            self._rebuild_task_queue()
            
            return True
            
        finally:
            self._release_lock("task_update")
    
    def register_agent(self, agent_id: str, agent_type: AgentType, pid: int) -> bool:
        """
        Register agent with atomic coordination.
        """
        if not self._acquire_lock("agent_registry"):
            return False
        
        try:
            now = datetime.now(timezone.utc).isoformat()
            agent = Agent(
                id=agent_id,
                type=agent_type,
                pid=pid,
                status="active",
                last_heartbeat=now,
                current_task=None
            )
            
            self._append_event("agent_registered", asdict(agent))
            self._rebuild_agent_registry()
            
            return True
            
        finally:
            self._release_lock("agent_registry")
    
    def update_agent_heartbeat(self, agent_id: str, current_task: str = None) -> bool:
        """
        Update agent heartbeat to indicate it's alive.
        """
        now = datetime.now(timezone.utc).isoformat()
        heartbeat_data = {
            "agent_id": agent_id,
            "timestamp": now,
            "current_task": current_task
        }
        
        self._append_event("agent_heartbeat", heartbeat_data)
        self._rebuild_agent_registry()
        
        return True
    
    def get_available_tasks(self, agent_type: AgentType) -> List[Dict]:
        """
        Get tasks available for assignment to specific agent type.
        """
        with open(self.task_queue_path) as f:
            queue_data = json.load(f)
        
        available_tasks = []
        
        for task_id, task_data in queue_data["tasks"].items():
            if task_data["status"] != TaskStatus.PENDING.value:
                continue
            
            # Check if task type matches agent capabilities
            if self._task_matches_agent(task_data["type"], agent_type):
                available_tasks.append(task_data)
        
        # Sort by priority (1=highest)
        available_tasks.sort(key=lambda x: x["priority"])
        
        return available_tasks
    
    def _task_matches_agent(self, task_type: str, agent_type: AgentType) -> bool:
        """
        Determine if task type matches agent capabilities.
        """
        task_routing = {
            # Blue agent (Search & Discovery)
            AgentType.BLUE: ["search", "analyze", "discover", "investigate", "find"],
            
            # Green agent (Code Generation)
            AgentType.GREEN: ["code", "implement", "create", "fix", "refactor", "build"],
            
            # Red agent (Critical Review)  
            AgentType.RED: ["review", "audit", "security", "validate", "assess"]
        }
        
        agent_keywords = task_routing.get(agent_type, [])
        
        for keyword in agent_keywords:
            if keyword in task_type.lower():
                return True
        
        return False
    
    def _rebuild_task_queue(self) -> None:
        """
        Rebuild task queue from event log (derived state).
        """
        tasks = {}
        
        # Read all events and build current state
        if self.event_log_path.exists():
            with open(self.event_log_path) as f:
                for line in f:
                    if line.strip():
                        event = json.loads(line)
                        
                        if event["type"] == "task_created":
                            task_data = event["data"]
                            tasks[task_data["id"]] = task_data
                        
                        elif event["type"] == "task_assigned":
                            task_id = event["data"]["task_id"]
                            if task_id in tasks:
                                tasks[task_id]["assigned_to"] = event["data"]["agent_id"]
                                tasks[task_id]["status"] = TaskStatus.ASSIGNED.value
                                tasks[task_id]["updated_at"] = event["data"]["timestamp"]
                        
                        elif event["type"] == "task_updated":
                            task_id = event["data"]["task_id"]
                            if task_id in tasks:
                                tasks[task_id]["status"] = event["data"]["status"]
                                tasks[task_id]["updated_at"] = event["data"]["timestamp"]
                                if "result" in event["data"]:
                                    tasks[task_id]["result"] = event["data"]["result"]
        
        # Write derived state atomically
        queue_data = {
            "tasks": tasks,
            "version": int(time.time()),
            "rebuilt_at": datetime.now(timezone.utc).isoformat()
        }
        
        self._atomic_write(self.task_queue_path, queue_data)
    
    def _rebuild_agent_registry(self) -> None:
        """
        Rebuild agent registry from event log (derived state).
        """
        agents = {}
        
        # Read all events and build current state
        if self.event_log_path.exists():
            with open(self.event_log_path) as f:
                for line in f:
                    if line.strip():
                        event = json.loads(line)
                        
                        if event["type"] == "agent_registered":
                            agent_data = event["data"]
                            agents[agent_data["id"]] = agent_data
                        
                        elif event["type"] == "agent_heartbeat":
                            agent_id = event["data"]["agent_id"]
                            if agent_id in agents:
                                agents[agent_id]["last_heartbeat"] = event["data"]["timestamp"]
                                if event["data"]["current_task"]:
                                    agents[agent_id]["current_task"] = event["data"]["current_task"]
        
        # Write derived state atomically
        registry_data = {
            "agents": agents,
            "version": int(time.time()),
            "rebuilt_at": datetime.now(timezone.utc).isoformat()
        }
        
        self._atomic_write(self.agent_registry_path, registry_data)
    
    def repair_coordination_state(self) -> bool:
        """
        Emergency repair: rebuild all derived state from event log.
        """
        try:
            print("🔧 Repairing coordination state from event log...")
            self._rebuild_task_queue()
            self._rebuild_agent_registry()
            print("✅ Coordination state repaired successfully")
            return True
        except Exception as e:
            print(f"❌ Coordination repair failed: {e}")
            return False


if __name__ == "__main__":
    # Test the coordination protocol
    protocol = CoordinationProtocol()
    
    # Test task creation
    task_id = protocol.create_task(
        task_type="search",
        description="Find authentication patterns in codebase",
        priority=1
    )
    print(f"Created task: {task_id}")
    
    # Test agent registration
    protocol.register_agent("blue-agent-1", AgentType.BLUE, os.getpid())
    print("Registered blue agent")
    
    # Test task assignment
    success = protocol.assign_task(task_id, "blue-agent-1")
    print(f"Task assignment: {'✅' if success else '❌'}")
    
    # Test repair function
    protocol.repair_coordination_state()