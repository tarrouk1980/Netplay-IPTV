'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery} from '@tanstack/react-query';
import {Link, useRouter} from '@/i18n/navigation';
import {api, type Category, type ExpertProfile, type Paginated} from '@/lib/api';
import {ExpertCard} from '@/components/expert-card';
import {RecentlyViewed} from '@/components/recently-viewed';

const TESTIMONIALS = [
  {
    name: 'Sophie Martin',
    role: 'Directrice Marketing',
    avatar: 'https://i.pravatar.cc/150?u=sophie',
    text: 'SKOLZ m\'a permis de trouver un expert en SEO en moins de 24h. La session a transformé notre stratégie digitale.',
    rating: 5,
  },
  {
    name: 'Karim Benali',
    role: 'Fondateur Startup',
    avatar: 'https://i.pravatar.cc/150?u=karim',
    text: 'J\'ai eu accès à un CFO expérimenté pour ma levée de fonds. Résultat : 500K€ levés en 3 mois.',
    rating: 5,
  },
  {
    name: 'Emma Dubois',
    role: 'Coach Freelance',
    avatar: 'https://i.pravatar.cc/150?u=emma',
    text: 'En tant qu\'expert sur SKOLZ, j\'ai triplé mes revenus de consulting. La plateforme est vraiment premium.',
    rating: 5,
  },
];

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
      const {data} = await api.get<Paginated<ExpertProfile>>('/experts', {
        params: {sort: 'rating_avg', direction: 'desc', per_page: 6},
      });
      return data.data.slice(0, 6);
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/experts?q=${encodeURIComponent(query)}` : '/experts');
  }

  return (
    <div className="flex flex-col">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-indigo-200 mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            500+ experts disponibles maintenant
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            {t('title')}
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-indigo-200 leading-relaxed">
            {t('subtitle')}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-10 flex w-full max-w-2xl mx-auto gap-3">
            <div className="flex-1 flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-3.5 gap-3">
              <svg className="w-5 h-5 text-indigo-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="flex-1 bg-transparent text-white placeholder-indigo-300 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-indigo-700 rounded-full px-7 py-3.5 text-sm font-bold shadow-lg hover:bg-indigo-50 transition-all whitespace-nowrap"
            >
              {t('cta')}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/experts" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 py-3 font-semibold shadow-md hover:shadow-lg transition-all">
              Trouver un expert
            </Link>
            <Link href="/become-expert" className="border border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-3 font-semibold transition-all">
              Devenir expert
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-base">⭐</span>
              <span className="font-semibold text-neutral-900">{t('statsRating')}</span>
              <span>satisfaction</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-neutral-200" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900">{t('statsExperts')}</span>
              <span>experts vérifiés</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-neutral-200" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900">{t('statsSessions')}</span>
              <span>sessions réalisées</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RECENTLY VIEWED ===== */}
      <div className="mx-auto max-w-6xl px-4 pt-8 w-full">
        <RecentlyViewed />
      </div>

      {/* ===== CATEGORIES ===== */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-indigo-950">{t('browseCategories')}</h2>
              <p className="mt-2 text-neutral-500">Trouvez l&apos;expertise exacte dont vous avez besoin</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/experts?category_id=${category.id}`}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md transition-all"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURED EXPERTS ===== */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-indigo-950">{t('topExperts')}</h2>
              <p className="mt-2 text-neutral-500">Les professionnels les mieux notés de la plateforme</p>
            </div>
            <Link href="/experts" className="text-indigo-600 text-sm font-semibold hover:underline hidden md:block">
              {t('viewAll')} →
            </Link>
          </div>

          {featuredExperts && featuredExperts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredExperts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-neutral-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-3/4" />
                      <div className="h-3 bg-neutral-200 rounded w-1/2" />
                      <div className="h-6 bg-neutral-200 rounded-full w-24" />
                    </div>
                  </div>
                  <div className="mt-4 h-10 bg-neutral-200 rounded-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-indigo-950">Comment ça marche</h2>
            <p className="mt-2 text-neutral-500">Simple, rapide et efficace</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {(['step1', 'step2', 'step3'] as const).map((step, index) => (
              <div key={step} className="relative bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl font-extrabold mb-6">
                  {index + 1}
                </div>
                <div className="absolute top-4 right-4 text-5xl font-extrabold text-indigo-50 select-none leading-none">
                  0{index + 1}
                </div>
                <h3 className="text-lg font-bold text-indigo-950">{t(`${step}Title`)}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{t(`${step}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-indigo-950">Ce qu&apos;ils en disent</h2>
            <p className="mt-2 text-neutral-500">Des milliers de professionnels font confiance à SKOLZ</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="bg-slate-50 rounded-2xl p-6 border border-neutral-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm text-neutral-900">{testimonial.name}</p>
                    <p className="text-xs text-neutral-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Prêt à partager votre expertise ?</h2>
          <p className="mt-4 text-indigo-200 text-lg">Rejoignez notre réseau d&apos;experts vérifiés et développez votre activité.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="bg-white text-indigo-700 hover:bg-indigo-50 rounded-full px-8 py-3.5 font-bold shadow-lg transition-all">
              Commencer gratuitement
            </Link>
            <Link href="/experts" className="border border-white/40 text-white hover:bg-white/10 rounded-full px-8 py-3.5 font-semibold transition-all">
              Explorer les experts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
