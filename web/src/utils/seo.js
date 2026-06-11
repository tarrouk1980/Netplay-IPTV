/**
 * SEO utility functions for EasyHotels Maghreb
 */

export const CANONICAL_BASE = 'https://easyhotels.maghreb.com'

const SUPPORTED_LANGS = ['fr', 'es', 'be', 'it', 'de']

const LANG_LOCALE_MAP = {
  fr: 'fr-FR',
  es: 'es-ES',
  be: 'fr-BE',
  it: 'it-IT',
  de: 'de-DE',
}

/**
 * Generate a full XML sitemap string for all app routes and all languages.
 * @returns {string} XML sitemap
 */
export function generateSitemap() {
  const now = new Date().toISOString().split('T')[0]

  const routes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/flash-deals', priority: '0.9', changefreq: 'daily' },
    { path: '/blog', priority: '0.7', changefreq: 'weekly' },
    // Spanish
    { path: '/es', priority: '1.0', changefreq: 'daily' },
    { path: '/es/buscar', priority: '0.9', changefreq: 'daily' },
    { path: '/es/blog', priority: '0.7', changefreq: 'weekly' },
    // French
    { path: '/fr', priority: '1.0', changefreq: 'daily' },
    { path: '/fr/blog', priority: '0.7', changefreq: 'weekly' },
    // Other EU languages
    { path: '/be', priority: '1.0', changefreq: 'daily' },
    { path: '/it', priority: '1.0', changefreq: 'daily' },
    { path: '/de', priority: '1.0', changefreq: 'daily' },
  ]

  const destinations = [
    'marrakech', 'casablanca', 'tunis', 'alger', 'djerba',
    'agadir', 'oran', 'sfax', 'fes', 'hurghada',
  ]

  destinations.forEach((dest) => {
    routes.push({ path: `/hotels/${dest}`, priority: '0.8', changefreq: 'daily' })
    SUPPORTED_LANGS.forEach((lang) => {
      routes.push({ path: `/${lang}/hotels/${dest}`, priority: '0.8', changefreq: 'daily' })
    })
  })

  const urlEntries = routes
    .map(
      ({ path, priority, changefreq }) => `
  <url>
    <loc>${CANONICAL_BASE}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`
}

/**
 * Generate hreflang link tags for a given path.
 * @param {string} path - e.g. '/hotel/marrakech-riad'
 * @returns {Array<{lang: string, url: string}>}
 */
export function generateHreflang(path) {
  const tags = SUPPORTED_LANGS.map((lang) => ({
    lang: LANG_LOCALE_MAP[lang],
    url: `${CANONICAL_BASE}/${lang}${path}`,
  }))
  // Add x-default pointing to the root (French/Arabic default)
  tags.push({ lang: 'x-default', url: `${CANONICAL_BASE}${path}` })
  return tags
}

/**
 * Generate JSON-LD BreadcrumbList schema.
 * @param {Array<{name: string, url: string}>} items
 * @returns {string} JSON-LD script tag string
 */
export function generateBreadcrumbs(items) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${CANONICAL_BASE}${item.url}`,
    })),
  }
  return JSON.stringify(schema, null, 2)
}

/**
 * Generate JSON-LD Hotel schema for a hotel detail page.
 * @param {Object} hotel
 * @param {string} hotel.name
 * @param {string} hotel.description
 * @param {string} hotel.image
 * @param {number} hotel.starRating
 * @param {number} hotel.ratingValue
 * @param {number} hotel.reviewCount
 * @param {number} hotel.priceFrom  - lowest price in EUR
 * @param {string} hotel.city
 * @param {string} hotel.country
 * @param {string} hotel.address
 * @param {string} hotel.url
 * @returns {string} JSON-LD string
 */
export function generateHotelSchema(hotel) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: hotel.description,
    image: hotel.image,
    starRating: {
      '@type': 'Rating',
      ratingValue: hotel.starRating,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: hotel.ratingValue,
      reviewCount: hotel.reviewCount,
    },
    priceRange: `€${hotel.priceFrom}+`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.address,
      addressLocality: hotel.city,
      addressCountry: hotel.country,
    },
    url: hotel.url ? (hotel.url.startsWith('http') ? hotel.url : `${CANONICAL_BASE}${hotel.url}`) : undefined,
  }
  return JSON.stringify(schema, null, 2)
}

/**
 * Generate JSON-LD FAQPage schema.
 * @param {Array<{question: string, answer: string}>} faqs
 * @returns {string} JSON-LD string
 */
export function generateFAQSchema(faqs) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
  return JSON.stringify(schema, null, 2)
}
