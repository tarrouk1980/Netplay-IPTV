import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navBg = (!isHome || scrolled) ? '#fff' : 'transparent'
  const navShadow = (!isHome || scrolled) ? '0 2px 20px rgba(0,0,0,0.1)' : 'none'
  const textColor = (!isHome || scrolled) ? '#2d3748' : '#fff'

  const links = [
    { to: '/search', label: 'Hôtels' },
    { to: '/flash-deals', label: 'Offres Flash' },
    { to: '/blog', label: 'Blog' },
    { to: '/hoteliers', label: 'Pour les hôteliers' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: navBg,
      boxShadow: navShadow,
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#FF6B35' }}>Easy</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: (!isHome || scrolled) ? '#004E89' : '#fff' }}>Hotels</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, ['@media(maxWidth:768px)']: { display: 'none' } }} className="desktop-nav">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                color: textColor,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                opacity: location.pathname === l.to ? 1 : 0.85,
                borderBottom: location.pathname === l.to ? '2px solid #FF6B35' : '2px solid transparent',
                paddingBottom: 2,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = location.pathname === l.to ? '1' : '0.85' }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LanguageSwitcher textColor={textColor} />
          <Link
            to="/connexion"
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${textColor}`,
              color: textColor,
              transition: 'all 0.2s',
            }}
          >
            Connexion
          </Link>
          <Link
            to="/hoteliers"
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: '#FF6B35', color: '#fff',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e55a24'}
            onMouseLeave={e => e.currentTarget.style.background = '#FF6B35'}
          >
            Essai PRO
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: 'none', padding: 8, display: 'none',
              flexDirection: 'column', gap: 4, cursor: 'pointer',
            }}
            className="hamburger"
            aria-label="Menu"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 2,
                background: textColor, borderRadius: 2,
                transition: 'all 0.3s',
                transform: menuOpen && i === 0 ? 'rotate(45deg) translate(4px, 4px)'
                  : menuOpen && i === 1 ? 'scaleX(0)'
                  : menuOpen && i === 2 ? 'rotate(-45deg) translate(4px, -4px)'
                  : 'none',
              }} />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: '#fff', borderTop: '1px solid #e2e8f0',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              style={{ color: '#2d3748', fontSize: 15, fontWeight: 500, padding: '8px 0' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
