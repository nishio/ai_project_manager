# Vercel CLI デプロイメントガイド

このガイドでは、Vercel CLIを使用してAIプロジェクトマネージャーをデプロイする方法について説明します。

## 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

## 2. Vercel CLIでのログイン

```bash
vercel login
```

指示に従ってブラウザでログインを完了します。

## 3. プロジェクトの設定

プロジェクトのルートディレクトリ（`server`フォルダ）に移動し、以下のコマンドを実行します：

```bash
cd server
vercel
```

初回実行時に、いくつかの質問に答える必要があります：

- **Set up and deploy?**: `y`を入力
- **Which scope?**: 個人アカウントまたは組織を選択
- **Link to existing project?**: 新規プロジェクトの場合は`n`を入力
- **What's your project's name?**: プロジェクト名を入力（例：`ai-project-manager`）
- **In which directory is your code located?**: `.`を入力（現在のディレクトリ）
- **Want to override the settings?**: `y`を入力して設定をカスタマイズ
- **Which settings would you like to override?**: 必要に応じて設定を選択

## 4. 環境変数の設定

Vercel CLIを使用して環境変数を設定します：

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```

プロンプトに従って値を入力します。以下の環境変数をすべて設定します：

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

各環境変数に対して、環境（`Production`、`Preview`、`Development`）を選択します。

## 5. デプロイ

環境変数の設定が完了したら、プロジェクトをデプロイします：

```bash
vercel --prod
```

デプロイが完了すると、プロジェクトのURLが表示されます。

## 6. デプロイの確認

デプロイが成功したことを確認するには：

```bash
vercel ls
```

最新のデプロイメントが表示されます。

## 7. ドメインの設定

カスタムドメインを追加するには：

```bash
vercel domains add ai-project-manager.com
```

指示に従ってDNSレコードを設定します。

## 8. 環境の切り替え

異なる環境にデプロイするには：

- 本番環境: `vercel --prod`
- プレビュー環境: `vercel`

## 9. デプロイメントの管理

デプロイメントを一覧表示するには：

```bash
vercel ls
```

特定のデプロイメントの詳細を表示するには：

```bash
vercel inspect <deployment-url>
```

デプロイメントを削除するには：

```bash
vercel remove <deployment-url>
```

## 10. ログの確認

デプロイメントのログを確認するには：

```bash
vercel logs <deployment-url>
```

リアルタイムでログを確認するには：

```bash
vercel logs <deployment-url> --follow
```

## 11. 設定の確認

プロジェクトの設定を確認するには：

```bash
vercel project ls
```

特定のプロジェクトの詳細を表示するには：

```bash
vercel project inspect <project-name>
```

## 12. チームの管理

チームを一覧表示するには：

```bash
vercel teams ls
```

チームを切り替えるには：

```bash
vercel switch <team-name>
```

## 13. トラブルシューティング

### 13.1 デプロイエラー

デプロイ中にエラーが発生した場合は、ログを確認します：

```bash
vercel logs <deployment-url>
```

### 13.2 環境変数の問題

環境変数が正しく設定されているか確認するには：

```bash
vercel env ls
```

### 13.3 ビルドエラー

ビルドエラーが発生した場合は、ローカルでビルドを試してみてください：

```bash
npm run build
```

## 14. CI/CDの設定

GitHub Actionsを使用して自動デプロイを設定するには、`.github/workflows/deploy.yml`ファイルを作成します：

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
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install Vercel CLI
        run: npm install -g vercel
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
```

GitHub SecretsにVercelトークンとプロジェクトIDを設定する必要があります。

## 15. まとめ

Vercel CLIを使用することで、AIプロジェクトマネージャーを効率的にデプロイし、管理することができます。環境変数の設定、カスタムドメインの追加、デプロイメントの管理など、さまざまな操作をコマンドラインから実行できます。
