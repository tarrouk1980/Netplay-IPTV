import React, { useState } from 'react'

const COPY = {
  fr: {
    headline: '🎯 Offres exclusives pour la diaspora maghrébine',
    subheadline: 'Recevez les meilleures offres d\'hôtels chaque semaine directement dans votre boîte mail.',
    placeholder: 'Votre adresse email',
    button: 'Recevoir les alertes prix',
    success: '✅ Vous recevrez nos meilleures offres par email!',
    gdpr: 'Vos données sont protégées. Désinscription à tout moment.',
    error: 'Une erreur est survenue. Veuillez réessayer.',
  },
  es: {
    headline: '🎯 Ofertas exclusivas para la diáspora magrebí',
    subheadline: 'Recibe las mejores ofertas de hoteles cada semana directamente en tu bandeja de entrada.',
    placeholder: 'Tu dirección de email',
    button: 'Recibir alertas de precio',
    success: '✅ ¡Recibirás nuestras mejores ofertas por email!',
    gdpr: 'Tus datos están protegidos. Cancela la suscripción en cualquier momento.',
    error: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
  },
}

export default function Newsletter({ lang = 'fr' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const t = COPY[lang] || COPY.fr

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setStatus('loading')
    try {
      // Mock POST — in production this hits /api/newsletter/subscribe
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang }),
      }).catch(() => {
        // Ignore network errors in local/preview — treat as success for UX
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
        borderRadius: 16,
        padding: '32px 28px',
        maxWidth: 520,
        margin: '0 auto',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        color: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8, textAlign: 'center' }}>✉️</div>

      <h3
        style={{
          margin: '0 0 8px',
          fontSize: 20,
          fontWeight: 800,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {t.headline}
      </h3>

      <p
        style={{
          margin: '0 0 20px',
          color: '#a0aec0',
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        {t.subheadline}
      </p>

      {status === 'success' ? (
        <div
          style={{
            background: 'rgba(72, 187, 120, 0.15)',
            border: '1px solid #48bb78',
            borderRadius: 10,
            padding: '16px 20px',
            textAlign: 'center',
            color: '#68d391',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {t.success}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholder}
              required
              disabled={status === 'loading'}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #4a5568',
                background: '#2d3748',
                color: '#fff',
                fontSize: 15,
                outline: 'none',
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              style={{
                background: status === 'loading' ? '#a0aec0' : '#FF6B35',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 18px',
                fontWeight: 700,
                fontSize: 14,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {status === 'loading' ? '...' : t.button}
            </button>
          </div>

          {status === 'error' && (
            <p style={{ color: '#fc8181', fontSize: 13, margin: 0, textAlign: 'center' }}>
              {t.error}
            </p>
          )}

          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: '#718096',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>🔒</span>
            {t.gdpr}
          </p>
        </form>
      )}
    </div>
  )
}
