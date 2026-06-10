import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { hotelAPI } from '../services/api'

const MOCK_DEALS = [
  { id: '1', name: 'Hôtel Djerba Sun Club', stars: 4, originalPrice: 380, price: 220, discount: 42, country: 'Tunisie', city: 'Djerba', rating: 8.5, expires: 14 * 3600 + 32 * 60 + 7, gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)' },
  { id: '2', name: 'Palmeraie Golf Palace', stars: 5, originalPrice: 950, price: 560, discount: 41, country: 'Maroc', city: 'Marrakech', rating: 9.1, expires: 8 * 3600 + 15 * 60 + 22, gradient: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
  { id: '3', name: 'Pickalbatros Aqua Blu', stars: 5, originalPrice: 280, price: 145, discount: 48, country: 'Égypte', city: 'Hurghada', rating: 8.9, expires: 22 * 3600 + 44 * 60 + 9, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: '4', name: 'Sofitel Thalassa Hammamet', stars: 5, originalPrice: 650, price: 390, discount: 40, country: 'Tunisie', city: 'Hammamet', rating: 9.3, expires: 6 * 3600 + 10 * 60 + 33, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: '5', name: 'Four Seasons Casablanca', stars: 5, originalPrice: 2800, price: 1680, discount: 40, country: 'Maroc', city: 'Casablanca', rating: 9.6, expires: 11 * 3600 + 5 * 60 + 55, gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFC72C 100%)' },
  { id: '6', name: 'Baron Resort Sharm', stars: 5, originalPrice: 320, price: 160, discount: 50, country: 'Égypte', city: 'Sharm El Sheikh', rating: 8.7, expires: 3 * 3600 + 22 * 60 + 18, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
]

const COUNTRIES = ['Tous', 'Tunisie', 'Maroc', 'Égypte', 'Algérie']
const STARS_FILTER = ['Tous', '3★', '4★', '5★']

function DealCountdown({ seconds: initialSeconds }) {
  const [secs, setSecs] = useState(initialSeconds)
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const pad = n => String(n).padStart(2, '0')
  return (
    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 15, color: secs < 3600 ? '#e53e3e' : '#FF6B35' }}>
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  )
}

export default function FlashDealsPage() {
  const navigate = useNavigate()
  const [deals, setDeals] = useState(MOCK_DEALS)
  const [countryFilter, setCountryFilter] = useState('Tous')
  const [starsFilter, setStarsFilter] = useState('Tous')

  useEffect(() => {
    hotelAPI.getFlashDeals().then(res => {
      if (res.data?.length) setDeals(res.data)
    }).catch(() => {})
  }, [])

  const filtered = deals.filter(d => {
    if (countryFilter !== 'Tous' && d.country !== countryFilter) return false
    if (starsFilter !== 'Tous' && d.stars !== parseInt(starsFilter)) return false
    return true
  })

  const chipStyle = (active) => ({
    padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? '#FF6B35' : '#fff',
    color: active ? '#fff' : '#4a5568',
    border: `1.5px solid ${active ? '#FF6B35' : '#e2e8f0'}`,
  })

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '60px 24px 40px',
        textAlign: 'center',
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
            Offres Flash
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 24 }}>
            Des prix exceptionnels, pour une durée limitée. Ne ratez pas ces opportunités !
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: '#1e293b', borderRadius: 12, padding: '12px 24px',
            border: '1px solid #334155',
          }}>
            <span style={{ color: '#94a3b8', fontSize: 14 }}>Offre principale expire dans</span>
            <DealCountdown seconds={MOCK_DEALS[0].expires} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Filters */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Pays</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COUNTRIES.map(c => (
                  <button key={c} onClick={() => setCountryFilter(c)} style={chipStyle(countryFilter === c)}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Catégorie</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STARS_FILTER.map(s => (
                  <button key={s} onClick={() => setStarsFilter(s)} style={chipStyle(starsFilter === s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
          {filtered.length} offre{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
        </p>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
        }}>
          {filtered.map((deal, i) => (
            <div
              key={deal.id}
              onClick={() => navigate(`/hotel/${deal.id}`)}
              style={{
                background: '#1e293b',
                borderRadius: 16, overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '1px solid #334155',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
                e.currentTarget.style.borderColor = '#FF6B35'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#334155'
              }}
            >
              {/* Image */}
              <div style={{
                height: 180, background: deal.gradient, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
              }}>
                🏨
                <span style={{
                  position: 'absolute', top: 12, left: 12,
                  background: '#e53e3e', color: '#fff',
                  fontSize: 14, fontWeight: 800,
                  padding: '5px 12px', borderRadius: 20,
                }}>
                  -{deal.discount}%
                </span>
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  fontSize: 18,
                  padding: '4px 8px', borderRadius: 8,
                }}>
                  {deal.country === 'Tunisie' ? '🇹🇳' : deal.country === 'Maroc' ? '🇲🇦' : deal.country === 'Algérie' ? '🇩🇿' : '🇪🇬'}
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{deal.name}</h3>
                    <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                      📍 {deal.city}, {deal.country}
                    </p>
                  </div>
                  <div style={{
                    background: '#48bb78', color: '#fff',
                    fontWeight: 800, fontSize: 14,
                    padding: '4px 10px', borderRadius: 8,
                  }}>
                    {deal.rating}
                  </div>
                </div>

                {/* Stars */}
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: deal.stars }).map((_, i) => (
                    <span key={i} style={{ color: '#FFC72C', fontSize: 14 }}>★</span>
                  ))}
                </div>

                {/* Countdown */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                  background: '#0f172a', borderRadius: 8, padding: '8px 12px',
                }}>
                  <span style={{ fontSize: 16 }}>⏱</span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Expire dans</span>
                  <DealCountdown seconds={deal.expires - i * 3600} />
                </div>

                {/* Price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: 13, textDecoration: 'line-through', display: 'block' }}>
                      {deal.originalPrice} TND
                    </span>
                    <span style={{ color: '#FFC72C', fontSize: 28, fontWeight: 900 }}>
                      {deal.price}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}> TND/nuit</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/hotel/${deal.id}`) }}
                    style={{
                      background: '#FF6B35', color: '#fff',
                      padding: '12px 20px', borderRadius: 8,
                      fontSize: 14, fontWeight: 700,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e55a24'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FF6B35'}
                  >
                    Réserver →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>
              Aucune offre pour ce filtre
            </h3>
            <p>Essayez un autre pays ou catégorie</p>
          </div>
        )}
      </div>
    </div>
  )
}
