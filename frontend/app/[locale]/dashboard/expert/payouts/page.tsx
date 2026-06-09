'use client';

import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api} from '@/lib/api';

type Payout = {
  id: number;
  amount: number;
  period_start: string;
  period_end: string;
  status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
};

type PayoutData = {
  payouts: Payout[];
  pending_earnings: number;
  currency: string;
};

export default function PayoutsPage() {
  const t = useTranslations('payouts');
  const qc = useQueryClient();

  const {data} = useQuery({
    queryKey: ['expert-payouts'],
    queryFn: async () => {
      const {data} = await api.get<PayoutData>('/expert/payouts');
      return data;
    },
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post<Payout>('/expert/payouts/request');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({queryKey: ['expert-payouts']}),
  });

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/expert" className="text-sm text-neutral-500 hover:text-indigo-600">
          ← {t('back')}
        </Link>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      </div>

      {data && (
        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 p-6">
          <p className="text-sm text-indigo-600">{t('pendingEarnings')}</p>
          <p className="text-3xl font-bold text-indigo-700">
            {data.pending_earnings.toFixed(2)} <span className="text-lg font-normal">{data.currency}</span>
          </p>
          <button
            onClick={() => requestMutation.mutate()}
            disabled={requestMutation.isPending || data.pending_earnings <= 0}
            className="mt-4 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {requestMutation.isPending ? t('requesting') : t('requestPayout')}
          </button>
          {requestMutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              {(requestMutation.error as {response?: {data?: {message?: string}}})?.response?.data?.message ?? t('error')}
            </p>
          )}
          {requestMutation.isSuccess && (
            <p className="mt-2 text-sm text-green-600">{t('requestSent')}</p>
          )}
        </div>
      )}

      <h2 className="mb-3 font-semibold">{t('history')}</h2>
      {data?.payouts.length === 0 && (
        <p className="text-sm text-neutral-500">{t('noPayouts')}</p>
      )}
      <div className="space-y-3">
        {data?.payouts.map((payout) => (
          <div key={payout.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
            <div>
              <p className="font-medium">
                {payout.amount.toFixed(2)} {data.currency}
              </p>
              <p className="text-xs text-neutral-500">
                {new Date(payout.period_start).toLocaleDateString()} – {new Date(payout.period_end).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                payout.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {t(`status.${payout.status}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
