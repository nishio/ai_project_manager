import yaml
import sys
from typing import Dict, List, Union

def validate_dependencies(deps: Dict) -> List[str]:
    """Validate the dependencies section of a task."""
    errors = []
    if not isinstance(deps, dict):
        return ["dependencies must be a dictionary"]
    
    # Validate must dependencies
    if "must" in deps:
        if not isinstance(deps["must"], list):
            errors.append("must dependencies must be a list")
        else:
            for i, dep in enumerate(deps["must"]):
                if not isinstance(dep, dict):
                    errors.append(f"must dependency {i} must be a dictionary")
                elif "task_id" not in dep:
                    errors.append(f"must dependency {i} missing task_id")
                elif "reason" not in dep:
                    errors.append(f"must dependency {i} missing reason")

    # Validate nice_to_have dependencies
    if "nice_to_have" in deps:
        if not isinstance(deps["nice_to_have"], list):
            errors.append("nice_to_have dependencies must be a list")
        else:
            for i, dep in enumerate(deps["nice_to_have"]):
                if not isinstance(dep, dict):
                    errors.append(f"nice_to_have dependency {i} must be a dictionary")
                elif "task_id" not in dep:
                    errors.append(f"nice_to_have dependency {i} missing task_id")
                elif "reason" not in dep:
                    errors.append(f"nice_to_have dependency {i} missing reason")

    # Validate human dependencies
    if "human" in deps:
        if not isinstance(deps["human"], list):
            errors.append("human dependencies must be a list")
        else:
            for i, dep in enumerate(deps["human"]):
                if not isinstance(dep, dict):
                    errors.append(f"human dependency {i} must be a dictionary")
                elif "action" not in dep:
                    errors.append(f"human dependency {i} missing action")
                elif "assignee" not in dep:
                    errors.append(f"human dependency {i} missing assignee")
                elif "status" not in dep:
                    errors.append(f"human dependency {i} missing status")
                elif "reason" not in dep:
                    errors.append(f"human dependency {i} missing reason")
                elif dep.get("status") not in ["waiting", "approved", "rejected"]:
                    errors.append(f"human dependency {i} has invalid status (must be waiting/approved/rejected)")

    return errors

def validate_similar_tasks(similar: List) -> List[str]:
    """Validate the similar_tasks section of a task."""
    errors = []
    if not isinstance(similar, list):
        return ["similar_tasks must be a list"]
    
    for i, task in enumerate(similar):
        if not isinstance(task, dict):
            errors.append(f"similar task {i} must be a dictionary")
        else:
            if "task_id" not in task:
                errors.append(f"similar task {i} missing task_id")
            if "similarity_score" in task:
                score = task["similarity_score"]
                if not isinstance(score, (int, float)) or score < 0 or score > 1:
                    errors.append(f"similar task {i} has invalid similarity_score (must be between 0 and 1)")
            if "note" not in task:
                errors.append(f"similar task {i} missing note")

    return errors

def validate_task(task: Dict) -> List[str]:
    """Validate a single task entry."""
    errors = []
    
    # Required fields
    required_fields = ["id", "title", "status", "type", "description"]
    for field in required_fields:
        if field not in task:
            errors.append(f"Missing required field: {field}")
    
    # Validate status
    if "status" in task and task["status"] not in ["Open", "In Progress", "Done", "Blocked"]:
        errors.append("Invalid status (must be Open/In Progress/Done/Blocked)")
    
    # Validate type
    if "type" in task and task["type"] not in ["task", "project"]:
        errors.append("Invalid type (must be task/project)")
    
    # Optional fields validation
    if "dependencies" in task:
        errors.extend(validate_dependencies(task["dependencies"]))
    
    if "similar_tasks" in task:
        errors.extend(validate_similar_tasks(task["similar_tasks"]))
    
    return errors

def validate_yaml(file_path: str) -> bool:
    """Validate YAML file containing tasks."""
    try:
        with open(file_path, 'r') as f:
            data = yaml.safe_load(f)
            
        if not isinstance(data, list):
            print(f"Error: {file_path} must contain a list of tasks")
            return False
            
        all_errors = []
        for i, task in enumerate(data):
            if not isinstance(task, dict):
                all_errors.append(f"Task {i} must be a dictionary")
                continue
                
            errors = validate_task(task)
            if errors:
                all_errors.extend([f"Task {task.get('id', f'at index {i}')}: {error}" for error in errors])
        
        if all_errors:
            print(f"Validation errors in {file_path}:")
            for error in all_errors:
                print(f"  - {error}")
            return False
            
        print(f"YAML validation OK for {file_path}")
        return True
        
    except yaml.YAMLError as e:
        print(f"YAML syntax error in {file_path}: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_yaml.py <yaml_file>")
        sys.exit(1)
    
    success = validate_yaml(sys.argv[1])
    sys.exit(0 if success else 1)
