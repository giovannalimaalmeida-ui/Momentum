import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider 
} from "firebase/auth";

// Casting to any to satisfy the typescript compiler under bundler resolution
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: metaEnv.VITE_FIREBASE_APP_ID
};

// Check if all essential keys are provided and not empty
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "undefined" &&
  firebaseConfig.apiKey !== ""
);

const app = getApps().length === 0 
  ? (isFirebaseConfigured ? initializeApp(firebaseConfig) : null) 
  : getApp();

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();

// Standardized provider scope
googleProvider.addScope("profile");
googleProvider.addScope("email");

export { isFirebaseConfigured, firebaseConfig };
