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

1. タスクの収集
```bash
python scripts/gather_tasks.py
```

nishio: エラーは出ないが機能しているか不明
TODO: どのように使ってどのような結果が出るのか記述する

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
