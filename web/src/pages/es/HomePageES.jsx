import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from '../../components/SearchBar'
import HotelCard from '../../components/HotelCard'
import CurrencyDisplay from '../../components/CurrencyDisplay'
import { hotelAPI } from '../../services/api'

const DESTINATIONS = [
  { city: 'Djerba', country: 'Túnez', flag: '🇹🇳', hotels: 47, gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)' },
  { city: 'Hammamet', country: 'Túnez', flag: '🇹🇳', hotels: 38, gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFC72C 100%)' },
  { city: 'Marrakech', country: 'Marruecos', flag: '🇲🇦', hotels: 62, gradient: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
  { city: 'Sharm el-Sheij', country: 'Egipto', flag: '🇪🇬', hotels: 85, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { city: 'El Cairo', country: 'Egipto', flag: '🇪🇬', hotels: 54, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { city: 'Hurghada', country: 'Egipto', flag: '🇪🇬', hotels: 73, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
]

const CULTURAL_FILTERS = [
  { key: 'noAlcohol', icon: '🚫', label: 'Sin Alcohol' },
  { key: 'burkiniOk', icon: '🧕', label: 'Burkini OK' },
  { key: 'halal', icon: '🍖', label: 'Halal' },
  { key: 'ramadan', icon: '🌙', label: 'Ramadán' },
  { key: 'family', icon: '👨‍👩‍👧', label: 'Familia' },
  { key: 'honeymoon', icon: '💒', label: 'Luna de miel' },
]

const MOCK_HOTELS = [
  { id: '1', name: 'Hotel Djerba Plaza', stars: 4, city: 'Djerba', country: 'Túnez', rating: 8.7, price: 285, currency: 'TND', amenities: ['Piscina', 'WiFi', 'Spa', 'Restaurante'], culturalFilters: { halal: true, noAlcohol: false } },
  { id: '2', name: 'Riu Imperial Marhaba', stars: 5, city: 'Hammamet', country: 'Túnez', rating: 9.1, price: 420, currency: 'TND', amenities: ['Playa privada', 'Piscina', 'Animación', 'Todo incluido'], culturalFilters: { family: true } },
  { id: '3', name: 'Atlas Asni Marrakech', stars: 4, city: 'Marrakech', country: 'Marruecos', rating: 8.4, price: 650, currency: 'MAD', amenities: ['Riad', 'Piscina', 'Spa', 'WiFi'], culturalFilters: { halal: true, noAlcohol: true } },
  { id: '4', name: 'Barceló Tiran Sharm', stars: 5, city: 'Sharm el-Sheij', country: 'Egipto', rating: 9.3, price: 185, currency: 'EGP', amenities: ['Buceo', 'Piscina', 'Todo incl.', 'Spa'] },
  { id: '5', name: 'Mercure Argel Aeropuerto', stars: 4, city: 'Argel', country: 'Argelia', rating: 7.9, price: 12000, currency: 'DZD', amenities: ['WiFi', 'Restaurante', 'Lanzadera'] },
  { id: '6', name: 'Steigenberger Aqua Magic', stars: 5, city: 'Hurghada', country: 'Egipto', rating: 8.8, price: 155, currency: 'EGP', amenities: ['Parque acuático', 'Piscina', 'Playa', 'Spa'], culturalFilters: { family: true, burkiniOk: true } },
]

const FLASH_DEALS = [
  { id: '1', name: 'Hotel Djerba Sun Club', stars: 4, originalPrice: 380, price: 220, discount: 42, currency: 'TND', country: 'Túnez' },
  { id: '2', name: 'Palmeraie Marrakech', stars: 5, originalPrice: 950, price: 560, discount: 41, currency: 'MAD', country: 'Marruecos' },
  { id: '3', name: 'Pickalbatros Aqua Blu', stars: 5, originalPrice: 280, price: 145, discount: 48, currency: 'EGP', country: 'Egipto' },
]

const BLOG_POSTS = [
  { id: 'es-1', title: 'Los 10 mejores hoteles en Djerba 2026 — Guía para españoles', category: 'Guía', excerpt: 'Nuestra selección de los mejores establecimientos de la isla tunecina para viajeros españoles.', date: '12 Ene 2026', readTime: '5 min', gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)' },
  { id: 'es-2', title: 'Hoteles halal en Marruecos: guía para familias musulmanas', category: 'Halal', excerpt: 'Encuentra alojamiento conforme a tus valores con nuestra guía detallada 2026.', date: '8 Ene 2026', readTime: '7 min', gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' },
  { id: 'es-3', title: 'Marruecos a 1h de vuelo desde Madrid — guía completa', category: 'Consejos', excerpt: 'Todo lo que necesitas saber para organizar tu viaje perfecto al Reino de Marruecos.', date: '5 Ene 2026', readTime: '4 min', gradient: 'linear-gradient(135deg, #FF6B35 0%, #e55a24 100%)' },
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
      <div style={{ fontSize: 40, fontWeight: 900, color: '#FF6B35' }}>{count.toLocaleString('es-ES')}{suffix}</div>
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

export default function HomePageES() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState(MOCK_HOTELS)

  useEffect(() => {
    hotelAPI.getFeatured().then(res => {
      if (res.data?.length) setFeatured(res.data.slice(0, 6))
    }).catch(() => {})
  }, [])

  return (
    <div style={{ background: '#F8F9FA' }}>
      {/* SEO HEAD (rendered via meta tags in document) */}
      <title>EasyHotels — Compara precios de hoteles en Marruecos, Túnez, Argelia, Egipto</title>

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
            ✈ Compara los mejores precios — 500+ hoteles en el Norte de África
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 64px)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: 20,
          }}>
            Encuentra tu hotel ideal en{' '}
            <span style={{ color: '#FFC72C' }}>el Norte de África</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginBottom: 40, lineHeight: 1.6 }}>
            Booking.com, Expedia, Hotels.com — todo en un solo lugar. Ahorra hasta un 60%.
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 16, padding: 24,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <SearchBar inline={true} />
          </div>

          {/* Trust badges — Spain specific */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: 16, marginTop: 28,
          }}>
            {[
              { icon: '💶', label: 'Pago seguro en €' },
              { icon: '🇪🇸', label: 'Soporte en español' },
              { icon: '🔍', label: '50+ fuentes' },
              { icon: '✅', label: 'Sin comisiones ocultas' },
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

      {/* DIASPORA CALLOUT */}
      <section style={{
        background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
        padding: '40px 24px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>🇲🇦</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>La comunidad marroquí en España</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, maxWidth: 560 }}>
              ¿Vuelves a casa? Encuentra las mejores ofertas de hoteles para tus vacaciones en Marruecos, Túnez y el Magreb.
            </p>
          </div>
          <button
            onClick={() => navigate('/es/buscar?destination=Marruecos')}
            style={{
              background: '#fff', color: '#c0392b',
              padding: '14px 28px', borderRadius: 10,
              fontSize: 15, fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Ver hoteles en Marruecos →
          </button>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#fff', padding: '60px 24px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40 }}>
          <CounterStat value={51} suffix="+" label="Hoteles referenciados" />
          <CounterStat value={7} suffix="" label="Países cubiertos" />
          <CounterStat value={5} suffix="" label="Comparadores de precios" />
          <CounterStat value={50000} suffix="+" label="Viajeros satisfechos" />
        </div>
      </section>

      {/* SPANISH TOURISTS SECTION */}
      <section style={{ background: '#F0F7FF', padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>
            Para turistas españoles
          </h2>
          <p style={{ fontSize: 18, color: '#4a5568', marginBottom: 32 }}>
            Marruecos a solo <strong>1h de vuelo desde Madrid</strong>. Túnez a <strong>2h30 desde Barcelona</strong>.
            El Norte de África nunca ha estado tan cerca.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icon: '🛫', title: 'Vuelos directos', desc: 'Desde Madrid, Barcelona, Valencia, Sevilla...' },
              { icon: '🌡️', title: 'Sol garantizado', desc: '300+ días de sol al año en el Mediterráneo africano' },
              { icon: '💰', title: 'Precio x2 más barato', desc: 'Destinos donde tu euro vale mucho más' },
              { icon: '🍽️', title: 'Gastronomía increíble', desc: 'Cuscús, tagine, briks... sabores únicos' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>
            🌍 Destinos populares
          </h2>
          <p style={{ color: '#718096', fontSize: 16 }}>
            Explora los destinos más elegidos del Magreb y Oriente Próximo
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {DESTINATIONS.map(d => (
            <div
              key={d.city}
              onClick={() => navigate(`/es/buscar?destination=${d.city}`)}
              style={{
                background: d.gradient,
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                height: 200,
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{d.flag}</span>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{d.city}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                      {d.country} · {d.hotels} hoteles
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
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748' }}>Hoteles recomendados</h2>
            <Link to="/es/buscar" style={{ color: '#FF6B35', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver todos los hoteles →
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'thin' }}>
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
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>Ofertas Flash</h2>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 16, marginBottom: 8 }}>
              Expira en <FlashCountdown />
            </div>
            <p style={{ color: '#64748b', fontSize: 14 }}>Estos precios excepcionales son limitados en el tiempo</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {FLASH_DEALS.map((deal, i) => (
              <div
                key={deal.id}
                onClick={() => navigate(`/hotel/${deal.id}`)}
                style={{ background: '#1e293b', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}
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
                  <span style={{ position: 'absolute', top: 12, right: 12, background: '#e53e3e', color: '#fff', fontSize: 14, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
                    -{deal.discount}%
                  </span>
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{deal.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    {Array.from({ length: deal.stars }).map((_, j) => (
                      <span key={j} style={{ color: '#FFC72C', fontSize: 14 }}>★</span>
                    ))}
                    <span style={{ color: '#64748b', fontSize: 13 }}>· {deal.country}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: 13, textDecoration: 'line-through', display: 'block' }}>
                        {deal.originalPrice} {deal.currency}
                      </span>
                      <CurrencyDisplay amount={deal.price} currency={deal.currency} showEUR={true} />
                    </div>
                    <button style={{ background: '#FF6B35', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                      Reservar →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/flash-deals" style={{
              display: 'inline-block', border: '2px solid #FF6B35', color: '#FF6B35',
              padding: '12px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FF6B35'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FF6B35' }}
            >
              Ver todas las ofertas flash ⚡
            </Link>
          </div>
        </div>
      </section>

      {/* CULTURAL FILTERS */}
      <section style={{ padding: '80px 24px', background: '#f0f4f8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>
            Hoteles que respetan tus valores
          </h2>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 48 }}>
            Filtra los hoteles según tus necesidades y convicciones
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16 }}>
            {CULTURAL_FILTERS.map(f => (
              <div
                key={f.key}
                onClick={() => navigate(`/es/buscar?${f.key}=true`)}
                style={{
                  background: '#fff', borderRadius: 16, padding: '24px 16px',
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s', border: '2px solid transparent',
                }}
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

      {/* HOW IT WORKS */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>Cómo funciona</h2>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 60 }}>Encuentra el mejor precio en 3 pasos sencillos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
            {[
              { step: '01', icon: '🔍', title: 'Busca tu destino', desc: 'Introduce tu destino y fechas. Nuestro motor consulta 50+ fuentes simultáneamente.' },
              { step: '02', icon: '💰', title: 'Compara precios de 5 fuentes', desc: 'Visualiza los precios de Booking.com, Expedia, Hotels.com y más en un solo vistazo. Precios en € incluidos.' },
              { step: '03', icon: '✈️', title: 'Viaja al mejor precio', desc: 'Haz clic en la mejor oferta y reserva directamente en el sitio socio. Ahorra hasta un 60%.' },
            ].map((step, i) => (
              <div key={i} style={{ position: 'relative', padding: '32px 24px', background: '#F8F9FA', borderRadius: 16 }}>
                <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #FF6B35, #FFC72C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px' }}>
                  {step.icon}
                </div>
                <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 48, fontWeight: 900, color: '#e2e8f0' }}>{step.step}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 12 }}>{step.title}</h3>
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
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748' }}>Guías y Consejos</h2>
            <Link to="/es/blog" style={{ color: '#FF6B35', fontSize: 14, fontWeight: 600 }}>Ver todos los artículos →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {BLOG_POSTS.map(post => (
              <Link key={post.id} to={`/es/blog`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
                >
                  <div style={{ height: 160, background: post.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 48 }}>📖</span>
                  </div>
                  <div style={{ padding: 20 }}>
                    <span style={{ background: '#EBF8FF', color: '#2c5282', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                      {post.category}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', margin: '10px 0 8px', lineHeight: 1.4 }}>{post.title}</h3>
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

      {/* HOTELIER CTA */}
      <section style={{ background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🏨</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 16 }}>¿Eres hotelero?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 12 }}>
            Únete a <strong>47 socios de EasyHotels</strong> y aumenta tu visibilidad
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 40 }}>
            +340% de visibilidad · +28% de reservas directas · Sin comisión
          </p>
          <Link
            to="/hoteliers"
            style={{
              display: 'inline-block', background: '#FF6B35', color: '#fff',
              padding: '16px 40px', borderRadius: 10, fontSize: 16, fontWeight: 700,
              boxShadow: '0 8px 30px rgba(255,107,53,0.4)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,53,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,53,0.4)' }}
          >
            Registrar mi hotel →
          </Link>
        </div>
      </section>
    </div>
  )
}
