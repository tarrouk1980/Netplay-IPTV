'use strict';

/**
 * EASYWAY Taximètre — Tunisian Ministry of Transport 2019 Tariffs
 *
 * Prise en charge fixe : 0.700 TND
 * Tarif km jour (06h–21h) : 0.550 TND/km
 * Tarif km nuit (21h–06h) : 0.825 TND/km
 * Supplément dimanche/férié : +25%
 *
 * Mode A : EASYWAY calculates the fare estimate (estimateFare returns a breakdown)
 * Mode B : Mise en relation only — driver uses physical certified meter (returns null price)
 */

const PRISE_EN_CHARGE = 0.700; // TND
const TARIF_KM_JOUR   = 0.550; // TND/km  (06:00–20:59)
const TARIF_KM_NUIT   = 0.825; // TND/km  (21:00–05:59)
const SUPPLEMENT_DIMANCHE = 0.25; // +25%

// Public holidays in Tunisia (MM-DD format) — standard national holidays
const JOURS_FERIES = new Set([
  '01-01', // Jour de l'An
  '03-20', // Fête de l'Indépendance
  '04-09', // Journée des Martyrs
  '05-01', // Fête du Travail
  '07-25', // Fête de la République
  '08-13', // Fête de la Femme
  '10-15', // Fête de l'Évacuation
]);

/**
 * Haversine formula — great-circle distance between two points.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in km
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determine whether a datetime falls in night tariff window (21:00–05:59).
 * @param {Date} dt
 * @returns {boolean}
 */
function isNight(dt) {
  const h = dt.getHours();
  return h >= 21 || h < 6;
}

/**
 * Determine whether a datetime falls on a Sunday or Tunisian public holiday.
 * @param {Date} dt
 * @returns {boolean}
 */
function isDimancheOrFerie(dt) {
  if (dt.getDay() === 0) return true; // Sunday
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return JOURS_FERIES.has(`${mm}-${dd}`);
}

/**
 * Mode A — Estimate fare with full breakdown.
 *
 * @param {number} originLat
 * @param {number} originLng
 * @param {number} destLat
 * @param {number} destLng
 * @param {Date|string} datetime — when the ride starts (defaults to now)
 * @returns {{
 *   distanceKm: number,
 *   estimatedFare: number,
 *   breakdown: {
 *     priseEnCharge: number,
 *     tarifKmApplied: number,
 *     distanceKm: number,
 *     tarifDistance: number,
 *     supplementNuit: boolean,
 *     supplementDimanche: boolean,
 *     supplementAmount: number,
 *     total: number,
 *     tariff: 'JOUR'|'NUIT',
 *   }
 * }}
 */
function estimateFare(originLat, originLng, destLat, destLng, datetime = new Date()) {
  const dt = datetime instanceof Date ? datetime : new Date(datetime);

  const distanceKm = haversineKm(originLat, originLng, destLat, destLng);

  const nuit = isNight(dt);
  const dimanche = isDimancheOrFerie(dt);

  const tarifKmApplied = nuit ? TARIF_KM_NUIT : TARIF_KM_JOUR;
  const tarifDistance = parseFloat((distanceKm * tarifKmApplied).toFixed(3));

  let subtotal = PRISE_EN_CHARGE + tarifDistance;
  let supplementAmount = 0;

  if (dimanche) {
    supplementAmount = parseFloat((subtotal * SUPPLEMENT_DIMANCHE).toFixed(3));
    subtotal = parseFloat((subtotal + supplementAmount).toFixed(3));
  }

  const total = parseFloat(subtotal.toFixed(3));

  return {
    distanceKm: parseFloat(distanceKm.toFixed(3)),
    estimatedFare: total,
    breakdown: {
      priseEnCharge: PRISE_EN_CHARGE,
      tarifKmApplied,
      distanceKm: parseFloat(distanceKm.toFixed(3)),
      tarifDistance,
      supplementNuit: nuit,
      supplementDimanche: dimanche,
      supplementAmount,
      total,
      tariff: nuit ? 'NUIT' : 'JOUR',
    },
  };
}

/**
 * Mode B — Mise en relation only.
 * Driver will trigger their physical certified meter.
 * Returns null price to signal that EASYWAY does not set the fare.
 *
 * @param {number} originLat
 * @param {number} originLng
 * @param {number} destLat
 * @param {number} destLng
 * @returns {{ distanceKm: number, estimatedFare: null, mode: 'B' }}
 */
function modeB(originLat, originLng, destLat, destLng) {
  const distanceKm = parseFloat(haversineKm(originLat, originLng, destLat, destLng).toFixed(3));
  return {
    distanceKm,
    estimatedFare: null,
    mode: 'B',
  };
}

module.exports = {
  estimateFare,
  modeB,
  haversineKm,
  isNight,
  isDimancheOrFerie,
  PRISE_EN_CHARGE,
  TARIF_KM_JOUR,
  TARIF_KM_NUIT,
  SUPPLEMENT_DIMANCHE,
};
