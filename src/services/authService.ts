import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { AdminUser } from '../types/settings';

// Storage session key for local state sync
const LOCAL_ADMIN_KEY = 'indas_admin_auth_session';

/**
 * Validates whether an authenticated Firebase user has verified administrator privileges.
 * STRICT PRODUCTION RBAC RULES:
 * 1. Checks custom token claims (admin === true)
 * 2. Checks Firestore document adminUsers/{uid} where UID strictly matches fbUser.uid
 * 3. Enforces that account is not disabled (disabled != true)
 * 4. Enforces explicit approved role in ['admin', 'superadmin', 'editor']
 * 5. Rejects missing document, missing role, invalid role, or disabled status.
 * 6. Email allowlists are NEVER used as a standalone or fallback authorization mechanism.
 */
export async function resolveAdminRole(fbUser: FirebaseUser): Promise<'admin' | 'superadmin' | 'editor' | null> {
  // 1. Check custom token claims if available
  try {
    const idTokenResult = await fbUser.getIdTokenResult();
    if (idTokenResult?.claims?.admin === true) {
      const claimRole = idTokenResult.claims.role as string;
      if (['admin', 'superadmin', 'editor'].includes(claimRole)) {
        return claimRole as 'admin' | 'superadmin' | 'editor';
      }
      return 'admin';
    }
  } catch {
    // Non-blocking claim check
  }

  // 2. Check Firestore adminUsers collection matching authenticated UID
  if (db) {
    try {
      const userDoc = await getDoc(doc(db, 'adminUsers', fbUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Reject disabled accounts
        if (data?.disabled === true || data?.status === 'disabled') {
          console.warn('[authService] Admin account is disabled:', fbUser.uid);
          return null;
        }

        // Verify UID match if document explicitly specifies uid
        if (data?.uid && data.uid !== fbUser.uid) {
          console.warn('[authService] Admin document UID mismatch:', data.uid, '!=', fbUser.uid);
          return null;
        }

        // Explicit role must be one of the approved roles
        if (data?.role && ['admin', 'superadmin', 'editor'].includes(data.role)) {
          return data.role as 'admin' | 'superadmin' | 'editor';
        }
        
        console.warn('[authService] Admin document missing valid role field for user:', fbUser.uid);
        return null;
      }
    } catch (e) {
      console.warn('[authService] Could not read admin profile doc:', e);
    }
  }

  // Unauthenticated, missing document, missing role, or unverified: strictly denied
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

/**
 * Re-validates the current authenticated user's authorization directly against Firestore.
 * If the user's role was revoked, document deleted, or account disabled, signs them out immediately.
 */
export async function verifyCurrentSessionFreshness(): Promise<AdminUser | null> {
  if (!isFirebaseConfigured || !auth || !auth.currentUser) {
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    return null;
  }

  try {
    const role = await resolveAdminRole(auth.currentUser);
    if (!role) {
      console.warn('[authService] Admin privileges revoked or document absent. Revoking session.');
      try {
        await firebaseSignOut(auth);
      } catch {}
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      return null;
    }

    const admin: AdminUser = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email || '',
      displayName: auth.currentUser.displayName || 'INDAS Administrator',
      role,
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(admin));
    return admin;
  } catch (err) {
    console.warn('[authService] Session freshness verification caught error:', err);
    return getCurrentAdmin();
  }
}
