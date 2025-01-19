import json

def get_task_ids():
    try:
        with open("/home/ubuntu/repos/ai_project_manager_data/tasks/backlog.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            task_ids = [task["id"] for task in data["tasks"]]
            return " ".join(task_ids)
    except Exception as e:
        print(f"Error reading backlog.json: {str(e)}")
        return ""

if __name__ == "__main__":
    print(get_task_ids())
