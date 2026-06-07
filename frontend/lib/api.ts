import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'expert' | 'admin';
  avatar_url: string | null;
};

export type ExpertProfile = {
  id: number;
  user: {id: number; name: string; avatar_url: string | null};
  category: {id: number; name: string};
  bio: string;
  hourly_rate: number;
  currency: string;
  rating_avg: number;
  total_sessions: number;
};

export type Booking = {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  slot_datetime_start: string;
  slot_datetime_end: string;
  price: number;
  commission_amount: number;
  expert_payout: number;
  expert?: ExpertProfile;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
};
