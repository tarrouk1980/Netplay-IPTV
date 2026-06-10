import React, { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── SHARED LAYOUT ─────────────────────────────────────────────────────────────

function LegalLayout({ title, subtitle, children }) {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8F9FA' }}>
      <div style={{ background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 12 }}>{title}</h1>
        {subtitle && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>{subtitle}</p>}
      </div>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '40px 48px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', lineHeight: 1.8, color: '#4a5568', fontSize: 15 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>{title}</h2>
      {children}
    </section>
  )
}

// ─── PRIVACY POLICY ────────────────────────────────────────────────────────────

export function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Política de Privacidad"
      subtitle="Última actualización: 10 de junio de 2026"
    >
      <p style={{ background: '#EBF8FF', borderRadius: 8, padding: '12px 16px', color: '#2c5282', marginBottom: 32, fontSize: 14 }}>
        Este documento cumple con el <strong>Reglamento General de Protección de Datos (RGPD/GDPR)</strong> de la UE
        y la <strong>Ley Orgánica de Protección de Datos (LOPD-GDD)</strong> española.
      </p>

      <Section title="1. Responsable del tratamiento">
        <p><strong>Empresa:</strong> EasyHotels Maghreb S.L. (en constitución)</p>
        <p><strong>Domicilio social:</strong> [Dirección en España — pendiente de constitución]</p>
        <p><strong>NIF:</strong> [Pendiente de asignación]</p>
        <p><strong>Email de contacto:</strong> privacidad@easyhotels.es</p>
        <p><strong>Delegado de Protección de Datos (DPD):</strong> dpo@easyhotels.es</p>
      </Section>

      <Section title="2. Datos que recopilamos">
        <p>Recopilamos los siguientes tipos de datos:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Datos de navegación:</strong> Páginas visitadas, tiempo en el sitio, clics (solo con consentimiento analítico)</li>
          <li><strong>Datos de búsqueda:</strong> Destinos buscados, fechas, número de viajeros</li>
          <li><strong>Datos de cuenta</strong> (si te registras): Nombre, email, preferencias</li>
          <li><strong>Datos técnicos:</strong> Dirección IP (anonimizada), tipo de dispositivo, navegador</li>
          <li><strong>Cookies:</strong> Ver nuestra Política de Cookies</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          <strong>No recopilamos</strong> datos de pago (las reservas se realizan en los sitios socios: Booking.com, Expedia, etc.)
        </p>
      </Section>

      <Section title="3. Finalidades y base jurídica">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#F7FAFC' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Finalidad</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', border: '1px solid #e2e8f0' }}>Base jurídica (RGPD)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Mostrar resultados de búsqueda', 'Interés legítimo (Art. 6.1.f)'],
              ['Mejorar el servicio (analytics)', 'Consentimiento (Art. 6.1.a)'],
              ['Comunicaciones de marketing', 'Consentimiento (Art. 6.1.a)'],
              ['Cumplimiento legal', 'Obligación legal (Art. 6.1.c)'],
              ['Gestión de cuenta de usuario', 'Ejecución de contrato (Art. 6.1.b)'],
            ].map(([fin, base], i) => (
              <tr key={i}>
                <td style={{ padding: '10px 14px', border: '1px solid #e2e8f0' }}>{fin}</td>
                <td style={{ padding: '10px 14px', border: '1px solid #e2e8f0', color: '#4a5568' }}>{base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="4. Tus derechos (RGPD)">
        <p>De conformidad con el RGPD y la LOPD-GDD, tienes derecho a:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti</li>
          <li><strong>Rectificación:</strong> Corregir datos incorrectos</li>
          <li><strong>Supresión ("derecho al olvido"):</strong> Eliminar tus datos</li>
          <li><strong>Limitación:</strong> Restringir el tratamiento de tus datos</li>
          <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
          <li><strong>Oposición:</strong> Oponerte al tratamiento por interés legítimo</li>
          <li><strong>Retirar el consentimiento</strong> en cualquier momento</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Para ejercer estos derechos, contacta a: <strong>privacidad@easyhotels.es</strong>
        </p>
        <p>
          También puedes presentar una reclamación ante la{' '}
          <strong>Agencia Española de Protección de Datos (AEPD)</strong>:{' '}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6B35' }}>www.aepd.es</a>
        </p>
      </Section>

      <Section title="5. Transferencias internacionales">
        <p>
          Utilizamos servicios de terceros que pueden transferir datos fuera del EEE:
        </p>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Google Analytics 4:</strong> USA — acogido al Data Privacy Framework EU-EEUU</li>
          <li><strong>Booking.com, Expedia:</strong> Tratamiento según sus propias políticas de privacidad</li>
          <li><strong>Vercel/Netlify</strong> (hosting): Servidores en la UE</li>
        </ul>
      </Section>

      <Section title="6. Conservación de datos">
        <p>Conservamos los datos durante el tiempo estrictamente necesario:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Datos de cuenta: Mientras la cuenta esté activa + 3 años</li>
          <li>Logs de navegación: 13 meses máximo</li>
          <li>Consentimiento de cookies: Hasta su retirada</li>
          <li>Obligaciones fiscales/legales: 5-7 años según normativa española</li>
        </ul>
      </Section>

      <Section title="7. Contacto">
        <p>Para cualquier consulta sobre privacidad:</p>
        <p>📧 <strong>privacidad@easyhotels.es</strong></p>
        <p>Respondemos en un máximo de <strong>30 días hábiles</strong> (plazo RGPD).</p>
      </Section>
    </LegalLayout>
  )
}

// ─── TERMS OF SERVICE ──────────────────────────────────────────────────────────

export function TermsOfService() {
  return (
    <LegalLayout
      title="Términos y Condiciones"
      subtitle="Última actualización: 10 de junio de 2026"
    >
      <Section title="1. Identificación del sitio web">
        <p>
          <strong>EasyHotels Maghreb</strong> es un comparador de precios de hoteles en el Norte de África.
          Operado por EasyHotels Maghreb S.L. (en constitución), con domicilio en España.
        </p>
        <p>
          El sitio web actúa como intermediario de información entre el usuario y los proveedores de alojamiento
          (Booking.com, Expedia, Hotels.com, Airbnb, hoteles directos). <strong>No realizamos reservas directas</strong>.
        </p>
      </Section>

      <Section title="2. Objeto del servicio">
        <p>EasyHotels Maghreb ofrece:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Comparación de precios de hoteles en tiempo real o a través de datos agregados</li>
          <li>Información editorial sobre destinos del Norte de África</li>
          <li>Redirección a plataformas de reserva con las que mantenemos acuerdos de afiliación</li>
          <li>Filtros culturales y familiares para facilitar la búsqueda</li>
        </ul>
      </Section>

      <Section title="3. Modelo de negocio y transparencia">
        <p>
          EasyHotels Maghreb puede recibir una <strong>comisión de afiliado</strong> cuando el usuario hace clic
          en un enlace y realiza una reserva en un sitio socio. Esta comisión es pagada por el proveedor
          (Booking.com, Expedia, etc.) y <strong>no supone coste adicional para el usuario</strong>.
        </p>
        <p>Los precios mostrados son orientativos y pueden variar. El precio definitivo se muestra en el sitio del proveedor.</p>
      </Section>

      <Section title="4. Propiedad intelectual">
        <p>
          Todos los contenidos del sitio (textos, imágenes, código, diseño) son propiedad de EasyHotels Maghreb
          o están bajo licencia. Queda prohibida su reproducción sin autorización escrita.
        </p>
        <p>Los nombres de marcas de terceros (Booking.com, Expedia, etc.) son propiedad de sus respectivos titulares.</p>
      </Section>

      <Section title="5. Limitación de responsabilidad">
        <p>EasyHotels Maghreb no se responsabiliza de:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>La exactitud de los precios en tiempo real (pueden variar entre la consulta y la reserva)</li>
          <li>Las condiciones de los hoteles y servicios ofrecidos por terceros</li>
          <li>Las políticas de cancelación de los proveedores socios</li>
          <li>Interrupciones del servicio por causas técnicas ajenas a nuestra voluntad</li>
        </ul>
      </Section>

      <Section title="6. Ley aplicable y jurisdicción">
        <p>
          Estos términos se rigen por la <strong>legislación española</strong> y la normativa comunitaria europea.
          Para cualquier controversia, las partes se someten a los juzgados y tribunales de España,
          con renuncia expresa a cualquier otro fuero.
        </p>
        <p>Para reclamaciones de consumidores, puede utilizarse la plataforma de resolución de litigios en línea de la UE:
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6B35' }}> ec.europa.eu/consumers/odr</a>
        </p>
      </Section>

      <Section title="7. Contacto">
        <p>📧 <strong>legal@easyhotels.es</strong></p>
      </Section>
    </LegalLayout>
  )
}

// ─── COOKIE POLICY ─────────────────────────────────────────────────────────────

export function CookiePolicy() {
  return (
    <LegalLayout
      title="Política de Cookies"
      subtitle="Última actualización: 10 de junio de 2026"
    >
      <p style={{ background: '#FFFBEB', borderRadius: 8, padding: '12px 16px', color: '#744210', marginBottom: 32, fontSize: 14 }}>
        Puedes gestionar tus preferencias de cookies en cualquier momento haciendo clic en "Configurar cookies"
        en el banner de la parte inferior de la pantalla.
      </p>

      <Section title="¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando los visitas.
          Permiten que el sitio recuerde tus acciones y preferencias durante un período de tiempo.
        </p>
      </Section>

      <Section title="Tipos de cookies que utilizamos">
        <div style={{ display: 'grid', gap: 16 }}>
          {[
            {
              type: 'Cookies esenciales',
              color: '#276749',
              bg: '#F0FFF4',
              required: true,
              desc: 'Imprescindibles para que el sitio funcione correctamente. Sin estas cookies, el sitio no puede funcionar.',
              examples: [
                { name: 'easyhotels_gdpr_consent', purpose: 'Almacena tus preferencias de cookies', duration: '12 meses' },
                { name: 'session_id', purpose: 'Mantiene tu sesión activa', duration: 'Sesión' },
              ],
            },
            {
              type: 'Cookies de análisis',
              color: '#2c5282',
              bg: '#EBF8FF',
              required: false,
              desc: 'Nos permiten entender cómo interactúas con el sitio para mejorarlo. Solo se activan con tu consentimiento.',
              examples: [
                { name: '_ga, _ga_*', purpose: 'Google Analytics 4 — estadísticas de uso', duration: '13 meses' },
                { name: '_gid', purpose: 'Google Analytics — distingue usuarios', duration: '24 horas' },
              ],
            },
            {
              type: 'Cookies de marketing',
              color: '#553c9a',
              bg: '#FAF5FF',
              required: false,
              desc: 'Utilizadas para mostrarte publicidad relevante en otros sitios. Solo se activan con tu consentimiento.',
              examples: [
                { name: '_fbp', purpose: 'Facebook Pixel — retargeting', duration: '3 meses' },
                { name: 'google_adwords', purpose: 'Google Ads — conversiones', duration: '90 días' },
              ],
            },
            {
              type: 'Cookies de personalización',
              color: '#744210',
              bg: '#FFFBEB',
              required: false,
              desc: 'Recuerdan tus preferencias (destinos favoritos, moneda preferida). Solo con tu consentimiento.',
              examples: [
                { name: 'preferred_currency', purpose: 'Tu moneda preferida', duration: '6 meses' },
                { name: 'recent_searches', purpose: 'Tus búsquedas recientes', duration: '30 días' },
              ],
            },
          ].map(cat => (
            <div key={cat.type} style={{ background: cat.bg, borderRadius: 12, padding: 20, border: `1.5px solid ${cat.color}22` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: cat.color }}>{cat.type}</h3>
                <span style={{ fontSize: 11, fontWeight: 700, background: cat.required ? '#276749' : '#718096', color: '#fff', padding: '3px 10px', borderRadius: 20 }}>
                  {cat.required ? 'Siempre activas' : 'Requiere consentimiento'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#4a5568', marginBottom: 12 }}>{cat.desc}</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#718096', borderBottom: '1px solid #e2e8f0' }}>Cookie</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#718096', borderBottom: '1px solid #e2e8f0' }}>Finalidad</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#718096', borderBottom: '1px solid #e2e8f0' }}>Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.examples.map(ex => (
                    <tr key={ex.name}>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#2d3748' }}>{ex.name}</td>
                      <td style={{ padding: '6px 8px', color: '#4a5568' }}>{ex.purpose}</td>
                      <td style={{ padding: '6px 8px', color: '#718096' }}>{ex.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Cómo gestionar las cookies">
        <p>Tienes varias opciones para controlar las cookies:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Banner de cookies:</strong> Haz clic en "Configurar" para personalizar tus preferencias</li>
          <li><strong>Tu navegador:</strong> Puedes bloquear o eliminar cookies desde la configuración de tu navegador</li>
          <li><strong>Herramientas de opt-out:</strong></li>
        </ul>
        <div style={{ marginLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6B35', fontSize: 14 }}>
            → Google Analytics Opt-Out
          </a>
          <a href="https://www.facebook.com/privacy/policies/cookies/" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6B35', fontSize: 14 }}>
            → Facebook Cookie Settings
          </a>
          <a href="https://www.youronlinechoices.com/es/" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6B35', fontSize: 14 }}>
            → Your Online Choices (publicidad comportamental)
          </a>
        </div>
      </Section>

      <Section title="Base jurídica">
        <p>
          El uso de cookies analíticas, de marketing y de personalización se basa en tu <strong>consentimiento explícito</strong>
          conforme al Art. 6(1)(a) del RGPD y la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI).
        </p>
        <p>Las cookies esenciales se basan en el <strong>interés legítimo</strong> para el funcionamiento del servicio.</p>
      </Section>

      <Section title="Contacto">
        <p>Para consultas sobre cookies y privacidad: 📧 <strong>privacidad@easyhotels.es</strong></p>
        <p>Supervisión: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: '#FF6B35' }}>Agencia Española de Protección de Datos (AEPD)</a></p>
      </Section>
    </LegalLayout>
  )
}

// ─── ROUTER COMPONENT (renders the right page based on path) ───────────────────

export default function LegalPages() {
  const path = typeof window !== 'undefined' ? window.location.pathname : ''

  if (path.includes('terminos') || path.includes('terms')) return <TermsOfService />
  if (path.includes('cookies')) return <CookiePolicy />
  return <PrivacyPolicy />
}
