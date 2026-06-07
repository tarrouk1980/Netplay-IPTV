import type {ReactNode} from 'react';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {Providers} from './providers';
import {Header} from '@/components/header';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <NextIntlClientProvider>
          <Providers>
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
