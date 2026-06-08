import {useTranslations} from 'next-intl';
import {Logo} from '@/components/logo';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center">
        <Logo />
        <p className="max-w-md text-sm text-neutral-500">{t('tagline')}</p>
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} SKOLZ — {t('rights')}
        </p>
      </div>
    </footer>
  );
}
