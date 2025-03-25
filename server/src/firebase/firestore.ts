// Firestore utilities for AI Project Manager
import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
  QuerySnapshot,
  DocumentReference,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { User } from 'firebase/auth';

// Collection names
export const USERS_COLLECTION = 'users';
export const TASKS_COLLECTION = 'tasks';
export const PROPOSALS_COLLECTION = 'proposals';
export const FEEDBACK_COLLECTION = 'feedback';

// User document interface
interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: number;
  isAnonymous?: boolean;
}

// Create a new user document in Firestore
export const createUserDocument = async (user: User): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const userData: UserData = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    createdAt: Date.now(),
    isAnonymous: user.isAnonymous || false
  };
  
  return setDoc(userRef, userData);
};

// Get user document by ID
export const getUserDocument = async (uid: string): Promise<DocumentSnapshot> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  return getDoc(userRef);
};

// Store backlog JSON for a user
export const storeUserBacklog = async (uid: string, backlogData: any): Promise<void> => {
  const backlogRef = doc(db, USERS_COLLECTION, uid, 'data', 'backlog');
  return setDoc(backlogRef, { data: backlogData, updatedAt: Date.now() });
};

// Get backlog JSON for a user
export const getUserBacklog = async (uid: string): Promise<DocumentSnapshot> => {
  const backlogRef = doc(db, USERS_COLLECTION, uid, 'data', 'backlog');
  return getDoc(backlogRef);
};

// Store a task proposal
export const storeTaskProposal = async (uid: string, taskId: string, proposalData: any): Promise<void> => {
  const proposalRef = doc(db, USERS_COLLECTION, uid, PROPOSALS_COLLECTION, taskId);
  return setDoc(proposalRef, { 
    ...proposalData, 
    taskId,
    createdAt: Date.now(),
    status: 'pending'
  });
};

// Get task proposals for a user
export const getUserProposals = async (uid: string): Promise<QuerySnapshot<DocumentData>> => {
  const proposalsRef = collection(db, USERS_COLLECTION, uid, PROPOSALS_COLLECTION);
  return getDocs(proposalsRef);
};

// Update a task proposal status
export const updateProposalStatus = async (
  uid: string, 
  taskId: string, 
  status: 'accepted' | 'rejected'
): Promise<void> => {
  const proposalRef = doc(db, USERS_COLLECTION, uid, PROPOSALS_COLLECTION, taskId);
  return updateDoc(proposalRef, { 
    status,
    updatedAt: Date.now()
  });
};

// Store user feedback
export const storeFeedback = async (uid: string, feedbackData: any): Promise<DocumentReference> => {
  const feedbackRef = collection(db, FEEDBACK_COLLECTION);
  const docRef = doc(feedbackRef);
  await setDoc(docRef, {
    ...feedbackData,
    uid,
    createdAt: Date.now()
  });
  return docRef;
};

// Get all feedback (for admin use)
export const getAllFeedback = async (): Promise<QuerySnapshot<DocumentData>> => {
  const feedbackRef = collection(db, FEEDBACK_COLLECTION);
  return getDocs(feedbackRef);
};

// Get feedback for a specific user
export const getUserFeedback = async (uid: string): Promise<QuerySnapshot<DocumentData>> => {
  const feedbackRef = collection(db, FEEDBACK_COLLECTION);
  const q = query(feedbackRef, where('uid', '==', uid));
  return getDocs(q);
};
