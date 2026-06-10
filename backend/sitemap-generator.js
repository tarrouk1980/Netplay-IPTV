'use strict';
const { MOCK_HOTELS, POPULAR_DESTINATIONS } = require('./src/services/hotelService');
const fs = require('fs');

function generateSitemap(baseUrl = 'https://easyhotels.tn') {
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/offres-flash', priority: '0.9', changefreq: 'hourly' },
    { url: '/blog', priority: '0.8', changefreq: 'weekly' },
    { url: '/hoteliers', priority: '0.7', changefreq: 'monthly' },
  ];

  const hotelPages = MOCK_HOTELS.map(h => ({
    url: `/hotel/${h.slug}`,
    priority: h.isFeatured ? '0.9' : '0.7',
    changefreq: 'daily',
  }));

  const destPages = POPULAR_DESTINATIONS.map(d => ({
    url: `/hotels/${d.city.toLowerCase().replace(/\s+/g,'-')}`,
    priority: '0.8',
    changefreq: 'daily',
  }));

  const blogPages = [
    { url: '/blog/meilleurs-hotels-djerba-2026', priority: '0.8', changefreq: 'weekly' },
    { url: '/blog/hotels-halal-tunisie', priority: '0.8', changefreq: 'weekly' },
    { url: '/blog/comparer-prix-hotels-maroc', priority: '0.8', changefreq: 'weekly' },
    { url: '/blog/sharm-el-sheikh-hurghada', priority: '0.7', changefreq: 'weekly' },
    { url: '/blog/hotels-mauritanie-desert', priority: '0.7', changefreq: 'monthly' },
    { url: '/blog/ramadan-2026-hotels', priority: '0.9', changefreq: 'weekly' },
  ];

  const allPages = [...staticPages, ...hotelPages, ...destPages, ...blogPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('./sitemap.xml', xml);
  console.log(`✅ Sitemap generated: ${allPages.length} URLs`);
  return xml;
}

// Also generate robots.txt
function generateRobots(baseUrl = 'https://easyhotels.tn') {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml

# EasyHotels Maghreb - Le Comparateur de Prix Hôtels d'Afrique du Nord`;
  fs.writeFileSync('./robots.txt', robots);
  console.log('✅ robots.txt generated');
}

generateSitemap();
generateRobots();
