const BASE_RATE = 25.0;
const RATE_PER_KM = 3.5;
const BATTERY_FLAT_RATE = 15.0;
const FUEL_FLAT_RATE = 10.0;
const KEYS_FLAT_RATE = 20.0;
const NIGHT_SURCHARGE = 1.3;
const ACCIDENT_SURCHARGE = 1.5;

export function estimateSOSPrice(distanceKm, vehicleState = {}, datetime = new Date()) {
  const { battery, fuel, keysLocked, accident } = vehicleState;
  const hour = datetime.getHours();
  const isNight = hour >= 21 || hour < 6;
  const surcharges = {};

  let baseRate = BASE_RATE;
  let distanceCost = 0;
  let total;

  if (battery && !fuel && !keysLocked) {
    baseRate = BATTERY_FLAT_RATE;
    distanceCost = parseFloat((distanceKm * RATE_PER_KM).toFixed(3));
    total = baseRate + distanceCost;
  } else if (fuel && !battery && !keysLocked) {
    baseRate = FUEL_FLAT_RATE;
    total = FUEL_FLAT_RATE;
  } else if (keysLocked && !battery && !fuel) {
    baseRate = KEYS_FLAT_RATE;
    total = KEYS_FLAT_RATE;
  } else {
    distanceCost = parseFloat((distanceKm * RATE_PER_KM).toFixed(3));
    total = BASE_RATE + distanceCost;
  }

  let multiplier = 1;
  if (isNight) { surcharges.night = NIGHT_SURCHARGE; multiplier *= NIGHT_SURCHARGE; }
  if (accident) { surcharges.accident = ACCIDENT_SURCHARGE; multiplier *= ACCIDENT_SURCHARGE; }
  if (multiplier !== 1) total = parseFloat((total * multiplier).toFixed(3));

  return { baseRate, distanceCost, surcharges, total: parseFloat(total.toFixed(3)), currency: 'TND' };
}
