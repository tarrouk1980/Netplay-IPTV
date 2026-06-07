'use client';

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {api, type User} from './api';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: Record<string, string>) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const {data} = await api.get<User>('/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (window.localStorage.getItem('auth_token')) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const {data} = await api.post('/login', {email, password});
    window.localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data.user as User;
  }

  async function register(payload: Record<string, string>) {
    const {data} = await api.post('/register', payload);
    window.localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data.user as User;
  }

  async function logout() {
    try {
      await api.post('/logout');
    } finally {
      window.localStorage.removeItem('auth_token');
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{user, loading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
