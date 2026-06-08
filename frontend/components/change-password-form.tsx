'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useMutation} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {api} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';

export function ChangePasswordForm() {
  const t = useTranslations('auth');
  const {user} = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/change-password', {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
    },
    onError: (err: unknown) => {
      setSuccess(false);
      if (err instanceof AxiosError && err.response?.data?.message === 'current_password_incorrect') {
        setError(t('currentPasswordIncorrect'));
      } else {
        setError(t('error'));
      }
    },
  });

  if (!user) return null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold">{t('changePasswordTitle')}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSuccess(false);
          setError(null);
          mutation.mutate();
        }}
        className="space-y-3"
      >
        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('currentPassword')}</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
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
        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('passwordConfirmation')}</label>
          <input
            type="password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {success && <p className="text-sm text-emerald-600">{t('changePasswordSuccess')}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('changePasswordSubmit')}
        </button>
      </form>
    </div>
  );
}
