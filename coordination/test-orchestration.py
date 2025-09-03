#!/usr/bin/env python3
"""
Multi-Claude Orchestration Testing Framework

This comprehensive testing framework validates the entire multi-agent system
including coordination protocol, agent isolation, process management, error
recovery, and integration with SuperClaude 2.0.

TESTING CATEGORIES:
1. Unit Tests - Individual components
2. Integration Tests - System interactions  
3. Stress Tests - Performance and reliability
4. Error Recovery Tests - Failure scenarios
5. Compatibility Tests - SuperClaude integration
"""

import os
import sys
import json
import time
import signal
import tempfile
import subprocess
import threading
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timezone

# Add coordination modules to path
sys.path.append(str(Path(__file__).parent / "orchestration"))
from coordination_protocol import CoordinationProtocol, AgentType, TaskStatus, Task
from orchestrator import MultiClaudeOrchestrator
from integrate_superclaude import SuperClaudeIntegration

@dataclass
class TestResult:
    """Test result data structure."""
    name: str
    category: str
    status: str  # "pass", "fail", "skip", "error"
    duration: float
    message: str = ""
    details: Optional[Dict] = None

class TestFramework:
    """
    Comprehensive testing framework for multi-Claude orchestration.
    """
    
    def __init__(self, base_path: str = "/Users/michaelmishayev/Desktop/Projects/school_2"):
        self.base_path = Path(base_path)
        self.coordination_path = self.base_path / "coordination"
        self.test_results: List[TestResult] = []
        self.temp_dir = None
        
        # Test configuration
        self.timeout_short = 10   # Short operations
        self.timeout_medium = 30  # Medium operations  
        self.timeout_long = 60   # Long operations
        
    def setup_test_environment(self) -> bool:
        """Set up isolated test environment."""
        try:
            # Create temporary test directory
            self.temp_dir = tempfile.mkdtemp(prefix="claude_test_")
            test_coordination = Path(self.temp_dir) / "coordination"
            
            # Copy coordination structure to test directory
            import shutil
            shutil.copytree(self.coordination_path, test_coordination)
            
            print(f"✅ Test environment created: {self.temp_dir}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to setup test environment: {e}")
            return False
    
    def cleanup_test_environment(self):
        """Clean up test environment."""
        if self.temp_dir and Path(self.temp_dir).exists():
            import shutil
            shutil.rmtree(self.temp_dir, ignore_errors=True)
            print(f"✅ Test environment cleaned up")
    
    def run_test(self, test_func, name: str, category: str) -> TestResult:
        """Run a single test with timing and error handling."""
        
        start_time = time.time()
        
        try:
            result = test_func()
            duration = time.time() - start_time
            
            if result is True:
                return TestResult(name, category, "pass", duration)
            elif result is False:
                return TestResult(name, category, "fail", duration, "Test returned False")
            elif isinstance(result, dict):
                status = "pass" if result.get("success", True) else "fail"
                return TestResult(name, category, status, duration, 
                                result.get("message", ""), result)
            else:
                return TestResult(name, category, "pass", duration, str(result))
                
        except Exception as e:
            duration = time.time() - start_time
            return TestResult(name, category, "error", duration, f"Exception: {e}")
    
    # ==================== UNIT TESTS ====================
    
    def test_coordination_protocol_creation(self) -> Dict:
        """Test coordination protocol initialization."""
        
        try:
            protocol = CoordinationProtocol(self.temp_dir + "/coordination")
            
            # Check file creation
            event_log = Path(self.temp_dir) / "coordination" / "orchestration" / "event-log.jsonl"
            task_queue = Path(self.temp_dir) / "coordination" / "orchestration" / "task-queue.json"
            agent_registry = Path(self.temp_dir) / "coordination" / "orchestration" / "agent-registry.json"
            
            checks = {
                "protocol_created": protocol is not None,
                "event_log_exists": event_log.exists(),
                "task_queue_exists": task_queue.exists(),
                "agent_registry_exists": agent_registry.exists()
            }
            
            return {"success": all(checks.values()), "details": checks}
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def test_task_creation_and_assignment(self) -> Dict:
        """Test task creation and assignment workflow."""
        
        try:
            protocol = CoordinationProtocol(self.temp_dir + "/coordination")
            
            # Create test task
            task_id = protocol.create_task(
                task_type="test",
                description="Test task creation",
                priority=2
            )
            
            # Register test agent
            agent_success = protocol.register_agent("test-agent", AgentType.BLUE, os.getpid())
            
            # Assign task
            assign_success = protocol.assign_task(task_id, "test-agent")
            
            # Update task status
            update_success = protocol.update_task_status(
                task_id, 
                TaskStatus.COMPLETED,
                result={"output": "test completed"},
                agent_id="test-agent"
            )
            
            return {
                "success": all([task_id, agent_success, assign_success, update_success]),
                "details": {
                    "task_created": bool(task_id),
                    "agent_registered": agent_success,
                    "task_assigned": assign_success,
                    "task_completed": update_success
                }
            }
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def test_atomic_file_operations(self) -> Dict:
        """Test atomic file operations prevent corruption."""
        
        try:
            protocol = CoordinationProtocol(self.temp_dir + "/coordination")
            
            # Create multiple concurrent tasks to test atomicity
            import concurrent.futures
            
            def create_task(i):
                return protocol.create_task(
                    task_type="concurrent_test",
                    description=f"Concurrent task {i}",
                    priority=2
                )
            
            # Execute concurrent operations
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                futures = [executor.submit(create_task, i) for i in range(10)]
                task_ids = [future.result() for future in concurrent.futures.as_completed(futures)]
            
            # Verify all tasks were created
            with open(protocol.task_queue_path) as f:
                queue_data = json.load(f)
            
            created_count = len(queue_data["tasks"])
            
            return {
                "success": created_count == 10,
                "details": {
                    "expected_tasks": 10,
                    "created_tasks": created_count,
                    "all_ids_unique": len(set(task_ids)) == 10
                }
            }
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def test_agent_isolation(self) -> Dict:
        """Test agent workspace isolation."""
        
        try:
            # Check agent workspace separation
            blue_workspace = Path(self.temp_dir) / "coordination" / "agent-workspaces" / "blue-agent"
            green_workspace = Path(self.temp_dir) / "coordination" / "agent-workspaces" / "green-agent"
            red_workspace = Path(self.temp_dir) / "coordination" / "agent-workspaces" / "red-agent"
            
            workspaces_exist = all([
                blue_workspace.exists(),
                green_workspace.exists(),
                red_workspace.exists()
            ])
            
            # Check CLAUDE.md files exist and are different
            blue_config = blue_workspace / "CLAUDE.md"
            green_config = green_workspace / "CLAUDE.md"
            red_config = red_workspace / "CLAUDE.md"
            
            configs_exist = all([
                blue_config.exists(),
                green_config.exists(), 
                red_config.exists()
            ])
            
            # Verify configurations are different
            configs_different = True
            if configs_exist:
                blue_content = blue_config.read_text()
                green_content = green_config.read_text()
                red_content = red_config.read_text()
                
                configs_different = (
                    blue_content != green_content and
                    green_content != red_content and
                    blue_content != red_content
                )
            
            return {
                "success": workspaces_exist and configs_exist and configs_different,
                "details": {
                    "workspaces_exist": workspaces_exist,
                    "configs_exist": configs_exist,
                    "configs_different": configs_different
                }
            }
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    # ==================== INTEGRATION TESTS ====================
    
    def test_orchestrator_initialization(self) -> Dict:
        """Test orchestrator startup and shutdown."""
        
        try:
            orchestrator = MultiClaudeOrchestrator(self.temp_dir)
            
            # Test system status
            status = orchestrator.get_system_status()
            
            status_valid = (
                "agents" in status and
                "pending_tasks" in status and
                "coordination_healthy" in status
            )
            
            return {
                "success": status_valid,
                "details": {
                    "status_structure": status_valid,
                    "coordination_healthy": status.get("coordination_healthy", False)
                }
            }
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def test_task_distribution(self) -> Dict:
        """Test intelligent task distribution to agents."""
        
        try:
            orchestrator = MultiClaudeOrchestrator(self.temp_dir)
            
            # Create tasks for different agent types
            search_task = orchestrator.create_task("search", "Test search task")
            code_task = orchestrator.create_task("implement", "Test implementation task")
            review_task = orchestrator.create_task("review", "Test review task")
            
            # Check if tasks are properly categorized
            protocol = orchestrator.protocol
            
            blue_tasks = protocol.get_available_tasks(AgentType.BLUE)
            green_tasks = protocol.get_available_tasks(AgentType.GREEN)
            red_tasks = protocol.get_available_tasks(AgentType.RED)
            
            blue_has_search = any(task["id"] == search_task for task in blue_tasks)
            green_has_code = any(task["id"] == code_task for task in green_tasks)
            red_has_review = any(task["id"] == review_task for task in red_tasks)
            
            return {
                "success": blue_has_search and green_has_code and red_has_review,
                "details": {
                    "blue_has_search": blue_has_search,
                    "green_has_code": green_has_code,
                    "red_has_review": red_has_review
                }
            }
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def test_superclaude_integration(self) -> Dict:
        """Test SuperClaude 2.0 integration layer."""
        
        try:
            integration = SuperClaudeIntegration(self.temp_dir)
            
            # Test command routing
            routing = integration.route_command("implement", ["user auth"], [])
            
            # Test status
            status = integration.get_integration_status()
            
            routing_valid = "execution_mode" in routing
            status_valid = "supercloud_integration" in status
            
            return {
                "success": routing_valid and status_valid,
                "details": {
                    "routing_works": routing_valid,
                    "status_works": status_valid,
                    "integration_active": status.get("supercloud_integration") == "active"
                }
            }
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    # ==================== STRESS TESTS ====================
    
    def test_concurrent_task_creation(self) -> Dict:
        """Test system under concurrent task creation load."""
        
        try:
            orchestrator = MultiClaudeOrchestrator(self.temp_dir)
            
            # Create many concurrent tasks
            import concurrent.futures
            
            def create_task(i):
                return orchestrator.create_task(
                    "load_test",
                    f"Load test task {i}",
                    priority=2
                )
            
            start_time = time.time()
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
                futures = [executor.submit(create_task, i) for i in range(50)]
                task_ids = [future.result() for future in concurrent.futures.as_completed(futures)]
            
            duration = time.time() - start_time
            
            # Verify all tasks created
            status = orchestrator.get_system_status()
            total_tasks = sum(status["pending_tasks"].values())
            
            return {
                "success": len(task_ids) == 50 and total_tasks >= 50,
                "details": {
                    "tasks_created": len(task_ids),
                    "duration": f"{duration:.2f}s",
                    "tasks_per_second": f"{50/duration:.1f}",
                    "total_pending": total_tasks
                }
            }
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def test_memory_usage(self) -> Dict:
        """Test memory usage under load."""
        
        try:
            import psutil
            
            # Get initial memory
            initial_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            
            # Create orchestrator and tasks
            orchestrator = MultiClaudeOrchestrator(self.temp_dir)
            
            # Create many tasks
            for i in range(100):
                orchestrator.create_task("memory_test", f"Memory test task {i}")
            
            # Check final memory
            final_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            memory_increase = final_memory - initial_memory
            
            # Memory should not increase dramatically
            memory_reasonable = memory_increase < 50  # Less than 50MB increase
            
            return {
                "success": memory_reasonable,
                "details": {
                    "initial_memory_mb": f"{initial_memory:.1f}",
                    "final_memory_mb": f"{final_memory:.1f}",
                    "increase_mb": f"{memory_increase:.1f}",
                    "increase_reasonable": memory_reasonable
                }
            }
            
        except ImportError:
            return {"success": True, "message": "psutil not available, skipping memory test"}
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    # ==================== ERROR RECOVERY TESTS ====================
    
    def test_coordination_file_recovery(self) -> Dict:
        """Test recovery from corrupted coordination files."""
        
        try:
            protocol = CoordinationProtocol(self.temp_dir + "/coordination")
            
            # Create some tasks first
            task1 = protocol.create_task("test", "Task 1")
            task2 = protocol.create_task("test", "Task 2") 
            
            # Corrupt task queue file
            with open(protocol.task_queue_path, 'w') as f:
                f.write("invalid json content")
            
            # Try to repair
            repair_success = protocol.repair_coordination_state()
            
            # Verify repair worked
            with open(protocol.task_queue_path) as f:
                repaired_data = json.load(f)
            
            tasks_recovered = len(repaired_data.get("tasks", {}))
            
            return {
                "success": repair_success and tasks_recovered >= 2,
                "details": {
                    "repair_successful": repair_success,
                    "tasks_recovered": tasks_recovered
                }
            }
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def test_deadlock_prevention(self) -> Dict:
        """Test deadlock prevention in file locking."""
        
        try:
            protocol = CoordinationProtocol(self.temp_dir + "/coordination")
            
            # Simulate concurrent access that could cause deadlock
            import threading
            results = {"success_count": 0, "total_count": 0}
            
            def concurrent_task_creation(thread_id):
                try:
                    for i in range(5):
                        task_id = protocol.create_task(
                            "deadlock_test",
                            f"Deadlock test {thread_id}-{i}"
                        )
                        if task_id:
                            results["success_count"] += 1
                        results["total_count"] += 1
                except Exception:
                    results["total_count"] += 5
            
            # Run concurrent threads
            threads = []
            for i in range(5):
                thread = threading.Thread(target=concurrent_task_creation, args=(i,))
                threads.append(thread)
                thread.start()
            
            # Wait for completion with timeout
            for thread in threads:
                thread.join(timeout=self.timeout_short)
            
            # Check if most operations succeeded (no deadlock)
            success_rate = results["success_count"] / max(results["total_count"], 1)
            
            return {
                "success": success_rate > 0.8,  # 80% success rate
                "details": {
                    "success_count": results["success_count"],
                    "total_count": results["total_count"],
                    "success_rate": f"{success_rate:.2f}"
                }
            }
            
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    # ==================== TEST RUNNER ====================
    
    def run_all_tests(self) -> Dict:
        """Run all tests and return comprehensive results."""
        
        print("🧪 Starting Multi-Claude Orchestration Test Suite")
        print("=" * 60)
        
        # Setup test environment
        if not self.setup_test_environment():
            return {"success": False, "message": "Failed to setup test environment"}
        
        try:
            # Define test suite
            test_suite = [
                # Unit Tests
                (self.test_coordination_protocol_creation, "Coordination Protocol Creation", "unit"),
                (self.test_task_creation_and_assignment, "Task Creation and Assignment", "unit"),
                (self.test_atomic_file_operations, "Atomic File Operations", "unit"),
                (self.test_agent_isolation, "Agent Workspace Isolation", "unit"),
                
                # Integration Tests
                (self.test_orchestrator_initialization, "Orchestrator Initialization", "integration"),
                (self.test_task_distribution, "Task Distribution", "integration"),
                (self.test_superclaude_integration, "SuperClaude Integration", "integration"),
                
                # Stress Tests
                (self.test_concurrent_task_creation, "Concurrent Task Creation", "stress"),
                (self.test_memory_usage, "Memory Usage", "stress"),
                
                # Error Recovery Tests
                (self.test_coordination_file_recovery, "Coordination File Recovery", "recovery"),
                (self.test_deadlock_prevention, "Deadlock Prevention", "recovery")
            ]
            
            # Run all tests
            for test_func, name, category in test_suite:
                print(f"\\n🔄 Running: {name}")
                result = self.run_test(test_func, name, category)
                self.test_results.append(result)
                
                # Print result
                status_emoji = {"pass": "✅", "fail": "❌", "skip": "⏭️", "error": "💥"}[result.status]
                print(f"  {status_emoji} {result.status.upper()} ({result.duration:.2f}s)")
                
                if result.message:
                    print(f"     {result.message}")
            
            # Generate summary
            summary = self._generate_test_summary()
            self._print_test_summary(summary)
            
            return summary
            
        finally:
            self.cleanup_test_environment()
    
    def _generate_test_summary(self) -> Dict:
        """Generate test execution summary."""
        
        total_tests = len(self.test_results)
        passed = len([r for r in self.test_results if r.status == "pass"])
        failed = len([r for r in self.test_results if r.status == "fail"])
        errors = len([r for r in self.test_results if r.status == "error"])
        skipped = len([r for r in self.test_results if r.status == "skip"])
        
        total_duration = sum(r.duration for r in self.test_results)
        
        # Category breakdown
        categories = {}
        for result in self.test_results:
            if result.category not in categories:
                categories[result.category] = {"total": 0, "passed": 0}
            categories[result.category]["total"] += 1
            if result.status == "pass":
                categories[result.category]["passed"] += 1
        
        return {
            "success": failed == 0 and errors == 0,
            "total_tests": total_tests,
            "passed": passed,
            "failed": failed,
            "errors": errors,
            "skipped": skipped,
            "success_rate": passed / max(total_tests, 1),
            "total_duration": total_duration,
            "categories": categories,
            "detailed_results": [
                {
                    "name": r.name,
                    "category": r.category,
                    "status": r.status,
                    "duration": r.duration,
                    "message": r.message
                }
                for r in self.test_results
            ]
        }
    
    def _print_test_summary(self, summary: Dict):
        """Print formatted test summary."""
        
        print("\\n" + "=" * 60)
        print("🧪 TEST EXECUTION SUMMARY")
        print("=" * 60)
        
        # Overall results
        success_emoji = "✅" if summary["success"] else "❌"
        print(f"{success_emoji} Overall: {'PASS' if summary['success'] else 'FAIL'}")
        print(f"📊 Results: {summary['passed']}/{summary['total_tests']} passed ({summary['success_rate']:.1%})")
        print(f"⏱️  Duration: {summary['total_duration']:.1f}s")
        
        if summary["failed"] > 0:
            print(f"❌ Failed: {summary['failed']}")
        if summary["errors"] > 0:
            print(f"💥 Errors: {summary['errors']}")
        if summary["skipped"] > 0:
            print(f"⏭️  Skipped: {summary['skipped']}")
        
        # Category breakdown
        print("\\n📋 By Category:")
        for category, stats in summary["categories"].items():
            rate = stats["passed"] / max(stats["total"], 1)
            emoji = "✅" if rate == 1.0 else "⚠️" if rate > 0.5 else "❌"
            print(f"  {emoji} {category.title()}: {stats['passed']}/{stats['total']} ({rate:.1%})")
        
        # Failed tests details
        failed_tests = [r for r in summary["detailed_results"] if r["status"] in ["fail", "error"]]
        if failed_tests:
            print("\\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  • {test['name']}: {test['message']}")


def main():
    """Command-line interface for test framework."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Multi-Claude Orchestration Test Framework")
    parser.add_argument("--category", choices=["unit", "integration", "stress", "recovery"],
                       help="Run specific test category only")
    parser.add_argument("--output", help="Output results to JSON file")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Verbose output")
    
    args = parser.parse_args()
    
    # Create test framework
    framework = TestFramework()
    
    # Run tests
    results = framework.run_all_tests()
    
    # Output results
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\\n📄 Results saved to: {args.output}")
    
    # Exit with appropriate code
    sys.exit(0 if results["success"] else 1)


if __name__ == "__main__":
    main()