// Firebase configuration for AI Project Manager
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// テストモードの場合はFirebaseを初期化しない
const isTestMode = process.env.NEXT_PUBLIC_USE_TEST_MODE === 'true';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isTestMode) {
  console.log('Running in test mode - using mock Firebase objects');
  // テストモード用のモックオブジェクト
  app = {} as FirebaseApp;
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback({ uid: 'test-user-id' });
      return () => {};
    }
  } as unknown as Auth;
  db = {} as Firestore;
} else {
  try {
    // Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'test-api-key',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'test-project',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Create mock objects for testing environments
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
  }
}

export { app, auth, db };
