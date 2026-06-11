// Implémentation locale de tous les endpoints de l'API EasyTravel.
// Utilisée quand le backend est injoignable (APK autonome, démo hors-ligne,
// téléphone sur un autre réseau que le PC de dev).
// Les générateurs sont les mêmes que ceux du backend (copiés depuis
// backend/src/services/).

import {
  searchFlights, getAirports, AIRPORTS,
} from './offline/flightSearch';
import {
  searchFerries, getPorts, getPopularFerryRoutes,
} from './offline/ferrySearch';

export function offlineFlightSearch({ origin, dest, date, returnDate, passengers = 1, tripType = 'ONE_WAY' }) {
  return searchFlights({
    origin, dest, date, returnDate, passengers: Number(passengers), tripType,
  });
}

export function offlineAirports(q) {
  return { airports: getAirports(q) };
}

export function offlineCalendar({ origin, dest, month, passengers = 1 }) {
  const [year, m] = month.split('-').map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();
  const days = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${month}-${String(d).padStart(2, '0')}`;
    const result = searchFlights({ origin, dest, date: dateStr, passengers: Number(passengers) });
    if (result.outbound.length > 0) {
      const cheapest = result.outbound[0];
      days[dateStr] = {
        price:    cheapest.price.total,
        currency: cheapest.price.currency,
        count:    result.outbound.length,
      };
    }
  }

  const prices = Object.values(days).map((x) => x.price);
  const sorted = [...prices].sort((a, b) => a - b);
  const p33 = sorted[Math.floor(sorted.length * 0.33)] || 0;
  const p66 = sorted[Math.floor(sorted.length * 0.66)] || 0;
  Object.keys(days).forEach((k) => {
    const p = days[k].price;
    days[k].level = p <= p33 ? 'LOW' : p <= p66 ? 'MED' : 'HIGH';
  });

  return { month, origin, dest, days };
}

export function offlineInspire({ origin, date, budget }) {
  const destinations = [];
  for (const airport of Object.values(AIRPORTS)) {
    if (airport.code === origin) continue;
    const result = searchFlights({ origin, dest: airport.code, date, passengers: 1 });
    if (result.outbound.length > 0) {
      const cheapest = result.outbound[0];
      if (!budget || cheapest.price.total <= Number(budget)) {
        destinations.push({
          code:     airport.code,
          city:     airport.city,
          country:  airport.country,
          price:    cheapest.price.total,
          currency: cheapest.price.currency,
          duration: cheapest.duration,
          airline:  cheapest.airline,
        });
      }
    }
  }
  destinations.sort((a, b) => a.price - b.price);
  return { origin, date, destinations: destinations.slice(0, 20) };
}

export function offlineTrend({ origin, dest }) {
  const prices = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().slice(0, 10);
    const result = searchFlights({ origin, dest, date: dateStr, passengers: 1 });
    if (result.outbound.length > 0) {
      prices.push({ date: dateStr, price: result.outbound[0].price.total, currency: result.outbound[0].price.currency });
    }
  }
  const vals = prices.map((p) => p.price);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  const trend = vals.length > 5 && vals[vals.length - 1] > vals[0] ? 'UP' : 'DOWN';
  return { origin, dest, prices, stats: { min, max, avg: Math.round(avg), trend } };
}

export function offlineFerrySearch({ originPort, destPort, date, passengers = 1 }) {
  const ferries = searchFerries({ originPort, destPort, date, passengers: Number(passengers) });
  return { ferries, count: ferries.length };
}

export function offlinePorts(q) {
  return { ports: getPorts(q) };
}

export function offlineFerryRoutes() {
  return { routes: getPopularFerryRoutes() };
}
