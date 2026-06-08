'use client';

import {useEffect} from 'react';
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
    queryKey: ['bookings'],
    queryFn: async () => {
      const {data} = await api.get<Paginated<Booking>>('/bookings');
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

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('myBookings')}</h1>
        <Link href="/dashboard/favorites" className="text-sm text-indigo-600 hover:underline">
          {t('myFavorites')}
        </Link>
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
