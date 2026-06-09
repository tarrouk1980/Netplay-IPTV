import type {MetadataRoute} from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://skolz.app';
  const locales = ['fr', 'en', 'ar'];

  const staticRoutes = ['', '/experts', '/plans', '/become-expert', '/login', '/register'];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    }
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'}/experts?per_page=100`,
      {next: {revalidate: 3600}}
    );
    if (res.ok) {
      const json = await res.json();
      for (const expert of json.data ?? []) {
        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/experts/${expert.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  } catch {
    // sitemap generation continues without expert entries
  }

  return entries;
}
