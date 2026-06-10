'use strict';

// Airports database (Tunisia + major MENA/Europe destinations)
const AIRPORTS = {
  TUN: { code: 'TUN', name: 'Tunis-Carthage', city: 'Tunis', country: 'Tunisie', timezone: 'Africa/Tunis' },
  SFA: { code: 'SFA', name: 'Aéroport de Sfax-Thyna', city: 'Sfax', country: 'Tunisie', timezone: 'Africa/Tunis' },
  MIR: { code: 'MIR', name: 'Aéroport de Monastir-Habib Bourguiba', city: 'Monastir', country: 'Tunisie', timezone: 'Africa/Tunis' },
  DJE: { code: 'DJE', name: 'Aéroport de Djerba-Zarzis', city: 'Djerba', country: 'Tunisie', timezone: 'Africa/Tunis' },
  TOE: { code: 'TOE', name: 'Aéroport de Tozeur-Nefta', city: 'Tozeur', country: 'Tunisie', timezone: 'Africa/Tunis' },
  CDG: { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  LYS: { code: 'LYS', name: 'Lyon-Saint Exupéry', city: 'Lyon', country: 'France', timezone: 'Europe/Paris' },
  MRS: { code: 'MRS', name: 'Marseille-Provence', city: 'Marseille', country: 'France', timezone: 'Europe/Paris' },
  ORY: { code: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  FRA: { code: 'FRA', name: 'Francfort', city: 'Francfort', country: 'Allemagne', timezone: 'Europe/Berlin' },
  FCO: { code: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'Italie', timezone: 'Europe/Rome' },
  IST: { code: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turquie', timezone: 'Europe/Istanbul' },
  DXB: { code: 'DXB', name: 'Dubaï International', city: 'Dubaï', country: 'EAU', timezone: 'Asia/Dubai' },
  CAI: { code: 'CAI', name: 'Le Caire', city: 'Le Caire', country: 'Égypte', timezone: 'Africa/Cairo' },
  CMN: { code: 'CMN', name: 'Casablanca Mohammed V', city: 'Casablanca', country: 'Maroc', timezone: 'Africa/Casablanca' },
  ALG: { code: 'ALG', name: 'Alger Houari Boumediene', city: 'Alger', country: 'Algérie', timezone: 'Africa/Algiers' },
  BCN: { code: 'BCN', name: 'Barcelone El Prat', city: 'Barcelone', country: 'Espagne', timezone: 'Europe/Madrid' },
  AMS: { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Pays-Bas', timezone: 'Europe/Amsterdam' },
  LHR: { code: 'LHR', name: 'Londres Heathrow', city: 'Londres', country: 'Royaume-Uni', timezone: 'Europe/London' },
};

const AIRLINES = {
  TU: { code: 'TU', name: 'Tunisair', logo: 'tunisair', color: '#C8102E' },
  BJ: { code: 'BJ', name: 'Nouvelair', logo: 'nouvelair', color: '#FF6B00' },
  UG: { code: 'UG', name: 'Tunisair Express', logo: 'tunisair_express', color: '#C8102E' },
  PC: { code: 'PC', name: 'Pegasus Airlines', logo: 'pegasus', color: '#F26522' },
  TK: { code: 'TK', name: 'Turkish Airlines', logo: 'turkish', color: '#C8102E' },
  AF: { code: 'AF', name: 'Air France', logo: 'airfrance', color: '#002395' },
  LH: { code: 'LH', name: 'Lufthansa', logo: 'lufthansa', color: '#05164D' },
  IB: { code: 'IB', name: 'Iberia', logo: 'iberia', color: '#C00B1D' },
  KL: { code: 'KL', name: 'KLM', logo: 'klm', color: '#00A1DE' },
  VY: { code: 'VY', name: 'Vueling', logo: 'vueling', color: '#FFD700' },
  '6H': { code: '6H', name: 'Israir', logo: 'israir', color: '#1B5E20' },
  MS: { code: 'MS', name: 'EgyptAir', logo: 'egyptair', color: '#1A3A6B' },
  AT: { code: 'AT', name: 'Royal Air Maroc', logo: 'ram', color: '#006233' },
  EK: { code: 'EK', name: 'Emirates', logo: 'emirates', color: '#C8102E' },
};

// Base prices matrix (TND) for common routes
const BASE_PRICES = {
  'TUN-CDG': 450, 'TUN-ORY': 420, 'TUN-LYS': 390, 'TUN-MRS': 370,
  'TUN-FRA': 480, 'TUN-FCO': 340, 'TUN-IST': 380, 'TUN-DXB': 620,
  'TUN-CAI': 310, 'TUN-CMN': 280, 'TUN-ALG': 220, 'TUN-BCN': 360,
  'TUN-AMS': 500, 'TUN-LHR': 560, 'DJE-CDG': 430, 'DJE-ORY': 410,
  'DJE-LYS': 380, 'DJE-MRS': 360, 'MIR-CDG': 420, 'MIR-ORY': 400,
  'MIR-MRS': 350, 'SFA-TUN': 120, 'TOE-TUN': 140,
};

function getBasePrice(origin, dest) {
  return BASE_PRICES[`${origin}-${dest}`]
    || BASE_PRICES[`${dest}-${origin}`]
    || 350;
}

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function minutesToDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m > 0 ? m.toString().padStart(2, '0') : '00'}`;
}

// Route definitions: origin → dest → [{ airline, flightNo, durationMins, stops }]
const ROUTE_TEMPLATES = {
  'TUN-CDG': [
    { airline: 'TU', flightNo: 'TU706', durationMins: 175, stops: 0 },
    { airline: 'AF', flightNo: 'AF1284', durationMins: 175, stops: 0 },
    { airline: 'TK', flightNo: 'TK7886', durationMins: 310, stops: 1, stopAirport: 'IST' },
  ],
  'TUN-ORY': [
    { airline: 'TU', flightNo: 'TU742', durationMins: 175, stops: 0 },
    { airline: 'BJ', flightNo: 'BJ507', durationMins: 175, stops: 0 },
    { airline: 'VY', flightNo: 'VY8840', durationMins: 195, stops: 0 },
  ],
  'TUN-LYS': [
    { airline: 'TU', flightNo: 'TU728', durationMins: 165, stops: 0 },
    { airline: 'BJ', flightNo: 'BJ521', durationMins: 170, stops: 0 },
  ],
  'TUN-MRS': [
    { airline: 'BJ', flightNo: 'BJ519', durationMins: 155, stops: 0 },
    { airline: 'TU', flightNo: 'TU758', durationMins: 160, stops: 0 },
  ],
  'TUN-FRA': [
    { airline: 'LH', flightNo: 'LH1424', durationMins: 205, stops: 0 },
    { airline: 'TU', flightNo: 'TU770', durationMins: 200, stops: 0 },
    { airline: 'TK', flightNo: 'TK7850', durationMins: 330, stops: 1, stopAirport: 'IST' },
  ],
  'TUN-FCO': [
    { airline: 'TU', flightNo: 'TU782', durationMins: 130, stops: 0 },
    { airline: 'IB', flightNo: 'IB3244', durationMins: 145, stops: 0 },
  ],
  'TUN-IST': [
    { airline: 'TK', flightNo: 'TK781', durationMins: 215, stops: 0 },
    { airline: 'PC', flightNo: 'PC1402', durationMins: 220, stops: 0 },
  ],
  'TUN-DXB': [
    { airline: 'EK', flightNo: 'EK751', durationMins: 340, stops: 0 },
    { airline: 'TK', flightNo: 'TK1786', durationMins: 480, stops: 1, stopAirport: 'IST' },
  ],
  'TUN-CAI': [
    { airline: 'MS', flightNo: 'MS751', durationMins: 165, stops: 0 },
    { airline: 'TU', flightNo: 'TU880', durationMins: 170, stops: 0 },
  ],
  'TUN-CMN': [
    { airline: 'AT', flightNo: 'AT805', durationMins: 155, stops: 0 },
    { airline: 'TU', flightNo: 'TU850', durationMins: 160, stops: 0 },
  ],
  'TUN-ALG': [
    { airline: 'TU', flightNo: 'TU830', durationMins: 90, stops: 0 },
  ],
  'TUN-BCN': [
    { airline: 'VY', flightNo: 'VY8812', durationMins: 155, stops: 0 },
    { airline: 'TU', flightNo: 'TU774', durationMins: 160, stops: 0 },
  ],
  'TUN-AMS': [
    { airline: 'KL', flightNo: 'KL1614', durationMins: 215, stops: 0 },
    { airline: 'TU', flightNo: 'TU790', durationMins: 215, stops: 0 },
  ],
  'TUN-LHR': [
    { airline: 'TU', flightNo: 'TU814', durationMins: 240, stops: 0 },
    { airline: 'TK', flightNo: 'TK7828', durationMins: 390, stops: 1, stopAirport: 'IST' },
  ],
  'DJE-CDG': [
    { airline: 'TU', flightNo: 'TU904', durationMins: 185, stops: 0 },
    { airline: 'BJ', flightNo: 'BJ541', durationMins: 180, stops: 0 },
  ],
  'DJE-ORY': [
    { airline: 'BJ', flightNo: 'BJ543', durationMins: 180, stops: 0 },
    { airline: 'TU', flightNo: 'TU908', durationMins: 185, stops: 0 },
  ],
  'DJE-MRS': [
    { airline: 'BJ', flightNo: 'BJ547', durationMins: 160, stops: 0 },
  ],
  'MIR-CDG': [
    { airline: 'TU', flightNo: 'TU954', durationMins: 180, stops: 0 },
    { airline: 'BJ', flightNo: 'BJ561', durationMins: 175, stops: 0 },
  ],
  'MIR-ORY': [
    { airline: 'BJ', flightNo: 'BJ563', durationMins: 175, stops: 0 },
  ],
  'MIR-MRS': [
    { airline: 'BJ', flightNo: 'BJ567', durationMins: 155, stops: 0 },
  ],
};

function getRouteKey(origin, dest) {
  if (ROUTE_TEMPLATES[`${origin}-${dest}`]) return `${origin}-${dest}`;
  if (ROUTE_TEMPLATES[`${dest}-${origin}`]) return `${dest}-${origin}`;
  return null;
}

function generateFlightsForDate(origin, dest, dateStr, passengers = 1) {
  const routeKey = getRouteKey(origin, dest);
  const reversed = routeKey && routeKey.startsWith(dest);
  const templates = routeKey ? ROUTE_TEMPLATES[routeKey] : [];

  if (!templates.length) return [];

  const baseDate = new Date(`${dateStr}T00:00:00`);
  const basePrice = getBasePrice(origin, dest);

  // Departure slots (hour offsets from midnight)
  const slots = [6, 8, 10, 12, 14, 16, 18, 20];

  const flights = [];
  let slotIdx = 0;

  for (const tpl of templates) {
    // Possibly 1-2 departures per template
    const departures = randomInRange(1, 2);
    for (let d = 0; d < departures && slotIdx < slots.length; d++, slotIdx++) {
      const deptMins = slots[slotIdx] * 60 + randomInRange(0, 45);
      const deptTime = addMinutes(baseDate, deptMins);
      const arrTime = addMinutes(deptTime, tpl.durationMins);

      // Price variation ±20%
      const variation = 1 + (Math.random() * 0.4 - 0.2);
      const pricePerPax = Math.round(basePrice * variation * 10) / 10;
      const totalPrice = Math.round(pricePerPax * passengers * 10) / 10;

      const flightNo = reversed
        ? tpl.flightNo.replace(/(\d+)/, (m) => String(parseInt(m, 10) + 1))
        : tpl.flightNo;

      flights.push({
        id: `${flightNo}-${dateStr}-${deptMins}`,
        flightNumber: flightNo,
        airline: AIRLINES[tpl.airline] || { code: tpl.airline, name: tpl.airline },
        origin: AIRPORTS[origin] || { code: origin },
        destination: AIRPORTS[dest] || { code: dest },
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
        stopAirports: tpl.stopAirport ? [AIRPORTS[tpl.stopAirport] || { code: tpl.stopAirport }] : [],
        price: {
          perPax: pricePerPax,
          total: totalPrice,
          currency: 'TND',
          cabin: 'ECONOMY',
        },
        seats: {
          available: randomInRange(5, 45),
          total: 189,
        },
        baggage: {
          cabin: '10 kg',
          checked: '23 kg',
        },
        amenities: ['wifi', 'meal'].filter(() => Math.random() > 0.5),
        refundable: Math.random() > 0.5,
        changeable: true,
      });
    }
  }

  // Sort by price
  return flights.sort((a, b) => a.price.total - b.price.total);
}

function searchFlights({ origin, dest, date, returnDate, passengers = 1, tripType = 'ONE_WAY' }) {
  const outbound = generateFlightsForDate(origin, dest, date, passengers);

  if (tripType === 'ROUND_TRIP' && returnDate) {
    const inbound = generateFlightsForDate(dest, origin, returnDate, passengers);
    return { outbound, inbound, tripType: 'ROUND_TRIP' };
  }

  return { outbound, inbound: [], tripType: 'ONE_WAY' };
}

function getAirports(query) {
  const q = (query || '').toLowerCase();
  return Object.values(AIRPORTS).filter(
    (a) => a.code.toLowerCase().includes(q)
      || a.city.toLowerCase().includes(q)
      || a.name.toLowerCase().includes(q)
      || a.country.toLowerCase().includes(q),
  );
}

module.exports = { searchFlights, getAirports, AIRPORTS, AIRLINES };
