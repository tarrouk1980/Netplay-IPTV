import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import StarRating from '../components/StarRating'
import RatingBadge from '../components/RatingBadge'
import PriceComparisonTable from '../components/PriceComparisonTable'
import HotelCard from '../components/HotelCard'
import { hotelAPI } from '../services/api'

const MOCK_HOTEL = {
  id: '1',
  name: 'Hôtel Djerba Plaza Thalassa & Aquapark',
  stars: 4,
  city: 'Djerba',
  country: 'Tunisie',
  rating: 8.7,
  reviewCount: 1243,
  price: 285,
  currency: 'TND',
  description: "Situé en bord de mer sur l'île enchanteresse de Djerba, l'Hôtel Djerba Plaza Thalassa & Aquapark vous offre une expérience balnéaire incomparable. Profitez de sa plage privée de sable blanc, de ses 4 piscines dont une dédiée aux enfants, et de son centre thalasso primé. L'établissement propose une cuisine raffinée mêlant saveurs locales et internationales dans ses 5 restaurants.",
  amenities: [
    { icon: '🏖️', label: 'Plage privée' },
    { icon: '🏊', label: '4 Piscines' },
    { icon: '🧖', label: 'Spa & Thalasso' },
    { icon: '📶', label: 'WiFi gratuit' },
    { icon: '🍽️', label: '5 Restaurants' },
    { icon: '🎾', label: 'Tennis' },
    { icon: '🏋️', label: 'Salle de sport' },
    { icon: '🎭', label: 'Animation' },
    { icon: '🚗', label: 'Parking' },
    { icon: '🌿', label: 'Jardin tropical' },
    { icon: '🎰', label: 'Club enfants' },
    { icon: '💆', label: 'Hammam' },
  ],
  culturalFilters: { halal: true, noAlcohol: false, family: true },
  images: [null, null, null, null, null],
  gradients: [
    'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)',
    'linear-gradient(135deg, #FF6B35 0%, #FFC72C 100%)',
    'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  ],
  reviews: [
    { author: 'Mohammed A.', country: '🇫🇷', rating: 9.2, date: 'Décembre 2025', comment: 'Séjour absolument magnifique ! La plage est superbe, le personnel aux petits soins. Le buffet du petit-déjeuner est exceptionnel avec une variété incroyable.', room: 'Junior Suite Vue Mer' },
    { author: 'Fatima B.', country: '🇩🇿', rating: 8.8, date: 'Novembre 2025', comment: "L'hôtel est parfait pour les familles. Les enfants ont adoré l'aquapark et le mini-club. Les chambres sont spacieuses et très propres.", room: 'Chambre Familiale' },
    { author: 'Karim L.', country: '🇧🇪', rating: 9.0, date: 'Octobre 2025', comment: 'Excellent rapport qualité-prix. Le thalasso est incroyable, j\'y suis allé chaque jour. Personnel très professionnel et souriant.', room: 'Chambre Standard' },
  ],
}

const SIMILAR = [
  { id: '2', name: 'Riu Imperial Marhaba', stars: 5, city: 'Hammamet', country: 'Tunisie', rating: 9.1, price: 420, currency: 'TND' },
  { id: '7', name: 'Hôtel Sousse Palace', stars: 3, city: 'Sousse', country: 'Tunisie', rating: 7.6, price: 145, currency: 'TND' },
  { id: '3', name: 'Atlas Asni Marrakech', stars: 4, city: 'Marrakech', country: 'Maroc', rating: 8.4, price: 650, currency: 'MAD' },
]

const TABS = ['Aperçu', 'Prix', 'Avis', 'Chambres']

export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState(MOCK_HOTEL)
  const [prices, setPrices] = useState(null)
  const [activeTab, setActiveTab] = useState('Aperçu')
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    hotelAPI.getById(id).then(res => {
      if (res.data) setHotel(res.data)
    }).catch(() => {})
    hotelAPI.getPrices(id).then(res => {
      if (res.data) setPrices(res.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const gradients = hotel.gradients || MOCK_HOTEL.gradients

  return (
    <div style={{ paddingTop: 64, background: '#F8F9FA', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', fontSize: 13, color: '#718096', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/" style={{ color: '#FF6B35' }}>Accueil</Link>
          <span>›</span>
          <Link to="/search" style={{ color: '#FF6B35' }}>Hôtels</Link>
          <span>›</span>
          <Link to={`/search?destination=${hotel.city}`} style={{ color: '#FF6B35' }}>{hotel.city}</Link>
          <span>›</span>
          <span>{hotel.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2d3748', marginBottom: 8 }}>
                    {hotel.name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <StarRating rating={hotel.stars} size={18} />
                    <span style={{ color: '#718096', fontSize: 14 }}>
                      📍 {hotel.city}, {hotel.country}
                    </span>
                    {hotel.rating && <RatingBadge score={hotel.rating} size="md" />}
                    {hotel.reviewCount && (
                      <span style={{ color: '#718096', fontSize: 13 }}>
                        {hotel.reviewCount.toLocaleString()} avis
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div style={{ marginBottom: 32, display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'repeat(2, 160px)', gap: 8, borderRadius: 16, overflow: 'hidden' }}>
              <div
                style={{
                  gridRow: '1 / 3',
                  background: gradients[0],
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 64,
                }}
              >
                🏨
              </div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  background: gradients[i % gradients.length],
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, opacity: 0.85,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
                >
                  {['🏖️', '🏊', '🍽️', '🌴'][i - 1]}
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0', marginBottom: 28,
            }}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 20px', fontSize: 14, fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: activeTab === tab ? '#FF6B35' : '#718096',
                    borderBottom: `2px solid ${activeTab === tab ? '#FF6B35' : 'transparent'}`,
                    marginBottom: -2, transition: 'all 0.2s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab: Aperçu */}
            {activeTab === 'Aperçu' && (
              <div>
                <p style={{ color: '#4a5568', lineHeight: 1.8, fontSize: 15, marginBottom: 32 }}>
                  {hotel.description || MOCK_HOTEL.description}
                </p>

                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2d3748', marginBottom: 20 }}>
                  Équipements & Services
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 12, marginBottom: 32,
                }}>
                  {(hotel.amenities?.map ? hotel.amenities : MOCK_HOTEL.amenities).map((a, i) => {
                    const amenity = typeof a === 'string' ? { icon: '✓', label: a } : a
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#f7fafc', borderRadius: 8, padding: '10px 14px',
                      }}>
                        <span style={{ fontSize: 20 }}>{amenity.icon}</span>
                        <span style={{ fontSize: 13, color: '#4a5568', fontWeight: 500 }}>{amenity.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Cultural filters */}
                {hotel.culturalFilters && Object.values(hotel.culturalFilters).some(Boolean) && (
                  <div style={{ background: '#f0fff4', borderRadius: 12, padding: 20, border: '1px solid #c6f6d5' }}>
                    <h4 style={{ fontWeight: 700, color: '#276749', marginBottom: 12 }}>Valeurs & Convictions</h4>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {hotel.culturalFilters.halal && <span style={{ background: '#276749', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>🍖 Halal</span>}
                      {hotel.culturalFilters.noAlcohol && <span style={{ background: '#276749', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>🚫 Sans Alcool</span>}
                      {hotel.culturalFilters.family && <span style={{ background: '#276749', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>👨‍👩‍👧 Idéal famille</span>}
                      {hotel.culturalFilters.burkiniOk && <span style={{ background: '#276749', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>🧕 Burkini OK</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Prix */}
            {activeTab === 'Prix' && (
              <PriceComparisonTable hotel={hotel} prices={prices} />
            )}

            {/* Tab: Avis */}
            {activeTab === 'Avis' && (
              <div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 56, fontWeight: 900, color: '#FF6B35' }}>{hotel.rating}</div>
                    <RatingBadge score={hotel.rating} size="lg" />
                    <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>
                      Basé sur {hotel.reviewCount?.toLocaleString() || '1 243'} avis
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[
                      { label: 'Propreté', score: 9.1 },
                      { label: 'Confort', score: 8.8 },
                      { label: 'Services', score: 9.0 },
                      { label: 'Emplacement', score: 8.7 },
                      { label: 'Rapport qualité/prix', score: 8.5 },
                    ].map(r => (
                      <div key={r.label} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 180, fontSize: 13, color: '#4a5568' }}>{r.label}</span>
                        <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${r.score * 10}%`, height: '100%', background: '#FF6B35', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2d3748', width: 32, textAlign: 'right' }}>{r.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {(hotel.reviews || MOCK_HOTEL.reviews).map((r, i) => (
                    <div key={i} style={{ background: '#f7fafc', borderRadius: 12, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#2d3748', marginBottom: 2 }}>
                            {r.author} {r.country}
                          </div>
                          <div style={{ fontSize: 12, color: '#718096' }}>
                            {r.room} · {r.date}
                          </div>
                        </div>
                        <RatingBadge score={r.rating} size="md" />
                      </div>
                      <p style={{ color: '#4a5568', fontSize: 14, lineHeight: 1.7 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Chambres */}
            {activeTab === 'Chambres' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { type: 'Chambre Standard', capacity: 2, size: '25 m²', price: 285, features: ['Vue jardin', '1 lit double', 'Climatisation', 'Minibar'] },
                  { type: 'Chambre Vue Mer', capacity: 2, size: '28 m²', price: 340, features: ['Vue mer', '1 lit double', 'Balcon', 'Climatisation', 'Minibar'] },
                  { type: 'Junior Suite', capacity: 3, size: '45 m²', price: 480, features: ['Vue mer panoramique', '1 lit King', 'Salon séparé', 'Jacuzzi', 'Service de chambre 24h'] },
                  { type: 'Suite Familiale', capacity: 4, size: '60 m²', price: 620, features: ['Vue mer', '2 chambres', 'Salon', 'Kitchenette', 'Piscine privée'] },
                ].map((room, i) => (
                  <div key={i} style={{
                    background: '#fff', borderRadius: 12, padding: 24,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
                  }}>
                    <div style={{
                      width: 160, height: 120, borderRadius: 8, flexShrink: 0,
                      background: ['linear-gradient(135deg,#004E89,#1a6eac)', 'linear-gradient(135deg,#FF6B35,#FFC72C)', 'linear-gradient(135deg,#764ba2,#667eea)', 'linear-gradient(135deg,#48bb78,#38a169)'][i],
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                    }}>
                      🛏️
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', marginBottom: 6 }}>{room.type}</h3>
                      <div style={{ fontSize: 13, color: '#718096', marginBottom: 10 }}>
                        👥 {room.capacity} personnes · 📐 {room.size}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {room.features.map((f, fi) => (
                          <span key={fi} style={{ fontSize: 12, background: '#EBF8FF', color: '#2c5282', padding: '3px 8px', borderRadius: 6 }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#FF6B35', marginBottom: 8 }}>
                        {room.price} TND
                      </div>
                      <div style={{ fontSize: 12, color: '#718096', marginBottom: 12 }}>par nuit</div>
                      <button style={{
                        background: '#FF6B35', color: '#fff',
                        padding: '10px 20px', borderRadius: 8,
                        fontSize: 13, fontWeight: 700,
                      }}>
                        Réserver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Similar Hotels */}
            <div style={{ marginTop: 48 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#2d3748', marginBottom: 20 }}>
                Hôtels similaires
              </h3>
              <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 8 }}>
                {SIMILAR.map((h, i) => (
                  <div key={h.id} style={{ minWidth: 260, maxWidth: 260 }}>
                    <HotelCard hotel={h} index={i} compact />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside style={{
            width: 300, flexShrink: 0,
            position: 'sticky', top: 80,
          }} className="hotel-sidebar">
            <div style={{
              background: '#fff', borderRadius: 16, padding: 24,
              boxShadow: '0 4px 30px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
            }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#718096' }}>À partir de</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#FF6B35' }}>
                  {hotel.price || 285} <span style={{ fontSize: 16, color: '#718096', fontWeight: 400 }}>TND/nuit</span>
                </div>
                <RatingBadge score={hotel.rating || 8.7} size="md" />
              </div>

              <div style={{ background: '#f7fafc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: '#4a5568' }}>
                <div style={{ marginBottom: 4 }}>📅 Check-in: Flexible</div>
                <div>👥 2 voyageurs</div>
              </div>

              <button style={{
                width: '100%', padding: '14px', borderRadius: 10,
                background: '#FF6B35', color: '#fff',
                fontSize: 16, fontWeight: 700, marginBottom: 12,
                boxShadow: '0 4px 15px rgba(255,107,53,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e55a24'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FF6B35'; e.currentTarget.style.transform = 'translateY(0)' }}
              onClick={() => setActiveTab('Prix')}
              >
                Voir les prix →
              </button>
              <button style={{
                width: '100%', padding: '12px', borderRadius: 10,
                border: '1.5px solid #FF6B35', color: '#FF6B35',
                background: '#fff', fontSize: 14, fontWeight: 600,
              }}>
                ♡ Sauvegarder
              </button>

              <div style={{ marginTop: 16, fontSize: 12, color: '#a0aec0', textAlign: 'center' }}>
                ✓ Aucun frais de réservation · ✓ Meilleur prix garanti
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hotel-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  )
}
