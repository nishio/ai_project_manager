// Authentication utilities for Firebase
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './config';
import { initializeUserBacklog } from '../utils/firebaseBacklogLoader';

// Register a new user
export const registerUser = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign in an existing user
export const signInUser = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign in anonymously
export const signInAnonymousUser = async (): Promise<User | null> => {
  try {
    const userCredential = await signInAnonymously(auth);
    // Initialize empty backlog for new anonymous user
    await initializeUserBacklog(userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return null;
  }
};

// Ensure user is authenticated (anonymously if needed)
export const ensureUser = async (): Promise<User | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return await signInAnonymousUser();
  }
  return currentUser;
};

// Sign out the current user
export const signOutUser = async (): Promise<void> => {
  return signOut(auth);
};

// Get the current authenticated user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};
