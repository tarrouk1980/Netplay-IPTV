import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const LANGUAGES = [
  { code: 'es', flag: '🇪🇸', label: 'Español', path: '/es' },
  { code: 'fr', flag: '🇫🇷', label: 'Français', path: '/fr' },
  { code: 'be', flag: '🇧🇪', label: 'Belgique', path: '/be' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano', path: '/it' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch', path: '/de' },
  { code: 'default', flag: '🌍', label: 'Global', path: '/' },
]

function getCurrentLang(pathname) {
  const match = pathname.match(/^\/(es|fr|be|it|de)/)
  return match ? match[1] : 'default'
}

export default function LanguageSwitcher({ textColor = '#2d3748' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const currentCode = getCurrentLang(location.pathname)
  const current = LANGUAGES.find(l => l.code === currentCode) || LANGUAGES[5]

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (lang) => {
    localStorage.setItem('easyhotels_lang', lang.code)
    navigate(lang.path)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: `1.5px solid ${textColor === '#fff' ? 'rgba(255,255,255,0.4)' : '#e2e8f0'}`,
          borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: textColor,
          transition: 'all 0.2s',
        }}
        aria-label="Change language"
      >
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 2000,
          minWidth: 160,
        }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 16px', background: lang.code === currentCode ? '#FFF5F0' : 'transparent',
                border: 'none', cursor: 'pointer', fontSize: 14,
                color: lang.code === currentCode ? '#FF6B35' : '#2d3748',
                fontWeight: lang.code === currentCode ? 700 : 400,
                textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (lang.code !== currentCode) e.currentTarget.style.background = '#F8F9FA' }}
              onMouseLeave={e => { if (lang.code !== currentCode) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 18 }}>{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === currentCode && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
