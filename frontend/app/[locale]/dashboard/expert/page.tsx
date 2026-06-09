'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useRouter, Link} from '@/i18n/navigation';
import {api, type Category, type AvailabilitySlot, type Booking, type Paginated, type ExpertStats} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {AvatarSettings} from '@/components/avatar-settings';
import {ChangePasswordForm} from '@/components/change-password-form';

export default function ExpertDashboardPage() {
  const router = useRouter();
  const {user, loading} = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'expert')) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  if (!user || user.role !== 'expert') {
    return null;
  }

  if (!user.expert_profile) {
    return <CreateProfile />;
  }

  return <ExpertWorkspace />;
}

function CreateProfile() {
  const t = useTranslations('expert');
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    category_id: '',
    bio: '',
    hourly_rate: '',
    currency: 'EUR',
    years_experience: '',
    credential_reference: '',
  });
  const [error, setError] = useState<string | null>(null);

  const {data: categories} = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {data} = await api.get<Category[]>('/categories');
      return data;
    },
  });

  const REGULATED_SLUGS = ['conseil-juridique', 'pre-diagnostic-medical'];
  const selectedCategory = categories?.find((c) => c.id === Number(form.category_id));
  const requiresCredential = !!selectedCategory && REGULATED_SLUGS.includes(selectedCategory.slug);

  const mutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post('/experts', {
        ...form,
        category_id: Number(form.category_id),
        hourly_rate: Number(form.hourly_rate),
        years_experience: form.years_experience ? Number(form.years_experience) : undefined,
        credential_reference: form.credential_reference || undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['me']});
      window.location.reload();
    },
    onError: () => setError(t('createProfile')),
  });

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({...f, [field]: e.target.value}));
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold">{t('createProfileTitle')}</h1>
      <p className="mt-1 text-sm text-neutral-500">{t('createProfileSubtitle')}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          mutation.mutate();
        }}
        className="mt-6 space-y-4"
      >
        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('category')}</label>
          <select
            required
            value={form.category_id}
            onChange={update('category_id')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('bio')}</label>
          <textarea
            required
            rows={4}
            placeholder={t('bioPlaceholder')}
            value={form.bio}
            onChange={update('bio')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">{t('hourlyRate')}</label>
            <input
              type="number"
              required
              min="0"
              value={form.hourly_rate}
              onChange={update('hourly_rate')}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">{t('currency')}</label>
            <input
              required
              maxLength={3}
              value={form.currency}
              onChange={update('currency')}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm uppercase"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('yearsExperience')}</label>
          <input
            type="number"
            min="0"
            value={form.years_experience}
            onChange={update('years_experience')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {requiresCredential && (
          <div>
            <label className="mb-1 block text-xs text-neutral-500">{t('credentialReference')}</label>
            <input
              required
              placeholder={t('credentialReferencePlaceholder')}
              value={form.credential_reference}
              onChange={update('credential_reference')}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">{t('credentialReferenceHelp')}</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('createProfile')}
        </button>
      </form>
    </div>
  );
}

function EditProfileForm() {
  const t = useTranslations('expert');
  const tc = useTranslations('common');
  const {user, refreshUser} = useAuth();
  const profile = user!.expert_profile!;
  const [form, setForm] = useState({
    bio: profile.bio,
    hourly_rate: String(profile.hourly_rate),
    currency: profile.currency,
    years_experience: profile.years_experience != null ? String(profile.years_experience) : '',
    credential_reference: profile.credential_reference ?? '',
  });
  const [languages, setLanguages] = useState<string[]>(profile.languages ?? []);
  const [success, setSuccess] = useState(false);

  function toggleLanguage(code: string) {
    setSuccess(false);
    setLanguages((ls) => (ls.includes(code) ? ls.filter((l) => l !== code) : [...ls, code]));
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.patch(`/experts/${profile.id}`, {
        bio: form.bio,
        hourly_rate: Number(form.hourly_rate),
        currency: form.currency,
        ...(form.years_experience ? {years_experience: Number(form.years_experience)} : {}),
        credential_reference: form.credential_reference || null,
        languages,
      });
      return data;
    },
    onSuccess: async () => {
      setSuccess(true);
      await refreshUser();
    },
  });

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSuccess(false);
      setForm((f) => ({...f, [field]: e.target.value}));
    };
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold">{t('editProfile')}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('bio')}</label>
          <textarea
            required
            rows={4}
            value={form.bio}
            onChange={update('bio')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">{t('hourlyRate')}</label>
            <input
              type="number"
              required
              min="0"
              value={form.hourly_rate}
              onChange={update('hourly_rate')}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">{t('currency')}</label>
            <input
              required
              maxLength={3}
              value={form.currency}
              onChange={update('currency')}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm uppercase"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('yearsExperience')}</label>
          <input
            type="number"
            min="0"
            value={form.years_experience}
            onChange={update('years_experience')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('credentialReference')}</label>
          <input
            placeholder={t('credentialReferencePlaceholder')}
            value={form.credential_reference}
            onChange={update('credential_reference')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('languagesSpoken')}</label>
          <div className="flex flex-wrap gap-3">
            {['fr', 'ar', 'en'].map((code) => (
              <label key={code} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={languages.includes(code)}
                  onChange={() => toggleLanguage(code)}
                />
                {t(`language${code.charAt(0).toUpperCase()}${code.slice(1)}`)}
              </label>
            ))}
          </div>
        </div>

        {success && <p className="text-sm text-emerald-600">{t('editProfileSuccess')}</p>}
        {mutation.isError && <p className="text-sm text-red-600">{t('editProfileError')}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {tc('save')}
        </button>
      </form>
    </div>
  );
}

function StatsCards() {
  const t = useTranslations('expert');
  const {data} = useQuery({
    queryKey: ['expert-stats'],
    queryFn: async () => {
      const {data} = await api.get<ExpertStats>('/expert/stats');
      return data;
    },
  });

  if (!data) return null;

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, {style: 'currency', currency: data.currency, maximumFractionDigits: 0}).format(n);

  const cards = [
    {label: t('statsTotalEarnings'), value: fmt(data.total_earnings), icon: '💰'},
    {label: t('statsUpcoming'), value: String(data.upcoming_bookings), icon: '📅'},
    {label: t('statsCompleted'), value: String(data.completed_bookings), icon: '✅'},
    {label: t('statsAvgRating'), value: data.total_reviews > 0 ? `${data.avg_rating} ★ (${data.total_reviews})` : '—', icon: '⭐'},
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
          <div className="text-2xl">{c.icon}</div>
          <div className="mt-1 text-xl font-bold text-indigo-600">{c.value}</div>
          <div className="mt-1 text-xs text-neutral-500">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function ExpertWorkspace() {
  const t = useTranslations('expert');
  const {user} = useAuth();
  const profile = user!.expert_profile!;

  return (
    <div className="space-y-10">
      <StatsCards />
      <div>
        <Link href="/dashboard/expert/earnings" className="inline-flex items-center gap-1 rounded-full border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
          💰 {t('viewEarnings')}
        </Link>
      </div>
      <AvatarSettings />
      <ChangePasswordForm />

      {profile.status !== 'approved' && (
        <div
          className={`rounded-lg p-4 text-sm ${
            profile.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {profile.status === 'rejected' ? t('statusRejected') : t('statusPending')}
        </div>
      )}

      <EditProfileForm />
      <PortfolioManager />
      <StripeConnectCard />
      <AvailabilityManager />
      <BlockedDatesManager />
      <IncomingBookings />
    </div>
  );
}

function PortfolioManager() {
  const t = useTranslations('expert');
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const profileId = user?.expert_profile?.id;

  const [form, setForm] = useState({title: '', description: '', url: ''});
  const [showForm, setShowForm] = useState(false);

  const {data: items} = useQuery({
    queryKey: ['portfolio', profileId],
    queryFn: async () => {
      const {data} = await api.get<import('@/lib/api').PortfolioItem[]>(`/experts/${profileId}/portfolio`);
      return data;
    },
    enabled: !!profileId,
  });

  const addItem = useMutation({
    mutationFn: async () => {
      await api.post('/expert/portfolio', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['portfolio', profileId]});
      setForm({title: '', description: '', url: ''});
      setShowForm(false);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/expert/portfolio/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['portfolio', profileId]}),
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t('portfolioTitle')}</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
        >
          + {t('portfolioAdd')}
        </button>
      </div>

      {showForm && (
        <form
          className="mt-4 space-y-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            addItem.mutate();
          }}
        >
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder={t('portfolioTitlePlaceholder')}
            value={form.title}
            onChange={(e) => setForm((f) => ({...f, title: e.target.value}))}
            required
          />
          <textarea
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            rows={3}
            placeholder={t('portfolioDescriptionPlaceholder')}
            value={form.description}
            onChange={(e) => setForm((f) => ({...f, description: e.target.value}))}
          />
          <input
            type="url"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder={t('portfolioUrlPlaceholder')}
            value={form.url}
            onChange={(e) => setForm((f) => ({...f, url: e.target.value}))}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={addItem.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {t('portfolioSave')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              {t('portfolioCancel')}
            </button>
          </div>
        </form>
      )}

      {items && items.length === 0 && !showForm && (
        <p className="mt-4 text-sm text-neutral-500">{t('portfolioEmpty')}</p>
      )}

      <div className="mt-4 space-y-3">
        {items?.map((item) => (
          <div key={item.id} className="flex items-start justify-between rounded-lg border border-neutral-100 p-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.title}</p>
              {item.description && <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{item.description}</p>}
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-indigo-600 hover:underline truncate">
                  {item.url}
                </a>
              )}
            </div>
            <button
              onClick={() => deleteItem.mutate(item.id)}
              className="ml-3 text-xs text-red-500 hover:text-red-700 shrink-0"
            >
              {t('delete')}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function StripeConnectCard() {
  const t = useTranslations('expert');

  const {data: status} = useQuery({
    queryKey: ['stripe-status'],
    queryFn: async () => {
      const {data} = await api.get<{onboarded: boolean}>('/stripe/connect/status');
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post<{url: string}>('/stripe/connect/onboard');
      return data;
    },
    onSuccess: ({url}) => {
      window.location.href = url;
    },
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="font-semibold">{t('stripeTitle')}</h2>

      {status === undefined ? (
        <p className="mt-2 text-sm text-neutral-500">{t('stripeChecking')}</p>
      ) : status.onboarded ? (
        <p className="mt-2 text-sm text-emerald-600">{t('stripeConnected')}</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-neutral-500">{t('stripeNotConnected')}</p>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="mt-4 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {t('stripeConnect')}
          </button>
        </>
      )}
    </section>
  );
}

function BlockedDatesManager() {
  const t = useTranslations('expert');
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const profileId = user?.expert_profile?.id;

  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const {data: blocked} = useQuery({
    queryKey: ['blocked-dates', profileId],
    queryFn: async () => {
      const {data} = await api.get<import('@/lib/api').BlockedDate[]>(`/experts/${profileId}/blocked-dates`);
      return data;
    },
    enabled: !!profileId,
  });

  const add = useMutation({
    mutationFn: async () => api.post('/expert/blocked-dates', {blocked_date: date, reason: reason || null}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['blocked-dates', profileId]});
      setDate('');
      setReason('');
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/expert/blocked-dates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['blocked-dates', profileId]}),
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="font-semibold">{t('blockedDatesTitle')}</h2>
      <p className="mt-1 text-sm text-neutral-500">{t('blockedDatesHint')}</p>

      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(e) => { e.preventDefault(); add.mutate(); }}
      >
        <input
          type="date"
          required
          min={new Date().toISOString().split('T')[0]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('blockedReasonPlaceholder')}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={add.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('blockedAdd')}
        </button>
      </form>

      {blocked && blocked.length === 0 && (
        <p className="mt-4 text-sm text-neutral-500">{t('blockedEmpty')}</p>
      )}

      <div className="mt-4 space-y-2">
        {blocked?.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
            <div>
              <p className="text-sm font-medium">{new Date(b.blocked_date + 'T12:00:00').toLocaleDateString()}</p>
              {b.reason && <p className="text-xs text-neutral-500">{b.reason}</p>}
            </div>
            <button
              onClick={() => remove.mutate(b.id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              {t('delete')}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function AvailabilityManager() {
  const t = useTranslations('expert');
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const expertId = user!.expert_profile!.id;

  const [form, setForm] = useState({
    day_of_week: '1',
    specific_date: '',
    start_time: '09:00',
    end_time: '10:00',
    is_recurring: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const {data: slots} = useQuery({
    queryKey: ['availability-slots', expertId],
    queryFn: async () => {
      const {data} = await api.get<AvailabilitySlot[]>('/availability-slots', {
        params: {expert_id: expertId},
      });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post('/availability-slots', {
        ...form,
        day_of_week: form.is_recurring ? Number(form.day_of_week) : null,
        specific_date: form.is_recurring ? null : form.specific_date || null,
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['availability-slots', expertId]}),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/availability-slots/${id}`),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['availability-slots', expertId]}),
  });

  const days = t.raw('days') as string[];

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="font-semibold">{t('availabilityTitle')}</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.is_recurring}
            onChange={(e) => setForm((f) => ({...f, is_recurring: e.target.checked}))}
          />
          {t('recurring')}
        </label>

        {form.is_recurring ? (
          <div>
            <label className="mb-1 block text-xs text-neutral-500">{t('dayOfWeek')}</label>
            <select
              value={form.day_of_week}
              onChange={(e) => setForm((f) => ({...f, day_of_week: e.target.value}))}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            >
              {days.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs text-neutral-500">{t('specificDate')}</label>
            <input
              type="date"
              value={form.specific_date}
              onChange={(e) => setForm((f) => ({...f, specific_date: e.target.value}))}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('timezone')}</label>
          <input
            value={form.timezone}
            onChange={(e) => setForm((f) => ({...f, timezone: e.target.value}))}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('startTime')}</label>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm((f) => ({...f, start_time: e.target.value}))}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('endTime')}</label>
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm((f) => ({...f, end_time: e.target.value}))}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 sm:col-span-2"
        >
          {t('addSlot')}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {slots?.length === 0 && <p className="text-sm text-neutral-500">{t('noSlots')}</p>}

        {slots?.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-2 text-sm"
          >
            <span>
              {slot.is_recurring && slot.day_of_week !== null
                ? days[slot.day_of_week]
                : slot.specific_date}{' '}
              · {slot.start_time}–{slot.end_time} ({slot.timezone})
            </span>
            <button
              onClick={() => deleteMutation.mutate(slot.id)}
              className="text-red-600 hover:underline"
            >
              {t('delete')}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function IncomingBookings() {
  const t = useTranslations('expert');
  const tb = useTranslations('booking');
  const queryClient = useQueryClient();

  const {data} = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const {data} = await api.get<Paginated<Booking>>('/bookings');
      return data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => api.post(`/bookings/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['bookings']}),
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="font-semibold">{t('incomingBookings')}</h2>

      {data?.data.length === 0 && <p className="mt-2 text-sm text-neutral-500">{t('noBookings')}</p>}

      <div className="mt-4 space-y-2">
        {data?.data.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between rounded-lg border border-neutral-100 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{new Date(booking.slot_datetime_start).toLocaleString()}</p>
              <p className="text-xs text-neutral-500">{tb(`status.${booking.status}`)}</p>
            </div>

            {booking.status === 'confirmed' && (
              <button
                onClick={() => completeMutation.mutate(booking.id)}
                disabled={completeMutation.isPending}
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {t('markComplete')}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
