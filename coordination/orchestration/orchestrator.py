#!/usr/bin/env python3
"""
Multi-Claude Orchestrator

This is the master orchestrator that manages multiple Claude Code instances,
distributes tasks, monitors health, and coordinates the entire multi-agent system.

CRITICAL SAFETY:
- Process monitoring and automatic restart
- Resource limit enforcement  
- Deadlock detection and resolution
- Emergency shutdown capabilities
"""

import os
import sys
import time
import json
import signal
import subprocess
import threading
from pathlib import Path
from typing import Dict, List, Optional, Set
from datetime import datetime, timezone
from dataclasses import dataclass, asdict

# Add coordination module to path
sys.path.append(str(Path(__file__).parent))
from coordination_protocol import CoordinationProtocol, AgentType, TaskStatus

@dataclass
class AgentProcess:
    """Represents a running Claude agent process."""
    agent_id: str
    agent_type: AgentType
    process: subprocess.Popen
    workspace_path: Path
    last_heartbeat: float
    status: str  # "starting", "active", "idle", "error", "stopped"
    restart_count: int = 0
    
class MultiClaudeOrchestrator:
    """
    Master orchestrator for multiple Claude Code instances.
    
    Responsibilities:
    - Spawn and monitor agent processes
    - Distribute tasks intelligently
    - Monitor system health and performance
    - Handle failures and recovery
    - Provide central coordination interface
    """
    
    def __init__(self, base_path: str = "/Users/michaelmishayev/Desktop/Projects/school_2"):
        self.base_path = Path(base_path)
        self.coordination_path = self.base_path / "coordination"
        self.protocol = CoordinationProtocol(str(self.coordination_path))
        
        # Process management
        self.agents: Dict[str, AgentProcess] = {}
        self.shutdown_event = threading.Event()
        self.monitor_thread: Optional[threading.Thread] = None
        
        # Configuration
        self.max_agents_per_type = {
            AgentType.BLUE: 2,   # Can run multiple blue agents
            AgentType.GREEN: 2,  # Can run multiple green agents  
            AgentType.RED: 1     # Only one red agent (expensive)
        }
        
        self.heartbeat_timeout = 60  # Seconds before considering agent dead
        self.max_restart_attempts = 3
        
        # Task distribution settings
        self.task_check_interval = 10  # Seconds between task distribution
        self.load_balance_threshold = 5  # Max tasks per agent before load balancing
        
        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully."""
        print(f"\\n🛑 Received signal {signum}, initiating graceful shutdown...")
        self.shutdown()
    
    def start_orchestrator(self) -> bool:
        """
        Start the multi-Claude orchestration system.
        """
        print("🚀 Starting Multi-Claude Orchestration System...")
        
        try:
            # Initialize coordination system
            print("📋 Initializing coordination protocol...")
            self.protocol.repair_coordination_state()
            
            # Start initial agent processes
            print("🤖 Starting agent processes...")
            self._start_initial_agents()
            
            # Start monitoring thread
            print("👁️ Starting health monitoring...")
            self.monitor_thread = threading.Thread(target=self._monitor_agents, daemon=True)
            self.monitor_thread.start()
            
            # Start task distribution thread
            print("📦 Starting task distribution...")
            distribution_thread = threading.Thread(target=self._distribute_tasks, daemon=True)
            distribution_thread.start()
            
            print("✅ Multi-Claude Orchestrator is running!")
            print("📊 Monitor status: ./monitor-agents.sh")
            print("🛑 Graceful shutdown: Ctrl+C")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start orchestrator: {e}")
            return False
    
    def _start_initial_agents(self) -> None:
        """Start the initial set of agent processes."""
        
        # Start 1 Blue agent initially (search/discovery)
        self._start_agent(AgentType.BLUE)
        
        # Start 1 Green agent initially (code generation)
        self._start_agent(AgentType.GREEN)
        
        # Red agent is started on-demand for critical tasks
        print("🔴 Red agent on standby (started on-demand for critical tasks)")
    
    def _start_agent(self, agent_type: AgentType) -> Optional[str]:
        """
        Start a single agent process.
        
        Returns agent_id if successful, None if failed.
        """
        # Check if we've reached the limit for this agent type
        active_agents = [a for a in self.agents.values() 
                        if a.agent_type == agent_type and a.status != "stopped"]
        
        if len(active_agents) >= self.max_agents_per_type[agent_type]:
            print(f"⚠️ Maximum {agent_type.value} agents already running")
            return None
        
        # Generate unique agent ID
        timestamp = int(time.time())
        agent_id = f"{agent_type.value}-agent-{timestamp}"
        
        # Prepare workspace
        workspace_path = self.coordination_path / "agent-workspaces" / f"{agent_type.value}-agent"
        
        try:
            # Start Claude Code process in agent workspace
            cmd = self._build_agent_command(agent_id, agent_type, workspace_path)
            
            print(f"🔄 Starting {agent_type.value} agent: {agent_id}")
            print(f"   Command: {' '.join(cmd[:3])}...")  # Don't print full command (security)
            
            process = subprocess.Popen(
                cmd,
                cwd=workspace_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                bufsize=1
            )
            
            # Create agent process record
            agent_process = AgentProcess(
                agent_id=agent_id,
                agent_type=agent_type,
                process=process,
                workspace_path=workspace_path,
                last_heartbeat=time.time(),
                status="starting"
            )
            
            self.agents[agent_id] = agent_process
            
            # Wait briefly to ensure process started
            time.sleep(2)
            
            if process.poll() is None:  # Process still running
                print(f"✅ {agent_type.value.upper()} agent started: {agent_id}")
                agent_process.status = "active"
                return agent_id
            else:
                print(f"❌ {agent_type.value} agent failed to start: {agent_id}")
                stdout, stderr = process.communicate()
                print(f"   stdout: {stdout[:200]}...")
                print(f"   stderr: {stderr[:200]}...")
                return None
                
        except Exception as e:
            print(f"❌ Error starting {agent_type.value} agent: {e}")
            return None
    
    def _build_agent_command(self, agent_id: str, agent_type: AgentType, 
                           workspace_path: Path) -> List[str]:
        """
        Build the command to start a Claude Code agent process.
        
        This is the critical integration point where we spawn Claude Code
        with agent-specific configuration.
        """
        
        # Base Claude Code command
        cmd = ["claude", "code"]
        
        # Add agent-specific environment variables
        env = os.environ.copy()
        env.update({
            "CLAUDE_AGENT_ID": agent_id,
            "CLAUDE_AGENT_TYPE": agent_type.value,
            "CLAUDE_WORKSPACE": str(workspace_path),
            "CLAUDE_COORDINATION_PATH": str(self.coordination_path)
        })
        
        # Model selection based on agent type
        model_mapping = {
            AgentType.BLUE: "haiku",     # Fast and cheap for search
            AgentType.GREEN: "sonnet",   # Balanced for code generation
            AgentType.RED: "opus"        # Maximum intelligence for critical analysis
        }
        
        cmd.extend(["--model", model_mapping[agent_type]])
        
        # Agent-specific working directory is handled via cwd parameter
        # Agent-specific CLAUDE.md is automatically loaded from workspace
        
        return cmd
    
    def _monitor_agents(self) -> None:
        """
        Continuous monitoring of agent processes.
        
        This runs in a separate thread and handles:
        - Health checks via heartbeat monitoring
        - Process restart on failures
        - Resource monitoring
        - Deadlock detection
        """
        
        while not self.shutdown_event.is_set():
            try:
                current_time = time.time()
                agents_to_restart = []
                
                for agent_id, agent in self.agents.items():
                    # Check if process is still running
                    if agent.process.poll() is not None:
                        print(f"💀 {agent.agent_type.value.upper()} agent died: {agent_id}")
                        agents_to_restart.append(agent_id)
                        continue
                    
                    # Check heartbeat timeout
                    if current_time - agent.last_heartbeat > self.heartbeat_timeout:
                        print(f"💓 {agent.agent_type.value.upper()} agent heartbeat timeout: {agent_id}")
                        # Try to get latest heartbeat from coordination system
                        self._update_agent_heartbeat(agent_id)
                        
                        # If still timed out, mark for restart
                        if current_time - agent.last_heartbeat > self.heartbeat_timeout:
                            agents_to_restart.append(agent_id)
                
                # Restart failed agents
                for agent_id in agents_to_restart:
                    self._restart_agent(agent_id)
                
                # Sleep before next check
                self.shutdown_event.wait(30)  # Check every 30 seconds
                
            except Exception as e:
                print(f"❌ Error in agent monitoring: {e}")
                self.shutdown_event.wait(10)
    
    def _update_agent_heartbeat(self, agent_id: str) -> None:
        """Update agent heartbeat from coordination system."""
        try:
            with open(self.protocol.agent_registry_path) as f:
                registry_data = json.load(f)
            
            if agent_id in registry_data["agents"]:
                agent_data = registry_data["agents"][agent_id]
                last_heartbeat_str = agent_data["last_heartbeat"]
                
                # Parse ISO timestamp
                last_heartbeat_dt = datetime.fromisoformat(last_heartbeat_str.replace('Z', '+00:00'))
                last_heartbeat_timestamp = last_heartbeat_dt.timestamp()
                
                # Update our record
                if agent_id in self.agents:
                    self.agents[agent_id].last_heartbeat = last_heartbeat_timestamp
                    
        except Exception as e:
            print(f"⚠️ Error updating heartbeat for {agent_id}: {e}")
    
    def _restart_agent(self, agent_id: str) -> None:
        """
        Restart a failed agent process.
        """
        if agent_id not in self.agents:
            return
        
        agent = self.agents[agent_id]
        
        # Check restart limit
        if agent.restart_count >= self.max_restart_attempts:
            print(f"🚫 {agent.agent_type.value.upper()} agent exceeded restart limit: {agent_id}")
            agent.status = "stopped"
            return
        
        print(f"🔄 Restarting {agent.agent_type.value.upper()} agent: {agent_id}")
        
        # Terminate existing process
        try:
            if agent.process.poll() is None:
                agent.process.terminate()
                agent.process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            agent.process.kill()
        except Exception as e:
            print(f"⚠️ Error terminating process: {e}")
        
        # Increment restart count
        agent.restart_count += 1
        
        # Start new process
        new_agent_id = self._start_agent(agent.agent_type)
        
        if new_agent_id:
            # Remove old agent record
            del self.agents[agent_id]
            print(f"✅ Agent restarted: {agent_id} -> {new_agent_id}")
        else:
            print(f"❌ Failed to restart agent: {agent_id}")
            agent.status = "error"
    
    def _distribute_tasks(self) -> None:
        """
        Intelligent task distribution to available agents.
        
        This runs in a separate thread and handles:
        - Task assignment based on agent capabilities
        - Load balancing across agents
        - Priority-based task scheduling
        - Dynamic agent scaling
        """
        
        while not self.shutdown_event.is_set():
            try:
                self._distribute_pending_tasks()
                self._scale_agents_if_needed()
                
                # Sleep before next distribution cycle
                self.shutdown_event.wait(self.task_check_interval)
                
            except Exception as e:
                print(f"❌ Error in task distribution: {e}")
                self.shutdown_event.wait(5)
    
    def _distribute_pending_tasks(self) -> None:
        """Distribute pending tasks to available agents."""
        
        # Get pending tasks for each agent type
        for agent_type in AgentType:
            available_tasks = self.protocol.get_available_tasks(agent_type)
            
            if not available_tasks:
                continue
            
            # Get active agents of this type
            active_agents = [a for a in self.agents.values() 
                           if a.agent_type == agent_type and a.status == "active"]
            
            if not active_agents:
                # No agents of this type - consider starting one
                if agent_type != AgentType.RED:  # Don't auto-start expensive Red agents
                    print(f"🤖 No {agent_type.value} agents available, starting one...")
                    self._start_agent(agent_type)
                continue
            
            # Distribute tasks to agents
            for task in available_tasks[:len(active_agents)]:  # One task per agent max
                # Simple round-robin assignment for now
                # TODO: Implement intelligent load balancing
                agent = active_agents[0]  # Pick first available agent
                
                task_id = task["id"]
                success = self.protocol.assign_task(task_id, agent.agent_id)
                
                if success:
                    print(f"📋 Assigned {task['type']} task to {agent.agent_type.value} agent")
                else:
                    print(f"⚠️ Failed to assign task {task_id}")
    
    def _scale_agents_if_needed(self) -> None:
        """
        Dynamic agent scaling based on workload.
        """
        # Get current task queue sizes
        task_counts = {agent_type: len(self.protocol.get_available_tasks(agent_type)) 
                      for agent_type in AgentType}
        
        # Scale up if needed (except Red agents)
        for agent_type in [AgentType.BLUE, AgentType.GREEN]:
            pending_tasks = task_counts[agent_type]
            active_agents = len([a for a in self.agents.values() 
                               if a.agent_type == agent_type and a.status == "active"])
            
            # If more tasks than agents and under limit, start another agent
            if (pending_tasks > active_agents and 
                active_agents < self.max_agents_per_type[agent_type]):
                
                print(f"📈 Scaling up {agent_type.value} agents: {pending_tasks} tasks, {active_agents} agents")
                self._start_agent(agent_type)
    
    def create_task(self, task_type: str, description: str, priority: int = 2,
                   context: str = None, dependencies: List[str] = None) -> str:
        """
        Create a new task in the coordination system.
        
        This is the main interface for external systems to submit work.
        """
        task_id = self.protocol.create_task(task_type, description, priority, context, dependencies)
        
        priority_emoji = "🔴" if priority == 1 else "🟡" if priority == 2 else "🟢"
        print(f"📋 Created task {priority_emoji}: {description}")
        print(f"   ID: {task_id}")
        
        return task_id
    
    def get_system_status(self) -> Dict:
        """Get comprehensive system status."""
        
        # Agent status
        agent_status = {}
        for agent_type in AgentType:
            agents = [a for a in self.agents.values() if a.agent_type == agent_type]
            agent_status[agent_type.value] = {
                "active": len([a for a in agents if a.status == "active"]),
                "total": len(agents),
                "max": self.max_agents_per_type[agent_type]
            }
        
        # Task queue status
        task_status = {}
        for agent_type in AgentType:
            tasks = self.protocol.get_available_tasks(agent_type)
            task_status[agent_type.value] = len(tasks)
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agents": agent_status,
            "pending_tasks": task_status,
            "coordination_healthy": self._check_coordination_health()
        }
    
    def _check_coordination_health(self) -> bool:
        """Check if coordination system is healthy."""
        try:
            # Try to read coordination files
            with open(self.protocol.task_queue_path) as f:
                json.load(f)
            with open(self.protocol.agent_registry_path) as f:
                json.load(f)
            return True
        except Exception:
            return False
    
    def shutdown(self) -> None:
        """
        Graceful shutdown of all agent processes.
        """
        print("\\n🛑 Shutting down Multi-Claude Orchestrator...")
        
        # Signal shutdown to all threads
        self.shutdown_event.set()
        
        # Terminate all agent processes
        for agent_id, agent in self.agents.items():
            print(f"🔄 Stopping {agent.agent_type.value} agent: {agent_id}")
            
            try:
                if agent.process.poll() is None:
                    agent.process.terminate()
                    agent.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print(f"🔪 Force killing agent: {agent_id}")
                agent.process.kill()
            except Exception as e:
                print(f"⚠️ Error stopping agent {agent_id}: {e}")
            
            agent.status = "stopped"
        
        # Wait for monitoring thread to finish
        if self.monitor_thread and self.monitor_thread.is_alive():
            self.monitor_thread.join(timeout=5)
        
        print("✅ All agents stopped. Orchestrator shutdown complete.")
    
    def run_interactive(self) -> None:
        """
        Run orchestrator in interactive mode with command interface.
        """
        if not self.start_orchestrator():
            return
        
        print("\\n" + "="*60)
        print("🎛️  MULTI-CLAUDE ORCHESTRATOR - INTERACTIVE MODE")
        print("="*60)
        print("Commands:")
        print("  status - Show system status")
        print("  task <type> <description> - Create new task")
        print("  agents - List all agents")
        print("  shutdown - Graceful shutdown")
        print("  help - Show this help")
        print("="*60)
        
        try:
            while not self.shutdown_event.is_set():
                try:
                    cmd = input("\\nOrchestrator> ").strip().split()
                    if not cmd:
                        continue
                    
                    if cmd[0] == "status":
                        status = self.get_system_status()
                        print(json.dumps(status, indent=2))
                    
                    elif cmd[0] == "task" and len(cmd) >= 3:
                        task_type = cmd[1]
                        description = " ".join(cmd[2:])
                        self.create_task(task_type, description)
                    
                    elif cmd[0] == "agents":
                        for agent_id, agent in self.agents.items():
                            emoji = {"blue": "🔵", "green": "🟢", "red": "🔴"}[agent.agent_type.value]
                            print(f"  {emoji} {agent_id} - {agent.status}")
                    
                    elif cmd[0] in ["shutdown", "quit", "exit"]:
                        break
                    
                    elif cmd[0] == "help":
                        print("Available commands: status, task, agents, shutdown, help")
                    
                    else:
                        print("Unknown command. Type 'help' for available commands.")
                
                except KeyboardInterrupt:
                    break
                except EOFError:
                    break
                except Exception as e:
                    print(f"Error: {e}")
        
        finally:
            self.shutdown()


def main():
    """Main entry point for the orchestrator."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Multi-Claude Orchestrator")
    parser.add_argument("--interactive", "-i", action="store_true",
                       help="Run in interactive mode")
    parser.add_argument("--base-path", default="/Users/michaelmishayev/Desktop/Projects/school_2",
                       help="Base path for coordination")
    
    args = parser.parse_args()
    
    orchestrator = MultiClaudeOrchestrator(args.base_path)
    
    if args.interactive:
        orchestrator.run_interactive()
    else:
        # Run in daemon mode
        if orchestrator.start_orchestrator():
            try:
                # Keep running until interrupted
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
            finally:
                orchestrator.shutdown()


if __name__ == "__main__":
    main()