import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
  avatarMimeType: string | null;
  avatarSizeBytes: number | null;
  avatarUploadedAt: string | null;
}

type AuthCtx = {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role?: 'student' | 'admin') => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

const API_BASE = import.meta.env.VITE_API_BASE;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt') || null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem('jwt', token);
    else localStorage.removeItem('jwt');
  }, [token]);

  // Fetch user profile when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok && !cancelled) {
          const profile = await res.json();
          setUser(profile);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setToken(data.access_token); // matches your Nest response
  };

  const signup = async (email: string, password: string, role: 'student' | 'admin' = 'student') => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) throw new Error('Signup failed');
    const data = await res.json();
    setToken(data.access_token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };
  
  const refreshProfile = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo<AuthCtx>(() => ({
    token,
    user,
    loading,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
    refreshProfile
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
