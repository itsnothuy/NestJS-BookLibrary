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
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, role?: 'student' | 'admin') => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

const API_BASE = import.meta.env.VITE_API_BASE;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt') || null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true

  useEffect(() => {
    if (token) localStorage.setItem('jwt', token);
    else localStorage.removeItem('jwt');
  }, [token]);

  // Fetch user profile when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });
        
        if (!res.ok) {
          // Token might be invalid
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
          return;
        }
        
        if (isMounted) {
          const profile = await res.json();
          setUser(profile);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return; // Ignore abort errors
        }
        console.error('Failed to fetch user profile:', error);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      const newToken = data.access_token;
      
      // Fetch user profile immediately after getting token
      const profileRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      
      if (!profileRes.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const profile = await profileRes.json();
      
      // Set token and user together
      setToken(newToken);
      setUser(profile);
      
      // Return the profile for role-based navigation
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: 'student' | 'admin' = 'student') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) throw new Error('Signup failed');
      const data = await res.json();
      const newToken = data.access_token;
      
      // Fetch user profile immediately
      const profileRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      
      if (!profileRes.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const profile = await profileRes.json();
      
      // Set token and user together
      setToken(newToken);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };
  
  const refreshProfile = async () => {
    if (!token) return;
    
    setLoading(true);
    const abortController = new AbortController();
    
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortController.signal,
      });
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to refresh profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo<AuthCtx>(() => ({
    token,
    user,
    loading,
    isAuthenticated: !!token && !!user,
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
