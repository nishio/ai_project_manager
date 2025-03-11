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
