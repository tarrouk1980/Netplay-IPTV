import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'easyhotels_gdpr_consent'

/**
 * GDPRBanner — Cookie consent banner for Spain/EU compliance
 * GDPR + LOPD compliant. Analytics blocked until user accepts.
 * Stores consent in localStorage under key: easyhotels_gdpr_consent
 * Values: 'all' | 'essential' | null (not yet decided)
 */
export default function GDPRBanner() {
  const [visible, setVisible] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true,   // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    personalization: false,
  })

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(timer)
    }
    // If consent was 'all', enable analytics
    if (stored === 'all') {
      enableAnalytics()
    }
  }, [])

  function enableAnalytics() {
    // Hook for enabling analytics after consent
    if (typeof window !== 'undefined') {
      window.__gdpr_analytics_enabled = true
      // Fire custom event for analytics listeners
      window.dispatchEvent(new CustomEvent('gdpr:consent', { detail: { analytics: true } }))
    }
  }

  function acceptAll() {
    localStorage.setItem(STORAGE_KEY, 'all')
    enableAnalytics()
    setVisible(false)
  }

  function acceptEssential() {
    localStorage.setItem(STORAGE_KEY, 'essential')
    setVisible(false)
  }

  function savePreferences() {
    const value = preferences.analytics ? 'all' : 'essential'
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    if (preferences.analytics) enableAnalytics()
    setVisible(false)
    setShowConfig(false)
  }

  if (!visible) return null

  return (
    <>
      {/* Overlay for config panel */}
      {showConfig && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }}
          onClick={() => setShowConfig(false)}
        />
      )}

      {/* Config panel */}
      {showConfig && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(90vw, 520px)',
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          zIndex: 9999,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2d3748', marginBottom: 8 }}>
            Configuración de cookies
          </h3>
          <p style={{ fontSize: 14, color: '#718096', marginBottom: 24, lineHeight: 1.6 }}>
            Personaliza tus preferencias de privacidad. Puedes cambiarlas en cualquier momento desde nuestra{' '}
            <Link to="/politica-de-cookies" style={{ color: '#FF6B35' }}>política de cookies</Link>.
          </p>

          {[
            {
              key: 'essential',
              label: 'Cookies esenciales',
              desc: 'Necesarias para el funcionamiento básico del sitio. No pueden desactivarse.',
              locked: true,
            },
            {
              key: 'analytics',
              label: 'Cookies de análisis',
              desc: 'Nos ayudan a entender cómo usas el sitio para mejorarlo (Google Analytics 4).',
              locked: false,
            },
            {
              key: 'marketing',
              label: 'Cookies de marketing',
              desc: 'Utilizadas para mostrarte anuncios relevantes en otros sitios web.',
              locked: false,
            },
            {
              key: 'personalization',
              label: 'Cookies de personalización',
              desc: 'Recuerdan tus preferencias de búsqueda y configuración.',
              locked: false,
            },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#2d3748', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: '#718096' }}>{item.desc}</div>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="checkbox"
                  checked={preferences[item.key]}
                  disabled={item.locked}
                  onChange={e => !item.locked && setPreferences(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  style={{ width: 20, height: 20, accentColor: '#FF6B35', cursor: item.locked ? 'not-allowed' : 'pointer' }}
                />
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={savePreferences}
              style={{ flex: 1, padding: '12px', borderRadius: 8, background: '#FF6B35', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}
            >
              Guardar preferencias
            </button>
            <button
              onClick={() => setShowConfig(false)}
              style={{ padding: '12px 20px', borderRadius: 8, background: '#F7FAFC', color: '#4a5568', fontWeight: 600, fontSize: 14, border: '1px solid #e2e8f0', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Main banner — fixed bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9997,
        background: '#1a202c',
        color: '#fff',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
            🍪 Utilizamos cookies para mejorar tu experiencia y analizar el tráfico.
            Al continuar navegando, aceptas nuestra{' '}
            <Link to="/politica-de-cookies" style={{ color: '#FFC72C', textDecoration: 'underline' }}>
              política de cookies
            </Link>
            {' '}y{' '}
            <Link to="/privacidad" style={{ color: '#FFC72C', textDecoration: 'underline' }}>
              política de privacidad
            </Link>
            {' '}(RGPD/LOPD).
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowConfig(true)}
            style={{
              padding: '10px 18px', borderRadius: 8,
              background: 'transparent', color: '#a0aec0',
              border: '1.5px solid #4a5568',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#718096'; e.currentTarget.style.color = '#e2e8f0' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#4a5568'; e.currentTarget.style.color = '#a0aec0' }}
          >
            Configurar
          </button>
          <button
            onClick={acceptEssential}
            style={{
              padding: '10px 18px', borderRadius: 8,
              background: 'transparent', color: '#e2e8f0',
              border: '1.5px solid #718096',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#a0aec0'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#718096'}
          >
            Solo esenciales
          </button>
          <button
            onClick={acceptAll}
            style={{
              padding: '10px 22px', borderRadius: 8,
              background: '#FF6B35', color: '#fff',
              border: 'none', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(255,107,53,0.4)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e55a24'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,107,53,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FF6B35'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,107,53,0.4)' }}
          >
            Aceptar todo
          </button>
        </div>
      </div>
    </>
  )
}

/**
 * Hook to check GDPR consent status
 * Returns: { analytics: bool, marketing: bool, essential: true }
 */
export function useGDPRConsent() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  if (!stored) return { essential: true, analytics: false, marketing: false, personalization: false }
  if (stored === 'all') return { essential: true, analytics: true, marketing: true, personalization: true }
  if (stored === 'essential') return { essential: true, analytics: false, marketing: false, personalization: false }
  try {
    return { essential: true, ...JSON.parse(stored) }
  } catch {
    return { essential: true, analytics: false, marketing: false, personalization: false }
  }
}
