import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token, user };
}

export async function register(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'BUYER' | 'SELLER';
}): Promise<{ token: string; user: User }> {
  const response = await api.post('/auth/register', data);
  const { token, user } = response.data.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token, user };
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}
