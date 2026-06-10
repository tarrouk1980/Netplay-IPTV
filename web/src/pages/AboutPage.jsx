import React from 'react'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8F9FA' }}>
      <div style={{ background: 'linear-gradient(135deg, #004E89, #1a6eac)', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 12 }}>À propos d'EasyHotels</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
          Le premier comparateur de prix hôteliers dédié à l'Afrique du Nord
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2d3748', marginBottom: 16 }}>Notre mission</h2>
          <p style={{ color: '#4a5568', lineHeight: 1.8, fontSize: 16 }}>
            EasyHotels Maghreb est né d'un constat simple : les voyageurs d'Afrique du Nord méritent un outil de comparaison hôtelière adapté à leurs besoins, leurs valeurs et leurs budgets. Nous agrégeons en temps réel les prix de Booking.com, Expedia, Hotels.com, Airbnb et des sites de réservation directe pour vous garantir le meilleur tarif disponible.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[
            { icon: '🌍', title: '7 pays couverts', desc: 'Tunisie, Maroc, Algérie, Égypte, Mauritanie, Libye, Soudan' },
            { icon: '🏨', title: '500+ hôtels', desc: 'Des 3 étoiles aux palaces 5 étoiles luxe' },
            { icon: '💰', title: '5 comparateurs', desc: 'Booking, Expedia, Hotels.com, Airbnb, Direct' },
            { icon: '🤝', title: '47 partenaires', desc: 'Hôteliers partenaires dans toute la région' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
              <h3 style={{ fontWeight: 700, color: '#2d3748', marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#718096' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/search" style={{
            display: 'inline-block', background: '#FF6B35', color: '#fff',
            padding: '14px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16,
          }}>
            Comparer les hôtels →
          </Link>
        </div>
      </div>
    </div>
  )
}
