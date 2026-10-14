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

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. If Firebase is configured, authenticate via Firebase Authentication
  if (isFirebaseConfigured && auth) {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = userCredential.user;

    // Verify admin role in Firestore collection adminUsers/{uid}
    let role: 'admin' | 'superadmin' | 'editor' = 'admin';
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, 'adminUsers', fbUser.uid));
        if (userDoc.exists()) {
          role = userDoc.data().role || 'admin';
        }
      } catch (e) {
        console.warn('Could not read admin profile doc:', e);
      }
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

  // 2. Offline / Pending Firebase configuration fallback
  // Allows testing the admin panel locally before the live API key is set
  if (password.length >= 6) {
    const demoAdmin: AdminUser = {
      uid: `local-${Date.now()}`,
      email: cleanEmail,
      displayName: 'INDAS Agri Admin',
      role: 'superadmin',
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(demoAdmin));
    return demoAdmin;
  }

  throw new Error('Invalid credentials. Password must be at least 6 characters.');
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
}

export function getCurrentAdmin(): AdminUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing admin session:', e);
  }
  return null;
}

export function subscribeToAuthChanges(callback: (user: AdminUser | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        let role: 'admin' | 'superadmin' | 'editor' = 'admin';
        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'adminUsers', fbUser.uid));
            if (userDoc.exists()) {
              role = userDoc.data().role || 'admin';
            }
          } catch {
            // fallback
          }
        }
        const admin: AdminUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'INDAS Administrator',
          role
        };
        localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(admin));
        callback(admin);
      } else {
        localStorage.removeItem(LOCAL_ADMIN_KEY);
        callback(null);
      }
    });
  }

  // Fallback check
  callback(getCurrentAdmin());
  return () => {};
}
