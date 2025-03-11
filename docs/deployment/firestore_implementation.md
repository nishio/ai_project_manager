# Firestoreデータベース実装ガイド

このガイドでは、AIプロジェクトマネージャーのFirestoreデータベース実装方法について詳しく説明します。

## 1. データモデル設計

AIプロジェクトマネージャーでは、以下のデータモデルを使用します：

### 1.1 ユーザーコレクション

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

### 1.2 フィードバックコレクション

```
feedback/
  {feedbackId}/
    - uid: string (ユーザーID)
    - content: string
    - rating: number
    - createdAt: timestamp
    - userEmail: string (オプション)
```

## 2. Firestoreデータアクセスレイヤーの実装

### 2.1 Firestoreの初期化

```typescript
// src/firebase/firestore.ts
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { app } from './config';

// Firestoreインスタンスを初期化
export const db = getFirestore(app);

// コレクションの参照を取得する関数
export const getUsersCollection = () => collection(db, 'users');
export const getFeedbackCollection = () => collection(db, 'feedback');

// ユーザードキュメントの参照を取得する関数
export const getUserDoc = (userId: string) => doc(db, 'users', userId);

// ユーザーのバックログドキュメントの参照を取得する関数
export const getUserBacklogDoc = (userId: string) => doc(db, `users/${userId}/data`, 'backlog');

// ユーザーのタスクコレクションの参照を取得する関数
export const getUserTasksCollection = (userId: string) => collection(db, `users/${userId}/tasks`);

// ユーザーの提案コレクションの参照を取得する関数
export const getUserProposalsCollection = (userId: string) => collection(db, `users/${userId}/proposals`);
```

### 2.2 バックログデータの読み書き

```typescript
// src/firebase/firestore.ts

// ユーザーのバックログデータを取得する関数
export const getUserBacklog = async (userId: string) => {
  const backlogDocRef = getUserBacklogDoc(userId);
  return await getDoc(backlogDocRef);
};

// ユーザーのバックログデータを保存する関数
export const storeUserBacklog = async (userId: string, backlogData: any) => {
  const backlogDocRef = getUserBacklogDoc(userId);
  return await setDoc(backlogDocRef, {
    data: backlogData,
    updatedAt: new Date()
  });
};

// ユーザーのバックログデータを更新する関数
export const updateUserBacklog = async (userId: string, backlogData: any) => {
  const backlogDocRef = getUserBacklogDoc(userId);
  return await updateDoc(backlogDocRef, {
    data: backlogData,
    updatedAt: new Date()
  });
};
```

### 2.3 タスクデータの読み書き

```typescript
// src/firebase/firestore.ts

// ユーザーのタスクを取得する関数
export const getUserTask = async (userId: string, taskId: string) => {
  const taskDocRef = doc(db, `users/${userId}/tasks`, taskId);
  return await getDoc(taskDocRef);
};

// ユーザーのタスクを保存する関数
export const storeUserTask = async (userId: string, taskData: any) => {
  const taskDocRef = doc(db, `users/${userId}/tasks`, taskData.id);
  return await setDoc(taskDocRef, {
    ...taskData,
    updatedAt: new Date()
  });
};

// ユーザーのタスクを更新する関数
export const updateUserTask = async (userId: string, taskId: string, taskData: any) => {
  const taskDocRef = doc(db, `users/${userId}/tasks`, taskId);
  return await updateDoc(taskDocRef, {
    ...taskData,
    updatedAt: new Date()
  });
};

// ユーザーのタスクを削除する関数
export const deleteUserTask = async (userId: string, taskId: string) => {
  const taskDocRef = doc(db, `users/${userId}/tasks`, taskId);
  return await deleteDoc(taskDocRef);
};

// ユーザーのタスクを一括保存する関数
export const storeUserTasks = async (userId: string, tasksData: any[]) => {
  const batch = writeBatch(db);
  
  tasksData.forEach(taskData => {
    const taskDocRef = doc(db, `users/${userId}/tasks`, taskData.id);
    batch.set(taskDocRef, {
      ...taskData,
      updatedAt: new Date()
    });
  });
  
  return await batch.commit();
};
```

### 2.4 提案データの読み書き

```typescript
// src/firebase/firestore.ts

// ユーザーの提案を取得する関数
export const getUserProposal = async (userId: string, proposalId: string) => {
  const proposalDocRef = doc(db, `users/${userId}/proposals`, proposalId);
  return await getDoc(proposalDocRef);
};

// ユーザーの提案を保存する関数
export const storeUserProposal = async (userId: string, proposalData: any) => {
  const proposalId = proposalData.id || uuidv4();
  const proposalDocRef = doc(db, `users/${userId}/proposals`, proposalId);
  return await setDoc(proposalDocRef, {
    ...proposalData,
    id: proposalId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

// ユーザーの提案を更新する関数
export const updateUserProposal = async (userId: string, proposalId: string, proposalData: any) => {
  const proposalDocRef = doc(db, `users/${userId}/proposals`, proposalId);
  return await updateDoc(proposalDocRef, {
    ...proposalData,
    updatedAt: new Date()
  });
};

// ユーザーの提案を削除する関数
export const deleteUserProposal = async (userId: string, proposalId: string) => {
  const proposalDocRef = doc(db, `users/${userId}/proposals`, proposalId);
  return await deleteDoc(proposalDocRef);
};
```

### 2.5 フィードバックデータの読み書き

```typescript
// src/firebase/firestore.ts

// フィードバックを保存する関数
export const storeFeedback = async (userId: string, feedbackData: any) => {
  const feedbackId = uuidv4();
  const feedbackDocRef = doc(db, 'feedback', feedbackId);
  return await setDoc(feedbackDocRef, {
    ...feedbackData,
    uid: userId,
    id: feedbackId,
    createdAt: new Date()
  });
};

// ユーザーのフィードバックを取得する関数
export const getUserFeedback = async (userId: string) => {
  const feedbackCollection = getFeedbackCollection();
  const q = query(feedbackCollection, where('uid', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};
```

## 3. バックログローダーの実装

既存のバックログローダーをFirestoreと統合するために、以下の実装を行います：

```typescript
// src/utils/firebaseBacklogLoader.ts
import { getUserBacklog, storeUserBacklog } from '../firebase/firestore';
import { getCurrentUser } from '../firebase/auth';

// Load backlog data from Firestore for the current user
export async function loadBacklogFromFirestore() {
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

// Save backlog data to Firestore for the current user
export async function saveBacklogToFirestore(backlogData: any) {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('ユーザーが認証されていません');
  }

  await storeUserBacklog(user.uid, backlogData);
  return { success: true };
}

// Initialize a new user's backlog with empty data
export async function initializeUserBacklog(uid: string) {
  const emptyBacklog = { tasks: [] };
  await storeUserBacklog(uid, emptyBacklog);
  return emptyBacklog;
}
```

## 4. バックログAPIの更新

既存のバックログAPIをFirestoreと統合するために、以下の実装を行います：

```typescript
// src/app/api/backlog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loadBacklogFromFirestore } from '../../../utils/firebaseBacklogLoader';

export async function GET(request: NextRequest) {
  try {
    const backlogData = await loadBacklogFromFirestore();
    return NextResponse.json(backlogData);
  } catch (error) {
    console.error('Error loading backlog:', error);
    return NextResponse.json(
      { error: 'Failed to load backlog data' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/backlog/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveBacklogToFirestore } from '../../../../utils/firebaseBacklogLoader';

export async function POST(request: NextRequest) {
  try {
    const backlogData = await request.json();
    await saveBacklogToFirestore(backlogData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating backlog:', error);
    return NextResponse.json(
      { error: 'Failed to update backlog data' },
      { status: 500 }
    );
  }
}
```

## 5. データ移行ユーティリティの実装

既存のJSONデータをFirestoreに移行するためのユーティリティを実装します：

```typescript
// src/utils/migrationUtils.ts
import { getUserBacklog, storeUserBacklog } from '../firebase/firestore';
import { getCurrentUser } from '../firebase/auth';

/**
 * Import backlog data from a local JSON file to Firestore
 * @param jsonData JSON data to import
 * @returns Success status and message
 */
export async function importBacklogToFirestore(jsonData: any) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'ユーザーが認証されていません' };
    }

    // Validate JSON data
    if (!jsonData || !jsonData.tasks) {
      return { success: false, message: '無効なバックログデータです' };
    }

    // Store in Firestore
    await storeUserBacklog(user.uid, jsonData);
    
    return { 
      success: true, 
      message: 'バックログデータを正常にインポートしました' 
    };
  } catch (error) {
    console.error('Error importing backlog:', error);
    return { 
      success: false, 
      message: `インポート中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Export backlog data from Firestore to JSON
 * @returns Backlog data and success status
 */
export async function exportBacklogFromFirestore() {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'ユーザーが認証されていません', data: null };
    }

    // Get data from Firestore
    const backlogDoc = await getUserBacklog(user.uid);
    if (!backlogDoc.exists()) {
      return { success: false, message: 'バックログデータが見つかりません', data: null };
    }

    const backlogData = backlogDoc.data()?.data;
    
    return { 
      success: true, 
      message: 'バックログデータを正常にエクスポートしました',
      data: backlogData
    };
  } catch (error) {
    console.error('Error exporting backlog:', error);
    return { 
      success: false, 
      message: `エクスポート中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      data: null
    };
  }
}

/**
 * Check if a user has existing backlog data in Firestore
 * @returns Boolean indicating if user has data
 */
export async function hasFirestoreBacklog() {
  try {
    const user = getCurrentUser();
    if (!user) {
      return false;
    }

    const backlogDoc = await getUserBacklog(user.uid);
    return backlogDoc.exists();
  } catch (error) {
    console.error('Error checking backlog existence:', error);
    return false;
  }
}
```

## 6. データ移行コンポーネントの実装

ユーザーがデータを移行するためのUIコンポーネントを実装します：

```tsx
// src/components/migration/DataMigrationPanel.tsx
import React, { useState } from 'react';
import { importBacklogToFirestore, hasFirestoreBacklog } from '../../utils/migrationUtils';
import { useAuth } from '../auth/AuthProvider';

export const DataMigrationPanel: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [hasData, setHasData] = useState<boolean | null>(null);

  // Check if user already has data in Firestore
  React.useEffect(() => {
    if (user) {
      const checkData = async () => {
        const exists = await hasFirestoreBacklog();
        setHasData(exists);
        if (exists) {
          setMessage({
            text: 'すでにFirestoreにデータが存在します。インポートすると上書きされます。',
            type: 'info'
          });
        }
      };
      checkData();
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage({ text: 'ファイルを選択してください', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: 'インポート中...', type: 'info' });

    try {
      // Read file content
      const fileContent = await file.text();
      
      // Parse JSON
      let jsonData;
      try {
        jsonData = JSON.parse(fileContent);
      } catch (e) {
        setMessage({ text: '有効なJSONファイルではありません', type: 'error' });
        setLoading(false);
        return;
      }

      // Import to Firestore
      const result = await importBacklogToFirestore(jsonData);
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        setHasData(true);
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ 
        text: `ファイル読み込み中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-700">データ移行を行うにはログインしてください。</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">データ移行</h2>
      <p className="mb-4 text-gray-600">
        ローカルのbacklog.jsonファイルからFirestoreにデータを移行します。
        これにより、複数のデバイスからデータにアクセスできるようになります。
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' :
          message.type === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          backlog.jsonファイルを選択
        </label>
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleImport}
        disabled={!file || loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'インポート中...' : 'インポート開始'}
      </button>

      {hasData && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">
            Firestoreにデータが存在します。アプリケーションはこのデータを使用します。
          </p>
        </div>
      )}
    </div>
  );
};
```

## 7. セキュリティルールの実装

Firestoreのセキュリティルールを実装して、データの安全性を確保します：

```
// firestore.rules
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

## 8. インデックスの設定

複雑なクエリを効率的に実行するために、以下のインデックスを設定します：

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "priority",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "proposals",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## 9. オフラインサポートの実装

オフラインサポートを有効にして、ネットワーク接続がない場合でもアプリケーションが機能するようにします：

```typescript
// src/firebase/firestore.ts
import { enableIndexedDbPersistence } from 'firebase/firestore';

// オフラインサポートを有効にする関数
export const enableOfflineSupport = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled');
    return true;
  } catch (error) {
    console.error('Error enabling offline persistence:', error);
    return false;
  }
};
```

## 10. エラーハンドリングの実装

Firestoreの操作中に発生するエラーを適切に処理するためのユーティリティを実装します：

```typescript
// src/utils/errorHandling.ts
import { FirebaseError } from 'firebase/app';

// Firestoreエラーメッセージを日本語に変換する関数
export const getFirestoreErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return 'アクセス権限がありません';
      case 'not-found':
        return 'ドキュメントが見つかりません';
      case 'already-exists':
        return 'ドキュメントはすでに存在します';
      case 'resource-exhausted':
        return 'クォータを超過しました';
      case 'failed-precondition':
        return '操作の前提条件が満たされていません';
      case 'aborted':
        return '操作が中断されました';
      case 'out-of-range':
        return '値が範囲外です';
      case 'unimplemented':
        return 'この操作はサポートされていません';
      case 'internal':
        return '内部エラーが発生しました';
      case 'unavailable':
        return 'サービスが利用できません';
      case 'data-loss':
        return 'データが失われました';
      case 'unauthenticated':
        return '認証されていません';
      default:
        return `エラーが発生しました: ${error.message}`;
    }
  }
  
  return error instanceof Error ? error.message : '不明なエラーが発生しました';
};

// Firestoreエラーをログに記録する関数
export const logFirestoreError = (operation: string, error: unknown): void => {
  console.error(`Firestore ${operation} error:`, error);
  
  // 本番環境では適切なエラー追跡サービスを使用
  // 例: Sentry, LogRocket など
};
```

## 11. パフォーマンス最適化

Firestoreの操作を最適化するためのユーティリティを実装します：

```typescript
// src/utils/firestoreOptimization.ts
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firestore';

// ドキュメントをキャッシュするためのメモリキャッシュ
const documentCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1分間キャッシュを保持

// キャッシュを使用してドキュメントを取得する関数
export const getCachedDocument = async (path: string) => {
  const now = Date.now();
  const cached = documentCache.get(path);
  
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);
  const data = docSnap.exists() ? docSnap.data() : null;
  
  documentCache.set(path, { data, timestamp: now });
  return data;
};

// バッチ処理を使用して複数のドキュメントを更新する関数
export const batchUpdateDocuments = async (updates: { path: string, data: any }[]) => {
  const batch = writeBatch(db);
  
  updates.forEach(({ path, data }) => {
    const docRef = doc(db, path);
    batch.set(docRef, data, { merge: true });
    
    // キャッシュも更新
    documentCache.set(path, { data, timestamp: Date.now() });
  });
  
  await batch.commit();
};

// キャッシュをクリアする関数
export const clearCache = () => {
  documentCache.clear();
};
```

## 12. まとめ

このガイドでは、AIプロジェクトマネージャーのFirestoreデータベース実装方法について説明しました。1ユーザー1レコードのアプローチを採用し、セキュリティルールを適切に設定することで、安全かつ効率的なマルチユーザーシステムを構築できます。

データ移行ユーティリティを使用して、既存のJSONデータをFirestoreに移行することができます。また、オフラインサポートを有効にすることで、ネットワーク接続がない場合でもアプリケーションが機能するようになります。

パフォーマンス最適化とエラーハンドリングを適切に実装することで、ユーザーエクスペリエンスを向上させることができます。
