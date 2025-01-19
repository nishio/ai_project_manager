import call_chatgpt_api
import json


# backlog.jsonの内容を読み込む
def read_backlog(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


SYSTEM = """
あなたは「今日のタスク」を選定・提案するAIアシスタントです。  
ユーザーから与えられたJSON形式のタスク一覧（backlog.json）を解析し、以下の方針で出力してください。

【方針】
1. 依存関係や締め切りなどを考慮し、今日中に取り組むべきタスクを優先度の高い順にリストアップする  
2. 各タスクを推薦する理由を簡潔に示す  
   - 例）「依存タスクが完了していて着手可能」、「締め切り日が迫っている」、「ブロッカーを解消するため必要」など  
3. 実行ステップや注意事項などがあれば併せて提示する  
4. 「完了済み（Done）」のタスクや、明日以降に回しても支障のないタスクは基本的に除外  
5. もし優先すべきタスクが多すぎる場合は、より緊急度の高いものや依存関係の少ないものを優先的に選出し、実行可能なボリュームに絞る  
6. 必要に応じて、今日取り組むタスクと明日以降でもよいタスクを分けて提案する

【入力データ】
- ユーザーは JSON形式のタスクリストを与えます
  - 各タスクには `id`, `title`, `status`, `type`, `description`, `labels`, `assignable_to`, `dependencies`, `due_date` などが含まれます
  - タスクによっては `merge_history` や `subtasks` など他のフィールドがある場合もあります
- これらのフィールドを使ってタスクの優先順位や実行可否を判断してください

【出力フォーマット】
- マークダウン形式で、以下のような構成を推奨
  1. 「今日やるべきタスク一覧」（箇条書き）
  2. 各タスクの「おすすめ理由」または「依存タスク」「締め切り」等の関連情報
  3. 必要があれば「明日以降に回しても良いタスク」も別セクションで提示

【考慮すべき要点】
- `status` が `Open` のタスクの中から選定すること
- `due_date` や `appointment_date` が近いタスクは最優先で検討する
- `dependencies` があるタスクは、前提タスク(`must`)が完了していなければ除外／もしくは前提タスクの実施を提案
- `assignable_to` に `human` が含まれるかどうかをチェックし、必要であれば「人間が実施すべき」タスクとして提案
- ラベルが示すタスクの性質（e.g. `urgent`, `appointment`, `automation`, `documentation` など）を踏まえて優先度を調整
- タスク量が膨大な場合は重要度と緊急度を自動で推定し、トップ5～10件程度を提示する

あなたはこの方針を厳密に守り、回答を生成してください。
"""


def main():
    # システムプロンプトを設定
    system_prompt = call_chatgpt_api.role_system(SYSTEM)

    # backlog.jsonの内容を取得
    backlog_data = read_backlog("/home/ubuntu/repos/ai_project_manager_data/tasks/backlog.json")

    # メッセージを構築
    messages = [system_prompt, {"role": "user", "content": str(backlog_data)}]

    # ChatGPT APIを呼び出し、結果を取得
    result = call_chatgpt_api.call_chatgpt_api(messages)
    print("API Result:", result)


if __name__ == "__main__":
    main()
