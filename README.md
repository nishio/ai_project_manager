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
git clone https://github.com/nishio/ai_project_manager_data.git
cd ai_project_manager

# 2. 環境のセットアップ
## Ubuntu/Debian の場合
sudo apt-get update
sudo apt-get install -y graphviz
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

## Mac の場合
./setup_mac.sh  # graphvizのインストールとvenv環境のセットアップを行います

# 3. OpenAI APIキーの設定
export OPENAI_API_KEY=your_api_key

# 4. タスクデータの確認
cd ../ai_project_manager_data
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

### 1. タスクの収集と分析
```bash
# タスクの収集と整理
python scripts/gather_tasks.py
```
実行結果：
- タスクの読み込みと整理：backlog.yamlからタスクを読み込み、構造を分析
- プロジェクトの分解：大きなプロジェクトを管理可能なサブタスクに分解
- 類似タスクの検出：重複や関連するタスクを自動的に特定
- 依存関係の分析：タスク間の依存関係をグラフとして可視化（task_graph.pngが生成）

### 2. AIによるタスク分析と支援
```bash
python scripts/ai_support.py
```
実行結果：
- タスクの複雑さと工数の分析：各タスクの規模と必要な作業量を推定
- プロジェクトの自動分解：大規模タスクを実行可能な単位に分割
- タスク説明の多言語対応：必要に応じて説明を他言語に翻訳
- 依存関係の最適化提案：タスクの実行順序や並列化の可能性を提案

### 3. タスクの検証
```bash
# タスク構造の検証
python scripts/validate_yaml.py tasks/backlog.yaml

# 依存関係の可視化
python scripts/visualize_graph.py
```

## ドキュメントガイド

### 役割別ガイド

#### AIタスク管理者向け
- [タスク形式ガイドライン](docs/task_format.md) - タスクの構造と必須フィールドの説明
- [タスク管理ガイドライン](docs/task_management.md) - タスク管理の基本原則と運用方法
- [スクリプト説明](docs/scripts.md) - 利用可能なスクリプトの一覧と使用方法

#### 開発者向け
- [スクリプト説明](docs/scripts.md) - スクリプトの詳細な実装と使用方法
- [システムの知見](docs/knowledge_base.md) - システムの基本構造と設計思想
- [タスク形式ガイドライン](docs/task_format.md) - タスクデータ構造の詳細

#### 人間向け
- [タスク管理ガイドライン](docs/task_management.md) - タスク管理の基本的な考え方
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
