'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, useRouter} from '@/i18n/navigation';
import {useAuth} from '@/lib/auth-context';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const logged = await login(email, password);
      router.push(
        logged.role === 'admin' ? '/dashboard/admin' : logged.role === 'expert' ? '/dashboard/expert' : '/dashboard'
      );
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">{t('loginTitle')}</h1>

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

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('password')}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('loginButton')}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-500">
        <Link href="/register" className="text-indigo-600 hover:underline">
          {t('switchToRegister')}
        </Link>
      </p>
    </div>
  );
}
