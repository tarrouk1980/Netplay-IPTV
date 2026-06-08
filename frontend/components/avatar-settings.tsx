'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useMutation} from '@tanstack/react-query';
import {api} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {Avatar} from '@/components/avatar';

export function AvatarSettings() {
  const t = useTranslations('common');
  const {user, refreshUser} = useAuth();
  const [url, setUrl] = useState(user?.avatar_url ?? '');

  const mutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.patch('/me', {avatar_url: url || null});
      return data;
    },
    onSuccess: async () => {
      await refreshUser();
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4">
      <Avatar name={user.name} url={user.avatar_url} size="lg" />
      <div className="flex-1 space-y-2">
        <label className="block text-xs text-neutral-500">{t('avatarUrl')}</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
