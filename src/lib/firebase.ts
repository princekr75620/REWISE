import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup as fbSignInWithPopup, 
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile as fbUpdateProfile,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

// Hardcoded safe configuration provisioned specifically for this applet
const firebaseConfig = {
  projectId: "moonlit-window-fcf5x",
  appId: "1:1083467124303:web:efbe70ea99de8b09c9243a",
  apiKey: "AIzaSyBQqtz3udcwucf6k0370ZeyREgtg61847M",
  authDomain: "moonlit-window-fcf5x.firebaseapp.com",
  storageBucket: "moonlit-window-fcf5x.firebasestorage.app",
  messagingSenderId: "1083467124303",
  measurementId: ""
};

const databaseId = "ai-studio-b4cd212d-347b-4bfe-825c-5fe8405d193c";

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);

// Export Auth Providers
export { GoogleAuthProvider };

// Helper function to sign wrap Auth Profile updates
export const updateProfile = async (user: any, profile: { displayName?: string; photoURL?: string }) => {
  return fbUpdateProfile(user, profile);
};

// Authentication state listeners wrapper
export const onAuthStateChanged = (authInstance: any, callback: any) => {
  return fbOnAuthStateChanged(authInstance, callback);
};

// Sign in with Email/Password
export const signInWithEmailAndPassword = async (authInstance: any, email: string, pass: string) => {
  const creds = await fbSignInWithEmailAndPassword(authInstance, email, pass);
  // Keep syncing a local cache of user for other parts of the app
  try {
    localStorage.setItem('rewise_user', JSON.stringify({
      uid: creds.user.uid,
      email: creds.user.email,
      displayName: creds.user.displayName
    }));
  } catch (err) {
    console.error("Local caching sync err:", err);
  }
  return creds;
};

// Create User with Email/Password
export const createUserWithEmailAndPassword = async (authInstance: any, email: string, pass: string) => {
  const creds = await fbCreateUserWithEmailAndPassword(authInstance, email, pass);
  try {
    localStorage.setItem('rewise_user', JSON.stringify({
      uid: creds.user.uid,
      email: creds.user.email,
      displayName: creds.user.displayName
    }));
  } catch (err) {
    console.error("Local caching sync err:", err);
  }
  return creds;
};

// Sign In with Popup (Google)
export const signInWithPopup = async (authInstance: any, provider: any) => {
  const creds = await fbSignInWithPopup(authInstance, provider);
  try {
    localStorage.setItem('rewise_user', JSON.stringify({
      uid: creds.user.uid,
      email: creds.user.email,
      displayName: creds.user.displayName,
      photoURL: creds.user.photoURL
    }));
  } catch (err) {
    console.error("Local caching sync err:", err);
  }
  return creds;
};

// Sign Out
export const signOut = async (authInstance: any) => {
  await fbSignOut(authInstance);
  try {
    localStorage.removeItem('rewise_user');
  } catch (err) {
    console.error("Local caching clear err:", err);
  }
};

// Core Firestore Database Transmission Actions
export async function submitContactMessage(payload: { name: string; email: string; phone?: string; message: string }) {
  try {
    // 1. Submit to real Firebase Firestore collection "messages" as requested
    const messagesCol = collection(db, 'messages');
    const docRef = await addDoc(messagesCol, {
      ...payload,
      phone: payload.phone || "Not Provided",
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error: any) {
    console.error("Firestore message write failed:", error);
    throw error;
  }
}

export async function fetchContactMessages(): Promise<any[]> {
  try {
    const messagesCol = collection(db, 'messages');
    // Try to query messages, falling back gracefully if no index is yet built
    try {
      const q = query(messagesCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Ordered fetch failed, doing simple fetch:", e);
      const snapshot = await getDocs(messagesCol);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error("Firestore messages fetch failed:", error);
    return [];
  }
}
