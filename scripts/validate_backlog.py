#!/usr/bin/env python3
"""
Validate backlog.yaml structure and required fields
"""

import yaml
import sys
from typing import Dict, List

def validate_backlog(filepath: str) -> bool:
    """
    Validate backlog.yaml structure and required fields
    Args:
        filepath: Path to backlog.yaml
    Returns:
        True if valid, False if invalid
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
            if not isinstance(data, dict) or 'tasks' not in data:
                print('Invalid format: missing tasks key')
                return False
            
            tasks = data['tasks']
            if not isinstance(tasks, list):
                print('Invalid format: tasks is not a list')
                return False
            
            for task in tasks:
                required = ['id', 'title', 'status', 'type']
                missing = [field for field in required if field not in task]
                if missing:
                    print(f'Task {task.get("id", "UNKNOWN")} missing required fields: {missing}')
                    return False
                
                # Validate field types
                if not isinstance(task['id'], str):
                    print(f'Task {task["id"]}: id must be string')
                    return False
                if not isinstance(task['title'], str):
                    print(f'Task {task["id"]}: title must be string')
                    return False
                if not isinstance(task['status'], str):
                    print(f'Task {task["id"]}: status must be string')
                    return False
                if not isinstance(task['type'], str):
                    print(f'Task {task["id"]}: type must be string')
                    return False
                
                # Validate optional fields if present
                if 'labels' in task and not isinstance(task['labels'], list):
                    print(f'Task {task["id"]}: labels must be list')
                    return False
                if 'assignable_to' in task and not isinstance(task['assignable_to'], list):
                    print(f'Task {task["id"]}: assignable_to must be list')
                    return False
                if 'dependencies' in task:
                    deps = task['dependencies']
                    if not isinstance(deps, dict):
                        print(f'Task {task["id"]}: dependencies must be dict')
                        return False
                    for dep_type in ['must', 'nice_to_have', 'human']:
                        if dep_type in deps and not isinstance(deps[dep_type], list):
                            print(f'Task {task["id"]}: dependencies.{dep_type} must be list')
                            return False
            
            print('backlog.yaml exists and follows required structure')
            return True
            
    except FileNotFoundError:
        print('backlog.yaml not found')
        return False
    except yaml.YAMLError as e:
        print(f'Invalid YAML: {e}')
        return False

def main():
    """Main entry point"""
    filepath = "/home/ubuntu/repos/ai_project_manager_data/tasks/backlog.yaml"
    if not validate_backlog(filepath):
        sys.exit(1)
    sys.exit(0)

if __name__ == "__main__":
    main()
