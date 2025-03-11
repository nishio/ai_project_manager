# Firebase認証設定ガイド

このガイドでは、AIプロジェクトマネージャーのFirebase認証設定方法について詳しく説明します。

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセスします
2. Googleアカウントでログインします
3. 「プロジェクトを追加」をクリックします
4. プロジェクト名に「ai-project-manager」（または任意の名前）を入力します
5. Google アナリティクスの設定を選択します（任意）
6. 「プロジェクトを作成」をクリックします
7. プロジェクト作成が完了するまで待ちます

## 2. Firebase認証の有効化

1. 左側のメニューから「Authentication」を選択します
2. 「始める」をクリックします
3. 「Sign-in method」タブで以下の認証方法を有効にします：
   - メール/パスワード：「有効」を選択し、「保存」をクリックします
   - （オプション）Google認証：「有効」を選択し、プロジェクト名を確認して「保存」をクリックします

## 3. 認証設定のカスタマイズ

### 3.1 メール認証テンプレートの設定

1. 「Authentication」セクションの「Templates」タブをクリックします
2. 以下のテンプレートをカスタマイズします：
   - パスワードリセットメール
   - メールアドレス確認メール
   - メールアドレス変更メール

各テンプレートで以下の項目を設定します：
- 送信者名：「AIプロジェクトマネージャー」
- 件名：適切な件名（例：「AIプロジェクトマネージャー - パスワードリセット」）
- メール本文：ユーザーフレンドリーなメッセージ
- アクションURL：アプリケーションのURLを含める

### 3.2 多要素認証の設定（オプション）

1. 「Authentication」セクションの「Multi-factor」タブをクリックします
2. 「Enable」をクリックして多要素認証を有効にします
3. 電話番号による認証を設定します

### 3.3 セッション持続時間の設定

1. 「Authentication」セクションの「Settings」タブをクリックします
2. 「User session management」セクションで適切なセッション持続時間を設定します：
   - 推奨：2週間（1,209,600秒）

## 4. Webアプリの登録

1. プロジェクトの概要ページで「</>」（Webアプリ）アイコンをクリックします
2. アプリのニックネームを入力します（例: 「AI Project Manager Web」）
3. 必要に応じて「Firebase Hosting も設定する」にチェックを入れます
4. 「アプリを登録」をクリックします
5. 表示されるFirebase設定情報をコピーします

## 5. 環境変数の設定

1. コピーしたFirebase設定情報を使用して、`.env.local`ファイルを作成します：

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

2. このファイルをプロジェクトのルートディレクトリに保存します
3. `.gitignore`ファイルに`.env.local`が含まれていることを確認します

## 6. 認証のテスト

1. アプリケーションを起動します：`npm run dev`
2. ブラウザで`http://localhost:3000/register`にアクセスします
3. テストユーザーを作成します：
   - メールアドレス：`test@example.com`
   - パスワード：`password123`
4. 登録後、Firebase Consoleの「Authentication」セクションでユーザーが作成されたことを確認します
5. ログアウトして、`http://localhost:3000/login`でログインをテストします

## 7. セキュリティルールの設定

1. Firebase Consoleで「Firestore Database」を選択します
2. 「Rules」タブをクリックします
3. 以下のセキュリティルールを設定します：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー認証が必要
    match /users/{userId} {
      // ユーザーは自分のデータのみアクセス可能
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // ユーザーのバックログデータ
      match /data/backlog {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

4. 「Publish」をクリックしてルールを公開します

## 8. 認証エラー処理

アプリケーションコードでは、以下の認証エラーを適切に処理していることを確認します：

1. メールアドレスが既に使用されている
2. パスワードが弱すぎる
3. ユーザーが見つからない
4. パスワードが間違っている
5. ユーザーが無効化されている

各エラーに対して、ユーザーフレンドリーなエラーメッセージを表示するようにしてください。

## 9. 認証状態の永続化

Firebase SDKの認証状態永続化を設定します：

```typescript
// src/firebase/auth.ts
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from './config';

// ブラウザセッション間で認証状態を維持
setPersistence(auth, browserLocalPersistence);
```

## 10. トラブルシューティング

### 10.1 認証エラー

- **エラー**: 「メールアドレスが既に使用されています」
  **解決策**: パスワードリセット機能を使用するか、別のメールアドレスで登録してください

- **エラー**: 「無効なメールアドレス」
  **解決策**: 正しい形式のメールアドレスを入力してください

- **エラー**: 「パスワードは6文字以上である必要があります」
  **解決策**: より長いパスワードを設定してください

### 10.2 CORS エラー

- **エラー**: Cross-Origin Resource Sharing (CORS) エラー
  **解決策**: Firebase Consoleで認証ドメインを追加してください

### 10.3 API キーの制限

- **エラー**: API キーの使用制限エラー
  **解決策**: Google Cloud Consoleで API キーの制限を確認・調整してください

## 11. 本番環境への移行

本番環境に移行する際は、以下の点に注意してください：

1. 本番環境用の別のFirebaseプロジェクトを作成することを検討する
2. 環境変数を適切に設定する
3. セキュリティルールを厳格に設定する
4. API キーの使用制限を設定する
5. 認証ドメインに本番環境のドメインを追加する

## 12. 認証機能の拡張

将来的に以下の認証機能を追加することを検討できます：

1. ソーシャルログイン（Google, GitHub, Twitter など）
2. 電話番号認証
3. 匿名認証
4. カスタム認証
5. 多要素認証

各機能を追加する際は、Firebase Consoleで該当する認証方法を有効にし、アプリケーションコードを適切に更新してください。
