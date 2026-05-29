'use strict';

const BASE_RATE = 25.000;
const RATE_PER_KM = 3.500;
const BATTERY_FLAT_RATE = 15.000;
const FUEL_FLAT_RATE = 10.000;
const KEYS_FLAT_RATE = 20.000;
const NIGHT_SURCHARGE = 1.30;
const ACCIDENT_SURCHARGE = 1.50;

function isNight(datetime) {
  const hour = datetime.getHours();
  return hour >= 21 || hour < 6;
}

function estimateSOSPrice(distanceKm, vehicleState, datetime = new Date()) {
  const { battery, fuel, keysLocked, accident } = vehicleState || {};

  let baseRate = BASE_RATE;
  let distanceCost = 0;
  let surcharges = {};
  let total = baseRate;
  let breakdown = { baseRate };

  if (battery && !fuel && !keysLocked) {
    baseRate = BATTERY_FLAT_RATE;
    breakdown = { batteryFlat: BATTERY_FLAT_RATE };
    total = BATTERY_FLAT_RATE;
  } else if (fuel && !battery && !keysLocked) {
    baseRate = FUEL_FLAT_RATE;
    breakdown = { fuelFlat: FUEL_FLAT_RATE };
    total = FUEL_FLAT_RATE;
  } else if (keysLocked && !battery && !fuel) {
    baseRate = KEYS_FLAT_RATE;
    breakdown = { keysFlat: KEYS_FLAT_RATE };
    total = KEYS_FLAT_RATE;
  } else {
    distanceCost = parseFloat((distanceKm * RATE_PER_KM).toFixed(3));
    total = parseFloat((baseRate + distanceCost).toFixed(3));
    breakdown = { baseRate, distanceCost };
  }

  let multiplier = 1;
  if (isNight(datetime)) {
    surcharges.night = NIGHT_SURCHARGE;
    multiplier *= NIGHT_SURCHARGE;
  }
  if (accident) {
    surcharges.accident = ACCIDENT_SURCHARGE;
    multiplier *= ACCIDENT_SURCHARGE;
  }

  if (multiplier !== 1) {
    total = parseFloat((total * multiplier).toFixed(3));
    breakdown.surchargeMultiplier = parseFloat(multiplier.toFixed(3));
  }

  return {
    baseRate,
    distanceCost,
    surcharges,
    total,
    breakdown,
    currency: 'TND',
  };
}

module.exports = { estimateSOSPrice };
