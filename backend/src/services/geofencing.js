'use strict';
/**
 * Geofencing — définit les zones de couverture par service.
 * Chaque zone est un cercle (lat, lng, radiusKm).
 * Zones multiples = union (couverts si dans au moins une zone).
 */

const COVERAGE_ZONES = {
  TAXI: [
    { name: 'Grand Tunis', lat: 36.8065, lng: 10.1815, radiusKm: 30 },
    { name: 'Sfax', lat: 34.7400, lng: 10.7600, radiusKm: 20 },
    { name: 'Sousse', lat: 35.8256, lng: 10.6369, radiusKm: 20 },
    { name: 'Nabeul', lat: 36.4561, lng: 10.7376, radiusKm: 15 },
    { name: 'Bizerte', lat: 37.2744, lng: 9.8739, radiusKm: 15 },
  ],
  SOS: [
    { name: 'Tunisie entière', lat: 33.8869, lng: 9.5375, radiusKm: 600 },
  ],
  DELIVERY: [
    { name: 'Grand Tunis', lat: 36.8065, lng: 10.1815, radiusKm: 25 },
    { name: 'Sfax', lat: 34.7400, lng: 10.7600, radiusKm: 15 },
    { name: 'Sousse', lat: 35.8256, lng: 10.6369, radiusKm: 15 },
  ],
  GROCERY: [
    { name: 'Grand Tunis', lat: 36.8065, lng: 10.1815, radiusKm: 20 },
    { name: 'Sfax', lat: 34.7400, lng: 10.7600, radiusKm: 12 },
  ],
};

// Haversine distance in km
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Check if a coordinate is covered for a given service.
 * Returns { covered: boolean, zone: string|null }
 */
function isCovered(lat, lng, serviceType) {
  const zones = COVERAGE_ZONES[serviceType];
  if (!zones) return { covered: true, zone: 'global' }; // unknown service: allow

  for (const zone of zones) {
    if (distanceKm(lat, lng, zone.lat, zone.lng) <= zone.radiusKm) {
      return { covered: true, zone: zone.name };
    }
  }
  return { covered: false, zone: null };
}

/**
 * Get all zones for a service (for display in app).
 */
function getZones(serviceType) {
  return COVERAGE_ZONES[serviceType] || [];
}

/**
 * Express middleware — reads lat/lng from body, checks coverage.
 * Rejects if outside coverage zone.
 */
function requireCoverage(serviceType) {
  return (req, res, next) => {
    const lat = parseFloat(req.body.pickupLat || req.body.lat || req.query.lat);
    const lng = parseFloat(req.body.pickupLng || req.body.lng || req.query.lng);

    if (isNaN(lat) || isNaN(lng)) return next(); // no coords: skip check

    const { covered, zone } = isCovered(lat, lng, serviceType);
    if (!covered) {
      return res.status(422).json({
        error: 'Zone non couverte',
        code: 'OUT_OF_COVERAGE',
        message: `Le service ${serviceType} n'est pas encore disponible dans votre zone. Nous développons notre réseau !`,
      });
    }
    req.coverageZone = zone;
    next();
  };
}

module.exports = { isCovered, getZones, requireCoverage };
