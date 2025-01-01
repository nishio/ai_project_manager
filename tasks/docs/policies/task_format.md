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
