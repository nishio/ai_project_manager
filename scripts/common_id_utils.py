import re
import os
import json


def get_backlog_path():
    REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_root = os.getenv(
        "DATA_ROOT",
        os.path.join(os.path.dirname(REPO_ROOT), "ai_project_manager_data"),
    )
    backlog_path = os.path.join(data_root, "tasks", "backlog.json")
    return backlog_path


def load_backlog():
    backlog_path = get_backlog_path()
    with open(backlog_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_tasks():
    backlog_data = load_backlog()
    tasks = backlog_data["tasks"]
    return tasks


def save_tasks(tasks):
    backlog_path = get_backlog_path()
    backlog = {"tasks": tasks}
    with open(backlog_path, "w", encoding="utf-8") as backlog_file:
        json.dump(backlog, backlog_file, ensure_ascii=False, indent=2)


def extract_ids(tasks=None):
    if tasks == None:
        tasks = load_tasks()

    id_pattern = re.compile(r"^T\d{4}$")
    return [task["id"] for task in tasks if id_pattern.match(task["id"])]


def find_next_available_id(used_ids=None, request=1):
    if used_ids == None:
        used_ids = extract_ids()

    valid_ids = [id for id in used_ids if re.match(r"^T\d{4}$", id)]
    used_numbers = sorted(int(id[1:]) for id in valid_ids)
    result = []
    for i in range(1, used_numbers[-1] + 2):
        if i not in used_numbers:
            if request == 1:
                return f"T{i:04}"
            result.append(f"T{i:04}")
            if len(result) == request:
                break
    return result
