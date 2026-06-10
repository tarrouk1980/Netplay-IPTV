import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import GDPRBanner from '../../components/GDPRBanner'

const DESTINATIONS = [
  { city: 'Marrakesch', country: 'Marokko', flag: '🇲🇦', price: 45, gradient: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
  { city: 'Casablanca', country: 'Marokko', flag: '🇲🇦', price: 38, gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)' },
  { city: 'Tunis', country: 'Tunesien', flag: '🇹🇳', price: 35, gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' },
  { city: 'Djerba', country: 'Tunesien', flag: '🇹🇳', price: 40, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
]

const FLIGHT_TIMES = [
  { route: 'Frankfurt → Marrakesch', time: '3h30', icon: '🇲🇦' },
  { route: 'München → Tunis', time: '2h45', icon: '🇹🇳' },
  { route: 'Frankfurt → Casablanca', time: '4h00', icon: '🇲🇦' },
  { route: 'München → Djerba', time: '2h30', icon: '🇹🇳' },
]

export default function HomePageDE() {
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
      <title>EasyHotels — Hotels in Marokko & Tunesien vergleichen | Beste Preise</title>

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
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, width: '100%' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff',
            borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600,
            marginBottom: 20, backdropFilter: 'blur(10px)',
          }}>
            ✈ 500+ Hotels vergleichen — Beste Preise garantiert
          </div>

          <h1 style={{ fontSize: 'clamp(26px, 5vw, 56px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            Hotels in{' '}
            <span style={{ color: '#FFC72C' }}>Marokko & Tunesien vergleichen</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 40, lineHeight: 1.6 }}>
            Booking.com, Expedia, Hotels.com — alles an einem Ort. Sparen Sie bis zu 60%.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Reiseziel, Hotel..."
                value={destination}
                onChange={e => setDestination(e.target.value)}
                style={{ flex: '2 1 200px', padding: '12px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none' }}
              />
              <input type="date" value={checkin} onChange={e => setCheckin(e.target.value)}
                style={{ flex: '1 1 140px', padding: '12px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 15 }} />
              <input type="date" value={checkout} onChange={e => setCheckout(e.target.value)}
                style={{ flex: '1 1 140px', padding: '12px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 15 }} />
              <button type="submit" style={{ background: '#FF6B35', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                🔍 Suchen
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 28 }}>
            {[
              { icon: '💶', label: 'Zahlung in €' },
              { icon: '🇩🇪', label: 'Deutschsprachig' },
              { icon: '🔍', label: '50+ Quellen' },
              { icon: '✅', label: 'Keine versteckten Gebühren' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(10px)' }}>
                <span>{b.icon}</span><span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIASPORA BANNER */}
      <section style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>🇲🇦</span>
              <span style={{ fontSize: 28 }}>🇹🇳</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginLeft: 4 }}>Maghrebinische Gemeinschaft in Deutschland</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, maxWidth: 520 }}>
              Fahren Sie diesen Sommer in die Heimat? Finden Sie das beste Hotel und vergleichen Sie die Preise in Sekunden.
            </p>
          </div>
          <button
            onClick={() => navigate('/search?destination=Marokko')}
            style={{ background: '#FF6B35', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            Hotels in Marokko →
          </button>
        </div>
      </section>

      {/* FLIGHT TIMES */}
      <section style={{ background: '#fff', padding: '50px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, color: '#2d3748', marginBottom: 8 }}>✈️ Flüge ab Frankfurt & München</h2>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: 36 }}>Nahe Reiseziele — unter 4 Stunden Flugzeit</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {FLIGHT_TIMES.map((f, i) => (
              <div key={i} style={{ background: '#F8F9FA', borderRadius: 12, padding: '20px 16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2d3748', marginBottom: 4 }}>{f.route}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#FF6B35' }}>{f.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>🌍 Beliebte Reiseziele</h2>
          <p style={{ color: '#718096', fontSize: 16 }}>Die meistgesuchten Städte der deutschen Gemeinschaft</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
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
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>ab</div>
                    <div style={{ color: '#FFC72C', fontSize: 18, fontWeight: 800 }}>{d.price}€<span style={{ fontSize: 12, fontWeight: 400 }}>/Nacht</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CULTURAL FILTERS */}
      <section style={{ padding: '60px 24px', background: '#f0f4f8' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>Hotels nach Ihren Werten</h2>
          <p style={{ color: '#718096', fontSize: 15, marginBottom: 40 }}>Filtern Sie Hotels nach Ihren Bedürfnissen</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
            {[
              { key: 'halal', icon: '🍖', label: 'Halal zertifiziert' },
              { key: 'noAlcohol', icon: '🚫', label: 'Alkoholfrei' },
              { key: 'family', icon: '👨‍👩‍👧', label: 'Familienfreundlich' },
              { key: 'prayer', icon: '🕌', label: 'Gebetsraum' },
            ].map(f => (
              <div
                key={f.key}
                onClick={() => navigate(`/search?${f.key}=true`)}
                style={{ background: '#fff', borderRadius: 16, padding: '20px 12px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s', border: '2px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.border = '2px solid #FF6B35'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2d3748' }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏨</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Sie sind Hotelier?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, marginBottom: 32 }}>
            Werden Sie Teil von <strong>47 EasyHotels-Partnern</strong> und steigern Sie Ihre Sichtbarkeit
          </p>
          <Link to="/hoteliers" style={{ display: 'inline-block', background: '#FF6B35', color: '#fff', padding: '14px 36px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            Mein Hotel registrieren →
          </Link>
        </div>
      </section>
    </div>
  )
}
