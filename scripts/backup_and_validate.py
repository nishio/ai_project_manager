#!/usr/bin/env python3
"""
Script to backup and validate data files before merges.
This script should be run as a pre-commit hook or in CI.
"""
import os
import sys
import yaml
import shutil
from datetime import datetime
from pathlib import Path

def create_backup(file_path: str) -> str:
    """Create a backup of the specified file with timestamp."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path("backups")
    backup_dir.mkdir(exist_ok=True)
    
    backup_path = backup_dir / f"{Path(file_path).name}.{timestamp}.bak"
    shutil.copy2(file_path, backup_path)
    print(f"Created backup: {backup_path}")
    return str(backup_path)

def validate_yaml(file_path: str, backup_path: str | None = None) -> bool:
    """
    Validate YAML file and check for large data removals.
    Args:
        file_path: Path to the YAML file to validate
        backup_path: Optional path to a backup file to compare against
    Returns:
        bool: True if validation passes, False otherwise
    """
    try:
        with open(file_path, 'r') as f:
            current_data = yaml.safe_load(f)
        
        if backup_path:
            with open(backup_path, 'r') as f:
                backup_data = yaml.safe_load(f)
            
            # Compare task counts
            current_tasks = len(current_data.get('tasks', []))
            backup_tasks = len(backup_data.get('tasks', []))
            
            if current_tasks < backup_tasks:
                removed_count = backup_tasks - current_tasks
                if removed_count > 5:  # Alert if more than 5 tasks are removed
                    print(f"WARNING: Large number of tasks removed ({removed_count} tasks)")
                    print("Please verify this is intentional")
                    return False
                
            # Check for missing task IDs
            current_ids = {task['id'] for task in current_data.get('tasks', [])}
            backup_ids = {task['id'] for task in backup_data.get('tasks', [])}
            
            missing_ids = backup_ids - current_ids
            if missing_ids:
                print(f"WARNING: Missing task IDs: {missing_ids}")
                return False
        
        return True
    
    except Exception as e:
        print(f"Error validating YAML: {e}")
        return False

def main():
    """Main function to backup and validate data files."""
    if len(sys.argv) < 2:
        print("Usage: backup_and_validate.py <yaml_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)
    
    # Create backup
    backup_path = create_backup(file_path)
    
    # Validate YAML and check for large removals
    if not validate_yaml(file_path, backup_path):
        print("Validation failed. Please review changes.")
        sys.exit(1)
    
    print("Backup and validation successful!")
    sys.exit(0)

if __name__ == "__main__":
    main()
