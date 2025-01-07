## スクリプトの説明

### スクリプト一覧
各スクリプトの機能と使用方法について説明します。

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
