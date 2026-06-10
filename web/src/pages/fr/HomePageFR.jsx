import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import GDPRBanner from '../../components/GDPRBanner'

const DESTINATIONS = [
  { city: 'Marrakech', country: 'Maroc', flag: '🇲🇦', price: 45, gradient: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
  { city: 'Casablanca', country: 'Maroc', flag: '🇲🇦', price: 38, gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)' },
  { city: 'Alger', country: 'Algérie', flag: '🇩🇿', price: 52, gradient: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' },
  { city: 'Tunis', country: 'Tunisie', flag: '🇹🇳', price: 35, gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' },
  { city: 'Agadir', country: 'Maroc', flag: '🇲🇦', price: 42, gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFC72C 100%)' },
  { city: 'Djerba', country: 'Tunisie', flag: '🇹🇳', price: 40, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
]

const CULTURAL_FILTERS = [
  { key: 'halal', icon: '🍖', label: 'Halal certifié' },
  { key: 'noAlcohol', icon: '🚫', label: 'Sans alcool' },
  { key: 'burkini', icon: '🧕', label: 'Burkini accepté' },
  { key: 'family', icon: '👨‍👩‍👧', label: 'Idéal familles' },
  { key: 'prayer', icon: '🕌', label: 'Salle de prière' },
  { key: 'ramadan', icon: '🌙', label: 'Services Ramadan' },
]

const FLIGHT_TIMES = [
  { route: 'Paris → Alger', time: '2h30', icon: '🇩🇿' },
  { route: 'Paris → Casablanca', time: '3h00', icon: '🇲🇦' },
  { route: 'Paris → Tunis', time: '2h45', icon: '🇹🇳' },
  { route: 'Paris → Marrakech', time: '3h15', icon: '🇲🇦' },
]

function useCounterAnimation(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
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
    }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return [count, ref]
}

function CounterStat({ value, suffix, label }) {
  const [count, ref] = useCounterAnimation(value)
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, fontWeight: 900, color: '#FF6B35' }}>{count.toLocaleString('fr-FR')}{suffix}</div>
      <div style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function HomePageFR() {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (destination) navigate(`/search?destination=${encodeURIComponent(destination)}&checkin=${checkin}&checkout=${checkout}`)
  }

  return (
    <div style={{ background: '#F8F9FA' }}>
      <GDPRBanner />
      <title>EasyHotels — Comparez les hôtels au Maroc, Algérie et Tunisie | Meilleurs prix</title>

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
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
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
            ✈ Comparez 500+ hôtels — Meilleurs prix garantis au Maghreb
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5.5vw, 60px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            Comparez les hôtels au{' '}
            <span style={{ color: '#FFC72C' }}>Maroc, Algérie et Tunisie</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 40, lineHeight: 1.6 }}>
            Booking.com, Expedia, Hotels.com — tout en un seul endroit. Économisez jusqu'à 60%.
          </p>

          {/* Search Form */}
          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Destination, hôtel..."
                value={destination}
                onChange={e => setDestination(e.target.value)}
                style={{ flex: '2 1 200px', padding: '12px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none' }}
              />
              <input
                type="date"
                placeholder="Arrivée"
                value={checkin}
                onChange={e => setCheckin(e.target.value)}
                style={{ flex: '1 1 140px', padding: '12px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 15 }}
              />
              <input
                type="date"
                placeholder="Départ"
                value={checkout}
                onChange={e => setCheckout(e.target.value)}
                style={{ flex: '1 1 140px', padding: '12px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 15 }}
              />
              <button type="submit" style={{ flex: '0 0 auto', background: '#FF6B35', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                🔍 Rechercher
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 28 }}>
            {[
              { icon: '💶', label: 'Paiement en €' },
              { icon: '🇫🇷', label: 'Support en français' },
              { icon: '🔍', label: '50+ sources' },
              { icon: '✅', label: 'Sans frais cachés' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(10px)' }}>
                <span>{b.icon}</span><span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIASPORA BANNER */}
      <section style={{ background: 'linear-gradient(135deg, #1a5276 0%, #2471a3 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>🇩🇿</span>
              <span style={{ fontSize: 28 }}>🇲🇦</span>
              <span style={{ fontSize: 28 }}>🇹🇳</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginLeft: 4 }}>La communauté maghrébine en France</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, maxWidth: 560 }}>
              Vous rentrez au bled cet été ? Trouvez le meilleur hôtel et comparez les prix en quelques secondes.
            </p>
          </div>
          <button
            onClick={() => navigate('/search?destination=Maroc')}
            style={{ background: '#FF6B35', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            Voir les hôtels au Maghreb →
          </button>
        </div>
      </section>

      {/* FLIGHT TIMES */}
      <section style={{ background: '#fff', padding: '50px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, color: '#2d3748', marginBottom: 8 }}>✈️ Vols depuis Paris</h2>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: 36 }}>Des destinations proches, à moins de 3h de vol</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {FLIGHT_TIMES.map((f, i) => (
              <div key={i} style={{ background: '#F8F9FA', borderRadius: 12, padding: '20px 16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#2d3748', marginBottom: 4 }}>{f.route}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#FF6B35' }}>{f.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#F0F7FF', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40 }}>
          <CounterStat value={500} suffix="+" label="Hôtels référencés" />
          <CounterStat value={7} suffix="" label="Pays couverts" />
          <CounterStat value={5} suffix="" label="Comparateurs de prix" />
          <CounterStat value={75000} suffix="+" label="Voyageurs satisfaits" />
        </div>
      </section>

      {/* DESTINATIONS GRID */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>🌍 Destinations populaires</h2>
          <p style={{ color: '#718096', fontSize: 16 }}>Les villes les plus recherchées par la communauté française</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {DESTINATIONS.map(d => (
            <div
              key={d.city}
              onClick={() => navigate(`/search?destination=${d.city}`)}
              style={{ background: d.gradient, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', height: 200, position: 'relative', transition: 'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{d.flag}</span>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{d.city}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{d.country}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>à partir de</div>
                    <div style={{ color: '#FFC72C', fontSize: 18, fontWeight: 800 }}>{d.price}€<span style={{ fontSize: 12, fontWeight: 400 }}>/nuit</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CULTURAL FILTERS */}
      <section style={{ padding: '80px 24px', background: '#f0f4f8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>Hôtels qui respectent vos valeurs</h2>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 48 }}>Filtrez les hôtels selon vos besoins et vos convictions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16 }}>
            {CULTURAL_FILTERS.map(f => (
              <div
                key={f.key}
                onClick={() => navigate(`/search?${f.key}=true`)}
                style={{ background: '#fff', borderRadius: 16, padding: '24px 16px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s', border: '2px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.border = '2px solid #FF6B35'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,53,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2d3748' }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CPC MONETIZATION */}
      <section style={{ background: '#0f172a', padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 }}>💰 Meilleures offres du moment</h2>
          <p style={{ color: '#94a3b8', marginBottom: 36 }}>Comparez sur les meilleurs sites de réservation</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { name: 'Booking.com', icon: '🔵', color: '#003580', desc: 'Le plus grand choix', url: 'https://booking.com' },
              { name: 'Expedia', icon: '🟡', color: '#FFC72C', desc: 'Vols + hôtels combinés', url: 'https://expedia.fr' },
              { name: 'Hotels.com', icon: '🔴', color: '#e53e3e', desc: '10e nuit offerte', url: 'https://hotels.com' },
            ].map((partner, i) => (
              <a
                key={i}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                style={{ background: '#1e293b', borderRadius: 12, padding: '24px 16px', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{partner.icon}</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{partner.name}</div>
                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>{partner.desc}</div>
                <div style={{ background: '#FF6B35', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                  Comparer →
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>Comment ça marche</h2>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 60 }}>Trouvez le meilleur prix en 3 étapes simples</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
            {[
              { step: '01', icon: '🔍', title: 'Cherchez votre destination', desc: 'Entrez votre destination et vos dates. Notre moteur consulte 50+ sources simultanément.' },
              { step: '02', icon: '💰', title: 'Comparez 5 sources de prix', desc: 'Visualisez les prix de Booking.com, Expedia, Hotels.com et plus encore. Prix en € inclus.' },
              { step: '03', icon: '✈️', title: 'Voyagez au meilleur prix', desc: 'Cliquez sur la meilleure offre et réservez directement sur le site partenaire. Économisez jusqu\'à 60%.' },
            ].map((step, i) => (
              <div key={i} style={{ position: 'relative', padding: '32px 24px', background: '#F8F9FA', borderRadius: 16 }}>
                <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #FF6B35, #FFC72C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px' }}>
                  {step.icon}
                </div>
                <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 48, fontWeight: 900, color: '#e2e8f0' }}>{step.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2d3748', marginBottom: 12 }}>{step.title}</h3>
                <p style={{ color: '#718096', fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section style={{ padding: '60px 24px', background: '#F8F9FA' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2d3748' }}>Guides & Conseils</h2>
            <Link to="/fr/blog" style={{ color: '#FF6B35', fontSize: 14, fontWeight: 600 }}>Voir tous les articles →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { title: 'Hôtel Marrakech pas cher : notre sélection 2026', category: 'Guide', gradient: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
              { title: 'Hôtel Alger centre : les 8 meilleurs établissements', category: 'Algérie', gradient: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' },
              { title: 'Séjour halal Maroc : guide complet pour familles', category: 'Halal', gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFC72C 100%)' },
            ].map((post, i) => (
              <Link key={i} to="/fr/blog" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
                >
                  <div style={{ height: 140, background: post.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 40 }}>📖</span>
                  </div>
                  <div style={{ padding: 20 }}>
                    <span style={{ background: '#EBF8FF', color: '#2c5282', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>{post.category}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', margin: '10px 0 0', lineHeight: 1.4 }}>{post.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{ background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏨</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Vous êtes hôtelier ?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, marginBottom: 32 }}>
            Rejoignez <strong>47 partenaires EasyHotels</strong> et augmentez votre visibilité auprès de la diaspora française
          </p>
          <Link to="/hoteliers" style={{ display: 'inline-block', background: '#FF6B35', color: '#fff', padding: '14px 36px', borderRadius: 10, fontSize: 15, fontWeight: 700, boxShadow: '0 8px 30px rgba(255,107,53,0.4)' }}>
            Référencer mon hôtel →
          </Link>
        </div>
      </section>
    </div>
  )
}
