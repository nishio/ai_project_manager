#!/usr/bin/env python3
import json
from datetime import datetime
import os

def verify_archived_completion_time():
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Get today's date in JST
    archive_date = datetime.now().strftime("%Y-%m-%d")
    data_root = os.getenv("DATA_ROOT", "/home/ubuntu/repos/ai_project_manager_data")
    archive_file = os.path.join(data_root, "tasks", "archive", f"{archive_date}.json")
    
    if not os.path.exists(archive_file):
        print(f"Error: Archive file not found: {archive_file}")
        return
        
    with open(archive_file, "r") as f:
        data = json.load(f)
        for task in data["tasks"]:
            if task.get("id") == "T0026":
                print("Archived Task T0026 verification results:")
                print(json.dumps(task, indent=2, ensure_ascii=False))
                
                # Verify completion_time format
                completion_time = task.get("completion_time")
                if completion_time:
                    try:
                        # Verify ISO 8601 format by parsing
                        datetime.fromisoformat(completion_time)
                        print("\nArchived completion time validation:")
                        print(f"✓ completion_time preserved: {completion_time}")
                        print("✓ valid ISO 8601 format maintained")
                        print("✓ properly formatted as JSON string")
                        print(f"✓ found in correct archive file: {archive_date}.json")
                    except ValueError as e:
                        print(f"✗ Invalid ISO 8601 format in archive: {e}")
                else:
                    print("✗ completion_time field missing from archived task")
                return
        print("✗ Task T0026 not found in archive")

if __name__ == "__main__":
    verify_archived_completion_time()
