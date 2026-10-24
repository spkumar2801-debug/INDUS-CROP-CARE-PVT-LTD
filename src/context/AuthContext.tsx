import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser } from '../types/settings';
import { loginAdmin, logoutAdmin, subscribeToAuthChanges, verifyCurrentSessionFreshness } from '../services/authService';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Recheck session freshness on tab visibility change or focus
    const handleRecheck = async () => {
      if (document.visibilityState === 'visible') {
        const freshUser = await verifyCurrentSessionFreshness();
        setUser(freshUser);
      }
    };

    window.addEventListener('visibilitychange', handleRecheck);
    window.addEventListener('focus', handleRecheck);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleRecheck);
      window.removeEventListener('focus', handleRecheck);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedUser = await loginAdmin(email, password);
      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutAdmin();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components, react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
