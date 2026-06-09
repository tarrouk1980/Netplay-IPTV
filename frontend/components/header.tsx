'use client';

import {useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {Link, usePathname, useRouter} from '@/i18n/navigation';
import {useAuth} from '@/lib/auth-context';
import {NotificationBell} from './notification-bell';
import {Logo} from './logo';

const locales = [
  {code: 'fr', label: 'FR'},
  {code: 'ar', label: 'عربي'},
  {code: 'en', label: 'EN'},
];

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const {user, logout} = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardHref =
    user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'expert' ? '/dashboard/expert' : '/dashboard';

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/experts" className="hover:text-indigo-600">{t('experts')}</Link>
          <Link href="/plans" className="hover:text-indigo-600">{t('plans')}</Link>

          {user ? (
            <>
              <Link href={dashboardHref} className="hover:text-indigo-600">{t('dashboard')}</Link>
              <NotificationBell />
              <button onClick={() => logout()} className="text-neutral-500 hover:text-indigo-600">{t('logout')}</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-600">{t('login')}</Link>
              <Link href="/register" className="rounded-full bg-indigo-600 px-4 py-1.5 text-white hover:bg-indigo-700">{t('register')}</Link>
            </>
          )}

          <select
            value={locale}
            onChange={(e) => router.replace(pathname, {locale: e.target.value})}
            className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs"
          >
            {locales.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-neutral-700 transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-5 bg-neutral-700 transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-neutral-700 transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-neutral-200 bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3 text-sm">
            <Link href="/experts" onClick={() => setMobileOpen(false)} className="hover:text-indigo-600">{t('experts')}</Link>
            <Link href="/plans" onClick={() => setMobileOpen(false)} className="hover:text-indigo-600">{t('plans')}</Link>
            {user ? (
              <>
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="hover:text-indigo-600">{t('dashboard')}</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left text-neutral-500 hover:text-indigo-600">{t('logout')}</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="hover:text-indigo-600">{t('login')}</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-full bg-indigo-600 px-4 py-1.5 text-center text-white hover:bg-indigo-700">{t('register')}</Link>
              </>
            )}
            <select
              value={locale}
              onChange={(e) => { router.replace(pathname, {locale: e.target.value}); setMobileOpen(false); }}
              className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs"
            >
              {locales.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </nav>
      )}
    </header>
  );
}
