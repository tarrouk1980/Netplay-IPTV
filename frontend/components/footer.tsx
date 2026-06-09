import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Logo} from '@/components/logo';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 text-xs text-neutral-500">{t('tagline')}</p>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-700">{t('platform')}</h3>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link href="/experts" className="hover:text-indigo-600">{t('browseExperts')}</Link></li>
              <li><Link href="/become-expert" className="hover:text-indigo-600">{t('becomeExpert')}</Link></li>
              <li><Link href="/plans" className="hover:text-indigo-600">{t('plans')}</Link></li>
              <li><Link href="/login" className="hover:text-indigo-600">{t('login')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-700">{t('account')}</h3>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link href="/dashboard" className="hover:text-indigo-600">{t('dashboard')}</Link></li>
              <li><Link href="/dashboard/support" className="hover:text-indigo-600">{t('support')}</Link></li>
              <li><Link href="/dashboard/referrals" className="hover:text-indigo-600">{t('referrals')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-700">{t('legal')}</h3>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li><Link href="/faq" className="hover:text-indigo-600">{t('faq')}</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-600">{t('terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-600">{t('privacy')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} SKOLZ — {t('rights')}
        </div>
      </div>
    </footer>
  );
}
