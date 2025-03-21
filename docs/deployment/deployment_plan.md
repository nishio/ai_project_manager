# AI プロジェクトマネージャー デプロイメント計画

nishio: このドキュメントはver.1であり、その後 database_comparison.md での議論を経て implementation_tasks.md へと改善された。

## タスクの説明
AI プロジェクトマネージャーWebサービスを一般公開し、ユーザーフィードバックを収集します。現在のシステムはプロトタイプ段階で、単一ユーザー（西尾様）が使用しており、タスク管理にローカルファイルシステムストレージ（backlog.json）を使用しています。目標は、マルチユーザーシステムへの移行、適切なデータベース統合の実装、ユーザー認証の実装、アプリケーションを公開環境にデプロイし、ユーザーフィードバックを収集するメカニズムを設定することです。

## 手順（検証戦略、Gitの戦略を含むすべてのステップ）

1. **データベース統合のセットアップ**
   - タスク保存用のPostgreSQLデータベースを実装
   - タスク、ユーザー、提案のデータベーススキーマを作成
   - 既存のタスクをJSONからデータベースに転送するデータ移行スクリプトを開発

2. **データベース抽象化レイヤーの作成**
   - 直接ファイルシステムアクセスを置き換えるデータベースサービスを実装
   - APIルートをデータベースサービスを使用するように更新
   - 既存のタスク構造との後方互換性を確保

3. **ユーザー認証の実装**
   - NextAuth.jsを使用した認証を追加
   - ユーザー登録とログインページを作成
   - タスクに対するロールベースのアクセス制御を実装

4. **データアクセスレイヤーの更新**
   - backlogLoader.tsをファイルシステムの代わりにデータベースを使用するように変更
   - マルチテナントデータ分離を実装
   - タスクにユーザー関連付けを追加

5. **デプロイメント環境の構成**
   - Next.jsフロントエンドデプロイメント用にVercelを設定
   - クラウドプロバイダー（例：Supabase）にPostgreSQLデータベースを構成
   - 本番環境用の環境変数を設定

6. **フィードバック収集の実装**
   - フィードバックフォームコンポーネントを追加
   - フィードバック送信用のAPIエンドポイントを作成
   - 新しいフィードバックのメール通知を設定

7. **ユーザーオンボーディングフローの開発**
   - チュートリアル付きのウェルカムページを作成
   - 新規ユーザー向けのサンプルタスクを追加
   - 主要機能のガイドツアーを実装

8. **モニタリングと分析の設定**
   - エラーログ記録を実装
   - 使用状況分析を追加
   - パフォーマンスモニタリングを設定

9. **デプロイメントパイプラインの作成**
   - 自動テストとデプロイメント用のCI/CDを設定
   - リリース前テスト用のステージング環境を構成
   - データベース移行スクリプトを実装

10. **段階的リリース戦略の準備**
    - クローズドベータリリース計画を策定
    - ベータテスター向けのドキュメントを作成
    - ユーザー招待システムを設定

11. **検証戦略**
    - 完全なユーザーワークフローをローカルでテスト
    - validate_backlog.pyでデータの整合性を検証
    - 分離されたデータでマルチユーザーシナリオをテスト
    - 認証のセキュリティテストを実施
    - AI支援機能の検証

12. **Git戦略**
    - 新しいブランチを作成: `devin/$(date +%s)-deployment-setup`
    - メインリポジトリを通じてPRでシステムコードの変更を行う
    - タスクデータの更新はプライベートなai_project_manager_dataリポジトリに保持
    - プライベートデータを公開しないようにPRガイドラインに従う

## 詳細

### データベーススキーマ設計
データベーススキーマには以下を含める必要があります：
- ユーザーテーブル（id, email, name, created_at）
- タスクテーブル（id, permanent_id, title, description, status, user_id, created_at, updated_at）
- 提案テーブル（id, task_id, type, status, created_at）
- フィードバックテーブル（id, user_id, content, created_at）

### 認証の実装
メール/パスワードとオプションのOAuthプロバイダーを使用したNextAuth.jsを使用：
- ログイン/登録ページの作成
- セッション管理の実装
- 保護されたルート用のミドルウェアの追加

### デプロイメントアーキテクチャ
- フロントエンド：Vercel（Next.js向けに最適化）
- データベース：Supabaseまたはそれに類似したサービス上のPostgreSQL
- 環境変数：
  - DATABASE_URL
  - AUTH_SECRET
  - OPENAI_API_KEY
  - MIRO_ACCESS_TOKEN（必要な場合）

### 段階的リリース戦略
1. **クローズドベータ（2〜4週間）**
   - 既存コミュニティからの限定ユーザー
   - コア機能と安定性に焦点
   - 積極的なフィードバック収集

2. **オープンベータ（4〜8週間）**
   - 拡大されたユーザーベース
   - クローズドベータのフィードバックに基づく機能改良
   - パフォーマンス最適化

3. **一般リリース**
   - 完全な一般アクセス
   - 継続的なモニタリングと改善
   - 定期的な機能更新

### 最小限の実用的機能
- ユーザー認証と登録
- タスクの作成、表示、管理
- AIによるタスク優先順位付け支援
- セッション間のデータ永続性
- 基本的なフィードバック収集

### ユーザーフィードバック収集方法
- アプリ内フィードバックフォーム
- ユーザー行動分析
- 直接のメールコミュニケーション
- コミュニティフォーラムまたはチャットチャンネル

### データ移行の考慮事項
- 既存のタスクIDと関係性を保持
- タスク履歴とメタデータの維持
- 移行中のデータ整合性の確保
- バックアップメカニズムの作成

### セキュリティの考慮事項
- 適切な認証の実装
- すべての通信にHTTPSを使用
- ユーザー入力のサニタイズ
- レート制限の実装
- 適切なデータベースアクセス制御の設定
