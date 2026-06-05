"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  getCurrentUser,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: 'BUYER' | 'SELLER';
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authLogin(email, password);
    setUser(user);
  }, []);

  const register = useCallback(async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: 'BUYER' | 'SELLER';
  }) => {
    const { user } = await authRegister(data);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
