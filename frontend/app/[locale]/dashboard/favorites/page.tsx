'use client';

import {useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery} from '@tanstack/react-query';
import {Link, useRouter} from '@/i18n/navigation';
import {api, type ExpertProfile} from '@/lib/api';
import {useAuth} from '@/lib/auth-context';
import {Avatar} from '@/components/avatar';
import {FavoriteButton} from '@/components/favorite-button';

export default function FavoritesPage() {
  const t = useTranslations('favorites');
  const te = useTranslations('experts');
  const router = useRouter();
  const {user, loading} = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  const {data} = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const {data} = await api.get<ExpertProfile[]>('/favorites');
      return data;
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">{t('title')}</h1>

      {data && data.length === 0 && <p className="text-neutral-500">{t('empty')}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data?.map((expert) => (
          <Link
            key={expert.id}
            href={`/experts/${expert.id}`}
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={expert.user.name} url={expert.user.avatar_url} size="sm" />
                <div>
                  <p className="font-medium">{expert.user.name}</p>
                  <p className="text-xs text-neutral-500">{expert.category.name}</p>
                </div>
              </div>
              <FavoriteButton expertId={expert.id} isFavorited={true} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-indigo-600">
                {expert.hourly_rate} {expert.currency}
                <span className="font-normal text-neutral-500"> {te('perHour')}</span>
              </span>
              <span className="text-amber-500">★ {expert.rating_avg.toFixed(1)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
