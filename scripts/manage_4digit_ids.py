#!/usr/bin/env python3
"""
Manage the pool of 4-digit task IDs (TXXXX format)

This script provides functionality to:
1. Track available and used task IDs
2. Assign next available ID for new tasks
3. Release IDs from archived tasks
4. Prevent ID collisions
5. Manage the ID pool (T0000-T9999)

Usage:
    python manage_4digit_ids.py [command] [args]
    Commands:
        next          Get next available ID
        release ID    Release a specific ID back to the pool
        status        Show pool status (used/available counts)
        list         List all used/available IDs
"""

import json
import sys
import os
from typing import Set, Dict, List, Optional, Tuple
from pathlib import Path

# Constants
ID_PREFIX = "T"
ID_MIN = 0
ID_MAX = 9999
BACKLOG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "tasks",
    "backlog.json"
)
ARCHIVE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "tasks",
    "archive"
)


def load_backlog() -> Dict:
    """Load the current backlog.json file"""
    try:
        with open(BACKLOG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Backlog file not found at {BACKLOG_PATH}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in backlog file: {e}")
        sys.exit(1)


def load_archived_tasks() -> List[Dict]:
    """Load all archived task files from the archive directory"""
    archived_tasks = []
    if not os.path.exists(ARCHIVE_DIR):
        return []

    for file in os.listdir(ARCHIVE_DIR):
        if file.endswith(".json"):
            try:
                with open(os.path.join(ARCHIVE_DIR, file), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "tasks" in data:
                        archived_tasks.extend(data["tasks"])
            except (json.JSONDecodeError, FileNotFoundError) as e:
                print(f"Warning: Error reading archive file {file}: {e}")
                continue
    return archived_tasks


def get_used_ids() -> Tuple[Set[str], Dict[str, str]]:
    """
    Get all currently used IDs from backlog and archives
    Returns:
        Tuple of (set of used IDs, dict mapping IDs to task titles)
    """
    used_ids = set()
    id_to_title = {}

    # Check backlog
    backlog = load_backlog()
    for task in backlog.get("tasks", []):
        if "id" in task and task["id"]:
            used_ids.add(task["id"])
            id_to_title[task["id"]] = task.get("title", "Unknown")

    # Check archives
    archived_tasks = load_archived_tasks()
    for task in archived_tasks:
        if "id" in task and task["id"]:
            used_ids.add(task["id"])
            id_to_title[task["id"]] = task.get("title", "Unknown (Archived)")

    return used_ids, id_to_title


def get_next_available_id() -> str:
    """Get the next available ID from the pool"""
    used_ids, _ = get_used_ids()
    
    # Try IDs sequentially until we find an unused one
    for i in range(ID_MIN, ID_MAX + 1):
        candidate = f"{ID_PREFIX}{i:04d}"
        if candidate not in used_ids:
            return candidate
    
    raise ValueError("No available IDs in the pool (all T0000-T9999 are used)")


def is_valid_id(task_id: str) -> bool:
    """Validate if a string matches the TXXXX format"""
    if not task_id.startswith(ID_PREFIX):
        return False
    try:
        num = int(task_id[1:])
        return ID_MIN <= num <= ID_MAX
    except ValueError:
        return False


def release_id(task_id: str) -> bool:
    """
    Release an ID back to the pool
    Returns True if the ID was valid and in use, False otherwise
    """
    if not is_valid_id(task_id):
        print(f"Error: Invalid ID format: {task_id}")
        return False

    used_ids, id_to_title = get_used_ids()
    if task_id not in used_ids:
        print(f"Warning: ID {task_id} is not currently in use")
        return False

    print(f"ID {task_id} ({id_to_title.get(task_id, 'Unknown')}) is now available")
    return True


def show_status():
    """Display current status of the ID pool"""
    used_ids, id_to_title = get_used_ids()
    total = ID_MAX - ID_MIN + 1
    used = len(used_ids)
    available = total - used

    print(f"\nID Pool Status:")
    print(f"-------------")
    print(f"Total IDs:     {total}")
    print(f"Used IDs:      {used}")
    print(f"Available IDs: {available}")
    print(f"Usage:         {(used/total)*100:.1f}%")


def list_ids():
    """List all used and available IDs"""
    used_ids, id_to_title = get_used_ids()
    
    print("\nUsed IDs:")
    print("---------")
    for task_id in sorted(used_ids):
        print(f"{task_id}: {id_to_title.get(task_id, 'Unknown')}")


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == "next":
        try:
            next_id = get_next_available_id()
            print(next_id)
        except ValueError as e:
            print(f"Error: {e}")
            sys.exit(1)

    elif command == "release" and len(sys.argv) == 3:
        task_id = sys.argv[2]
        if not release_id(task_id):
            sys.exit(1)

    elif command == "status":
        show_status()

    elif command == "list":
        list_ids()

    else:
        print("Error: Invalid command")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
