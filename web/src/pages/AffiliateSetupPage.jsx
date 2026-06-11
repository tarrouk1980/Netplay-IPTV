import React, { useState } from 'react'

const ORANGE = '#FF6B35'
const DARK = '#2d3748'
const GRAY = '#718096'
const LIGHT_BG = '#f7f8fa'
const WHITE = '#ffffff'
const GREEN = '#38a169'
const YELLOW = '#d69e2e'

const affiliates = [
  {
    name: 'Booking.com Partner Hub',
    icon: '🏨',
    status: '⏳ En attente d\'inscription',
    statusColor: YELLOW,
    cpcMin: '0,25€',
    cpcMax: '2€',
    cpcNote: 'par clic (selon destination)',
    registrationUrl: 'https://partnerhelp.booking.com',
    envVar: 'BOOKING_AFFILIATE_ID',
    steps: [
      'Créer un compte sur Booking.com Partner Hub',
      'Soumettre le site web pour validation (2-5 jours ouvrés)',
      'Obtenir l\'Affiliate ID (AID) par email',
      'Ajouter dans .env : BOOKING_AFFILIATE_ID=XXXXXXX',
      'Tester un lien d\'affiliation sur /search',
    ],
  },
  {
    name: 'Expedia Affiliate Network (RCNA)',
    icon: '✈️',
    status: '⏳ En attente d\'inscription',
    statusColor: YELLOW,
    cpcMin: '0,20€',
    cpcMax: '1,80€',
    cpcNote: 'par clic',
    registrationUrl: 'https://affiliates.expedia.com',
    envVar: 'EXPEDIA_AFFILIATE_ID',
    steps: [
      'Créer un compte Expedia Affiliate Network',
      'Soumettre l\'URL et décrire l\'audience (diaspora maghrébine)',
      'Validation sous 3-7 jours ouvrés',
      'Récupérer le Partner ID dans le tableau de bord',
      'Ajouter dans .env : EXPEDIA_AFFILIATE_ID=XXXXXXX',
    ],
  },
  {
    name: 'Hotels.com Affiliate Program',
    icon: '🛎️',
    status: '⏳ En attente d\'inscription',
    statusColor: YELLOW,
    cpcMin: '0,15€',
    cpcMax: '1,50€',
    cpcNote: 'par clic (réseau EAN)',
    registrationUrl: 'https://affiliates.expedia.com',
    envVar: 'HOTELSCOM_AFFILIATE_ID',
    steps: [
      'Même réseau qu\'Expedia (EAN — Expedia Affiliate Network)',
      'Utiliser le même compte EAN créé pour Expedia',
      'Sélectionner Hotels.com comme propriété dans EAN',
      'Obtenir un tracking ID séparé pour Hotels.com',
      'Ajouter dans .env : HOTELSCOM_AFFILIATE_ID=XXXXXXX',
    ],
  },
  {
    name: 'TripAdvisor (non-hotel partners)',
    icon: '🦉',
    status: '⏳ En attente d\'inscription',
    statusColor: YELLOW,
    cpcMin: '0,10€',
    cpcMax: '0,80€',
    cpcNote: 'par clic',
    registrationUrl: 'https://www.tripadvisor.com/affiliates',
    envVar: 'TRIPADVISOR_AFFILIATE_ID',
    steps: [
      'Créer un compte TripAdvisor Affiliate Program',
      'Soumettre le site — validation 5-10 jours',
      'Intégrer les widgets ou liens de suivi',
      'Obtenir le Site ID / Publisher ID',
      'Ajouter dans .env : TRIPADVISOR_AFFILIATE_ID=XXXXXXX',
    ],
  },
]

const AVG_CPC = 0.8

function RevenueCalculator() {
  const [visitors, setVisitors] = useState(10000)
  const [ctr, setCtr] = useState(3)

  const clicks = Math.round((visitors * ctr) / 100)
  const revenue = (clicks * AVG_CPC).toFixed(0)

  return (
    <div style={{
      background: WHITE,
      borderRadius: 16,
      padding: '32px 36px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      marginTop: 48,
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: DARK, marginBottom: 6 }}>
        📊 Calculateur de revenus estimés
      </h2>
      <p style={{ color: GRAY, marginBottom: 28, fontSize: 14 }}>
        Basé sur un CPC moyen de {AVG_CPC}€ toutes plateformes confondues
      </p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontWeight: 700, color: DARK, marginBottom: 8, fontSize: 14 }}>
            Visiteurs/mois
          </label>
          <input
            type="number"
            value={visitors}
            onChange={e => setVisitors(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1.5px solid #e2e8f0',
              fontSize: 16,
              fontWeight: 600,
              color: DARK,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontWeight: 700, color: DARK, marginBottom: 8, fontSize: 14 }}>
            CTR % (taux de clic)
          </label>
          <input
            type="number"
            step="0.1"
            value={ctr}
            onChange={e => setCtr(Math.max(0, parseFloat(e.target.value) || 0))}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1.5px solid #e2e8f0',
              fontSize: 16,
              fontWeight: 600,
              color: DARK,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #fff7f0, #fff0e6)',
        border: `2px solid ${ORANGE}`,
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, color: GRAY, marginBottom: 4 }}>Calcul</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: DARK }}>
            {clicks.toLocaleString('fr-FR')} clics/mois × {AVG_CPC}€ CPC moyen
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: GRAY, marginBottom: 4 }}>Revenus estimés</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: ORANGE }}>
            {parseInt(revenue).toLocaleString('fr-FR')}€<span style={{ fontSize: 16, fontWeight: 600 }}>/mois</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { label: '10K visiteurs', v: 10000 },
          { label: '50K visiteurs', v: 50000 },
          { label: '100K visiteurs', v: 100000 },
        ].map(preset => (
          <button
            key={preset.v}
            onClick={() => setVisitors(preset.v)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: `1.5px solid ${visitors === preset.v ? ORANGE : '#e2e8f0'}`,
              background: visitors === preset.v ? ORANGE : WHITE,
              color: visitors === preset.v ? WHITE : GRAY,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function AffiliateCard({ aff }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: WHITE,
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      overflow: 'hidden',
      border: '1.5px solid #e8ecf0',
    }}>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 36 }}>{aff.icon}</div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: DARK, margin: 0 }}>{aff.name}</h3>
              <span style={{
                display: 'inline-block',
                marginTop: 6,
                padding: '3px 10px',
                borderRadius: 20,
                background: '#fef3c7',
                color: YELLOW,
                fontSize: 12,
                fontWeight: 700,
              }}>
                {aff.status}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: GRAY, marginBottom: 2 }}>CPC estimé</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: ORANGE }}>
              {aff.cpcMin} → {aff.cpcMax}
            </div>
            <div style={{ fontSize: 11, color: GRAY }}>{aff.cpcNote}</div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href={aff.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: ORANGE,
              color: WHITE,
              padding: '8px 18px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            📝 S'inscrire →
          </a>
          <div style={{
            background: '#f0f4f8',
            borderRadius: 6,
            padding: '7px 12px',
            fontFamily: 'monospace',
            fontSize: 12,
            color: DARK,
          }}>
            {aff.envVar}=<span style={{ color: ORANGE }}>XXXXXXX</span>
          </div>
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: 'none',
              border: `1.5px solid #e2e8f0`,
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: 13,
              color: GRAY,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {open ? '▲ Masquer' : '▼ Étapes de setup'}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ background: LIGHT_BG, borderTop: '1.5px solid #e8ecf0', padding: '20px 28px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 14 }}>
            Étapes de configuration
          </div>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {aff.steps.map((step, i) => (
              <li key={i} style={{ color: GRAY, fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default function AffiliateSetupPage() {
  return (
    <div style={{ background: LIGHT_BG, minHeight: '100vh', paddingTop: 72 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: ORANGE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Admin — Configuration
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: DARK, marginBottom: 10 }}>
            🔗 Setup Programmes Affiliés
          </h1>
          <p style={{ color: GRAY, fontSize: 16, maxWidth: 600 }}>
            Inscrivez EasyHotels Maghreb aux 4 programmes d'affiliation hôtelière pour activer la monétisation CPC.
          </p>
        </div>

        {/* Summary banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FF6B35, #ff8c5a)',
          borderRadius: 14,
          padding: '20px 28px',
          marginBottom: 36,
          display: 'flex',
          gap: 32,
          flexWrap: 'wrap',
          color: WHITE,
        }}>
          {[
            { label: 'Programmes', value: '4' },
            { label: 'CPC moyen estimé', value: '0,80€' },
            { label: 'RPM cible', value: '8–25€' },
            { label: 'Délai activation', value: '2–10 jours' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 26, fontWeight: 900 }}>{stat.value}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Affiliate cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {affiliates.map(aff => (
            <AffiliateCard key={aff.name} aff={aff} />
          ))}
        </div>

        {/* Revenue calculator */}
        <RevenueCalculator />

        {/* .env template */}
        <div style={{
          background: '#1a202c',
          borderRadius: 14,
          padding: '24px 28px',
          marginTop: 36,
          color: '#e2e8f0',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a0aec0', marginBottom: 14 }}>
            📋 Template .env — Variables d'affiliation
          </div>
          <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.8, fontFamily: 'monospace' }}>
{`# Booking.com Partner Hub
BOOKING_AFFILIATE_ID=XXXXXXX

# Expedia Affiliate Network
EXPEDIA_AFFILIATE_ID=XXXXXXX

# Hotels.com (EAN — même réseau Expedia)
HOTELSCOM_AFFILIATE_ID=XXXXXXX

# TripAdvisor Affiliate
TRIPADVISOR_AFFILIATE_ID=XXXXXXX`}
          </pre>
        </div>
      </div>
    </div>
  )
}
