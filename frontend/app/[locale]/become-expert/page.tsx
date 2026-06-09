'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useAuth} from '@/lib/auth-context';

const STEPS = ['step1', 'step2', 'step3', 'step4'] as const;
const PERKS = ['perk1', 'perk2', 'perk3', 'perk4', 'perk5', 'perk6'] as const;

export default function BecomeExpertPage() {
  const t = useTranslations('becomeExpert');
  const {user} = useAuth();

  const ctaHref = user
    ? user.role === 'expert'
      ? '/dashboard/expert'
      : '/register?role=expert'
    : '/register?role=expert';

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-4 text-xl text-neutral-600">{t('heroSubtitle')}</p>
        <Link
          href={ctaHref}
          className="mt-8 inline-block rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-indigo-700"
        >
          {t('heroCta')}
        </Link>
      </div>

      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PERKS.map((perk) => (
          <div key={perk} className="rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-2xl">{t(`${perk}Icon`)}</p>
            <h3 className="mt-3 font-semibold">{t(`${perk}Title`)}</h3>
            <p className="mt-1 text-sm text-neutral-500">{t(`${perk}Body`)}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-8 text-center text-2xl font-bold">{t('howTitle')}</h2>
      <div className="relative">
        <div className="absolute left-5 top-0 h-full w-0.5 bg-indigo-100" />
        <div className="space-y-8">
          {STEPS.map((step, i) => (
            <div key={step} className="relative flex gap-6 pl-14">
              <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold">{t(`${step}Title`)}</h3>
                <p className="mt-1 text-sm text-neutral-500">{t(`${step}Body`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-2xl bg-indigo-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-indigo-900">{t('finalCta')}</h2>
        <p className="mt-2 text-indigo-700">{t('finalCtaBody')}</p>
        <Link
          href={ctaHref}
          className="mt-6 inline-block rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {t('heroCta')}
        </Link>
      </div>
    </div>
  );
}
