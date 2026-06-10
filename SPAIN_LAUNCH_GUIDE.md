# Guía de Lanzamiento — EasyHotels España

## Por qué España es el mercado ideal

1. **4 millones de turistas** viajan desde España a África del Norte cada año
2. **800,000 marroquíes** viven en España (mercado diáspora)
3. **CPC europeo x4** mayor que en el Magreb
4. **Stripe funciona perfectamente** — cobros en euros sin problemas
5. **Afiliados internacionales** aprueban empresas españolas en 24h

## Configuración Empresarial

- Crear SL (Sociedad Limitada) en España: ~400€ + 3000€ capital mínimo
- O: Autónomo inicial — empieza a facturar desde el día 1
- Dominio: easyhotels.es (disponible ?)
- Cuenta bancaria: N26, Revolut Business o banco español

## Registro Afiliados (prioridad ALTA)

1. **Booking.com**: affiliate.booking.com → aprobación en 24h para empresas EU
   - CPC: 1.50€ - 4.00€ por clic
   - AID en 24h para sitios web EU

2. **Expedia Group**: partners.expediagroup.com
   - CPC: 1.20€ - 3.00€
   - Proceso: 3-5 días

3. **Hotels.com**: via Commission Junction (CJ)
   - CPC: 1.00€ - 2.50€

4. **Airbnb Associates**: airbnb.es/associates
   - Comisión: 4-8% por reserva

## SEO España — Estrategia 90 días

### Mes 1: Base técnica
- [ ] Dominio .es registrado
- [ ] Google Search Console configurado
- [ ] Google Analytics 4 instalado (con GDPR consent)
- [ ] Sitemap.xml enviado a Google
- [ ] 6 artículos de blog publicados (`/es/blog`)
- [ ] Páginas legales activas (Privacidad, T&C, Cookies)
- [ ] GDPR banner funcionando

### Mes 2: Contenido y enlaces
- [ ] 12 artículos más (2 por semana)
- [ ] Directorios españoles de turismo
- [ ] Colaboración con bloggers viaje marroquíes en España
- [ ] Google My Business si hay oficina
- [ ] Links building: foros diáspora, grupos Facebook marroquíes en España

### Mes 3: Publicidad pagada
- [ ] Google Ads — keywords "hoteles marruecos", "hotel marrakech"
  Budget: 500€/mes → 200-400 clics/día estimado
- [ ] Facebook Ads → targeting comunidad marroquí España
  Budget: 300€/mes
- [ ] Instagram Ads → viajeros españoles 25-45 años interesados en viajes

## Proyección Financiera España

| Mes | Clics/día | CPC medio | Ingresos | Gastos | Beneficio |
|-----|-----------|-----------|----------|--------|-----------|
| 1   | 50        | 2.00€     | 3,000€   | 1,500€ | 1,500€    |
| 3   | 200       | 2.50€     | 15,000€  | 3,000€ | 12,000€   |
| 6   | 600       | 2.80€     | 50,400€  | 6,000€ | 44,400€   |
| 12  | 2,000     | 3.00€     | 180,000€ | 15,000€| 165,000€  |

*Proyecciones basadas en CPC promedio de afiliados de viajes en España (fuente: Awin, CJ Affiliate)*

## Dominios a registrar

- easyhotels.es
- comparadorhoteles-africa.es
- hoteles-marruecos.com
- hoteles-tunez.com
- hotel-halal-espana.com *(para el nicho halal)*

## Socios estratégicos España

- Asociaciones marroquíes en España (Madrid, Barcelona, Valencia, Málaga)
- Agencias de viajes especializadas Magreb (hay +200 en España)
- Influencers viaje hispano-marroquíes (Instagram, TikTok)
- Periódicos de la comunidad árabe en España (Attajdid ES, Al-Shorouk)
- Mezquitas y centros culturales islámicos (para nicho halal)

## Rutas implementadas

```
/es              → HomePageES.jsx     (página principal en español)
/es/buscar       → SearchResultsPageES.jsx  (búsqueda con precios en €)
/es/blog         → BlogES.jsx         (6 artículos SEO en español)
/privacidad      → LegalPages.jsx (PrivacyPolicy)
/terminos        → LegalPages.jsx (TermsOfService)
/politica-de-cookies → LegalPages.jsx (CookiePolicy)
```

## Componentes nuevos

- `CurrencyDisplay.jsx` — Muestra precios locales + equivalente en €
- `GDPRBanner.jsx` — Banner de cookies RGPD/LOPD compliant
- `i18n/es.js` — Traducciones completas en español

## Keywords prioritarias (ver /backend/src/config/seoKeywords.js)

| Keyword | Vol. búsquedas/mes | CPC est. |
|---------|-------------------|---------|
| hoteles marrakech | 22,000 | 3.20€ |
| hoteles marruecos | 18,000 | 2.50€ |
| sharm el sheikh hotel | 20,000 | 3.50€ |
| hoteles hurghada | 15,000 | 2.10€ |
| hoteles tunez | 12,000 | 2.30€ |
| hoteles casablanca | 9,000 | 1.90€ |
| hotel djerba | 8,000 | 2.80€ |
| hotel hammamet | 6,000 | 2.60€ |

## Checklist de lanzamiento

### Técnico
- [x] `/es` homepage en español
- [x] `/es/buscar` resultados de búsqueda con EUR
- [x] `/es/blog` blog SEO con 6 artículos
- [x] GDPR banner (RGPD + LOPD)
- [x] Páginas legales en español
- [x] Detección automática idioma español → redirect /es
- [x] CurrencyDisplay con equivalente en €
- [x] Keywords SEO en `/backend/src/config/seoKeywords.js`

### Negocio (pendiente)
- [ ] Constituir empresa (SL o autónomo)
- [ ] Registrar dominio easyhotels.es
- [ ] Cuenta Stripe en euros
- [ ] Solicitar afiliado Booking.com
- [ ] Solicitar afiliado Expedia
- [ ] Configurar Google Analytics 4
- [ ] Google Search Console
- [ ] Sitemap.xml para /es/*
