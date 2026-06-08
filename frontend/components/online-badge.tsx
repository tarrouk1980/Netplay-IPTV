'use client';

import {useTranslations} from 'next-intl';

export function OnlineBadge({lastSeenAt}: {lastSeenAt?: string | null}) {
  const t = useTranslations('experts');

  if (!lastSeenAt) return null;

  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 10) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        {t('online')}
      </span>
    );
  }

  if (diffHours < 24) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
        {t('lastSeenHours', {count: diffHours})}
      </span>
    );
  }

  if (diffDays < 7) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
        {t('lastSeenDays', {count: diffDays})}
      </span>
    );
  }

  return null;
}
