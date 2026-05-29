'use strict';

const BASE_FEE = 3.000;
const RATE_PER_KM = 2.500;
const NIGHT_SURCHARGE = 1.20;
const PEAK_SURCHARGE = 1.15;

function isPeakHour(dt) {
  const h = dt.getHours();
  return (h >= 12 && h < 14) || (h >= 19 && h < 21);
}

function isNight(dt) {
  const h = dt.getHours();
  return h >= 21 || h < 6;
}

function haversineKm(lat1, lng1, lat2, lng2) {
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

function calculateDeliveryFee(distanceKm, datetime = new Date()) {
  const distanceCost = distanceKm * RATE_PER_KM;
  const rawFee = Math.max(BASE_FEE, distanceCost);

  let surchargeLabel = null;
  let surchargeMultiplier = 1;

  if (isNight(datetime)) {
    surchargeMultiplier = NIGHT_SURCHARGE;
    surchargeLabel = 'NIGHT';
  } else if (isPeakHour(datetime)) {
    surchargeMultiplier = PEAK_SURCHARGE;
    surchargeLabel = 'PEAK';
  }

  const total = parseFloat((rawFee * surchargeMultiplier).toFixed(3));

  return {
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    baseFee: BASE_FEE,
    distanceCost: parseFloat(distanceCost.toFixed(3)),
    surcharge: surchargeLabel,
    surchargeMultiplier,
    total,
    breakdown: {
      rawFee: parseFloat(rawFee.toFixed(3)),
      surchargeLabel,
      surchargeMultiplier,
      final: total,
    },
  };
}

module.exports = { calculateDeliveryFee, haversineKm, isPeakHour, isNight };
