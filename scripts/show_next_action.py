import call_chatgpt_api
import json


# backlog.jsonの内容を読み込む
def read_backlog(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


SYSTEM = """
あなたは「今日のタスク」を選定・提案するAIアシスタントです。
与えられたJSONデータを解析し、優先度の高いタスクを提案してください。

【データ形式】
- i: タスクID
- t: タイトル
- d: 説明
- l: 重要ラベル
- m: 必須依存タスク
- h: 人間実行必須
- dd: 期限日
- ad: 予定日

【出力】
- マークダウン形式
- 優先度順にリスト
- 各タスクの推薦理由
- 実行手順（必要時）
"""


def main():
    # システムプロンプトを設定
    system_prompt = call_chatgpt_api.role_system(SYSTEM)

    # backlog.jsonの内容を取得
    backlog_data = read_backlog("/home/ubuntu/repos/ai_project_manager_data/tasks/backlog.json")
    
    # タスクをフィルタリングし、必要最小限のフィールドのみ抽出
    open_tasks = []
    for task in backlog_data.get("tasks", []):
        if task.get("status") != "Open":
            continue
            
        # 必須の依存タスクIDのみ抽出
        must_deps = []
        if task.get("dependencies", {}).get("must"):
            must_deps = [d["task_id"] for d in task["dependencies"]["must"]]
            
        # 重要なラベルのみ抽出
        important_labels = [l for l in task.get("labels", []) if l in ["urgent", "appointment", "must"]]
        
        # 最小限の情報のみ含むタスクオブジェクト
        task_obj = {
            "i": task["id"],  # フィールド名を短縮
            "t": task["title"][:50],  # タイトルも50文字まで
            "d": task.get("description", "")[:50] + "..." if task.get("description", "") else "",  # 説明は50文字まで
        }
        
        # オプションフィールドは値がある場合のみ追加
        if important_labels:
            task_obj["l"] = important_labels
        if must_deps:
            task_obj["m"] = must_deps
        if "human" in task.get("assignable_to", []):
            task_obj["h"] = True
        if task.get("due_date"):
            task_obj["dd"] = task["due_date"]
        if task.get("appointment_date"):
            task_obj["ad"] = task["appointment_date"]
            
        open_tasks.append(task_obj)
    
    print("タスクデータの前処理:")
    print(f"- 全タスク数: {len(backlog_data.get('tasks', []))}")
    print(f"- Openタスク数: {len(open_tasks)}")
    
    # タスクを期限でソート（due_dateとappointment_dateを考慮）
    def get_task_date(task):
        due = task.get("due_date", "9999-12-31")
        appointment = task.get("appointment_date", "9999-12-31")
        return min(due, appointment) if due and appointment else (due or appointment or "9999-12-31")
    
    sorted_tasks = sorted(open_tasks, key=get_task_date)
    
    # 上位5件のタスクを選択（テスト用に制限）
    priority_tasks = sorted_tasks[:5]
    remaining_count = len(sorted_tasks) - 5
    
    filtered_data = {
        "t": priority_tasks,  # フィールド名を短縮
        "s": f"※他に{remaining_count}件のOpenタスクがあります。"
    }
    
    # フィルタリングされたタスクの数を確認
    print(f"分析対象タスク数: {len(priority_tasks)} (残り {remaining_count} 件)")
    
    # メッセージを構築（フィルタリング済みデータをJSON文字列として使用）
    messages = [
        system_prompt,
        {"role": "user", "content": json.dumps(filtered_data, ensure_ascii=False)}
    ]

    # トークン数を推定して表示
    total_chars = sum(len(msg["content"]) for msg in messages)
    jp_chars = sum(sum(1 for c in msg["content"] if ord(c) > 127) for msg in messages)
    en_chars = total_chars - jp_chars
    estimated_tokens = (jp_chars * 2) + en_chars

    print(f"\nデバッグ情報:")
    print(f"- 全文字数: {total_chars}")
    print(f"- 日本語文字数: {jp_chars}")
    print(f"- 英数字文字数: {en_chars}")
    print(f"- 推定トークン数: {estimated_tokens}")

    # トークン数が多すぎる場合は中止
    if estimated_tokens > 6000:
        print(f"エラー: 推定トークン数が多すぎます: {estimated_tokens}")
        return

    # ChatGPT APIを呼び出し、結果を取得（エラーハンドリング付き）
    try:
        print("\nOpenAI APIリクエスト開始...")
        result = call_chatgpt_api.call_chatgpt_api(messages)
        if not result:
            print("エラー: APIから空の結果が返されました")
            return
        print("\n=== タスク提案 ===")
        print(result)  # 結果をそのまま出力（マークダウン形式を保持）
        
        # 結果をファイルに保存
        with open("train_commute_tasks.md", "w", encoding="utf-8") as f:
            f.write("# 今日のタスク提案\n\n")
            f.write(result)
        print("\nタスクリストを train_commute_tasks.md に保存しました")
    except Exception as e:
        print(f"エラー: ChatGPT API呼び出し中にエラーが発生しました: {str(e)}")
        return


if __name__ == "__main__":
    main()
