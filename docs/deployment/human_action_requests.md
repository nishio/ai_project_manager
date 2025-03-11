# AIプロジェクトマネージャー：人間側で必要なアクション

このドキュメントでは、AIプロジェクトマネージャーを本番環境にデプロイするために人間側で実行する必要があるアクションをまとめています。

## 1. Firebaseプロジェクトの作成

### 必要なアクション
1. [Firebase Console](https://console.firebase.google.com/)にアクセスし、新しいプロジェクトを作成
2. プロジェクト名を「ai-project-manager」（または任意の名前）に設定
3. Google Analyticsを有効化（推奨）
4. Webアプリケーションを登録（「</>」アイコンをクリック）
5. アプリのニックネームを設定（例：「AI Project Manager Web」）
6. Firebase SDKの設定情報をコピー（後で環境変数として使用）

### 設定情報の例
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## 2. Firebase認証の設定

### 必要なアクション
1. Firebase Consoleの「Authentication」セクションに移動
2. 「Sign-in method」タブで以下の認証方法を有効化：
   - メール/パスワード認証
   - Google認証（オプション）
   - GitHub認証（オプション）
3. 「Users」タブで管理者ユーザーを作成（オプション）
4. 「Settings」タブで承認済みドメインを設定

詳細な手順は[Firebase認証セットアップガイド](./firebase_auth_setup.md)を参照してください。

## 3. Firestoreデータベースの作成

### 必要なアクション
1. Firebase Consoleの「Firestore Database」セクションに移動
2. 「Create database」をクリック
3. セキュリティルールを「Start in test mode」に設定（開発中のみ）
4. データベースのロケーションを選択（例：asia-northeast1）
5. 以下のコレクション構造を作成：
   - `users`: ユーザー情報
   - `backlogs`: ユーザーごとのバックログデータ
   - `feedback`: ユーザーフィードバック

詳細な手順は[Firestoreデータベースセットアップガイド](./firestore_database_setup.md)を参照してください。

## 4. Firestoreセキュリティルールの設定

### 必要なアクション
1. Firebase Consoleの「Firestore Database」→「Rules」タブに移動
2. 以下のセキュリティルールを設定：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー自身のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ユーザー自身のバックログのみアクセス可能
    match /backlogs/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // フィードバックは認証済みユーザーのみ書き込み可能、管理者のみ読み取り可能
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## 5. Vercelアカウントの設定

### 必要なアクション
1. [Vercel](https://vercel.com/)にアクセスし、アカウントを作成またはログイン
2. GitHubアカウントと連携（推奨）
3. 新しいプロジェクトを作成
4. リポジトリ「ai_project_manager」をインポート
5. 以下の設定を行う：
   - Framework Preset: Next.js
   - Root Directory: server
   - Build Command: npm run build
   - Output Directory: .next

詳細な手順は[Vercelデプロイメントガイド](./vercel_deployment.md)を参照してください。

## 6. Vercel環境変数の設定

### 必要なアクション
1. Vercelプロジェクト設定の「Environment Variables」セクションに移動
2. 以下の環境変数を設定：

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

## 7. デプロイの実行

### 必要なアクション
1. Vercelプロジェクト設定の「Deployments」タブに移動
2. 「Deploy」ボタンをクリック
3. デプロイが完了するまで待機（通常5分以内）
4. デプロイURLにアクセスしてアプリケーションが正常に動作することを確認

## 8. ドメイン設定（オプション）

### 必要なアクション
1. Vercelプロジェクト設定の「Domains」タブに移動
2. カスタムドメインを追加
3. DNSレコードを設定
4. SSL証明書の発行を確認

## 9. リリース計画の実行

### 必要なアクション
1. 内部テスト（1-2週間）
   - 開発チーム内でのテスト
   - バグ修正と機能調整
2. クローズドベータ（2-4週間）
   - 限定ユーザーへのアクセス権付与
   - フィードバック収集と分析
3. オープンベータ（4-8週間）
   - より広いユーザー層へのアクセス権付与
   - パフォーマンスモニタリングとスケーリング調整
4. 一般リリース
   - 全ユーザーへのアクセス開放
   - マーケティングとプロモーション活動

## 10. モニタリングとメンテナンス

### 必要なアクション
1. Firebase Consoleの「Monitoring」セクションでパフォーマンスと使用状況を監視
2. Vercel Analyticsでユーザー行動とパフォーマンスを分析
3. 定期的なバックアップとメンテナンスを実施
4. ユーザーフィードバックに基づいて継続的に改善

---

このドキュメントに記載されているアクションは、AIプロジェクトマネージャーを本番環境にデプロイし、一般ユーザーに提供するために必要な手順です。各ステップの詳細については、関連するドキュメントを参照してください。
