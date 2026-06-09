'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

type RecentExpert = {id: number; name: string; category: string; avatar_url: string | null};

const STORAGE_KEY = 'skolz_recent_experts';
const MAX_RECENT = 5;

export function trackRecentExpert(expert: RecentExpert) {
  if (typeof window === 'undefined') return;
  const existing: RecentExpert[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  const filtered = existing.filter((e) => e.id !== expert.id);
  const updated = [expert, ...filtered].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function RecentlyViewed() {
  const t = useTranslations('home');
  const [experts, setExperts] = useState<RecentExpert[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    setExperts(stored);
  }, []);

  if (experts.length === 0) return null;

  return (
    <div className="w-full max-w-4xl text-left">
      <h2 className="mb-3 text-sm font-medium text-neutral-500">{t('recentlyViewed')}</h2>
      <div className="flex flex-wrap gap-2">
        {experts.map((expert) => (
          <Link
            key={expert.id}
            href={`/experts/${expert.id}`}
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:border-indigo-300 hover:text-indigo-600 transition"
          >
            <span className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
              {expert.name.charAt(0).toUpperCase()}
            </span>
            <span>{expert.name}</span>
            <span className="text-xs text-neutral-400">{expert.category}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
