'use strict';
const axios = require('axios');

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
const ROAD_FACTOR = 1.35; // fallback if API unavailable

async function getRoadDistanceKm(fromLat, fromLng, toLat, toLng) {
  if (!MAPBOX_TOKEN) {
    // Haversine fallback
    return haversine(fromLat, fromLng, toLat, toLng) * ROAD_FACTOR;
  }
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}`;
    const { data } = await axios.get(url, {
      params: { access_token: MAPBOX_TOKEN, geometries: 'geojson', overview: 'false' },
      timeout: 3000,
    });
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].distance / 1000; // meters → km
    }
  } catch (err) {
    console.warn('[Mapbox] Fallback to haversine:', err.message);
  }
  return haversine(fromLat, fromLng, toLat, toLng) * ROAD_FACTOR;
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

module.exports = { getRoadDistanceKm };
