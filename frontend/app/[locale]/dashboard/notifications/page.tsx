'use client';

import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {api, type AppNotification, type Paginated} from '@/lib/api';
import {useState} from 'react';

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const {data} = useQuery({
    queryKey: ['notifications-all', page],
    queryFn: async () => {
      const {data} = await api.get<Paginated<AppNotification>>('/notifications', {params: {page}});
      return data;
    },
  });

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['notifications']});
      qc.invalidateQueries({queryKey: ['notifications-all']});
    },
  });

  const readAllMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['notifications']});
      qc.invalidateQueries({queryKey: ['notifications-all']});
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <button
          onClick={() => readAllMutation.mutate()}
          disabled={readAllMutation.isPending}
          className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
        >
          {t('markAllRead')}
        </button>
      </div>

      {data && data.data.length === 0 && (
        <p className="text-neutral-500">{t('empty')}</p>
      )}

      <div className="space-y-2">
        {data?.data.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border p-4 ${n.read_at ? 'border-neutral-200 bg-white' : 'border-indigo-200 bg-indigo-50'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{n.data.message}</p>
                <p className="mt-1 text-xs text-neutral-400">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.read_at && (
                <button
                  onClick={() => readMutation.mutate(n.id)}
                  disabled={readMutation.isPending}
                  className="shrink-0 text-xs text-indigo-600 hover:underline"
                >
                  {t('markRead')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {data && data.last_page > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full border border-neutral-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            ←
          </button>
          <span className="px-3 py-1 text-sm text-neutral-500">{page} / {data.last_page}</span>
          <button
            onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
            disabled={page === data.last_page}
            className="rounded-full border border-neutral-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
