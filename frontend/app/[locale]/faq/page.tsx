'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const;

export default function FAQPage() {
  const t = useTranslations('faq');
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>

      <div className="space-y-3">
        {FAQ_KEYS.map((key) => (
          <div key={key} className="rounded-xl border border-neutral-200 bg-white">
            <button
              onClick={() => setOpen(open === key ? null : key)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
            >
              <span>{t(`${key}Q`)}</span>
              <span className="ml-4 text-neutral-400">{open === key ? '−' : '+'}</span>
            </button>
            {open === key && (
              <div className="border-t border-neutral-100 px-5 pb-4 pt-3 text-sm text-neutral-600">
                {t(`${key}A`)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
