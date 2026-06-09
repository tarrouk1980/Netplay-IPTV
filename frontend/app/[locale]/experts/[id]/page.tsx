'use client';

import {use, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useRouter, Link} from '@/i18n/navigation';
import {api, type ExpertProfile, type AvailabilitySlot} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {ReviewList} from '@/components/review-list';
import {RegulatoryNotice, CredentialBadge} from '@/components/regulatory-notice';
import {Avatar} from '@/components/avatar';
import {FavoriteButton, useFavoriteIds} from '@/components/favorite-button';
import {OnlineBadge} from '@/components/online-badge';
import {trackRecentExpert} from '@/components/recently-viewed';

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

  if (slot.day_of_week === null || !slot.is_recurring) return occurrences;

  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  while (d.getDay() !== slot.day_of_week || d <= now) d.setDate(d.getDate() + 1);
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
  const [durationHours, setDurationHours] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<{code: string; type: string; value: number} | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  const {data: expert} = useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      const {data} = await api.get<ExpertProfile>(`/experts/${id}`);
      trackRecentExpert({id: data.id, name: data.user.name, category: data.category.name, avatar_url: data.user.avatar_url});
      return data;
    },
  });

  const {data: slots} = useQuery({
    queryKey: ['availability-slots', id],
    queryFn: async () => {
      const {data} = await api.get<AvailabilitySlot[]>('/availability-slots', {params: {expert_id: id}});
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
      const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
      const {data} = await api.post('/bookings', {
        expert_id: Number(id),
        slot_datetime_start: startDate.toISOString().slice(0, 19).replace('T', ' '),
        slot_datetime_end: endDate.toISOString().slice(0, 19).replace('T', ' '),
        coupon_code: coupon?.code ?? undefined,
      });
      return data as {id: number};
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({queryKey: ['bookings']});
      router.push(`/dashboard/bookings/${booking.id}`);
    },
    onError: (err: unknown) => {
      const message = (err as {response?: {data?: {message?: string}}})?.response?.data?.message ?? 'Une erreur est survenue.';
      setError(message);
    },
  });

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) { router.push('/login'); return; }
    if (!selectedSlot && !start) return;
    bookMutation.mutate();
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl px-4">
          <div className="h-48 bg-neutral-200 rounded-2xl" />
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  const totalPrice = expert.hourly_rate * durationHours;
  const discountedPrice = coupon
    ? coupon.type === 'percent'
      ? totalPrice * (1 - coupon.value / 100)
      : totalPrice - coupon.value
    : totalPrice;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar name={expert.user.name} url={expert.user.avatar_url} size="lg" />
            {expert.status === 'approved' && (
              <span className="absolute bottom-1 right-1 bg-cyan-500 rounded-full p-1.5 shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-extrabold">{expert.user.name}</h1>
              <FavoriteButton expertId={expert.id} isFavorited={favoriteIds.has(expert.id)} />
              <button
                onClick={async () => { const url = window.location.href; if (navigator.share) { await navigator.share({title: expert.user.name, url}); } else { await navigator.clipboard.writeText(url); } }}
                className="rounded-full border border-white/30 p-1.5 text-white/70 hover:text-white hover:border-white/60 transition"
                title={t('shareProfile')}
              >↗</button>
              {user && user.role === 'client' && (
                <button onClick={() => setShowReportModal(true)} className="rounded-full border border-white/30 p-1.5 text-white/70 hover:text-red-400 transition" title={t('reportExpert')}>⚑</button>
              )}
            </div>
            {expert.headline && <p className="mt-1 text-indigo-200 text-lg">{expert.headline}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="bg-white/10 text-white px-3 py-1 rounded-full font-medium">{expert.category.name}</span>
              <OnlineBadge lastSeenAt={expert.last_seen_at} />
              <span className="text-amber-300">★ {Number(expert.rating_avg ?? 0).toFixed(1)} · {expert.total_sessions} sessions</span>
              {(expert as any).view_count > 0 && <span className="text-indigo-300">· {(expert as any).view_count} {t('views')}</span>}
            </div>
            {!!expert.years_experience && <p className="mt-1 text-sm text-indigo-300">{t('yearsExperience', {count: expert.years_experience})}</p>}
            {!!expert.languages?.length && (
              <div className="mt-1 flex flex-wrap gap-1">
                {expert.languages.map((lang) => (<span key={lang} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-indigo-200">{t(`language${lang.charAt(0).toUpperCase()}${lang.slice(1)}`)}</span>))}
              </div>
            )}
            <div className="mt-2">
              <CredentialBadge categorySlug={expert.category.slug} credentialReference={expert.credential_reference} status={expert.status ?? 'approved'} />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-5 text-white text-center">
            <div><p className="text-2xl font-extrabold">{expert.total_sessions}</p><p className="text-xs text-indigo-300 mt-0.5">Sessions</p></div>
            <div className="w-px bg-white/20 self-stretch" />
            <div><p className="text-2xl font-extrabold">{Number(expert.rating_avg ?? 0).toFixed(1)}</p><p className="text-xs text-indigo-300 mt-0.5">Note</p></div>
            <div className="w-px bg-white/20 self-stretch" />
            <div><p className="text-2xl font-extrabold">{expert.hourly_rate}</p><p className="text-xs text-indigo-300 mt-0.5">{expert.currency}/h</p></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-indigo-950 mb-4">À propos</h2>
              <p className="whitespace-pre-line text-neutral-700 leading-relaxed">{expert.bio}</p>

              {!!expert.specializations?.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {expert.specializations.map((s) => (
                    <span key={s} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700">{s}</span>
                  ))}
                </div>
              )}

              {(expert.website_url || expert.linkedin_url) && (
                <div className="mt-4 flex gap-3">
                  {expert.website_url && <a href={expert.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">🌐 {t('website')}</a>}
                  {expert.linkedin_url && <a href={expert.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">🔗 LinkedIn</a>}
                </div>
              )}
            </div>

            <RegulatoryNotice categorySlug={expert.category.slug} />

            {/* Portfolio */}
            {!!expert.portfolio_items?.length && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-indigo-950 mb-4">{t('portfolioTitle')}</h2>
                <div className="space-y-3">
                  {expert.portfolio_items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-neutral-100 bg-slate-50 p-4">
                      <p className="font-medium text-neutral-900">{item.title}</p>
                      {item.description && <p className="mt-1 text-sm text-neutral-600">{item.description}</p>}
                      {item.url && (<a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">{t('portfolioView')} →</a>)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-indigo-950 mb-4">Avis clients</h2>
              <ReviewList expertId={expert.id} />
            </div>

            <SimilarExperts expertId={expert.id} />
          </div>

          {/* Booking widget */}
          <aside>
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
              <div className="bg-indigo-50 px-6 py-5 border-b border-indigo-100">
                <p className="text-3xl font-extrabold text-indigo-600">
                  {expert.hourly_rate} {expert.currency}
                  <span className="text-base font-normal text-neutral-500 ml-1">/h</span>
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                  <span className="text-amber-400">★</span>
                  <span>{Number(expert.rating_avg ?? 0).toFixed(1)}</span>
                  <span>· {expert.total_sessions} sessions</span>
                </div>
              </div>

              <form onSubmit={handleBook} className="p-6 space-y-4">
                {/* Slot selection */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">{tb('selectSlot')}</label>
                  {upcomingSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {upcomingSlots.map((occurrence) => (
                        <button key={occurrence.toISOString()} type="button" onClick={() => setSelectedSlot(occurrence)}
                          className={`rounded-xl border px-3 py-2 text-left text-xs transition-all ${selectedSlot?.getTime() === occurrence.getTime() ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium' : 'border-neutral-200 text-neutral-700 hover:border-indigo-300'}`}
                        >
                          <span className="block font-medium">{occurrence.toLocaleDateString(undefined, {weekday: 'short', day: 'numeric', month: 'short'})}</span>
                          <span className="block text-neutral-500">{occurrence.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">{tb('duration')}</label>
                  <select value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
                  >
                    <option value={0.5}>30 min — {(expert.hourly_rate * 0.5).toFixed(0)} {expert.currency}</option>
                    <option value={1}>1h — {expert.hourly_rate} {expert.currency}</option>
                    <option value={1.5}>1h30 — {(expert.hourly_rate * 1.5).toFixed(0)} {expert.currency}</option>
                    <option value={2}>2h — {(expert.hourly_rate * 2).toFixed(0)} {expert.currency}</option>
                  </select>
                </div>

                {/* Coupon */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">{t('couponCode')}</label>
                  <div className="flex gap-2">
                    <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder={t('couponPlaceholder')}
                      className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm uppercase focus:border-indigo-400 focus:outline-none" />
                    <button type="button"
                      onClick={async () => { setCouponError(null); try { const {data} = await api.post('/coupons/validate', {code: couponInput}); setCoupon(data); } catch { setCoupon(null); setCouponError(t('couponInvalid')); } }}
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:border-indigo-400 transition"
                    >{t('couponApply')}</button>
                  </div>
                  {coupon && <p className="mt-1 text-xs text-emerald-600">{t('couponApplied')}: -{coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} ${expert.currency}`}</p>}
                  {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
                </div>

                {/* Price summary */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>{durationHours}h × {expert.hourly_rate} {expert.currency}</span>
                    <span>{totalPrice.toFixed(0)} {expert.currency}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Réduction</span>
                      <span>-{(totalPrice - discountedPrice).toFixed(0)} {expert.currency}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-neutral-900">
                    <span>Total</span>
                    <span className="text-indigo-600">{discountedPrice.toFixed(0)} {expert.currency}</span>
                  </div>
                </div>

                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>}

                <button type="submit" disabled={bookMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-3.5 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {bookMutation.isPending ? '...' : t('bookSession')}
                </button>
              </form>

              {user && (
                <div className="px-6 pb-6 space-y-2">
                  <Link href={`/dashboard/messages?partnerId=${expert.user.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-700 hover:border-indigo-300 hover:text-indigo-600 transition"
                  >💬 {t('contactExpert')}</Link>
                  {!waitlisted ? (
                    <button type="button" onClick={async () => { await api.post(`/experts/${expert.id}/waitlist`); setWaitlisted(true); }}
                      className="w-full text-center text-xs text-neutral-400 hover:text-indigo-600 hover:underline py-1"
                    >{t('joinWaitlist')}</button>
                  ) : (
                    <p className="text-center text-xs text-emerald-600 py-1">{t('waitlistJoined')}</p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Report modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-semibold text-indigo-950">{t('reportExpert')}</h2>
            {reportSuccess ? (
              <>
                <p className="mt-3 text-sm text-emerald-600">{t('reportSent')}</p>
                <button onClick={() => setShowReportModal(false)} className="mt-4 w-full rounded-full border border-neutral-200 py-2 text-sm hover:bg-neutral-50">Fermer</button>
              </>
            ) : (
              <form className="mt-4 space-y-3" onSubmit={async (e) => { e.preventDefault(); try { await api.post(`/experts/${expert.id}/report`, {reason: reportReason, details: reportDetails}); setReportSuccess(true); } catch {/* ignore */} }}>
                <select required value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none">
                  <option value="">{t('reportReasonSelect')}</option>
                  {(t.raw('reportReasons') as string[]).map((r) => (<option key={r} value={r}>{r}</option>))}
                </select>
                <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder={t('reportDetails')} rows={3} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">{t('reportSubmit')}</button>
                  <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm hover:bg-neutral-50">{t('reportCancel')}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SimilarExperts({expertId}: {expertId: number}) {
  const t = useTranslations('experts');
  const {data} = useQuery({
    queryKey: ['similar', expertId],
    queryFn: async () => {
      const {data} = await api.get<import('@/lib/api').ExpertProfile[]>(`/experts/${expertId}/similar`);
      return data;
    },
  });

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-indigo-950 mb-4">{t('similarExperts')}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {data.map((expert) => (
          <Link key={expert.id} href={`/experts/${expert.id}`}
            className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-slate-50 p-4 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <Avatar name={expert.user.name} url={expert.user.avatar_url} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-indigo-950">{expert.user.name}</p>
              <p className="truncate text-xs text-neutral-500">{expert.category.name}</p>
              <p className="text-xs text-indigo-600 font-medium">{expert.hourly_rate} {expert.currency}/h</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
