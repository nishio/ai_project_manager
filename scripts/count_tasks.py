import os
import json


def count_tasks_in_directory(directory):
    task_count = 0
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            with open(os.path.join(directory, filename), "r", encoding="utf-8") as file:
                data = json.load(file)
                if isinstance(data, list):
                    task_count += len(data)
                elif isinstance(data, dict):
                    task_count += len(data.get("tasks", []))
    return task_count


task_directory = "ai_project_manager_data/tasks"
total_tasks = count_tasks_in_directory(task_directory)
print(f"Total number of tasks: {total_tasks}")
