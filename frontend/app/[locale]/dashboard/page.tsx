'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery} from '@tanstack/react-query';
import {Link, useRouter} from '@/i18n/navigation';
import {api, type Booking, type Paginated} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {AvatarSettings} from '@/components/avatar-settings';
import {ChangePasswordForm} from '@/components/change-password-form';
import {ClientProfileForm} from '@/components/client-profile-form';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tb = useTranslations('booking');
  const router = useRouter();
  const {user, loading} = useAuth();
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && user?.role === 'expert') {
      router.replace('/dashboard/expert');
    } else if (!loading && user?.role === 'admin') {
      router.replace('/dashboard/admin');
    }
  }, [loading, user, router]);

  const {data} = useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? {status: statusFilter} : {};
      const {data} = await api.get<Paginated<Booking>>('/bookings', {params});
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <ClientProfileForm />
        <AvatarSettings />
        <ChangePasswordForm />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('myBookings')}</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="">{tb('allStatuses')}</option>
          <option value="pending">{tb('status.pending')}</option>
          <option value="confirmed">{tb('status.confirmed')}</option>
          <option value="completed">{tb('status.completed')}</option>
          <option value="cancelled">{tb('status.cancelled')}</option>
        </select>
        <div className="flex gap-3">
          <Link href="/dashboard/referrals" className="text-sm text-indigo-600 hover:underline">
            {t('myReferrals')}
          </Link>
          <Link href="/dashboard/favorites" className="text-sm text-indigo-600 hover:underline">
            {t('myFavorites')}
          </Link>
          <Link href="/dashboard/notification-settings" className="text-sm text-indigo-600 hover:underline">
            {t('notifSettings')}
          </Link>
          <Link href="/dashboard/messages" className="text-sm text-indigo-600 hover:underline">
            {t('messages')}
          </Link>
          <Link href="/dashboard/support" className="text-sm text-indigo-600 hover:underline">
            {t('support')}
          </Link>
          <Link href="/dashboard/gifts" className="text-sm text-indigo-600 hover:underline">
            {t('gifts')}
          </Link>
        </div>
      </div>

      {data && data.data.length === 0 && <p className="text-neutral-500">{t('noBookings')}</p>}

      <div className="space-y-3">
        {data?.data.map((booking) => (
          <Link
            key={booking.id}
            href={`/dashboard/bookings/${booking.id}`}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 hover:border-indigo-300"
          >
            <div>
              <p className="font-medium">{booking.expert?.user.name}</p>
              <p className="text-sm text-neutral-500">
                {new Date(booking.slot_datetime_start).toLocaleString()}
              </p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
              {tb(`status.${booking.status}`)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
