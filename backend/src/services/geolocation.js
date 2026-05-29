'use strict';

const { redisClient } = require('../config/redis');

/**
 * Update a provider's geo position.
 * @param {string} userId
 * @param {number} lat
 * @param {number} lng
 * @param {string} serviceType - e.g. 'TAXI', 'SOS', 'DELIVERY', 'GROCERY'
 */
async function updatePosition(userId, lat, lng, serviceType) {
  const key = `geo:${serviceType.toLowerCase()}`;
  // GEOADD key lng lat member
  await redisClient.geoadd(key, lng, lat, userId);
}

/**
 * Find nearby providers within radius km.
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusKm
 * @param {string} serviceType
 * @returns {Promise<Array<{userId, distance, lat, lng}>>}
 */
async function findNearby(lat, lng, radiusKm, serviceType) {
  const key = `geo:${serviceType.toLowerCase()}`;

  // GEORADIUS key lng lat radius km WITHCOORD WITHDIST COUNT 20 ASC
  const results = await redisClient.georadius(
    key,
    lng,
    lat,
    radiusKm,
    'km',
    'WITHCOORD',
    'WITHDIST',
    'COUNT',
    20,
    'ASC'
  );

  if (!results || results.length === 0) return [];

  return results.map((entry) => {
    // entry format: [member, distance, [lng, lat]]
    const [userId, distance, coords] = entry;
    return {
      userId,
      distance: parseFloat(distance),
      lng: parseFloat(coords[0]),
      lat: parseFloat(coords[1]),
    };
  });
}

module.exports = { updatePosition, findNearby };
