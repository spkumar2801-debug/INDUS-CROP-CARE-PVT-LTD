import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { AdminUser } from '../types/settings';

const LOCAL_ADMIN_KEY = 'indas_admin_auth_session';

// Whitelist of authorized administrator emails for fallback role resolution
const AUTHORIZED_SUPERADMIN_EMAILS = [
  'admin@induscropcare.com',
  'info@induscropcare.com',
  'indusagriseedspl@gmail.com'
];

/**
 * Validates whether an authenticated Firebase user has verified administrator privileges.
 * Checks:
 * 1. Custom token claims (admin === true)
 * 2. Firestore collection adminUsers/{uid} with role in ['admin', 'superadmin', 'editor']
 * 3. Whitelisted superadmin email
 */
async function resolveAdminRole(fbUser: FirebaseUser): Promise<'admin' | 'superadmin' | 'editor' | null> {
  const cleanEmail = (fbUser.email || '').trim().toLowerCase();

  // 1. Check custom token claims if available
  try {
    const idTokenResult = await fbUser.getIdTokenResult();
    if (idTokenResult?.claims?.admin === true) {
      return (idTokenResult.claims.role as any) || 'admin';
    }
  } catch {
    // Non-blocking claim check
  }

  // 2. Check Firestore adminUsers collection
  if (db) {
    try {
      const userDoc = await getDoc(doc(db, 'adminUsers', fbUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data && ['admin', 'superadmin', 'editor'].includes(data.role)) {
          return data.role as 'admin' | 'superadmin' | 'editor';
        }
      }
    } catch (e) {
      console.warn('[authService] Could not read admin profile doc:', e);
    }
  }

  // 3. Check designated superadmin email whitelist
  if (cleanEmail && AUTHORIZED_SUPERADMIN_EMAILS.includes(cleanEmail)) {
    return 'superadmin';
  }

  return null;
}

/**
 * Authenticates an administrator against Firebase Authentication.
 * STABLE PRODUCTION SECURITY RULES:
 * - Invalid credentials must NEVER grant access.
 * - Failed or missing Firebase connection must NEVER grant access.
 * - Authenticated users without administrator permission are rejected and signed out.
 * - No offline bypass or fake credentials permitted.
 */
export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const cleanEmail = email.trim().toLowerCase();

  // Guard: Firebase Authentication MUST be configured and active
  if (!isFirebaseConfigured || !auth) {
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    throw new Error(
      'Authentication service is currently unavailable: VITE_FIREBASE_API_KEY environment variable is missing in Vercel Project Settings.'
    );
  }

  // Attempt real authentication against Firebase
  let fbUser: FirebaseUser;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    fbUser = userCredential.user;
  } catch (err: any) {
    // Clear any residual session on failed attempt
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    const code = err?.code || '';
    if (
      code === 'auth/wrong-password' || 
      code === 'auth/user-not-found' || 
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-email'
    ) {
      throw new Error('Invalid administrator email or password. Access denied.');
    } else if (code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Access is temporarily restricted. Please try again later.');
    } else if (code === 'auth/network-request-failed') {
      throw new Error('Network error. Unable to contact authentication servers.');
    } else if (code === 'auth/unauthorized-domain') {
      throw new Error('Authentication domain not authorized. Please add indus-crop-care-pvt-ltd.vercel.app to Firebase Console -> Authentication -> Settings -> Authorized Domains.');
    } else if (code === 'auth/operation-not-allowed') {
      throw new Error('Email/Password provider is disabled. Please enable it in Firebase Console -> Authentication -> Sign-in method.');
    } else if (code === 'auth/user-disabled') {
      throw new Error('This administrator account has been disabled.');
    }
    throw new Error('Authentication failed. Invalid credentials.');
  }

  // Verify that authenticated user has actual administrator privileges
  const role = await resolveAdminRole(fbUser);
  if (!role) {
    // Revoke Firebase session immediately — ordinary user is NOT an admin
    try {
      await firebaseSignOut(auth);
    } catch {}
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    throw new Error('Access denied. This account does not have administrator privileges.');
  }

  const adminUser: AdminUser = {
    uid: fbUser.uid,
    email: fbUser.email || cleanEmail,
    displayName: fbUser.displayName || 'INDAS Administrator',
    role,
    lastLoginAt: new Date().toISOString()
  };

  localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminUser));
  return adminUser;
}

export async function logoutAdmin(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase sign out error:', e);
    }
  }
  localStorage.removeItem(LOCAL_ADMIN_KEY);
  try {
    sessionStorage.clear();
  } catch {}
}

/**
 * Returns current admin session from storage ONLY if verified against active Firebase Auth user.
 * Prevents any unauthenticated client-side tampering or stale session reuse.
 */
export function getCurrentAdmin(): AdminUser | null {
  // Never grant access if Firebase is not active or if currentUser is null
  if (!isFirebaseConfigured || !auth || !auth.currentUser) {
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    return null;
  }

  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed && 
        parsed.uid === auth.currentUser.uid && 
        ['admin', 'superadmin', 'editor'].includes(parsed.role)
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error parsing admin session:', e);
  }
  localStorage.removeItem(LOCAL_ADMIN_KEY);
  return null;
}

/**
 * Subscribes to Firebase Auth state changes.
 * Enforces real-time role verification.
 */
export function subscribeToAuthChanges(callback: (user: AdminUser | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    const activeAuth = auth;
    return onAuthStateChanged(activeAuth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const role = await resolveAdminRole(fbUser);
        if (!role) {
          // Authenticated as ordinary user, but not an admin -> sign out and deny access
          try {
            await firebaseSignOut(activeAuth);
          } catch {}
          localStorage.removeItem(LOCAL_ADMIN_KEY);
          callback(null);
          return;
        }

        const admin: AdminUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'INDAS Administrator',
          role,
          lastLoginAt: new Date().toISOString()
        };
        localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(admin));
        callback(admin);
      } else {
        localStorage.removeItem(LOCAL_ADMIN_KEY);
        callback(null);
      }
    });
  }

  // If Firebase is not configured, ensure no admin session is returned
  localStorage.removeItem(LOCAL_ADMIN_KEY);
  callback(null);
  return () => {};
}
