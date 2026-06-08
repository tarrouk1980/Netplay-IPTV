'use client';

import {useTranslations} from 'next-intl';

const NOTICE_KEY_BY_SLUG: Record<string, 'legalNotice' | 'medicalNotice'> = {
  'conseil-juridique': 'legalNotice',
  'pre-diagnostic-medical': 'medicalNotice',
};

const REGULATED_SLUGS = Object.keys(NOTICE_KEY_BY_SLUG);

export function CredentialBadge({
  categorySlug,
  credentialReference,
  status,
}: {
  categorySlug: string;
  credentialReference?: string | null;
  status: string;
}) {
  const t = useTranslations('expert');

  if (!REGULATED_SLUGS.includes(categorySlug) || !credentialReference || status !== 'approved') {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 1.5a1 1 0 01.894.553l1.382 2.764 3.064.445a1 1 0 01.555 1.706l-2.218 2.162.524 3.052a1 1 0 01-1.451 1.054L10 11.77l-2.75 1.466a1 1 0 01-1.451-1.054l.524-3.052L4.105 7.968a1 1 0 01.555-1.706l3.064-.445L9.106 2.053A1 1 0 0110 1.5zm-1.146 11.354L10 12.23l1.146.625-.219-1.276.927-.904-1.282-.186L10 9.118l-.572 1.371-1.282.186.927.904-.219 1.276z"
          clipRule="evenodd"
        />
      </svg>
      {t('credentialVerified')}
    </span>
  );
}

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
