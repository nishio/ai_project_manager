# AI Project Manager

AIによるタスク管理システム。タスクの自動分類、依存関係の管理、プロジェクトの進捗追跡を行います。

## システム構成

- **システムコード**: このリポジトリ（ai_project_manager）
  - タスク管理システムのコア機能
  - タスクフォーマットの定義
  - AIによるタスク分析・管理機能

- **タスクデータ**: [ai_project_manager_data](https://github.com/nishio/ai_project_manager_data)（プライベートリポジトリ）
  - 実際のタスクデータ（backlog.json）
  - プライバシーを考慮し、別リポジトリで管理

## スクリプトの説明

LLMで書くよりもPythonで書く方が適しているタスクに関して、小さな機能のPythonスクリプトを使う

### スクリプト一覧
docs/scripts.mdを参照

## セットアップ

### 役割別セットアップガイド

#### 1. AIタスク管理者（AI Task Manager）

この役割はAIがSlackなどで人間からの指示を受けてタスクのデータを更新するものである。
Pythonソースコードの編集は担当しない。機能追加やバグ修正が必要になった場合は、タスクリストに追加する

必要な設定：
- システムコードリポジトリのクローン
- タスクデータリポジトリのクローン（権限必要）
- OpenAI APIキーの設定
- Pythonパッケージのインストール

注意：このシステムは Ubuntu 22.04.5 LTS (x86_64) で開発・テストされています。
Macユーザーは追加の設定が必要です。

```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git
cd ai_project_manager

# 2. 環境のセットアップ
## Ubuntu/Debian の場合
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

## Mac の場合
./setup_mac.sh  # graphvizのインストールとvenv環境のセットアップを行います

# 3. 環境変数の設定
## OpenAI APIキーの設定
export OPENAI_API_KEY=your_api_key

## データディレクトリの設定
# ai_project_manager_dataをクローンした絶対パスを指定
export DATA_ROOT=/path/to/ai_project_manager_data  # 例: /home/user/repos/ai_project_manager_data

# 4. タスクデータの取得と確認
python scripts/upkeep_data.py
```

#### 2. AI開発者（AI Developer）
必要な設定：
- システムコードリポジトリのクローン
- タスクデータリポジトリのクローン（権限必要）
- 開発環境のセットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git

# 4. 開発用環境変数の設定
export OPENAI_API_KEY=your_api_key
export USE_TEST_DATA=true  # テストデータを使用
export DATA_ROOT=/path/to/ai_project_manager_data  # ai_project_manager_dataの絶対パス
```

#### 3. 人間（Human）
必要な設定：
- システムコードリポジトリのクローン
- タスクデータリポジトリのクローン（権限必要）
- 開発環境のセットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/nishio/ai_project_manager.git
cd ai_project_manager

# 2. データディレクトリの設定
export DATA_ROOT=/path/to/ai_project_manager_data  # ai_project_manager_dataの絶対パス

# 3. タスクデータの取得と確認
python scripts/upkeep_data.py
```

## 使用方法


### 3. タスクの検証とアーカイブ
```bash
# タスク構造の検証
python scripts/validate_json.py ai_project_manager_data/tasks/backlog.json

# 完了タスクのアーカイブ（手動実行）
python scripts/archive_tasks.py [--date YYYY-MM-DD]
```

注：完了タスクは毎朝5時（JST）に自動的にアーカイブされます。手動実行時は --date オプションで日付を指定できます。

## ドキュメントガイド

### 役割別ガイド

#### AIタスク管理者向け
- [AIタスク管理者向けガイド](docs/for_manager.md)
- [タスク管理ガイドライン](docs/task_management.md) - タスク管理の基本原則と運用方法
- [タスク形式ガイドライン](docs/task_format.md) - タスクの構造と必須フィールドの説明
- [スクリプト説明](docs/scripts.md) - 利用可能なスクリプトの一覧と使用方法

#### 開発者向け
- [スクリプト説明](docs/scripts.md) - スクリプトの詳細な実装と使用方法
- [システムの知見](docs/knowledge_base.md) - システムの基本構造と設計思想
- [タスク形式ガイドライン](docs/task_format.md) - タスクデータ構造の詳細

#### 人間向け
- [人間向けガイド](docs/for_human.md)
- [タスク管理ガイドライン](docs/task_management.md) - タスク管理の基本原則と運用方法
- [タスク形式ガイドライン](docs/task_format.md) - タスクの作成方法
- [システムの知見](docs/knowledge_base.md) - システム全体の理解

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
