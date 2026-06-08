'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {useQuery} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api, type Category, type ExpertProfile, type Paginated} from '@/lib/api';

export default function ExpertsPage() {
  const t = useTranslations('experts');
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get('q') ?? '',
    category_id: searchParams.get('category_id') ?? '',
    min_price: '',
    max_price: '',
    min_rating: '',
    page: '1',
  });
  const [searchInput, setSearchInput] = useState(filters.q);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((f) => (f.q === searchInput ? f : {...f, q: searchInput, page: '1'}));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const {data: categories} = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {data} = await api.get<Category[]>('/categories');
      return data;
    },
  });

  const {data, isLoading} = useQuery({
    queryKey: ['experts', filters],
    queryFn: async () => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const {data} = await api.get<Paginated<ExpertProfile>>('/experts', {params});
      return data;
    },
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <aside className="space-y-4 lg:col-span-1">
        <h2 className="font-semibold">{t('filters')}</h2>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('search')}</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('category')}</label>
          <select
            value={filters.category_id}
            onChange={(e) => setFilters((f) => ({...f, category_id: e.target.value, page: '1'}))}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('minPrice')}</label>
          <input
            type="number"
            value={filters.min_price}
            onChange={(e) => setFilters((f) => ({...f, min_price: e.target.value, page: '1'}))}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('maxPrice')}</label>
          <input
            type="number"
            value={filters.max_price}
            onChange={(e) => setFilters((f) => ({...f, max_price: e.target.value, page: '1'}))}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('minRating')}</label>
          <select
            value={filters.min_rating}
            onChange={(e) => setFilters((f) => ({...f, min_rating: e.target.value, page: '1'}))}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {[4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r}+
              </option>
            ))}
          </select>
        </div>
      </aside>

      <section className="lg:col-span-3">
        <h1 className="mb-6 text-2xl font-semibold">{t('title')}</h1>

        {isLoading && <p className="text-neutral-500">{t('noResults')}</p>}

        {data && data.data.length === 0 && <p className="text-neutral-500">{t('noResults')}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data?.data.map((expert) => (
            <Link
              key={expert.id}
              href={`/experts/${expert.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                  {expert.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{expert.user.name}</p>
                  <p className="text-xs text-neutral-500">{expert.category.name}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-neutral-600">{expert.bio}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-indigo-600">
                  {expert.hourly_rate} {expert.currency}
                  <span className="font-normal text-neutral-500"> {t('perHour')}</span>
                </span>
                <span className="text-amber-500">★ {expert.rating_avg.toFixed(1)}</span>
              </div>
            </Link>
          ))}
        </div>

        {data && data.last_page > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={data.current_page <= 1}
              onClick={() => setFilters((f) => ({...f, page: String(data.current_page - 1)}))}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              {t('previous')}
            </button>
            <span className="text-sm text-neutral-500">
              {data.current_page} / {data.last_page}
            </span>
            <button
              type="button"
              disabled={data.current_page >= data.last_page}
              onClick={() => setFilters((f) => ({...f, page: String(data.current_page + 1)}))}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              {t('next')}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
