'use client';

import {use} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation} from '@tanstack/react-query';
import {api, type Booking} from '@/lib/api';
import {BookingChat} from '@/components/booking-chat';
import {ReviewForm} from '@/components/review-form';

export default function BookingDetailPage({params}: {params: Promise<{id: string}>}) {
  const {id} = use(params);
  const t = useTranslations('booking');

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
    mutationFn: async () => {
      const {data} = await api.post(`/bookings/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  function handleCancel() {
    if (window.confirm(t('cancelConfirm'))) {
      cancelMutation.mutate();
    }
  }

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
          onClick={handleCancel}
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
    </div>
  );
}
