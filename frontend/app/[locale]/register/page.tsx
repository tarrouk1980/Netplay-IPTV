'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, useRouter} from '@/i18n/navigation';
import {useAuth} from '@/lib/auth-context';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const {register} = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'client',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({...f, [field]: e.target.value}));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const registered = await register(form);
      router.push(
        registered.role === 'admin'
          ? '/dashboard/admin'
          : registered.role === 'expert'
            ? '/dashboard/expert'
            : '/dashboard'
      );
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">{t('registerTitle')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('name')}</label>
          <input
            required
            value={form.name}
            onChange={update('name')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('email')}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('password')}</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={update('password')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('passwordConfirmation')}</label>
          <input
            type="password"
            required
            value={form.password_confirmation}
            onChange={update('password_confirmation')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('role')}</label>
          <select
            value={form.role}
            onChange={update('role')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="client">{t('roleClient')}</option>
            <option value="expert">{t('roleExpert')}</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('registerButton')}
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
