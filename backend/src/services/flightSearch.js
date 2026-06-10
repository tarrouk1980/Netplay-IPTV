'use strict';

// ─── COUNTRIES ────────────────────────────────────────────────────────────────
const COUNTRIES = {
  TN: { code: 'TN', name: 'Tunisie', flag: '🇹🇳', currency: 'TND', rateFromUSD: 3.10 },
  DZ: { code: 'DZ', name: 'Algérie', flag: '🇩🇿', currency: 'DZD', rateFromUSD: 134.5 },
  MA: { code: 'MA', name: 'Maroc', flag: '🇲🇦', currency: 'MAD', rateFromUSD: 10.05 },
  LY: { code: 'LY', name: 'Libye', flag: '🇱🇾', currency: 'LYD', rateFromUSD: 4.85 },
  MR: { code: 'MR', name: 'Mauritanie', flag: '🇲🇷', currency: 'MRU', rateFromUSD: 39.8 },
  EG: { code: 'EG', name: 'Égypte', flag: '🇪🇬', currency: 'EGP', rateFromUSD: 48.5 },
  FR: { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', rateFromUSD: 0.92 },
  DE: { code: 'DE', name: 'Allemagne', flag: '🇩🇪', currency: 'EUR', rateFromUSD: 0.92 },
  IT: { code: 'IT', name: 'Italie', flag: '🇮🇹', currency: 'EUR', rateFromUSD: 0.92 },
  TR: { code: 'TR', name: 'Turquie', flag: '🇹🇷', currency: 'TRY', rateFromUSD: 32.1 },
  AE: { code: 'AE', name: 'EAU', flag: '🇦🇪', currency: 'AED', rateFromUSD: 3.67 },
  ES: { code: 'ES', name: 'Espagne', flag: '🇪🇸', currency: 'EUR', rateFromUSD: 0.92 },
  NL: { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱', currency: 'EUR', rateFromUSD: 0.92 },
  GB: { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', currency: 'GBP', rateFromUSD: 0.79 },
  PT: { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', rateFromUSD: 0.92 },
  BE: { code: 'BE', name: 'Belgique', flag: '🇧🇪', currency: 'EUR', rateFromUSD: 0.92 },
};

// ─── AIRPORTS ─────────────────────────────────────────────────────────────────
const AIRPORTS = {
  // ── Tunisie ──
  TUN: { code: 'TUN', name: 'Tunis-Carthage', city: 'Tunis', country: 'Tunisie', countryCode: 'TN', timezone: 'Africa/Tunis' },
  SFA: { code: 'SFA', name: 'Sfax-Thyna', city: 'Sfax', country: 'Tunisie', countryCode: 'TN', timezone: 'Africa/Tunis' },
  MIR: { code: 'MIR', name: 'Monastir Habib Bourguiba', city: 'Monastir', country: 'Tunisie', countryCode: 'TN', timezone: 'Africa/Tunis' },
  DJE: { code: 'DJE', name: 'Djerba-Zarzis', city: 'Djerba', country: 'Tunisie', countryCode: 'TN', timezone: 'Africa/Tunis' },
  TOE: { code: 'TOE', name: 'Tozeur-Nefta', city: 'Tozeur', country: 'Tunisie', countryCode: 'TN', timezone: 'Africa/Tunis' },
  GBE: { code: 'GBE', name: 'Gabès-Matmata', city: 'Gabès', country: 'Tunisie', countryCode: 'TN', timezone: 'Africa/Tunis' },
  TAB: { code: 'TAB', name: 'Tabarka-Aïn Draham', city: 'Tabarka', country: 'Tunisie', countryCode: 'TN', timezone: 'Africa/Tunis' },

  // ── Algérie ──
  ALG: { code: 'ALG', name: 'Alger Houari Boumediene', city: 'Alger', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },
  ORN: { code: 'ORN', name: 'Oran Ahmed Ben Bella', city: 'Oran', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },
  CZL: { code: 'CZL', name: 'Constantine Mohamed Boudiaf', city: 'Constantine', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },
  AAE: { code: 'AAE', name: 'Annaba Rabah Bitat', city: 'Annaba', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },
  TLM: { code: 'TLM', name: 'Tlemcen Zenata', city: 'Tlemcen', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },
  BSK: { code: 'BSK', name: 'Biskra Mohamed Khider', city: 'Biskra', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },
  HME: { code: 'HME', name: 'Hassi Messaoud Oued Irara', city: 'Hassi Messaoud', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },
  TMR: { code: 'TMR', name: 'Tamanrasset Aguenar', city: 'Tamanrasset', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },
  GJL: { code: 'GJL', name: 'Jijel Ferhat Abbas', city: 'Jijel', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },
  BLJ: { code: 'BLJ', name: 'Batna Mostefa Ben Boulaid', city: 'Batna', country: 'Algérie', countryCode: 'DZ', timezone: 'Africa/Algiers' },

  // ── Maroc ──
  CMN: { code: 'CMN', name: 'Casablanca Mohammed V', city: 'Casablanca', country: 'Maroc', countryCode: 'MA', timezone: 'Africa/Casablanca' },
  RAK: { code: 'RAK', name: 'Marrakech Menara', city: 'Marrakech', country: 'Maroc', countryCode: 'MA', timezone: 'Africa/Casablanca' },
  AGA: { code: 'AGA', name: 'Agadir Al Massira', city: 'Agadir', country: 'Maroc', countryCode: 'MA', timezone: 'Africa/Casablanca' },
  FEZ: { code: 'FEZ', name: 'Fès-Saïss', city: 'Fès', country: 'Maroc', countryCode: 'MA', timezone: 'Africa/Casablanca' },
  TNG: { code: 'TNG', name: 'Tanger Ibn Batouta', city: 'Tanger', country: 'Maroc', countryCode: 'MA', timezone: 'Africa/Casablanca' },
  OUD: { code: 'OUD', name: 'Oujda Angads', city: 'Oujda', country: 'Maroc', countryCode: 'MA', timezone: 'Africa/Casablanca' },
  RBA: { code: 'RBA', name: 'Rabat-Salé', city: 'Rabat', country: 'Maroc', countryCode: 'MA', timezone: 'Africa/Casablanca' },
  NDR: { code: 'NDR', name: 'Nador El Aroui', city: 'Nador', country: 'Maroc', countryCode: 'MA', timezone: 'Africa/Casablanca' },
  ERH: { code: 'ERH', name: 'Errachidia Moulay Ali Cherif', city: 'Errachidia', country: 'Maroc', countryCode: 'MA', timezone: 'Africa/Casablanca' },

  // ── Libye ──
  TIP: { code: 'TIP', name: 'Tripoli International Mitiga', city: 'Tripoli', country: 'Libye', countryCode: 'LY', timezone: 'Africa/Tripoli' },
  BEN: { code: 'BEN', name: 'Benghazi Benina', city: 'Benghazi', country: 'Libye', countryCode: 'LY', timezone: 'Africa/Tripoli' },
  MJI: { code: 'MJI', name: 'Misrata', city: 'Misrata', country: 'Libye', countryCode: 'LY', timezone: 'Africa/Tripoli' },
  SEB: { code: 'SEB', name: 'Sebha', city: 'Sebha', country: 'Libye', countryCode: 'LY', timezone: 'Africa/Tripoli' },
  TOB: { code: 'TOB', name: 'Tobrouk', city: 'Tobrouk', country: 'Libye', countryCode: 'LY', timezone: 'Africa/Tripoli' },

  // ── Mauritanie ──
  NKC: { code: 'NKC', name: 'Nouakchott Oumtounsy', city: 'Nouakchott', country: 'Mauritanie', countryCode: 'MR', timezone: 'Africa/Nouakchott' },
  NDB: { code: 'NDB', name: 'Nouadhibou', city: 'Nouadhibou', country: 'Mauritanie', countryCode: 'MR', timezone: 'Africa/Nouakchott' },
  ATR: { code: 'ATR', name: 'Atar', city: 'Atar', country: 'Mauritanie', countryCode: 'MR', timezone: 'Africa/Nouakchott' },

  // ── Égypte ──
  CAI: { code: 'CAI', name: 'Le Caire International', city: 'Le Caire', country: 'Égypte', countryCode: 'EG', timezone: 'Africa/Cairo' },
  HRG: { code: 'HRG', name: 'Hurghada International', city: 'Hurghada', country: 'Égypte', countryCode: 'EG', timezone: 'Africa/Cairo' },
  SSH: { code: 'SSH', name: 'Sharm el-Sheikh', city: 'Sharm el-Sheikh', country: 'Égypte', countryCode: 'EG', timezone: 'Africa/Cairo' },
  LXR: { code: 'LXR', name: 'Louxor International', city: 'Louxor', country: 'Égypte', countryCode: 'EG', timezone: 'Africa/Cairo' },
  ASW: { code: 'ASW', name: 'Assouan', city: 'Assouan', country: 'Égypte', countryCode: 'EG', timezone: 'Africa/Cairo' },
  HBE: { code: 'HBE', name: 'Alexandrie Borg el-Arab', city: 'Alexandrie', country: 'Égypte', countryCode: 'EG', timezone: 'Africa/Cairo' },
  ABS: { code: 'ABS', name: 'Abou Simbel', city: 'Abou Simbel', country: 'Égypte', countryCode: 'EG', timezone: 'Africa/Cairo' },

  // ── Europe ──
  CDG: { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris' },
  ORY: { code: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris' },
  LYS: { code: 'LYS', name: 'Lyon-Saint Exupéry', city: 'Lyon', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris' },
  MRS: { code: 'MRS', name: 'Marseille-Provence', city: 'Marseille', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris' },
  NCE: { code: 'NCE', name: 'Nice Côte d\'Azur', city: 'Nice', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris' },
  BOD: { code: 'BOD', name: 'Bordeaux-Mérignac', city: 'Bordeaux', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris' },
  TLS: { code: 'TLS', name: 'Toulouse-Blagnac', city: 'Toulouse', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris' },
  FRA: { code: 'FRA', name: 'Francfort', city: 'Francfort', country: 'Allemagne', countryCode: 'DE', timezone: 'Europe/Berlin' },
  FCO: { code: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'Italie', countryCode: 'IT', timezone: 'Europe/Rome' },
  MXP: { code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italie', countryCode: 'IT', timezone: 'Europe/Rome' },
  IST: { code: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turquie', countryCode: 'TR', timezone: 'Europe/Istanbul' },
  DXB: { code: 'DXB', name: 'Dubaï International', city: 'Dubaï', country: 'EAU', countryCode: 'AE', timezone: 'Asia/Dubai' },
  BCN: { code: 'BCN', name: 'Barcelone El Prat', city: 'Barcelone', country: 'Espagne', countryCode: 'ES', timezone: 'Europe/Madrid' },
  MAD: { code: 'MAD', name: 'Madrid Barajas', city: 'Madrid', country: 'Espagne', countryCode: 'ES', timezone: 'Europe/Madrid' },
  AMS: { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Pays-Bas', countryCode: 'NL', timezone: 'Europe/Amsterdam' },
  LHR: { code: 'LHR', name: 'Londres Heathrow', city: 'Londres', country: 'Royaume-Uni', countryCode: 'GB', timezone: 'Europe/London' },
  LIS: { code: 'LIS', name: 'Lisbonne Humberto Delgado', city: 'Lisbonne', country: 'Portugal', countryCode: 'PT', timezone: 'Europe/Lisbon' },
  BRU: { code: 'BRU', name: 'Bruxelles', city: 'Bruxelles', country: 'Belgique', countryCode: 'BE', timezone: 'Europe/Brussels' },
};

// ─── AIRLINES ─────────────────────────────────────────────────────────────────
const AIRLINES = {
  // Nord Afrique
  TU: { code: 'TU', name: 'Tunisair', country: 'TN', color: '#C8102E' },
  BJ: { code: 'BJ', name: 'Nouvelair', country: 'TN', color: '#FF6B00' },
  UG: { code: 'UG', name: 'Tunisair Express', country: 'TN', color: '#C8102E' },
  AH: { code: 'AH', name: 'Air Algérie', country: 'DZ', color: '#006B3F' },
  SF: { code: 'SF', name: 'Tassili Airlines', country: 'DZ', color: '#005E3A' },
  AT: { code: 'AT', name: 'Royal Air Maroc', country: 'MA', color: '#006233' },
  '3O': { code: '3O', name: 'Air Arabia Maroc', country: 'MA', color: '#EE1C25' },
  TO: { code: 'TO', name: 'Transavia Maroc', country: 'MA', color: '#00B2D4' },
  '7I': { code: '7I', name: 'Afriqiyah Airways', country: 'LY', color: '#007749' },
  LN: { code: 'LN', name: 'Libyan Airlines', country: 'LY', color: '#005BAC' },
  L6: { code: 'L6', name: 'Mauritania Airlines', country: 'MR', color: '#006233' },
  MS: { code: 'MS', name: 'EgyptAir', country: 'EG', color: '#1A3A6B' },
  NP: { code: 'NP', name: 'Nile Air', country: 'EG', color: '#00539F' },
  // Europe / International
  AF: { code: 'AF', name: 'Air France', country: 'FR', color: '#002395' },
  LH: { code: 'LH', name: 'Lufthansa', country: 'DE', color: '#05164D' },
  IB: { code: 'IB', name: 'Iberia', country: 'ES', color: '#C00B1D' },
  KL: { code: 'KL', name: 'KLM', country: 'NL', color: '#00A1DE' },
  VY: { code: 'VY', name: 'Vueling', country: 'ES', color: '#B8860B' },
  TK: { code: 'TK', name: 'Turkish Airlines', country: 'TR', color: '#C8102E' },
  PC: { code: 'PC', name: 'Pegasus Airlines', country: 'TR', color: '#F26522' },
  EK: { code: 'EK', name: 'Emirates', country: 'AE', color: '#C8102E' },
  TP: { code: 'TP', name: 'TAP Air Portugal', country: 'PT', color: '#C8102E' },
  SN: { code: 'SN', name: 'Brussels Airlines', country: 'BE', color: '#001489' },
  FR: { code: 'FR', name: 'Ryanair', country: 'IE', color: '#073590' },
  U2: { code: 'U2', name: 'easyJet', country: 'GB', color: '#FF6600' },
};

// ─── BASE PRICES (USD) ───────────────────────────────────────────────────────
// One-way adult, economy. Symmetric (A→B same as B→A base).
const BASE_PRICES_USD = {
  // Tunisie interne
  'TUN-SFA': 38, 'TUN-DJE': 52, 'TUN-MIR': 48, 'TUN-TOE': 55, 'TUN-GBE': 45, 'TUN-TAB': 42,
  'SFA-DJE': 40, 'MIR-DJE': 45, 'SFA-MIR': 36,
  // Algérie interne
  'ALG-ORN': 55, 'ALG-CZL': 50, 'ALG-AAE': 52, 'ALG-TLM': 58, 'ALG-BSK': 62,
  'ALG-HME': 68, 'ALG-TMR': 85, 'ALG-GJL': 55, 'ALG-BLJ': 60, 'ORN-CZL': 65,
  // Maroc interne
  'CMN-RAK': 45, 'CMN-AGA': 52, 'CMN-FEZ': 38, 'CMN-TNG': 42, 'CMN-OUD': 55,
  'CMN-RBA': 30, 'CMN-NDR': 58, 'RAK-AGA': 48, 'FEZ-TNG': 52,
  // Égypte interne
  'CAI-HRG': 62, 'CAI-SSH': 68, 'CAI-LXR': 55, 'CAI-ASW': 70, 'CAI-HBE': 40, 'CAI-ABS': 88,
  'HRG-SSH': 55, 'LXR-ASW': 45,
  // Mauritanie interne
  'NKC-NDB': 80, 'NKC-ATR': 90,
  // Libye interne
  'TIP-BEN': 70, 'TIP-MJI': 65, 'TIP-SEB': 95, 'BEN-TOB': 60,
  // Inter-Maghreb (Tunisie ↔ voisins)
  'TUN-ALG': 72, 'TUN-CMN': 95, 'TUN-TIP': 80, 'TUN-CAI': 110, 'TUN-NKC': 240,
  'DJE-TIP': 85,
  // Inter-Maghreb (Algérie ↔ voisins)
  'ALG-CMN': 88, 'ALG-TUN': 72, 'ALG-TIP': 95, 'ALG-CAI': 130, 'ALG-NKC': 210,
  'ORN-CMN': 92, 'TLM-CMN': 85,
  // Inter-Maghreb (Maroc ↔ voisins)
  'CMN-TUN': 95, 'CMN-ALG': 88, 'CMN-CAI': 145, 'CMN-NKC': 185, 'CMN-TIP': 115,
  // Inter-Maghreb (Égypte ↔ voisins)
  'CAI-TIP': 125, 'CAI-CMN': 145,
  // Tunisie → Europe
  'TUN-CDG': 148, 'TUN-ORY': 138, 'TUN-LYS': 125, 'TUN-MRS': 118, 'TUN-NCE': 122,
  'TUN-FRA': 155, 'TUN-FCO': 108, 'TUN-MXP': 115, 'TUN-BCN': 118, 'TUN-MAD': 130,
  'TUN-AMS': 165, 'TUN-LHR': 182, 'TUN-IST': 122, 'TUN-DXB': 198, 'TUN-LIS': 128,
  'TUN-BRU': 155, 'TUN-BOD': 132, 'TUN-TLS': 128,
  'DJE-CDG': 142, 'DJE-ORY': 135, 'DJE-MRS': 115, 'DJE-LYS': 122, 'DJE-FRA': 148,
  'MIR-CDG': 138, 'MIR-ORY': 130, 'MIR-MRS': 112, 'MIR-NCE': 118,
  'SFA-MRS': 125, 'SFA-CDG': 145,
  // Algérie → Europe
  'ALG-CDG': 142, 'ALG-ORY': 135, 'ALG-LYS': 122, 'ALG-MRS': 115, 'ALG-NCE': 118,
  'ALG-FRA': 152, 'ALG-BCN': 125, 'ALG-MAD': 138, 'ALG-AMS': 162, 'ALG-LHR': 178,
  'ALG-IST': 118, 'ALG-DXB': 195, 'ALG-FCO': 125, 'ALG-BRU': 148, 'ALG-LIS': 132,
  'ORN-CDG': 138, 'ORN-ORY': 132, 'ORN-MRS': 110, 'ORN-LYS': 118, 'ORN-BCN': 115,
  'CZL-CDG': 145, 'CZL-ORY': 138, 'CZL-LYS': 128, 'AAE-MRS': 118, 'AAE-CDG': 142,
  'TLM-CDG': 140, 'TLM-ORY': 132, 'TLM-MRS': 112, 'TLM-BCN': 108,
  // Maroc → Europe
  'CMN-CDG': 152, 'CMN-ORY': 145, 'CMN-LYS': 128, 'CMN-MRS': 118, 'CMN-NCE': 122,
  'CMN-FRA': 162, 'CMN-BCN': 118, 'CMN-MAD': 108, 'CMN-AMS': 172, 'CMN-LHR': 188,
  'CMN-IST': 128, 'CMN-DXB': 205, 'CMN-FCO': 132, 'CMN-BRU': 158, 'CMN-LIS': 95,
  'RAK-CDG': 148, 'RAK-ORY': 140, 'RAK-MRS': 115, 'RAK-LYS': 122, 'RAK-BCN': 115,
  'RAK-FRA': 158, 'RAK-AMS': 168, 'RAK-LHR': 185,
  'AGA-CDG': 145, 'AGA-ORY': 138, 'AGA-MRS': 112, 'AGA-BCN': 118, 'AGA-LYS': 120,
  'FEZ-CDG': 142, 'FEZ-ORY': 135, 'FEZ-BCN': 112, 'TNG-BCN': 98, 'TNG-MAD': 92,
  'TNG-MRS': 110, 'OUD-CDG': 138, 'NDR-BCN': 105, 'NDR-MAD': 98,
  // Libye → Europe / voisins
  'TIP-CDG': 195, 'TIP-MRS': 168, 'TIP-FCO': 148, 'TIP-IST': 145, 'TIP-DXB': 205,
  'TIP-ALG': 95, 'TIP-TUN': 80,
  'BEN-CDG': 205, 'BEN-IST': 148, 'BEN-CAI': 115,
  // Mauritanie → Europe
  'NKC-CDG': 285, 'NKC-ORY': 278, 'NKC-CMN': 195, 'NKC-LIS': 248,
  // Égypte → Europe / région
  'CAI-CDG': 198, 'CAI-ORY': 188, 'CAI-LHR': 215, 'CAI-FRA': 205, 'CAI-IST': 148,
  'CAI-DXB': 168, 'CAI-FCO': 168, 'CAI-AMS': 208, 'CAI-BCN': 195, 'CAI-MRS': 188,
  'HRG-CDG': 195, 'HRG-FRA': 198, 'HRG-LHR': 210, 'HRG-AMS': 202,
  'SSH-CDG': 198, 'SSH-FRA': 200, 'SSH-LHR': 212, 'SSH-BCN': 192,
  'LXR-CDG': 205, 'LXR-FRA': 208,
};

function getBaseUSD(origin, dest) {
  return BASE_PRICES_USD[`${origin}-${dest}`]
    || BASE_PRICES_USD[`${dest}-${origin}`]
    || 140;
}

function usdToLocal(usd, countryCode) {
  const country = COUNTRIES[countryCode];
  if (!country) return { amount: Math.round(usd * 3.1 * 10) / 10, currency: 'TND' };
  return {
    amount: Math.round(usd * country.rateFromUSD * 10) / 10,
    currency: country.currency,
  };
}

// ─── ROUTE TEMPLATES ─────────────────────────────────────────────────────────
// Format: 'ORIGIN-DEST': [{ airline, baseFlightNo, durationMins, stops, stopAirport? }]
// Routes are bidirectional — we auto-generate return.
const ROUTE_TEMPLATES = {
  // ── TUNISIE interne ──
  'TUN-SFA': [{ airline: 'UG', baseFlightNo: 'UG300', durationMins: 50, stops: 0 }],
  'TUN-DJE': [{ airline: 'TU', baseFlightNo: 'TU620', durationMins: 60, stops: 0 }, { airline: 'BJ', baseFlightNo: 'BJ620', durationMins: 60, stops: 0 }],
  'TUN-MIR': [{ airline: 'TU', baseFlightNo: 'TU640', durationMins: 55, stops: 0 }, { airline: 'UG', baseFlightNo: 'UG640', durationMins: 55, stops: 0 }],
  'TUN-TOE': [{ airline: 'UG', baseFlightNo: 'UG320', durationMins: 75, stops: 0 }],

  // ── ALGÉRIE interne ──
  'ALG-ORN': [{ airline: 'AH', baseFlightNo: 'AH110', durationMins: 60, stops: 0 }, { airline: 'SF', baseFlightNo: 'SF110', durationMins: 60, stops: 0 }],
  'ALG-CZL': [{ airline: 'AH', baseFlightNo: 'AH130', durationMins: 55, stops: 0 }],
  'ALG-AAE': [{ airline: 'AH', baseFlightNo: 'AH140', durationMins: 55, stops: 0 }],
  'ALG-TLM': [{ airline: 'AH', baseFlightNo: 'AH150', durationMins: 65, stops: 0 }, { airline: 'SF', baseFlightNo: 'SF150', durationMins: 65, stops: 0 }],
  'ALG-HME': [{ airline: 'AH', baseFlightNo: 'AH170', durationMins: 75, stops: 0 }, { airline: 'SF', baseFlightNo: 'SF170', durationMins: 80, stops: 0 }],
  'ALG-TMR': [{ airline: 'AH', baseFlightNo: 'AH180', durationMins: 120, stops: 0 }, { airline: 'SF', baseFlightNo: 'SF180', durationMins: 125, stops: 0 }],
  'ALG-BSK': [{ airline: 'AH', baseFlightNo: 'AH190', durationMins: 70, stops: 0 }],

  // ── MAROC interne ──
  'CMN-RAK': [{ airline: 'AT', baseFlightNo: 'AT411', durationMins: 55, stops: 0 }, { airline: '3O', baseFlightNo: '3O401', durationMins: 55, stops: 0 }],
  'CMN-AGA': [{ airline: 'AT', baseFlightNo: 'AT421', durationMins: 65, stops: 0 }, { airline: '3O', baseFlightNo: '3O421', durationMins: 65, stops: 0 }],
  'CMN-FEZ': [{ airline: 'AT', baseFlightNo: 'AT431', durationMins: 45, stops: 0 }],
  'CMN-TNG': [{ airline: 'AT', baseFlightNo: 'AT441', durationMins: 50, stops: 0 }, { airline: '3O', baseFlightNo: '3O441', durationMins: 50, stops: 0 }],
  'CMN-OUD': [{ airline: 'AT', baseFlightNo: 'AT451', durationMins: 60, stops: 0 }],
  'CMN-NDR': [{ airline: 'AT', baseFlightNo: 'AT461', durationMins: 55, stops: 0 }],

  // ── ÉGYPTE interne ──
  'CAI-HRG': [{ airline: 'MS', baseFlightNo: 'MS810', durationMins: 70, stops: 0 }, { airline: 'NP', baseFlightNo: 'NP810', durationMins: 70, stops: 0 }],
  'CAI-SSH': [{ airline: 'MS', baseFlightNo: 'MS820', durationMins: 75, stops: 0 }],
  'CAI-LXR': [{ airline: 'MS', baseFlightNo: 'MS830', durationMins: 80, stops: 0 }, { airline: 'NP', baseFlightNo: 'NP830', durationMins: 80, stops: 0 }],
  'CAI-ASW': [{ airline: 'MS', baseFlightNo: 'MS840', durationMins: 90, stops: 0 }],
  'CAI-HBE': [{ airline: 'MS', baseFlightNo: 'MS850', durationMins: 45, stops: 0 }],

  // ── MAURITANIE interne ──
  'NKC-NDB': [{ airline: 'L6', baseFlightNo: 'L6110', durationMins: 90, stops: 0 }],

  // ── LIBYE interne ──
  'TIP-BEN': [{ airline: 'LN', baseFlightNo: 'LN101', durationMins: 80, stops: 0 }, { airline: '7I', baseFlightNo: '7I101', durationMins: 80, stops: 0 }],
  'TIP-MJI': [{ airline: 'LN', baseFlightNo: 'LN111', durationMins: 60, stops: 0 }],
  'TIP-SEB': [{ airline: 'LN', baseFlightNo: 'LN121', durationMins: 110, stops: 0 }],

  // ── Inter-Maghreb ──
  'TUN-ALG': [{ airline: 'TU', baseFlightNo: 'TU830', durationMins: 90, stops: 0 }, { airline: 'AH', baseFlightNo: 'AH830', durationMins: 90, stops: 0 }],
  'TUN-CMN': [{ airline: 'TU', baseFlightNo: 'TU850', durationMins: 155, stops: 0 }, { airline: 'AT', baseFlightNo: 'AT850', durationMins: 155, stops: 0 }],
  'TUN-TIP': [{ airline: 'TU', baseFlightNo: 'TU870', durationMins: 100, stops: 0 }, { airline: '7I', baseFlightNo: '7I870', durationMins: 105, stops: 0 }],
  'TUN-CAI': [{ airline: 'MS', baseFlightNo: 'MS751', durationMins: 165, stops: 0 }, { airline: 'TU', baseFlightNo: 'TU880', durationMins: 170, stops: 0 }],
  'TUN-NKC': [{ airline: 'L6', baseFlightNo: 'L6201', durationMins: 310, stops: 1, stopAirport: 'CMN' }],
  'ALG-CMN': [{ airline: 'AH', baseFlightNo: 'AH910', durationMins: 145, stops: 0 }, { airline: 'AT', baseFlightNo: 'AT910', durationMins: 148, stops: 0 }],
  'ALG-CAI': [{ airline: 'AH', baseFlightNo: 'AH920', durationMins: 195, stops: 0 }, { airline: 'MS', baseFlightNo: 'MS920', durationMins: 200, stops: 0 }],
  'ALG-TIP': [{ airline: 'AH', baseFlightNo: 'AH930', durationMins: 120, stops: 0 }],
  'CMN-CAI': [{ airline: 'AT', baseFlightNo: 'AT950', durationMins: 215, stops: 0 }, { airline: 'MS', baseFlightNo: 'MS950', durationMins: 220, stops: 0 }],
  'CMN-NKC': [{ airline: 'AT', baseFlightNo: 'AT960', durationMins: 165, stops: 0 }, { airline: 'L6', baseFlightNo: 'L6960', durationMins: 170, stops: 0 }],
  'TIP-CAI': [{ airline: '7I', baseFlightNo: '7I801', durationMins: 155, stops: 0 }, { airline: 'MS', baseFlightNo: 'MS801', durationMins: 158, stops: 0 }],
  'NKC-CDG': [{ airline: 'L6', baseFlightNo: 'L6501', durationMins: 340, stops: 0 }, { airline: 'AT', baseFlightNo: 'AT501', durationMins: 355, stops: 0 }],
  'NKC-CMN': [{ airline: 'L6', baseFlightNo: 'L6511', durationMins: 165, stops: 0 }],

  // ── Tunisie → Europe ──
  'TUN-CDG': [{ airline: 'TU', baseFlightNo: 'TU706', durationMins: 175, stops: 0 }, { airline: 'AF', baseFlightNo: 'AF1284', durationMins: 175, stops: 0 }, { airline: 'TK', baseFlightNo: 'TK7886', durationMins: 310, stops: 1, stopAirport: 'IST' }],
  'TUN-ORY': [{ airline: 'TU', baseFlightNo: 'TU742', durationMins: 175, stops: 0 }, { airline: 'BJ', baseFlightNo: 'BJ507', durationMins: 175, stops: 0 }, { airline: 'VY', baseFlightNo: 'VY8840', durationMins: 195, stops: 0 }],
  'TUN-LYS': [{ airline: 'TU', baseFlightNo: 'TU728', durationMins: 165, stops: 0 }, { airline: 'BJ', baseFlightNo: 'BJ521', durationMins: 170, stops: 0 }],
  'TUN-MRS': [{ airline: 'BJ', baseFlightNo: 'BJ519', durationMins: 155, stops: 0 }, { airline: 'TU', baseFlightNo: 'TU758', durationMins: 160, stops: 0 }],
  'TUN-NCE': [{ airline: 'TU', baseFlightNo: 'TU762', durationMins: 160, stops: 0 }, { airline: 'BJ', baseFlightNo: 'BJ562', durationMins: 160, stops: 0 }],
  'TUN-FRA': [{ airline: 'LH', baseFlightNo: 'LH1424', durationMins: 205, stops: 0 }, { airline: 'TU', baseFlightNo: 'TU770', durationMins: 200, stops: 0 }],
  'TUN-FCO': [{ airline: 'TU', baseFlightNo: 'TU782', durationMins: 130, stops: 0 }, { airline: 'IB', baseFlightNo: 'IB3244', durationMins: 145, stops: 0 }],
  'TUN-MXP': [{ airline: 'TU', baseFlightNo: 'TU786', durationMins: 140, stops: 0 }],
  'TUN-BCN': [{ airline: 'VY', baseFlightNo: 'VY8812', durationMins: 155, stops: 0 }, { airline: 'TU', baseFlightNo: 'TU774', durationMins: 160, stops: 0 }],
  'TUN-MAD': [{ airline: 'IB', baseFlightNo: 'IB3286', durationMins: 180, stops: 0 }, { airline: 'TU', baseFlightNo: 'TU778', durationMins: 185, stops: 0 }],
  'TUN-AMS': [{ airline: 'KL', baseFlightNo: 'KL1614', durationMins: 215, stops: 0 }, { airline: 'TU', baseFlightNo: 'TU790', durationMins: 215, stops: 0 }],
  'TUN-LHR': [{ airline: 'TU', baseFlightNo: 'TU814', durationMins: 240, stops: 0 }, { airline: 'TK', baseFlightNo: 'TK7828', durationMins: 390, stops: 1, stopAirport: 'IST' }],
  'TUN-IST': [{ airline: 'TK', baseFlightNo: 'TK781', durationMins: 215, stops: 0 }, { airline: 'PC', baseFlightNo: 'PC1402', durationMins: 220, stops: 0 }],
  'TUN-DXB': [{ airline: 'EK', baseFlightNo: 'EK751', durationMins: 340, stops: 0 }, { airline: 'TK', baseFlightNo: 'TK1786', durationMins: 480, stops: 1, stopAirport: 'IST' }],
  'TUN-LIS': [{ airline: 'TP', baseFlightNo: 'TP1502', durationMins: 190, stops: 0 }],
  'TUN-BRU': [{ airline: 'SN', baseFlightNo: 'SN3532', durationMins: 200, stops: 0 }],
  'TUN-BOD': [{ airline: 'BJ', baseFlightNo: 'BJ540', durationMins: 175, stops: 0 }],
  'TUN-TLS': [{ airline: 'BJ', baseFlightNo: 'BJ545', durationMins: 170, stops: 0 }],
  'DJE-CDG': [{ airline: 'TU', baseFlightNo: 'TU904', durationMins: 185, stops: 0 }, { airline: 'BJ', baseFlightNo: 'BJ541', durationMins: 180, stops: 0 }],
  'DJE-ORY': [{ airline: 'BJ', baseFlightNo: 'BJ543', durationMins: 180, stops: 0 }, { airline: 'TU', baseFlightNo: 'TU908', durationMins: 185, stops: 0 }],
  'DJE-MRS': [{ airline: 'BJ', baseFlightNo: 'BJ547', durationMins: 160, stops: 0 }],
  'DJE-LYS': [{ airline: 'BJ', baseFlightNo: 'BJ549', durationMins: 165, stops: 0 }],
  'DJE-FRA': [{ airline: 'LH', baseFlightNo: 'LH3540', durationMins: 210, stops: 0 }],
  'MIR-CDG': [{ airline: 'TU', baseFlightNo: 'TU954', durationMins: 180, stops: 0 }, { airline: 'BJ', baseFlightNo: 'BJ561', durationMins: 175, stops: 0 }],
  'MIR-ORY': [{ airline: 'BJ', baseFlightNo: 'BJ563', durationMins: 175, stops: 0 }],
  'MIR-MRS': [{ airline: 'BJ', baseFlightNo: 'BJ567', durationMins: 155, stops: 0 }],
  'MIR-NCE': [{ airline: 'BJ', baseFlightNo: 'BJ569', durationMins: 160, stops: 0 }],

  // ── Algérie → Europe ──
  'ALG-CDG': [{ airline: 'AH', baseFlightNo: 'AH1000', durationMins: 185, stops: 0 }, { airline: 'AF', baseFlightNo: 'AF1384', durationMins: 185, stops: 0 }, { airline: 'TK', baseFlightNo: 'TK7950', durationMins: 315, stops: 1, stopAirport: 'IST' }],
  'ALG-ORY': [{ airline: 'AH', baseFlightNo: 'AH1010', durationMins: 185, stops: 0 }, { airline: 'VY', baseFlightNo: 'VY8900', durationMins: 195, stops: 0 }],
  'ALG-LYS': [{ airline: 'AH', baseFlightNo: 'AH1020', durationMins: 170, stops: 0 }],
  'ALG-MRS': [{ airline: 'AH', baseFlightNo: 'AH1030', durationMins: 160, stops: 0 }],
  'ALG-NCE': [{ airline: 'AH', baseFlightNo: 'AH1032', durationMins: 165, stops: 0 }],
  'ALG-FRA': [{ airline: 'LH', baseFlightNo: 'LH1504', durationMins: 210, stops: 0 }, { airline: 'AH', baseFlightNo: 'AH1040', durationMins: 215, stops: 0 }],
  'ALG-BCN': [{ airline: 'VY', baseFlightNo: 'VY8950', durationMins: 165, stops: 0 }, { airline: 'AH', baseFlightNo: 'AH1050', durationMins: 168, stops: 0 }],
  'ALG-MAD': [{ airline: 'IB', baseFlightNo: 'IB3400', durationMins: 185, stops: 0 }, { airline: 'AH', baseFlightNo: 'AH1055', durationMins: 188, stops: 0 }],
  'ALG-AMS': [{ airline: 'KL', baseFlightNo: 'KL1700', durationMins: 220, stops: 0 }],
  'ALG-LHR': [{ airline: 'AH', baseFlightNo: 'AH1060', durationMins: 245, stops: 0 }],
  'ALG-IST': [{ airline: 'TK', baseFlightNo: 'TK800', durationMins: 220, stops: 0 }, { airline: 'PC', baseFlightNo: 'PC1500', durationMins: 225, stops: 0 }],
  'ALG-DXB': [{ airline: 'EK', baseFlightNo: 'EK760', durationMins: 345, stops: 0 }],
  'ALG-FCO': [{ airline: 'AH', baseFlightNo: 'AH1070', durationMins: 155, stops: 0 }],
  'ALG-BRU': [{ airline: 'SN', baseFlightNo: 'SN3600', durationMins: 210, stops: 0 }],
  'ALG-LIS': [{ airline: 'TP', baseFlightNo: 'TP1600', durationMins: 200, stops: 0 }],
  'ORN-CDG': [{ airline: 'AH', baseFlightNo: 'AH1100', durationMins: 190, stops: 0 }],
  'ORN-ORY': [{ airline: 'AH', baseFlightNo: 'AH1102', durationMins: 190, stops: 0 }],
  'ORN-MRS': [{ airline: 'AH', baseFlightNo: 'AH1104', durationMins: 165, stops: 0 }],
  'ORN-LYS': [{ airline: 'AH', baseFlightNo: 'AH1106', durationMins: 172, stops: 0 }],
  'ORN-BCN': [{ airline: 'VY', baseFlightNo: 'VY9000', durationMins: 155, stops: 0 }, { airline: 'AH', baseFlightNo: 'AH1108', durationMins: 158, stops: 0 }],
  'CZL-CDG': [{ airline: 'AH', baseFlightNo: 'AH1200', durationMins: 188, stops: 0 }],
  'CZL-ORY': [{ airline: 'AH', baseFlightNo: 'AH1202', durationMins: 188, stops: 0 }],
  'CZL-LYS': [{ airline: 'AH', baseFlightNo: 'AH1204', durationMins: 175, stops: 0 }],
  'AAE-MRS': [{ airline: 'AH', baseFlightNo: 'AH1210', durationMins: 162, stops: 0 }],
  'AAE-CDG': [{ airline: 'AH', baseFlightNo: 'AH1212', durationMins: 190, stops: 0 }],
  'TLM-CDG': [{ airline: 'AH', baseFlightNo: 'AH1220', durationMins: 192, stops: 0 }],
  'TLM-ORY': [{ airline: 'AH', baseFlightNo: 'AH1222', durationMins: 192, stops: 0 }],
  'TLM-MRS': [{ airline: 'AH', baseFlightNo: 'AH1224', durationMins: 162, stops: 0 }],
  'TLM-BCN': [{ airline: 'AH', baseFlightNo: 'AH1226', durationMins: 148, stops: 0 }],

  // ── Maroc → Europe ──
  'CMN-CDG': [{ airline: 'AT', baseFlightNo: 'AT500', durationMins: 185, stops: 0 }, { airline: 'AF', baseFlightNo: 'AF1540', durationMins: 185, stops: 0 }, { airline: 'TO', baseFlightNo: 'TO3500', durationMins: 195, stops: 0 }],
  'CMN-ORY': [{ airline: 'AT', baseFlightNo: 'AT502', durationMins: 185, stops: 0 }, { airline: 'TO', baseFlightNo: 'TO3502', durationMins: 195, stops: 0 }],
  'CMN-LYS': [{ airline: 'AT', baseFlightNo: 'AT504', durationMins: 170, stops: 0 }],
  'CMN-MRS': [{ airline: 'AT', baseFlightNo: 'AT506', durationMins: 158, stops: 0 }, { airline: 'TO', baseFlightNo: 'TO3506', durationMins: 162, stops: 0 }],
  'CMN-NCE': [{ airline: 'AT', baseFlightNo: 'AT508', durationMins: 165, stops: 0 }],
  'CMN-FRA': [{ airline: 'AT', baseFlightNo: 'AT510', durationMins: 215, stops: 0 }, { airline: 'LH', baseFlightNo: 'LH1600', durationMins: 215, stops: 0 }],
  'CMN-BCN': [{ airline: 'AT', baseFlightNo: 'AT514', durationMins: 158, stops: 0 }, { airline: 'VY', baseFlightNo: 'VY9200', durationMins: 155, stops: 0 }],
  'CMN-MAD': [{ airline: 'AT', baseFlightNo: 'AT516', durationMins: 152, stops: 0 }, { airline: 'IB', baseFlightNo: 'IB3600', durationMins: 148, stops: 0 }],
  'CMN-AMS': [{ airline: 'KL', baseFlightNo: 'KL1800', durationMins: 225, stops: 0 }, { airline: 'AT', baseFlightNo: 'AT520', durationMins: 225, stops: 0 }],
  'CMN-LHR': [{ airline: 'AT', baseFlightNo: 'AT522', durationMins: 248, stops: 0 }],
  'CMN-IST': [{ airline: 'TK', baseFlightNo: 'TK900', durationMins: 235, stops: 0 }, { airline: 'PC', baseFlightNo: 'PC1600', durationMins: 238, stops: 0 }],
  'CMN-DXB': [{ airline: 'EK', baseFlightNo: 'EK770', durationMins: 358, stops: 0 }, { airline: 'AT', baseFlightNo: 'AT530', durationMins: 365, stops: 0 }],
  'CMN-FCO': [{ airline: 'AT', baseFlightNo: 'AT532', durationMins: 175, stops: 0 }],
  'CMN-BRU': [{ airline: 'SN', baseFlightNo: 'SN3700', durationMins: 215, stops: 0 }],
  'CMN-LIS': [{ airline: 'TP', baseFlightNo: 'TP1700', durationMins: 135, stops: 0 }, { airline: 'AT', baseFlightNo: 'AT536', durationMins: 135, stops: 0 }],
  'RAK-CDG': [{ airline: 'AT', baseFlightNo: 'AT600', durationMins: 195, stops: 0 }, { airline: 'TO', baseFlightNo: 'TO3600', durationMins: 195, stops: 0 }],
  'RAK-ORY': [{ airline: 'AT', baseFlightNo: 'AT602', durationMins: 195, stops: 0 }, { airline: 'FR', baseFlightNo: 'FR9010', durationMins: 200, stops: 0 }],
  'RAK-MRS': [{ airline: 'TO', baseFlightNo: 'TO3604', durationMins: 165, stops: 0 }],
  'RAK-LYS': [{ airline: 'AT', baseFlightNo: 'AT604', durationMins: 178, stops: 0 }],
  'RAK-BCN': [{ airline: 'VY', baseFlightNo: 'VY9300', durationMins: 168, stops: 0 }],
  'RAK-FRA': [{ airline: 'LH', baseFlightNo: 'LH1700', durationMins: 222, stops: 0 }],
  'RAK-AMS': [{ airline: 'KL', baseFlightNo: 'KL1900', durationMins: 232, stops: 0 }],
  'RAK-LHR': [{ airline: 'AT', baseFlightNo: 'AT610', durationMins: 255, stops: 0 }],
  'AGA-CDG': [{ airline: 'AT', baseFlightNo: 'AT650', durationMins: 198, stops: 0 }, { airline: 'FR', baseFlightNo: 'FR9020', durationMins: 202, stops: 0 }],
  'AGA-ORY': [{ airline: 'TO', baseFlightNo: 'TO3650', durationMins: 198, stops: 0 }],
  'AGA-MRS': [{ airline: 'TO', baseFlightNo: 'TO3652', durationMins: 165, stops: 0 }],
  'AGA-BCN': [{ airline: 'VY', baseFlightNo: 'VY9400', durationMins: 172, stops: 0 }],
  'AGA-LYS': [{ airline: 'AT', baseFlightNo: 'AT654', durationMins: 182, stops: 0 }],
  'FEZ-CDG': [{ airline: 'AT', baseFlightNo: 'AT700', durationMins: 188, stops: 0 }],
  'FEZ-ORY': [{ airline: 'FR', baseFlightNo: 'FR9030', durationMins: 192, stops: 0 }],
  'FEZ-BCN': [{ airline: 'VY', baseFlightNo: 'VY9500', durationMins: 162, stops: 0 }],
  'TNG-BCN': [{ airline: 'VY', baseFlightNo: 'VY9600', durationMins: 148, stops: 0 }, { airline: 'AT', baseFlightNo: 'AT720', durationMins: 150, stops: 0 }],
  'TNG-MAD': [{ airline: 'IB', baseFlightNo: 'IB3700', durationMins: 142, stops: 0 }, { airline: 'AT', baseFlightNo: 'AT722', durationMins: 145, stops: 0 }],
  'TNG-MRS': [{ airline: 'TO', baseFlightNo: 'TO3720', durationMins: 165, stops: 0 }],
  'OUD-CDG': [{ airline: 'AT', baseFlightNo: 'AT740', durationMins: 195, stops: 0 }],
  'NDR-BCN': [{ airline: 'VY', baseFlightNo: 'VY9700', durationMins: 155, stops: 0 }],
  'NDR-MAD': [{ airline: 'IB', baseFlightNo: 'IB3720', durationMins: 158, stops: 0 }],

  // ── Libye → Europe ──
  'TIP-CDG': [{ airline: '7I', baseFlightNo: '7I901', durationMins: 215, stops: 0 }, { airline: 'TK', baseFlightNo: 'TK8100', durationMins: 340, stops: 1, stopAirport: 'IST' }],
  'TIP-MRS': [{ airline: '7I', baseFlightNo: '7I903', durationMins: 178, stops: 0 }],
  'TIP-FCO': [{ airline: '7I', baseFlightNo: '7I905', durationMins: 148, stops: 0 }],
  'TIP-IST': [{ airline: 'TK', baseFlightNo: 'TK8110', durationMins: 235, stops: 0 }],
  'TIP-DXB': [{ airline: 'EK', baseFlightNo: 'EK780', durationMins: 330, stops: 0 }],
  'BEN-CDG': [{ airline: '7I', baseFlightNo: '7I921', durationMins: 225, stops: 0 }],
  'BEN-IST': [{ airline: 'TK', baseFlightNo: 'TK8120', durationMins: 228, stops: 0 }],
  'BEN-CAI': [{ airline: '7I', baseFlightNo: '7I923', durationMins: 125, stops: 0 }],

  // ── Égypte → Europe ──
  'CAI-CDG': [{ airline: 'MS', baseFlightNo: 'MS800', durationMins: 255, stops: 0 }, { airline: 'AF', baseFlightNo: 'AF1700', durationMins: 255, stops: 0 }, { airline: 'TK', baseFlightNo: 'TK8200', durationMins: 380, stops: 1, stopAirport: 'IST' }],
  'CAI-ORY': [{ airline: 'MS', baseFlightNo: 'MS802', durationMins: 255, stops: 0 }],
  'CAI-LHR': [{ airline: 'MS', baseFlightNo: 'MS804', durationMins: 268, stops: 0 }],
  'CAI-FRA': [{ airline: 'LH', baseFlightNo: 'LH1800', durationMins: 262, stops: 0 }, { airline: 'MS', baseFlightNo: 'MS806', durationMins: 265, stops: 0 }],
  'CAI-IST': [{ airline: 'TK', baseFlightNo: 'TK8210', durationMins: 195, stops: 0 }, { airline: 'MS', baseFlightNo: 'MS808', durationMins: 198, stops: 0 }],
  'CAI-DXB': [{ airline: 'EK', baseFlightNo: 'EK790', durationMins: 215, stops: 0 }, { airline: 'MS', baseFlightNo: 'MS810', durationMins: 220, stops: 0 }],
  'CAI-FCO': [{ airline: 'MS', baseFlightNo: 'MS812', durationMins: 228, stops: 0 }],
  'CAI-AMS': [{ airline: 'KL', baseFlightNo: 'KL2000', durationMins: 268, stops: 0 }],
  'CAI-BCN': [{ airline: 'VY', baseFlightNo: 'VY9800', durationMins: 252, stops: 0 }],
  'CAI-MRS': [{ airline: 'MS', baseFlightNo: 'MS816', durationMins: 245, stops: 0 }],
  'HRG-CDG': [{ airline: 'MS', baseFlightNo: 'MS900', durationMins: 265, stops: 0 }, { airline: 'AF', baseFlightNo: 'AF1800', durationMins: 268, stops: 0 }],
  'HRG-FRA': [{ airline: 'LH', baseFlightNo: 'LH1900', durationMins: 272, stops: 0 }],
  'HRG-LHR': [{ airline: 'MS', baseFlightNo: 'MS902', durationMins: 278, stops: 0 }],
  'HRG-AMS': [{ airline: 'KL', baseFlightNo: 'KL2100', durationMins: 278, stops: 0 }],
  'SSH-CDG': [{ airline: 'MS', baseFlightNo: 'MS920', durationMins: 268, stops: 0 }],
  'SSH-FRA': [{ airline: 'LH', baseFlightNo: 'LH1950', durationMins: 275, stops: 0 }],
  'SSH-LHR': [{ airline: 'MS', baseFlightNo: 'MS922', durationMins: 282, stops: 0 }],
  'SSH-BCN': [{ airline: 'VY', baseFlightNo: 'VY9900', durationMins: 260, stops: 0 }],
  'LXR-CDG': [{ airline: 'MS', baseFlightNo: 'MS940', durationMins: 272, stops: 0 }],
  'LXR-FRA': [{ airline: 'LH', baseFlightNo: 'LH1960', durationMins: 278, stops: 0 }],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function addMinutes(date, minutes) { return new Date(date.getTime() + minutes * 60000); }
function formatTime(date) { return date.toTimeString().slice(0, 5); }
function formatDate(date) { return date.toISOString().slice(0, 10); }
function minutesToDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m > 0 ? m.toString().padStart(2, '0') : '00'}`;
}

function getRouteKey(origin, dest) {
  if (ROUTE_TEMPLATES[`${origin}-${dest}`]) return `${origin}-${dest}`;
  if (ROUTE_TEMPLATES[`${dest}-${origin}`]) return `${dest}-${origin}`;
  return null;
}

// ─── FLIGHT GENERATOR ─────────────────────────────────────────────────────────
function generateFlightsForDate(origin, dest, dateStr, passengers = 1, localCurrencyCode = null) {
  const routeKey = getRouteKey(origin, dest);
  const reversed = routeKey && routeKey.startsWith(dest);
  const templates = routeKey ? ROUTE_TEMPLATES[routeKey] : [];
  if (!templates.length) return [];

  const baseDate = new Date(`${dateStr}T00:00:00`);
  const baseUSD = getBaseUSD(origin, dest);

  // Determine display currency from departure airport country
  const originAirport = AIRPORTS[origin];
  const currencyCode = localCurrencyCode
    || (originAirport ? COUNTRIES[originAirport.countryCode]?.currency : null)
    || 'TND';
  const originCountryCode = originAirport?.countryCode || 'TN';

  const slots = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const flights = [];
  let slotIdx = 0;

  for (const tpl of templates) {
    const departures = randomInRange(1, 2);
    for (let d = 0; d < departures && slotIdx < slots.length; d++, slotIdx++) {
      const deptMins = slots[slotIdx] * 60 + randomInRange(0, 55);
      const deptTime = addMinutes(baseDate, deptMins);
      const arrTime = addMinutes(deptTime, tpl.durationMins);

      const variation = 1 + (Math.random() * 0.4 - 0.2);
      const priceUSD = baseUSD * variation;
      const priceLocal = usdToLocal(priceUSD, originCountryCode);
      const pricePerPax = Math.round(priceLocal.amount * 10) / 10;
      const totalPrice = Math.round(pricePerPax * passengers * 10) / 10;

      const flightNo = reversed
        ? tpl.baseFlightNo.replace(/(\d+)/, (m) => String(parseInt(m, 10) + 1))
        : tpl.baseFlightNo;

      flights.push({
        id: `${flightNo}-${dateStr}-${deptMins}`,
        flightNumber: flightNo,
        airline: AIRLINES[tpl.airline] || { code: tpl.airline, name: tpl.airline },
        origin: AIRPORTS[origin] || { code: origin, city: origin, country: '' },
        destination: AIRPORTS[dest] || { code: dest, city: dest, country: '' },
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
        stops: tpl.stops || 0,
        stopAirports: tpl.stopAirport
          ? [AIRPORTS[tpl.stopAirport] || { code: tpl.stopAirport }]
          : [],
        price: {
          perPax: pricePerPax,
          total: totalPrice,
          currency: priceLocal.currency,
          priceUSD: Math.round(priceUSD * 10) / 10,
        },
        seats: { available: randomInRange(4, 48), total: 189 },
        baggage: { cabin: '10 kg', checked: '23 kg' },
        refundable: Math.random() > 0.5,
        changeable: true,
        affiliateUrl: buildAffiliateUrl(origin, dest, dateStr, tpl.airline),
      });
    }
  }

  return flights.sort((a, b) => a.price.total - b.price.total);
}

function buildAffiliateUrl(origin, dest, date, airlineCode) {
  // Placeholder — replace with real affiliate links (Travelpayouts, Aviasales, etc.)
  const airlineSites = {
    TU: 'tunisair.com', BJ: 'nouvelair.com', AH: 'airalgerie.dz',
    AT: 'royalairmaroc.com', MS: 'egyptair.com', '7I': 'afriqiyah.com',
    LN: 'libyanairlines.com.ly', L6: 'mauritaniaairlines.mr',
    TK: 'turkishairlines.com', AF: 'airfrance.fr', LH: 'lufthansa.com',
    EK: 'emirates.com',
  };
  const site = airlineSites[airlineCode] || 'easyflight.tn/book';
  return `https://${site}/?from=${origin}&to=${dest}&dep=${date}&utm_source=easyflight&utm_medium=affiliate`;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
function searchFlights({ origin, dest, date, returnDate, passengers = 1, tripType = 'ONE_WAY', currency }) {
  const outbound = generateFlightsForDate(origin, dest, date, passengers, currency);
  if (tripType === 'ROUND_TRIP' && returnDate) {
    const inbound = generateFlightsForDate(dest, origin, returnDate, passengers, currency);
    return { outbound, inbound, tripType: 'ROUND_TRIP' };
  }
  return { outbound, inbound: [], tripType: 'ONE_WAY' };
}

function getAirports(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return Object.values(AIRPORTS).slice(0, 20);
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
  const northAfrica = ['TN', 'DZ', 'MA', 'LY', 'MR', 'EG'];
  return northAfrica.map((c) => ({
    ...COUNTRIES[c],
    airports: getAirportsByCountry(c),
  }));
}

module.exports = {
  searchFlights, getAirports, getAirportsByCountry, getCountries,
  AIRPORTS, AIRLINES, COUNTRIES,
};
