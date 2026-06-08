'use client';

import {use, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation} from '@tanstack/react-query';
import {api, type Booking} from '@/lib/api';
import {BookingChat} from '@/components/booking-chat';
import {ReviewForm} from '@/components/review-form';
import {RescheduleModal} from '@/components/reschedule-modal';

export default function BookingDetailPage({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const t = useTranslations('booking');
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const {data: booking, refetch} = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const {data} = await api.get<Booking>(`/bookings/${id}`);
      return data;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post<{checkout_url: string}>(`/bookings/${id}/checkout`);
      return data;
    },
    onSuccess: ({checkout_url}) => {
      window.location.href = checkout_url;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (reason: string) => {
      const {data} = await api.post(`/bookings/${id}/cancel`, {cancellation_reason: reason || null});
      return data;
    },
    onSuccess: () => {
      setShowCancelModal(false);
      setCancelReason('');
      refetch();
    },
  });

  if (!booking) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg">
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{booking.expert?.user.name}</h1>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
          {t(`status.${booking.status}`)}
        </span>
      </div>

      <p className="text-sm text-neutral-500">
        {new Date(booking.slot_datetime_start).toLocaleString()} —{' '}
        {new Date(booking.slot_datetime_end).toLocaleTimeString()}
      </p>

      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500">{t('price')}</dt>
          <dd className="font-medium">{booking.price}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">{t('commission')}</dt>
          <dd>{booking.commission_amount}</dd>
        </div>
      </dl>

      {(booking.status === 'pending' || booking.status === 'confirmed') && (
        <button
          onClick={async () => {
            const res = await api.get(`/bookings/${id}/ics`, {responseType: 'blob'});
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `booking-${id}.ics`;
            a.click();
            window.URL.revokeObjectURL(url);
          }}
          className="mt-3 w-full rounded-full border border-neutral-300 px-6 py-2 text-sm font-medium text-neutral-700 hover:border-indigo-300"
        >
          {t('addToCalendar')}
        </button>
      )}

      {booking.status === 'pending' && (
        <button
          onClick={() => checkoutMutation.mutate()}
          disabled={checkoutMutation.isPending}
          className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('payNow')}
        </button>
      )}

      {(booking.status === 'pending' || booking.status === 'confirmed') && (
        <button
          onClick={() => setShowReschedule(true)}
          className="mt-3 w-full rounded-full border border-neutral-300 px-6 py-2 text-sm font-medium text-neutral-700 hover:border-indigo-300"
        >
          {t('reschedule')}
        </button>
      )}

      {booking.status === 'cancelled' && booking.cancellation_reason && (
        <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
          <span className="font-medium">{t('cancelReasonLabel')}:</span> {booking.cancellation_reason}
        </p>
      )}

      {(booking.status === 'pending' || booking.status === 'confirmed') && (
        <button
          onClick={() => setShowCancelModal(true)}
          disabled={cancelMutation.isPending}
          className="mt-3 w-full rounded-full border border-red-300 px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {t('cancel')}
        </button>
      )}

      <button
        onClick={() => refetch()}
        className="mt-3 w-full rounded-full border border-neutral-300 px-6 py-2 text-sm text-neutral-600 hover:border-neutral-400"
      >
        ↻
      </button>
    </div>

    {(booking.status === 'confirmed' || booking.status === 'completed') && (
      <BookingChat bookingId={id} />
    )}

    {booking.status === 'completed' && <ReviewForm bookingId={id} />}

    {showCancelModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="font-semibold">{t('cancelTitle')}</h2>
          <p className="mt-1 text-sm text-neutral-500">{t('cancelReasonHint')}</p>
          <div className="mt-4 space-y-2">
            {(t.raw('cancelReasons') as string[]).map((reason) => (
              <label key={reason} className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 hover:bg-neutral-50">
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={cancelReason === reason}
                  onChange={() => setCancelReason(reason)}
                  className="accent-indigo-600"
                />
                <span className="text-sm">{reason}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => cancelMutation.mutate(cancelReason)}
              disabled={cancelMutation.isPending}
              className="flex-1 rounded-full bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {t('cancelConfirmBtn')}
            </button>
            <button
              onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
              className="flex-1 rounded-full border border-neutral-300 py-2 text-sm hover:bg-neutral-50"
            >
              {t('cancelAbort')}
            </button>
          </div>
        </div>
      </div>
    )}

    {showReschedule && booking.expert && (
      <RescheduleModal
        bookingId={id}
        expertId={booking.expert.id}
        durationMs={
          new Date(booking.slot_datetime_end).getTime() - new Date(booking.slot_datetime_start).getTime()
        }
        onClose={() => setShowReschedule(false)}
        onSuccess={() => refetch()}
      />
    )}
    </div>
  );
}
