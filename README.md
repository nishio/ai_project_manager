# AI Project Manager

AIによるタスク管理システムです。

## 役割
役割には「タスク管理者」「開発者」「ユーザ」の3種類がある。
あなたが人間ではなく、「開発者だ」と言われていない場合、あなたは「タスク管理者」である。
あなたの役割を理解し、役割に沿って行動せよ。

## 役割別ネクストアクション

### 1. AIタスク管理者（AI Task Manager）

[docs/for_manager.md](docs/for_manager.md)を読め


#### 2. 開発者(AI or Human)

[docs/for_developer.md](docs/for_developer.md)を読め


## システム構成

- **システムコード**: このリポジトリ（ai_project_manager）
  - タスク管理システムのコア機能
  - タスクフォーマットの定義
  - AIによるタスク分析・管理機能

- **タスクデータ**: [ai_project_manager_data](https://github.com/nishio/ai_project_manager_data)（プライベートリポジトリ）
  - 西尾の実際のタスクデータ（backlog.json）
  - 公開してはいけないタスクが含まれる可能性があるので公開リポジトリに書かないように配慮した運用をせよ

## スクリプトの説明

LLMで書くよりもPythonで書く方が適しているタスクに関して、小さな機能のPythonスクリプトを使う

### スクリプト一覧
[docs/scripts.md](docs/scripts.md)を参照

## セットアップ

### 1. リポジトリのクローン

```bash
# システムコードリポジトリ
git clone https://github.com/nishio/ai_project_manager.git

# タスクデータリポジトリ（権限が必要です）
git clone https://github.com/nishio/ai_project_manager_data.git
```

> **注記**: タスクデータリポジトリはプライベートリポジトリであり、アクセス権限が必要です。

### 2. 開発環境のセットアップ

#### Ubuntu/Debian の場合

```bash
cd ai_project_manager
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Mac の場合

```bash
cd ai_project_manager
./setup_mac.sh  # graphvizのインストールとvenv環境のセットアップを行います
```

### 3. タスクデータの取得

```bash
source venv/bin/activate
python scripts/upkeep_data.py
```

### 4. 環境変数の設定

環境変数は`.env`ファイルを使用して設定します。以下の内容を含む`.env`ファイルをプロジェクトのルートディレクトリに作成してください。

```
OPENAI_API_KEY=<your_api_key>
DATA_ROOT=ai_project_manager_data
```

> **注記**: `.env`ファイルは機密情報を含むため、バージョン管理システムに含めないように注意してください。
> `.env.example`ファイルを参考にしてください。

## 使用方法

### 1. タスクの管理

#### タスクの追加

タスクを追加するには、以下の方法があります：

1. **直接JSONを編集**
   ```bash
   # backlog.jsonを開いて編集
   vim ai_project_manager_data/tasks/backlog.json
   ```

2. **スクリプトを使用**
   ```bash
   # 自由形式のテキストからタスクを追加
   python scripts/parse_inbox.py < new_tasks.txt >> ai_project_manager_data/tasks/backlog.json
   ```

#### タスクの検証

```bash
# タスク構造の検証
python scripts/validate_backlog.py ai_project_manager_data/tasks/backlog.json
```

#### タスクの完了マーク

```bash
# タスクを完了としてマーク
python scripts/mark_done.py <task_id1> <task_id2> ...
```

### 2. タスクの可視化

```bash
# タスクの依存関係をグラフとして可視化
python scripts/visualize_graph.py
```

出力されたグラフは`tasks/task_graph.png`に保存されます。

### 3. タスクのアーカイブ

```bash
# 完了タスクのアーカイブ（手動実行）
python scripts/archive_tasks.py [--date YYYY-MM-DD]
```

注：完了タスクは毎朝5時（JST）に自動的にアーカイブされます。手動実行時は --date オプションで日付を指定できます。

### 4. Webインターフェースの使用

Webインターフェースを起動するには：

```bash
cd server
npm install
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてWebインターフェースを使用できます。


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



## ライセンス

Copyright (c) 2024 NISHIO Hirokazu
MIT License
