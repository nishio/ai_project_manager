import json
import os
from dotenv import load_dotenv
import sys
from common_id_utils import load_tasks, save_tasks

# 標準入力からJSONデータを読み込む
# デバッグ用のサンプルデータ（実際の使用時はコメントアウト）
data = """
[
  {
    "id": "T0107",
    "title": "世論地図のソースコード整理とREADME整備",
    "description": "Devinのプライベート化が完了したため、世論地図のソースコードを整理し、READMEを追記してOSS公開できるようにする。公開に不要な部分を切り離し、ライセンスや利用方法を明記。"
  },
  {
    "id": "T0098",
    "title": "メモ帳+夜AI入力フローの検証 (紙メモ翌朝スタート)",
    "description": "昼間は紙メモで短期タスクを管理し、夜にAIへまとめて入力する運用を試行。翌朝は紙メモを見ればタスクを把握できるようにし、AIは整理・補足に活用。効果測定と改善策を検討する。"
  },
  {
    "id": "T0116",
    "title": "情報チャンネル増加への対応策を検討",
    "description": "Signal・Slack・ChatGPTなど多数の情報源が増え混乱が大きい。まず主要な混乱要因を洗い出し、最小限の統合・自動化策を試すところから始める。小さく運用を回しながら改善点を検証。"
  },
  {
    "id": "T0099",
    "title": "o1を使用したタスク管理スクリプトの開発 (ローカル実行)",
    "description": "ChatGPT 4.0 ではなく o1 にAPIを置き換えてタスク管理スクリプトを開発。とりあえずローカル環境で実行し、タイムアウト等の問題を回避。基本機能のMVPを作り、効果を確認する。"
  }
]
"""
# 実際の使用時はこちらを使用
# data = sys.stdin.read()

# JSONデータをパース
update_tasks = json.loads(data)

# 各タスクにIDが含まれていることを確認
for task in update_tasks:
    assert "id" in task, "更新するタスクにはIDが必要です"
    assert "title" in task, "タスクにはタイトルが必要です"
    assert "description" in task, "タスクには説明が必要です"

# 環境変数を読み込む
load_dotenv()

# 既存のタスクを読み込む
tasks = load_tasks()

# 更新されたタスクの数を追跡
updated_count = 0
not_found_ids = []

# 各更新タスクについて処理
for update_task in update_tasks:
    task_id = update_task["id"]
    found = False

    # 既存のタスクリストから一致するIDを探す
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            # タスクを更新（必須フィールドのみ更新）
            tasks[i]["title"] = update_task["title"]
            tasks[i]["description"] = update_task["description"]

            # オプションフィールドがあれば更新
            for key, value in update_task.items():
                if key not in ["id", "title", "description"]:
                    tasks[i][key] = value

            updated_count += 1
            found = True
            break

    # IDが見つからなかった場合
    if not found:
        not_found_ids.append(task_id)

# 更新されたタスクリストを保存
save_tasks(tasks)

# 結果を表示
print(f"{updated_count}個のタスクが更新されました。")
if not_found_ids:
    print(f"以下のIDのタスクは見つかりませんでした: {', '.join(not_found_ids)}")
