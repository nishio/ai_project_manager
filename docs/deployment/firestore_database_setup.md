# Firestoreデータベース設定ガイド

このガイドでは、AIプロジェクトマネージャーのFirestoreデータベース設定方法について詳しく説明します。

## 1. Firestoreデータベースの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセスします
2. プロジェクトを選択します
3. 左側のメニューから「Firestore Database」を選択します
4. 「データベースの作成」をクリックします
5. セキュリティルールを選択します：
   - 開発中は「テストモード」を選択できます（すべてのリクエストを許可）
   - 本番環境では「本番モード」を選択してください（セキュリティルールに基づいてアクセスを制限）
6. データベースのロケーションを選択します（通常はユーザーに最も近いリージョン）
7. 「次へ」をクリックして設定を完了します

## 2. データモデル設計

AIプロジェクトマネージャーでは、以下のコレクション構造を使用します：

### 2.1 ユーザーコレクション

```
users/
  {userId}/
    - email: string
    - displayName: string
    - createdAt: timestamp
    
    data/
      backlog/
        - data: object (バックログJSONデータ)
        - updatedAt: timestamp
    
    tasks/
      {taskId}/
        - id: string (タスクID)
        - title: string
        - description: string
        - status: string
        - priority: number
        - createdAt: timestamp
        - updatedAt: timestamp
        - ... その他のタスク属性
    
    proposals/
      {proposalId}/
        - taskId: string
        - content: string
        - status: string ('pending', 'accepted', 'rejected')
        - createdAt: timestamp
        - updatedAt: timestamp
```

### 2.2 フィードバックコレクション

```
feedback/
  {feedbackId}/
    - uid: string (ユーザーID)
    - content: string
    - rating: number
    - createdAt: timestamp
    - userEmail: string (オプション)
```

## 3. セキュリティルールの設定

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
      
      // ユーザーのタスク
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // タスク提案
      match /proposals/{proposalId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // フィードバックコレクション
    match /feedback/{feedbackId} {
      // 認証済みユーザーのみ書き込み可能
      allow create: if request.auth != null;
      // 自分のフィードバックのみ読み取り可能
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
      // 管理者のみ全フィードバック読み取り可能（実際の実装では管理者ロールの確認が必要）
      // allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

4. 「Publish」をクリックしてルールを公開します

## 4. インデックスの設定

複雑なクエリを効率的に実行するために、以下のインデックスを設定します：

1. Firebase Consoleで「Firestore Database」を選択します
2. 「Indexes」タブをクリックします
3. 「Composite」タブで「Add index」をクリックします
4. 以下のインデックスを追加します：

### 4.1 タスクインデックス

- コレクション: `users/{userId}/tasks`
- フィールド:
  - `status` (Ascending)
  - `priority` (Descending)
- クエリスコープ: Collection

### 4.2 提案インデックス

- コレクション: `users/{userId}/proposals`
- フィールド:
  - `status` (Ascending)
  - `createdAt` (Descending)
- クエリスコープ: Collection

5. 「Create index」をクリックしてインデックスを作成します

## 5. データ移行

既存のbacklog.jsonデータをFirestoreに移行するには、以下の方法を使用します：

### 5.1 Python移行スクリプトの使用

1. サービスアカウントキーを取得します：
   - Firebase Consoleで「プロジェクト設定」を開きます
   - 「サービスアカウント」タブを選択します
   - 「新しい秘密鍵の生成」をクリックします
   - JSONキーファイルをダウンロードし、安全な場所に保存します

2. 移行スクリプトを実行します：

```bash
python scripts/migrate_to_firestore.py --backlog path/to/backlog.json --service-account path/to/serviceAccountKey.json --user-id user-id
```

### 5.2 アプリケーション内移行機能の使用

1. アプリケーションにログインします
2. 「データ移行」ページにアクセスします
3. backlog.jsonファイルをアップロードします
4. 「インポート開始」ボタンをクリックします

## 6. データアクセスパターン

アプリケーションでは、以下のデータアクセスパターンを使用します：

### 6.1 バックログデータの読み込み

```typescript
import { getUserBacklog } from '../firebase/firestore';
import { getCurrentUser } from '../firebase/auth';

async function loadBacklog() {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('ユーザーが認証されていません');
  }

  const backlogDoc = await getUserBacklog(user.uid);
  if (!backlogDoc.exists()) {
    return { tasks: [] };
  }

  return backlogDoc.data()?.data || { tasks: [] };
}
```

### 6.2 バックログデータの保存

```typescript
import { storeUserBacklog } from '../firebase/firestore';
import { getCurrentUser } from '../firebase/auth';

async function saveBacklog(backlogData) {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('ユーザーが認証されていません');
  }

  await storeUserBacklog(user.uid, backlogData);
  return { success: true };
}
```

### 6.3 タスク提案の保存

```typescript
import { storeTaskProposal } from '../firebase/firestore';
import { getCurrentUser } from '../firebase/auth';

async function saveProposal(taskId, proposalData) {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('ユーザーが認証されていません');
  }

  await storeTaskProposal(user.uid, taskId, proposalData);
  return { success: true };
}
```

## 7. パフォーマンス最適化

Firestoreを効率的に使用するために、以下の最適化を行います：

### 7.1 バッチ処理

複数のドキュメントを一度に更新する場合は、バッチ処理を使用します：

```typescript
import { db } from './config';
import { writeBatch, doc } from 'firebase/firestore';

async function batchUpdateTasks(userId, tasks) {
  const batch = writeBatch(db);
  
  tasks.forEach(task => {
    const taskRef = doc(db, `users/${userId}/tasks/${task.id}`);
    batch.set(taskRef, {
      ...task,
      updatedAt: new Date()
    });
  });
  
  await batch.commit();
}
```

### 7.2 クエリの最適化

- 必要なフィールドのみを取得する
- 適切なインデックスを使用する
- ページネーションを実装する
- クエリ結果をキャッシュする

### 7.3 オフラインサポート

オフラインサポートを有効にして、ネットワーク接続がない場合でもアプリケーションが機能するようにします：

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { db } from './config';

async function enableOfflineSupport() {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled');
  } catch (error) {
    console.error('Error enabling offline persistence:', error);
  }
}
```

## 8. データバックアップ

定期的にデータをバックアップするには、以下の方法を使用します：

### 8.1 Firestore エクスポート

1. Google Cloud Consoleにアクセスします
2. プロジェクトを選択します
3. Firestore > エクスポート/インポートを選択します
4. エクスポートを設定して実行します

### 8.2 アプリケーション内エクスポート

アプリケーション内でバックログデータをJSONファイルとしてエクスポートする機能を実装します：

```typescript
import { getUserBacklog } from '../firebase/firestore';
import { getCurrentUser } from '../firebase/auth';

async function exportBacklog() {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('ユーザーが認証されていません');
  }

  const backlogDoc = await getUserBacklog(user.uid);
  if (!backlogDoc.exists()) {
    throw new Error('バックログデータが見つかりません');
  }

  const backlogData = backlogDoc.data()?.data;
  const jsonString = JSON.stringify(backlogData, null, 2);
  
  // ブラウザ環境でのダウンロード
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backlog_export_${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

## 9. モニタリングとデバッグ

### 9.1 Firebase Consoleでのモニタリング

1. Firebase Consoleにアクセスします
2. 「Firestore Database」を選択します
3. 「Data」タブでデータを閲覧します
4. 「Usage」タブで使用状況を確認します

### 9.2 ログ記録

アプリケーションコードでエラーを適切にログに記録します：

```typescript
function logFirestoreError(operation, error) {
  console.error(`Firestore ${operation} error:`, error);
  
  // 本番環境では適切なエラー追跡サービスを使用
  // 例: Sentry, LogRocket など
}
```

## 10. スケーリング考慮事項

### 10.1 クォータと制限

Firestoreには以下の制限があります：

- 1秒あたりのドキュメント読み取り: 50,000
- 1秒あたりのドキュメント書き込み: 20,000
- 1日あたりのネットワーク帯域幅: 10GiB

これらの制限を超える場合は、クォータの引き上げをリクエストするか、データモデルを最適化してください。

### 10.2 コスト最適化

コストを最適化するために、以下の方法を検討してください：

- 不要なインデックスを削除する
- 読み取り/書き込み操作を最小限に抑える
- 大きなドキュメントを分割する
- キャッシュを活用する

### 10.3 将来の拡張

ユーザー数が増加した場合は、以下の拡張を検討してください：

- PostgreSQLなどのリレーショナルデータベースへの移行
- シャーディングの実装
- 読み取り専用レプリカの使用
- マイクロサービスアーキテクチャへの移行

## 11. トラブルシューティング

### 11.1 一般的な問題

- **エラー**: 「Missing or insufficient permissions」
  **解決策**: セキュリティルールを確認し、適切なアクセス権限を設定してください

- **エラー**: 「Document does not exist」
  **解決策**: ドキュメントの存在を確認してから操作を行うか、存在しない場合の処理を追加してください

- **エラー**: 「Quota exceeded」
  **解決策**: クォータの引き上げをリクエストするか、操作を最適化してください

### 11.2 パフォーマンス問題

- **問題**: クエリが遅い
  **解決策**: インデックスを追加するか、クエリを最適化してください

- **問題**: アプリケーションの応答が遅い
  **解決策**: データキャッシュを実装するか、バックグラウンド処理を使用してください

## 12. まとめ

Firestoreデータベースは、AIプロジェクトマネージャーのマルチユーザーシステムへの移行に適したソリューションです。1ユーザー1レコードのアプローチにより、ユーザーごとのデータ分離と効率的なアクセスが可能になります。

適切なセキュリティルール、インデックス、データモデルを設定することで、安全で高性能なアプリケーションを構築できます。将来的なスケーリングニーズに応じて、より堅牢なデータベースソリューションへの移行も検討してください。
