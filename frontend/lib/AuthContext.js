'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiService from '@/lib/api';
import { getSession, signOut as nextAuthSignOut } from 'next-auth/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Cek sesi OAuth Google (NextAuth) terlebih dahulu
        const session = await getSession();
        if (session && session.systemToken) {
          // Sinkronkan token NextAuth ke localStorage sistem lama kita
          ApiService.setToken(session.systemToken);
          setUser({ ...session.user, id: session.user.id, role: session.user.role });
          ApiService.setUser({ ...session.user, id: session.user.id, role: session.user.role });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Gagal memeriksa sesi OAuth:", err);
      }

      // Check for existing auth on mount
      const savedUser = ApiService.getUser();
      const token = ApiService.getToken();
      
      if (savedUser && token) {
        setUser(savedUser);
      // Verify token is still valid by fetching profile
      ApiService.getProfile()
        .then((data) => {
          setUser(data.data.user);
          ApiService.setUser(data.data.user);
        })
        .catch(() => {
          // Token invalid, clear everything
          ApiService.removeToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await ApiService.login(email, password);
    setUser(data.data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    return ApiService.register(name, email, password);
  }, []);

  const logout = useCallback(() => {
    ApiService.removeToken();
    setUser(null);
    nextAuthSignOut({ redirect: false }).catch(() => {});
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await ApiService.getProfile();
      setUser(data.data.user);
      ApiService.setUser(data.data.user);
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
