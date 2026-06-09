import {getTranslations} from 'next-intl/server';

export async function generateMetadata() {
  return {title: 'Conditions générales | SKOLZ'};
}

export default async function TermsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'terms'});

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-neutral">
      <h1>{t('title')}</h1>
      <p className="text-sm text-neutral-400">{t('lastUpdated')}</p>
      {(['s1','s2','s3','s4','s5'] as const).map((s) => (
        <section key={s}>
          <h2>{t(`${s}Title`)}</h2>
          <p>{t(`${s}Body`)}</p>
        </section>
      ))}
    </div>
  );
}
