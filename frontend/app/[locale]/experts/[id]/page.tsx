'use client';

import {use, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useRouter} from '@/i18n/navigation';
import {api, type ExpertProfile} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {ReviewList} from '@/components/review-list';
import {RegulatoryNotice, CredentialBadge} from '@/components/regulatory-notice';

export default function ExpertProfilePage({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const t = useTranslations('experts');
  const tb = useTranslations('booking');
  const router = useRouter();
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const [start, setStart] = useState('');
  const [error, setError] = useState<string | null>(null);

  const {data: expert} = useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      const {data} = await api.get<ExpertProfile>(`/experts/${id}`);
      return data;
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const startDate = new Date(start);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const {data} = await api.post('/bookings', {
        expert_id: Number(id),
        slot_datetime_start: startDate.toISOString().slice(0, 19).replace('T', ' '),
        slot_datetime_end: endDate.toISOString().slice(0, 19).replace('T', ' '),
      });

      return data as {id: number};
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({queryKey: ['bookings']});
      router.push(`/dashboard/bookings/${booking.id}`);
    },
    onError: (err: unknown) => {
      const message =
        (err as {response?: {data?: {message?: string}}})?.response?.data?.message ??
        'Une erreur est survenue.';
      setError(message);
    },
  });

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push('/login');
      return;
    }

    bookMutation.mutate();
  }

  if (!expert) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-600">
            {expert.user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{expert.user.name}</h1>
            <p className="text-sm text-neutral-500">{expert.category.name}</p>
            <p className="text-sm text-amber-500">
              ★ {expert.rating_avg.toFixed(1)} · {expert.total_sessions} sessions
            </p>
            <div className="mt-1">
              <CredentialBadge
                categorySlug={expert.category.slug}
                credentialReference={expert.credential_reference}
                status={expert.status ?? 'approved'}
              />
            </div>
          </div>
        </div>

        <p className="mt-6 whitespace-pre-line text-neutral-700">{expert.bio}</p>

        <RegulatoryNotice categorySlug={expert.category.slug} />

        <ReviewList expertId={expert.id} />
      </div>

      <aside className="rounded-xl border border-neutral-200 bg-white p-6">
        <p className="text-2xl font-semibold text-indigo-600">
          {expert.hourly_rate} {expert.currency}
          <span className="text-sm font-normal text-neutral-500"> {t('perHour')}</span>
        </p>

        <form onSubmit={handleBook} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">{tb('selectSlot')}</label>
            <input
              type="datetime-local"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={bookMutation.isPending}
            className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {t('bookSession')}
          </button>
        </form>
      </aside>
    </div>
  );
}
