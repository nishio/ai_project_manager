# Firebase設定ガイド

このガイドでは、AIプロジェクトマネージャーのFirebase設定方法について説明します。

## 前提条件

- Googleアカウント
- Node.js と npm がインストールされていること
- Firebase CLIがインストールされていること（`npm install -g firebase-tools`）

## Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセスします
2. 「プロジェクトを追加」をクリックします
3. プロジェクト名に「ai-project-manager」（または任意の名前）を入力します
4. Google アナリティクスの設定を選択します（任意）
5. 「プロジェクトを作成」をクリックします

## Firebase認証の設定

1. 左側のメニューから「Authentication」を選択します
2. 「始める」をクリックします
3. 「Sign-in method」タブで「メール/パスワード」を有効にします
4. 必要に応じて、他の認証方法（Google、GitHub など）も設定できます

## Firestoreデータベースの設定

1. 左側のメニューから「Firestore Database」を選択します
2. 「データベースの作成」をクリックします
3. セキュリティルールを「テストモード」または「本番モード」で開始します
   - テストモード: 開発中は便利ですが、すべてのリクエストを許可します
   - 本番モード: セキュリティルールに基づいてアクセスを制限します
4. データベースのロケーションを選択します（通常はユーザーに最も近いリージョン）
5. 「次へ」をクリックして設定を完了します

## Webアプリの登録

1. プロジェクトの概要ページで「</>」（Webアプリ）アイコンをクリックします
2. アプリのニックネームを入力します（例: 「AI Project Manager Web」）
3. 必要に応じて「Firebase Hosting も設定する」にチェックを入れます
4. 「アプリを登録」をクリックします
5. 表示されるFirebase設定情報をコピーします

## 環境変数の設定

1. コピーしたFirebase設定情報を使用して、`.env.local`ファイルを作成します:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## サービスアカウントの設定（バックエンド用）

1. Firebase Consoleで「プロジェクト設定」を開きます
2. 「サービスアカウント」タブを選択します
3. 「新しい秘密鍵の生成」をクリックします
4. JSONキーファイルをダウンロードし、安全な場所に保存します
5. このキーファイルは、データ移行スクリプトなどのサーバーサイド操作に使用します

## データ移行

既存のbacklog.jsonデータをFirestoreに移行するには:

```bash
python scripts/migrate_to_firestore.py --backlog path/to/backlog.json --service-account path/to/serviceAccountKey.json --user-id user-id
```

## Firebaseエミュレーターの使用（開発用）

ローカル開発環境でFirebaseサービスをエミュレートするには:

1. Firebase CLIをインストールします: `npm install -g firebase-tools`
2. Firebase CLIにログインします: `firebase login`
3. プロジェクトディレクトリで初期化します: `firebase init`
4. エミュレーターを起動します: `firebase emulators:start`

## セキュリティルールのデプロイ

1. `firestore.rules`ファイルを編集してセキュリティルールを設定します
2. ルールをデプロイします: `firebase deploy --only firestore:rules`

## トラブルシューティング

- **認証エラー**: Firebase Consoleで認証方法が正しく有効化されているか確認してください
- **データベースアクセスエラー**: セキュリティルールが適切に設定されているか確認してください
- **CORS エラー**: Firebase Consoleで適切なドメインが許可されているか確認してください
