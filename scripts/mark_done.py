import sys
import json


def mark_done(talk_ids):
    # backlog.jsonを読み込む
    with open("tasks/backlog.json", "r") as file:
        data = json.load(file)

    # 各タスクのステータスを更新
    for task in data["tasks"]:
        if task["id"] in talk_ids:
            task["status"] = "done"

    # 更新されたデータをbacklog.jsonに書き込む
    with open("tasks/backlog.json", "w") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    # コマンドライン引数からTalk IDを取得
    talk_ids = sys.argv[1:]
    mark_done(talk_ids)
