import React, { useState } from 'react'

const ORANGE = '#FF6B35'
const DARK = '#2d3748'
const GRAY = '#718096'
const LIGHT_BG = '#f7f8fa'
const WHITE = '#ffffff'
const GREEN = '#38a169'

const stats = [
  { value: '3,2M', label: 'Voyageurs de la diaspora ciblés', icon: '👥' },
  { value: '5', label: 'Pays d\'Europe couverts', icon: '🌍' },
  { value: '×4', label: 'CPC vs Afrique du Nord', icon: '📈' },
  { value: '4,2%', label: 'CTR moyen France (diaspora)', icon: '🎯' },
]

const tiers = [
  {
    name: 'Starter',
    price: 'Gratuit',
    priceDetail: 'pour toujours',
    color: '#4a5568',
    highlight: false,
    features: [
      '1 hôtel listé',
      'Fiche de base (photos, description)',
      'Visible sur la recherche',
      'Statistiques de base',
      'Support email',
    ],
    cta: 'Inscrire mon hôtel gratuitement',
  },
  {
    name: 'Pro',
    price: '29€',
    priceDetail: '/mois',
    color: ORANGE,
    highlight: true,
    badge: '⭐ Populaire',
    features: [
      'Jusqu\'à 5 hôtels',
      'Photos HD illimitées',
      'Mise en avant dans les résultats',
      'Statistiques avancées + CPC',
      'Lien direct booking',
      'Support prioritaire',
    ],
    cta: 'Essayer Pro gratuitement 30 jours',
  },
  {
    name: 'Premium',
    price: '99€',
    priceDetail: '/mois',
    color: '#6b46c1',
    highlight: false,
    features: [
      'Hôtels illimités',
      'Badge "Partenaire Premium"',
      'Position garantie top 3',
      'Accès aux données diaspora',
      'Dashboard analytique complet',
      'Account manager dédié',
      'Intégration channel manager',
    ],
    cta: 'Contacter l\'équipe Premium',
  },
]

const testimonials = [
  {
    name: 'Khalid B.',
    hotel: 'Riad Dar Zitoun, Marrakech',
    flag: '🇲🇦',
    stars: 5,
    text: 'Depuis que nous sommes sur EasyHotels Maghreb, nous recevons chaque semaine des réservations de Français et Belges d\'origine marocaine. Le taux de conversion est bien supérieur aux autres plateformes. Très satisfait !',
  },
  {
    name: 'Samira H.',
    hotel: 'Hôtel Méditerranée, Tunis',
    flag: '🇹🇳',
    stars: 5,
    text: 'Notre hôtel n\'était pratiquement pas visible pour la diaspora tunisienne en Europe. En 3 mois, on a doublé nos réservations venant de France. Le profil Pro vaut vraiment son prix.',
  },
  {
    name: 'Mourad A.',
    hotel: 'El Aurassi Boutique, Alger',
    flag: '🇩🇿',
    stars: 4,
    text: 'Plateforme sérieuse et facile à utiliser. L\'équipe est réactive et comprend vraiment les spécificités du tourisme de la diaspora. Je recommande à tous les hôteliers maghrébins.',
  },
]

function StarRating({ count }) {
  return (
    <span style={{ color: '#f6ad55', fontSize: 16 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

function TierCard({ tier }) {
  return (
    <div style={{
      background: WHITE,
      borderRadius: 18,
      padding: '32px 28px',
      boxShadow: tier.highlight ? `0 8px 30px rgba(255,107,53,0.22)` : '0 2px 12px rgba(0,0,0,0.08)',
      border: tier.highlight ? `2.5px solid ${ORANGE}` : '1.5px solid #e8ecf0',
      position: 'relative',
      flex: '1 1 260px',
      minWidth: 240,
      maxWidth: 340,
    }}>
      {tier.badge && (
        <div style={{
          position: 'absolute',
          top: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: ORANGE,
          color: WHITE,
          padding: '4px 18px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          {tier.badge}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: DARK }}>{tier.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
          <span style={{ fontSize: 38, fontWeight: 900, color: tier.color }}>{tier.price}</span>
          <span style={{ fontSize: 15, color: GRAY }}>{tier.priceDetail}</span>
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
        {tier.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: DARK }}>
            <span style={{ color: GREEN, fontWeight: 700 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <a
        href="/fr/inscription"
        style={{
          display: 'block',
          textAlign: 'center',
          background: tier.highlight ? ORANGE : 'transparent',
          color: tier.highlight ? WHITE : tier.color,
          border: `2px solid ${tier.highlight ? ORANGE : tier.color}`,
          padding: '12px 20px',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        {tier.cta}
      </a>
    </div>
  )
}

export default function LandingHotelierFR() {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div style={{ background: WHITE, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 60%, #3d4a5c 100%)',
        color: WHITE,
        padding: '100px 20px 80px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,107,53,0.15)',
            border: '1px solid rgba(255,107,53,0.4)',
            borderRadius: 20,
            padding: '5px 16px',
            fontSize: 13,
            fontWeight: 700,
            color: ORANGE,
            marginBottom: 24,
            letterSpacing: 1,
          }}>
            🇫🇷 Pour les hôteliers · France & EU
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 20 }}>
            Votre hôtel visible par{' '}
            <span style={{ color: ORANGE }}>3,2 millions</span> de voyageurs<br />
            de la diaspora maghrébine
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
            La plateforme spécialisée qui connecte les hôtels du Maghreb avec les voyageurs d'origine maghrébine vivant en Europe.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/fr/inscription"
              style={{
                background: ORANGE,
                color: WHITE,
                padding: '15px 34px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 16,
                textDecoration: 'none',
              }}
            >
              Inscrire mon hôtel gratuitement →
            </a>
            <a
              href="#tarifs"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: WHITE,
                padding: '15px 28px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              Voir les tarifs
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: LIGHT_BG, padding: '52px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: WHITE,
              borderRadius: 14,
              padding: '24px 32px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              flex: '1 1 180px',
              minWidth: 160,
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: ORANGE }}>{s.value}</div>
              <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Why us */}
      <div style={{ padding: '64px 20px', maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ fontSize: 30, fontWeight: 900, color: DARK, textAlign: 'center', marginBottom: 12 }}>
          Pourquoi choisir EasyHotels Maghreb ?
        </h2>
        <p style={{ textAlign: 'center', color: GRAY, fontSize: 16, marginBottom: 48 }}>
          Nous ciblons exclusivement la diaspora maghrébine en Europe — votre audience idéale.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            { icon: '🎯', title: 'Audience ultra-ciblée', desc: 'Nos visiteurs sont des Franco/Belgo/Italo-Maghrébins qui cherchent spécifiquement des hôtels au Maroc, Algérie et Tunisie.' },
            { icon: '💶', title: 'CPC 4× plus élevé', desc: 'La diaspora EU génère un CPC moyen de 0,80€ vs 0,20€ pour le trafic local Maghreb. Un ROI publicitaire exceptionnel.' },
            { icon: '📊', title: 'Analytics dédiés', desc: 'Dashboard complet : origine des visiteurs, taux de clic par pays EU, périodes de pointe (Ramadan, été, Aïd).' },
            { icon: '🤝', title: 'Partenariat direct', desc: 'Pas d\'intermédiaire. Vous accédez directement aux voyageurs sans commission sur les réservations.' },
          ].map(f => (
            <div key={f.title} style={{
              background: WHITE,
              borderRadius: 14,
              padding: '28px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e8ecf0',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: DARK, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div id="tarifs" style={{ background: LIGHT_BG, padding: '64px 20px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: DARK, textAlign: 'center', marginBottom: 10 }}>
            Tarifs simples et transparents
          </h2>
          <p style={{ textAlign: 'center', color: GRAY, fontSize: 16, marginBottom: 48 }}>
            Commencez gratuitement. Upgradez quand vous le souhaitez. Sans engagement.
          </p>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {tiers.map(t => <TierCard key={t.name} tier={t} />)}
          </div>

          <p style={{ textAlign: 'center', color: GRAY, fontSize: 13, marginTop: 28 }}>
            Toutes formules incluent : inscription en français, support en arabe/français, paiement sécurisé EU.
          </p>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: '64px 20px', maxWidth: 1060, margin: '0 auto' }}>
        <h2 style={{ fontSize: 30, fontWeight: 900, color: DARK, textAlign: 'center', marginBottom: 10 }}>
          Ce que disent nos partenaires hôteliers
        </h2>
        <p style={{ textAlign: 'center', color: GRAY, fontSize: 16, marginBottom: 48 }}>
          Plus de 51 hôtels nous font confiance au Maroc, Algérie et Tunisie.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{
              background: WHITE,
              borderRadius: 14,
              padding: '28px 24px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              border: '1px solid #e8ecf0',
            }}>
              <StarRating count={t.stars} />
              <p style={{ fontSize: 14, color: DARK, lineHeight: 1.65, margin: '14px 0 18px', fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B35, #ff8c5a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: WHITE,
                  fontWeight: 800,
                  fontSize: 16,
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>{t.flag} {t.name}</div>
                  <div style={{ color: GRAY, fontSize: 12 }}>{t.hotel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35, #e05a28)',
        padding: '64px 20px',
        textAlign: 'center',
        color: WHITE,
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 14 }}>
          Prêt à toucher la diaspora maghrébine ?
        </h2>
        <p style={{ fontSize: 17, opacity: 0.9, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Inscription gratuite en 5 minutes. Votre hôtel visible dès aujourd'hui.
        </p>
        <a
          href="/fr/inscription"
          style={{
            background: WHITE,
            color: ORANGE,
            padding: '15px 36px',
            borderRadius: 12,
            fontWeight: 900,
            fontSize: 16,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Inscrire mon hôtel gratuitement →
        </a>
      </div>

    </div>
  )
}
