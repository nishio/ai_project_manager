# ローカル環境でのタスク管理

このガイドでは、VSCodeを使用してローカル環境でタスクを管理する方法を説明します。

## 初期セットアップ

1. リポジトリのクローン
```bash
# システムコードのクローン
git clone https://github.com/nishio/ai_project_manager.git
cd ai_project_manager

# タスクデータのクローン（アクセス権が必要）
git clone https://github.com/nishio/ai_project_manager_data.git
```

2. 依存関係のインストール
```bash
cd scripts
pip install -r requirements.txt
```

## タスク管理の基本的なワークフロー

### 1. 最新の変更を取得
```bash
git pull
```

### 2. タスクの追加方法

#### A. 自由形式のテキストからタスクを追加
1. テキストファイルを作成（例：new_tasks.txt）
```
月曜に歯医者の予約の電話をする
月曜に眼科検診
```

2. parse_inbox.pyを使用してJSONに変換
```bash
python scripts/parse_inbox.py < new_tasks.txt >> ai_project_manager_data/tasks/backlog.json
```

#### B. 直接JSONを編集
1. VSCodeでbacklog.jsonを開く
2. タスク形式ガイドライン（docs/task_format.md）に従って編集

### 3. バリデーション
変更を保存する前に、JSONの形式が正しいことを確認：
```bash
python scripts/validate_json.py ai_project_manager_data/tasks/backlog.json
```

### 4. 変更のコミットとプッシュ
```bash
cd ai_project_manager_data
git add tasks/backlog.json
git commit -m "Add new tasks"
git push
```

## 便利なVSCode機能

1. JSONの構文ハイライト
   - VSCodeは自動的にJSONファイルを認識し、構文をハイライト表示

2. インデントのガイド
   - スペースの数が重要なので、VSCodeのインデントガイドを活用

3. Git統合
   - 変更の差分表示
   - コミットとプッシュをGUIで実行可能

## トラブルシューティング

1. バリデーションエラー
   - エラーメッセージを確認
   - task_format.mdを参照して形式を修正

2. マージコンフリクト
   ```bash
   git pull  # 最新の変更を取得
   # コンフリクトを解決
   git add tasks/backlog.json
   git commit -m "Resolve conflicts"
   git push
   ```

## ベストプラクティス

1. 定期的に`git pull`を実行して最新の状態を維持

2. 大きな変更を行う前にブランチを作成
   ```bash
   git checkout -b feature/new-tasks
   # 変更を加える
   git push -u origin feature/new-tasks
   # PRを作成
   ```

3. バリデーションスクリプトを活用してエラーを早期に発見

4. コミットメッセージは具体的に記述
