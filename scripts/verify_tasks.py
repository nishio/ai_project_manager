#!/usr/bin/env python3
"""
Script to verify tasks between public and private repositories.
This script ensures no tasks are accidentally removed during data transfers.
"""
import os
import sys
import yaml
from pathlib import Path
from typing import Dict, Set, List, Tuple

def load_yaml_tasks(file_path: str) -> Tuple[List[Dict], Set[str]]:
    """
    Load tasks from a YAML file and return both the task list and set of task IDs.
    
    Args:
        file_path: Path to the YAML file
    
    Returns:
        Tuple of (task list, set of task IDs)
    """
    try:
        with open(file_path, "r") as f:
            data = yaml.safe_load(f)
            tasks = data.get("tasks", [])
            task_ids = {task["id"] for task in tasks if "id" in task}
            return tasks, task_ids
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return [], set()

def compare_tasks(public_path: str, private_path: str) -> bool:
    """
    Compare tasks between public and private repositories.
    
    Args:
        public_path: Path to public repo's YAML file
        private_path: Path to private repo's YAML file
    
    Returns:
        bool: True if validation passes
    """
    public_tasks, public_ids = load_yaml_tasks(public_path)
    private_tasks, private_ids = load_yaml_tasks(private_path)
    
    # Check for missing tasks
    missing_in_private = public_ids - private_ids
    if missing_in_private:
        print(f"WARNING: Tasks in public repo missing from private repo: {missing_in_private}")
        return False
    
    # Compare task contents
    private_tasks_dict = {task["id"]: task for task in private_tasks if "id" in task}
    for task in public_tasks:
        if "id" not in task:
            continue
        
        task_id = task["id"]
        if task_id in private_tasks_dict:
            private_task = private_tasks_dict[task_id]
            # Compare essential fields
            for field in ["title", "status"]:
                if field in task and task[field] != private_task.get(field):
                    print(f"WARNING: Task {task_id} has different {field}:")
                    print(f"  Public: {task.get(field)}")
                    print(f"  Private: {private_task.get(field)}")
                    return False
    
    print("Task verification successful!")
    return True

def main():
    """Main function to verify tasks between repositories."""
    if len(sys.argv) != 3:
        print("Usage: verify_tasks.py <public_yaml> <private_yaml>")
        sys.exit(1)
    
    public_path = sys.argv[1]
    private_path = sys.argv[2]
    
    if not os.path.exists(public_path):
        print(f"Public file not found: {public_path}")
        sys.exit(1)
    
    if not os.path.exists(private_path):
        print(f"Private file not found: {private_path}")
        sys.exit(1)
    
    success = compare_tasks(public_path, private_path)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
