import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import HotelCard from '../../components/HotelCard'
import SearchBar from '../../components/SearchBar'
import CurrencyDisplay from '../../components/CurrencyDisplay'
import { hotelAPI } from '../../services/api'

function toEUR(price, currency) {
  const rates = { TND: 0.30, MAD: 0.093, DZD: 0.0073, EGP: 0.019, MRU: 0.025 }
  return Math.round(price * (rates[currency] || 1))
}

const MOCK_RESULTS = [
  { id: '1', name: 'Hotel Djerba Plaza Thalassa', stars: 4, city: 'Djerba', country: 'Túnez', rating: 8.7, price: 285, currency: 'TND', amenities: ['Piscina', 'WiFi', 'Spa', 'Restaurante', 'Playa'], culturalFilters: { halal: true } },
  { id: '2', name: 'Riu Imperial Marhaba Beach', stars: 5, city: 'Hammamet', country: 'Túnez', rating: 9.1, price: 420, currency: 'TND', amenities: ['Playa privada', 'Piscina', 'Animación', 'Todo incluido', 'Spa'], culturalFilters: { family: true } },
  { id: '3', name: 'Atlas Asni Marrakech', stars: 4, city: 'Marrakech', country: 'Marruecos', rating: 8.4, price: 650, currency: 'MAD', amenities: ['Riad', 'Piscina', 'Spa', 'WiFi', 'Restaurante'], culturalFilters: { halal: true, noAlcohol: true } },
  { id: '4', name: 'Barceló Tiran Sharm', stars: 5, city: 'Sharm el-Sheij', country: 'Egipto', rating: 9.3, price: 185, currency: 'EGP', amenities: ['Buceo', 'Piscina', 'Todo incl.', 'Spa', 'Playa'] },
  { id: '5', name: 'Mercure Argel Aeropuerto', stars: 4, city: 'Argel', country: 'Argelia', rating: 7.9, price: 12000, currency: 'DZD', amenities: ['WiFi', 'Restaurante', 'Lanzadera', 'Gimnasio'] },
  { id: '6', name: 'Steigenberger Aqua Magic', stars: 5, city: 'Hurghada', country: 'Egipto', rating: 8.8, price: 155, currency: 'EGP', amenities: ['Parque acuático', 'Piscina', 'Playa', 'Spa'], culturalFilters: { family: true, burkiniOk: true } },
  { id: '7', name: 'Hotel Sousse Palace', stars: 3, city: 'Susa', country: 'Túnez', rating: 7.6, price: 145, currency: 'TND', amenities: ['WiFi', 'Piscina', 'Restaurante'], culturalFilters: { noAlcohol: true, ramadan: true } },
  { id: '8', name: 'Royal Mansour Marrakech', stars: 5, city: 'Marrakech', country: 'Marruecos', rating: 9.6, price: 4500, currency: 'MAD', amenities: ['Spa de lujo', 'Piscina privada', 'Restaurante estrella', 'Mayordomo'], culturalFilters: { honeymoon: true } },
]

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'price_asc', label: 'Precio ↑' },
  { value: 'price_desc', label: 'Precio ↓' },
  { value: 'rating', label: 'Valoración' },
]

const CULTURAL_FILTER_OPTIONS = [
  { key: 'noAlcohol', label: '🚫 Sin Alcohol' },
  { key: 'burkiniOk', label: '🧕 Burkini OK' },
  { key: 'halal', label: '🍖 Halal' },
  { key: 'ramadan', label: '🌙 Ramadán' },
  { key: 'family', label: '👨‍👩‍👧 Familia' },
  { key: 'honeymoon', label: '💒 Luna de miel' },
]

const COUNTRIES_ES = ['Túnez', 'Marruecos', 'Argelia', 'Egipto', 'Mauritania']

// Hotel card adapted for Spanish with EUR display
function HotelCardES({ hotel }) {
  const navigate = useNavigate()
  const eurPrice = toEUR(hotel.price, hotel.currency)

  return (
    <div
      onClick={() => navigate(`/hotel/${hotel.id}`)}
      style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
    >
      {/* Image placeholder */}
      <div style={{
        height: 180,
        background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', fontSize: 48,
      }}>
        🏨
        {/* Cultural badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {hotel.culturalFilters?.halal && (
            <span style={{ background: '#276749', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>🍖 Halal</span>
          )}
          {hotel.culturalFilters?.noAlcohol && (
            <span style={{ background: '#c05621', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>🚫 Sin Alcohol</span>
          )}
          {hotel.culturalFilters?.family && (
            <span style={{ background: '#2c5282', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>👨‍👩‍👧 Familia</span>
          )}
        </div>
        <span style={{ position: 'absolute', top: 12, right: 12, background: '#FF6B35', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>
          {hotel.rating} ★
        </span>
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <span key={i} style={{ color: '#FFC72C', fontSize: 13 }}>★</span>
          ))}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', marginBottom: 4, lineHeight: 1.3 }}>{hotel.name}</h3>
        <p style={{ fontSize: 13, color: '#718096', marginBottom: 12 }}>📍 {hotel.city}, {hotel.country}</p>

        {/* Amenities */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {(hotel.amenities || []).slice(0, 3).map(a => (
            <span key={a} style={{ fontSize: 11, background: '#F7FAFC', color: '#4a5568', padding: '2px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              {a}
            </span>
          ))}
        </div>

        {/* Price with EUR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FF6B35' }}>
              {hotel.price} {hotel.currency}
            </div>
            <div style={{ fontSize: 13, color: '#718096' }}>
              ≈ {eurPrice}€ <span style={{ fontSize: 11 }}>por noche</span>
            </div>
          </div>
          <button style={{
            background: '#FF6B35', color: '#fff',
            padding: '10px 18px', borderRadius: 8,
            fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}>
            Ver ofertas →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SearchResultsPageES() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const destination = searchParams.get('destination') || ''

  const [hotels, setHotels] = useState(MOCK_RESULTS)
  const [filtered, setFiltered] = useState(MOCK_RESULTS)
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('recommended')
  const [page, setPage] = useState(1)
  const [showMap, setShowMap] = useState(false)

  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000,
    stars: [],
    countries: [],
    cultural: [],
  })

  useEffect(() => {
    setLoading(true)
    hotelAPI.search({
      destination,
      checkin: searchParams.get('checkin'),
      checkout: searchParams.get('checkout'),
      guests: searchParams.get('guests'),
    }).then(res => {
      if (res.data?.hotels?.length) setHotels(res.data.hotels)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [destination])

  useEffect(() => {
    let result = [...hotels]

    if (filters.stars.length > 0) {
      result = result.filter(h => filters.stars.includes(h.stars))
    }
    if (filters.countries.length > 0) {
      result = result.filter(h => filters.countries.includes(h.country))
    }
    if (filters.cultural.length > 0) {
      result = result.filter(h =>
        filters.cultural.every(f => h.culturalFilters?.[f])
      )
    }

    if (sort === 'price_asc') result.sort((a, b) => toEUR(a.price, a.currency) - toEUR(b.price, b.currency))
    else if (sort === 'price_desc') result.sort((a, b) => toEUR(b.price, b.currency) - toEUR(a.price, a.currency))
    else if (sort === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    setFiltered(result)
    setPage(1)
  }, [hotels, filters, sort])

  const toggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(x => x !== value)
        : [...prev[key], value],
    }))
  }

  const PER_PAGE = 6
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const currentHotels = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const SidebarContent = () => (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#2d3748' }}>Filtros</h3>

      {/* Stars */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 12 }}>Categoría (estrellas)</h4>
        {[5, 4, 3, 2, 1].map(s => (
          <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.stars.includes(s)}
              onChange={() => toggleFilter('stars', s)}
            />
            <span style={{ fontSize: 13, color: '#2d3748' }}>{'★'.repeat(s)} {s} estrella{s > 1 ? 's' : ''}</span>
          </label>
        ))}
      </div>

      {/* Cultural filters */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 12 }}>Filtros culturales</h4>
        {CULTURAL_FILTER_OPTIONS.map(f => (
          <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.cultural.includes(f.key)}
              onChange={() => toggleFilter('cultural', f.key)}
            />
            <span style={{ fontSize: 13, color: '#2d3748' }}>{f.label}</span>
          </label>
        ))}
      </div>

      {/* Countries */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 12 }}>País</h4>
        {COUNTRIES_ES.map(c => (
          <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.countries.includes(c)}
              onChange={() => toggleFilter('countries', c)}
            />
            <span style={{ fontSize: 13, color: '#2d3748' }}>{c}</span>
          </label>
        ))}
      </div>

      <button
        onClick={() => setFilters({ priceMin: 0, priceMax: 10000, stars: [], countries: [], cultural: [] })}
        style={{ width: '100%', padding: '10px', borderRadius: 8, background: '#FF6B35', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}
      >
        Restablecer filtros
      </button>
    </div>
  )

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Sticky search bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', position: 'sticky', top: 64, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SearchBar
            inline={true}
            initialValues={{
              destination,
              checkin: searchParams.get('checkin') || '',
              checkout: searchParams.get('checkout') || '',
              guests: Number(searchParams.get('guests')) || 2,
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ width: 280, flexShrink: 0, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'sticky', top: 160 }} className="search-sidebar">
          <SidebarContent />
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748' }}>
                {destination ? `Hoteles en ${destination}` : 'Todos los hoteles'}
              </h1>
              <p style={{ color: '#718096', fontSize: 14, marginTop: 4 }}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => setShowMap(true)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#2d3748', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                🗺️ Mapa
              </button>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#2d3748', fontSize: 13, fontWeight: 500, outline: 'none' }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* EUR note */}
          <div style={{ background: '#EBF8FF', borderRadius: 8, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#2c5282' }}>
            <span>💶</span>
            <span>Los precios se muestran en moneda local con equivalente en euros (≈€) para facilitar la comparación.</span>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', height: 340 }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="skeleton" style={{ height: 16, borderRadius: 4, width: '80%' }} />
                    <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
                {currentHotels.map(hotel => (
                  <HotelCardES key={hotel._id || hotel.id} hotel={hotel} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: '#718096' }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>Sin resultados</h3>
                  <p>Intenta modificar tus filtros o destino</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: page === 1 ? '#f7fafc' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#a0aec0' : '#2d3748', fontWeight: 600 }}
                  >
                    ← Anterior
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      style={{ width: 40, height: 40, borderRadius: 8, border: '1.5px solid ' + (page === i + 1 ? '#FF6B35' : '#e2e8f0'), background: page === i + 1 ? '#FF6B35' : '#fff', color: page === i + 1 ? '#fff' : '#2d3748', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: page === totalPages ? '#f7fafc' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#a0aec0' : '#2d3748', fontWeight: 600 }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowMap(false)}
        >
          <div style={{ width: '90vw', height: '80vh', borderRadius: 16, overflow: 'hidden', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowMap(false)} style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              ✕
            </button>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=8.0,30.0,14.0,37.5&layer=mapnik&marker=36.8,10.2"
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Mapa de hoteles"
            />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .search-sidebar { display: none !important; } }
      `}</style>
    </div>
  )
}
