import type {Metadata} from 'next';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {id, locale} = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'}/experts/${id}`,
      {next: {revalidate: 300}}
    );
    if (!res.ok) throw new Error('Not found');
    const expert = await res.json();

    const name: string = expert.user?.name ?? 'Expert';
    const bio: string = expert.headline ?? expert.bio?.slice(0, 160) ?? '';
    const image: string | null = expert.user?.avatar_url ?? null;
    const category: string = expert.category?.name ?? '';

    return {
      title: `${name} — ${category} | SKOLZ`,
      description: bio,
      openGraph: {
        title: `${name} — ${category} | SKOLZ`,
        description: bio,
        ...(image ? {images: [{url: image}]} : {}),
        type: 'profile',
        locale: locale === 'ar' ? 'ar_TN' : locale === 'en' ? 'en_US' : 'fr_FR',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} | SKOLZ`,
        description: bio,
        ...(image ? {images: [image]} : {}),
      },
    };
  } catch {
    return {title: 'Expert | SKOLZ'};
  }
}

export default function ExpertLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}
