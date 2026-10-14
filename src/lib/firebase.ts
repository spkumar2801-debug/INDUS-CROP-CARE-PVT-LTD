import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'indas-agri-seeds-ind-pvt-ltd.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'indas-agri-seeds-ind-pvt-ltd',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'indas-agri-seeds-ind-pvt-ltd.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '929613596851',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:929613596851:web',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-MCDH7W73YR'
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseConfigured = false;

try {
  // Validate that a real API key is present before attempting initialization
  const apiKey = firebaseConfig.apiKey.trim();
  const hasRealKey = apiKey.length > 10 && !apiKey.includes('PlaceholderPending');

  if (hasRealKey) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.info('[INDAS Firebase] Initialized successfully with project:', firebaseConfig.projectId);
  } else {
    console.warn('[INDAS Firebase] Web API Key is pending in .env. Falling back gracefully to verified local data store.');
  }
} catch (error) {
  console.warn('[INDAS Firebase] Initialization skipped or error caught gracefully:', error);
}

export { app, auth, db, isFirebaseConfigured, firebaseConfig };
