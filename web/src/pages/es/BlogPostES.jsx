import React, { useEffect } from 'react'

const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Los 10 mejores hoteles baratos en Marrakech 2025',
  description: 'Compara precios de hoteles en Marrakech. Encuentra las mejores ofertas desde 35€/noche con EasyHotels Maghreb.',
  author: { '@type': 'Organization', name: 'EasyHotels Maghreb' },
  publisher: {
    '@type': 'Organization',
    name: 'EasyHotels Maghreb',
    logo: { '@type': 'ImageObject', url: 'https://easyhotels.maghreb.com/logo.png' },
  },
  datePublished: '2025-03-15',
  dateModified: '2025-06-01',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://easyhotels.maghreb.com/es/blog/hoteles-baratos-marrakech-2025' },
  image: 'https://easyhotels.maghreb.com/images/marrakech-medina.jpg',
  inLanguage: 'es',
}

const HOTELS = [
  { rank: 1, name: 'Hotel Atlas Asni', stars: 4, price: 42, highlight: 'Vistas impresionantes al Atlas y piscina exterior' },
  { rank: 2, name: 'Riad Yasmine', stars: 4, price: 55, highlight: 'Piscina interior y hammam tradicional marroquí' },
  { rank: 3, name: 'Ibis Marrakech Centre', stars: 3, price: 38, highlight: 'A 5 minutos a pie de la plaza Jemaa el-Fna' },
  { rank: 4, name: 'Le Meridien N\'Fis', stars: 5, price: 95, highlight: 'Complejo de lujo con spa 5 estrellas' },
  { rank: 5, name: 'Riad Dar Najat', stars: 3, price: 35, highlight: 'Riad auténtico en el corazón de la medina' },
  { rank: 6, name: 'Hotel Farouk Marrakech', stars: 3, price: 40, highlight: 'Terraza panorámica con desayuno incluido' },
  { rank: 7, name: 'Palais Ronsard Riad', stars: 4, price: 68, highlight: 'Arquitectura andaluza clásica con jardín interior' },
  { rank: 8, name: 'Hotel du Trésor', stars: 3, price: 45, highlight: 'Ubicación céntrica, fácil acceso a los zocos' },
  { rank: 9, name: 'La Sultana Marrakech', stars: 5, price: 120, highlight: 'Suite de lujo con piscina privada' },
  { rank: 10, name: 'Hotel Toulousain', stars: 2, price: 28, highlight: 'La mejor relación calidad-precio de la ciudad' },
]

const TOC = [
  { id: 'intro', label: 'Introducción' },
  { id: 'top10', label: 'Top 10 hoteles baratos' },
  { id: 'consejos', label: 'Consejos para reservar' },
  { id: 'faq', label: 'Preguntas frecuentes' },
  { id: 'related', label: 'Artículos relacionados' },
]

const RELATED = [
  { title: 'Los 10 mejores hoteles en Casablanca 2025', slug: 'hoteles-casablanca-2025', dest: 'casablanca' },
  { title: 'Guía completa: Agadir en familia con poco presupuesto', slug: 'hoteles-agadir-familia-2025', dest: 'agadir' },
  { title: 'Djerba: las mejores ofertas flash de la semana', slug: 'ofertas-flash-djerba', dest: 'djerba' },
]

function StarRating({ count }) {
  return <span style={{ color: '#F6C90E', marginLeft: 6 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
}

function CTAButton({ dest = 'marrakech', label = 'Comparar precios →' }) {
  return (
    <a
      href={`/es/buscar?destination=${dest}`}
      style={{
        display: 'inline-block',
        background: '#FF6B35',
        color: '#fff',
        padding: '12px 28px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 15,
        textDecoration: 'none',
        margin: '8px 0',
      }}
    >
      {label}
    </a>
  )
}

export default function BlogPostES() {
  useEffect(() => {
    document.title = 'Hoteles baratos Marrakech 2025 | EasyHotels Maghreb'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = 'Compara precios de hoteles en Marrakech. Encuentra las mejores ofertas desde 35€/noche con EasyHotels Maghreb.'

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = 'https://easyhotels.maghreb.com/es/blog/hoteles-baratos-marrakech-2025'

    let schema = document.getElementById('article-schema-es')
    if (!schema) { schema = document.createElement('script'); schema.id = 'article-schema-es'; schema.type = 'application/ld+json'; document.head.appendChild(schema) }
    schema.textContent = JSON.stringify(ARTICLE_SCHEMA)

    return () => { if (schema) schema.remove() }
  }, [])

  return (
    <div style={{ paddingTop: 64, fontFamily: "'Segoe UI', Arial, sans-serif", background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #c0392b 100%)', color: '#fff', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
            GUÍA 2025 · MARRUECOS
          </span>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, margin: '16px 0 12px', lineHeight: 1.2 }}>
            Los 10 mejores hoteles baratos en Marrakech 2025
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, margin: 0, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Desde 28€ hasta 120€/noche — compara, elige y ahorra en tu próxima estancia en la ciudad roja.
          </p>
          <div style={{ marginTop: 20, fontSize: 13, opacity: 0.8 }}>
            Actualizado el 1 de junio de 2025 · 8 min de lectura
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Main article */}
        <article style={{ flex: 1, minWidth: 0 }}>
          {/* Inline TOC */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px', marginBottom: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <strong style={{ fontSize: 13, textTransform: 'uppercase', color: '#718096', letterSpacing: 1 }}>Índice</strong>
            <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TOC.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} style={{ color: '#FF6B35', textDecoration: 'none', fontSize: 14, fontWeight: 500, background: '#fff3ee', padding: '4px 12px', borderRadius: 20, display: 'inline-block' }}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Intro */}
          <section id="intro">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748', marginTop: 0 }}>
              ¿Por qué Marrakech sigue siendo el destino ideal para viajeros con presupuesto ajustado?
            </h2>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              Marrakech — apodada la <strong>Ciudad Roja</strong> — es uno de los destinos más visitados del norte de África.
              Con sus laberínticos callejones, coloridos zocos, exuberantes jardines y su rica gastronomía, ofrece una experiencia
              cultural única. ¿La buena noticia? No hace falta gastar una fortuna para disfrutarla.
            </p>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              En 2025, el mercado hotelero de Marrakech ofrece una impresionante variedad de alojamientos, desde riads auténticos
              en la medina a <strong>partir de 28€/noche</strong> hasta establecimientos de 5 estrellas con piscina privada.
              Nuestro equipo ha comparado más de <strong>200 establecimientos</strong> para seleccionar las 10 mejores opciones
              que combinan confort y precios competitivos.
            </p>
            <div style={{ background: '#fff3ee', borderLeft: '4px solid #FF6B35', padding: '14px 18px', borderRadius: 4, margin: '20px 0' }}>
              <strong>Consejo importante:</strong> Los precios más bajos se consiguen reservando con al menos 3 semanas de antelación.
              Siempre compara varias plataformas: las diferencias pueden llegar al 30% para el mismo hotel.
            </div>
            <CTAButton dest="marrakech" label="Ver ofertas disponibles en Marrakech →" />
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

          {/* Top 10 */}
          <section id="top10">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748' }}>
              Top 10 hoteles baratos en Marrakech 2025
            </h2>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              Nuestro ranking considera la relación calidad-precio, las opiniones recientes de clientes (desde 2024) y la ubicación.
              Los precios indicados son las tarifas mínimas por noche en temporada baja.
            </p>

            {HOTELS.map((hotel) => (
              <div
                key={hotel.rank}
                style={{
                  background: '#fff',
                  border: hotel.rank === 1 ? '2px solid #FF6B35' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '20px 22px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: hotel.rank === 1 ? '0 4px 16px rgba(255,107,53,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: hotel.rank === 1 ? '#FF6B35' : '#f7fafc',
                  color: hotel.rank === 1 ? '#fff' : '#718096',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 18, flexShrink: 0,
                }}>
                  {hotel.rank}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#2d3748' }}>{hotel.name}</h3>
                    <StarRating count={hotel.stars} />
                  </div>
                  <p style={{ margin: '4px 0 0', color: '#718096', fontSize: 14 }}>{hotel.highlight}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#FF6B35' }}>desde {hotel.price}€</div>
                  <div style={{ fontSize: 12, color: '#a0aec0' }}>por noche</div>
                  <a
                    href={`/es/buscar?destination=marrakech&hotel=${encodeURIComponent(hotel.name)}`}
                    style={{ display: 'inline-block', background: '#FF6B35', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none', marginTop: 6 }}
                  >
                    Ver oferta
                  </a>
                </div>
              </div>
            ))}

            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <CTAButton dest="marrakech" label="Comparar todos los precios en Marrakech →" />
            </div>
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

          {/* Consejos */}
          <section id="consejos">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748' }}>
              Consejos para reservar tu hotel en Marrakech barato
            </h2>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#4a5568' }}>1. Elegir la temporada correcta</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              Los meses de <strong>noviembre a marzo</strong> (excepto Navidad y Año Nuevo) constituyen la temporada baja.
              Las temperaturas se mantienen agradables (15–22°C) y los precios pueden ser <strong>un 40% más bajos</strong>
              que en primavera. Evita abril–mayo y septiembre–octubre, períodos de alta afluencia europea.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#4a5568' }}>2. Medina vs. Guéliz: ¿dónde alojarse?</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              La <strong>medina</strong> ofrece una inmersión cultural total con sus riads tradicionales, pero los callejones
              pueden ser difíciles de navegar con maletas. El moderno barrio de <strong>Guéliz</strong> tiene hoteles de cadena
              más accesibles en coche, frecuentemente más baratos y con parking.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#4a5568' }}>3. Usar un comparador de precios</h3>
            <p style={{ color: '#4a5568', lineHeight: 1.75, fontSize: 16 }}>
              Nunca reserves en una sola plataforma. EasyHotels Maghreb compara en tiempo real las tarifas de Booking.com,
              Expedia, Hotels.com y los sitios web oficiales de los hoteles para garantizarte el mejor precio disponible.
            </p>

            <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 8, padding: '14px 18px', margin: '20px 0' }}>
              <strong style={{ color: '#276749' }}>Truco profesional:</strong>
              <span style={{ color: '#2f855a', marginLeft: 6 }}>
                Activa las alertas de precio en nuestra aplicación para recibir una notificación cuando un hotel de tu lista baje de precio.
              </span>
            </div>
            <CTAButton dest="marrakech" label="Activar alerta de precio para Marrakech →" />
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

          {/* FAQ */}
          <section id="faq">
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2d3748' }}>Preguntas frecuentes</h2>

            {[
              {
                q: '¿Cuál es el precio medio de un hotel en Marrakech?',
                a: 'En 2025, el precio medio por noche en Marrakech es de unos 65€ para un 3 estrellas y 120€ para un 4 estrellas. Los riads en la medina pueden oscilar entre 35€ y más de 300€ según la categoría.',
              },
              {
                q: '¿Es seguro pagar online para un hotel en Marruecos?',
                a: 'Sí, las grandes plataformas como Booking.com, Expedia y EasyHotels utilizan el protocolo SSL y sistemas de pago seguros. Estás protegido por la política de reembolso de la plataforma.',
              },
              {
                q: '¿Cuál es la política de cancelación habitual?',
                a: 'La mayoría de los hoteles ofrecen cancelación gratuita hasta 24–48 horas antes de la llegada. Siempre revisa las condiciones antes de confirmar. EasyHotels muestra claramente el tipo de cancelación para cada oferta.',
              },
            ].map(({ q, a }, i) => (
              <details key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', marginBottom: 10 }}>
                <summary style={{ fontWeight: 700, color: '#2d3748', cursor: 'pointer', fontSize: 15 }}>{q}</summary>
                <p style={{ color: '#4a5568', marginTop: 10, marginBottom: 0, lineHeight: 1.7, fontSize: 15 }}>{a}</p>
              </details>
            ))}
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

          {/* Conclusion CTA */}
          <div style={{ background: 'linear-gradient(135deg, #FF6B35, #c0392b)', borderRadius: 16, padding: '28px 24px', textAlign: 'center', color: '#fff', margin: '0 0 40px' }}>
            <h3 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 20 }}>¿Listo para reservar tu hotel en Marrakech?</h3>
            <p style={{ margin: '0 0 16px', opacity: 0.9, fontSize: 15 }}>
              Compara más de 200 hoteles con un solo clic. Garantía del mejor precio.
            </p>
            <a
              href="/es/buscar?destination=marrakech"
              style={{ display: 'inline-block', background: '#fff', color: '#FF6B35', padding: '13px 32px', borderRadius: 8, fontWeight: 900, fontSize: 16, textDecoration: 'none' }}
            >
              Comparar precios →
            </a>
          </div>

          {/* Related articles */}
          <section id="related">
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2d3748' }}>Artículos relacionados</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {RELATED.map((art) => (
                <a
                  key={art.slug}
                  href={`/es/blog/${art.slug}`}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 16px', textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ fontSize: 13, color: '#FF6B35', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>
                    {art.dest.charAt(0).toUpperCase() + art.dest.slice(1)}
                  </div>
                  <div style={{ color: '#2d3748', fontWeight: 600, fontSize: 15, lineHeight: 1.4 }}>{art.title}</div>
                  <div style={{ color: '#FF6B35', fontWeight: 700, fontSize: 13, marginTop: 10 }}>Leer artículo →</div>
                </a>
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  )
}
