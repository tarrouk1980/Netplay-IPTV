import React, { useState } from 'react'

const PACKS = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '',
    color: '#718096',
    features: [
      '✓ Fiche hôtel de base',
      '✓ Photos (5 max)',
      '✓ Coordonnées & localisation',
      '✓ 1 langue (Français)',
      '✗ Comparaison de prix',
      '✗ Offres Flash',
      '✗ Analytics avancées',
    ],
    cta: 'Commencer',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '49€',
    period: '/mois',
    color: '#FF6B35',
    features: [
      '✓ Fiche hôtel premium',
      '✓ Photos illimitées',
      '✓ 3 langues (Fr/Ar/En)',
      '✓ Comparaison de prix activée',
      '✓ Offres Flash & promotions',
      '✓ Analytics basiques',
      '✓ Support prioritaire',
    ],
    cta: 'Essai gratuit 30 jours',
    highlight: true,
    badge: 'POPULAIRE',
  },
  {
    name: 'Premium',
    price: '99€',
    period: '/mois',
    color: '#004E89',
    features: [
      '✓ Tout du pack Pro',
      '✓ Mise en avant moteur',
      '✓ Intégration booking direct',
      '✓ Analytics avancées & rapports',
      '✓ Account manager dédié',
      '✓ API partenaire',
      '✓ Formation incluse',
    ],
    cta: 'Contacter l\'équipe',
    highlight: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'Houcine Bettaieb',
    hotel: 'Hôtel Riviera, Hammamet',
    rating: 5,
    text: 'Depuis notre référencement sur EasyHotels, nos réservations directes ont augmenté de 32% en 3 mois. L\'équipe est réactive et le tableau de bord très intuitif.',
    flag: '🇹🇳',
  },
  {
    name: 'Rachid El Amrani',
    hotel: 'Riad Al Baraka, Marrakech',
    rating: 5,
    text: 'Notre visibilité a explosé. On reçoit maintenant des clients de 5 pays différents. Le filtre "Halal" nous a vraiment aidés à toucher notre cible.',
    flag: '🇲🇦',
  },
  {
    name: 'Nadia Benchemsi',
    hotel: 'Hôtel Saphir, Alger',
    rating: 5,
    text: 'L\'investissement dans le pack Pro s\'est rentabilisé en moins de 2 semaines. Je recommande EasyHotels à tous les hôteliers algériens.',
    flag: '🇩🇿',
  },
]

export default function HotelManagerPage() {
  const [form, setForm] = useState({ name: '', hotel: '', city: '', email: '', phone: '', pack: 'Pro' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = e => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 60%, #FF6B35 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🏨</div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
            Boostez vos <span style={{ color: '#FFC72C' }}>réservations directes</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 20, marginBottom: 16 }}>
            Rejoignez 47 hôteliers partenaires EasyHotels et multipliez votre visibilité
          </p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 48 }}>
            Tunisie · Maroc · Algérie · Égypte · Mauritanie
          </p>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 24, maxWidth: 600, margin: '0 auto 48px',
          }}>
            {[
              { value: '+340%', label: 'de visibilité' },
              { value: '+28%', label: 'de réservations' },
              { value: '47', label: 'partenaires actifs' },
              { value: '0€', label: 'de commission' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12, padding: 20,
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#FFC72C' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <a href="#register" style={{
            display: 'inline-block',
            background: '#FF6B35', color: '#fff',
            padding: '16px 40px', borderRadius: 10,
            fontSize: 17, fontWeight: 800,
            boxShadow: '0 8px 30px rgba(255,107,53,0.4)',
          }}>
            Référencer mon hôtel gratuitement →
          </a>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 48 }}>
            Comment ça marche ?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { step: '1', icon: '📝', title: 'Créez votre fiche', desc: 'Remplissez le formulaire ci-dessous. Notre équipe valide votre établissement sous 48h.' },
              { step: '2', icon: '🖼️', title: 'Ajoutez vos photos', desc: 'Uploadez vos plus belles photos et décrivez vos services en 3 langues.' },
              { step: '3', icon: '🔍', title: 'Apparaissez dans les recherches', desc: 'Votre hôtel est visible par des milliers de voyageurs dès validation.' },
              { step: '4', icon: '💰', title: 'Recevez des réservations', desc: 'Les clients réservent directement chez vous. Zéro commission.' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 24, background: '#f7fafc', borderRadius: 16, position: 'relative' }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B35, #FFC72C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, margin: '0 auto 16px',
                }}>
                  {s.icon}
                </div>
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  fontSize: 36, fontWeight: 900, color: '#e2e8f0',
                }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packs */}
      <section style={{ padding: '80px 24px', background: '#F8F9FA' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>Nos offres</h2>
          <p style={{ color: '#718096', marginBottom: 56 }}>Choisissez le pack adapté à votre établissement</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {PACKS.map((pack, i) => (
              <div
                key={pack.name}
                style={{
                  background: '#fff',
                  borderRadius: 20, padding: 32,
                  boxShadow: pack.highlight ? '0 20px 60px rgba(255,107,53,0.2)' : '0 4px 20px rgba(0,0,0,0.08)',
                  border: pack.highlight ? '2px solid #FF6B35' : '1px solid #e2e8f0',
                  position: 'relative',
                  transform: pack.highlight ? 'scale(1.03)' : 'none',
                }}
              >
                {pack.badge && (
                  <span style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#FF6B35', color: '#fff',
                    fontSize: 11, fontWeight: 800, padding: '4px 16px', borderRadius: 20,
                  }}>
                    {pack.badge}
                  </span>
                )}
                <h3 style={{ fontSize: 22, fontWeight: 800, color: pack.color, marginBottom: 16 }}>{pack.name}</h3>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: '#2d3748' }}>{pack.price}</span>
                  <span style={{ color: '#718096', fontSize: 16 }}>{pack.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
                  {pack.features.map((f, fi) => (
                    <div key={fi} style={{
                      fontSize: 14,
                      color: f.startsWith('✗') ? '#a0aec0' : '#4a5568',
                    }}>
                      {f}
                    </div>
                  ))}
                </div>
                <a href="#register" style={{
                  display: 'block',
                  background: pack.highlight ? '#FF6B35' : 'transparent',
                  color: pack.highlight ? '#fff' : pack.color,
                  border: `2px solid ${pack.highlight ? '#FF6B35' : pack.color}`,
                  padding: '12px', borderRadius: 10,
                  fontWeight: 700, fontSize: 14, textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}>
                  {pack.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 48 }}>
            Ils nous font confiance
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: '#f7fafc', borderRadius: 16, padding: 28,
                textAlign: 'left', border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: t.rating }).map((_, ri) => (
                    <span key={ri} style={{ color: '#FFC72C', fontSize: 18 }}>★</span>
                  ))}
                </div>
                <p style={{ color: '#4a5568', fontSize: 14, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #004E89, #1a6eac)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {t.flag}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#2d3748', fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#718096' }}>{t.hotel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" style={{ background: '#F8F9FA', padding: '80px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>
              Référencez votre hôtel
            </h2>
            <p style={{ color: '#718096', fontSize: 16 }}>
              Remplissez le formulaire et notre équipe vous contacte sous 24h
            </p>
          </div>

          {submitted ? (
            <div style={{
              background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: '#2d3748', marginBottom: 12 }}>
                Demande envoyée !
              </h3>
              <p style={{ color: '#718096', fontSize: 16 }}>
                Notre équipe vous contactera dans les 24h pour finaliser votre inscription.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: '#fff', borderRadius: 20, padding: 40,
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              }}
            >
              {[
                { name: 'name', label: 'Votre nom complet', type: 'text', placeholder: 'Mohamed Ben Ali', required: true },
                { name: 'hotel', label: 'Nom de votre hôtel', type: 'text', placeholder: 'Hôtel de la Paix', required: true },
                { name: 'city', label: 'Ville / Destination', type: 'text', placeholder: 'Tunis, Marrakech...', required: true },
                { name: 'email', label: 'Email professionnel', type: 'email', placeholder: 'contact@monhotel.com', required: true },
                { name: 'phone', label: 'Numéro de téléphone', type: 'tel', placeholder: '+216 XX XXX XXX', required: false },
              ].map(field => (
                <div key={field.name} style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>
                    {field.label} {field.required && <span style={{ color: '#e53e3e' }}>*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    style={{
                      width: '100%', padding: '12px 14px',
                      border: '1.5px solid #e2e8f0', borderRadius: 8,
                      fontSize: 14, outline: 'none', color: '#2d3748',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#FF6B35'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              ))}

              {/* Pack select */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>
                  Pack souhaité
                </label>
                <select
                  name="pack"
                  value={form.pack}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid #e2e8f0', borderRadius: 8,
                    fontSize: 14, outline: 'none', color: '#2d3748', background: '#fff',
                  }}
                >
                  <option value="Starter">Starter — Gratuit</option>
                  <option value="Pro">Pro — 49€/mois (Recommandé)</option>
                  <option value="Premium">Premium — 99€/mois</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '16px',
                  background: '#FF6B35', color: '#fff',
                  borderRadius: 10, fontSize: 16, fontWeight: 800,
                  boxShadow: '0 4px 20px rgba(255,107,53,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e55a24'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FF6B35'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Envoyer ma demande →
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#a0aec0', marginTop: 16 }}>
                ✓ Sans engagement · ✓ Réponse sous 24h · ✓ Aucune commission
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
