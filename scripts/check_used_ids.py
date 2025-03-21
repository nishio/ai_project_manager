import json
import os
from dotenv import load_dotenv
from common_id_utils import find_next_available_id, extract_ids


# Load environment variables
load_dotenv()


def load_backlog(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def main():
    REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_root = os.getenv(
        "DATA_ROOT", os.path.join(os.path.dirname(REPO_ROOT), "ai_project_manager_data")
    )
    backlog_path = os.path.join(data_root, "tasks", "backlog.json")
    backlog_data = load_backlog(backlog_path)
    used_ids = extract_ids(backlog_data["tasks"])

    used_count = len(used_ids)
    next_available_ids = find_next_available_id(used_ids, 10)

    print(f"Used IDs count: {used_count}")
    if used_count > 5000:
        print("Warning: half of ids are used")
    print(f"Next available ID: {next_available_ids}")


if __name__ == "__main__":
    main()
