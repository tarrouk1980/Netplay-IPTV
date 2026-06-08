'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {api} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';

export function ClientProfileForm() {
  const t = useTranslations('profile');
  const {user, refreshUser} = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: (user as any)?.phone ?? '',
  });
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = {name: form.name};
      if (form.phone) payload.phone = form.phone;
      await api.patch('/me', payload);
    },
    onSuccess: () => {
      setSuccess(true);
      refreshUser();
      queryClient.invalidateQueries({queryKey: ['me']});
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="font-semibold">{t('title')}</h2>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div>
          <label className="mb-1 block text-sm font-medium">{t('name')}</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({...f, name: e.target.value}))}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('phone')}</label>
          <input
            type="tel"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={form.phone}
            onChange={(e) => setForm((f) => ({...f, phone: e.target.value}))}
            placeholder={t('phonePlaceholder')}
          />
        </div>
        {success && <p className="text-sm text-emerald-600">{t('success')}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {t('save')}
        </button>
      </form>
    </section>
  );
}
