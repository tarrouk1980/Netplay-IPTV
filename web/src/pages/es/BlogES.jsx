import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ARTICLES = [
  {
    id: 'es-1',
    slug: 'mejores-hoteles-djerba-2026',
    title: 'Los 10 mejores hoteles en Djerba 2026 — Guía completa para españoles',
    category: 'Guía',
    categoryColor: '#004E89',
    keywords: ['hoteles djerba', 'mejores hoteles tunez', 'hotel djerba precio'],
    excerpt: 'Djerba, la isla de los sueños tunecina, está llena de establecimientos hoteleros excepcionales. Nuestro equipo ha seleccionado los 10 mejores para ofrecerte una experiencia inolvidable.',
    date: '12 Enero 2026',
    readTime: '5 min',
    author: 'Elena García',
    gradient: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)',
    emoji: '🏝️',
    tags: ['Djerba', 'Túnez', 'Playa'],
    content: `
Djerba es, sin duda, uno de los destinos más populares del Mediterráneo africano entre los turistas españoles.
Con su clima excepcional, sus playas de arena fina y su rica gastronomía, la isla promete unas vacaciones perfectas.

## Los 10 mejores hoteles en Djerba

**1. Hotel Djerba Plaza Thalassa ⭐⭐⭐⭐**
A primera línea de playa, este establecimiento ofrece un acceso directo al mar Mediterráneo.
Precio medio: 285 TND (≈85€) por noche. Servicios halal disponibles.

**2. Riu Imperial Marhaba ⭐⭐⭐⭐⭐**
El mejor resort todo incluido de Hammamet. Animación para toda la familia, piscinas espectaculares.
Precio medio: 420 TND (≈126€) por noche.

**3. Djerba Sun Club ⭐⭐⭐⭐**
Ideal para familias con niños. Zona de burkini disponible en la piscina principal.
Precio medio: 220 TND (≈66€) por noche.

**4. Iberostar Mehari Djerba ⭐⭐⭐⭐⭐**
Lujo absoluto en la isla. Spa de primer nivel y gastronomía tunecina auténtica.
Precio medio: 520 TND (≈156€) por noche.

**5. Hotel Hasdrubal Thalassa ⭐⭐⭐⭐⭐**
Centro de talasoterapia de referencia en el Mediterráneo. Perfecto para turismo médico.
Precio medio: 480 TND (≈144€) por noche.

## Consejos para reservar en Djerba

- **Mejor época**: Mayo-Junio y Septiembre-Octubre para evitar el calor extremo
- **Vuelos directos** desde Madrid, Barcelona y Valencia con Iberia, Vueling y Transavia
- **Comparar siempre** en EasyHotels para ahorrar hasta un 60%

¿Listo para reservar tu hotel en Djerba?
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Los 10 mejores hoteles en Djerba 2026',
      description: 'Guía completa de los mejores hoteles en Djerba, Túnez para turistas españoles',
      author: { '@type': 'Person', name: 'Elena García' },
      datePublished: '2026-01-12',
      publisher: { '@type': 'Organization', name: 'EasyHotels Maghreb' },
    },
  },
  {
    id: 'es-2',
    slug: 'hoteles-marrakech-comparativa-precios-2026',
    title: 'Hoteles en Marrakech: comparativa de precios 2026',
    category: 'Comparativa',
    categoryColor: '#744210',
    keywords: ['hoteles marrakech baratos', 'hotel marrakech españa', 'hoteles marruecos'],
    excerpt: 'Marrakech ofrece una oferta hotelera increíblemente variada. Aprende a comparar precios eficazmente y ahorra hasta un 60% en tu estancia en la Ciudad Roja.',
    date: '8 Enero 2026',
    readTime: '6 min',
    author: 'Carlos Martínez',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #e55a24 100%)',
    emoji: '🇲🇦',
    tags: ['Marrakech', 'Marruecos', 'Precios'],
    content: `
Marrakech, la Ciudad Roja, es el destino marroquí más visitado por españoles. Sus zócalos vibrantes,
riads históricos y spa hammam hacen de ella una experiencia única.

## Comparativa de precios por categoría

**Hoteles de lujo (5 estrellas)**
- Royal Mansour Marrakech: 4.500 MAD (≈418€)/noche — el más lujoso
- La Mamounia: 3.800 MAD (≈354€)/noche — histórico, icónico
- Mandarin Oriental: 3.200 MAD (≈298€)/noche — contemporáneo

**Hoteles de calidad (4 estrellas)**
- Atlas Asni Marrakech: 650 MAD (≈60€)/noche — halal, sin alcohol
- Kenzi Rose Garden: 850 MAD (≈79€)/noche — jardines espectaculares
- Ibis Marrakech: 580 MAD (≈54€)/noche — precio/calidad excelente

**Riads boutique**
- Riad Yasmine: 1.100 MAD (≈102€)/noche — piscina privada, muy Instagram
- Riad Kniza: 900 MAD (≈84€)/noche — auténtico, cocina marroquí

## ¿Cuándo es más barato volar a Marrakech?

Los meses más económicos son: Enero, Febrero y Noviembre.
Los meses con más demanda (y más caros): Julio, Agosto, Semana Santa.

Desde España, hay vuelos directos con Ryanair, Vueling, Iberia y Air Arabia Maroc
desde Madrid, Barcelona, Málaga, Sevilla y Valencia.
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Hoteles en Marrakech: comparativa de precios 2026',
      description: 'Comparativa completa de precios de hoteles en Marrakech para viajeros desde España',
      author: { '@type': 'Person', name: 'Carlos Martínez' },
      datePublished: '2026-01-08',
      publisher: { '@type': 'Organization', name: 'EasyHotels Maghreb' },
    },
  },
  {
    id: 'es-3',
    slug: 'hoteles-halal-marruecos-familias-musulmanas',
    title: 'Hoteles halal en Marruecos: guía para familias musulmanas',
    category: 'Halal',
    categoryColor: '#276749',
    keywords: ['hotel halal marruecos', 'hotel sin alcohol norte africa', 'hotel marruecos familias'],
    excerpt: '¿Buscas alojamiento conforme a tus valores islámicos? Descubre nuestra selección de hoteles halal certificados en Marruecos: sin alcohol, cocina halal, piscinas separadas.',
    date: '5 Enero 2026',
    readTime: '7 min',
    author: 'Fatima Benali',
    gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    emoji: '🌙',
    tags: ['Halal', 'Marruecos', 'Familia'],
    content: `
Para las familias musulmanas de España, encontrar un hotel que respete sus valores no siempre es fácil.
EasyHotels ha seleccionado los mejores establecimientos halal de Marruecos.

## ¿Qué significa un hotel halal?

Un hotel halal certificado ofrece:
- **Sin alcohol** en todo el establecimiento (ni en el minibar)
- **Comida halal certificada** — todos los platos con certificación oficial
- **Piscina separada** hombres/mujeres (o franjas horarias diferenciadas)
- **Sala de oración** disponible en el hotel
- **Servicios Ramadán**: iftar preparado, suhoor disponible, ambiente espiritual

## Los mejores hoteles halal en Marruecos

**Agadir**
- Hotel Tildi ⭐⭐⭐⭐: sin alcohol, piscina separada, playa halal
  Precio: 780 MAD (≈72€)/noche
- Sofitel Agadir Thalassa: zonas separadas, spa femenino
  Precio: 2.200 MAD (≈205€)/noche

**Marrakech**
- Atlas Asni Marrakech: sin alcohol, halal certificado
  Precio: 650 MAD (≈60€)/noche
- Ibis Marrakech Centre: económico, conforme, céntrico
  Precio: 520 MAD (≈48€)/noche

**Fez (Fes)**
- Riad Dar Seffarine: riad histórico, 100% halal, medina
  Precio: 900 MAD (≈84€)/noche

## Filtros culturales en EasyHotels

Utiliza nuestros filtros en /es/buscar para encontrar directamente:
- 🚫 Sin Alcohol
- 🧕 Burkini OK
- 🍖 Halal Certificado
- 🌙 Servicios Ramadán
- 💒 Luna de miel halal
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Hoteles halal en Marruecos: guía para familias musulmanas',
      description: 'Guía completa de hoteles halal en Marruecos para familias musulmanas en España',
      author: { '@type': 'Person', name: 'Fatima Benali' },
      datePublished: '2026-01-05',
      publisher: { '@type': 'Organization', name: 'EasyHotels Maghreb' },
    },
  },
  {
    id: 'es-4',
    slug: 'hurghada-vs-sharm-el-sheikh-2026',
    title: 'Hurghada vs Sharm el-Sheij: ¿cuál elegir en 2026?',
    category: 'Comparativa',
    categoryColor: '#2c5282',
    keywords: ['hoteles hurghada', 'sharm el sheikh hotel precio', 'vacaciones egipto'],
    excerpt: 'Dos destinos egipcios de ensueño, pero experiencias muy diferentes. Mar Rojo, corales, animación... Comparamos todo para ayudarte a elegir.',
    date: '2 Enero 2026',
    readTime: '6 min',
    author: 'Pablo Sánchez',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    emoji: '🤿',
    tags: ['Egipto', 'Mar Rojo', 'Buceo'],
    content: `
Egipto es el destino más económico del Mediterráneo oriental para turistas españoles.
Pero, ¿Hurghada o Sharm el-Sheij? Ambas ciudades tienen personalidades muy distintas.

## Hurghada — Para el turista de resort

Hurghada es la capital del turismo de masas en el Mar Rojo.
Con más de 200 hoteles de categoría, ofrece la mejor relación calidad-precio.

**Pros:**
- Precios muy competitivos (desde 45€/noche todo incluido)
- Vuelos directos desde Madrid y Barcelona
- Amplia oferta de actividades: buceo, windsurf, excursiones al desierto

**Hoteles recomendados:**
- Steigenberger Aqua Magic ⭐⭐⭐⭐⭐: parque acuático, 155€/noche (≈174€)
- Pickalbatros Aqua Blu ⭐⭐⭐⭐⭐: todo incluido, playa privada
- Albatros Aqua Blu: 85€/noche todo incluido

## Sharm el-Sheij — Para el amante del buceo

Sharm es el paraíso del buceo mundial. Sus corales del estrecho de Tirán son únicos.

**Pros:**
- Fondos marinos espectaculares — UNESCO protegido
- Ambiente más internacional y sofisticado
- Excursiones al Monte Sinaí y Santa Catalina

**Hoteles recomendados:**
- Barceló Tiran Sharm ⭐⭐⭐⭐⭐: 185€/noche, buceo incluido
- Four Seasons Sharm: lujo absoluto, 350€/noche
- Iberostar Selection Coral Ocean: 130€/noche todo incluido

## Veredicto

- **Elige Hurghada** si buscas precio y resort familiar
- **Elige Sharm el-Sheij** si amas el buceo y quieres algo más exclusivo
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Hurghada vs Sharm el-Sheij: ¿cuál elegir en 2026?',
      description: 'Comparativa completa entre Hurghada y Sharm el-Sheij para turistas españoles',
      author: { '@type': 'Person', name: 'Pablo Sánchez' },
      datePublished: '2026-01-02',
      publisher: { '@type': 'Organization', name: 'EasyHotels Maghreb' },
    },
  },
  {
    id: 'es-5',
    slug: 'viajar-tunez-desde-espana-guia-completa',
    title: 'Viajar a Túnez desde España: todo lo que necesitas saber',
    category: 'Guía',
    categoryColor: '#004E89',
    keywords: ['viaje tunez desde españa', 'vuelo hotel tunez', 'hoteles tunez'],
    excerpt: 'Vuelos directos, visado, moneda, hoteles, seguridad... Todo lo necesario para organizar tu viaje perfecto a Túnez desde España.',
    date: '28 Diciembre 2025',
    readTime: '8 min',
    author: 'María López',
    gradient: 'linear-gradient(135deg, #FFC72C 0%, #FF6B35 100%)',
    emoji: '🇹🇳',
    tags: ['Túnez', 'Viaje', 'España'],
    content: `
Túnez es uno de los destinos favoritos de los españoles para unas vacaciones económicas al sol.
Con vuelos directos desde múltiples ciudades españolas, el viaje es más fácil que nunca.

## Vuelos desde España a Túnez

**Desde Madrid (MAD):**
- Iberia: Madrid → Túnez-Cartago, desde 89€ ida/vuelta
- Transavia: Madrid → Djerba, desde 79€ ida/vuelta
- Frecuencia: 5-7 vuelos/semana en temporada

**Desde Barcelona (BCN):**
- Vueling: Barcelona → Túnez, desde 69€ ida/vuelta
- Air Arabia Maroc: Barcelona → Monastir, desde 55€ ida/vuelta

**Desde Valencia, Málaga, Sevilla:**
- Ryanair opera vuelos estacionales (mayo-octubre)

## Visa y documentación

Los ciudadanos españoles pueden entrar a Túnez **sin visa** con el DNI o pasaporte válido.
Estancia máxima: 90 días.

## Moneda y precios

La moneda oficial es el Dinar Tunecino (TND).
- 1€ ≈ 3,35 TND (junio 2026)
- Cambio en aeropuerto o bancos locales (evitar cambio en hoteles)
- Presupuesto medio: 50-80€/día por persona (hotel + comidas + actividades)

## Principales destinos

**Djerba** — La isla de los sueños, perfecta para familias
**Hammamet** — Playas largas, ideal para clubes de playa
**Susa (Sousse)** — Animada, buena vida nocturna
**Túnez capital** — Cultura, gastronomía, medina Patrimonio UNESCO
**Tozeur** — Desierto y oasis, experiencia única

## Seguridad

Túnez es considerado el destino más seguro del Magreb para turistas.
El Ministerio de Exteriores español (MAEC) califica Túnez como destino **verde** para viajeros.
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Viajar a Túnez desde España: todo lo que necesitas saber',
      description: 'Guía completa para viajar a Túnez desde España: vuelos, visado, hoteles y consejos',
      author: { '@type': 'Person', name: 'María López' },
      datePublished: '2025-12-28',
      publisher: { '@type': 'Organization', name: 'EasyHotels Maghreb' },
    },
  },
  {
    id: 'es-6',
    slug: 'mejores-hoteles-comunidad-marroqui-vacaciones',
    title: 'Los mejores hoteles para la comunidad marroquí en vacaciones',
    category: 'Diáspora',
    categoryColor: '#c0392b',
    keywords: ['hotel marruecos familias', 'vacaciones marruecos verano', 'hoteles marruecos verano'],
    excerpt: '¿Vuelves a Marruecos estas vacaciones? Nuestra selección de los mejores hoteles para la comunidad marroquí residente en España — confort, halal y precio justo.',
    date: '20 Diciembre 2025',
    readTime: '6 min',
    author: 'Youssef Amrani',
    gradient: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
    emoji: '🏡',
    tags: ['Marruecos', 'Diáspora', 'Verano'],
    content: `
Para los 800.000 marroquíes que viven en España, las vacaciones de verano en Marruecos son un momento
especial. EasyHotels entiende vuestras necesidades específicas.

## Lo que busca la comunidad marroquí en España

Cuando se viaja a Marruecos desde España, las prioridades son distintas:
- **Precio justo** — conocemos bien los precios locales
- **Halal garantizado** — alimentación conforme sin sorpresas
- **Cerca de la familia** — ubicaciones en ciudades como Casablanca, Agadir, Tánger, Fez
- **Traslado aeropuerto** — llegada tras un vuelo largo desde España

## Los mejores hoteles por ciudad

**Casablanca (Casa)**
- Hyatt Regency Casablanca: 1.800 MAD (≈167€)/noche — lujo, business
- Ibis Casablanca City Center: 520 MAD (≈48€)/noche — económico, bien ubicado
- Movenpick Hotel Casablanca: 1.200 MAD (≈112€)/noche — halal, confort

**Agadir (la preferida de verano)**
- Sofitel Agadir Royal Bay: 2.500 MAD (≈233€)/noche — playa privada, lujo
- Hotel Tildi: 780 MAD (≈72€)/noche — halal, piscina separada, familiar
- Riu Tikida Beach: 1.100 MAD (≈102€)/noche — todo incluido, playa

**Tánger — Ideal para llegar desde el ferry de España**
- Barceló Tanger: 950 MAD (≈88€)/noche — cerca del puerto
- El Minzah: 1.400 MAD (≈130€)/noche — histórico, lujo

**Fez (Fes) — Para quienes tienen familia en el norte**
- Riad Fes: 1.600 MAD (≈149€)/noche — lujo en la medina
- Hotel Menzeh Zalagh: 750 MAD (≈70€)/noche — vista panorámica

## Vuelos desde España a Marruecos

- Madrid → Casablanca: desde 49€ (Iberia, RAM, Air Arabia)
- Barcelona → Marrakech: desde 39€ (Ryanair, Vueling)
- Valencia → Agadir: desde 55€ (Ryanair)
- Almería → Casablanca: desde 45€ (Binter)

## Consejo EasyHotels

Reserva con **3-4 meses de antelación** para el verano. Julio-Agosto es temporada alta
y los precios se multiplican por 2 o 3. Con EasyHotels comparas en tiempo real
Booking.com, Expedia y la reserva directa — ahorra hasta un 40%.
    `,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Los mejores hoteles para la comunidad marroquí en vacaciones',
      description: 'Guía de hoteles en Marruecos para la diáspora marroquí residente en España',
      author: { '@type': 'Person', name: 'Youssef Amrani' },
      datePublished: '2025-12-20',
      publisher: { '@type': 'Organization', name: 'EasyHotels Maghreb' },
    },
  },
]

const CATEGORIES = ['Todos', 'Guía', 'Comparativa', 'Halal', 'Diáspora']

export default function BlogES() {
  const [active, setActive] = useState('Todos')
  const [selectedArticle, setSelectedArticle] = useState(null)

  const filtered = active === 'Todos' ? ARTICLES : ARTICLES.filter(a => a.category === active)

  if (selectedArticle) {
    return (
      <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8F9FA' }}>
        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(selectedArticle.jsonLd) }} />

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
          <button
            onClick={() => setSelectedArticle(null)}
            style={{ background: 'none', border: 'none', color: '#FF6B35', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 24 }}
          >
            ← Volver al blog
          </button>

          <div style={{ background: selectedArticle.gradient, borderRadius: 16, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, marginBottom: 32 }}>
            {selectedArticle.emoji}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {selectedArticle.tags.map(tag => (
              <span key={tag} style={{ fontSize: 12, background: '#EBF8FF', color: '#2c5282', padding: '3px 10px', borderRadius: 20 }}>#{tag}</span>
            ))}
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#2d3748', lineHeight: 1.3, marginBottom: 16 }}>
            {selectedArticle.title}
          </h1>

          <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#718096', marginBottom: 32 }}>
            <span>✍️ {selectedArticle.author}</span>
            <span>📅 {selectedArticle.date}</span>
            <span>⏱ {selectedArticle.readTime}</span>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', lineHeight: 1.8, color: '#4a5568', fontSize: 16 }}>
            {selectedArticle.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: 22, fontWeight: 800, color: '#2d3748', margin: '28px 0 12px' }}>{line.replace('## ', '')}</h2>
              if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} style={{ display: 'block', color: '#2d3748', marginTop: 16 }}>{line.replace(/\*\*/g, '')}</strong>
              if (line.startsWith('- ')) return <li key={i} style={{ marginLeft: 20, marginBottom: 6 }}>{line.replace('- ', '')}</li>
              if (line.trim() === '') return <br key={i} />
              return <p key={i} style={{ marginBottom: 12 }}>{line}</p>
            })}
          </div>

          {/* CTA */}
          <div style={{ marginTop: 40, background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
              ¿Listo para reservar tu hotel?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 20 }}>
              Compara precios en tiempo real y ahorra hasta un 60%
            </p>
            <Link
              to="/es/buscar"
              style={{ display: 'inline-block', background: '#FF6B35', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none' }}
            >
              🔍 Buscar hoteles →
            </Link>
          </div>

          {/* Related articles */}
          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 20 }}>Artículos relacionados</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {ARTICLES.filter(a => a.id !== selectedArticle.id).slice(0, 3).map(article => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ height: 80, background: article.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    {article.emoji}
                  </div>
                  <div style={{ padding: 14 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#2d3748', lineHeight: 1.4 }}>{article.title}</p>
                    <span style={{ fontSize: 12, color: '#FF6B35', fontWeight: 600, marginTop: 8, display: 'block' }}>Leer más →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#F8F9FA' }}>
      {/* SEO Header */}
      <div style={{ background: 'linear-gradient(135deg, #004E89 0%, #1a6eac 100%)', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
          Blog de Viajes — Norte de África
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
          Guías, consejos y las mejores ofertas para españoles que viajan al Magreb
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                padding: '8px 20px', borderRadius: 20, fontSize: 14, fontWeight: 600,
                background: active === cat ? '#FF6B35' : '#fff',
                color: active === cat ? '#fff' : '#4a5568',
                border: `1.5px solid ${active === cat ? '#FF6B35' : '#e2e8f0'}`,
                transition: 'all 0.2s', cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured article */}
        {active === 'Todos' && (
          <div
            onClick={() => setSelectedArticle(ARTICLES[0])}
            style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 40, cursor: 'pointer', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(0,0,0,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)' }}
          >
            <div style={{ background: ARTICLES[0].gradient, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
              {ARTICLES[0].emoji}
            </div>
            <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ display: 'inline-block', background: '#EBF4FF', color: '#004E89', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, marginBottom: 16, width: 'fit-content' }}>
                ⭐ Artículo destacado
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2d3748', lineHeight: 1.3, marginBottom: 12 }}>
                {ARTICLES[0].title}
              </h2>
              <p style={{ color: '#718096', lineHeight: 1.7, marginBottom: 20 }}>{ARTICLES[0].excerpt}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#a0aec0', marginBottom: 20 }}>
                <span>✍️ {ARTICLES[0].author}</span>
                <span>📅 {ARTICLES[0].date}</span>
                <span>⏱ {ARTICLES[0].readTime}</span>
              </div>
              <span style={{ color: '#FF6B35', fontWeight: 700, fontSize: 15 }}>Leer más →</span>
            </div>
          </div>
        )}

        {/* Articles grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28 }}>
          {(active === 'Todos' ? filtered.slice(1) : filtered).map(article => (
            <article
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              style={{
                background: '#fff', borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}
            >
              <div style={{ height: 180, background: article.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative' }}>
                {article.emoji}
                <span style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  {article.category}
                </span>
              </div>
              <div style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#2d3748', lineHeight: 1.4, marginBottom: 10 }}>
                  {article.title}
                </h3>
                <p style={{ color: '#718096', fontSize: 13, lineHeight: 1.7, flex: 1, marginBottom: 16 }}>
                  {article.excerpt}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {article.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, background: '#EBF8FF', color: '#2c5282', padding: '2px 8px', borderRadius: 6 }}>#{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#a0aec0' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span>{article.date}</span>
                    <span>⏱ {article.readTime}</span>
                  </div>
                  <span style={{ color: '#FF6B35', fontWeight: 600, fontSize: 13 }}>Leer →</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
