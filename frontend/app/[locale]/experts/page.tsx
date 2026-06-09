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
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-3xl font-bold text-indigo-950">{t('title')}</h1>
          <p className="mt-1 text-neutral-500">Découvrez nos experts vérifiés et réservez votre session</p>

          {/* Search bar with autocomplete */}
          <div className="mt-5 flex max-w-2xl gap-3">
            <div className="flex-1 relative">
              <div className="flex items-center bg-white border border-neutral-200 rounded-full px-5 py-3 gap-3 shadow-sm hover:shadow-md transition-shadow">
                <svg className="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={t('searchPlaceholder')}
                  className="flex-1 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none"
                />
                {searchInput && (
                  <button type="button" onClick={() => { setSearchInput(''); setFilters(f => ({...f, q: '', page: '1'})); }} className="text-neutral-400 hover:text-neutral-600 text-xs">✕</button>
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full rounded-2xl border border-neutral-100 bg-white shadow-xl overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={`${s.type}-${s.id}`}
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors"
                      onMouseDown={() => {
                        if (s.type === 'expert') { window.location.href = `/experts/${s.id}`; }
                        else { setFilters((f) => ({...f, category_id: String(s.id), q: '', page: '1'})); setSearchInput(''); }
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="text-neutral-400">{s.type === 'expert' ? '👤' : '🏷'}</span>
                      <span className="text-neutral-700">{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="lg:w-60 flex-shrink-0 space-y-6">
            {/* Sort */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">{t('sortBy')}</h3>
              <select
                value={filters.sort ? `${filters.sort}:${filters.direction || 'desc'}` : ''}
                onChange={(e) => {
                  const [sort, direction] = e.target.value ? e.target.value.split(':') : ['', ''];
                  setFilters((f) => ({...f, sort, direction, page: '1'}));
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
              >
                <option value="">{t('sortDefault')}</option>
                <option value="rating_avg:desc">{t('sortTopRated')}</option>
                <option value="hourly_rate:asc">{t('sortPriceAsc')}</option>
                <option value="hourly_rate:desc">{t('sortPriceDesc')}</option>
                <option value="total_sessions:desc">{t('sortMostExperienced')}</option>
              </select>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">{t('category')}</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters(f => ({...f, category_id: '', page: '1'}))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.category_id === '' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-indigo-400 hover:text-indigo-600'}`}
                >
                  Tous
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters(f => ({...f, category_id: String(cat.id), page: '1'}))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.category_id === String(cat.id) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-indigo-400 hover:text-indigo-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Budget (€/h)</h3>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={filters.min_price} onChange={(e) => setFilters(f => ({...f, min_price: e.target.value, page: '1'}))} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
                <span className="text-neutral-400">—</span>
                <input type="number" placeholder="Max" value={filters.max_price} onChange={(e) => setFilters(f => ({...f, max_price: e.target.value, page: '1'}))} className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">{t('minRating')}</h3>
              <div className="space-y-1">
                {[{v:'',l:'Toutes'},{v:'4',l:'4+ ⭐'},{v:'3',l:'3+ ⭐'},{v:'2',l:'2+ ⭐'}].map(opt => (
                  <button key={opt.v} onClick={() => setFilters(f => ({...f, min_rating: opt.v, page: '1'}))} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${filters.min_rating === opt.v ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">{t('language')}</h3>
              <select value={filters.language} onChange={(e) => setFilters(f => ({...f, language: e.target.value, page: '1'}))} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none">
                <option value="">—</option>
                <option value="fr">{t('languageFr')}</option>
                <option value="ar">{t('languageAr')}</option>
                <option value="en">{t('languageEn')}</option>
              </select>
            </div>

            {/* Reset */}
            {(filters.q || filters.category_id || filters.min_price || filters.max_price || filters.min_rating || filters.language || filters.sort) && (
              <button onClick={() => { setFilters({q:'',category_id:'',min_price:'',max_price:'',min_rating:'',language:'',sort:'',direction:'',page:'1'}); setSearchInput(''); }} className="w-full text-sm text-red-500 hover:text-red-700 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-all">
                Réinitialiser
              </button>
            )}
          </aside>

          {/* Expert grid */}
          <section className="flex-1">
            {data && (
              <p className="text-sm text-neutral-500 mb-4">
                <span className="font-semibold text-neutral-800">{data.data.length}</span> {t('expertsFound')}
              </p>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({length: 6}).map((_, i) => <ExpertCardSkeleton key={i} />)}
              </div>
            )}

            {!isLoading && data && data.data.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">{t('noResults')}</h3>
                <p className="text-neutral-500 text-sm">Essayez de modifier vos critères de recherche</p>
              </div>
            )}

            {!isLoading && data && data.data.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2">
                {data.data.map((expert) => (
                  <Link
                    key={expert.id}
                    href={`/experts/${expert.id}`}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-5 block"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <Avatar name={expert.user.name} url={expert.user.avatar_url} size="md" />
                        {expert.status === 'approved' && (
                          <span className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-indigo-950 truncate">{expert.user.name}</p>
                            {expert.featured && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">★</span>}
                          </div>
                          <FavoriteButton expertId={expert.id} isFavorited={favoriteIds.has(expert.id)} />
                        </div>
                        <p className="text-xs text-neutral-500">{expert.category.name}</p>
                        <OnlineBadge lastSeenAt={expert.last_seen_at} />
                        {expert.headline && <p className="mt-1 text-xs font-medium text-neutral-700 line-clamp-1">{expert.headline}</p>}
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-neutral-600 leading-relaxed">{expert.bio}</p>

                    {expert.specializations && expert.specializations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {expert.specializations.slice(0, 3).map((s) => (
                          <span key={s} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-bold text-indigo-600">{expert.hourly_rate} {expert.currency}<span className="font-normal text-neutral-400 text-xs"> /h</span></span>
                      <span className="text-amber-500 font-medium">★ {Number(expert.rating_avg ?? 0).toFixed(1)} <span className="text-xs text-neutral-400">({expert.total_sessions})</span></span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {data && data.last_page > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button type="button" disabled={data.current_page <= 1} onClick={() => setFilters(f => ({...f, page: String(data.current_page - 1)}))} className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium disabled:opacity-40 hover:border-indigo-400 transition-all">
                  ← {t('previous')}
                </button>
                <span className="text-sm text-neutral-500">{data.current_page} / {data.last_page}</span>
                <button type="button" disabled={data.current_page >= data.last_page} onClick={() => setFilters(f => ({...f, page: String(data.current_page + 1)}))} className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium disabled:opacity-40 hover:border-indigo-400 transition-all">
                  {t('next')} →
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
