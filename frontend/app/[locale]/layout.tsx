import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {Providers} from './providers';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {ScrollToTop} from '@/components/scroll-to-top';
import '../globals.css';

export const metadata: Metadata = {
  title: 'SKOLZ — Trouvez votre expert',
  description: 'SKOLZ — La plateforme qui connecte experts, coachs, avocats et médecins avec ceux qui ont besoin de leurs conseils.',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  appleWebApp: {
    capable: true,
    title: 'SKOLZ',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'SKOLZ — Expert Marketplace',
    description: 'Connectez-vous avec des experts qualifiés pour des consultations en ligne.',
    type: 'website',
    siteName: 'SKOLZ',
  },
};

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
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
              <Footer />
              <ScrollToTop />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
