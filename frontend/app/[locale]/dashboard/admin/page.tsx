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
      <ReportsPanel />
      <AdminBookingsPanel />
      <AdminPayoutsPanel />
      <SupportTicketsPanel />
      <AdminUsersPanel />
      <CategoryManagement />
      <SubscriptionPlanManagement />
      <CouponManagement />
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

  const {data: monthly} = useQuery({
    queryKey: ['admin', 'stats-monthly'],
    queryFn: async () => {
      const {data} = await api.get<Array<{month: string; sessions: number; revenue: number; gmv: number}>>('/admin/stats/monthly');
      return data;
    },
  });

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

      {monthly && monthly.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2 text-left">{t('month')}</th>
                <th className="px-4 py-2 text-right">{t('sessions')}</th>
                <th className="px-4 py-2 text-right">{t('gmv')}</th>
                <th className="px-4 py-2 text-right">{t('commission')}</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((row) => (
                <tr key={row.month} className="border-t border-neutral-200">
                  <td className="px-4 py-2 font-medium">{row.month}</td>
                  <td className="px-4 py-2 text-right">{row.sessions}</td>
                  <td className="px-4 py-2 text-right">{Number(row.gmv).toFixed(2)} €</td>
                  <td className="px-4 py-2 text-right text-indigo-600">{Number(row.revenue).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

  const toggleFeatured = useMutation({
    mutationFn: async ({id, featured}: {id: number; featured: boolean}) => {
      await api.patch(`/admin/expert-profiles/${id}`, {featured});
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['admin', 'expert-profiles']}),
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/expert-profiles/${id}`);
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
              <button
                onClick={() => toggleFeatured.mutate({id: profile.id, featured: !(profile as any).featured})}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${(profile as any).featured ? 'bg-amber-500 text-white' : 'border border-amber-400 text-amber-600 hover:bg-amber-50'}`}
              >
                ★ {(profile as any).featured ? t('unfeature') : t('feature')}
              </button>
              <button
                onClick={() => {
                  if (confirm(t('deleteConfirm'))) deleteProfile.mutate(profile.id);
                }}
                disabled={deleteProfile.isPending}
                className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                🗑
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

function CouponManagement() {
  const t = useTranslations('admin');
  const qc = useQueryClient();
  const [form, setForm] = useState({code: '', type: 'percent', value: '', max_uses: '', expires_at: ''});

  const {data: coupons} = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const {data} = await api.get<Array<{id: number; code: string; type: string; value: number; max_uses: number | null; used_count: number; expires_at: string | null; active: boolean}>>('/admin/coupons');
      return data;
    },
  });

  const createCoupon = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {code: form.code, type: form.type, value: Number(form.value)};
      if (form.max_uses) payload.max_uses = Number(form.max_uses);
      if (form.expires_at) payload.expires_at = form.expires_at;
      const {data} = await api.post('/admin/coupons', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['admin-coupons']});
      setForm({code: '', type: 'percent', value: '', max_uses: '', expires_at: ''});
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => qc.invalidateQueries({queryKey: ['admin-coupons']}),
  });

  return (
    <section>
      <h2 className="mb-4 font-semibold">{t('coupons')}</h2>
      <form
        className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5"
        onSubmit={(e) => { e.preventDefault(); createCoupon.mutate(); }}
      >
        <input required placeholder={t('couponCode')} value={form.code} onChange={(e) => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} className="rounded border border-neutral-300 px-3 py-2 text-sm uppercase" />
        <select value={form.type} onChange={(e) => setForm(f => ({...f, type: e.target.value}))} className="rounded border border-neutral-300 px-3 py-2 text-sm">
          <option value="percent">%</option>
          <option value="fixed">{t('fixed')}</option>
        </select>
        <input required type="number" min="0" placeholder={t('couponValue')} value={form.value} onChange={(e) => setForm(f => ({...f, value: e.target.value}))} className="rounded border border-neutral-300 px-3 py-2 text-sm" />
        <input type="number" min="1" placeholder={t('maxUses')} value={form.max_uses} onChange={(e) => setForm(f => ({...f, max_uses: e.target.value}))} className="rounded border border-neutral-300 px-3 py-2 text-sm" />
        <button type="submit" disabled={createCoupon.isPending} className="rounded bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
          {t('create')}
        </button>
      </form>
      <div className="space-y-2">
        {coupons?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm">
            <span className="font-mono font-semibold">{c.code}</span>
            <span className="text-neutral-500">{c.type === 'percent' ? `${c.value}%` : `${c.value} (fixed)`} · {c.used_count}/{c.max_uses ?? '∞'}</span>
            <button onClick={() => deleteCoupon.mutate(c.id)} className="text-xs text-red-500 hover:underline">{t('delete')}</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportsPanel() {
  const t = useTranslations('admin');
  const qc = useQueryClient();

  const {data: reports} = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const {data} = await api.get<Array<{
        id: number;
        reason: string;
        details: string | null;
        status: string;
        created_at: string;
        expert_profile: {id: number; user: {name: string}};
        reporter: {id: number; name: string};
      }>>('/admin/reports');
      return data;
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({id, status}: {id: number; status: string}) =>
      api.patch(`/admin/reports/${id}`, {status}),
    onSuccess: () => qc.invalidateQueries({queryKey: ['admin-reports']}),
  });

  const pending = reports?.filter((r) => r.status === 'pending') ?? [];

  if (pending.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 font-semibold">{t('reports')} ({pending.length})</h2>
      <div className="space-y-2">
        {pending.map((report) => (
          <div key={report.id} className="flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
            <div>
              <p>
                <span className="font-medium">{report.reporter.name}</span>
                {' → '}
                <span className="font-medium">{report.expert_profile.user.name}</span>
              </p>
              <p className="text-neutral-600">{report.reason}</p>
              {report.details && <p className="text-xs text-neutral-500">{report.details}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => updateReport.mutate({id: report.id, status: 'reviewed'})}
                className="rounded-full bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
              >
                {t('reviewed')}
              </button>
              <button
                onClick={() => updateReport.mutate({id: report.id, status: 'dismissed'})}
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
              >
                {t('dismiss')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminBookingsPanel() {
  const t = useTranslations('admin');

  const {data} = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const {data} = await api.get<{data: Array<{id: number; status: string; slot_datetime_start: string; price: number; client: {name: string}; expert: {user: {name: string}}}>}>('/admin/bookings');
      return data;
    },
  });

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{t('allBookings')}</h2>
        <a
          href={`${apiBase}/admin/bookings/export`}
          className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          download
        >
          ↓ CSV
        </a>
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">{t('client')}</th>
              <th className="px-4 py-2 text-left">{t('expert')}</th>
              <th className="px-4 py-2 text-left">{t('date')}</th>
              <th className="px-4 py-2 text-left">{t('price')}</th>
              <th className="px-4 py-2 text-left">{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((b) => (
              <tr key={b.id} className="border-t border-neutral-200">
                <td className="px-4 py-2 text-neutral-400">#{b.id}</td>
                <td className="px-4 py-2">{b.client?.name ?? '—'}</td>
                <td className="px-4 py-2">{b.expert?.user?.name ?? '—'}</td>
                <td className="px-4 py-2">{new Date(b.slot_datetime_start).toLocaleDateString()}</td>
                <td className="px-4 py-2 font-medium">{b.price}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminPayoutsPanel() {
  const t = useTranslations('admin');
  const qc = useQueryClient();

  const {data: payouts} = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const {data} = await api.get<Array<{id: number; amount: number; status: string; period_start: string; period_end: string; expert: {user: {name: string}}; created_at: string}>>('/admin/payouts');
      return data;
    },
  });

  const markPaid = useMutation({
    mutationFn: async (id: number) => api.patch(`/admin/payouts/${id}`, {status: 'paid'}),
    onSuccess: () => qc.invalidateQueries({queryKey: ['admin-payouts']}),
  });

  const pending = payouts?.filter((p) => p.status === 'pending') ?? [];

  if (pending.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 font-semibold">{t('pendingPayouts')} ({pending.length})</h2>
      <div className="space-y-2">
        {pending.map((payout) => (
          <div key={payout.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{payout.expert?.user?.name}</p>
              <p className="text-xs text-neutral-500">{payout.amount.toFixed(2)} EUR · {new Date(payout.created_at).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => markPaid.mutate(payout.id)}
              disabled={markPaid.isPending}
              className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {t('markPaid')}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SupportTicketsPanel() {
  const t = useTranslations('admin');
  const qc = useQueryClient();
  const [replyText, setReplyText] = useState<Record<number, string>>({});

  const {data: tickets} = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      const {data} = await api.get<Array<{id: number; subject: string; body: string; status: string; user: {name: string; email: string}; admin_reply: string | null; created_at: string}>>('/admin/support-tickets');
      return data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({id, reply}: {id: number; reply: string}) =>
      api.patch(`/admin/support-tickets/${id}`, {admin_reply: reply, status: 'resolved'}),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['admin-support-tickets']});
      setReplyText({});
    },
  });

  const open = tickets?.filter((t) => t.status === 'open' || t.status === 'in_progress') ?? [];

  if (open.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 font-semibold">{t('supportTickets')} ({open.length})</h2>
      <div className="space-y-3">
        {open.map((ticket) => (
          <div key={ticket.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{ticket.subject}</p>
                <p className="text-xs text-neutral-500">{ticket.user.name} · {ticket.user.email}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{ticket.status}</span>
            </div>
            <p className="mt-2 text-sm text-neutral-700 line-clamp-2">{ticket.body}</p>
            <div className="mt-3 flex gap-2">
              <input
                value={replyText[ticket.id] ?? ''}
                onChange={(e) => setReplyText((r) => ({...r, [ticket.id]: e.target.value}))}
                placeholder={t('replyPlaceholder')}
                className="flex-1 rounded border border-neutral-300 px-3 py-1.5 text-sm"
              />
              <button
                onClick={() => replyMutation.mutate({id: ticket.id, reply: replyText[ticket.id] ?? ''})}
                disabled={replyMutation.isPending || !replyText[ticket.id]?.trim()}
                className="rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {t('reply')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminUsersPanel() {
  const t = useTranslations('admin');
  const qc = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('');

  const {data} = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => {
      const params = roleFilter ? {role: roleFilter} : {};
      const {data} = await api.get<{data: Array<{id: number; name: string; email: string; role: string; banned_at: string | null; created_at: string}>}>('/admin/users', {params});
      return data;
    },
  });

  const banMutation = useMutation({
    mutationFn: async ({id, banned}: {id: number; banned: boolean}) => {
      await api.post(`/admin/users/${id}/${banned ? 'unban' : 'ban'}`);
    },
    onSuccess: () => qc.invalidateQueries({queryKey: ['admin-users']}),
  });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{t('users')}</h2>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded border border-neutral-300 px-2 py-1 text-xs"
        >
          <option value="">{t('allRoles')}</option>
          <option value="client">{t('roleClient')}</option>
          <option value="expert">{t('roleExpert')}</option>
          <option value="admin">{t('roleAdmin')}</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">{t('name')}</th>
              <th className="px-4 py-2 text-left">{t('email')}</th>
              <th className="px-4 py-2 text-left">{t('role')}</th>
              <th className="px-4 py-2 text-left">{t('status')}</th>
              <th className="px-4 py-2 text-left">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((u) => (
              <tr key={u.id} className="border-t border-neutral-200">
                <td className="px-4 py-2 text-neutral-400">#{u.id}</td>
                <td className="px-4 py-2 font-medium">{u.name}</td>
                <td className="px-4 py-2 text-neutral-500">{u.email}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">{u.role}</span>
                </td>
                <td className="px-4 py-2">
                  {u.banned_at ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{t('banned')}</span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{t('active')}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => banMutation.mutate({id: u.id, banned: !!u.banned_at})}
                    disabled={banMutation.isPending}
                    className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                      u.banned_at
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'border border-red-400 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {u.banned_at ? t('unban') : t('ban')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
