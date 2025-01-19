import json
import uuid
from common_id_utils import find_next_available_id


def load_tasks(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_tasks(filepath, data):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def generate_unique_id(existing_ids):
    return find_next_available_id(existing_ids)


def replace_duplicate_ids(filepath):
    data = load_tasks(filepath)
    tasks = data.get("tasks", [])

    temp_ids = {}
    permanent_ids = {}
    existing_ids = set()

    for task in tasks:
        _tid = task.get("id", None)
        _pid = task.get("permanent_id", None)

        if _tid:
            if _tid in temp_ids:
                new_id = generate_unique_id(existing_ids)
                print(
                    f"Replacing duplicate temporary ID {_tid} with {new_id} for task '{task.get('title', 'UNKNOWN')}'"
                )
                task["id"] = new_id
            else:
                temp_ids[_tid] = task.get("title", "UNKNOWN")
                existing_ids.add(_tid)

        if _pid:
            if _pid in permanent_ids:
                new_id = str(uuid.uuid4())
                print(
                    f"Replacing duplicate permanent ID {_pid} with {new_id} for task '{task.get('title', 'UNKNOWN')}'"
                )
                task["permanent_id"] = new_id
            else:
                permanent_ids[_pid] = task.get("title", "UNKNOWN")
                existing_ids.add(_pid)

    save_tasks(filepath, data)


if __name__ == "__main__":
    replace_duplicate_ids("ai_project_manager_data/tasks/backlog.json")
