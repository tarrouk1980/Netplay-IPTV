'use strict';

// ─── FERRY COMPANIES ──────────────────────────────────────────────────────────
const FERRY_COMPANIES = {
  BALEARIA: { code: 'BALEARIA', name: 'Baleària', country: 'ES', color: '#003087', logo: '⚓' },
  FRS:      { code: 'FRS',      name: 'FRS Iberia',   country: 'ES', color: '#E30613', logo: '⛴' },
  TRASMED:  { code: 'TRASMED',  name: 'Trasmediterránea', country: 'ES', color: '#005BAC', logo: '🚢' },
  ACCIONA:  { code: 'ACCIONA',  name: 'Acciona Trasmediterránea', country: 'ES', color: '#00B451', logo: '🛳' },
  CTM:      { code: 'CTM',      name: 'CTN (Tunisie)', country: 'TN', color: '#C8102E', logo: '⛴' },
  SNCM:     { code: 'SNCM',     name: 'La Méridionale', country: 'FR', color: '#0055A4', logo: '🚢' },
  GNV:      { code: 'GNV',      name: 'GNV (Grandi Navi Veloci)', country: 'IT', color: '#003F87', logo: '🛳' },
  GRANDI:   { code: 'GRANDI',   name: 'Grimaldi Lines', country: 'IT', color: '#D4001A', logo: '⛴' },
  CMN_FERRY:{ code: 'CMN_FERRY',name: 'Comarit', country: 'MA', color: '#006233', logo: '🚢' },
  INTERSHIPPING: { code: 'INTERSHIPPING', name: 'Inter Shipping', country: 'MA', color: '#FF8000', logo: '⛴' },
  ALGERIE_FERRIES: { code: 'ALGERIE_FERRIES', name: 'Algérie Ferries', country: 'DZ', color: '#006B3F', logo: '🛳' },
};

// ─── PORTS ────────────────────────────────────────────────────────────────────
const PORTS = {
  // ── Espagne ──
  ALG_ES:  { code: 'ALG_ES',  name: 'Port Algésiras', city: 'Algésiras', country: 'Espagne', countryCode: 'ES', lat: 36.13, lng: -5.45 },
  TARIFA:  { code: 'TARIFA',  name: 'Port Tarifa',    city: 'Tarifa',    country: 'Espagne', countryCode: 'ES', lat: 36.01, lng: -5.60 },
  BCN_PORT:{ code: 'BCN_PORT',name: 'Port Barcelone', city: 'Barcelone', country: 'Espagne', countryCode: 'ES', lat: 41.37, lng: 2.18 },
  ALM_PORT:{ code: 'ALM_PORT',name: 'Port Almería',   city: 'Almería',   country: 'Espagne', countryCode: 'ES', lat: 36.84, lng: -2.46 },
  VLC_PORT:{ code: 'VLC_PORT',name: 'Port Valence',   city: 'Valence',   country: 'Espagne', countryCode: 'ES', lat: 39.45, lng: -0.32 },
  MOTRIL:  { code: 'MOTRIL',  name: 'Port Motril',    city: 'Motril',    country: 'Espagne', countryCode: 'ES', lat: 36.73, lng: -3.52 },
  // ── France ──
  MRS_PORT:{ code: 'MRS_PORT',name: 'Port Marseille', city: 'Marseille', country: 'France',  countryCode: 'FR', lat: 43.30, lng: 5.37 },
  SETE:    { code: 'SETE',    name: 'Port Sète',      city: 'Sète',      country: 'France',  countryCode: 'FR', lat: 43.40, lng: 3.70 },
  // ── Italie ──
  GEN_PORT:{ code: 'GEN_PORT',name: 'Port Gênes',     city: 'Gênes',     country: 'Italie',  countryCode: 'IT', lat: 44.41, lng: 8.93 },
  CIV_PORT:{ code: 'CIV_PORT',name: 'Port Civitavecchia', city: 'Civitavecchia', country: 'Italie', countryCode: 'IT', lat: 42.09, lng: 11.78 },
  PAL_PORT:{ code: 'PAL_PORT',name: 'Port Palerme',   city: 'Palerme',   country: 'Italie',  countryCode: 'IT', lat: 38.12, lng: 13.37 },
  // ── Maroc ──
  TNG_PORT:{ code: 'TNG_PORT',name: 'Port Tanger Med', city: 'Tanger',   country: 'Maroc',   countryCode: 'MA', lat: 35.88, lng: -5.50 },
  TNG_VILLE:{ code:'TNG_VILLE',name: 'Port Tanger Ville', city: 'Tanger',country: 'Maroc',   countryCode: 'MA', lat: 35.79, lng: -5.80 },
  CEUTA:   { code: 'CEUTA',   name: 'Port Ceuta',     city: 'Ceuta',     country: 'Maroc',   countryCode: 'MA', lat: 35.89, lng: -5.32 },
  NDR_PORT:{ code: 'NDR_PORT',name: 'Port Nador',     city: 'Nador',     country: 'Maroc',   countryCode: 'MA', lat: 35.17, lng: -2.93 },
  // ── Algérie ──
  ALG_PORT:{ code: 'ALG_PORT',name: 'Port Alger',     city: 'Alger',     country: 'Algérie', countryCode: 'DZ', lat: 36.78, lng: 3.06 },
  ORN_PORT:{ code: 'ORN_PORT',name: 'Port Oran',      city: 'Oran',      country: 'Algérie', countryCode: 'DZ', lat: 35.72, lng: -0.63 },
  BEJAIA:  { code: 'BEJAIA',  name: 'Port Béjaïa',    city: 'Béjaïa',    country: 'Algérie', countryCode: 'DZ', lat: 36.75, lng: 5.09 },
  SKIKDA:  { code: 'SKIKDA',  name: 'Port Skikda',    city: 'Skikda',    country: 'Algérie', countryCode: 'DZ', lat: 36.88, lng: 6.91 },
  ANNABA_P:{ code: 'ANNABA_P',name: 'Port Annaba',    city: 'Annaba',    country: 'Algérie', countryCode: 'DZ', lat: 36.90, lng: 7.77 },
  // ── Tunisie ──
  TUNIS_P: { code: 'TUNIS_P', name: 'Port La Goulette', city: 'Tunis',  country: 'Tunisie', countryCode: 'TN', lat: 36.82, lng: 10.30 },
  SFAX_P:  { code: 'SFAX_P',  name: 'Port Sfax',      city: 'Sfax',      country: 'Tunisie', countryCode: 'TN', lat: 34.74, lng: 10.76 },
};

// ─── BASE PRICES (EUR) ────────────────────────────────────────────────────────
// Per adult, passenger only (no vehicle). Round trip divide by ~1.9.
const BASE_PRICES_EUR = {
  // Espagne → Maroc (routes clés diaspora)
  'ALG_ES-TNG_PORT':  28,  // Algésiras-Tanger Med (rapide ~35min)
  'ALG_ES-TNG_VILLE': 32,  // Algésiras-Tanger Ville (classic)
  'ALG_ES-CEUTA':     18,  // Algésiras-Ceuta (navette ~35min)
  'TARIFA-TNG_VILLE': 38,  // Tarifa-Tanger Ville (35min)
  'BCN_PORT-TNG_PORT':125, // Barcelone-Tanger (20h)
  'BCN_PORT-NDR_PORT': 98, // Barcelone-Nador (20h, diaspora marocaine)
  'ALM_PORT-NDR_PORT': 55, // Almería-Nador (7h, très populaire)
  'ALM_PORT-TNG_PORT': 72, // Almería-Tanger (8h)
  'VLC_PORT-TNG_PORT':108, // Valence-Tanger (22h)
  'MOTRIL-TNG_PORT':   48, // Motril-Nador (6h)
  // Espagne → Algérie
  'ALM_PORT-ORN_PORT': 68, // Almería-Oran (8h, diaspora algérienne)
  'ALM_PORT-ALG_PORT': 82, // Almería-Alger (10h)
  // France → Algérie (routes très populaires)
  'MRS_PORT-ALG_PORT':112, // Marseille-Alger (22h)
  'MRS_PORT-ORN_PORT': 95, // Marseille-Oran (20h)
  'MRS_PORT-BEJAIA':   98, // Marseille-Béjaïa (22h)
  'MRS_PORT-ANNABA_P': 105,// Marseille-Annaba (23h)
  'SETE-ORN_PORT':     88, // Sète-Oran (19h)
  'SETE-NDR_PORT':     82, // Sète-Nador (17h, Opération Marhaba)
  'SETE-TNG_PORT':     78, // Sète-Tanger (17h)
  // France → Tunisie
  'MRS_PORT-TUNIS_P':  98, // Marseille-Tunis La Goulette (21h)
  'GEN_PORT-TUNIS_P':  88, // Gênes-Tunis (21h, CTN/GNV)
  'CIV_PORT-TUNIS_P':  82, // Civitavecchia-Tunis (22h)
  'PAL_PORT-TUNIS_P':  65, // Palerme-Tunis (11h)
};

// ─── ROUTE TEMPLATES ──────────────────────────────────────────────────────────
// durationMins: traversée complète
const FERRY_ROUTE_TEMPLATES = {
  // ── Algésiras ↔ Maroc ──
  'ALG_ES-TNG_PORT':  [
    { company: 'BALEARIA', routeNo: 'BA101', durationMins: 35,   amenities: ['cafétéria', 'lounge'] },
    { company: 'ACCIONA',  routeNo: 'AC101', durationMins: 35,   amenities: ['cafétéria'] },
    { company: 'FRS',      routeNo: 'FR101', durationMins: 60,   amenities: ['cafétéria', 'voitures'] },
  ],
  'ALG_ES-TNG_VILLE': [
    { company: 'BALEARIA', routeNo: 'BA111', durationMins: 90,   amenities: ['cafétéria', 'voitures', 'cabines'] },
    { company: 'CMN_FERRY',routeNo: 'CM111', durationMins: 105,  amenities: ['cafétéria', 'voitures'] },
  ],
  'ALG_ES-CEUTA': [
    { company: 'BALEARIA', routeNo: 'BA121', durationMins: 35,   amenities: ['cafétéria'] },
    { company: 'ACCIONA',  routeNo: 'AC121', durationMins: 35,   amenities: ['cafétéria'] },
  ],
  'TARIFA-TNG_VILLE': [
    { company: 'FRS',      routeNo: 'FR201', durationMins: 35,   amenities: ['cafétéria', 'voitures'] },
    { company: 'INTERSHIPPING', routeNo: 'IS201', durationMins: 60, amenities: ['cafétéria'] },
  ],
  // ── Barcelone ↔ Maroc ──
  'BCN_PORT-TNG_PORT': [
    { company: 'BALEARIA', routeNo: 'BA501', durationMins: 1200, amenities: ['restaurant', 'cabines', 'piscine', 'divertissement', 'voitures'] },
    { company: 'CMN_FERRY',routeNo: 'CM501', durationMins: 1230, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  'BCN_PORT-NDR_PORT': [
    { company: 'BALEARIA', routeNo: 'BA511', durationMins: 1200, amenities: ['restaurant', 'cabines', 'piscine', 'voitures'] },
    { company: 'INTERSHIPPING', routeNo: 'IS511', durationMins: 1260, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  // ── Almería ↔ Maroc/Algérie ──
  'ALM_PORT-NDR_PORT': [
    { company: 'BALEARIA', routeNo: 'BA601', durationMins: 420,  amenities: ['cafétéria', 'voitures', 'cabines'] },
    { company: 'TRASMED',  routeNo: 'TM601', durationMins: 480,  amenities: ['cafétéria', 'voitures'] },
  ],
  'ALM_PORT-TNG_PORT': [
    { company: 'BALEARIA', routeNo: 'BA611', durationMins: 480,  amenities: ['cafétéria', 'voitures', 'cabines'] },
  ],
  'ALM_PORT-ORN_PORT': [
    { company: 'ALGERIE_FERRIES', routeNo: 'AF701', durationMins: 480, amenities: ['restaurant', 'cabines', 'voitures'] },
    { company: 'TRASMED',         routeNo: 'TM701', durationMins: 500, amenities: ['cafétéria', 'voitures', 'cabines'] },
  ],
  // ── Valence ↔ Maroc ──
  'VLC_PORT-TNG_PORT': [
    { company: 'BALEARIA', routeNo: 'BA801', durationMins: 1320, amenities: ['restaurant', 'cabines', 'piscine', 'divertissement', 'voitures'] },
  ],
  // ── Marseille ↔ Algérie ──
  'MRS_PORT-ALG_PORT': [
    { company: 'ALGERIE_FERRIES', routeNo: 'AF1001', durationMins: 1320, amenities: ['restaurant', 'cabines', 'piscine', 'voitures'] },
    { company: 'SNCM',            routeNo: 'SN1001', durationMins: 1320, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  'MRS_PORT-ORN_PORT': [
    { company: 'ALGERIE_FERRIES', routeNo: 'AF1011', durationMins: 1200, amenities: ['restaurant', 'cabines', 'voitures'] },
    { company: 'SNCM',            routeNo: 'SN1011', durationMins: 1200, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  'MRS_PORT-BEJAIA': [
    { company: 'ALGERIE_FERRIES', routeNo: 'AF1021', durationMins: 1320, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  // ── Sète ↔ Maghreb ──
  'SETE-ORN_PORT': [
    { company: 'ALGERIE_FERRIES', routeNo: 'AF1101', durationMins: 1140, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  'SETE-NDR_PORT': [
    { company: 'CMN_FERRY',  routeNo: 'CM1101', durationMins: 1020, amenities: ['restaurant', 'cabines', 'piscine', 'voitures'] },
    { company: 'INTERSHIPPING', routeNo: 'IS1101', durationMins: 1080, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  // ── Marseille → Tunisie ──
  'MRS_PORT-TUNIS_P': [
    { company: 'CTM',  routeNo: 'CTM1201', durationMins: 1260, amenities: ['restaurant', 'cabines', 'piscine', 'divertissement', 'voitures'] },
    { company: 'GNV',  routeNo: 'GNV1201', durationMins: 1260, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  // ── Italie → Tunisie ──
  'GEN_PORT-TUNIS_P': [
    { company: 'GNV',    routeNo: 'GNV1301', durationMins: 1260, amenities: ['restaurant', 'cabines', 'piscine', 'voitures'] },
    { company: 'GRANDI', routeNo: 'GR1301',  durationMins: 1280, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  'CIV_PORT-TUNIS_P': [
    { company: 'GNV', routeNo: 'GNV1311', durationMins: 1320, amenities: ['restaurant', 'cabines', 'voitures'] },
  ],
  'PAL_PORT-TUNIS_P': [
    { company: 'GNV',    routeNo: 'GNV1321', durationMins: 660, amenities: ['restaurant', 'cabines', 'voitures'] },
    { company: 'GRANDI', routeNo: 'GR1321',  durationMins: 700, amenities: ['cafétéria', 'voitures'] },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function addMinutes(date, mins) { return new Date(date.getTime() + mins * 60000); }
function formatTime(d) { return d.toTimeString().slice(0, 5); }
function formatDate(d) { return d.toISOString().slice(0, 10); }
function minutesToDuration(m) {
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min > 0 ? `${h}h${String(min).padStart(2, '0')}` : `${h}h`;
}

function getRouteKey(origin, dest) {
  const k1 = `${origin}-${dest}`;
  const k2 = `${dest}-${origin}`;
  if (FERRY_ROUTE_TEMPLATES[k1]) return k1;
  if (FERRY_ROUTE_TEMPLATES[k2]) return k2;
  return null;
}

// ─── FERRY GENERATOR ──────────────────────────────────────────────────────────
function generateFerriesForDate(origin, dest, dateStr, passengers = 1) {
  const routeKey = getRouteKey(origin, dest);
  const reversed = routeKey && routeKey.startsWith(dest);
  const templates = routeKey ? FERRY_ROUTE_TEMPLATES[routeKey] : [];
  if (!templates.length) return [];

  const baseDate = new Date(`${dateStr}T00:00:00`);
  const baseEUR = BASE_PRICES_EUR[routeKey] || BASE_PRICES_EUR[`${dest}-${origin}`] || 80;

  // Short crossings depart multiple times/day; long crossings once/day or less
  const isShortCrossing = templates[0].durationMins < 240;
  const departureSlots = isShortCrossing
    ? [7, 9, 11, 13, 15, 17, 19, 21]
    : [8, 20]; // morning + night for overnight ferries

  const ferries = [];
  let slotIdx = 0;

  for (const tpl of templates) {
    const departures = isShortCrossing ? randomInRange(2, 4) : randomInRange(1, 2);
    for (let d = 0; d < departures && slotIdx < departureSlots.length; d++, slotIdx++) {
      const deptMins = departureSlots[slotIdx] * 60 + randomInRange(0, 45);
      const deptTime = addMinutes(baseDate, deptMins);
      const arrTime = addMinutes(deptTime, tpl.durationMins);

      const variation = 1 + (Math.random() * 0.3 - 0.15);
      const pricePerPaxEUR = Math.round(baseEUR * variation * 10) / 10;
      const totalEUR = Math.round(pricePerPaxEUR * passengers * 10) / 10;

      // Vehicle price (car ~same as pax ticket)
      const carPriceEUR = Math.round(baseEUR * 0.8 * variation * 10) / 10;

      const routeNo = reversed
        ? tpl.routeNo.replace(/(\d+)$/, (m) => String(parseInt(m, 10) + 1))
        : tpl.routeNo;

      ferries.push({
        id: `FERRY-${routeNo}-${dateStr}-${deptMins}`,
        type: 'FERRY',
        routeNumber: routeNo,
        company: FERRY_COMPANIES[tpl.company] || { code: tpl.company, name: tpl.company },
        origin: PORTS[origin] || { code: origin, city: origin, country: '' },
        destination: PORTS[dest] || { code: dest, city: dest, country: '' },
        departure: {
          date: formatDate(deptTime),
          time: formatTime(deptTime),
          datetime: deptTime.toISOString(),
        },
        arrival: {
          date: formatDate(arrTime),
          time: formatTime(arrTime),
          datetime: arrTime.toISOString(),
        },
        duration: minutesToDuration(tpl.durationMins),
        durationMins: tpl.durationMins,
        isOvernight: tpl.durationMins >= 360,
        amenities: tpl.amenities || [],
        price: {
          passenger: pricePerPaxEUR,
          perPax: pricePerPaxEUR,
          total: totalEUR,
          car: carPriceEUR,
          currency: 'EUR',
        },
        seats: { available: randomInRange(10, 200), total: 500 },
        vehicleSpaces: { available: randomInRange(5, 80), total: 200 },
        affiliateUrl: buildFerryAffiliateUrl(origin, dest, dateStr, tpl.company),
      });
    }
  }

  return ferries.sort((a, b) => a.price.total - b.price.total);
}

function buildFerryAffiliateUrl(origin, dest, date, companyCode) {
  const sites = {
    BALEARIA: 'balearia.com',
    FRS: 'frs.es',
    TRASMED: 'trasmediterranea.es',
    ACCIONA: 'trasmediterranea.es',
    CTM: 'ctn.com.tn',
    SNCM: 'lameridionale.fr',
    GNV: 'gnv.it',
    GRANDI: 'grimaldi-lines.com',
    CMN_FERRY: 'comarit.ma',
    INTERSHIPPING: 'intershipping.es',
    ALGERIE_FERRIES: 'algerieferries.dz',
  };
  const site = sites[companyCode] || 'easytravel.app/ferries';
  return `https://${site}/?from=${origin}&to=${dest}&dep=${date}&utm_source=easytravel&utm_medium=cpc`;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
function searchFerries({ originPort, destPort, date, passengers = 1 }) {
  return generateFerriesForDate(originPort, destPort, date, passengers);
}

function getPorts(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return Object.values(PORTS).slice(0, 30);
  return Object.values(PORTS).filter(
    (p) => p.code.toLowerCase().includes(q)
      || p.city.toLowerCase().includes(q)
      || p.name.toLowerCase().includes(q)
      || p.country.toLowerCase().includes(q),
  );
}

function getPortsByCountry(countryCode) {
  return Object.values(PORTS).filter((p) => p.countryCode === countryCode);
}

function getPopularFerryRoutes() {
  return [
    { origin: 'ALG_ES', dest: 'TNG_PORT',  label: 'Algésiras → Tanger Med', durationLabel: '35 min', priceFrom: 28  },
    { origin: 'TARIFA',  dest: 'TNG_VILLE', label: 'Tarifa → Tanger Ville',  durationLabel: '35 min', priceFrom: 38  },
    { origin: 'ALM_PORT',dest: 'NDR_PORT',  label: 'Almería → Nador',        durationLabel: '7h',     priceFrom: 55  },
    { origin: 'ALM_PORT',dest: 'ORN_PORT',  label: 'Almería → Oran',         durationLabel: '8h',     priceFrom: 68  },
    { origin: 'BCN_PORT',dest: 'TNG_PORT',  label: 'Barcelone → Tanger',     durationLabel: '20h',    priceFrom: 125 },
    { origin: 'BCN_PORT',dest: 'NDR_PORT',  label: 'Barcelone → Nador',      durationLabel: '20h',    priceFrom: 98  },
    { origin: 'MRS_PORT',dest: 'ALG_PORT',  label: 'Marseille → Alger',      durationLabel: '22h',    priceFrom: 112 },
    { origin: 'MRS_PORT',dest: 'TUNIS_P',   label: 'Marseille → Tunis',      durationLabel: '21h',    priceFrom: 98  },
    { origin: 'GEN_PORT',dest: 'TUNIS_P',   label: 'Gênes → Tunis',          durationLabel: '21h',    priceFrom: 88  },
    { origin: 'SETE',    dest: 'NDR_PORT',  label: 'Sète → Nador',           durationLabel: '17h',    priceFrom: 82  },
  ];
}

module.exports = {
  searchFerries, getPorts, getPortsByCountry, getPopularFerryRoutes,
  PORTS, FERRY_COMPANIES,
};
