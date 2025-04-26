# スクリプトガイド

各スクリプトの機能、使用方法、実行結果について説明します。以下のスクリプトは、タスク管理システムの効率的な運用をサポートします。

## 目次

- [主要スクリプト](#主要スクリプト)
- [タスク管理スクリプト](#タスク管理スクリプト)
- [データ管理スクリプト](#データ管理スクリプト)
- [可視化スクリプト](#可視化スクリプト)
- [ユーティリティスクリプト](#ユーティリティスクリプト)

## 主要スクリプト

### upkeep_data.py
- **目的**: 最新のデータをGitリポジトリから取得
- **入力**: なし
- **出力**: 最新のタスクデータ
- **使用方法**: 
  ```bash
  python scripts/upkeep_data.py
  ```
- **注意事項**: タスクデータリポジトリへのアクセス権限が必要

### push_backlog.py
- **目的**: ローカルのデータをGitリポジトリにpush
- **入力**: なし
- **出力**: リポジトリへのpush結果
- **使用方法**: 
  ```bash
  python scripts/push_backlog.py
  ```
- **注意事項**: タスクデータリポジトリへの書き込み権限が必要

### validate_backlog.py
- **目的**: `backlog.json`の構造と必須フィールドを検証
- **入力**: backlog.jsonのパス
- **出力**: 検証結果（エラーがある場合はエラーメッセージ）
- **使用方法**: 
  ```bash
  python scripts/validate_backlog.py [path/to/backlog.json]
  ```
- **注意事項**: パスを指定しない場合はデフォルトのパスが使用される

### archive_tasks.py
- **目的**: 完了タスクを日付別アーカイブに移動
- **入力**: 
  - `--date YYYY-MM-DD`: アーカイブ日付（オプション）
- **出力**: 
  - バックアップファイル（tasks/backup/backlog.json.YYYYMMDD_HHMMSS.bak）
  - アーカイブファイル（tasks/archive/YYYY-MM-DD.json）
  - 処理結果の表示
- **使用方法**: 
  ```bash
  python scripts/archive_tasks.py [--date YYYY-MM-DD]
  ```
- **注意事項**: 
  - 期限切れタスクは自動的にアーカイブされず、人間の確認が必要
  - バックアップは毎回自動的に作成され、タイムスタンプ付きで保存
  - GitHub Actionsでの自動実行時は前日分のタスクが処理される

## タスク管理スクリプト

### add_task.py
- **目的**: 新しいタスクをbacklog.jsonに追加
- **入力**: タスク情報（コマンドライン引数）
- **出力**: 更新されたbacklog.json
- **使用方法**: 
  ```bash
  python scripts/add_task.py "タスクの説明"
  ```

### append_tasks.py
- **目的**: 複数のタスクをbacklog.jsonに追加
- **入力**: タスク情報を含むJSONファイル
- **出力**: 更新されたbacklog.json
- **使用方法**: 
  ```bash
  python scripts/append_tasks.py path/to/tasks.json
  ```

### mark_done.py
- **目的**: `backlog.json`内のタスクのステータスを「Done」に更新
- **入力**: タスクID（複数指定可能）
- **出力**: 更新されたbacklog.json
- **使用方法**: 
  ```bash
  python scripts/mark_done.py <task_id1> <task_id2> ...
  ```
- **注意事項**: 存在しないタスクIDを指定するとエラーになる

### extract_tasks_from_chat.py
- **目的**: チャットログからタスクを抽出
- **入力**: チャットログのテキストファイル
- **出力**: 抽出されたタスク情報（JSONPatch形式）
- **使用方法**: 
  ```bash
  python scripts/extract_tasks_from_chat.py < chat_log.txt
  ```
- **注意事項**: OpenAI APIキーが必要

### merge_tasks.py
- **目的**: 複数のタスクを1つに統合
- **入力**: 
  - backlog.jsonのパス
  - 統合するタスクID（2つ以上）
- **出力**: 統合されたタスク情報を含むbacklog.json
- **使用方法**: 
  ```bash
  python scripts/merge_tasks.py <backlog.json> <task_id1> <task_id2>
  ```
- **注意事項**: 統合後は元のタスクは削除される

### show_next_action.py
- **目的**: ChatGPT APIを使用して今日のタスクを提案
- **入力**: なし
- **出力**: 提案されたタスクのリスト
- **使用方法**: 
  ```bash
  python scripts/show_next_action.py
  ```
- **注意事項**: OpenAI APIキーが必要

### show_tasks.py
- **目的**: タスクの一覧を表示
- **入力**: 
  - `--status`: フィルタするステータス（オプション）
  - `--label`: フィルタするラベル（オプション）
- **出力**: フィルタされたタスクの一覧
- **使用方法**: 
  ```bash
  python scripts/show_tasks.py [--status Open] [--label feature]
  ```

### update_tasks.py
- **目的**: 既存のタスクを更新
- **入力**: 更新情報を含むJSONファイル
- **出力**: 更新されたbacklog.json
- **使用方法**: 
  ```bash
  python scripts/update_tasks.py path/to/updates.json
  ```

## データ管理スクリプト

### apply_patch.py
- **目的**: JSONPatchを適用してbacklog.jsonを更新
- **入力**: JSONPatchファイル
- **出力**: 更新されたbacklog.json
- **使用方法**: 
  ```bash
  python scripts/apply_patch.py path/to/patch.json
  ```

### check_json_format.py
- **目的**: JSONファイルのフォーマットをチェックし再フォーマット
- **入力**: JSONファイルのパス
- **出力**: フォーマットされたJSONファイル
- **使用方法**: 
  ```bash
  python scripts/check_json_format.py path/to/file.json
  ```

### check_used_ids.py
- **目的**: 使用中のタスクIDを確認
- **入力**: backlog.jsonのパス
- **出力**: 使用中のタスクIDのリスト
- **使用方法**: 
  ```bash
  python scripts/check_used_ids.py [path/to/backlog.json]
  ```

### common_id_utils.py
- **目的**: タスクID管理のユーティリティ関数を提供
- **入力**: なし（ライブラリとして使用）
- **出力**: なし
- **使用方法**: 他のスクリプトからインポートして使用

### count_tags.py
- **目的**: タスクのタグ（ラベル）の使用頻度を集計
- **入力**: backlog.jsonのパス
- **出力**: タグの使用頻度の集計結果
- **使用方法**: 
  ```bash
  python scripts/count_tags.py [path/to/backlog.json]
  ```

### count_tasks.py
- **目的**: ステータス別のタスク数を集計
- **入力**: backlog.jsonのパス
- **出力**: ステータス別のタスク数
- **使用方法**: 
  ```bash
  python scripts/count_tasks.py [path/to/backlog.json]
  ```

### manage_4digit_ids.py
- **目的**: 4桁のタスクID（TXXXX）を管理
- **入力**: 
  - `--check`: 重複IDをチェック
  - `--fix`: 重複IDを修正
- **出力**: チェック結果または修正結果
- **使用方法**: 
  ```bash
  python scripts/manage_4digit_ids.py --check
  python scripts/manage_4digit_ids.py --fix
  ```

### migrate_to_firestore.py
- **目的**: タスクデータをFirestoreに移行
- **入力**: backlog.jsonのパス
- **出力**: Firestoreへの移行結果
- **使用方法**: 
  ```bash
  python scripts/migrate_to_firestore.py [path/to/backlog.json]
  ```
- **注意事項**: Firebase認証情報が必要

### replace_duplicate_ids.py
- **目的**: 重複したタスクIDを検出し置き換え
- **入力**: backlog.jsonのパス
- **出力**: 更新されたbacklog.json
- **使用方法**: 
  ```bash
  python scripts/replace_duplicate_ids.py [path/to/backlog.json]
  ```

### update_repositories.py
- **目的**: タスクの関連リポジトリ情報を更新
- **入力**: backlog.jsonのパス
- **出力**: 更新されたbacklog.json
- **使用方法**: 
  ```bash
  python scripts/update_repositories.py [path/to/backlog.json]
  ```

### verify_archive.py
- **目的**: アーカイブされたタスクの整合性を検証
- **入力**: アーカイブディレクトリのパス
- **出力**: 検証結果
- **使用方法**: 
  ```bash
  python scripts/verify_archive.py [path/to/archive/dir]
  ```

### verify_completion.py
- **目的**: 完了マークされたタスクの依存関係を検証
- **入力**: backlog.jsonのパス
- **出力**: 検証結果（問題がある場合は警告）
- **使用方法**: 
  ```bash
  python scripts/verify_completion.py [path/to/backlog.json]
  ```

### verify_tasks.py
- **目的**: 公開リポジトリとプライベートリポジトリ間でタスクを検証
- **入力**: 
  - 公開タスクJSONのパス
  - プライベートタスクJSONのパス
- **出力**: 検証結果
- **使用方法**: 
  ```bash
  python scripts/verify_tasks.py <public_json> <private_json>
  ```

### yaml_to_json.py
- **目的**: YAMLファイルをJSON形式に変換
- **入力**: YAMLファイルのパス
- **出力**: 変換されたJSONファイル
- **使用方法**: 
  ```bash
  python scripts/yaml_to_json.py path/to/file.yaml
  ```

## 可視化スクリプト

### visualize_graph.py
- **目的**: タスクの依存関係をグラフとして可視化
- **入力**: 
  - backlog.jsonのパス（オプション）
  - `--output`: 出力ファイルのパス（オプション）
- **出力**: タスク依存関係のグラフ画像
- **使用方法**: 
  ```bash
  python scripts/visualize_graph.py [path/to/backlog.json] [--output path/to/output.png]
  ```
- **注意事項**: 
  - networkxとgraphvizパッケージが必要
  - デフォルトの出力パスは`tasks/task_graph.png`

### visualize_miro.py
- **目的**: Miro APIを使用してタスクの依存関係を視覚化
- **入力**: 
  - backlog.jsonのパス（オプション）
  - Miro APIトークン（環境変数または.envファイル）
  - ボードID（環境変数または.envファイル）
- **出力**: Miroボード上の視覚化結果
- **使用方法**: 
  ```bash
  python scripts/visualize_miro.py [path/to/backlog.json]
  ```
- **注意事項**: 
  - Miro APIトークンとボードIDが必要
  - 環境変数：MIRO_ACCESS_TOKEN, BOARD_ID

## ユーティリティスクリプト

### call_chatgpt_api.py
- **目的**: OpenAIのChatGPT APIを呼び出してメッセージを処理
- **入力**: 
  - メッセージ内容
  - OpenAI APIキー（環境変数または.envファイル）
- **出力**: APIからの応答
- **使用方法**: 
  ```bash
  python scripts/call_chatgpt_api.py "メッセージ内容"
  ```
- **注意事項**: OpenAI APIキーが必要

### check_expired_tasks.py
- **目的**: 期限切れのタスクを検出
- **入力**: backlog.jsonのパス
- **出力**: 期限切れタスクのリスト
- **使用方法**: 
  ```bash
  python scripts/check_expired_tasks.py [path/to/backlog.json]
  ```

### util_human_id_match.py
- **目的**: 人間のIDをマッチングするユーティリティ
- **入力**: なし（ライブラリとして使用）
- **出力**: なし
- **使用方法**: 他のスクリプトからインポートして使用
