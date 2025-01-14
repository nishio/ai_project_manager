# タスク形式ガイドライン

## タスクID管理システム

タスク管理システムは2種類のIDを使用します：

1. 一時ID（人間可読）
   - 形式：TXXXX（例：T0001, T0042）
   - 目的：会話やUIでの簡単な参照用
   - 範囲：T0000-T9999（10,000個の一意のID）
   - 用途：ユーザーとのやり取り、チャット参照、UI表示

2. 永続ID（システム用）
   - 形式：UUID v4
   - 目的：長期的な関係性の追跡
   - 範囲：実質無制限
   - 用途：内部参照、データ関係の永続的な管理

## 基本形式 (JSON)

```json
{
  "tasks": [{
    "id": "TXXXX",
    "permanent_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "タスクのタイトル",
    "status": "Open", 
    "type": "task",
    "description": "タスクの詳細な説明。\n複数行可能。",
    "labels": [],
    "assignable_to": [
      "human",
      "ai"
    ],
    "subtasks": [],
    "related_repos": [],
    "dependencies": {
      "must": [
        {
          "task_id": "TYYYY",
          "reason": "このタスクが必要な理由"
        }
      ],
      "nice_to_have": [
        {
          "task_id": "TZZZZ",
          "reason": "このタスクがあると便利な理由"
        }
      ],
      "human": [
        {
          "action": "データのレビュー",
          "assignee": "nishio",
          "status": "waiting",
          "reason": "人間による確認が必要",
          "last_check_time": "2025-01-09T10:30:00"
        }
      ]
    },
    "similar_tasks": [
      {
        "task_id": "TAAAA",
        "similarity_score": 0.8,
        "note": "一部の内容が重複"
      }
    ],
    "due_date": "2024-01-15",
    "appointment_date": "2024-01-16",
    "visibility": "private",
    "security_level": "normal"
  }]
}
```

## 必須フィールド

- `id`: タスク識別子（TXXXXの形式）
- `title`: タスクのタイトル
- `status`: タスクの状態
- `type`: タスクの種類（task/project）
- `description`: タスクの説明

## オプションフィールド

- `labels`: タスクのラベル（配列）
  - `prototype`: 検証用の小規模実装
  - `human-required`: 人間の作業が必要
  - `integration`: 外部システムとの連携
  - `enhancement`: 機能改善
  - `feature`: 新機能
  - `documentation`: ドキュメント関連
  - `automation`: 自動化関連
  - `performance`: パフォーマンス改善
  - `security`: セキュリティ関連
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
- `visibility`: タスクの公開範囲
  - `public`: 公開可能なタスク
  - `private`: 非公開タスク
- `security_level`: タスクのセキュリティレベル
  - `normal`: 一般的なタスク
  - `sensitive`: 機密性の高いタスク
  - `confidential`: 極秘タスク
