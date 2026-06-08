'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useQuery} from '@tanstack/react-query';
import {Link, useRouter} from '@/i18n/navigation';
import {api, type Category} from '@/lib/api';

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
        <div className="mt-8 w-full max-w-3xl">
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
    </div>
  );
}
