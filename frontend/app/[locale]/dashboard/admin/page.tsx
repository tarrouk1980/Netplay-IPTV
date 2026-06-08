'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useRouter} from '@/i18n/navigation';
import {api, type Category, type FullExpertProfile, type Paginated} from '@/lib/api';

type AdminStats = {
  total_users: number;
  total_experts: number;
  pending_experts: number;
  approved_experts: number;
  total_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  total_revenue: number;
};
import {useAuth} from '@/lib/auth-context';

type SubscriptionPlan = {
  id: number;
  name: string;
  price: number;
  billing_interval: string;
  included_sessions_per_month: number;
};

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const {user, loading} = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <AdminStatsPanel />
      <ExpertProfileModeration />
      <CategoryManagement />
      <SubscriptionPlanManagement />
    </div>
  );
}

function AdminStatsPanel() {
  const t = useTranslations('admin');

  const {data} = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const {data} = await api.get<AdminStats>('/admin/stats');
      return data;
    },
  });

  if (!data) return null;

  const cards = [
    {label: t('statsUsers'), value: data.total_users, icon: '👥'},
    {label: t('statsApprovedExperts'), value: data.approved_experts, icon: '✅'},
    {label: t('statsPendingExperts'), value: data.pending_experts, icon: '⏳'},
    {label: t('statsCompletedBookings'), value: data.completed_bookings, icon: '📋'},
    {label: t('statsConfirmedBookings'), value: data.confirmed_bookings, icon: '📅'},
    {label: t('statsRevenue'), value: `${data.total_revenue.toFixed(2)} €`, icon: '💶'},
  ];

  return (
    <section>
      <h2 className="mb-3 font-semibold">{t('statsTitle')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
            <div className="text-2xl">{c.icon}</div>
            <div className="mt-1 text-xl font-bold text-indigo-600">{c.value}</div>
            <div className="mt-1 text-xs text-neutral-500">{c.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExpertProfileModeration() {
  const t = useTranslations('admin');
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');

  const {data} = useQuery({
    queryKey: ['admin', 'expert-profiles', status],
    queryFn: async () => {
      const {data} = await api.get<Paginated<FullExpertProfile>>('/admin/expert-profiles', {
        params: status ? {status} : {},
      });
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({id, newStatus}: {id: number; newStatus: string}) => {
      await api.patch(`/admin/expert-profiles/${id}`, {status: newStatus});
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['admin', 'expert-profiles']}),
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{t('expertProfiles')}</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-neutral-300 px-2 py-1 text-xs"
        >
          <option value="">{t('all')}</option>
          <option value="pending">{t('pending')}</option>
          <option value="approved">{t('approved')}</option>
          <option value="rejected">{t('rejected')}</option>
        </select>
      </div>

      {data && data.data.length === 0 && <p className="text-sm text-neutral-500">{t('noProfiles')}</p>}

      <div className="space-y-3">
        {data?.data.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
          >
            <div>
              <p className="font-medium">{profile.user.name}</p>
              <p className="text-sm text-neutral-500">
                {profile.category.name} · {profile.hourly_rate} {profile.currency}
              </p>
              {profile.credential_reference && (
                <p className="mt-1 text-xs text-neutral-500">
                  {t('credentialReference')}: {profile.credential_reference}
                </p>
              )}
              <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                {t(profile.status)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus.mutate({id: profile.id, newStatus: 'approved'})}
                disabled={profile.status === 'approved'}
                className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                {t('approve')}
              </button>
              <button
                onClick={() => updateStatus.mutate({id: profile.id, newStatus: 'rejected'})}
                disabled={profile.status === 'rejected'}
                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                {t('reject')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryManagement() {
  const t = useTranslations('admin');
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  const {data} = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {data} = await api.get<Category[]>('/categories');
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/admin/categories', {name});
    },
    onSuccess: () => {
      setName('');
      queryClient.invalidateQueries({queryKey: ['categories']});
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['categories']}),
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 font-semibold">{t('categories')}</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('categoryNamePlaceholder')}
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('add')}
        </button>
      </form>

      {data && data.length === 0 && <p className="text-sm text-neutral-500">{t('noCategories')}</p>}

      <div className="space-y-2">
        {data?.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
          >
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-xs text-neutral-500">{category.slug}</p>
            </div>
            <button
              onClick={() => remove.mutate(category.id)}
              className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              {t('delete')}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SubscriptionPlanManagement() {
  const t = useTranslations('admin');
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    price: '',
    billing_interval: 'monthly',
    included_sessions_per_month: '',
  });

  const {data} = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const {data} = await api.get<SubscriptionPlan[]>('/subscription-plans');
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/admin/subscription-plans', {
        name: form.name,
        price: form.price,
        billing_interval: form.billing_interval,
        included_sessions_per_month: form.included_sessions_per_month,
      });
    },
    onSuccess: () => {
      setForm({name: '', price: '', billing_interval: 'monthly', included_sessions_per_month: ''});
      queryClient.invalidateQueries({queryKey: ['subscription-plans']});
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/subscription-plans/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['subscription-plans']}),
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 font-semibold">{t('subscriptionPlans')}</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (form.name.trim() && form.price) create.mutate();
        }}
        className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({...f, name: e.target.value}))}
          placeholder={t('planNamePlaceholder')}
          className="rounded border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((f) => ({...f, price: e.target.value}))}
          placeholder={t('price')}
          className="rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <select
          value={form.billing_interval}
          onChange={(e) => setForm((f) => ({...f, billing_interval: e.target.value}))}
          className="rounded border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="monthly">{t('monthly')}</option>
          <option value="yearly">{t('yearly')}</option>
        </select>
        <input
          type="number"
          value={form.included_sessions_per_month}
          onChange={(e) => setForm((f) => ({...f, included_sessions_per_month: e.target.value}))}
          placeholder={t('includedSessions')}
          className="rounded border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('add')}
        </button>
      </form>

      {data && data.length === 0 && <p className="text-sm text-neutral-500">{t('noPlans')}</p>}

      <div className="space-y-2">
        {data?.map((plan) => (
          <div key={plan.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
            <div>
              <p className="font-medium">{plan.name}</p>
              <p className="text-xs text-neutral-500">
                {plan.price} · {t(plan.billing_interval === 'yearly' ? 'yearly' : 'monthly')} ·{' '}
                {plan.included_sessions_per_month} {t('includedSessions')}
              </p>
            </div>
            <button
              onClick={() => remove.mutate(plan.id)}
              className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              {t('delete')}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
