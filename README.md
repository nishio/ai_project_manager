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

## セットアップ

### 役割別セットアップガイド

#### 1. AIタスク管理者（AI Task Manager）

この役割はAIがSlackで人間からの指示を受けてタスクのデータを更新するものである。
Pythonソースコードの編集は担当しない、機能追加やバグ修正が必要になった場合は、タスクリストに追加する

必要な設定：
- システムコードリポジトリのクローン
- タスクデータリポジトリのクローン（権限必要）
- OpenAI APIキーの設定
- Pythonパッケージのインストール

```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git
git clone https://github.com/nishio/ai_project_manager_data.git

# 2. パッケージのインストール
pip install pyyaml networkx openai

# 3. OpenAI APIキーの設定
export OPENAI_API_KEY=your_api_key

# 4. タスクデータの確認
cd ai_project_manager_data
ls tasks/backlog.yaml
```

#### 2. AI開発者（AI Developer）
必要な設定：
- システムコードリポジトリのクローン
- タスクデータリポジトリのクローン（権限必要）
- 開発環境のセットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git

# 2. パッケージのインストール
pip install pyyaml networkx openai

# 4. 開発用環境変数の設定
export OPENAI_API_KEY=your_api_key
export USE_TEST_DATA=true  # テストデータを使用
```

#### 3. 人間（Human）
必要な設定：
- システムコードリポジトリのクローン
- タスクデータリポジトリのクローン（権限必要）
- 開発環境のセットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git
cd ai_project_manager  # 単一のVSCodeウィンドウで開きたいため
git clone https://github.com/nishio/ai_project_manager_data.git
```

## 使用方法

1. タスクの収集
```bash
python scripts/gather_tasks.py
```

nishio: エラーは出ないが機能しているか不明

2. タスクの分析・処理
```bash
python scripts/ai_support.py
```

nishio: エラーは出ないが機能しているか不明

## ドキュメント

- [タスク形式ガイドライン](tasks/docs/policies/task_format.md)
- [システム概要](tasks/docs/knowledge_base/system_overview.md)

## 開発ガイドライン

1. システムコードの変更
   - このリポジトリで管理
   - PRを作成してレビューを受ける

2. タスクデータの更新
   - ai_project_manager_dataリポジトリで管理
   - 公開してはいけないタスクが含まれる可能性があるので公開リポジトリに書かないように配慮した運用をせよ

## ライセンス

Copyright (c) 2024 Nishio
MIT License