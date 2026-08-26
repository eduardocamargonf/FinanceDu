import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  query,
  where,
  enableIndexedDbPersistence
} from 'firebase/firestore';

// Your web app's Firebase configuration provided
export const firebaseConfig = {
  apiKey: "AIzaSyA0xfClEQD4zV5VsAkt7SOap8AOIGjVXtw",
  authDomain: "myfinancedu.firebaseapp.com",
  databaseURL: "https://myfinancedu-default-rtdb.firebaseio.com",
  projectId: "myfinancedu",
  storageBucket: "myfinancedu.firebasestorage.app",
  messagingSenderId: "393470403949",
  appId: "1:393470403949:web:8bd95132e18b0295e4a664",
  measurementId: "G-WXN9PESDZ9"
};

// Initialize Firebase app safely (prevent duplicate initializeApp calls)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence when possible
try {
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Firebase persistence failed precondition');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Firebase persistence not supported');
      }
    });
  }
} catch (e) {
  // Ignore in SSR / Node
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where
};

export type { User };
