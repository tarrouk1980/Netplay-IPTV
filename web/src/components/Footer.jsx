import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#e2e8f0', paddingTop: 60, paddingBottom: 30 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40,
          marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#FF6B35' }}>Easy</span>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>Hotels</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Le premier comparateur de prix hôteliers dédié à l'Afrique du Nord. Comparez 5 sources en temps réel et économisez jusqu'à 60%.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Facebook', href: '#', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                { label: 'Instagram', href: '#', svg: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                { label: 'Twitter', href: '#', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg> },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: '#1e293b', color: '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FF6B35'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: 14 }}>NAVIGATION</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/search', label: 'Rechercher un hôtel' },
                { to: '/flash-deals', label: 'Offres Flash' },
                { to: '/blog', label: 'Blog & Guides' },
                { to: '/hoteliers', label: 'Pour les hôteliers' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ color: '#94a3b8', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#FF6B35'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: 14 }}>ENTREPRISE</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/about', label: 'À propos' },
                { to: '/contact', label: 'Contact' },
                { to: '/affilies', label: 'Programme affiliés' },
                { to: '/cgu', label: "Conditions d'utilisation" },
                { to: '/confidentialite', label: 'Confidentialité' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ color: '#94a3b8', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#FF6B35'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: 14 }}>DESTINATIONS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { flag: '🇹🇳', country: 'Tunisie', dest: 'Tunisie' },
                { flag: '🇲🇦', country: 'Maroc', dest: 'Maroc' },
                { flag: '🇩🇿', country: 'Algérie', dest: 'Algérie' },
                { flag: '🇪🇬', country: 'Égypte', dest: 'Egypte' },
                { flag: '🇲🇷', country: 'Mauritanie', dest: 'Mauritanie' },
                { flag: '🇱🇾', country: 'Libye', dest: 'Libye' },
              ].map(c => (
                <Link
                  key={c.country}
                  to={`/search?destination=${c.dest}`}
                  style={{ color: '#94a3b8', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#FF6B35'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >
                  <span style={{ fontSize: 18 }}>{c.flag}</span>
                  {c.country}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            © 2026 EasyHotels Maghreb. Tous droits réservés.
          </p>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Fait avec ❤️ pour les voyageurs du Maghreb
          </p>
        </div>
      </div>
    </footer>
  )
}
