import React, { useState } from 'react'

const ORANGE = '#FF6B35'
const DARK = '#2d3748'
const GRAY = '#718096'
const LIGHT_BG = '#f7f8fa'
const WHITE = '#ffffff'
const GREEN = '#38a169'

const kpiCards = [
  { icon: '🖱️', label: 'Total Clics', value: '1 284', trend: '+12%', up: true },
  { icon: '💶', label: 'Revenus estimés', value: '847 €', trend: '+8%', up: true },
  { icon: '🏨', label: 'Hôtels actifs', value: '51', trend: '+3', up: true },
  { icon: '🌍', label: 'Marchés EU', value: '5', trend: '→', up: null },
]

const markets = [
  { country: '🇪🇸 Espagne', share: 34, color: '#FF6B35' },
  { country: '🇫🇷 France', share: 28, color: '#e05a28' },
  { country: '🇧🇪 Belgique', share: 18, color: '#f97316' },
  { country: '🇮🇹 Italie', share: 12, color: '#fb923c' },
  { country: '🇩🇪 Allemagne', share: 8, color: '#fdba74' },
]

const topDestinations = [
  { city: 'Marrakech', country: '🇲🇦', clicks: 312, cpc: '1,20€' },
  { city: 'Casablanca', country: '🇲🇦', clicks: 278, cpc: '1,05€' },
  { city: 'Tunis', country: '🇹🇳', clicks: 241, cpc: '0,95€' },
  { city: 'Alger', country: '🇩🇿', clicks: 198, cpc: '0,88€' },
  { city: 'Djerba', country: '🇹🇳', clicks: 156, cpc: '0,82€' },
]

const monthlyRevenue = [
  { month: 'Jan', value: 320 },
  { month: 'Fév', value: 480 },
  { month: 'Mar', value: 610 },
  { month: 'Avr', value: 590 },
  { month: 'Mai', value: 730 },
  { month: 'Jun', value: 847 },
]

const providers = [
  { name: 'Booking.com', share: 45, color: '#003580' },
  { name: 'Expedia', share: 30, color: '#00355f' },
  { name: 'Hotels.com', share: 15, color: '#d32f2f' },
  { name: 'Airbnb', share: 10, color: '#ff5a5f' },
]

const maxRevenue = Math.max(...monthlyRevenue.map(m => m.value))

function KpiCard({ icon, label, value, trend, up }) {
  return (
    <div style={{
      background: WHITE,
      borderRadius: 14,
      padding: '22px 24px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      flex: '1 1 180px',
      minWidth: 160,
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: DARK, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>{label}</div>
      {trend && (
        <div style={{
          marginTop: 10,
          fontSize: 12,
          fontWeight: 700,
          color: up === true ? GREEN : up === false ? '#e53e3e' : GRAY,
        }}>
          {up === true ? '↑' : up === false ? '↓' : ''} {trend} ce mois
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div style={{ background: LIGHT_BG, minHeight: '100vh', paddingTop: 72 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
              Admin — Tableau de bord
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: DARK, margin: 0 }}>
              💰 Revenus & Performance CPC
            </h1>
            <p style={{ color: GRAY, fontSize: 14, marginTop: 6 }}>
              Données de janvier à juin 2025 · Mise à jour simulée
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button style={quickActionStyle}>📋 Voir les logs CPC</button>
            <button style={quickActionStyle}>📥 Exporter CSV</button>
            <button style={{ ...quickActionStyle, background: ORANGE, color: WHITE, border: 'none' }}>
              ⚙️ Paramètres affiliés
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 32 }}>
          {kpiCards.map(k => <KpiCard key={k.label} {...k} />)}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24, marginBottom: 24 }}>

          {/* Monthly revenue chart */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>📈 Revenus mensuels 2025</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, marginTop: 20 }}>
              {monthlyRevenue.map(m => {
                const height = Math.round((m.value / maxRevenue) * 140)
                return (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE }}>{m.value}€</div>
                    <div style={{
                      width: '100%',
                      height,
                      background: `linear-gradient(to top, ${ORANGE}, #ff8c5a)`,
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease',
                    }} />
                    <div style={{ fontSize: 12, color: GRAY, fontWeight: 600 }}>{m.month}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Revenue by market */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>🌍 Revenus par marché EU</h2>
            <div style={{ marginTop: 16 }}>
              {markets.map(m => (
                <div key={m.country} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{m.country}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.share}%</span>
                  </div>
                  <div style={{ background: '#e8ecf0', borderRadius: 20, height: 8 }}>
                    <div style={{
                      width: `${m.share}%`,
                      height: '100%',
                      background: m.color,
                      borderRadius: 20,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>

          {/* Top destinations */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>🏆 Top 5 destinations (clics CPC)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr>
                  {['#', 'Destination', 'Clics', 'CPC moy.'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: GRAY, textTransform: 'uppercase', paddingBottom: 10, borderBottom: '1px solid #e8ecf0' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topDestinations.map((d, i) => (
                  <tr key={d.city} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '10px 0', fontSize: 14, fontWeight: 700, color: i === 0 ? ORANGE : GRAY }}>{i + 1}</td>
                    <td style={{ padding: '10px 8px', fontSize: 14, fontWeight: 600, color: DARK }}>{d.country} {d.city}</td>
                    <td style={{ padding: '10px 8px', fontSize: 14, color: DARK }}>{d.clicks}</td>
                    <td style={{ padding: '10px 0', fontSize: 14, fontWeight: 700, color: GREEN }}>{d.cpc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Provider breakdown */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>🔗 Répartition par fournisseur</h2>
            <div style={{ marginTop: 16 }}>
              {providers.map(p => (
                <div key={p.name} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{p.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.share}%</span>
                  </div>
                  <div style={{ background: '#e8ecf0', borderRadius: 20, height: 10, position: 'relative' }}>
                    <div style={{
                      width: `${p.share}%`,
                      height: '100%',
                      background: p.color,
                      borderRadius: 20,
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: '14px 16px', background: LIGHT_BG, borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: GRAY, marginBottom: 2 }}>Revenu moyen / 1000 visiteurs</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: ORANGE }}>8 – 25€ <span style={{ fontSize: 13, fontWeight: 500, color: GRAY }}>RPM</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

const cardStyle = {
  background: WHITE,
  borderRadius: 14,
  padding: '24px 26px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
}

const cardTitleStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: DARK,
  margin: 0,
}

const quickActionStyle = {
  padding: '9px 18px',
  borderRadius: 8,
  border: '1.5px solid #e2e8f0',
  background: WHITE,
  color: DARK,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}
