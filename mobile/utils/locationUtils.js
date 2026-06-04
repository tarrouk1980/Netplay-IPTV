import * as Location from 'expo-location';

/**
 * Reverse geocode coordinates to a human-readable address.
 * 1st try: Expo Location reverseGeocodeAsync
 * 2nd try: Nominatim OpenStreetMap (works well in Tunisia)
 * Fallback: raw coordinates
 */
export async function reverseGeocode(lat, lng) {
  // Try Expo built-in first
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (results && results.length > 0) {
      const g = results[0];
      const parts = [g.street, g.district, g.city || g.subregion].filter(Boolean);
      if (parts.length >= 2) return parts.join(', ');
    }
  } catch {}

  // Fallback: Nominatim (works in TN where Expo coverage is sparse)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      { headers: { 'User-Agent': 'EASYWAY-App/1.0' }, timeout: 5000 }
    );
    const data = await res.json();
    if (data?.display_name) {
      const addr = data.address || {};
      const parts = [
        addr.road || addr.pedestrian,
        addr.suburb || addr.neighbourhood || addr.quarter,
        addr.city || addr.town || addr.village || addr.county,
      ].filter(Boolean);
      if (parts.length > 0) return parts.slice(0, 3).join(', ');
      return data.display_name.split(',').slice(0, 2).join(',').trim();
    }
  } catch {}

  return `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
}

/**
 * Request location permissions, get current position, and reverse geocode.
 * Returns { coords: {lat, lng}, address: string } or null if permission denied.
 */
export async function getCurrentLocationWithAddress() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const address = await reverseGeocode(lat, lng);
    return { coords: { lat, lng }, address };
  } catch {
    return null;
  }
}

/**
 * Mapbox forward geocoding autocomplete (focused on Tunisia).
 * Returns array of { id, name, fullName, coords: {lat, lng} }
 */
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWFzeXdheXRhcmVrIiwiYSI6ImNtcHNuaGJ1ODBoc2Qyc3FxenU0aGFvd3QifQ.K-z5zbFtY8v5lyMUn7TryQ';

export async function geocodeAutocomplete(text, proximityCoords = null) {
  if (!text || text.length < 2) return [];
  try {
    const proximity = proximityCoords
      ? `&proximity=${proximityCoords.lng},${proximityCoords.lat}`
      : '';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?country=TN&language=fr&limit=6&access_token=${MAPBOX_TOKEN}${proximity}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.features) return [];
    return data.features.map(f => ({
      id: f.id,
      name: f.text,
      fullName: f.place_name,
      coords: { lng: f.center[0], lat: f.center[1] },
    }));
  } catch {
    return [];
  }
}
