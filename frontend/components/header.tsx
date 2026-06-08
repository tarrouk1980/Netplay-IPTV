'use client';

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

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/experts" className="hover:text-indigo-600">
            {t('experts')}
          </Link>

          {user ? (
            <>
              <Link
                href={
                  user.role === 'admin'
                    ? '/dashboard/admin'
                    : user.role === 'expert'
                      ? '/dashboard/expert'
                      : '/dashboard'
                }
                className="hover:text-indigo-600"
              >
                {t('dashboard')}
              </Link>
              <NotificationBell />
              <button onClick={() => logout()} className="text-neutral-500 hover:text-indigo-600">
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-indigo-600">
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-white hover:bg-indigo-700"
              >
                {t('register')}
              </Link>
            </>
          )}

          <select
            value={locale}
            onChange={(e) => router.replace(pathname, {locale: e.target.value})}
            className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs"
          >
            {locales.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
