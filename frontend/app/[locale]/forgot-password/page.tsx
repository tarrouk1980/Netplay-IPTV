'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {api} from '@/lib/api';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      await api.post('/forgot-password', {email});
      setStatus('sent');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">{t('forgotPasswordTitle')}</h1>
      <p className="mb-4 text-sm text-neutral-500">{t('forgotPasswordSubtitle')}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('email')}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {status === 'sent' && <p className="text-sm text-emerald-600">{t('forgotPasswordSent')}</p>}
        {status === 'error' && <p className="text-sm text-red-600">{t('error')}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('forgotPasswordSubmit')}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-500">
        <Link href="/login" className="text-indigo-600 hover:underline">
          {t('switchToLogin')}
        </Link>
      </p>
    </div>
  );
}
