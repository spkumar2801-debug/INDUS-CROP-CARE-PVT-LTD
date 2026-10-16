import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDoc } from 'firebase/firestore';

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


/**
 * Performs an actual real-time connectivity verification check against live Firebase services.
 * Awaits authentication initialization and differentiates between unauthenticated vs authorized states.
 */
export async function verifyFirebaseConnectivity(): Promise<{
  connected: boolean;
  status: 'connected' | 'auth_required' | 'rules_pending' | 'missing_config' | 'error';
  message: string;
  details?: string;
}> {
  if (!isFirebaseConfigured || !db || !auth) {
    return {
      connected: false,
      status: 'missing_config',
      message: 'Pending VITE_FIREBASE_API_KEY in environment configuration'
    };
  }

  // Ensure Firebase Auth state is restored from local storage before testing
  try {
    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady();
    }
  } catch (e) {
    console.warn('[INDAS Firebase] authStateReady wait warning:', e);
  }

  const currentUser = auth.currentUser;

  try {
    await getDoc(doc(db, 'siteSettings', 'general'));
    return {
      connected: true,
      status: 'connected',
      message: currentUser
        ? `Connected & Live (Firestore & Auth Active · ${currentUser.email})`
        : 'Connected & Live (Firestore Public Read Active)'
    };
  } catch (err: any) {
    const code = err?.code || '';
    if (code === 'permission-denied') {
      if (!currentUser) {
        return {
          connected: false,
          status: 'auth_required',
          message: 'Firebase Connected · Administrator Login Required to Access Firestore'
        };
      } else {
        return {
          connected: false,
          status: 'rules_pending',
          message: `Firebase Connected · Account (${currentUser.email}) Requires Security Rules Deployment in Firebase Console`
        };
      }
    }
    return {
      connected: false,
      status: 'error',
      message: `Firebase error: ${err?.message || 'Network unreachable'}`
    };
  }
}

export { app, auth, db, isFirebaseConfigured, firebaseConfig };
