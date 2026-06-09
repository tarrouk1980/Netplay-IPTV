'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api} from '@/lib/api';

type ReferralData = {
  referral_code: string;
  referral_url: string;
  referred_users: Array<{id: number; name: string; created_at: string}>;
  total_referrals: number;
};

export default function ReferralsPage() {
  const t = useTranslations('referrals');
  const [copied, setCopied] = useState(false);

  const {data} = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const {data} = await api.get<ReferralData>('/me/referrals');
      return data;
    },
  });

  async function copyLink() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referral_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-indigo-600">
          ← {t('back')}
        </Link>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6">
        <p className="text-sm text-indigo-600">{t('yourCode')}</p>
        <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-indigo-700">
          {data?.referral_code ?? '—'}
        </p>
        <p className="mt-2 text-xs text-indigo-400">{t('share')}</p>
        <div className="mt-4 flex gap-2">
          <input
            readOnly
            value={data?.referral_url ?? ''}
            className="flex-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-neutral-700"
          />
          <button
            onClick={copyLink}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {copied ? t('copied') : t('copy')}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold">{t('referredUsers')}</h2>
          <span className="text-sm text-neutral-500">{data?.total_referrals ?? 0}</span>
        </div>
        {data && data.referred_users.length === 0 && (
          <p className="mt-3 text-sm text-neutral-500">{t('noReferrals')}</p>
        )}
        <div className="mt-3 space-y-2">
          {data?.referred_users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm">
              <span className="font-medium">{u.name}</span>
              <span className="text-xs text-neutral-400">{new Date(u.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
