#!/usr/bin/env python3
"""
Multi-Claude Agent Client

This script allows individual Claude agents to interact with the coordination
protocol. Each agent uses this client to check for tasks, report status, and
submit results.

Usage:
  python3 agent-client.py --agent blue --check-tasks
  python3 agent-client.py --agent green --complete-task TASK_ID --result "result"
  python3 agent-client.py --agent red --heartbeat
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Optional, Dict, List

# Add coordination module to path
sys.path.append(str(Path(__file__).parent))
from coordination_protocol import CoordinationProtocol, AgentType, TaskStatus

class AgentClient:
    """Client for individual Claude agents to interact with coordination system."""
    
    def __init__(self, agent_id: str, agent_type: str):
        self.agent_id = agent_id
        self.agent_type = AgentType(agent_type)
        self.protocol = CoordinationProtocol()
        self.pid = os.getpid()
    
    def register(self) -> bool:
        """Register this agent with the coordination system."""
        success = self.protocol.register_agent(self.agent_id, self.agent_type, self.pid)
        if success:
            print(f"✅ {self.agent_type.value.upper()} Agent registered: {self.agent_id}")
        else:
            print(f"❌ Failed to register {self.agent_type.value} agent")
        return success
    
    def heartbeat(self, current_task: Optional[str] = None) -> bool:
        """Send heartbeat to indicate agent is alive."""
        success = self.protocol.update_agent_heartbeat(self.agent_id, current_task)
        if success:
            status = f"working on {current_task}" if current_task else "idle"
            print(f"💓 {self.agent_type.value.upper()} Agent heartbeat: {status}")
        return success
    
    def check_tasks(self) -> List[Dict]:
        """Check for available tasks for this agent type."""
        tasks = self.protocol.get_available_tasks(self.agent_type)
        
        if not tasks:
            print(f"📭 No tasks available for {self.agent_type.value} agent")
            return []
        
        print(f"📬 {len(tasks)} tasks available for {self.agent_type.value} agent:")
        for i, task in enumerate(tasks[:5], 1):  # Show top 5
            priority_emoji = "🔴" if task["priority"] == 1 else "🟡" if task["priority"] == 2 else "🟢"
            print(f"  {i}. {priority_emoji} [{task['type']}] {task['description'][:60]}...")
            print(f"     ID: {task['id']}")
        
        return tasks
    
    def claim_task(self, task_id: str) -> bool:
        """Attempt to claim a specific task."""
        success = self.protocol.assign_task(task_id, self.agent_id)
        
        if success:
            print(f"✅ {self.agent_type.value.upper()} Agent claimed task: {task_id}")
            # Update heartbeat with current task
            self.heartbeat(current_task=task_id)
        else:
            print(f"❌ Failed to claim task: {task_id} (may be already assigned)")
        
        return success
    
    def start_task(self, task_id: str) -> bool:
        """Mark task as in progress."""
        success = self.protocol.update_task_status(
            task_id, 
            TaskStatus.IN_PROGRESS, 
            agent_id=self.agent_id
        )
        
        if success:
            print(f"🔄 {self.agent_type.value.upper()} Agent started task: {task_id}")
            self.heartbeat(current_task=task_id)
        
        return success
    
    def complete_task(self, task_id: str, result: Dict) -> bool:
        """Mark task as completed with results."""
        success = self.protocol.update_task_status(
            task_id,
            TaskStatus.COMPLETED,
            result=result,
            agent_id=self.agent_id
        )
        
        if success:
            print(f"✅ {self.agent_type.value.upper()} Agent completed task: {task_id}")
            self.heartbeat()  # Clear current task
            
            # Check if completion creates new tasks
            if "next_tasks" in result:
                for next_task in result["next_tasks"]:
                    new_task_id = self.protocol.create_task(
                        task_type=next_task["type"],
                        description=next_task["description"],
                        priority=next_task.get("priority", 2),
                        dependencies=[task_id]  # Depend on completed task
                    )
                    print(f"📋 Created follow-up task: {new_task_id}")
        
        return success
    
    def fail_task(self, task_id: str, error_message: str) -> bool:
        """Mark task as failed with error details."""
        result = {
            "error": error_message,
            "timestamp": time.time(),
            "agent_id": self.agent_id
        }
        
        success = self.protocol.update_task_status(
            task_id,
            TaskStatus.FAILED,
            result=result,
            agent_id=self.agent_id
        )
        
        if success:
            print(f"❌ {self.agent_type.value.upper()} Agent failed task: {task_id}")
            print(f"   Error: {error_message}")
            self.heartbeat()  # Clear current task
        
        return success
    
    def get_dependency_result(self, dependency_task_id: str) -> Optional[Dict]:
        """Get result from a completed dependency task."""
        try:
            with open(self.protocol.task_queue_path) as f:
                queue_data = json.load(f)
            
            if dependency_task_id in queue_data["tasks"]:
                task = queue_data["tasks"][dependency_task_id]
                if task["status"] == TaskStatus.COMPLETED.value and "result" in task:
                    print(f"📥 Retrieved dependency result: {dependency_task_id}")
                    return task["result"]
                else:
                    print(f"⏳ Dependency not ready: {dependency_task_id} (status: {task['status']})")
                    return None
            else:
                print(f"❌ Dependency task not found: {dependency_task_id}")
                return None
                
        except Exception as e:
            print(f"❌ Error retrieving dependency: {e}")
            return None
    
    def auto_work_loop(self, max_iterations: int = 10) -> None:
        """
        Autonomous work loop: check for tasks, claim, and execute.
        This is the main execution loop for autonomous agents.
        """
        print(f"🤖 Starting autonomous work loop for {self.agent_type.value} agent")
        
        for iteration in range(max_iterations):
            print(f"\n--- Iteration {iteration + 1}/{max_iterations} ---")
            
            # Send heartbeat
            self.heartbeat()
            
            # Check for available tasks
            tasks = self.check_tasks()
            
            if not tasks:
                print("😴 No tasks available, sleeping...")
                time.sleep(30)  # Wait 30 seconds before checking again
                continue
            
            # Claim the highest priority task
            task = tasks[0]  # Already sorted by priority
            task_id = task["id"]
            
            if self.claim_task(task_id):
                print(f"🔄 Processing task: {task['description']}")
                
                # Start task
                if self.start_task(task_id):
                    try:
                        # This is where the actual work would be done
                        # In practice, this would integrate with Claude Code's tools
                        result = self._execute_task(task)
                        
                        if result:
                            self.complete_task(task_id, result)
                        else:
                            self.fail_task(task_id, "Task execution failed")
                    
                    except Exception as e:
                        self.fail_task(task_id, f"Exception during task execution: {e}")
                
            else:
                print("😞 Task already claimed by another agent")
                time.sleep(10)  # Brief wait before trying next task
    
    def _execute_task(self, task: Dict) -> Optional[Dict]:
        """
        Execute the actual task work.
        
        Note: This is a placeholder. In practice, this would integrate with
        Claude Code's actual tool execution capabilities.
        """
        task_type = task["type"]
        description = task["description"]
        
        print(f"⚡ Executing {task_type} task: {description}")
        
        # Simulate work based on agent type
        if self.agent_type == AgentType.BLUE:
            return self._execute_search_task(task)
        elif self.agent_type == AgentType.GREEN:
            return self._execute_code_task(task)
        elif self.agent_type == AgentType.RED:
            return self._execute_review_task(task)
        
        return None
    
    def _execute_search_task(self, task: Dict) -> Dict:
        """Execute search task (Blue Agent)."""
        # Placeholder for actual search implementation
        return {
            "agent": "🔵 Blue Agent",
            "search_results": ["mock result 1", "mock result 2"],
            "summary": f"Completed search for: {task['description']}",
            "performance": "⚡ 1.2s, 💰 ~600 tokens"
        }
    
    def _execute_code_task(self, task: Dict) -> Dict:
        """Execute code task (Green Agent)."""
        # Placeholder for actual code implementation
        return {
            "agent": "🟢 Green Agent", 
            "files_modified": ["example/file.ts"],
            "summary": f"Implemented: {task['description']}",
            "tests_included": True,
            "performance": "⚡⚡ 3.1s, 💰💰 ~2200 tokens"
        }
    
    def _execute_review_task(self, task: Dict) -> Dict:
        """Execute review task (Red Agent)."""
        # Placeholder for actual review implementation
        return {
            "agent": "🔴 Red Agent",
            "findings": [{"severity": "low", "issue": "Minor code style issue"}],
            "overall_assessment": f"Reviewed: {task['description']}",
            "critical_actions": [],
            "performance": "⚡⚡⚡ 7.8s, 💰💰💰💰💰 ~8100 tokens"
        }


def main():
    parser = argparse.ArgumentParser(description="Multi-Claude Agent Client")
    parser.add_argument("--agent", choices=["blue", "green", "red"], required=True,
                       help="Agent type")
    parser.add_argument("--action", choices=["register", "heartbeat", "check-tasks", 
                                           "claim-task", "start-task", "complete-task", 
                                           "fail-task", "get-dependency", "auto-work"],
                       default="check-tasks", help="Action to perform")
    parser.add_argument("--task-id", help="Task ID for task-specific actions")
    parser.add_argument("--result", help="Task result (JSON string)")
    parser.add_argument("--error", help="Error message for failed tasks")
    parser.add_argument("--dependency-id", help="Dependency task ID to retrieve")
    parser.add_argument("--max-iterations", type=int, default=10, 
                       help="Maximum iterations for auto-work mode")
    
    args = parser.parse_args()
    
    # Create agent client
    agent_id = f"{args.agent}-agent-{os.getpid()}"
    client = AgentClient(agent_id, args.agent)
    
    # Execute requested action
    if args.action == "register":
        client.register()
    
    elif args.action == "heartbeat":
        client.heartbeat()
    
    elif args.action == "check-tasks":
        client.check_tasks()
    
    elif args.action == "claim-task":
        if not args.task_id:
            print("❌ --task-id required for claim-task")
            sys.exit(1)
        client.claim_task(args.task_id)
    
    elif args.action == "start-task":
        if not args.task_id:
            print("❌ --task-id required for start-task")
            sys.exit(1)
        client.start_task(args.task_id)
    
    elif args.action == "complete-task":
        if not args.task_id or not args.result:
            print("❌ --task-id and --result required for complete-task")
            sys.exit(1)
        try:
            result = json.loads(args.result)
            client.complete_task(args.task_id, result)
        except json.JSONDecodeError:
            print("❌ --result must be valid JSON")
            sys.exit(1)
    
    elif args.action == "fail-task":
        if not args.task_id or not args.error:
            print("❌ --task-id and --error required for fail-task")
            sys.exit(1)
        client.fail_task(args.task_id, args.error)
    
    elif args.action == "get-dependency":
        if not args.dependency_id:
            print("❌ --dependency-id required for get-dependency")
            sys.exit(1)
        result = client.get_dependency_result(args.dependency_id)
        if result:
            print(json.dumps(result, indent=2))
    
    elif args.action == "auto-work":
        client.register()
        client.auto_work_loop(args.max_iterations)


if __name__ == "__main__":
    main()