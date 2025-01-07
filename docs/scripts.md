# スクリプトガイド

## スクリプト一覧
各スクリプトの機能、使用方法、実行結果について説明します。以下のスクリプトは、タスク管理システムの効率的な運用をサポートします。

#### collect_scrapbox_updates.py
- 目的：Scrapboxの更新ページを収集
- 機能：
- 指定期間の更新ページを取得
- 作成日時・更新日時を含めて保存
- Markdown形式でローカルファイルに出力
- 使用方法：
- 過去N日の更新を取得：`python scripts/collect_scrapbox_updates.py nishio --days N`
- 特定日の更新を取得：`python scripts/collect_scrapbox_updates.py nishio --date YYYY-MM-DD`

#### validate_yaml.py
- 目的：タスクデータのYAMLファイルを検証
- 機能：
- タスクの必須フィールドの存在確認
- 依存関係の構造の検証
- 類似タスクの情報の検証
- 使用方法：`python scripts/validate_yaml.py <yaml_file>`

#### verify_env.py
- 目的：必要なパッケージのインストール状態を確認
- 機能：
- networkxとgraphvizパッケージの存在確認
- バージョン情報の表示
- 使用方法：`python scripts/verify_env.py`

#### test_ai_support.py
- 目的：AIサポート機能のテスト実行
- 機能：
- タスク分析機能のテスト
- プロジェクト分解機能のテスト
- 多言語翻訳機能のテスト
- 使用方法：`python scripts/test_ai_support.py`

#### check_env.py
- 目的：環境変数の設定確認
- 機能：
- OpenAI APIキーの設定確認
- 使用方法：`python scripts/check_env.py`

#### visualize_graph.py
- 目的：タスクの依存関係をグラフとして可視化
- 機能：
- タスク間の依存関係の可視化
- 必須/オプション依存の区別
- 人的依存の表示
- 使用方法：`python scripts/visualize_graph.py`
- 出力：`tasks/task_graph.png`

#### gather_tasks.py
- 目的：タスク情報の収集と分析
- 機能：
- タスクの読み込みと整理
- プロジェクトの分解
- 類似タスクの検出
- 依存関係の分析
- 使用方法：`python scripts/gather_tasks.py`

#### ai_support.py
- 目的：AIによるタスク管理支援
- 機能：
- タスクの複雑さと工数の分析
- プロジェクトのサブタスクへの分解
- タスク説明の多言語翻訳
- 使用方法：AITaskProcessorクラスをインポートして使用

#### merge_tasks.py
- 目的：複数のタスクを1つに統合
- 機能：
- タスクの統合
- 依存関係の結合
- 履歴の保持
- 使用方法：`python scripts/merge_tasks.py <backlog.yaml> <task_id1> <task_id2>`

#### archive_tasks.py
- 目的：完了タスクを日付別アーカイブに移動
- 機能：
  - 完了タスク（status: Done）の抽出
  - 日付別アーカイブファイルの作成（YYYY-MM-DD.yaml）
  - バックアップの自動作成（tasks/backup/）
  - 期限切れタスクの検出と通知
- 使用方法：
  - 手動実行：`python scripts/archive_tasks.py [--date YYYY-MM-DD]`
  - 自動実行：GitHub Actionsにより毎朝5時（JST）に実行
- 実行結果：
  - バックアップファイルの作成（tasks/backup/backlog.yaml.YYYYMMDD_HHMMSS.bak）
  - アーカイブファイルの更新（tasks/archive/YYYY-MM-DD.yaml）
  - 処理結果の表示（完了タスク数、アーカイブ済み数、期限切れ数）
- 注意事項：
  - 期限切れタスクは自動的にアーカイブされず、人間の確認が必要
  - バックアップは毎回自動的に作成され、タイムスタンプ付きで保存
  - GitHub Actionsでの自動実行時は前日分のタスクが処理される
