'use strict';
/**
 * weatherNotifier — vérifie la météo chaque heure (via Open-Meteo, gratuit)
 * et envoie une push notification aux utilisateurs actifs si pluie détectée.
 *
 * Utilise le token Expo Push (stocké dans User.fcmToken) pour l'envoi.
 * Cooldown: 1 notification par utilisateur par 6h.
 */
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// WMO codes considered rainy
const RAIN_CODES = new Set([51, 53, 55, 61, 63, 65, 71, 73, 80, 81, 82, 95, 96, 99]);

// In-memory cooldown (resets on server restart — good enough)
const sentAt = new Map(); // userId → timestamp
const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6h

async function checkWeatherAndNotify(lat = 36.8, lng = 10.18) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=precipitation_probability&forecast_days=1&timezone=auto`;
    const { data } = await axios.get(url, { timeout: 8000 });
    const code = data.current_weather?.weathercode;
    const precipProb = data.hourly?.precipitation_probability?.[new Date().getHours()] ?? 0;

    const isRainy = RAIN_CODES.has(code) || precipProb >= 40;
    if (!isRainy) return { notified: 0, reason: 'no rain' };

    // Fetch users with FCM tokens who haven't been notified recently
    const users = await prisma.user.findMany({
      where: {
        fcmToken: { not: null },
        role: 'CLIENT',
        suspended: false,
      },
      select: { id: true, fcmToken: true, name: true },
    }).catch(() => []);

    const now = Date.now();
    const targets = users.filter((u) => {
      const last = sentAt.get(u.id);
      return !last || now - last > COOLDOWN_MS;
    });

    if (targets.length === 0) return { notified: 0, reason: 'all on cooldown' };

    // Send via Expo Push API (works for Expo Go + standalone)
    const messages = targets.map((u) => ({
      to: u.fcmToken,
      title: '🌧 Il pleut dehors !',
      body: 'Évitez de vous mouiller — commandez un taxi EASYWAY en quelques secondes.',
      data: { screen: 'TaxiHome', type: 'WEATHER_TAXI' },
      sound: 'default',
    }));

    // Batch in chunks of 100 (Expo limit)
    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100);
      await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }).catch((err) => console.warn('[WeatherNotifier] Expo push error:', err.message));
    }

    // Update cooldown map
    targets.forEach((u) => sentAt.set(u.id, now));

    console.log(`[WeatherNotifier] Sent rain alert to ${targets.length} users (code=${code}, precip=${precipProb}%)`);
    return { notified: targets.length };
  } catch (err) {
    console.warn('[WeatherNotifier] Error:', err.message);
    return { notified: 0, error: err.message };
  }
}

// Start hourly check
function startWeatherNotifier() {
  const INTERVAL_MS = 60 * 60 * 1000; // 1h
  checkWeatherAndNotify(); // run immediately on start
  setInterval(() => checkWeatherAndNotify(), INTERVAL_MS);
  console.log('[WeatherNotifier] Started — checking every hour.');
}

module.exports = { startWeatherNotifier, checkWeatherAndNotify };
