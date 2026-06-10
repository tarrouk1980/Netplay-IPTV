import React from 'react'
import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating'
import RatingBadge from './RatingBadge'

const GRADIENT_COLORS = [
  'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)',
  'linear-gradient(135deg, #FF6B35 0%, #e55a24 100%)',
  'linear-gradient(135deg, #1a6eac 0%, #48bb78 100%)',
  'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
]

const CULTURAL_ICONS = {
  halal: { icon: '🍖', label: 'Halal' },
  noAlcohol: { icon: '🚫', label: 'Sans alcool' },
  burkiniOk: { icon: '🧕', label: 'Burkini OK' },
  ramadan: { icon: '🌙', label: 'Ramadan' },
  family: { icon: '👨‍👩‍👧', label: 'Famille' },
  honeymoon: { icon: '💒', label: 'Lune de miel' },
}

export default function HotelCard({ hotel, index = 0, compact = false }) {
  const navigate = useNavigate()
  const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length]

  const culturalKeys = hotel.culturalFilters
    ? Object.entries(hotel.culturalFilters).filter(([, v]) => v).map(([k]) => k)
    : []

  return (
    <div
      onClick={() => navigate(`/hotel/${hotel._id || hotel.id}`)}
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      {/* Image */}
      <div style={{
        height: compact ? 160 : 200,
        background: hotel.image ? `url(${hotel.image}) center/cover` : gradient,
        position: 'relative',
        flexShrink: 0,
      }}>
        {hotel.flashDeal && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: '#FF6B35', color: '#fff',
            fontSize: 11, fontWeight: 700,
            padding: '3px 8px', borderRadius: 20,
          }}>
            ⚡ OFFRE FLASH
          </span>
        )}
        {hotel.discount && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: '#e53e3e', color: '#fff',
            fontSize: 12, fontWeight: 700,
            padding: '3px 8px', borderRadius: 20,
          }}>
            -{hotel.discount}%
          </span>
        )}
        {/* Country flag */}
        <span style={{
          position: 'absolute', bottom: 10, right: 10,
          fontSize: 20,
        }}>
          {hotel.country === 'Tunisie' ? '🇹🇳'
            : hotel.country === 'Maroc' ? '🇲🇦'
            : hotel.country === 'Algérie' ? '🇩🇿'
            : hotel.country === 'Égypte' ? '🇪🇬'
            : hotel.country === 'Mauritanie' ? '🇲🇷'
            : '🌍'}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', lineHeight: 1.3 }}>
            {hotel.name}
          </h3>
          {hotel.rating && <RatingBadge score={hotel.rating} size="sm" />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StarRating rating={hotel.stars || 0} size={14} />
          <span style={{ fontSize: 12, color: '#718096' }}>
            📍 {hotel.city || hotel.location}, {hotel.country}
          </span>
        </div>

        {/* Cultural badges */}
        {culturalKeys.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {culturalKeys.slice(0, 3).map(k => (
              <span key={k} style={{
                fontSize: 11, background: '#f0fff4', color: '#276749',
                padding: '2px 6px', borderRadius: 6, border: '1px solid #c6f6d5',
              }}>
                {CULTURAL_ICONS[k]?.icon} {CULTURAL_ICONS[k]?.label}
              </span>
            ))}
          </div>
        )}

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {hotel.amenities.slice(0, 4).map((a, i) => (
              <span key={i} style={{
                fontSize: 11, background: '#EBF8FF', color: '#2c5282',
                padding: '2px 6px', borderRadius: 6,
              }}>
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {hotel.originalPrice && (
              <span style={{ fontSize: 12, color: '#718096', textDecoration: 'line-through', display: 'block' }}>
                {hotel.originalPrice} {hotel.currency || 'TND'}
              </span>
            )}
            <span style={{ fontSize: 20, fontWeight: 800, color: '#FF6B35' }}>
              {hotel.price || hotel.bestPrice || '—'}{' '}
              <span style={{ fontSize: 12, fontWeight: 400, color: '#718096' }}>
                {hotel.currency || 'TND'}/nuit
              </span>
            </span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/hotel/${hotel._id || hotel.id}`) }}
            style={{
              background: '#FF6B35', color: '#fff',
              padding: '8px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e55a24'}
            onMouseLeave={e => e.currentTarget.style.background = '#FF6B35'}
          >
            Voir →
          </button>
        </div>
      </div>
    </div>
  )
}
