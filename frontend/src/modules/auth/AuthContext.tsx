import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthCtx = {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role?: 'student' | 'admin') => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

const API_BASE = import.meta.env.VITE_API_BASE;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt') || null);

  useEffect(() => {
    if (token) localStorage.setItem('jwt', token);
    else localStorage.removeItem('jwt');
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

  const logout = () => setToken(null);

  const value = useMemo<AuthCtx>(() => ({
    token,
    isAuthenticated: !!token,
    login,
    signup,
    logout
  }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
