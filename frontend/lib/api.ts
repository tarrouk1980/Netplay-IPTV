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
  expert_profile?: FullExpertProfile | null;
};

export type ExpertProfile = {
  id: number;
  user: {id: number; name: string; avatar_url: string | null};
  category: {id: number; name: string; slug: string};
  bio: string;
  years_experience?: number | null;
  credential_reference?: string | null;
  hourly_rate: number;
  currency: string;
  rating_avg: number;
  total_sessions: number;
  status?: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type AvailabilitySlot = {
  id: number;
  expert_id: number;
  day_of_week: number | null;
  specific_date: string | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  timezone: string;
};

export type FullExpertProfile = ExpertProfile & {
  status: 'pending' | 'approved' | 'rejected';
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  years_experience: number | null;
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

export type Message = {
  id: number;
  body: string;
  sender_id: number;
  sender: {id: number; name: string; avatar_url: string | null};
  read_at: string | null;
  created_at: string;
};

export type AppNotification = {
  id: string;
  data: {booking_id: number; status: string; message: string};
  read_at: string | null;
  created_at: string;
};

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  expert_reply: string | null;
  expert_reply_at: string | null;
  client: {id: number; name: string; avatar_url: string | null};
  created_at: string;
};
