import { getUserBacklog, storeUserBacklog } from '../firebase/firestore';
import { getCurrentUser, ensureUser } from '../firebase/auth';

// Load backlog data from Firestore for the current user
export async function loadBacklogFromFirestore() {
  // Ensure user is authenticated (anonymously if needed)
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
  // Ensure user is authenticated (anonymously if needed)
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
