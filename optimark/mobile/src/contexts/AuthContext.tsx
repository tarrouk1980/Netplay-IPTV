import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api";

interface User { id: string; name: string; email: string; role: string; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  upgradeToSeller: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("token").then(async (t) => {
      if (!t) return;
      setToken(t);
      try {
        const res = await api.get("/auth/me");
        setUser(res.data?.data || res.data?.user || null);
      } catch {}
    });
  }, []);

  const save = async (t: string, u: User) => {
    await AsyncStorage.setItem("token", t);
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const d = res.data?.data;
    await save(d.token, d.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { name, email, password });
    const d = res.data?.data;
    await save(d.token, d.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const upgradeToSeller = async () => {
    const res = await api.patch("/auth/upgrade-to-seller");
    const d = res.data?.data;
    await save(d.token, d.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, upgradeToSeller }}>
      {children}
    </AuthContext.Provider>
  );
}
