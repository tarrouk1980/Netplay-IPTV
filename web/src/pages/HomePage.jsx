import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import HotelCard from '../components/HotelCard'
import { hotelAPI } from '../services/api'

const DESTINATIONS = [
  { city: 'Djerba', country: 'Tunisie', flag: '🇹🇳', hotels: 47, gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)' },
  { city: 'Hammamet', country: 'Tunisie', flag: '🇹🇳', hotels: 38, gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFC72C 100%)' },
  { city: 'Marrakech', country: 'Maroc', flag: '🇲🇦', hotels: 62, gradient: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
  { city: 'Sharm El Sheikh', country: 'Égypte', flag: '🇪🇬', hotels: 85, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { city: 'Alger', country: 'Algérie', flag: '🇩🇿', hotels: 29, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { city: 'Hurghada', country: 'Égypte', flag: '🇪🇬', hotels: 73, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
]

const CULTURAL_FILTERS = [
  { key: 'noAlcohol', icon: '🚫', label: 'Sans Alcool' },
  { key: 'burkiniOk', icon: '🧕', label: 'Burkini OK' },
  { key: 'halal', icon: '🍖', label: 'Halal' },
  { key: 'ramadan', icon: '🌙', label: 'Ramadan' },
  { key: 'family', icon: '👨‍👩‍👧', label: 'Famille' },
  { key: 'honeymoon', icon: '💒', label: 'Lune de miel' },
]

const MOCK_HOTELS = [
  { id: '1', name: 'Hôtel Djerba Plaza', stars: 4, city: 'Djerba', country: 'Tunisie', rating: 8.7, price: 285, currency: 'TND', amenities: ['Piscine', 'WiFi', 'Spa', 'Restaurant'], culturalFilters: { halal: true, noAlcohol: false } },
  { id: '2', name: 'Riu Imperial Marhaba', stars: 5, city: 'Hammamet', country: 'Tunisie', rating: 9.1, price: 420, currency: 'TND', amenities: ['Plage privée', 'Piscine', 'Animation', 'All-inclusive'], culturalFilters: { family: true } },
  { id: '3', name: 'Atlas Asni Marrakech', stars: 4, city: 'Marrakech', country: 'Maroc', rating: 8.4, price: 650, currency: 'MAD', amenities: ['Riad', 'Piscine', 'Spa', 'WiFi'], culturalFilters: { halal: true, noAlcohol: true } },
  { id: '4', name: 'Barceló Tiran Sharm', stars: 5, city: 'Sharm El Sheikh', country: 'Égypte', rating: 9.3, price: 185, currency: 'USD', amenities: ['Plongée', 'Piscine', 'Tout incl.', 'Spa'] },
  { id: '5', name: 'Mercure Alger Aéroport', stars: 4, city: 'Alger', country: 'Algérie', rating: 7.9, price: 12000, currency: 'DZD', amenities: ['WiFi', 'Restaurant', 'Navette'] },
  { id: '6', name: 'Steigenberger Aqua Magic', stars: 5, city: 'Hurghada', country: 'Égypte', rating: 8.8, price: 155, currency: 'USD', amenities: ['Parc aquatique', 'Piscine', 'Beach', 'Spa'], culturalFilters: { family: true, burkiniOk: true } },
]

const FLASH_DEALS = [
  { id: '1', name: 'Hôtel Djerba Sun Club', stars: 4, originalPrice: 380, price: 220, discount: 42, country: 'Tunisie', expiry: '14:32:07' },
  { id: '2', name: 'Palmeraie Marrakech', stars: 5, originalPrice: 950, price: 560, discount: 41, country: 'Maroc', expiry: '08:15:22' },
  { id: '3', name: 'Pickalbatros Aqua Blu', stars: 5, originalPrice: 280, price: 145, discount: 48, country: 'Égypte', expiry: '22:44:09' },
]

const BLOG_POSTS = [
  { id: 1, title: 'Les 10 meilleurs hôtels à Djerba en 2026', category: 'Guide', excerpt: 'Notre sélection des plus beaux établissements de l\'île de rêve tunisienne.', date: '12 Jan 2026', readTime: '5 min', gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)' },
  { id: 2, title: 'Hôtels halal en Tunisie : notre guide complet', category: 'Halal', excerpt: 'Trouvez un hébergement conforme à vos valeurs avec notre guide détaillé 2026.', date: '8 Jan 2026', readTime: '7 min', gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' },
  { id: 3, title: 'Comparer les prix hôtels Maroc : astuces 2026', category: 'Astuces', excerpt: 'Économisez jusqu\'à 60% sur votre séjour marocain grâce à ces conseils.', date: '5 Jan 2026', readTime: '4 min', gradient: 'linear-gradient(135deg, #FF6B35 0%, #e55a24 100%)' },
]

function useCounterAnimation(target, duration = 2000, threshold = 0.2) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = Date.now()
          const tick = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return [count, ref]
}

function CounterStat({ value, suffix, label }) {
  const [count, ref] = useCounterAnimation(value)
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, fontWeight: 900, color: '#FF6B35' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function FlashCountdown() {
  const [time, setTime] = useState({ h: 14, m: 32, s: 7 })
  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => {
        let { h, m, s } = t
        s -= 1
        if (s < 0) { s = 59; m -= 1 }
        if (m < 0) { m = 59; h -= 1 }
        if (h < 0) { h = 23; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])
  const pad = n => String(n).padStart(2, '0')
  return (
    <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: 2, color: '#FFC72C' }}>
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState(MOCK_HOTELS)

  useEffect(() => {
    hotelAPI.getFeatured().then(res => {
      if (res.data?.length) setFeatured(res.data.slice(0, 6))
    }).catch(() => {})
  }, [])

  return (
    <div style={{ background: '#F8F9FA' }}>
      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 60%, #FF6B35 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, width: '100%' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff', borderRadius: 20, padding: '6px 16px',
            fontSize: 13, fontWeight: 600, marginBottom: 20,
            backdropFilter: 'blur(10px)',
          }}>
            🌍 Comparez 500+ hôtels en Afrique du Nord
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 64px)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: 20,
          }}>
            Comparez les prix de{' '}
            <span style={{ color: '#FFC72C' }}>500+ hôtels</span>
            <br />en Afrique du Nord
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 40, lineHeight: 1.6 }}>
            Booking.com, Expedia, Hotels.com — tout en un seul endroit
          </p>

          {/* Search form */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 16, padding: 24,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <SearchBar inline={true} />
          </div>

          {/* Trust badges */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: 16, marginTop: 28,
          }}>
            {[
              { icon: '🔒', label: 'Gratuit' },
              { icon: '🔍', label: '50+ sources' },
              { icon: '⚡', label: 'Prix en temps réel' },
              { icon: '🌍', label: '7 pays' },
            ].map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.2)',
                color: '#fff', borderRadius: 20,
                padding: '6px 14px', fontSize: 13, fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}>
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#fff', padding: '60px 24px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40 }}>
          <CounterStat value={51} suffix="+" label="Hôtels référencés" />
          <CounterStat value={7} suffix="" label="Pays couverts" />
          <CounterStat value={5} suffix="" label="Comparateurs de prix" />
          <CounterStat value={50000} suffix="+" label="Voyageurs satisfaits" />
        </div>
      </section>

      {/* DESTINATIONS */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>
            Destinations populaires
          </h2>
          <p style={{ color: '#718096', fontSize: 16 }}>
            Explorez les destinations les plus prisées du Maghreb et du Moyen-Orient
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {DESTINATIONS.map((d, i) => (
            <div
              key={d.city}
              onClick={() => navigate(`/search?destination=${d.city}`)}
              style={{
                background: d.gradient,
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                height: 200,
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.03)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{d.flag}</span>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{d.city}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                      {d.country} · {d.hotels} hôtels
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED HOTELS */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748' }}>
              Hôtels en vedette
            </h2>
            <Link to="/search" style={{
              color: '#FF6B35', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Voir tous les hôtels →
            </Link>
          </div>

          {/* Horizontal scroll carousel */}
          <div style={{
            display: 'flex', gap: 20,
            overflowX: 'auto', paddingBottom: 16,
            scrollbarWidth: 'thin',
          }}>
            {featured.map((hotel, i) => (
              <div key={hotel.id || hotel._id || i} style={{ minWidth: 280, maxWidth: 280 }}>
                <HotelCard hotel={hotel} index={i} compact />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLASH DEALS */}
      <section style={{ background: '#0f172a', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>⚡</span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>Offres Flash</h2>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 16, marginBottom: 8 }}>
              Expire dans <FlashCountdown />
            </div>
            <p style={{ color: '#64748b', fontSize: 14 }}>Ces prix exceptionnels sont limités dans le temps</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {FLASH_DEALS.map((deal, i) => (
              <div
                key={deal.id}
                onClick={() => navigate(`/hotel/${deal.id}`)}
                style={{
                  background: '#1e293b', borderRadius: 16, overflow: 'hidden',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  height: 160,
                  background: [
                    'linear-gradient(135deg, #1a6eac 0%, #004E89 100%)',
                    'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  ][i],
                  position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 16,
                }}>
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#e53e3e', color: '#fff',
                    fontSize: 14, fontWeight: 800,
                    padding: '4px 10px', borderRadius: 20,
                  }}>
                    -{deal.discount}%
                  </span>
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{deal.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    {Array.from({ length: deal.stars }).map((_, i) => (
                      <span key={i} style={{ color: '#FFC72C', fontSize: 14 }}>★</span>
                    ))}
                    <span style={{ color: '#64748b', fontSize: 13 }}>· {deal.country}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: 13, textDecoration: 'line-through', display: 'block' }}>
                        {deal.originalPrice} TND
                      </span>
                      <span style={{ color: '#FFC72C', fontSize: 24, fontWeight: 800 }}>
                        {deal.price} TND
                      </span>
                    </div>
                    <button style={{
                      background: '#FF6B35', color: '#fff',
                      padding: '10px 18px', borderRadius: 8,
                      fontSize: 13, fontWeight: 700,
                    }}>
                      Réserver →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/flash-deals" style={{
              display: 'inline-block',
              border: '2px solid #FF6B35', color: '#FF6B35',
              padding: '12px 32px', borderRadius: 8,
              fontSize: 15, fontWeight: 700,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FF6B35'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FF6B35' }}
            >
              Voir toutes les offres flash ⚡
            </Link>
          </div>
        </div>
      </section>

      {/* CULTURAL FILTERS */}
      <section style={{ padding: '80px 24px', background: '#f0f4f8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>
            Des hôtels qui respectent vos valeurs
          </h2>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 48 }}>
            Filtrez les hôtels selon vos besoins et convictions
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 16,
          }}>
            {CULTURAL_FILTERS.map(f => (
              <div
                key={f.key}
                onClick={() => navigate(`/search?${f.key}=true`)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '24px 16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = '2px solid #FF6B35'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,53,0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '2px solid transparent'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2d3748' }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>
            Comment ça fonctionne ?
          </h2>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 60 }}>
            Trouvez le meilleur prix en 3 étapes simples
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
          }}>
            {[
              { step: '01', icon: '🔍', title: 'Recherchez', desc: 'Entrez votre destination et vos dates. Notre moteur interroge 50+ sources simultanément.' },
              { step: '02', icon: '💰', title: 'Comparez', desc: 'Visualisez les prix de Booking.com, Expedia, Hotels.com et bien d\'autres en un clin d\'œil.' },
              { step: '03', icon: '✈️', title: 'Partez', desc: 'Cliquez sur la meilleure offre et réservez directement sur le site partenaire. Économisez jusqu\'à 60%.' },
            ].map((step, i) => (
              <div key={i} style={{ position: 'relative', padding: '32px 24px', background: '#F8F9FA', borderRadius: 16 }}>
                <div style={{
                  width: 56, height: 56,
                  background: 'linear-gradient(135deg, #FF6B35, #FFC72C)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, margin: '0 auto 20px',
                }}>
                  {step.icon}
                </div>
                <div style={{
                  position: 'absolute', top: 12, right: 16,
                  fontSize: 48, fontWeight: 900, color: '#e2e8f0',
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 12 }}>
                  {step.title}
                </h3>
                <p style={{ color: '#718096', fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section style={{ padding: '80px 24px', background: '#F8F9FA' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748' }}>
              Guides & Conseils
            </h2>
            <Link to="/blog" style={{ color: '#FF6B35', fontSize: 14, fontWeight: 600 }}>
              Voir tous les articles →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {BLOG_POSTS.map(post => (
              <Link key={post.id} to={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
                >
                  <div style={{ height: 160, background: post.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 48 }}>📖</span>
                  </div>
                  <div style={{ padding: 20 }}>
                    <span style={{
                      background: '#EBF8FF', color: '#2c5282',
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                    }}>
                      {post.category}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', margin: '10px 0 8px', lineHeight: 1.4 }}>
                      {post.title}
                    </h3>
                    <p style={{ color: '#718096', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{post.excerpt}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#a0aec0' }}>
                      <span>{post.date}</span>
                      <span>⏱ {post.readTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HÔTELIER CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)',
        padding: '80px 24px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🏨</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            Vous êtes hôtelier ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 12 }}>
            Rejoignez <strong>47 partenaires EasyHotels</strong> et boostez votre visibilité
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 40 }}>
            +340% de visibilité · +28% de réservations directes · Sans commission
          </p>
          <Link
            to="/hoteliers"
            style={{
              display: 'inline-block',
              background: '#FF6B35', color: '#fff',
              padding: '16px 40px', borderRadius: 10,
              fontSize: 16, fontWeight: 700,
              boxShadow: '0 8px 30px rgba(255,107,53,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,53,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,53,0.4)' }}
          >
            Référencer mon hôtel →
          </Link>
        </div>
      </section>
    </div>
  )
}
