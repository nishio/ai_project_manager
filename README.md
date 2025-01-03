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

#### 1. タスク管理者（Task Manager）
必要な設定：
- システムコードリポジトリのクローン
- タスクデータリポジトリのクローン（書き込み権限必要）
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

#### 2. 開発者（Developer）
必要な設定：
- システムコードリポジトリのクローン
- テストデータの利用
- 開発環境のセットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git

# 2. パッケージのインストール
pip install pyyaml networkx openai

# 3. テストデータの確認
ls tasks/test_advanced.yaml

# 4. 開発用環境変数の設定
export OPENAI_API_KEY=your_api_key
export USE_TEST_DATA=true  # テストデータを使用
```

#### 3. 閲覧者（Viewer）
必要な設定：
- システムコードリポジトリのクローン（読み取り専用）
- タスクデータリポジトリのクローン（読み取り専用）

```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git
git clone https://github.com/nishio/ai_project_manager_data.git

# 2. タスクの閲覧
cd ai_project_manager_data
cat tasks/backlog.yaml
```

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
