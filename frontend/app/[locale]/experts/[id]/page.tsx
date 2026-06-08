'use client';

import {use, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useRouter} from '@/i18n/navigation';
import {api, type ExpertProfile, type AvailabilitySlot} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {ReviewList} from '@/components/review-list';
import {RegulatoryNotice, CredentialBadge} from '@/components/regulatory-notice';
import {Avatar} from '@/components/avatar';
import {FavoriteButton, useFavoriteIds} from '@/components/favorite-button';
import {OnlineBadge} from '@/components/online-badge';

function nextSlotOccurrences(slot: AvailabilitySlot, count: number): Date[] {
  const [hours, minutes] = slot.start_time.split(':').map(Number);
  const occurrences: Date[] = [];
  const now = new Date();

  if (slot.specific_date) {
    const d = new Date(`${slot.specific_date}T00:00:00`);
    d.setHours(hours, minutes, 0, 0);
    if (d > now) occurrences.push(d);
    return occurrences;
  }

  if (slot.day_of_week === null || !slot.is_recurring) {
    return occurrences;
  }

  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  while (d.getDay() !== slot.day_of_week || d <= now) {
    d.setDate(d.getDate() + 1);
  }
  for (let i = 0; i < count; i++) {
    occurrences.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return occurrences;
}

export default function ExpertProfilePage({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const t = useTranslations('experts');
  const tb = useTranslations('booking');
  const router = useRouter();
  const {user} = useAuth();
  const favoriteIds = useFavoriteIds();
  const queryClient = useQueryClient();
  const [start, setStart] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {data: expert} = useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      const {data} = await api.get<ExpertProfile>(`/experts/${id}`);
      return data;
    },
  });

  const {data: slots} = useQuery({
    queryKey: ['availability-slots', id],
    queryFn: async () => {
      const {data} = await api.get<AvailabilitySlot[]>('/availability-slots', {
        params: {expert_id: id},
      });
      return data;
    },
  });

  const upcomingSlots = (slots ?? [])
    .flatMap((slot) => nextSlotOccurrences(slot, 3))
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, 8);

  const bookMutation = useMutation({
    mutationFn: async () => {
      const startDate = selectedSlot ?? new Date(start);
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

    if (!selectedSlot && !start) {
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
          <Avatar name={expert.user.name} url={expert.user.avatar_url} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{expert.user.name}</h1>
              <FavoriteButton expertId={expert.id} isFavorited={favoriteIds.has(expert.id)} />
            </div>
            <p className="text-sm text-neutral-500">{expert.category.name}</p>
            <OnlineBadge lastSeenAt={expert.last_seen_at} />
            <p className="text-sm text-amber-500">
              ★ {expert.rating_avg.toFixed(1)} · {expert.total_sessions} sessions
            </p>
            {!!expert.years_experience && (
              <p className="text-sm text-neutral-500">
                {t('yearsExperience', {count: expert.years_experience})}
              </p>
            )}
            {!!expert.languages?.length && (
              <div className="mt-1 flex flex-wrap gap-1">
                {expert.languages.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                  >
                    {t(`language${lang.charAt(0).toUpperCase()}${lang.slice(1)}`)}
                  </span>
                ))}
              </div>
            )}
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

        {!!expert.portfolio_items?.length && (
          <section>
            <h2 className="mb-3 font-semibold">{t('portfolioTitle')}</h2>
            <div className="space-y-3">
              {expert.portfolio_items.map((item) => (
                <div key={item.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                  <p className="font-medium">{item.title}</p>
                  {item.description && <p className="mt-1 text-sm text-neutral-600">{item.description}</p>}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                      {t('portfolioView')} →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

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
            {upcomingSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {upcomingSlots.map((occurrence) => (
                  <button
                    key={occurrence.toISOString()}
                    type="button"
                    onClick={() => setSelectedSlot(occurrence)}
                    className={`rounded border px-3 py-2 text-left text-xs ${
                      selectedSlot?.getTime() === occurrence.getTime()
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-neutral-300 text-neutral-700 hover:border-indigo-300'
                    }`}
                  >
                    <span className="block font-medium">
                      {occurrence.toLocaleDateString(undefined, {weekday: 'short', day: 'numeric', month: 'short'})}
                    </span>
                    <span className="block text-neutral-500">
                      {occurrence.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="datetime-local"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
              />
            )}
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
