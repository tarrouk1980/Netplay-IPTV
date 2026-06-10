import React from 'react'

const PROVIDERS = [
  {
    id: 'booking',
    name: 'Booking.com',
    color: '#003580',
    bg: '#EBF4FF',
    icon: '🔵',
    features: ['✓ Annulation gratuite', '☕ Petit déjeuner inclus'],
  },
  {
    id: 'expedia',
    name: 'Expedia',
    color: '#FFB700',
    bg: '#FFFBEB',
    icon: '🟡',
    features: ['✓ Annulation gratuite'],
  },
  {
    id: 'hotels_com',
    name: 'Hotels.com',
    color: '#D32F2F',
    bg: '#FFF5F5',
    icon: '🔴',
    features: ['💰 10% Cashback'],
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    color: '#FF5A5F',
    bg: '#FFF0F0',
    icon: '🩷',
    features: ['🗓 Réservation flexible'],
  },
  {
    id: 'direct',
    name: 'Réservation directe',
    color: '#276749',
    bg: '#F0FFF4',
    icon: '🟢',
    features: ['⭐ Meilleur service', '🎁 Avantages exclusifs'],
  },
]

export default function PriceComparisonTable({ hotel, prices }) {
  // Build price rows from API data or mock data
  const rows = PROVIDERS.map((p, i) => {
    const apiPrice = prices?.find(pr => pr.provider?.toLowerCase().includes(p.id.replace('_', '')))
    const basePrice = hotel?.bestPrice || hotel?.price || 285
    const multipliers = [1, 1.09, 1.14, 1.19, 1.04]
    const price = apiPrice?.price || Math.round(basePrice * multipliers[i])
    const url = apiPrice?.url || '#'
    return { ...p, price, url, isBest: i === 0 }
  }).sort((a, b) => a.price - b.price).map((r, i) => ({ ...r, isBest: i === 0 }))

  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2d3748' }}>
          💰 Comparez les prix
        </h3>
        <span style={{ fontSize: 13, color: '#718096' }}>
          Mis à jour il y a 2 min
        </span>
      </div>

      <div>
        {rows.map((row, idx) => (
          <div
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: idx < rows.length - 1 ? '1px solid #e2e8f0' : 'none',
              border: row.isBest ? '2px solid #FF6B35' : undefined,
              borderRadius: row.isBest ? 8 : 0,
              margin: row.isBest ? '4px' : 0,
              background: row.isBest ? '#FFF8F5' : '#fff',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            {row.isBest && (
              <span style={{
                position: 'absolute', top: -10, left: 16,
                background: '#FF6B35', color: '#fff',
                fontSize: 11, fontWeight: 700,
                padding: '2px 10px', borderRadius: 20,
              }}>
                ★ MEILLEUR PRIX
              </span>
            )}

            {/* Provider */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{row.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: row.color }}>{row.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {row.features.map((f, i) => (
                  <span key={i} style={{ fontSize: 12, color: '#718096' }}>{f}</span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div style={{ textAlign: 'right', marginLeft: 16 }}>
              <div style={{
                fontSize: 22, fontWeight: 800,
                color: row.isBest ? '#FF6B35' : '#2d3748',
              }}>
                {row.price} TND
              </div>
              <div style={{ fontSize: 11, color: '#718096' }}>par nuit</div>
            </div>

            {/* CTA */}
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                marginLeft: 16,
                padding: '10px 18px',
                background: row.isBest ? '#FF6B35' : '#004E89',
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                display: 'inline-block',
                transition: 'opacity 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Voir l'offre →
            </a>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 20px', background: '#f7fafc', fontSize: 12, color: '#718096', textAlign: 'center' }}>
        Les prix sont mis à jour en temps réel. Des frais de réservation peuvent s'appliquer.
      </div>
    </div>
  )
}
