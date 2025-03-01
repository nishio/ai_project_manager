import json
import os
from dotenv import load_dotenv
import sys
from common_id_utils import find_next_available_id, load_tasks, save_tasks

# data = sys.stdin.read()
data = """
[
  {
    "title": "3/9 LT発表の資料作成",
    "description": "3/9のLTに向けて発表資料を作成する。骨子→スライド→ブラッシュアップの順で週内に仕上げる。"
  },
  {
    "title": "Plurality Tokyo Namerakaigiの動画編集・公開",
    "description": "録画データを簡単に編集し、YouTube等で公開する。発表内容の鮮度を損なわないよう早めの作業が望ましい。"
  },
  {
    "title": "Devinに研究をさせる仕組みを構築",
    "description": "Devinを拡張し、論文調査や実験検証などを自動で行える環境を整備する。具体的な手法や運用方針を検討し、プロトタイプを作る。"
  },
  {
    "title": "GmailをGeminiに読ませる",
    "description": "Gmailの内容をGeminiに取り込んで要約や自動仕分けを行う方法を検討・実験する。認証やセキュリティ面の対応も含める。"
  }
]
"""

new_tasks = json.loads(data)
# check
for task in new_tasks:
    assert "title" in task
    assert "description" in task

load_dotenv()

tasks = load_tasks()
ids = find_next_available_id(None, len(new_tasks))
for id, task in zip(ids, new_tasks):
    obj = {
        "id": id,
        "status": "Open",
        "title": task["title"],
        "description": task["description"],
    }
    tasks.append(obj)


save_tasks(tasks)
