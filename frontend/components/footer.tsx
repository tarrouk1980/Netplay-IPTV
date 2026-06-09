import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Logo} from '@/components/logo';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-indigo-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">SKOLZ</div>
            <p className="mt-3 text-sm text-indigo-300 leading-relaxed">{t('tagline')}</p>
            <div className="mt-5 flex gap-4">
              <a href="#" aria-label="Twitter" className="text-indigo-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-indigo-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{t('platform')}</h4>
            <ul className="space-y-2 text-sm text-indigo-300">
              <li><Link href="/experts" className="hover:text-white transition-colors">{t('browseExperts')}</Link></li>
              <li><Link href="/become-expert" className="hover:text-white transition-colors">{t('becomeExpert')}</Link></li>
              <li><Link href="/plans" className="hover:text-white transition-colors">{t('plans')}</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">{t('login')}</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{t('account')}</h4>
            <ul className="space-y-2 text-sm text-indigo-300">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">{t('dashboard')}</Link></li>
              <li><Link href="/dashboard/support" className="hover:text-white transition-colors">{t('support')}</Link></li>
              <li><Link href="/dashboard/referrals" className="hover:text-white transition-colors">{t('referrals')}</Link></li>
            </ul>
          </div>

          {/* Legal + Newsletter */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{t('legal')}</h4>
            <ul className="space-y-2 text-sm text-indigo-300 mb-5">
              <li><Link href="/faq" className="hover:text-white transition-colors">{t('faq')}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{t('terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link></li>
            </ul>
            <div className="flex gap-2 mt-4">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 rounded-lg bg-indigo-900 border border-indigo-800 px-3 py-2 text-xs text-white placeholder-indigo-500 focus:outline-none focus:border-indigo-500"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 text-xs font-medium transition-colors">OK</button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-indigo-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-indigo-500">© {new Date().getFullYear()} SKOLZ — {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
