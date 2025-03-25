# Vercel環境設定ガイド

このガイドでは、AIプロジェクトマネージャーをVercelにデプロイするための環境設定について詳しく説明します。

## 1. 環境変数の設定

Vercelでは、以下の環境変数を設定する必要があります：

### 1.1 Firebase設定

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

これらの値は、Firebase Consoleで作成したプロジェクトから取得できます。

### 1.2 その他の設定（必要に応じて）

```
MIRO_ACCESS_TOKEN=your-miro-access-token
BOARD_ID=your-board-id
```

## 2. 環境ごとの設定

Vercelでは、以下の3つの環境を区別して設定できます：

### 2.1 本番環境（Production）

- メインブランチ（main）へのマージによってデプロイされます
- 本番用のドメイン（例：ai-project-manager.com）を使用します
- 本番用の環境変数を使用します

### 2.2 プレビュー環境（Preview）

- プルリクエストごとに自動的に作成されます
- 一意のURLを持ちます（例：pr-123-ai-project-manager.vercel.app）
- 開発用の環境変数を使用できます

### 2.3 開発環境（Development）

- ローカル開発用の環境です
- `.env.local`ファイルを使用して環境変数を設定します
- `npm run dev`コマンドで起動します

## 3. 環境変数の設定方法

### 3.1 Vercelダッシュボードでの設定

1. Vercelダッシュボードにログインします
2. プロジェクトを選択します
3. 「Settings」タブをクリックします
4. 「Environment Variables」セクションに移動します
5. 「Add New」ボタンをクリックします
6. 変数名と値を入力します
7. 環境（Production、Preview、Development）を選択します
8. 「Save」ボタンをクリックします

### 3.2 Vercel CLIでの設定

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```

プロンプトに従って値を入力し、環境を選択します。

### 3.3 プロジェクト設定ファイルでの設定

`vercel.json`ファイルを使用して環境変数を設定することもできます：

```json
{
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@next_public_firebase_api_key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@next_public_firebase_auth_domain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@next_public_firebase_project_id",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "@next_public_firebase_storage_bucket",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "@next_public_firebase_messaging_sender_id",
    "NEXT_PUBLIC_FIREBASE_APP_ID": "@next_public_firebase_app_id"
  }
}
```

この方法では、Vercelダッシュボードで作成したシークレットを参照します。

## 4. 環境変数のセキュリティ

### 4.1 シークレットの保護

機密情報（APIキーなど）は、Vercelのシークレットとして保存することをお勧めします：

```bash
vercel secrets add next_public_firebase_api_key "your-api-key"
```

そして、`vercel.json`ファイルでシークレットを参照します：

```json
{
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@next_public_firebase_api_key"
  }
}
```

### 4.2 環境変数の暗号化

Vercelは、環境変数を自動的に暗号化して保存します。ただし、`NEXT_PUBLIC_`プレフィックスが付いた変数は、クライアントサイドのコードで使用できるため、公開されることに注意してください。

### 4.3 環境変数のローテーション

セキュリティを強化するために、定期的に環境変数（特にAPIキー）をローテーションすることをお勧めします。

## 5. 環境変数のデバッグ

### 5.1 環境変数の確認

デプロイされたアプリケーションで環境変数が正しく設定されているか確認するには：

```javascript
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
```

### 5.2 環境変数のトラブルシューティング

- **問題**: 環境変数が`undefined`
  **解決策**: 環境変数が正しく設定されているか確認し、必要に応じて`NEXT_PUBLIC_`プレフィックスを追加してください

- **問題**: 環境変数が本番環境で機能しない
  **解決策**: 環境変数が本番環境に設定されているか確認してください

- **問題**: 環境変数がプレビュー環境で機能しない
  **解決策**: 環境変数がプレビュー環境に設定されているか確認してください

## 6. 環境ごとの設定ファイル

Next.jsでは、環境ごとに異なる設定ファイルを使用できます：

- `.env`: すべての環境で使用される変数
- `.env.development`: 開発環境でのみ使用される変数
- `.env.production`: 本番環境でのみ使用される変数
- `.env.local`: ローカル環境でのみ使用される変数（gitignoreに追加）

## 7. CI/CDでの環境変数の設定

GitHub Actionsを使用して自動デプロイを設定する場合は、GitHub Secretsに環境変数を設定します：

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 8. まとめ

適切な環境変数の設定は、AIプロジェクトマネージャーをVercelで正しく動作させるために不可欠です。このガイドに従って、各環境に必要な変数を設定し、セキュリティを確保してください。
