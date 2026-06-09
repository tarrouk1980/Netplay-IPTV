'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {useQuery} from '@tanstack/react-query';
import {Link} from '@/i18n/navigation';
import {api, type Category, type ExpertProfile, type Paginated} from '@/lib/api';
import {Avatar} from '@/components/avatar';
import {FavoriteButton, useFavoriteIds} from '@/components/favorite-button';
import {OnlineBadge} from '@/components/online-badge';
import {ExpertCardSkeleton} from '@/components/expert-card-skeleton';

export default function ExpertsPage() {
  const t = useTranslations('experts');
  const favoriteIds = useFavoriteIds();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get('q') ?? '',
    category_id: searchParams.get('category_id') ?? '',
    min_price: '',
    max_price: '',
    min_rating: '',
    language: '',
    sort: '',
    direction: '',
    page: '1',
  });
  const [searchInput, setSearchInput] = useState(filters.q);
  const [suggestions, setSuggestions] = useState<Array<{type: string; id: number; label: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((f) => (f.q === searchInput ? f : {...f, q: searchInput, page: '1'}));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (searchInput.length < 2) { setSuggestions([]); return; }
    const t2 = setTimeout(async () => {
      try {
        const {data} = await api.get('/search/suggestions', {params: {q: searchInput}});
        setSuggestions(data);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 200);
    return () => clearTimeout(t2);
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

        <div className="relative">
          <label className="mb-1 block text-xs text-neutral-500">{t('search')}</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-md">
              {suggestions.map((s) => (
                <button
                  key={`${s.type}-${s.id}`}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50"
                  onMouseDown={() => {
                    if (s.type === 'expert') {
                      window.location.href = `/experts/${s.id}`;
                    } else {
                      setFilters((f) => ({...f, category_id: String(s.id), q: '', page: '1'}));
                      setSearchInput('');
                    }
                    setShowSuggestions(false);
                  }}
                >
                  <span className="text-xs text-neutral-400">{s.type === 'expert' ? '👤' : '🏷'}</span>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('sortBy')}</label>
          <select
            value={filters.sort ? `${filters.sort}:${filters.direction || 'desc'}` : ''}
            onChange={(e) => {
              const [sort, direction] = e.target.value ? e.target.value.split(':') : ['', ''];
              setFilters((f) => ({...f, sort, direction, page: '1'}));
            }}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">{t('sortDefault')}</option>
            <option value="rating_avg:desc">{t('sortTopRated')}</option>
            <option value="hourly_rate:asc">{t('sortPriceAsc')}</option>
            <option value="hourly_rate:desc">{t('sortPriceDesc')}</option>
            <option value="total_sessions:desc">{t('sortMostExperienced')}</option>
          </select>
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

        <div>
          <label className="mb-1 block text-xs text-neutral-500">{t('language')}</label>
          <select
            value={filters.language}
            onChange={(e) => setFilters((f) => ({...f, language: e.target.value, page: '1'}))}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            <option value="fr">{t('languageFr')}</option>
            <option value="ar">{t('languageAr')}</option>
            <option value="en">{t('languageEn')}</option>
          </select>
        </div>
      </aside>

      <section className="lg:col-span-3">
        <div className="mb-6 flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          {data && (
            <span className="text-sm text-neutral-500">
              {data.data.length} {t('expertsFound')}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({length: 6}).map((_, i) => <ExpertCardSkeleton key={i} />)}
          </div>
        )}

        {data && data.data.length === 0 && <p className="text-neutral-500">{t('noResults')}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data?.data.map((expert) => (
            <Link
              key={expert.id}
              href={`/experts/${expert.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={expert.user.name} url={expert.user.avatar_url} size="sm" />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium">{expert.user.name}</p>
                      {expert.featured && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">★</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">{expert.category.name}</p>
                  </div>
                </div>
                <FavoriteButton expertId={expert.id} isFavorited={favoriteIds.has(expert.id)} />
              </div>
              <div className="mt-2">
                <OnlineBadge lastSeenAt={expert.last_seen_at} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{expert.bio}</p>
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
