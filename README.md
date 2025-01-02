# AI Project Manager

AIによるタスク管理システム。タスクの自動分類、依存関係の管理、プロジェクトの進捗追跡を行います。

## システム構成

- **システムコード**: このリポジトリ（ai_project_manager）
  - タスク管理システムのコア機能
  - タスクフォーマットの定義
  - AIによるタスク分析・管理機能

- **タスクデータ**: [ai_project_manager_data](https://github.com/nishio/ai_project_manager_data)（プライベートリポジトリ）
  - 実際のタスクデータ（backlog.yaml）
  - プライバシーを考慮し、別リポジトリで管理

## セットアップ

1. 必要なパッケージのインストール
```bash
pip install pyyaml networkx openai
```

2. OpenAI APIキーの設定
```bash
export OPENAI_API_KEY=your_api_key
```

3. タスクデータの設定
- プライベートリポジトリ（ai_project_manager_data）をクローン
- `tasks/backlog.yaml`が存在することを確認

## 使用方法

1. タスクの収集
```bash
python scripts/gather_tasks.py
```

2. タスクの分析・処理
```bash
python scripts/ai_support.py
```

## ドキュメント

- [タスク形式ガイドライン](tasks/docs/policies/task_format.md)
- [システム概要](tasks/docs/knowledge_base/system_overview.md)

## 開発ガイドライン

1. システムコードの変更
   - このリポジトリで管理
   - PRを作成してレビューを受ける

2. タスクデータの更新
   - ai_project_manager_dataリポジトリで管理
   - プライバシーに配慮した運用

## ライセンス

Copyright (c) 2024 Nishio
