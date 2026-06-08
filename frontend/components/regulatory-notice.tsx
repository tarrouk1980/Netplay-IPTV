'use client';

import {useTranslations} from 'next-intl';

const NOTICE_KEY_BY_SLUG: Record<string, 'legalNotice' | 'medicalNotice'> = {
  'conseil-juridique': 'legalNotice',
  'pre-diagnostic-medical': 'medicalNotice',
};

export function RegulatoryNotice({categorySlug}: {categorySlug: string}) {
  const t = useTranslations('expert');
  const key = NOTICE_KEY_BY_SLUG[categorySlug];

  if (!key) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      {t(key)}
    </div>
  );
}
