import React, { useEffect } from 'react';

// SEO helper: update document head
function useSEO({ title, description, canonical, ogImage }) {
  useEffect(() => {
    document.title = title;
    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', description);
    setMeta('robots', 'index, follow');
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'article', true);
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
      link.setAttribute('href', canonical);
    }
    if (ogImage) setMeta('og:image', ogImage, true);
  }, [title, description, canonical, ogImage]);
}

// Article data
const ARTICLES = {
  'meilleurs-hotels-djerba-2026': {
    title: 'Les 10 meilleurs hôtels à Djerba en 2026',
    metaDescription: 'Découvrez notre sélection des 10 meilleurs hôtels à Djerba pour 2026 : adresses de charme, complexes balnéaires 5 étoiles et hébergements familiaux avec les meilleurs prix garantis.',
    canonical: 'https://easyhotels.tn/blog/meilleurs-hotels-djerba-2026',
    ogImage: 'https://easyhotels.tn/images/blog/djerba-2026.jpg',
    author: 'Équipe EasyHotels',
    publishDate: '2026-01-15',
    readTime: '8 min',
    category: 'Guides de voyage',
    content: [
      {
        type: 'intro',
        text: `Djerba, surnommée "l'île des rêves", est la destination touristique la plus prisée de Tunisie. Avec ses plages de sable blanc, ses ruelles de la médina et son architecture blanche typique, l'île attire chaque année des millions de visiteurs du monde entier. Pour vous aider à choisir le meilleur hébergement, notre équipe a sélectionné les 10 meilleurs hôtels à Djerba pour 2026, répartis sur tous les budgets.`,
      },
      {
        type: 'h2',
        text: '1. The Residence Tunis by Cenizaro – Le luxe absolu à Djerba',
      },
      {
        type: 'paragraph',
        text: `Niché sur la plage de La Seguia, The Residence Tunis est l'adresse la plus exclusive de l'île. Ses 170 suites et villas avec piscine privée offrent une vue imprenable sur la mer Méditerranée. Le spa primé propose des soins inspirés des traditions tunisiennes, tandis que le restaurant gastronomique régale les palais avec une cuisine de la mer et des spécialités locales revisitées.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Étoiles', value: '5 étoiles' },
          { label: 'Prix moyen', value: 'À partir de 480 TND / nuit' },
          { label: 'Plage', value: 'Plage privée' },
          { label: 'Piscines', value: '3 piscines dont 1 adultes' },
          { label: 'Idéal pour', value: 'Lune de miel, séjour de luxe' },
        ],
      },
      {
        type: 'h2',
        text: '2. Hasdrubal Thalassa & Spa Djerba – Thalasso et bien-être',
      },
      {
        type: 'paragraph',
        text: `L'Hasdrubal Thalassa est la référence du tourisme de santé à Djerba. Son centre de thalassothérapie de 3 000 m² propose plus de 50 soins à base d'eau de mer. L'architecture inspirée des médinas tunisiennes crée une atmosphère unique entre authenticité et modernité. Ses 290 chambres spacieuses donnent sur les jardins ou la mer.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Étoiles', value: '5 étoiles' },
          { label: 'Prix moyen', value: 'À partir de 320 TND / nuit' },
          { label: 'Spécialité', value: 'Thalassothérapie & Spa' },
          { label: 'Piscines', value: '4 piscines (dont eau de mer chauffée)' },
          { label: 'Idéal pour', value: 'Cure bien-être, familles' },
        ],
      },
      {
        type: 'h2',
        text: '3. Radisson Blu Palace Resort & Thalasso Djerba',
      },
      {
        type: 'paragraph',
        text: `L'un des complexes hôteliers les plus vastes de Djerba avec ses 400 chambres et suites. Le Radisson Blu Palace se distingue par son architecture palatiale inspirée des palais arabes et ses animations all-inclusive de qualité. Son club pour enfants et ses nombreuses activités en font l'hôtel idéal pour les familles.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Étoiles', value: '5 étoiles' },
          { label: 'Prix moyen', value: 'À partir de 285 TND / nuit' },
          { label: 'Formule', value: 'All inclusive disponible' },
          { label: 'Activités', value: 'Sports nautiques, mini-club, tennis' },
          { label: 'Idéal pour', value: 'Familles avec enfants' },
        ],
      },
      {
        type: 'h2',
        text: '4. Djerba Plaza Hotel & Spa',
      },
      {
        type: 'paragraph',
        text: `Situé à deux pas du centre de Houmt Souk, le Djerba Plaza est l'hôtel de choix pour ceux qui souhaitent allier confort et découverte culturelle. Son spa propose des hammams traditionnels et des massages aromatiques. La piscine panoramique offre une vue spectaculaire sur la médina.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Étoiles', value: '4 étoiles' },
          { label: 'Prix moyen', value: 'À partir de 195 TND / nuit' },
          { label: 'Localisation', value: 'Centre de Houmt Souk' },
          { label: 'Transport', value: 'Navette aéroport incluse' },
          { label: 'Idéal pour', value: 'Tourisme culturel, couples' },
        ],
      },
      {
        type: 'h2',
        text: '5. El Mouradi Djerba Menzel – Le charme berbère',
      },
      {
        type: 'paragraph',
        text: `Le El Mouradi Menzel est une véritable oasis de tranquillité. Son architecture reprend les codes des villages berbères avec ses maisons blanchies à la chaux et ses patios fleuris. Les 200 bungalows avec terrasse privée permettent de profiter du calme de l'île tout en bénéficiant de tous les services d'un 4 étoiles.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Étoiles', value: '4 étoiles' },
          { label: 'Prix moyen', value: 'À partir de 165 TND / nuit' },
          { label: 'Architecture', value: 'Style village berbère' },
          { label: 'Plage', value: 'Accès plage à 200m' },
          { label: 'Idéal pour', value: 'Détente, couples, seniors' },
        ],
      },
      {
        type: 'h2',
        text: '6. Hôtel Ulysse Palace & Thalasso',
      },
      {
        type: 'paragraph',
        text: `L'Ulysse Palace rend hommage au mythe d'Ulysse, qui selon la légende séjourna à Djerba. Cet hôtel 4 étoiles propose un excellent rapport qualité-prix avec son centre de thalasso, ses 3 piscines et sa plage privée. La cuisine proposée au restaurant panoramique est une invitation aux saveurs méditerranéennes.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Étoiles', value: '4 étoiles' },
          { label: 'Prix moyen', value: 'À partir de 145 TND / nuit' },
          { label: 'Formule', value: 'Demi-pension ou all-inclusive' },
          { label: 'Thalasso', value: 'Centre de thalasso inclus' },
          { label: 'Idéal pour', value: 'Rapport qualité-prix, familles' },
        ],
      },
      {
        type: 'h2',
        text: '7. Club Med Djerba la Douce',
      },
      {
        type: 'paragraph',
        text: `Club Med Djerba la Douce est la référence des villages vacances pour familles. Son concept tout compris premium inclut les repas gastronomiques, les activités sportives (voile, planche à voile, tennis, fitness), les animations et même les cours pour enfants. Un séjour sans surprise et sans stress.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Étoiles', value: '4 tridents (équivalent 4 étoiles)' },
          { label: 'Prix moyen', value: 'À partir de 350 EUR / nuit (tout compris)' },
          { label: 'Formule', value: 'Tout compris premium' },
          { label: 'Sports', value: '+30 activités sportives' },
          { label: 'Idéal pour', value: 'Familles sportives, groupes' },
        ],
      },
      {
        type: 'h2',
        text: '8. Hotel Dar Dhiafa – Maison d\'hôtes de charme',
      },
      {
        type: 'paragraph',
        text: `Pour une expérience authentique loin des grands complexes touristiques, le Dar Dhiafa est une perle rare. Cette maison d'hôtes de charme installée dans une demeure traditionnelle du XVIIIe siècle propose seulement 24 chambres, toutes décorées avec des objets artisanaux tunisiens. La cuisine du chef est réputée comme l'une des meilleures de l'île.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Catégorie', value: 'Maison d\'hôtes boutique' },
          { label: 'Prix moyen', value: 'À partir de 180 TND / nuit' },
          { label: 'Chambres', value: '24 chambres uniques' },
          { label: 'Cuisine', value: 'Restaurant gastronomique tunisien' },
          { label: 'Idéal pour', value: 'Voyage authentique, gourmets' },
        ],
      },
      {
        type: 'h2',
        text: '9. Lella Baya Hotel – Vue mer garantie',
      },
      {
        type: 'paragraph',
        text: `Le Lella Baya Hotel est l'un des rares hôtels 3 étoiles de Djerba à offrir une plage privée directement accessible depuis les chambres. Sa situation en bord de mer et ses prix abordables en font l'un des meilleurs rapports qualité-prix de l'île. Idéal pour les voyageurs qui souhaitent profiter de la mer sans se ruiner.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Étoiles', value: '3 étoiles' },
          { label: 'Prix moyen', value: 'À partir de 85 TND / nuit' },
          { label: 'Point fort', value: 'Plage privée directe' },
          { label: 'Restauration', value: 'Buffet varié, bar à cocktails' },
          { label: 'Idéal pour', value: 'Budget maîtrisé, jeunes voyageurs' },
        ],
      },
      {
        type: 'h2',
        text: '10. Hôtel Sidi Slim – Authenticité et simplicité',
      },
      {
        type: 'paragraph',
        text: `Le Sidi Slim est un hôtel familial géré par des Djerbiens depuis trois générations. Son architecture typique, ses chambres décorées à la main et son accueil chaleureux lui valent des avis enthousiastes sur toutes les plateformes. Son restaurant sert les recettes traditionnelles de l'île : poulpe grillé, brik à l'œuf et couscous au poisson.`,
      },
      {
        type: 'details',
        items: [
          { label: 'Étoiles', value: '3 étoiles' },
          { label: 'Prix moyen', value: 'À partir de 70 TND / nuit' },
          { label: 'Ambiance', value: 'Familial et authentique' },
          { label: 'Cuisine', value: 'Spécialités djerbienne traditionnelles' },
          { label: 'Idéal pour', value: 'Voyageurs curieux, immersion culturelle' },
        ],
      },
      {
        type: 'h2',
        text: 'Comment choisir son hôtel à Djerba ?',
      },
      {
        type: 'paragraph',
        text: `Le choix de l'hôtel dépend principalement de votre budget, de la période de l'année et du type de séjour souhaité. Voici quelques conseils pratiques :`,
      },
      {
        type: 'tips',
        items: [
          'Haute saison (juillet-août) : réservez 2 à 3 mois à l\'avance. Les prix augmentent de 40 à 60% par rapport à la basse saison.',
          'Basse saison (novembre-mars) : excellentes affaires disponibles. Certains hôtels offrent des réductions allant jusqu\'à 50%.',
          'Familles avec enfants : privilégiez les hôtels avec mini-club et animations (Radisson Blu, El Mouradi).',
          'Lune de miel : The Residence ou Hasdrubal Thalassa pour une expérience inoubliable.',
          'Budget serré : Lella Baya ou Sidi Slim offrent une expérience authentique à prix doux.',
          'Comparez toujours les prix sur EasyHotels : nous agrégeons les offres de Booking.com, Expedia et Hotels.com pour vous garantir le meilleur tarif.',
        ],
      },
      {
        type: 'h2',
        text: 'Meilleure période pour visiter Djerba',
      },
      {
        type: 'paragraph',
        text: `La meilleure période pour visiter Djerba est le printemps (avril-juin) et l'automne (septembre-octobre). Le climat est agréable, les plages ne sont pas encore bondées et les prix sont modérés. L'été est la période la plus animée mais aussi la plus chère. En hiver, certains hôtels ferment mais ceux qui restent ouverts proposent d'excellentes promotions.`,
      },
      {
        type: 'conclusion',
        text: `Djerba reste l'une des destinations méditerranéennes les plus accessibles et les plus dépaysantes. Que vous soyez à la recherche d'un luxe absolu au The Residence ou d'une immersion authentique au Dar Dhiafa, l'île vous réserve des souvenirs inoubliables. Utilisez EasyHotels pour comparer les prix en temps réel et bénéficier des meilleures offres garanties.`,
      },
    ],
  },
};

export default function BlogPostPage({ slug = 'meilleurs-hotels-djerba-2026' }) {
  const article = ARTICLES[slug] || ARTICLES['meilleurs-hotels-djerba-2026'];

  useSEO({
    title: `${article.title} | EasyHotels`,
    description: article.metaDescription,
    canonical: article.canonical,
    ogImage: article.ogImage,
  });

  const renderBlock = (block, idx) => {
    switch (block.type) {
      case 'intro':
        return (
          <p key={idx} className="blog-intro">
            {block.text}
          </p>
        );
      case 'h2':
        return (
          <h2 key={idx} className="blog-h2">
            {block.text}
          </h2>
        );
      case 'paragraph':
        return (
          <p key={idx} className="blog-paragraph">
            {block.text}
          </p>
        );
      case 'details':
        return (
          <div key={idx} className="blog-details-box">
            {block.items.map((item, i) => (
              <div key={i} className="blog-detail-row">
                <span className="blog-detail-label">{item.label} :</span>
                <span className="blog-detail-value">{item.value}</span>
              </div>
            ))}
          </div>
        );
      case 'tips':
        return (
          <ul key={idx} className="blog-tips-list">
            {block.items.map((tip, i) => (
              <li key={i} className="blog-tip-item">
                {tip}
              </li>
            ))}
          </ul>
        );
      case 'conclusion':
        return (
          <div key={idx} className="blog-conclusion">
            <p>{block.text}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="blog-post-page" itemScope itemType="https://schema.org/Article">
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.metaDescription,
            author: { '@type': 'Organization', name: article.author },
            publisher: {
              '@type': 'Organization',
              name: 'EasyHotels',
              logo: { '@type': 'ImageObject', url: 'https://easyhotels.tn/logo.png' },
            },
            datePublished: article.publishDate,
            dateModified: article.publishDate,
            image: article.ogImage,
            url: article.canonical,
            mainEntityOfPage: { '@type': 'WebPage', '@id': article.canonical },
          }),
        }}
      />

      <div className="blog-post-container">
        {/* Breadcrumb */}
        <nav className="blog-breadcrumb" aria-label="Breadcrumb">
          <ol itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <a href="/" itemProp="item"><span itemProp="name">Accueil</span></a>
              <meta itemProp="position" content="1" />
            </li>
            <span className="breadcrumb-sep"> / </span>
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <a href="/blog" itemProp="item"><span itemProp="name">Blog</span></a>
              <meta itemProp="position" content="2" />
            </li>
            <span className="breadcrumb-sep"> / </span>
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <span itemProp="name">{article.title}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        {/* Article header */}
        <header className="blog-post-header">
          <div className="blog-post-meta">
            <span className="blog-category">{article.category}</span>
            <span className="blog-dot">·</span>
            <time dateTime={article.publishDate} itemProp="datePublished">
              {new Date(article.publishDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span className="blog-dot">·</span>
            <span className="blog-read-time">{article.readTime} de lecture</span>
          </div>

          <h1 className="blog-post-title" itemProp="headline">
            {article.title}
          </h1>

          <p className="blog-post-description" itemProp="description">
            {article.metaDescription}
          </p>

          <div className="blog-post-author" itemProp="author" itemScope itemType="https://schema.org/Organization">
            <span>Par</span>
            <strong itemProp="name">{article.author}</strong>
          </div>
        </header>

        {/* Hero image placeholder */}
        <div className="blog-hero-image" role="img" aria-label="Vue aérienne de Djerba avec ses plages et hôtels en bord de mer">
          <div className="blog-hero-placeholder">
            <span>Djerba — Vue aérienne 2026</span>
          </div>
        </div>

        {/* Table of contents */}
        <aside className="blog-toc">
          <h3 className="blog-toc-title">Sommaire</h3>
          <ol className="blog-toc-list">
            {article.content
              .filter(b => b.type === 'h2')
              .map((b, i) => (
                <li key={i}>
                  <a href={`#section-${i}`}>{b.text}</a>
                </li>
              ))}
          </ol>
        </aside>

        {/* Article body */}
        <article className="blog-post-body" itemProp="articleBody">
          {article.content.map((block, idx) => renderBlock(block, idx))}
        </article>

        {/* CTA */}
        <div className="blog-post-cta">
          <h3>Prêt à réserver votre hôtel à Djerba ?</h3>
          <p>Comparez les prix en temps réel sur EasyHotels et économisez jusqu'à 40% sur votre prochaine réservation.</p>
          <a href="/search?destination=Djerba" className="blog-cta-button">
            Comparer les prix maintenant
          </a>
        </div>

        {/* Related articles */}
        <section className="blog-related">
          <h3 className="blog-related-title">Articles similaires</h3>
          <div className="blog-related-grid">
            {[
              { slug: 'meilleurs-hotels-hammamet', title: 'Les 8 meilleurs hôtels à Hammamet', dest: 'Hammamet' },
              { slug: 'meilleurs-hotels-marrakech', title: 'Les 10 meilleurs riads et hôtels à Marrakech', dest: 'Marrakech' },
              { slug: 'guide-hurghada-hotels', title: 'Guide hôtels Hurghada : notre sélection 2026', dest: 'Hurghada' },
            ].map(rel => (
              <a key={rel.slug} href={`/blog/${rel.slug}`} className="blog-related-card">
                <div className="blog-related-img-placeholder" aria-label={`Photo ${rel.dest}`}>{rel.dest}</div>
                <span className="blog-related-card-title">{rel.title}</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .blog-post-page { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c; line-height: 1.7; }
        .blog-post-container { max-width: 860px; margin: 0 auto; padding: 0 1.5rem 4rem; }
        .blog-breadcrumb { font-size: 0.85rem; color: #718096; margin: 1.5rem 0; }
        .blog-breadcrumb a { color: #4a90d9; text-decoration: none; }
        .breadcrumb-sep { margin: 0 0.4rem; color: #cbd5e0; }
        .blog-post-header { margin: 2rem 0; }
        .blog-post-meta { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; color: #718096; margin-bottom: 1rem; flex-wrap: wrap; }
        .blog-category { background: #ebf4ff; color: #2b6cb0; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .blog-dot { color: #cbd5e0; }
        .blog-post-title { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; color: #1a202c; line-height: 1.25; margin-bottom: 1rem; }
        .blog-post-description { font-size: 1.1rem; color: #4a5568; margin-bottom: 1.2rem; font-style: italic; }
        .blog-post-author { font-size: 0.9rem; color: #718096; }
        .blog-post-author strong { color: #2d3748; margin-left: 0.3rem; }
        .blog-hero-image { width: 100%; height: 360px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin: 2rem 0; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .blog-hero-placeholder { color: white; font-size: 1.2rem; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .blog-toc { background: #f7fafc; border-left: 4px solid #4a90d9; border-radius: 8px; padding: 1.2rem 1.5rem; margin: 2rem 0; }
        .blog-toc-title { font-size: 1rem; font-weight: 700; color: #2d3748; margin-bottom: 0.8rem; }
        .blog-toc-list { margin: 0; padding-left: 1.2rem; }
        .blog-toc-list li { margin-bottom: 0.4rem; }
        .blog-toc-list a { color: #4a90d9; text-decoration: none; font-size: 0.92rem; }
        .blog-toc-list a:hover { text-decoration: underline; }
        .blog-post-body { margin-top: 2rem; }
        .blog-intro { font-size: 1.1rem; color: #4a5568; margin-bottom: 2rem; background: #ebf4ff; padding: 1.2rem 1.5rem; border-radius: 8px; }
        .blog-h2 { font-size: 1.5rem; font-weight: 700; color: #1a202c; margin: 2.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0; }
        .blog-paragraph { color: #4a5568; margin-bottom: 1.2rem; }
        .blog-details-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.2rem; margin: 1rem 0 1.5rem; }
        .blog-detail-row { display: flex; gap: 0.5rem; padding: 0.3rem 0; border-bottom: 1px solid #edf2f7; font-size: 0.92rem; }
        .blog-detail-row:last-child { border-bottom: none; }
        .blog-detail-label { font-weight: 600; color: #2d3748; min-width: 100px; }
        .blog-detail-value { color: #4a5568; }
        .blog-tips-list { background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 1rem 1rem 1rem 2rem; margin: 1rem 0; }
        .blog-tip-item { color: #276749; margin-bottom: 0.6rem; font-size: 0.95rem; }
        .blog-conclusion { background: linear-gradient(135deg, #667eea15, #764ba215); border-radius: 12px; padding: 1.5rem; margin-top: 2rem; border: 1px solid #667eea30; }
        .blog-conclusion p { color: #2d3748; font-size: 1rem; margin: 0; }
        .blog-post-cta { text-align: center; background: linear-gradient(135deg, #4a90d9, #7c3aed); color: white; border-radius: 16px; padding: 2.5rem 2rem; margin: 3rem 0; }
        .blog-post-cta h3 { font-size: 1.5rem; margin-bottom: 0.8rem; }
        .blog-post-cta p { margin-bottom: 1.5rem; opacity: 0.9; }
        .blog-cta-button { display: inline-block; background: white; color: #4a90d9; font-weight: 700; padding: 0.8rem 2rem; border-radius: 50px; text-decoration: none; font-size: 1rem; transition: transform 0.2s, box-shadow 0.2s; }
        .blog-cta-button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
        .blog-related { margin-top: 3rem; }
        .blog-related-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 1.2rem; }
        .blog-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .blog-related-card { text-decoration: none; color: inherit; background: white; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
        .blog-related-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .blog-related-img-placeholder { height: 120px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
        .blog-related-card-title { font-size: 0.9rem; font-weight: 600; color: #2d3748; padding: 0.8rem; }
        @media (max-width: 640px) {
          .blog-post-container { padding: 0 1rem 3rem; }
          .blog-hero-image { height: 220px; }
          .blog-related-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
