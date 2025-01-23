#!/usr/bin/env python3
import json
from datetime import datetime

def verify_completion_time():
    with open("../ai_project_manager_data/tasks/backlog.json", "r") as f:
        data = json.load(f)
        for task in data["tasks"]:
            if task.get("id") == "T0026":
                print("Task T0026 verification results:")
                print(json.dumps(task, indent=2, ensure_ascii=False))
                
                # Verify completion_time format
                completion_time = task.get("completion_time")
                if completion_time:
                    try:
                        # Verify ISO 8601 format by parsing
                        datetime.fromisoformat(completion_time)
                        print("\nCompletion time validation:")
                        print(f"✓ completion_time exists: {completion_time}")
                        print("✓ valid ISO 8601 format")
                        print("✓ properly formatted as JSON string")
                    except ValueError as e:
                        print(f"✗ Invalid ISO 8601 format: {e}")
                else:
                    print("✗ completion_time field missing")
                break

if __name__ == "__main__":
    verify_completion_time()
