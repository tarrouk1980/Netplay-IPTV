import axios from 'axios';

// Change this to your machine's IP when testing on a real device
const API_URL = 'http://192.168.1.7:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

export interface Expert {
  id: number;
  user: { id: number; name: string; avatar_url?: string | null };
  headline?: string | null;
  bio?: string;
  hourly_rate?: number;
  session_price?: number;
  currency?: string;
  status: string;
  rating_avg?: number;
  rating_average?: number;
  reviews_count?: number;
  total_sessions?: number;
  view_count?: number;
  category?: { id: number; name: string; slug: string };
  specializations?: string[];
  featured?: boolean;
}

export interface Booking {
  id: number;
  status: string;
  slot_datetime_start: string;
  slot_datetime_end: string;
  price: number;
  expert?: Expert;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total?: number;
}

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
