#!/usr/bin/env python3
"""
Validate backlog.yaml structure and required fields
"""

import yaml
import sys
import uuid
from typing import Dict, List, Optional
import re

def is_valid_temp_id(task_id: str) -> bool:
    """
    Validate temporary task ID format (TXXXX)
    """
    return bool(re.match(r'^T\d{4}$', task_id))

def is_valid_permanent_id(permanent_id: str) -> bool:
    """
    Validate permanent ID format (UUID)
    """
    try:
        uuid.UUID(permanent_id)
        return True
    except ValueError:
        return False

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
            
            temp_ids = set()  # Track temporary IDs for uniqueness
            permanent_ids = set()  # Track permanent IDs for uniqueness
            
            for task in tasks:
                # Required fields
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
                
                # Validate temporary ID format and uniqueness
                if not is_valid_temp_id(task['id']):
                    print(f'Task {task["id"]}: invalid temporary ID format (must be TXXXX)')
                    return False
                if task['id'] in temp_ids:
                    print(f'Task {task["id"]}: duplicate temporary ID')
                    return False
                temp_ids.add(task['id'])
                
                # Validate permanent ID if present
                if 'permanent_id' in task:
                    if not is_valid_permanent_id(task['permanent_id']):
                        print(f'Task {task["id"]}: invalid permanent ID format (must be UUID)')
                        return False
                    if task['permanent_id'] in permanent_ids:
                        print(f'Task {task["id"]}: duplicate permanent ID')
                        return False
                    permanent_ids.add(task['permanent_id'])
                
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
