import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def append_new_tasks_to_backlog(new_tasks_path, backlog_path):
    # new_task.jsonを読み込む
    with open(new_tasks_path, "r", encoding="utf-8") as new_tasks_file:
        new_tasks = json.load(new_tasks_file)

    # backlog.jsonを読み込む
    with open(backlog_path, "r", encoding="utf-8") as backlog_file:
        backlog = json.load(backlog_file)

    # new_task.jsonのタスクをbacklog.jsonのtasksリストに追加
    backlog["tasks"].extend(new_tasks)

    # 更新されたbacklog.jsonを保存
    with open(backlog_path, "w", encoding="utf-8") as backlog_file:
        json.dump(backlog, backlog_file, ensure_ascii=False, indent=2)


# スクリプトの実行
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_root = os.getenv("DATA_ROOT", os.path.join(os.path.dirname(REPO_ROOT), "ai_project_manager_data"))
append_new_tasks_to_backlog(
    os.path.join(data_root, "tasks", "new_task.json"),
    os.path.join(data_root, "tasks", "backlog.json"),
)
