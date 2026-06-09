'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api} from '@/lib/api';

type Prefs = {
  booking_updates: boolean;
  new_messages: boolean;
  review_notifications: boolean;
  promotions: boolean;
};

export default function NotificationSettingsPage() {
  const t = useTranslations('notifSettings');
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const {data} = useQuery({
    queryKey: ['notif-prefs'],
    queryFn: async () => {
      const {data} = await api.get<Prefs>('/notification-preferences');
      return data;
    },
  });

  const [prefs, setPrefs] = useState<Prefs>({
    booking_updates: true,
    new_messages: true,
    review_notifications: true,
    promotions: false,
  });

  useEffect(() => {
    if (data) setPrefs(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const {data} = await api.patch<Prefs>('/notification-preferences', prefs);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['notif-prefs']});
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const fields: Array<{key: keyof Prefs; label: string; desc: string}> = [
    {key: 'booking_updates', label: t('bookingUpdates'), desc: t('bookingUpdatesDesc')},
    {key: 'new_messages', label: t('newMessages'), desc: t('newMessagesDesc')},
    {key: 'review_notifications', label: t('reviewNotifications'), desc: t('reviewNotificationsDesc')},
    {key: 'promotions', label: t('promotions'), desc: t('promotionsDesc')},
  ];

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-indigo-600">
          ← {t('back')}
        </Link>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        {fields.map(({key, label, desc}) => (
          <label key={key} className="flex cursor-pointer items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-neutral-500">{desc}</p>
            </div>
            <div className="relative shrink-0">
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) => setPrefs((p) => ({...p, [key]: e.target.checked}))}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-neutral-200 peer-checked:bg-indigo-600 transition-colors" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        ))}

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="mt-2 w-full rounded-full bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saved ? t('saved') : t('save')}
        </button>
      </div>
    </div>
  );
}
