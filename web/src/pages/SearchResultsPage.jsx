import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import HotelCard from '../components/HotelCard'
import SearchBar from '../components/SearchBar'
import { hotelAPI } from '../services/api'

const MOCK_RESULTS = [
  { id: '1', name: 'Hôtel Djerba Plaza Thalassa', stars: 4, city: 'Djerba', country: 'Tunisie', rating: 8.7, price: 285, currency: 'TND', amenities: ['Piscine', 'WiFi', 'Spa', 'Restaurant', 'Plage'], culturalFilters: { halal: true } },
  { id: '2', name: 'Riu Imperial Marhaba Beach', stars: 5, city: 'Hammamet', country: 'Tunisie', rating: 9.1, price: 420, currency: 'TND', amenities: ['Plage privée', 'Piscine', 'Animation', 'All-inclusive', 'Spa'], culturalFilters: { family: true } },
  { id: '3', name: 'Atlas Asni Marrakech', stars: 4, city: 'Marrakech', country: 'Maroc', rating: 8.4, price: 650, currency: 'MAD', amenities: ['Riad', 'Piscine', 'Spa', 'WiFi', 'Restaurant'], culturalFilters: { halal: true, noAlcohol: true } },
  { id: '4', name: 'Barceló Tiran Sharm', stars: 5, city: 'Sharm El Sheikh', country: 'Égypte', rating: 9.3, price: 185, currency: 'USD', amenities: ['Plongée', 'Piscine', 'Tout incl.', 'Spa', 'Plage'] },
  { id: '5', name: 'Mercure Alger Aéroport', stars: 4, city: 'Alger', country: 'Algérie', rating: 7.9, price: 12000, currency: 'DZD', amenities: ['WiFi', 'Restaurant', 'Navette', 'Gym'] },
  { id: '6', name: 'Steigenberger Aqua Magic', stars: 5, city: 'Hurghada', country: 'Égypte', rating: 8.8, price: 155, currency: 'USD', amenities: ['Parc aquatique', 'Piscine', 'Beach', 'Spa'], culturalFilters: { family: true, burkiniOk: true } },
  { id: '7', name: 'Hôtel Sousse Palace', stars: 3, city: 'Sousse', country: 'Tunisie', rating: 7.6, price: 145, currency: 'TND', amenities: ['WiFi', 'Piscine', 'Restaurant'], culturalFilters: { noAlcohol: true, ramadan: true } },
  { id: '8', name: 'Royal Mansour Marrakech', stars: 5, city: 'Marrakech', country: 'Maroc', rating: 9.6, price: 4500, currency: 'MAD', amenities: ['Spa de luxe', 'Piscine privée', 'Restaurant étoilé', 'Butler'], culturalFilters: { honeymoon: true } },
]

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommandé' },
  { value: 'price_asc', label: 'Prix ↑' },
  { value: 'price_desc', label: 'Prix ↓' },
  { value: 'rating', label: 'Note' },
]

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const destination = searchParams.get('destination') || ''

  const [hotels, setHotels] = useState(MOCK_RESULTS)
  const [filtered, setFiltered] = useState(MOCK_RESULTS)
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('recommended')
  const [page, setPage] = useState(1)
  const [showMap, setShowMap] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

    // Sort
    if (sort === 'price_asc') result.sort((a, b) => (a.price || 0) - (b.price || 0))
    else if (sort === 'price_desc') result.sort((a, b) => (b.price || 0) - (a.price || 0))
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

  const inputStyle = { fontSize: 13, color: '#2d3748', cursor: 'pointer' }

  const SidebarContent = () => (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#2d3748' }}>Filtres</h3>

      {/* Stars */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 12 }}>Catégorie (étoiles)</h4>
        {[5, 4, 3, 2, 1].map(s => (
          <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.stars.includes(s)}
              onChange={() => toggleFilter('stars', s)}
            />
            <span style={inputStyle}>{'★'.repeat(s)} {s} étoile{s > 1 ? 's' : ''}</span>
          </label>
        ))}
      </div>

      {/* Cultural */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 12 }}>Filtres culturels</h4>
        {[
          { key: 'noAlcohol', label: '🚫 Sans Alcool' },
          { key: 'burkiniOk', label: '🧕 Burkini OK' },
          { key: 'halal', label: '🍖 Halal' },
          { key: 'ramadan', label: '🌙 Ramadan' },
          { key: 'family', label: '👨‍👩‍👧 Famille' },
          { key: 'honeymoon', label: '💒 Lune de miel' },
        ].map(f => (
          <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.cultural.includes(f.key)}
              onChange={() => toggleFilter('cultural', f.key)}
            />
            <span style={inputStyle}>{f.label}</span>
          </label>
        ))}
      </div>

      {/* Countries */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#4a5568', marginBottom: 12 }}>Pays</h4>
        {['Tunisie', 'Maroc', 'Algérie', 'Égypte', 'Mauritanie'].map(c => (
          <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.countries.includes(c)}
              onChange={() => toggleFilter('countries', c)}
            />
            <span style={inputStyle}>{c}</span>
          </label>
        ))}
      </div>

      <button
        onClick={() => setFilters({ priceMin: 0, priceMax: 10000, stars: [], countries: [], cultural: [] })}
        style={{
          width: '100%', padding: '10px', borderRadius: 8,
          background: '#FF6B35', color: '#fff', fontWeight: 600, fontSize: 14,
        }}
      >
        Réinitialiser les filtres
      </button>
    </div>
  )

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Sticky search bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px', position: 'sticky', top: 64, zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      }}>
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
        {/* Sidebar - desktop */}
        <aside style={{
          width: 280, flexShrink: 0,
          background: '#fff', borderRadius: 12,
          padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          position: 'sticky', top: 160,
        }} className="search-sidebar">
          <SidebarContent />
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748' }}>
                {destination ? `Hôtels à ${destination}` : 'Tous les hôtels'}
              </h1>
              <p style={{ color: '#718096', fontSize: 14, marginTop: 4 }}>
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => setShowMap(true)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#2d3748', fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                🗺️ Carte
              </button>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#2d3748', fontSize: 13, fontWeight: 500,
                  outline: 'none',
                }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', height: 340 }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="skeleton" style={{ height: 16, borderRadius: 4, width: '80%' }} />
                    <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '60%' }} />
                    <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 20,
                marginBottom: 32,
              }}>
                {currentHotels.map((hotel, i) => (
                  <HotelCard key={hotel._id || hotel.id} hotel={hotel} index={i} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: '#718096' }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>Aucun résultat</h3>
                  <p>Essayez de modifier vos filtres ou votre destination</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                      background: page === 1 ? '#f7fafc' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer',
                      color: page === 1 ? '#a0aec0' : '#2d3748', fontWeight: 600,
                    }}
                  >
                    ← Précédent
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      style={{
                        width: 40, height: 40, borderRadius: 8,
                        border: '1.5px solid ' + (page === i + 1 ? '#FF6B35' : '#e2e8f0'),
                        background: page === i + 1 ? '#FF6B35' : '#fff',
                        color: page === i + 1 ? '#fff' : '#2d3748',
                        fontWeight: 700, fontSize: 14,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                      background: page === totalPages ? '#f7fafc' : '#fff',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      color: page === totalPages ? '#a0aec0' : '#2d3748', fontWeight: 600,
                    }}
                  >
                    Suivant →
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
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowMap(false)}
        >
          <div
            style={{ width: '90vw', height: '80vh', borderRadius: 16, overflow: 'hidden', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMap(false)}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 10,
                background: '#fff', border: 'none', borderRadius: '50%',
                width: 36, height: 36, fontSize: 18, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              ✕
            </button>
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=8.0,30.0,14.0,37.5&layer=mapnik&marker=36.8,10.2`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Carte des hôtels"
            />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .search-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  )
}
