import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import GDPRBanner from '../../components/GDPRBanner'

const ARTICLES = [
  {
    id: 'fr-1',
    slug: 'hotel-marrakech-pas-cher',
    title: 'Hôtel Marrakech pas cher : notre sélection 2026 — à partir de 28€/nuit',
    category: 'Guide',
    categoryColor: '#764ba2',
    keywords: ['hôtel marrakech pas cher', 'marrakech budget', 'hôtel marrakech prix'],
    excerpt: 'Marrakech n\'a pas à coûter cher. Notre équipe a sélectionné les meilleurs hôtels de la ville ocre pour tous les budgets, avec comparaison des prix en temps réel.',
    date: '8 Janvier 2026',
    readTime: '6 min',
    gradient: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    emoji: '🌹',
    tags: ['Marrakech', 'Maroc', 'Budget'],
  },
  {
    id: 'fr-2',
    slug: 'hotel-alger-centre',
    title: 'Hôtel Alger centre : les 8 meilleurs établissements en 2026',
    category: 'Algérie',
    categoryColor: '#27ae60',
    keywords: ['hôtel alger centre', 'hotel alger', 'algérie hôtel'],
    excerpt: 'Alger la blanche offre un patrimoine hôtelier exceptionnel. Du Sheraton El-Aurassi aux boutique-hôtels de Bab El Oued, découvrez les meilleures adresses du centre d\'Alger.',
    date: '5 Janvier 2026',
    readTime: '7 min',
    gradient: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
    emoji: '🇩🇿',
    tags: ['Alger', 'Algérie', 'Centre-ville'],
  },
  {
    id: 'fr-3',
    slug: 'hotel-tunis-bord-de-mer',
    title: 'Hôtel Tunis bord de mer : La Goulette, Gammarth, Sidi Bou Saïd',
    category: 'Tunisie',
    categoryColor: '#e74c3c',
    keywords: ['hôtel tunis bord de mer', 'hotel tunisie plage', 'gammarth hotel'],
    excerpt: 'Profitez des plus belles plages tunisiennes à quelques minutes de Tunis. Notre guide des hôtels bord de mer inclut les perles cachées de La Marsa et Gammarth.',
    date: '3 Janvier 2026',
    readTime: '5 min',
    gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    emoji: '🌊',
    tags: ['Tunis', 'Tunisie', 'Plage'],
  },
  {
    id: 'fr-4',
    slug: 'hotel-agadir-tout-inclus',
    title: 'Hôtel Agadir tout inclus : les meilleurs resorts famille 2026',
    category: 'Maroc',
    categoryColor: '#e67e22',
    keywords: ['hôtel Agadir tout inclus', 'agadir tout compris', 'resort agadir'],
    excerpt: 'Agadir est la capitale du tout-inclus au Maroc. Piscines, animation, plages de sable fin — notre sélection des meilleurs complexes hôteliers pour les familles françaises.',
    date: '28 Décembre 2025',
    readTime: '5 min',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFC72C 100%)',
    emoji: '🏖️',
    tags: ['Agadir', 'Maroc', 'Tout inclus'],
  },
  {
    id: 'fr-5',
    slug: 'sejour-halal-maroc',
    title: 'Séjour halal Maroc : guide complet pour familles musulmanes 2026',
    category: 'Halal',
    categoryColor: '#1a5276',
    keywords: ['séjour halal maroc', 'hotel halal maroc', 'maroc famille musulmane'],
    excerpt: 'Voyager halal au Maroc est plus simple qu\'on ne le pense. Restaurants certifiés, hôtels sans alcool, espaces mixtes séparés — notre guide 2026 pour les familles pratiquantes.',
    date: '20 Décembre 2025',
    readTime: '8 min',
    gradient: 'linear-gradient(135deg, #1a5276 0%, #2471a3 100%)',
    emoji: '🕌',
    tags: ['Halal', 'Maroc', 'Famille'],
  },
  {
    id: 'fr-6',
    slug: 'hotel-djerba-famille',
    title: 'Hôtel Djerba famille : les 10 meilleures adresses pour vos enfants',
    category: 'Famille',
    categoryColor: '#8e44ad',
    keywords: ['hôtel Djerba famille', 'djerba avec enfants', 'tunisie famille'],
    excerpt: 'Djerba est le paradis des vacances en famille. Clubs enfants, mini-clubs, piscines sécurisées et animations — notre sélection des meilleurs hôtels familiaux de l\'île.',
    date: '15 Décembre 2025',
    readTime: '6 min',
    gradient: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
    emoji: '👨‍👩‍👧‍👦',
    tags: ['Djerba', 'Tunisie', 'Famille'],
  },
]

const CATEGORIES = ['Tous', 'Guide', 'Algérie', 'Tunisie', 'Maroc', 'Halal', 'Famille']

export default function BlogFR() {
  const [activeCategory, setActiveCategory] = useState('Tous')

  const filtered = activeCategory === 'Tous'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory)

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', paddingTop: 64 }}>
      <GDPRBanner />
      <title>Blog EasyHotels France — Guides hôtels Maroc, Algérie, Tunisie</title>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 60%, #FF6B35 100%)', padding: '60px 24px 50px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
          📖 Guides & Conseils pour voyager au Maghreb
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, maxWidth: 600, margin: '0 auto 32px' }}>
          Articles SEO rédigés par nos experts pour vous aider à trouver le meilleur hôtel au meilleur prix
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: activeCategory === cat ? '#FF6B35' : 'rgba(255,255,255,0.2)',
                color: '#fff',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ARTICLES GRID */}
      <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
          {filtered.map(article => (
            <article
              key={article.id}
              style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.14)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
            >
              {/* Card Image */}
              <div style={{ height: 180, background: article.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ fontSize: 56 }}>{article.emoji}</span>
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span style={{ background: 'rgba(255,255,255,0.9)', color: article.categoryColor, fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 12 }}>
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {article.tags.map(tag => (
                    <span key={tag} style={{ background: '#F0F4F8', color: '#4a5568', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
                      #{tag}
                    </span>
                  ))}
                </div>

                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#2d3748', lineHeight: 1.45, marginBottom: 12 }}>
                  {article.title}
                </h2>

                <p style={{ color: '#718096', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                  {article.excerpt}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: '#a0aec0' }}>
                    <span>{article.date}</span>
                    <span style={{ margin: '0 6px' }}>·</span>
                    <span>⏱ {article.readTime}</span>
                  </div>
                  <Link
                    to={`/fr/blog/${article.slug}`}
                    style={{ background: '#FF6B35', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
                  >
                    Lire →
                  </Link>
                </div>

                {/* SEO keywords hint */}
                <div style={{ marginTop: 14, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: '#cbd5e0' }}>
                    🔍 {article.keywords.join(' · ')}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0f172a', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
          Prêt à réserver votre hôtel ?
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: 28 }}>Comparez les prix sur 50+ sites en quelques secondes</p>
        <Link to="/fr" style={{ display: 'inline-block', background: '#FF6B35', color: '#fff', padding: '14px 36px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Comparer les hôtels →
        </Link>
      </section>
    </div>
  )
}
