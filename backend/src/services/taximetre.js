'use strict';

/**
 * EASYWAY Taximètre — Tarifs officiels Tunisie Décret Décembre 2022
 *
 * Prise en charge fixe : 0.900 TND
 *
 * Compteur en mouvement :
 *   Jour  (05h–20h59) : 0.046 TND par 79 mètres parcourus  ≈ 0.582 TND/km
 *   Nuit  (21h–04h59) : 0.069 TND par 79 mètres parcourus  ≈ 0.873 TND/km  (+50%)
 *
 * Compteur à l'arrêt (embouteillage, feu rouge, attente) :
 *   Jour  : 0.046 TND par 18 secondes  ≈ 0.153 TND/min
 *   Nuit  : 0.069 TND par 18 secondes  ≈ 0.230 TND/min  (+50%)
 *
 * Supplément aéroport Tunis : +4.500 TND fixe
 * Bagages > 10 kg           : +1.000 TND par pièce
 *
 * Mode A : EASYWAY calcule l'estimation (prix indicatif, compteur physique fait foi)
 * Mode B : Mise en relation pure — chauffeur déclenche son compteur homologué
 */

// ── Tarifs de base ──────────────────────────────────────────────────────────
const PRISE_EN_CHARGE        = 0.900;  // TND
const INCREMENT_METRES       = 79;     // mètres par incrément
const INCREMENT_TND_JOUR     = 0.046;  // TND par incrément (mouvement jour)
const INCREMENT_TND_NUIT     = 0.069;  // TND par incrément (mouvement nuit = +50%)
const ARRET_SECONDES         = 18;     // secondes par incrément à l'arrêt
const ARRET_TND_JOUR         = 0.046;  // TND par incrément (arrêt jour)
const ARRET_TND_NUIT         = 0.069;  // TND par incrément (arrêt nuit = +50%)
const SUPPLEMENT_AEROPORT    = 4.500;  // TND fixe depuis aéroport Tunis
const SUPPLEMENT_BAGAGE      = 1.000;  // TND par pièce > 10 kg
const MAJORATION_NUIT        = 1.50;   // +50%

// Dérivés utiles pour estimation
const TARIF_KM_JOUR = (INCREMENT_TND_JOUR / INCREMENT_METRES) * 1000; // ≈ 0.582 TND/km
const TARIF_KM_NUIT = (INCREMENT_TND_NUIT / INCREMENT_METRES) * 1000; // ≈ 0.873 TND/km
const TARIF_MIN_JOUR = (ARRET_TND_JOUR / ARRET_SECONDES) * 60;        // ≈ 0.153 TND/min
const TARIF_MIN_NUIT = (ARRET_TND_NUIT / ARRET_SECONDES) * 60;        // ≈ 0.230 TND/min

// Jours fériés tunisiens (MM-DD)
const JOURS_FERIES = new Set([
  '01-01', // Jour de l'An
  '03-20', // Fête de l'Indépendance
  '04-09', // Journée des Martyrs
  '05-01', // Fête du Travail
  '07-25', // Fête de la République
  '08-13', // Fête de la Femme
  '10-15', // Fête de l'Évacuation
]);

// ── Helpers ─────────────────────────────────────────────────────────────────

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isNight(dt) {
  const h = dt.getHours();
  return h >= 21 || h < 5;
}

function isDimancheOrFerie(dt) {
  if (dt.getDay() === 0) return true;
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return JOURS_FERIES.has(`${mm}-${dd}`);
}

/**
 * Simule le comportement exact d'un compteur taximètre physique homologué.
 *
 * Le compteur avance de 0.046 TND (jour) ou 0.069 TND (nuit) :
 *   - tous les 79 mètres quand le véhicule roule
 *   - toutes les 18 secondes quand le véhicule est à l'arrêt
 *
 * @param {number} distanceKm   — distance réelle par route (Mapbox Directions recommandé)
 * @param {number} dureeMin     — durée estimée du trajet en minutes (inclut arrêts)
 * @param {number} arretMin     — minutes estimées à l'arrêt (embouteillages, feux)
 * @param {Date}   datetime
 * @param {Object} options      — { airport: bool, bagages: number }
 * @returns {Object}
 */
function simulerCompteur(distanceKm, dureeMin, arretMin = 0, datetime = new Date(), options = {}) {
  const dt = datetime instanceof Date ? datetime : new Date(datetime);
  const nuit = isNight(dt);

  const tarifKm  = nuit ? TARIF_KM_NUIT  : TARIF_KM_JOUR;
  const tarifMin = nuit ? TARIF_MIN_NUIT : TARIF_MIN_JOUR;

  // Distance parcourue (en mouvement)
  const distanceEnMouvement = Math.max(0, distanceKm);
  const tarifDistance = parseFloat((distanceEnMouvement * tarifKm).toFixed(3));

  // Temps à l'arrêt
  const tarifArret = parseFloat((arretMin * tarifMin).toFixed(3));

  let subtotal = PRISE_EN_CHARGE + tarifDistance + tarifArret;

  // Suppléments
  const supplementAeroport = options.airport ? SUPPLEMENT_AEROPORT : 0;
  const supplementBagages  = options.bagages  ? options.bagages * SUPPLEMENT_BAGAGE : 0;

  subtotal = parseFloat((subtotal + supplementAeroport + supplementBagages).toFixed(3));
  const total = parseFloat(subtotal.toFixed(3));

  return {
    distanceKm:        parseFloat(distanceKm.toFixed(3)),
    dureeMin:          parseFloat(dureeMin.toFixed(1)),
    arretMin:          parseFloat(arretMin.toFixed(1)),
    estimatedFare:     total,
    tariff:            nuit ? 'NUIT' : 'JOUR',
    breakdown: {
      priseEnCharge:       PRISE_EN_CHARGE,
      tarifKmApplied:      parseFloat(tarifKm.toFixed(4)),
      tarifDistance,
      tarifMinApplied:     parseFloat(tarifMin.toFixed(4)),
      tarifArret,
      supplementNuit:      nuit,
      supplementAeroport,
      supplementBagages,
      total,
    },
    legal: 'Prix indicatif. Le compteur physique homologué fait foi en Tunisie.',
  };
}

/**
 * Mode A — Estimation rapide (sans durée d'arrêt connue).
 * Utilise un ratio standard d'arrêt de 20% du temps total en ville.
 *
 * NOTE: Pour une précision maximale, utiliser Mapbox Directions API
 * pour obtenir distanceKm et dureeMin réels par route.
 * // TODO: Remplacer haversineKm par appel Mapbox Directions API
 * // mapbox.com/pricing — gratuit jusqu'à 100 000 req/mois
 */
function estimateFare(originLat, originLng, destLat, destLng, datetime = new Date(), options = {}) {
  const dt = datetime instanceof Date ? datetime : new Date(datetime);

  // Distance à vol d'oiseau × 1.35 (facteur route urbaine tunisienne)
  const distanceKm = parseFloat((haversineKm(originLat, originLng, destLat, destLng) * 1.35).toFixed(3));

  // Estimation durée : vitesse moyenne 25 km/h en ville
  const dureeMin   = parseFloat(((distanceKm / 25) * 60).toFixed(1));
  // Estimation arrêt : 20% du temps total (embouteillages, feux)
  const arretMin   = parseFloat((dureeMin * 0.20).toFixed(1));

  return simulerCompteur(distanceKm, dureeMin, arretMin, dt, options);
}

/**
 * Mode B — Mise en relation pure.
 * Le chauffeur déclenche son compteur physique homologué.
 */
function modeB(originLat, originLng, destLat, destLng) {
  const distanceKm = parseFloat((haversineKm(originLat, originLng, destLat, destLng) * 1.35).toFixed(3));
  return {
    distanceKm,
    estimatedFare: null,
    mode: 'B',
    message: 'Le chauffeur déclenchera son compteur physique homologué. Prix affiché sur le compteur.',
  };
}

module.exports = {
  estimateFare,
  simulerCompteur,
  modeB,
  haversineKm,
  isNight,
  isDimancheOrFerie,
  PRISE_EN_CHARGE,
  TARIF_KM_JOUR,
  TARIF_KM_NUIT,
  TARIF_MIN_JOUR,
  TARIF_MIN_NUIT,
  SUPPLEMENT_AEROPORT,
  SUPPLEMENT_BAGAGE,
  MAJORATION_NUIT,
};
