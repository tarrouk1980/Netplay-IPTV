'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api} from '@/lib/api';

type GiftCode = {
  id: number;
  code: string;
  amount: number;
  currency: string;
  recipient_email: string;
  recipient_name: string;
  message: string | null;
  redeemed: boolean;
  expires_at: string;
  created_at: string;
};

export default function GiftsPage() {
  const t = useTranslations('gifts');
  const qc = useQueryClient();
  const [tab, setTab] = useState<'create' | 'redeem' | 'mine'>('create');
  const [form, setForm] = useState({amount: '', recipient_email: '', recipient_name: '', message: ''});
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemResult, setRedeemResult] = useState<string | null>(null);
  const [created, setCreated] = useState<GiftCode | null>(null);
  const [copied, setCopied] = useState(false);

  const {data: gifts} = useQuery({
    queryKey: ['gift-codes'],
    queryFn: async () => {
      const {data} = await api.get<GiftCode[]>('/gift-codes');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post<GiftCode>('/gift-codes', {...form, amount: Number(form.amount)});
      return data;
    },
    onSuccess: (data) => {
      setCreated(data);
      setForm({amount: '', recipient_email: '', recipient_name: '', message: ''});
      qc.invalidateQueries({queryKey: ['gift-codes']});
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.post('/gift-codes/redeem', {code: redeemCode});
      return data;
    },
    onSuccess: (data) => {
      setRedeemResult(data.message);
      setRedeemCode('');
    },
    onError: (err: unknown) => {
      setRedeemResult((err as {response?: {data?: {message?: string}}})?.response?.data?.message ?? t('redeemError'));
    },
  });

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-indigo-600">← {t('back')}</Link>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
        {(['create', 'redeem', 'mine'] as const).map((tab_) => (
          <button
            key={tab_}
            onClick={() => setTab(tab_)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${tab === tab_ ? 'bg-white shadow text-indigo-600' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            {t(`tab_${tab_}`)}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <form className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6" onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}>
          <input required type="number" min="10" value={form.amount} onChange={(e) => setForm((f) => ({...f, amount: e.target.value}))} placeholder={t('amount') + ' (EUR)'} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" />
          <input required type="email" value={form.recipient_email} onChange={(e) => setForm((f) => ({...f, recipient_email: e.target.value}))} placeholder={t('recipientEmail')} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" />
          <input required value={form.recipient_name} onChange={(e) => setForm((f) => ({...f, recipient_name: e.target.value}))} placeholder={t('recipientName')} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" />
          <textarea value={form.message} onChange={(e) => setForm((f) => ({...f, message: e.target.value}))} placeholder={t('giftMessage')} rows={3} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" />
          <button type="submit" disabled={createMutation.isPending} className="w-full rounded-full bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {t('createGift')}
          </button>
          {created && (
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-700">{t('giftCreated')}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm font-bold tracking-widest">{created.code}</span>
                <button type="button" onClick={async () => { await navigator.clipboard.writeText(created.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="rounded bg-indigo-600 px-3 py-2 text-xs text-white hover:bg-indigo-700">
                  {copied ? '✓' : t('copy')}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {tab === 'redeem' && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <input value={redeemCode} onChange={(e) => setRedeemCode(e.target.value.toUpperCase())} placeholder={t('enterCode')} className="w-full rounded border border-neutral-300 px-3 py-2 text-sm uppercase tracking-widest" />
          <button onClick={() => redeemMutation.mutate()} disabled={redeemMutation.isPending || !redeemCode.trim()} className="mt-3 w-full rounded-full bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {t('redeem')}
          </button>
          {redeemResult && <p className="mt-3 text-sm text-indigo-600">{redeemResult}</p>}
        </div>
      )}

      {tab === 'mine' && (
        <div className="space-y-3">
          {gifts?.length === 0 && <p className="text-sm text-neutral-500">{t('noGifts')}</p>}
          {gifts?.map((g) => (
            <div key={g.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-mono font-bold text-indigo-600">{g.code}</p>
                  <p className="text-xs text-neutral-500">{g.recipient_name} · {g.recipient_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{g.amount} {g.currency}</p>
                  <span className={`text-xs ${g.redeemed ? 'text-green-600' : 'text-amber-600'}`}>
                    {g.redeemed ? t('redeemed') : t('notRedeemed')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
