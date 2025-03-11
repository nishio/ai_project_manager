# Vercelデプロイメントガイド

このガイドでは、AIプロジェクトマネージャーをVercelにデプロイする方法について説明します。

## 1. Vercelアカウントの作成

1. [Vercel](https://vercel.com/)にアクセスします
2. 「Sign Up」をクリックします
3. GitHubアカウントでサインアップすることをお勧めします（リポジトリとの連携が容易になります）
4. 必要な情報を入力してアカウントを作成します

## 2. プロジェクトのインポート

1. Vercelダッシュボードで「New Project」をクリックします
2. 「Import Git Repository」セクションでGitHubアカウントを連携します
3. リポジトリリストから「ai_project_manager」を選択します
4. 必要に応じて、組織を選択します

## 3. プロジェクト設定

### 3.1 基本設定

1. 「Project Name」フィールドにプロジェクト名を入力します（例：「ai-project-manager」）
2. 「Framework Preset」が「Next.js」に設定されていることを確認します
3. 「Root Directory」が「server」に設定されていることを確認します

### 3.2 環境変数の設定

以下の環境変数を設定します：

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

これらの値は、Firebase Consoleで作成したプロジェクトから取得できます。

### 3.3 ビルド設定

1. 「Build Command」が「next build」に設定されていることを確認します
2. 「Output Directory」が「.next」に設定されていることを確認します
3. 「Install Command」が「npm install」に設定されていることを確認します

## 4. デプロイ

1. すべての設定を確認したら、「Deploy」ボタンをクリックします
2. Vercelがプロジェクトをビルドしてデプロイするのを待ちます
3. デプロイが完了すると、プロジェクトのURLが表示されます（例：https://ai-project-manager.vercel.app）

## 5. ドメイン設定

### 5.1 カスタムドメインの追加（オプション）

1. プロジェクトダッシュボードで「Domains」タブをクリックします
2. 「Add」ボタンをクリックします
3. 使用したいドメイン名を入力します（例：ai-project-manager.com）
4. 「Add」ボタンをクリックします
5. DNSレコードの設定手順に従います

### 5.2 サブドメインの設定（オプション）

1. 「Domains」タブで「Add」ボタンをクリックします
2. サブドメイン名を入力します（例：app.ai-project-manager.com）
3. 「Add」ボタンをクリックします
4. DNSレコードの設定手順に従います

## 6. 継続的デプロイメント

Vercelは、GitHubリポジトリと連携することで、継続的デプロイメントを自動的に設定します：

1. メインブランチ（例：main）への変更が自動的にプロダクション環境にデプロイされます
2. プルリクエストごとにプレビュー環境が自動的に作成されます
3. プレビューURLを使用して、変更をマージする前にテストできます

## 7. 環境の分離

### 7.1 本番環境

- メインブランチ（main）へのマージによってデプロイされます
- 本番用のドメイン（例：ai-project-manager.com）を使用します
- 本番用の環境変数を使用します

### 7.2 プレビュー環境

- プルリクエストごとに自動的に作成されます
- 一意のURLを持ちます（例：pr-123-ai-project-manager.vercel.app）
- 開発用の環境変数を使用できます

### 7.3 開発環境

- ローカル開発用の環境です
- `.env.local`ファイルを使用して環境変数を設定します
- `npm run dev`コマンドで起動します

## 8. パフォーマンス最適化

### 8.1 Edge Network

Vercelは世界中のエッジネットワークを使用して、ユーザーに最も近いロケーションからコンテンツを配信します。

### 8.2 キャッシュ設定

1. プロジェクトダッシュボードで「Settings」タブをクリックします
2. 「Caching」セクションで適切なキャッシュ設定を行います
3. 静的アセットのキャッシュ期間を設定します

### 8.3 画像最適化

Next.jsの`Image`コンポーネントを使用して、画像の最適化を行います：

```jsx
import Image from 'next/image';

function MyComponent() {
  return (
    <Image
      src="/profile.jpg"
      alt="Profile"
      width={500}
      height={300}
      priority
    />
  );
}
```

## 9. モニタリングとログ

### 9.1 デプロイメントログ

1. プロジェクトダッシュボードで「Deployments」タブをクリックします
2. デプロイメントを選択します
3. 「Logs」タブでビルドログとランタイムログを確認できます

### 9.2 エラーモニタリング

1. プロジェクトダッシュボードで「Analytics」タブをクリックします
2. エラー率、パフォーマンス指標、ユーザーセッションなどを確認できます

### 9.3 統合モニタリングツール

以下のツールとの統合を検討してください：

- Sentry: エラー追跡
- LogRocket: セッション再生
- Google Analytics: ユーザー分析

## 10. セキュリティ設定

### 10.1 環境変数の保護

1. 機密情報は必ず環境変数として設定します
2. 環境変数は「Settings」タブの「Environment Variables」セクションで管理します
3. 環境ごとに異なる値を設定できます（本番、プレビュー、開発）

### 10.2 ヘッダー設定

セキュリティヘッダーを設定するには、`next.config.js`ファイルを編集します：

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

### 10.3 CSP設定

Content Security Policy (CSP) を設定するには、`next.config.js`ファイルを編集します：

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};
```

## 11. トラブルシューティング

### 11.1 ビルドエラー

- **エラー**: 「Build failed」
  **解決策**: ビルドログを確認し、エラーメッセージに基づいて問題を修正してください

- **エラー**: 「Module not found」
  **解決策**: 依存関係が正しくインストールされているか確認してください

- **エラー**: 「Out of memory」
  **解決策**: プロジェクト設定でメモリ制限を増やすか、ビルドプロセスを最適化してください

### 11.2 ランタイムエラー

- **エラー**: 「500 Internal Server Error」
  **解決策**: サーバーログを確認し、エラーの原因を特定してください

- **エラー**: 「404 Not Found」
  **解決策**: ルーティング設定を確認してください

- **エラー**: 「API routes not working」
  **解決策**: API ルートの実装を確認し、正しいHTTPメソッドを使用しているか確認してください

### 11.3 環境変数の問題

- **問題**: 環境変数が undefined
  **解決策**: 環境変数が正しく設定されているか確認し、必要に応じて`NEXT_PUBLIC_`プレフィックスを追加してください

## 12. まとめ

Vercelは、Next.jsアプリケーションのデプロイに最適なプラットフォームです。継続的デプロイメント、エッジネットワーク、環境の分離など、多くの機能を提供します。

適切な設定を行うことで、AIプロジェクトマネージャーを安全かつ高性能な環境で運用できます。Firebase認証とFirestoreデータベースとの統合により、マルチユーザーシステムとしての機能を十分に発揮できます。
