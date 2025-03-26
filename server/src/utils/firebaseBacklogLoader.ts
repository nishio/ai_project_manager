import { getUserBacklog, storeUserBacklog } from '../firebase/firestore';
import { getCurrentUser, ensureUser } from '../firebase/auth';

// Load backlog data from Firestore for the current user
export async function loadBacklogFromFirestore() {
  // テストモードの場合、テストデータを使用
  if (process.env.NEXT_PUBLIC_USE_TEST_MODE === 'true') {
    try {
      // ブラウザ環境ではfetch APIを使用
      const response = await fetch('/api/test-data');
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading test data:', error);
      return { tasks: [] };
    }
  }

  // 通常のFirestoreロジック（既存のコード）
  const user = await ensureUser();
  if (!user) {
    throw new Error('ユーザー認証に失敗しました');
  }

  const backlogDoc = await getUserBacklog(user.uid);
  if (!backlogDoc.exists()) {
    // Initialize empty backlog for new users
    return await initializeUserBacklog(user.uid);
  }

  return backlogDoc.data()?.data || { tasks: [] };
}

// Save backlog data to Firestore for the current user
export async function saveBacklogToFirestore(backlogData: any) {
  // テストモードの場合、APIを使用してデータを保存
  if (process.env.NEXT_PUBLIC_USE_TEST_MODE === 'true') {
    try {
      const response = await fetch('/api/test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backlogData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save test data');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error saving test data:', error);
      return { success: false };
    }
  }

  // 通常のFirestoreロジック（既存のコード）
  const user = await ensureUser();
  if (!user) {
    throw new Error('ユーザー認証に失敗しました');
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
