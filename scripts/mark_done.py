import sys
import json
import os
from datetime import datetime
from util_human_id_match import human_id_match
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# タスクファイルのパス
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_root = os.getenv("DATA_ROOT", os.path.join(os.path.dirname(REPO_ROOT), "ai_project_manager_data"))
BACKLOG_FILE = os.path.join(data_root, "tasks", "backlog.json")


def mark_done(talk_ids):
    # backlog.jsonを読み込む
    with open(BACKLOG_FILE, "r") as file:
        data = json.load(file)

    # 各タスクのステータスを更新
    done_tasks = []
    for task in data["tasks"]:
        task_id = task["id"]
        if any(human_id_match(task_id, talk_id) for talk_id in talk_ids):
            task["status"] = "Done"
            task["completion_time"] = datetime.now().isoformat()
            done_tasks.append(task)

    # 更新されたデータをbacklog.jsonに書き込む
    with open(BACKLOG_FILE, "w") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

    # 完了したタスクを報告
    if done_tasks:
        print("以下のタスクが完了しました:")
        for task in done_tasks:
            print(f"- {task['id']}: {task.get('title', 'NO_TITLE')}")
    else:
        print("指定されたIDのタスクは見つかりませんでした。")


if __name__ == "__main__":
    # コマンドライン引数からTalk IDを取得
    talk_ids = sys.argv[1:]
    mark_done(talk_ids)
