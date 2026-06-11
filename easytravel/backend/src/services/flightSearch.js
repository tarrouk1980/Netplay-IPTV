'use strict';

// ─── COUNTRIES ────────────────────────────────────────────────────────────────
const COUNTRIES = {
  ES: { code: 'ES', name: 'Espagne',         flag: '🇪🇸', currency: 'EUR', rateFromUSD: 0.92 },
  MA: { code: 'MA', name: 'Maroc',           flag: '🇲🇦', currency: 'EUR', rateFromUSD: 0.92 },
  DZ: { code: 'DZ', name: 'Algérie',        flag: '🇩🇿', currency: 'EUR', rateFromUSD: 0.92 },
  TN: { code: 'TN', name: 'Tunisie',         flag: '🇹🇳', currency: 'EUR', rateFromUSD: 0.92 },
  LY: { code: 'LY', name: 'Libye',           flag: '🇱🇾', currency: 'EUR', rateFromUSD: 0.92 },
  MR: { code: 'MR', name: 'Mauritanie',      flag: '🇲🇷', currency: 'EUR', rateFromUSD: 0.92 },
  EG: { code: 'EG', name: 'Égypte',         flag: '🇪🇬', currency: 'EUR', rateFromUSD: 0.92 },
  FR: { code: 'FR', name: 'France',          flag: '🇫🇷', currency: 'EUR', rateFromUSD: 0.92 },
  DE: { code: 'DE', name: 'Allemagne',       flag: '🇩🇪', currency: 'EUR', rateFromUSD: 0.92 },
  IT: { code: 'IT', name: 'Italie',          flag: '🇮🇹', currency: 'EUR', rateFromUSD: 0.92 },
  GB: { code: 'GB', name: 'Royaume-Uni',     flag: '🇬🇧', currency: 'EUR', rateFromUSD: 0.92 },
  NL: { code: 'NL', name: 'Pays-Bas',        flag: '🇳🇱', currency: 'EUR', rateFromUSD: 0.92 },
  BE: { code: 'BE', name: 'Belgique',        flag: '🇧🇪', currency: 'EUR', rateFromUSD: 0.92 },
  PT: { code: 'PT', name: 'Portugal',        flag: '🇵🇹', currency: 'EUR', rateFromUSD: 0.92 },
  TR: { code: 'TR', name: 'Turquie',         flag: '🇹🇷', currency: 'EUR', rateFromUSD: 0.92 },
  AE: { code: 'AE', name: 'EAU',             flag: '🇦🇪', currency: 'EUR', rateFromUSD: 0.92 },
};

// ─── AIRPORTS ─────────────────────────────────────────────────────────────────
const AIRPORTS = {
  // ── Espagne (marché principal) ──
  MAD: { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid',    country: 'Espagne', countryCode: 'ES' },
  BCN: { code: 'BCN', name: 'Josep Tarradellas El Prat',    city: 'Barcelone', country: 'Espagne', countryCode: 'ES' },
  VLC: { code: 'VLC', name: 'Manises',                      city: 'Valence',   country: 'Espagne', countryCode: 'ES' },
  AGP: { code: 'AGP', name: 'Costa del Sol',                city: 'Málaga',    country: 'Espagne', countryCode: 'ES' },
  SVQ: { code: 'SVQ', name: 'San Pablo',                    city: 'Séville',   country: 'Espagne', countryCode: 'ES' },
  PMI: { code: 'PMI', name: 'Son Sant Joan',                city: 'Palma',     country: 'Espagne', countryCode: 'ES' },
  BIO: { code: 'BIO', name: 'Loiu',                         city: 'Bilbao',    country: 'Espagne', countryCode: 'ES' },
  ZAZ: { code: 'ZAZ', name: 'Zaragoza',                     city: 'Saragosse', country: 'Espagne', countryCode: 'ES' },
  ACE: { code: 'ACE', name: 'César Manrique-Lanzarote',     city: 'Lanzarote', country: 'Espagne', countryCode: 'ES' },
  TFN: { code: 'TFN', name: 'Tenerife Norte',               city: 'Tenerife',  country: 'Espagne', countryCode: 'ES' },
  // ── Maroc ──
  CMN: { code: 'CMN', name: 'Mohammed V',         city: 'Casablanca', country: 'Maroc', countryCode: 'MA' },
  RAK: { code: 'RAK', name: 'Menara',             city: 'Marrakech',  country: 'Maroc', countryCode: 'MA' },
  TNG: { code: 'TNG', name: 'Ibn Batouta',        city: 'Tanger',     country: 'Maroc', countryCode: 'MA' },
  AGA: { code: 'AGA', name: 'Al Massira',         city: 'Agadir',     country: 'Maroc', countryCode: 'MA' },
  FEZ: { code: 'FEZ', name: 'Saïss',             city: 'Fès',        country: 'Maroc', countryCode: 'MA' },
  OUD: { code: 'OUD', name: 'Angads',             city: 'Oujda',      country: 'Maroc', countryCode: 'MA' },
  NDR: { code: 'NDR', name: 'El Aroui',           city: 'Nador',      country: 'Maroc', countryCode: 'MA' },
  RBA: { code: 'RBA', name: 'Rabat-Salé',         city: 'Rabat',      country: 'Maroc', countryCode: 'MA' },
  // ── Algérie ──
  ALG: { code: 'ALG', name: 'Houari Boumediene',  city: 'Alger',      country: 'Algérie', countryCode: 'DZ' },
  ORN: { code: 'ORN', name: 'Ahmed Ben Bella',    city: 'Oran',       country: 'Algérie', countryCode: 'DZ' },
  CZL: { code: 'CZL', name: 'Mohamed Boudiaf',   city: 'Constantine',country: 'Algérie', countryCode: 'DZ' },
  AAE: { code: 'AAE', name: 'Rabah Bitat',        city: 'Annaba',     country: 'Algérie', countryCode: 'DZ' },
  TLM: { code: 'TLM', name: 'Zenata',             city: 'Tlemcen',    country: 'Algérie', countryCode: 'DZ' },
  // ── Tunisie ──
  TUN: { code: 'TUN', name: 'Tunis-Carthage',     city: 'Tunis',      country: 'Tunisie', countryCode: 'TN' },
  DJE: { code: 'DJE', name: 'Djerba-Zarzis',     city: 'Djerba',     country: 'Tunisie', countryCode: 'TN' },
  MIR: { code: 'MIR', name: 'Monastir',           city: 'Monastir',   country: 'Tunisie', countryCode: 'TN' },
  SFA: { code: 'SFA', name: 'Sfax-Thyna',         city: 'Sfax',       country: 'Tunisie', countryCode: 'TN' },
  // ── Libye ──
  TIP: { code: 'TIP', name: 'Tripoli Mitiga',     city: 'Tripoli',    country: 'Libye',   countryCode: 'LY' },
  // ── Égypte ──
  CAI: { code: 'CAI', name: 'Le Caire',           city: 'Le Caire',   country: 'Égypte',  countryCode: 'EG' },
  HRG: { code: 'HRG', name: 'Hurghada',           city: 'Hurghada',   country: 'Égypte',  countryCode: 'EG' },
  // ── France ──
  CDG: { code: 'CDG', name: 'Paris CDG',          city: 'Paris',      country: 'France',  countryCode: 'FR' },
  ORY: { code: 'ORY', name: 'Paris Orly',         city: 'Paris',      country: 'France',  countryCode: 'FR' },
  LYS: { code: 'LYS', name: 'Lyon',               city: 'Lyon',       country: 'France',  countryCode: 'FR' },
  MRS: { code: 'MRS', name: 'Marseille',          city: 'Marseille',  country: 'France',  countryCode: 'FR' },
  // ── Autres Europe ──
  FRA: { code: 'FRA', name: 'Francfort',          city: 'Francfort',  country: 'Allemagne', countryCode: 'DE' },
  FCO: { code: 'FCO', name: 'Rome Fiumicino',     city: 'Rome',       country: 'Italie',  countryCode: 'IT' },
  LHR: { code: 'LHR', name: 'Londres Heathrow',  city: 'Londres',    country: 'Royaume-Uni', countryCode: 'GB' },
  AMS: { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam',  country: 'Pays-Bas', countryCode: 'NL' },
  LIS: { code: 'LIS', name: 'Lisbonne',           city: 'Lisbonne',   country: 'Portugal', countryCode: 'PT' },
  IST: { code: 'IST', name: 'Istanbul',           city: 'Istanbul',   country: 'Turquie', countryCode: 'TR' },
  DXB: { code: 'DXB', name: 'Dubaï',             city: 'Dubaï',      country: 'EAU',     countryCode: 'AE' },
  BRU: { code: 'BRU', name: 'Bruxelles',          city: 'Bruxelles',  country: 'Belgique', countryCode: 'BE' },
};

// ─── AIRLINES ─────────────────────────────────────────────────────────────────
// Focus on Travelpayouts-affiliated carriers = real affiliate revenue
const AIRLINES = {
  // Espagne — très rentables via Travelpayouts
  VY: { code: 'VY', name: 'Vueling',        country: 'ES', color: '#F7B731', affiliate: 'travelpayouts' },
  IB: { code: 'IB', name: 'Iberia',         country: 'ES', color: '#C00B1D', affiliate: 'travelpayouts' },
  FR: { code: 'FR', name: 'Ryanair',        country: 'IE', color: '#073590', affiliate: 'travelpayouts' },
  I2: { code: 'I2', name: 'Iberia Express', country: 'ES', color: '#D01030', affiliate: 'travelpayouts' },
  UX: { code: 'UX', name: 'Air Europa',     country: 'ES', color: '#003087', affiliate: 'travelpayouts' },
  // Maghreb
  AT: { code: 'AT', name: 'Royal Air Maroc',country: 'MA', color: '#006233', affiliate: 'direct' },
  '3O':{ code: '3O', name: 'Air Arabia Maroc', country: 'MA', color: '#EE1C25', affiliate: 'travelpayouts' },
  TO: { code: 'TO', name: 'Transavia',      country: 'MA', color: '#00B2D4', affiliate: 'travelpayouts' },
  AH: { code: 'AH', name: 'Air Algérie',   country: 'DZ', color: '#006B3F', affiliate: 'direct' },
  TU: { code: 'TU', name: 'Tunisair',       country: 'TN', color: '#C8102E', affiliate: 'direct' },
  BJ: { code: 'BJ', name: 'Nouvelair',      country: 'TN', color: '#FF6B00', affiliate: 'direct' },
  // Europe généralistes
  AF: { code: 'AF', name: 'Air France',     country: 'FR', color: '#002395', affiliate: 'travelpayouts' },
  LH: { code: 'LH', name: 'Lufthansa',      country: 'DE', color: '#05164D', affiliate: 'travelpayouts' },
  U2: { code: 'U2', name: 'easyJet',        country: 'GB', color: '#FF6600', affiliate: 'travelpayouts' },
  TK: { code: 'TK', name: 'Turkish Airlines', country: 'TR', color: '#C8102E', affiliate: 'travelpayouts' },
  EK: { code: 'EK', name: 'Emirates',       country: 'AE', color: '#C8102E', affiliate: 'travelpayouts' },
  TP: { code: 'TP', name: 'TAP Air Portugal', country: 'PT', color: '#C8102E', affiliate: 'travelpayouts' },
  KL: { code: 'KL', name: 'KLM',            country: 'NL', color: '#00A1DE', affiliate: 'travelpayouts' },
};

// ─── PRICES (EUR) ─────────────────────────────────────────────────────────────
// One-way adult economy. Focus Spain ↔ Maghreb = diaspora traffic.
const BASE_PRICES_EUR = {
  // ── Espagne → Maroc (routes high-traffic diaspora) ──
  'MAD-CMN': 52,  'MAD-RAK': 45,  'MAD-TNG': 38,  'MAD-AGA': 58,  'MAD-FEZ': 48,
  'MAD-OUD': 62,  'MAD-NDR': 55,  'MAD-RBA': 54,
  'BCN-CMN': 62,  'BCN-RAK': 55,  'BCN-TNG': 42,  'BCN-AGA': 65,  'BCN-FEZ': 52,
  'BCN-OUD': 68,  'BCN-NDR': 48,
  'VLC-CMN': 68,  'VLC-RAK': 72,  'VLC-TNG': 58,  'VLC-AGA': 78,
  'AGP-CMN': 55,  'AGP-RAK': 48,  'AGP-TNG': 42,
  'SVQ-CMN': 58,  'SVQ-TNG': 45,  'SVQ-RAK': 52,
  'PMI-CMN': 72,  'BIO-CMN': 75,  'ZAZ-CMN': 65,
  // ── Espagne → Algérie ──
  'MAD-ALG': 68,  'MAD-ORN': 65,  'MAD-CZL': 72,  'MAD-TLM': 58,
  'BCN-ALG': 72,  'BCN-ORN': 68,  'BCN-TLM': 62,  'BCN-CZL': 75,
  'VLC-ALG': 78,  'VLC-ORN': 74,
  'AGP-ALG': 72,  'SVQ-ALG': 75,
  // ── Espagne → Tunisie ──
  'MAD-TUN': 75,  'MAD-DJE': 82,  'MAD-MIR': 78,
  'BCN-TUN': 68,  'BCN-DJE': 74,  'BCN-MIR': 72,
  'VLC-TUN': 80,  'AGP-TUN': 85,
  // ── France → Maghreb ──
  'CDG-CMN': 95,  'CDG-ALG': 88,  'CDG-TUN': 92,  'CDG-RAK': 98,
  'ORY-CMN': 88,  'ORY-ALG': 82,  'ORY-TUN': 85,
  'LYS-ALG': 78,  'LYS-CMN': 82,  'LYS-TUN': 80,
  'MRS-ALG': 72,  'MRS-CMN': 75,  'MRS-TUN': 70,
  // ── Autres Europe → Maghreb ──
  'FRA-CMN': 110, 'FRA-ALG': 105, 'FRA-TUN': 108, 'FRA-CAI': 135,
  'LHR-CMN': 115, 'LHR-TUN': 118, 'LHR-CAI': 125,
  'AMS-CMN': 108, 'AMS-ALG': 105, 'AMS-TUN': 110,
  'IST-CMN': 95,  'IST-ALG': 88,  'IST-TUN': 85,  'IST-CAI': 72,
  'DXB-CAI': 95,  'DXB-CMN': 158,
  'LIS-CMN': 65,  'LIS-TUN': 78,
  'FCO-TUN': 62,  'FCO-CMN': 88,  'FCO-TIP': 95,
  'BRU-CMN': 98,  'BRU-ALG': 95,  'BRU-TUN': 98,
  // ── Inter-Maghreb ──
  'CMN-ALG': 72,  'CMN-TUN': 88,  'ALG-TUN': 68,
  'CAI-TUN': 95,  'CAI-CMN': 105,
};

// ─── ROUTE TEMPLATES ─────────────────────────────────────────────────────────
// Focus on routes with affiliate-eligible carriers
const ROUTE_TEMPLATES = {
  // ── Madrid → Maroc ──
  'MAD-CMN': [
    { airline: 'IB',  baseFlightNo: 'IB3604', durationMins: 145, stops: 0 },
    { airline: 'AT',  baseFlightNo: 'AT527',  durationMins: 148, stops: 0 },
    { airline: 'VY',  baseFlightNo: 'VY8402', durationMins: 155, stops: 0 },
  ],
  'MAD-RAK': [
    { airline: 'VY',  baseFlightNo: 'VY8410', durationMins: 148, stops: 0 },
    { airline: 'IB',  baseFlightNo: 'IB3610', durationMins: 150, stops: 0 },
    { airline: 'AT',  baseFlightNo: 'AT533',  durationMins: 152, stops: 0 },
  ],
  'MAD-TNG': [
    { airline: 'IB',  baseFlightNo: 'IB3720', durationMins: 130, stops: 0 },
    { airline: 'AT',  baseFlightNo: 'AT723',  durationMins: 132, stops: 0 },
    { airline: 'VY',  baseFlightNo: 'VY8420', durationMins: 138, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7701', durationMins: 140, stops: 0 },
  ],
  'MAD-AGA': [
    { airline: 'VY',  baseFlightNo: 'VY8430', durationMins: 158, stops: 0 },
    { airline: 'AT',  baseFlightNo: 'AT651',  durationMins: 162, stops: 0 },
  ],
  'MAD-FEZ': [
    { airline: 'VY',  baseFlightNo: 'VY8440', durationMins: 140, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7710', durationMins: 142, stops: 0 },
    { airline: 'AT',  baseFlightNo: 'AT701',  durationMins: 145, stops: 0 },
  ],
  'MAD-NDR': [
    { airline: 'VY',  baseFlightNo: 'VY8450', durationMins: 145, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7720', durationMins: 148, stops: 0 },
  ],
  // ── Madrid → Algérie ──
  'MAD-ALG': [
    { airline: 'IB',  baseFlightNo: 'IB3800', durationMins: 160, stops: 0 },
    { airline: 'VY',  baseFlightNo: 'VY8501', durationMins: 162, stops: 0 },
    { airline: 'AH',  baseFlightNo: 'AH1056', durationMins: 165, stops: 0 },
  ],
  'MAD-ORN': [
    { airline: 'VY',  baseFlightNo: 'VY8510', durationMins: 158, stops: 0 },
    { airline: 'AH',  baseFlightNo: 'AH1110', durationMins: 160, stops: 0 },
  ],
  'MAD-TLM': [
    { airline: 'AH',  baseFlightNo: 'AH1228', durationMins: 140, stops: 0 },
    { airline: 'VY',  baseFlightNo: 'VY8520', durationMins: 142, stops: 0 },
  ],
  // ── Madrid → Tunisie ──
  'MAD-TUN': [
    { airline: 'VY',  baseFlightNo: 'VY8601', durationMins: 178, stops: 0 },
    { airline: 'IB',  baseFlightNo: 'IB3290', durationMins: 182, stops: 0 },
    { airline: 'TU',  baseFlightNo: 'TU779',  durationMins: 188, stops: 0 },
  ],
  'MAD-DJE': [
    { airline: 'VY',  baseFlightNo: 'VY8610', durationMins: 185, stops: 0 },
    { airline: 'BJ',  baseFlightNo: 'BJ572',  durationMins: 190, stops: 0 },
  ],
  // ── Barcelone → Maroc ──
  'BCN-CMN': [
    { airline: 'VY',  baseFlightNo: 'VY9202', durationMins: 155, stops: 0 },
    { airline: 'AT',  baseFlightNo: 'AT515',  durationMins: 158, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7801', durationMins: 162, stops: 0 },
  ],
  'BCN-RAK': [
    { airline: 'VY',  baseFlightNo: 'VY9305', durationMins: 165, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7810', durationMins: 168, stops: 0 },
  ],
  'BCN-TNG': [
    { airline: 'VY',  baseFlightNo: 'VY9602', durationMins: 148, stops: 0 },
    { airline: 'AT',  baseFlightNo: 'AT721',  durationMins: 150, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7820', durationMins: 155, stops: 0 },
  ],
  'BCN-FEZ': [
    { airline: 'VY',  baseFlightNo: 'VY9505', durationMins: 155, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7830', durationMins: 158, stops: 0 },
  ],
  'BCN-NDR': [
    { airline: 'VY',  baseFlightNo: 'VY9705', durationMins: 152, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7840', durationMins: 155, stops: 0 },
  ],
  // ── Barcelone → Algérie ──
  'BCN-ALG': [
    { airline: 'VY',  baseFlightNo: 'VY8952', durationMins: 162, stops: 0 },
    { airline: 'AH',  baseFlightNo: 'AH1052', durationMins: 165, stops: 0 },
  ],
  'BCN-ORN': [
    { airline: 'VY',  baseFlightNo: 'VY9005', durationMins: 155, stops: 0 },
    { airline: 'AH',  baseFlightNo: 'AH1112', durationMins: 158, stops: 0 },
  ],
  'BCN-TLM': [
    { airline: 'AH',  baseFlightNo: 'AH1230', durationMins: 145, stops: 0 },
  ],
  // ── Barcelone → Tunisie ──
  'BCN-TUN': [
    { airline: 'VY',  baseFlightNo: 'VY8815', durationMins: 165, stops: 0 },
    { airline: 'TU',  baseFlightNo: 'TU775',  durationMins: 168, stops: 0 },
  ],
  'BCN-DJE': [
    { airline: 'VY',  baseFlightNo: 'VY8820', durationMins: 175, stops: 0 },
    { airline: 'BJ',  baseFlightNo: 'BJ560',  durationMins: 178, stops: 0 },
  ],
  // ── Valence → Maghreb ──
  'VLC-CMN': [
    { airline: 'VY',  baseFlightNo: 'VY9208', durationMins: 162, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7901', durationMins: 165, stops: 0 },
  ],
  'VLC-ALG': [
    { airline: 'VY',  baseFlightNo: 'VY8958', durationMins: 168, stops: 0 },
    { airline: 'AH',  baseFlightNo: 'AH1058', durationMins: 172, stops: 0 },
  ],
  'VLC-TUN': [
    { airline: 'VY',  baseFlightNo: 'VY8818', durationMins: 172, stops: 0 },
  ],
  // ── Málaga → Maghreb ──
  'AGP-CMN': [
    { airline: 'VY',  baseFlightNo: 'VY8404', durationMins: 138, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7930', durationMins: 140, stops: 0 },
    { airline: 'AT',  baseFlightNo: 'AT519',  durationMins: 142, stops: 0 },
  ],
  'AGP-TNG': [
    { airline: 'VY',  baseFlightNo: 'VY9605', durationMins: 115, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7935', durationMins: 118, stops: 0 },
  ],
  'AGP-ALG': [
    { airline: 'VY',  baseFlightNo: 'VY8505', durationMins: 148, stops: 0 },
  ],
  // ── Séville → Maghreb ──
  'SVQ-CMN': [
    { airline: 'VY',  baseFlightNo: 'VY8406', durationMins: 142, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR7940', durationMins: 145, stops: 0 },
  ],
  'SVQ-TNG': [
    { airline: 'VY',  baseFlightNo: 'VY9608', durationMins: 125, stops: 0 },
  ],
  // ── France → Maghreb ──
  'CDG-CMN': [
    { airline: 'AT',  baseFlightNo: 'AT501',  durationMins: 185, stops: 0 },
    { airline: 'AF',  baseFlightNo: 'AF1541', durationMins: 185, stops: 0 },
    { airline: 'TO',  baseFlightNo: 'TO3501', durationMins: 195, stops: 0 },
    { airline: 'FR',  baseFlightNo: 'FR8001', durationMins: 198, stops: 0 },
  ],
  'CDG-ALG': [
    { airline: 'AH',  baseFlightNo: 'AH1001', durationMins: 185, stops: 0 },
    { airline: 'AF',  baseFlightNo: 'AF1385', durationMins: 185, stops: 0 },
  ],
  'CDG-TUN': [
    { airline: 'TU',  baseFlightNo: 'TU707',  durationMins: 175, stops: 0 },
    { airline: 'AF',  baseFlightNo: 'AF1285', durationMins: 175, stops: 0 },
  ],
  'ORY-CMN': [
    { airline: 'AT',  baseFlightNo: 'AT503',  durationMins: 185, stops: 0 },
    { airline: 'TO',  baseFlightNo: 'TO3503', durationMins: 195, stops: 0 },
  ],
  'ORY-ALG': [
    { airline: 'AH',  baseFlightNo: 'AH1011', durationMins: 185, stops: 0 },
  ],
  'MRS-ALG': [
    { airline: 'AH',  baseFlightNo: 'AH1031', durationMins: 160, stops: 0 },
    { airline: 'VY',  baseFlightNo: 'VY8902', durationMins: 165, stops: 0 },
  ],
  'MRS-CMN': [
    { airline: 'AT',  baseFlightNo: 'AT507',  durationMins: 158, stops: 0 },
    { airline: 'VY',  baseFlightNo: 'VY8904', durationMins: 162, stops: 0 },
  ],
  // ── Autres Europe → Maghreb ──
  'FRA-CMN': [{ airline: 'LH', baseFlightNo: 'LH1601', durationMins: 215, stops: 0 }],
  'FRA-ALG': [{ airline: 'LH', baseFlightNo: 'LH1505', durationMins: 210, stops: 0 }, { airline: 'AH', baseFlightNo: 'AH1041', durationMins: 215, stops: 0 }],
  'FRA-TUN': [{ airline: 'LH', baseFlightNo: 'LH1425', durationMins: 205, stops: 0 }],
  'LHR-CMN': [{ airline: 'AT', baseFlightNo: 'AT523',  durationMins: 248, stops: 0 }],
  'AMS-CMN': [{ airline: 'KL', baseFlightNo: 'KL1801', durationMins: 225, stops: 0 }, { airline: 'AT', baseFlightNo: 'AT521', durationMins: 225, stops: 0 }],
  'AMS-ALG': [{ airline: 'KL', baseFlightNo: 'KL1701', durationMins: 220, stops: 0 }],
  'LIS-CMN': [{ airline: 'TP', baseFlightNo: 'TP1701', durationMins: 135, stops: 0 }],
  'IST-CMN': [{ airline: 'TK', baseFlightNo: 'TK901',  durationMins: 235, stops: 0 }],
  'IST-ALG': [{ airline: 'TK', baseFlightNo: 'TK801',  durationMins: 220, stops: 0 }],
  'IST-TUN': [{ airline: 'TK', baseFlightNo: 'TK782',  durationMins: 215, stops: 0 }],
  'FCO-TUN': [{ airline: 'TU', baseFlightNo: 'TU783',  durationMins: 130, stops: 0 }],
  'BRU-CMN': [{ airline: 'AT', baseFlightNo: 'AT525',  durationMins: 215, stops: 0 }],
  'DXB-CAI': [{ airline: 'EK', baseFlightNo: 'EK791',  durationMins: 215, stops: 0 }],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function randomInRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function addMinutes(d, m) { return new Date(d.getTime() + m * 60000); }
function formatTime(d) { return d.toTimeString().slice(0, 5); }
function formatDate(d) { return d.toISOString().slice(0, 10); }
function minutesToDuration(m) {
  const h = Math.floor(m / 60), min = m % 60;
  return `${h}h${min > 0 ? String(min).padStart(2, '0') : '00'}`;
}

function getBaseEUR(origin, dest) {
  return BASE_PRICES_EUR[`${origin}-${dest}`]
    || BASE_PRICES_EUR[`${dest}-${origin}`]
    || 99;
}

function getRouteKey(origin, dest) {
  if (ROUTE_TEMPLATES[`${origin}-${dest}`]) return `${origin}-${dest}`;
  if (ROUTE_TEMPLATES[`${dest}-${origin}`]) return `${dest}-${origin}`;
  return null;
}

// ─── FLIGHT GENERATOR ────────────────────────────────────────────────────────
function generateFlightsForDate(origin, dest, dateStr, passengers = 1) {
  const routeKey = getRouteKey(origin, dest);
  const reversed = routeKey && routeKey.startsWith(dest);
  const templates = routeKey ? ROUTE_TEMPLATES[routeKey] : [];
  if (!templates.length) return [];

  const baseDate = new Date(`${dateStr}T00:00:00`);
  const baseEUR  = getBaseEUR(origin, dest);
  const slots    = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const flights  = [];
  let slotIdx = 0;

  for (const tpl of templates) {
    const departures = randomInRange(1, 2);
    for (let d = 0; d < departures && slotIdx < slots.length; d++, slotIdx++) {
      const deptMins = slots[slotIdx] * 60 + randomInRange(0, 55);
      const deptTime = addMinutes(baseDate, deptMins);
      const arrTime  = addMinutes(deptTime, tpl.durationMins);
      const variation = 1 + (Math.random() * 0.4 - 0.2);
      const pricePerPax = Math.round(baseEUR * variation * 10) / 10;
      const totalPrice  = Math.round(pricePerPax * passengers * 10) / 10;
      const airline = AIRLINES[tpl.airline] || { code: tpl.airline, name: tpl.airline };
      const flightNo = reversed
        ? tpl.baseFlightNo.replace(/(\d+)$/, (m) => String(parseInt(m, 10) + 1))
        : tpl.baseFlightNo;

      flights.push({
        id: `${flightNo}-${dateStr}-${deptMins}`,
        flightNumber: flightNo,
        airline,
        origin:      AIRPORTS[origin] || { code: origin, city: origin, country: '' },
        destination: AIRPORTS[dest]   || { code: dest,   city: dest,   country: '' },
        departure: { date: formatDate(deptTime), time: formatTime(deptTime), datetime: deptTime.toISOString() },
        arrival:   { date: formatDate(arrTime),  time: formatTime(arrTime),  datetime: arrTime.toISOString() },
        duration: minutesToDuration(tpl.durationMins),
        durationMins: tpl.durationMins,
        stops: tpl.stops || 0,
        stopAirports: tpl.stopAirport ? [AIRPORTS[tpl.stopAirport] || { code: tpl.stopAirport }] : [],
        price: { perPax: pricePerPax, total: totalPrice, currency: 'EUR', priceUSD: Math.round(pricePerPax / 0.92 * 10) / 10 },
        seats: { available: randomInRange(4, 48), total: 189 },
        baggage: { cabin: '10 kg', checked: tpl.airline === 'FR' ? 'Non inclus' : '23 kg' },
        refundable: Math.random() > 0.5,
        changeable: true,
        isLowCost: ['VY', 'FR', 'U2', 'TO', '3O'].includes(tpl.airline),
        affiliateUrl: buildAffiliateUrl(origin, dest, dateStr, tpl.airline),
      });
    }
  }

  return flights.sort((a, b) => a.price.total - b.price.total);
}

function buildAffiliateUrl(origin, dest, date, airlineCode) {
  // Travelpayouts affiliate links — replace MARKER_ID with your real ID
  const TRAVELPAYOUTS_MARKER = 'YOUR_MARKER_ID';
  const tpCarriers = ['VY', 'IB', 'FR', 'I2', 'UX', 'AT', '3O', 'TO', 'AF', 'LH', 'U2', 'TK', 'EK', 'TP', 'KL'];

  if (tpCarriers.includes(airlineCode)) {
    return `https://tp.media/click?shmarker=${TRAVELPAYOUTS_MARKER}&promo_id=4132&source_type=link&type=click&campaign_id=121&trs=296196&from=${origin}&to=${dest}&depart_date=${date}&utm_source=easytravel&utm_medium=cpc`;
  }

  const directSites = {
    AH: 'airalgerie.dz', TU: 'tunisair.com', BJ: 'nouvelair.com',
  };
  const site = directSites[airlineCode] || 'easytravel.app';
  return `https://${site}/?from=${origin}&to=${dest}&dep=${date}&utm_source=easytravel&utm_medium=affiliate`;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
function searchFlights({ origin, dest, date, returnDate, passengers = 1, tripType = 'ONE_WAY' }) {
  const outbound = generateFlightsForDate(origin, dest, date, passengers);
  if (tripType === 'ROUND_TRIP' && returnDate) {
    const inbound = generateFlightsForDate(dest, origin, returnDate, passengers);
    return { outbound, inbound, tripType: 'ROUND_TRIP' };
  }
  return { outbound, inbound: [], tripType: 'ONE_WAY' };
}

function getAirports(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return Object.values(AIRPORTS).slice(0, 30);
  return Object.values(AIRPORTS).filter(
    (a) => a.code.toLowerCase().includes(q)
      || a.city.toLowerCase().includes(q)
      || a.name.toLowerCase().includes(q)
      || a.country.toLowerCase().includes(q),
  );
}

function getAirportsByCountry(countryCode) {
  return Object.values(AIRPORTS).filter((a) => a.countryCode === countryCode);
}

function getCountries() {
  const focus = ['ES', 'MA', 'DZ', 'TN', 'LY', 'EG', 'FR'];
  return focus.map((c) => ({
    ...COUNTRIES[c],
    airports: getAirportsByCountry(c),
  }));
}

module.exports = { searchFlights, getAirports, getAirportsByCountry, getCountries, AIRPORTS, AIRLINES, COUNTRIES };
