import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ARTICLES = [
  {
    id: 1,
    title: 'Les 10 meilleurs hôtels à Djerba en 2026',
    category: 'Guide',
    categoryColor: '#004E89',
    excerpt: 'Djerba, l\'île des rêves tunisienne, regorge d\'établissements hôteliers exceptionnels. Notre équipe a sélectionné les 10 meilleurs pour vous offrir une expérience inoubliable.',
    date: '12 Janvier 2026',
    readTime: '5 min',
    author: 'Sana Belhadj',
    gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)',
    emoji: '🏝️',
    tags: ['Djerba', 'Tunisie', 'Plage'],
  },
  {
    id: 2,
    title: 'Hôtels halal en Tunisie : notre guide complet 2026',
    category: 'Halal',
    categoryColor: '#276749',
    excerpt: 'Vous cherchez un hébergement conforme à vos valeurs islamiques ? Découvrez notre sélection d\'hôtels halal certifiés en Tunisie : sans alcool, cuisine halal, piscines séparées.',
    date: '8 Janvier 2026',
    readTime: '7 min',
    author: 'Ahmed Mansour',
    gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    emoji: '🌙',
    tags: ['Halal', 'Tunisie', 'Famille'],
  },
  {
    id: 3,
    title: 'Comparer les prix hôtels Maroc : astuces et bons plans 2026',
    category: 'Astuces',
    categoryColor: '#744210',
    excerpt: 'Le Maroc propose une offre hôtelière incroyablement variée. Apprenez à comparer les prix efficacement et économisez jusqu\'à 60% sur votre séjour marocain.',
    date: '5 Janvier 2026',
    readTime: '4 min',
    author: 'Leila Chraibi',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #e55a24 100%)',
    emoji: '🇲🇦',
    tags: ['Maroc', 'Comparaison', 'Économies'],
  },
  {
    id: 4,
    title: 'Sharm El Sheikh ou Hurghada : lequel choisir pour vos vacances ?',
    category: 'Comparatif',
    categoryColor: '#2c5282',
    excerpt: 'Deux destinations égyptiennes de rêve, mais des expériences très différentes. Mer Rouge, coraux, animation... On compare tout pour vous aider à choisir.',
    date: '2 Janvier 2026',
    readTime: '6 min',
    author: 'Omar Farouk',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    emoji: '🤿',
    tags: ['Égypte', 'Mer Rouge', 'Plongée'],
  },
  {
    id: 5,
    title: 'Hôtels en Mauritanie : l\'aventure désert et authenticité',
    category: 'Aventure',
    categoryColor: '#744210',
    excerpt: 'La Mauritanie s\'ouvre au tourisme avec des hôtels authentiques au cœur du Sahara. Découvrez des adresses rares pour une expérience nomade unique en Afrique.',
    date: '28 Décembre 2025',
    readTime: '8 min',
    author: 'Fatimata Diallo',
    gradient: 'linear-gradient(135deg, #FFC72C 0%, #FF6B35 100%)',
    emoji: '🏜️',
    tags: ['Mauritanie', 'Désert', 'Aventure'],
  },
  {
    id: 6,
    title: 'Ramadan 2026 : les meilleurs hôtels avec services spéciaux',
    category: 'Ramadan',
    categoryColor: '#553c9a',
    excerpt: 'Voyager pendant le Ramadan mérite une attention particulière. Notre guide recense les hôtels proposant iftar, suhoor, ambiance spirituelle et services adaptés.',
    date: '20 Décembre 2025',
    readTime: '6 min',
    author: 'Khadija Benali',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    emoji: '🌙',
    tags: ['Ramadan', 'Spirituel', 'Famille'],
  },
]

const CATEGORIES = ['Tous', 'Guide', 'Halal', 'Astuces', 'Comparatif', 'Aventure', 'Ramadan']

export default function BlogPage() {
  const [active, setActive] = useState('Tous')

  const filtered = active === 'Tous' ? ARTICLES : ARTICLES.filter(a => a.category === active)

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)',
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
          Blog & Guides de voyage
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
          Conseils, guides et bons plans pour voyager malin en Afrique du Nord
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                padding: '8px 20px', borderRadius: 20, fontSize: 14, fontWeight: 600,
                background: active === cat ? '#FF6B35' : '#fff',
                color: active === cat ? '#fff' : '#4a5568',
                border: `1.5px solid ${active === cat ? '#FF6B35' : '#e2e8f0'}`,
                transition: 'all 0.2s', cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured article (first one) */}
        {active === 'Tous' && (
          <Link to={`/blog/${ARTICLES[0].id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 40 }}>
            <div style={{
              background: '#fff', borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(0,0,0,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)' }}
            >
              <div style={{
                background: ARTICLES[0].gradient, minHeight: 300,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80,
              }}>
                {ARTICLES[0].emoji}
              </div>
              <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{
                  display: 'inline-block',
                  background: '#EBF4FF', color: '#004E89',
                  fontSize: 12, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 6, marginBottom: 16,
                  width: 'fit-content',
                }}>
                  ⭐ Article à la une
                </span>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2d3748', lineHeight: 1.3, marginBottom: 12 }}>
                  {ARTICLES[0].title}
                </h2>
                <p style={{ color: '#718096', lineHeight: 1.7, marginBottom: 20 }}>
                  {ARTICLES[0].excerpt}
                </p>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#a0aec0', marginBottom: 20 }}>
                  <span>✍️ {ARTICLES[0].author}</span>
                  <span>📅 {ARTICLES[0].date}</span>
                  <span>⏱ {ARTICLES[0].readTime}</span>
                </div>
                <span style={{
                  display: 'inline-block',
                  color: '#FF6B35', fontWeight: 700, fontSize: 15,
                }}>
                  Lire l'article →
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Articles grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 28,
        }}>
          {(active === 'Tous' ? filtered.slice(1) : filtered).map(article => (
            <Link key={article.id} to={`/blog/${article.id}`} style={{ textDecoration: 'none' }}>
              <article style={{
                background: '#fff', borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%', display: 'flex', flexDirection: 'column',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
              >
                {/* Image */}
                <div style={{
                  height: 180, background: article.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 56, position: 'relative',
                }}>
                  {article.emoji}
                  <span style={{
                    position: 'absolute', bottom: 12, left: 12,
                    background: 'rgba(0,0,0,0.5)', color: '#fff',
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  }}>
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#2d3748', lineHeight: 1.4, marginBottom: 10 }}>
                    {article.title}
                  </h3>
                  <p style={{ color: '#718096', fontSize: 13, lineHeight: 1.7, flex: 1, marginBottom: 16 }}>
                    {article.excerpt}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {article.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 11, background: '#EBF8FF', color: '#2c5282',
                        padding: '2px 8px', borderRadius: 6,
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#a0aec0' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span>{article.date}</span>
                      <span>⏱ {article.readTime}</span>
                    </div>
                    <span style={{ color: '#FF6B35', fontWeight: 600, fontSize: 13 }}>
                      Lire →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
