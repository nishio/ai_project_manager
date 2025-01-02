# タスク形式ガイドライン

## 基本形式 (YAML)

```yaml
- id: "TXXXX"
  title: "タスクのタイトル"
  status: "Open" # Open, In Progress, Done, Blocked
  type: "task" # task, project
  description: >
    タスクの詳細な説明。
    複数行可能。
  labels: []
  assignable_to:
    - human
    - ai
  subtasks: [] # プロジェクトの場合のみ
  related_repos: [] # 関連するリポジトリ
  dependencies: # 依存関係（オプション）
    must: # 必須の依存関係
      - task_id: "TYYYY"
        reason: "このタスクが必要な理由"
    nice_to_have: # あると便利な依存関係
      - task_id: "TZZZZ"
        reason: "このタスクがあると便利な理由"
    human: # 人間の操作が必要な依存関係
      - action: "データのレビュー"
        assignee: "nishio"
        status: "waiting" # waiting, approved, rejected
        reason: "人間による確認が必要"
  similar_tasks: # 類似タスク（オプション）
    - task_id: "TAAAA"
      similarity_score: 0.8 # 類似度スコア（0.0-1.0）
      note: "一部の内容が重複"
  due_date: "2024-01-15" # 締め切り日（オプション）。前倒しで実行可能なタスクの期限。YYYY-MM-DD形式または曜日指定（例：月曜）
  appointment_date: "2024-01-16" # 予定日（オプション）。指定された日時にのみ実行可能なタスク。YYYY-MM-DD形式または曜日指定（例：月曜）
```

## 必須フィールド

- `id`: タスク識別子（TXXXXの形式）
- `title`: タスクのタイトル
- `status`: タスクの状態
- `type`: タスクの種類（task/project）
- `description`: タスクの説明

## オプションフィールド

- `labels`: タスクのラベル（配列）
- `assignable_to`: タスクの実行可能者（human/ai）
- `subtasks`: サブタスクのリスト（プロジェクトの場合）
- `related_repos`: 関連するリポジトリのリスト
- `dependencies`: タスクの依存関係
  - `must`: 必須の依存関係（完了が必要なタスク）
  - `nice_to_have`: あると便利な依存関係（オプショナルなタスク）
  - `human`: 人間の操作が必要な依存関係（レビュー、承認など）
- `similar_tasks`: 類似または重複するタスク
  - `task_id`: 類似タスクのID
  - `similarity_score`: 類似度スコア（0.0-1.0）
  - `note`: 類似性に関する説明
- `due_date`: タスクの締め切り日（オプション）
  - 前倒しで実行可能なタスクの期限
  - YYYY-MM-DD形式の日付
  - または曜日指定（例：月曜）
- `appointment_date`: タスクの予定日（オプション）
  - 指定された日時にのみ実行可能なタスク
  - YYYY-MM-DD形式の日付
  - または曜日指定（例：月曜）
