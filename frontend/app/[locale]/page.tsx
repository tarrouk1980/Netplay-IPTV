'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery} from '@tanstack/react-query';
import {Link, useRouter} from '@/i18n/navigation';
import {api, type Category, type ExpertProfile} from '@/lib/api';
import {Avatar} from '@/components/avatar';

export default function HomePage() {
  const t = useTranslations('home');
  const router = useRouter();
  const [query, setQuery] = useState('');

  const {data: categories} = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {data} = await api.get<Category[]>('/categories');
      return data;
    },
  });

  const {data: featuredExperts} = useQuery({
    queryKey: ['featured-experts'],
    queryFn: async () => {
      const {data} = await api.get<{data: ExpertProfile[]}>('/experts', {params: {sort: 'rating_avg', direction: 'desc', per_page: 3}});
      return data.data.slice(0, 3);
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/experts?q=${encodeURIComponent(query)}` : '/experts');
  }

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
        {t('title')}
      </h1>
      <p className="max-w-xl text-lg text-neutral-600">{t('subtitle')}</p>

      <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 rounded-full border border-neutral-300 px-5 py-3 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t('cta')}
        </button>
      </form>

      {categories && categories.length > 0 && (
        <div className="mt-4 w-full max-w-3xl">
          <h2 className="mb-4 text-sm font-medium text-neutral-500">{t('browseCategories')}</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/experts?category_id=${category.id}`}
                className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm hover:border-indigo-400 hover:text-indigo-600"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {featuredExperts && featuredExperts.length > 0 && (
        <div className="mt-8 w-full max-w-4xl text-left">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-800">{t('topExperts')}</h2>
            <Link href="/experts" className="text-sm text-indigo-600 hover:underline">{t('viewAll')}</Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {featuredExperts.map((expert) => (
              <Link
                key={expert.id}
                href={`/experts/${expert.id}`}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition"
              >
                <Avatar name={expert.user.name} url={expert.user.avatar_url} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{expert.user.name}</p>
                  <p className="truncate text-xs text-neutral-500">{expert.category.name}</p>
                  <p className="text-xs text-amber-500">★ {expert.rating_avg.toFixed(1)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        {(['step1', 'step2', 'step3'] as const).map((step, index) => (
          <div key={step} className="rounded-xl border border-neutral-200 bg-white p-6 text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {index + 1}
            </div>
            <h3 className="mt-3 font-semibold text-neutral-900">{t(`${step}Title`)}</h3>
            <p className="mt-1 text-sm text-neutral-600">{t(`${step}Body`)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-12 text-center">
        <div>
          <p className="text-3xl font-bold text-indigo-600">500+</p>
          <p className="text-sm text-neutral-500">{t('statsExperts')}</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-indigo-600">10K+</p>
          <p className="text-sm text-neutral-500">{t('statsSessions')}</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-indigo-600">4.8★</p>
          <p className="text-sm text-neutral-500">{t('statsRating')}</p>
        </div>
      </div>
    </div>
  );
}
