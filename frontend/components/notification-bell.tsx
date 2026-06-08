'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api, type AppNotification, type Paginated} from '@/lib/api';

export function NotificationBell() {
  const t = useTranslations('notifications');
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {data} = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const {data} = await api.get<Paginated<AppNotification>>('/notifications');
      return data;
    },
    refetchInterval: 15000,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['notifications']}),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['notifications']}),
  });

  const unreadCount = data?.data.filter((n) => !n.read_at).length ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-neutral-500 hover:text-indigo-600"
        aria-label={t('title')}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t('title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
              >
                {t('markAllRead')}
              </button>
            )}
          </div>

          {data && data.data.length === 0 && <p className="text-xs text-neutral-500">{t('empty')}</p>}

          <div className="max-h-72 space-y-1 overflow-y-auto">
            {data?.data.map((notification) => (
              <Link
                key={notification.id}
                href={`/dashboard/bookings/${notification.data.booking_id}`}
                onClick={() => {
                  if (!notification.read_at) markRead.mutate(notification.id);
                  setOpen(false);
                }}
                className={`block rounded-lg p-2 text-xs hover:bg-neutral-50 ${
                  notification.read_at ? 'text-neutral-500' : 'bg-indigo-50 font-medium text-neutral-800'
                }`}
              >
                <p>{notification.data.message}</p>
                <p className="mt-1 text-[10px] text-neutral-400">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
