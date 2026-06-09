'use client';

import {useTranslations} from 'next-intl';
import {useQuery} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api} from '@/lib/api';

type EarningsData = {
  currency: string;
  total: number;
  bookings: Array<{
    id: number;
    slot_datetime_start: string;
    price: number;
    commission_amount: number;
    expert_payout: number;
    coupon_code: string | null;
    discount_amount: number;
    client: {id: number; name: string; avatar_url: string | null};
  }>;
};

export default function EarningsPage() {
  const t = useTranslations('earnings');

  const {data, isLoading} = useQuery({
    queryKey: ['expert-earnings'],
    queryFn: async () => {
      const {data} = await api.get<EarningsData>('/expert/earnings');
      return data;
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/expert" className="text-sm text-neutral-500 hover:text-indigo-600">
          ← {t('back')}
        </Link>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      </div>

      {data && (
        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 p-6">
          <p className="text-sm text-indigo-600">{t('totalEarnings')}</p>
          <p className="text-3xl font-bold text-indigo-700">
            {data.total.toFixed(2)} <span className="text-lg font-normal">{data.currency}</span>
          </p>
          <p className="mt-1 text-xs text-indigo-400">{t('afterCommission')}</p>
        </div>
      )}

      {isLoading && <p className="text-neutral-500">{t('loading')}</p>}

      {data && data.bookings.length === 0 && (
        <p className="text-neutral-500">{t('noEarnings')}</p>
      )}

      <div className="space-y-3">
        {data?.bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{booking.client.name}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(booking.slot_datetime_start).toLocaleString()}
                </p>
                {booking.coupon_code && (
                  <p className="mt-1 text-xs text-indigo-500">
                    🏷 {booking.coupon_code} (-{booking.discount_amount} {data.currency})
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-indigo-600">
                  +{booking.expert_payout.toFixed(2)} {data.currency}
                </p>
                <p className="text-xs text-neutral-400">
                  {t('brut')}: {booking.price.toFixed(2)} — {t('commission')}: {booking.commission_amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
