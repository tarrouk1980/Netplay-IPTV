import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from './api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

export const login = async (email: string, password: string): Promise<{ token: string; user: AuthUser }> => {
  const res = await api.post('/login', { email, password });
  const token = res.data.token;
  const user = res.data.user;
  await SecureStore.setItemAsync('auth_token', token);
  await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
  setAuthToken(token);
  return { token, user };
};

export const logout = async () => {
  await api.post('/logout').catch(() => {});
  await SecureStore.deleteItemAsync('auth_token');
  await SecureStore.deleteItemAsync('auth_user');
  setAuthToken(null);
};

export const loadToken = async (): Promise<string | null> => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) setAuthToken(token);
  return token;
};

export const loadUser = async (): Promise<AuthUser | null> => {
  const raw = await SecureStore.getItemAsync('auth_user');
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
};
