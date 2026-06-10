import React from 'react'
import { useParams, Link } from 'react-router-dom'

const ARTICLES = {
  1: {
    id: 1,
    title: 'Les 10 meilleurs hôtels à Djerba en 2026',
    category: 'Guide',
    date: '12 Janvier 2026',
    readTime: '5 min',
    author: 'Sana Belhadj',
    authorBio: 'Experte voyage Tunisie · 8 ans d\'expérience',
    gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)',
    emoji: '🏝️',
    tags: ['Djerba', 'Tunisie', 'Plage', 'Famille'],
    content: [
      { type: 'intro', text: "Djerba, surnommée l'île des rêves, est la perle touristique de la Tunisie. Avec ses 125 km de côtes bordées de sable blanc, ses oliviers millénaires et son architecture berbère unique, elle attire chaque année des millions de visiteurs du monde entier. Dans ce guide exhaustif, notre équipe a sélectionné et testé les 10 meilleurs établissements hôteliers de l'île pour vous garantir un séjour inoubliable en 2026." },
      { type: 'h2', text: '1. Hôtel Djerba Plaza Thalassa & Aquapark ⭐⭐⭐⭐' },
      { type: 'text', text: "Le fleuron hôtelier de l'île, cet établissement 4 étoiles conjugue luxe, bien-être et animation. Son centre thalasso est l'un des plus réputés de Méditerranée. La plage privée de sable fin, les 4 piscines dont une aquatique pour les enfants, et les 5 restaurants en font une destination complète pour toute la famille.\n\n💰 Prix : à partir de 285 TND/nuit · 📍 Zone touristique de Midoun" },
      { type: 'h2', text: '2. Radisson Blu Palace Resort & Thalasso ⭐⭐⭐⭐⭐' },
      { type: 'text', text: "L'adresse 5 étoiles la plus prisée de Djerba. Architecture mauresque somptueuse, chambres et suites luxueusement équipées, spa world-class... Le Radisson Blu offre une expérience hors du commun face à la mer turquoise.\n\n💰 Prix : à partir de 520 TND/nuit · 📍 Houmt Souk" },
      { type: 'tip', text: '💡 Conseil EasyHotels : Réservez 2-3 mois à l\'avance pour obtenir les meilleurs tarifs en haute saison (juin-août). Utilisez notre comparateur pour économiser jusqu\'à 40% sur ces établissements.' },
      { type: 'h2', text: 'Tableau comparatif des 10 meilleurs hôtels' },
      { type: 'text', text: "1. Djerba Plaza Thalassa (4★) — 285 TND/nuit\n2. Radisson Blu Palace (5★) — 520 TND/nuit\n3. Yadis Djerba Golf (5★) — 480 TND/nuit\n4. Riu Jambo (4★) — 310 TND/nuit\n5. Vincci Djerba (4★) — 295 TND/nuit\n6. Club Eldorador (4★) — 250 TND/nuit\n7. Sun Connect Djerba (3★) — 180 TND/nuit\n8. SunConnect One Resort (3★) — 165 TND/nuit\n9. Hôtel Hasdrubal (4★) — 340 TND/nuit\n10. Blue Serene Beach (3★) — 145 TND/nuit" },
      { type: 'cta', text: 'Comparez tous les prix maintenant et économisez jusqu\'à 60% sur ces hôtels !' },
    ],
  },
  2: {
    id: 2,
    title: 'Hôtels halal en Tunisie : notre guide complet 2026',
    category: 'Halal',
    date: '8 Janvier 2026',
    readTime: '7 min',
    author: 'Ahmed Mansour',
    authorBio: 'Spécialiste tourisme halal · Auteur de 3 guides',
    gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    emoji: '🌙',
    tags: ['Halal', 'Tunisie', 'Famille', 'Valeurs'],
    content: [
      { type: 'intro', text: "Le tourisme halal connaît une croissance exponentielle en Tunisie, répondant à une demande croissante de voyageurs musulmans souhaitant profiter de vacances en accord avec leurs valeurs. Notre équipe a recensé et vérifié les meilleurs établissements proposant des services adaptés." },
      { type: 'h2', text: 'Critères de sélection des hôtels halal' },
      { type: 'text', text: "✅ Cuisine halal certifiée\n✅ Option sans alcool dans les espaces communs\n✅ Personnel sensibilisé aux besoins des familles musulmanes\n✅ Prière facilitée (qibla indiquée, tapis de prière disponibles)\n✅ Services spéciaux pendant le Ramadan" },
      { type: 'tip', text: '💡 Astuce : Sur EasyHotels, activez le filtre "Halal" pour afficher uniquement les hôtels certifiés. Cumulez avec "Famille" ou "Sans alcool" pour affiner.' },
      { type: 'cta', text: 'Recherchez maintenant parmi nos hôtels halal certifiés en Tunisie' },
    ],
  },
}

const RELATED = [
  { id: 2, title: 'Hôtels halal en Tunisie', emoji: '🌙', gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', readTime: '7 min' },
  { id: 3, title: 'Comparer les prix hôtels Maroc', emoji: '🇲🇦', gradient: 'linear-gradient(135deg, #FF6B35 0%, #e55a24 100%)', readTime: '4 min' },
  { id: 6, title: 'Ramadan 2026 : les meilleurs hôtels', emoji: '🌙', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', readTime: '6 min' },
]

export default function BlogPostPage() {
  const { id } = useParams()
  const article = ARTICLES[id] || ARTICLES[1]

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Hero */}
      <div style={{
        background: article.gradient, padding: '60px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', minHeight: 280,
      }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>{article.emoji}</div>
        <div style={{
          display: 'inline-block', background: 'rgba(255,255,255,0.2)',
          color: '#fff', borderRadius: 20, padding: '4px 14px',
          fontSize: 12, fontWeight: 700, marginBottom: 16,
        }}>
          {article.category}
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 900, color: '#fff', maxWidth: 800, lineHeight: 1.3, marginBottom: 20 }}>
          {article.title}
        </h1>
        <div style={{ display: 'flex', gap: 20, color: 'rgba(255,255,255,0.8)', fontSize: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>✍️ {article.author}</span>
          <span>📅 {article.date}</span>
          <span>⏱ {article.readTime} de lecture</span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', fontSize: 13, color: '#718096', display: 'flex', gap: 8 }}>
          <Link to="/" style={{ color: '#FF6B35' }}>Accueil</Link>
          <span>›</span>
          <Link to="/blog" style={{ color: '#FF6B35' }}>Blog</Link>
          <span>›</span>
          <span>{article.title.substring(0, 40)}...</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        {/* Article */}
        <article style={{ flex: 1, minWidth: 0 }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {article.tags.map(tag => (
              <span key={tag} style={{
                background: '#EBF8FF', color: '#2c5282',
                fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
              }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* Content blocks */}
          {article.content.map((block, i) => {
            switch (block.type) {
              case 'intro':
                return (
                  <p key={i} style={{
                    fontSize: 18, color: '#4a5568', lineHeight: 1.9,
                    borderLeft: '4px solid #FF6B35', paddingLeft: 20,
                    marginBottom: 32, fontStyle: 'italic',
                  }}>
                    {block.text}
                  </p>
                )
              case 'h2':
                return (
                  <h2 key={i} style={{
                    fontSize: 22, fontWeight: 800, color: '#2d3748',
                    marginTop: 36, marginBottom: 16,
                    paddingBottom: 8, borderBottom: '2px solid #e2e8f0',
                  }}>
                    {block.text}
                  </h2>
                )
              case 'text':
                return (
                  <div key={i} style={{ marginBottom: 24 }}>
                    {block.text.split('\n').map((line, li) => (
                      <p key={li} style={{ color: '#4a5568', lineHeight: 1.8, fontSize: 15, marginBottom: 8 }}>
                        {line}
                      </p>
                    ))}
                  </div>
                )
              case 'tip':
                return (
                  <div key={i} style={{
                    background: '#FFFBEB', borderRadius: 12, padding: 20,
                    border: '1px solid #FDE68A', marginBottom: 24,
                  }}>
                    <p style={{ color: '#92400e', fontSize: 14, lineHeight: 1.7 }}>{block.text}</p>
                  </div>
                )
              case 'cta':
                return (
                  <div key={i} style={{
                    background: 'linear-gradient(135deg, #FF6B35 0%, #e55a24 100%)',
                    borderRadius: 16, padding: '28px 32px',
                    textAlign: 'center', marginTop: 40, marginBottom: 24,
                  }}>
                    <p style={{ color: '#fff', fontSize: 16, marginBottom: 16, fontWeight: 600 }}>{block.text}</p>
                    <Link to="/search" style={{
                      display: 'inline-block',
                      background: '#fff', color: '#FF6B35',
                      padding: '12px 28px', borderRadius: 8,
                      fontWeight: 800, fontSize: 15,
                    }}>
                      Comparer maintenant →
                    </Link>
                  </div>
                )
              default:
                return null
            }
          })}

          {/* Author */}
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            display: 'flex', gap: 16, alignItems: 'center', marginTop: 48,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: article.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}>
              ✍️
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: '#2d3748', marginBottom: 4 }}>{article.author}</h4>
              <p style={{ fontSize: 13, color: '#718096' }}>{article.authorBio}</p>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside style={{ width: 300, flexShrink: 0, position: 'sticky', top: 80 }} className="blog-sidebar">
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', marginBottom: 16 }}>Articles similaires</h3>
            {RELATED.filter(r => r.id !== Number(id)).map(r => (
              <Link key={r.id} to={`/blog/${r.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                <div style={{ width: 60, height: 50, borderRadius: 8, flexShrink: 0, background: r.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {r.emoji}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#2d3748', lineHeight: 1.4, marginBottom: 4 }}>{r.title}</p>
                  <span style={{ fontSize: 11, color: '#a0aec0' }}>⏱ {r.readTime}</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(135deg, #004E89, #1a6eac)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}>Comparez les prix</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 16 }}>Trouvez les meilleurs tarifs</p>
            <Link to="/search" style={{ display: 'block', background: '#FF6B35', color: '#fff', padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
              Rechercher →
            </Link>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) { .blog-sidebar { display: none !important; } }
      `}</style>
    </div>
  )
}
