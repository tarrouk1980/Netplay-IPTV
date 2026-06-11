import React, { useEffect } from 'react'

const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Les 10 meilleurs hôtels de Marrakech pas cher en 2025',
  description: 'Comparez les prix des hôtels à Marrakech. Trouvez les meilleures offres à partir de 35€/nuit avec EasyHotels Maghreb.',
  author: { '@type': 'Organization', name: 'EasyHotels Maghreb' },
  publisher: {
    '@type': 'Organization',
    name: 'EasyHotels Maghreb',
    logo: { '@type': 'ImageObject', url: 'https://easyhotels.maghreb.com/logo.png' },
  },
  datePublished: '2025-03-15',
  dateModified: '2025-06-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://easyhotels.maghreb.com/fr/blog/hotels-marrakech-pas-cher-2025' },
  image: 'https://easyhotels.maghreb.com/images/marrakech-medina.jpg',
}

const HOTELS = [
  { rank: 1, name: 'Hôtel Atlas Asni', stars: 4, price: 42, highlight: 'Vue imprenable sur les montagnes de l\'Atlas' },
  { rank: 2, name: 'Riad Yasmine', stars: 4, price: 55, highlight: 'Piscine intérieure & hammam traditionnel' },
  { rank: 3, name: 'Hôtel Ibis Marrakech Centre', stars: 3, price: 38, highlight: 'Idéalement situé près de la place Djemaa el-Fna' },
  { rank: 4, name: 'Le Meridien N\'Fis', stars: 5, price: 95, highlight: 'Complexe luxueux avec spa 5 étoiles' },
  { rank: 5, name: 'Riad Dar Najat', stars: 3, price: 35, highlight: 'Riad authentique en pleine médina' },
  { rank: 6, name: 'Hôtel Farouk Marrakech', stars: 3, price: 40, highlight: 'Terrasse panoramique & petit-déjeuner inclus' },
  { rank: 7, name: 'Palais Ronsard Riad', stars: 4, price: 68, highlight: 'Architecture andalouse classique' },
  { rank: 8, name: 'Hôtel du Trésor', stars: 3, price: 45, highlight: 'Emplacement central, accès facile aux souks' },
  { rank: 9, name: 'La Sultana Marrakech', stars: 5, price: 120, highlight: 'Suite de luxe avec piscine privée' },
  { rank: 10, name: 'Hôtel Toulousain', stars: 2, price: 28, highlight: 'Meilleur rapport qualité-prix de la ville' },
]

const TOC = [
  { id: 'intro', label: 'Introduction' },
  { id: 'top10', label: 'Top 10 des hôtels pas chers' },
  { id: 'conseils', label: 'Conseils pour réserver' },
  { id: 'faq', label: 'FAQ' },
  { id: 'related', label: 'Articles connexes' },
]

const RELATED = [
  { title: 'Les 10 meilleurs hôtels de Casablanca en 2025', slug: 'hotels-casablanca-2025', dest: 'casablanca' },
  { title: 'Guide complet : Agadir pas cher en famille', slug: 'hotels-agadir-famille-2025', dest: 'agadir' },
  { title: 'Djerba : les offres flash de la semaine', slug: 'flash-deals-djerba', dest: 'djerba' },
]

function StarRating({ count }) {
  return <span style={{ color: '#F6C90E', marginLeft: 6 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
}

function CTAButton({ dest = 'marrakech', label = 'Comparer les prix →' }) {
  return (
    <a
      href={`/fr/buscar?destination=${dest}`}
      style={{
        display: 'inline-block',
        background: '#FF6B35',
        color: '#fff',
        padding: '12px 28px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 15,
        textDecoration: 'none',
        margin: '8px 0',
        transition: 'background 0.2s',
      }}
    >
      {label}
    </a>
  )
}

export default function BlogPostFR() {
  useEffect(() => {
    document.title = 'Hôtel Marrakech pas cher 2025 | EasyHotels Maghreb'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = 'Comparez les prix des hôtels à Marrakech. Trouvez les meilleures offres de 35€/nuit avec EasyHotels Maghreb.'

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = 'https://easyhotels.maghreb.com/fr/blog/hotels-marrakech-pas-cher-2025'

    let schema = document.getElementById('article-schema')
    if (!schema) { schema = document.createElement('script'); schema.id = 'article-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema) }
    schema.textContent = JSON.stringify(ARTICLE_SCHEMA)

    return () => { if (schema) schema.remove() }
  }, [])

  return (
    <div style={{ paddingTop: 64, fontFamily: "'Segoe UI', Arial, sans-serif", background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #c0392b 100%)', color: '#fff', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
            GUIDE 2025 · MAROC
          </span>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, margin: '16px 0 12px', lineHeight: 1.2 }}>
            Les 10 meilleurs hôtels de Marrakech pas cher en 2025
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, margin: 0, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            De 28€ à 120€/nuit — comparez, choisissez et économisez sur votre prochain séjour à la ville ocre.
          </p>
          <div style={{ marginTop: 20, fontSize: 13, opacity: 0.8 }}>
            Mis à jour le 1 juin 2025 · 8 min de lecture
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar Table of Contents */}
        <aside style={{
          width: 220, flexShrink: 0, background: '#fff', borderRadius: 12,
          padding: '20px 16px', position: 'sticky', top: 80, boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          display: 'none',
        }}
          className="toc-sidebar"
        >
          <strong style={{ fontSize: 13, textTransform: 'uppercase', color: '#718096', letterSpacing: 1 }}>Sommaire</strong>
          <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0 }}>
            {TOC.map((item) => (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <a href={`#${item.id}`} style={{ color: '#FF6B35', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <article style={{ flex: 1, minWidth: 0 }}>
          {/* Inline TOC for mobile */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 20px', marginBottom: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <strong style={{ fontSize: 13, textTransform: 'uppercase', color: '#718096', letterSpacing: 1 }}>Sommaire</strong>
            <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TOC.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} style={{ color: '#FF6B35', textDecoration: 'none', fontSize: 14, fontWeight: 500, background: '#fff3ee', padding: '4px 12px', borderRadius: 20, display: 'inline-block' }}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Introduction */}
          <section id="intro">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748', marginTop: 0 }}>
              Pourquoi Marrakech reste la destination idéale pour les voyageurs à petit budget ?
            </h2>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              Marrakech — surnommée la <strong>Ville Ocre</strong> — est l'une des destinations les plus prisées d'Afrique du Nord.
              Avec ses ruelles labyrinthiques, ses souks colorés, ses jardins luxuriants et sa cuisine épicée, elle offre une expérience culturelle
              unique. La bonne nouvelle ? Il n'est pas nécessaire de se ruiner pour y séjourner.
            </p>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              En 2025, le marché hôtelier marrakchi propose une gamme impressionnante d'hébergements, des riads authentiques en médina
              à <strong>partir de 28€/nuit</strong> aux établissements 5 étoiles avec piscine privée. Notre équipe a comparé plus de
              <strong> 200 établissements</strong> pour vous sélectionner les 10 meilleures options alliant confort et prix compétitifs.
            </p>
            <div style={{ background: '#fff3ee', borderLeft: '4px solid #FF6B35', padding: '14px 18px', borderRadius: 4, margin: '20px 0' }}>
              <strong>Bon à savoir :</strong> Les prix les plus bas s'obtiennent en réservant au moins 3 semaines à l'avance.
              Comparez toujours plusieurs plateformes — les écarts peuvent atteindre 30% pour le même hôtel.
            </div>
            <CTAButton dest="marrakech" label="Voir les offres disponibles à Marrakech →" />
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

          {/* Top 10 list */}
          <section id="top10">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748' }}>
              Top 10 des hôtels de Marrakech pas chers en 2025
            </h2>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              Notre classement tient compte du rapport qualité-prix, des avis clients récents (post-2024) et de la localisation.
              Les prix indiqués sont les tarifs minimaux par nuit observés en basse saison.
            </p>

            {HOTELS.map((hotel) => (
              <div
                key={hotel.rank}
                style={{
                  background: '#fff',
                  border: hotel.rank === 1 ? '2px solid #FF6B35' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '20px 22px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: hotel.rank === 1 ? '0 4px 16px rgba(255,107,53,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: hotel.rank === 1 ? '#FF6B35' : '#f7fafc',
                  color: hotel.rank === 1 ? '#fff' : '#718096',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 18, flexShrink: 0,
                }}>
                  {hotel.rank}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#2d3748' }}>{hotel.name}</h3>
                    <StarRating count={hotel.stars} />
                  </div>
                  <p style={{ margin: '4px 0 0', color: '#718096', fontSize: 14 }}>{hotel.highlight}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#FF6B35' }}>à partir de {hotel.price}€</div>
                  <div style={{ fontSize: 12, color: '#a0aec0' }}>par nuit</div>
                  <a
                    href={`/fr/buscar?destination=marrakech&hotel=${encodeURIComponent(hotel.name)}`}
                    style={{ display: 'inline-block', background: '#FF6B35', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none', marginTop: 6 }}
                  >
                    Voir l'offre
                  </a>
                </div>
              </div>
            ))}

            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <CTAButton dest="marrakech" label="Comparer tous les prix à Marrakech →" />
            </div>
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

          {/* Conseils */}
          <section id="conseils">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748' }}>
              Conseils pour réserver votre hôtel à Marrakech pas cher
            </h2>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#4a5568' }}>1. Choisir la bonne période</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              Les mois de <strong>novembre à mars</strong> (hors fêtes de fin d'année) constituent la basse saison touristique.
              Les températures restent agréables (15–22°C) et les prix peuvent être <strong>40% inférieurs</strong> à ceux du printemps.
              Évitez avril–mai et septembre–octobre, périodes de haute fréquentation européenne.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#4a5568' }}>2. Médina vs. Guéliz : où loger ?</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              La <strong>médina</strong> offre une immersion culturelle totale avec ses riads traditionnels, mais les ruelles
              peuvent être difficiles d'accès avec des bagages. Le quartier moderne de <strong>Guéliz</strong> propose des hôtels
              de chaîne plus accessibles en voiture, souvent moins chers et avec parking.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#4a5568' }}>3. Utiliser un comparateur de prix</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              Ne réservez jamais sur une seule plateforme. EasyHotels Maghreb compare en temps réel les tarifs de Booking.com,
              Expedia, Hotels.com et les sites officiels des hôtels pour garantir le meilleur prix disponible.
            </p>

            <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 8, padding: '14px 18px', margin: '20px 0' }}>
              <strong style={{ color: '#276749' }}>Astuce pro :</strong>
              <span style={{ color: '#2f855a', marginLeft: 6 }}>
                Activez les alertes prix sur notre application pour être notifié dès qu'un hôtel de votre liste de souhaits baisse de prix.
              </span>
            </div>
            <CTAButton dest="marrakech" label="Activer une alerte prix pour Marrakech →" />
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

          {/* FAQ */}
          <section id="faq">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748' }}>Questions fréquentes</h2>

            {[
              {
                q: 'Quel est le prix moyen d\'un hôtel à Marrakech ?',
                a: 'En 2025, le prix moyen d\'une nuit à Marrakech est d\'environ 65€ pour un 3 étoiles et 120€ pour un 4 étoiles. Les riads en médina peuvent aller de 35€ à plus de 300€ selon le standing.',
              },
              {
                q: 'Est-il sûr de payer en ligne pour un hôtel au Maroc ?',
                a: 'Oui, les grandes plateformes comme Booking.com, Expedia et EasyHotels utilisent le protocole SSL et des systèmes de paiement sécurisés. Vous êtes protégé par la politique de remboursement de la plateforme.',
              },
              {
                q: 'Quelle est la politique d\'annulation habituelle ?',
                a: 'La plupart des hôtels proposent une annulation gratuite jusqu\'à 24–48h avant l\'arrivée. Vérifiez toujours les conditions avant de confirmer. EasyHotels affiche clairement le type d\'annulation pour chaque offre.',
              },
            ].map(({ q, a }, i) => (
              <details key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', marginBottom: 10 }}>
                <summary style={{ fontWeight: 700, color: '#2d3748', cursor: 'pointer', fontSize: 15 }}>{q}</summary>
                <p style={{ color: '#4a5568', marginTop: 10, marginBottom: 0, lineHeight: 1.7, fontSize: 15 }}>{a}</p>
              </details>
            ))}
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

          {/* Conclusion CTA */}
          <div style={{ background: 'linear-gradient(135deg, #FF6B35, #c0392b)', borderRadius: 16, padding: '28px 24px', textAlign: 'center', color: '#fff', margin: '0 0 40px' }}>
            <h3 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 20 }}>Prêt à réserver votre hôtel à Marrakech ?</h3>
            <p style={{ margin: '0 0 16px', opacity: 0.9, fontSize: 15 }}>
              Comparez plus de 200 hôtels en un seul clic. Garantie du meilleur prix.
            </p>
            <a
              href="/fr/buscar?destination=marrakech"
              style={{ display: 'inline-block', background: '#fff', color: '#FF6B35', padding: '13px 32px', borderRadius: 8, fontWeight: 900, fontSize: 16, textDecoration: 'none' }}
            >
              Comparer les prix →
            </a>
          </div>

          {/* Related articles */}
          <section id="related">
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2d3748' }}>Articles connexes</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {RELATED.map((art) => (
                <a
                  key={art.slug}
                  href={`/fr/blog/${art.slug}`}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 16px', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' }}
                >
                  <div style={{ fontSize: 13, color: '#FF6B35', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                    {art.dest.charAt(0).toUpperCase() + art.dest.slice(1)}
                  </div>
                  <div style={{ color: '#2d3748', fontWeight: 600, fontSize: 15, lineHeight: 1.4 }}>{art.title}</div>
                  <div style={{ color: '#FF6B35', fontWeight: 700, fontSize: 13, marginTop: 10 }}>Lire l'article →</div>
                </a>
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  )
}
