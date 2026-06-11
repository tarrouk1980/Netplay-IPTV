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
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Facebook', color: '#1877F2', href: 'https://facebook.com', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                { label: 'Instagram', color: '#E1306C', href: 'https://instagram.com', svg: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                { label: 'TikTok', color: '#010101', href: 'https://tiktok.com', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
                { label: 'YouTube', color: '#FF0000', href: 'https://youtube.com', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg> },
                { label: 'WhatsApp', color: '#25D366', href: 'https://wa.me', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> },
                { label: 'LinkedIn', color: '#0A66C2', href: 'https://linkedin.com', svg: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: '#1e293b', color: '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.color = '#fff' }}
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

        {/* Map Section */}
        <div style={{ marginBottom: 40 }}>
          <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🗺️ NOS DESTINATIONS</h4>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b', height: 220 }}>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-6.0,19.0,37.0,38.0&layer=mapnik"
              style={{ width: '100%', height: '100%', border: 'none', filter: 'brightness(0.85) contrast(1.1)' }}
              title="Carte des destinations EasyHotels Maghreb"
              loading="lazy"
            />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { flag: '🇲🇦', city: 'Marrakech', lat: 31.63, lng: -7.98 },
              { flag: '🇩🇿', city: 'Alger', lat: 36.75, lng: 3.06 },
              { flag: '🇹🇳', city: 'Tunis', lat: 36.82, lng: 10.17 },
              { flag: '🇪🇬', city: 'Hurghada', lat: 27.26, lng: 33.81 },
              { flag: '🇲🇷', city: 'Nouakchott', lat: 18.08, lng: -15.97 },
            ].map(d => (
              <a
                key={d.city}
                href={`https://www.openstreetmap.org/?mlat=${d.lat}&mlon=${d.lng}#map=10/${d.lat}/${d.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#FF6B35'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <span>{d.flag}</span> {d.city}
              </a>
            ))}
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
          <div>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              © {new Date().getFullYear()} EasyHotels Maghreb. Tous droits réservés.
            </p>
            <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
              🇪🇸 EasyHotels Maghreb SL — Registrada en España &nbsp;|&nbsp; 🇫🇷 EasyHotels Maghreb SAS — Enregistrée en France
            </p>
          </div>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Fait avec ❤️ pour la diaspora maghrébine en Europe
          </p>
        </div>
      </div>
    </footer>
  )
}
