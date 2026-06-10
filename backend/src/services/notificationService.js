'use strict';

// In-memory price alerts store (in production: use DB)
const alerts = new Map(); // userId -> [{ hotelId, maxPrice, checkIn, checkOut, guests, email, createdAt }]
const triggeredAlerts = [];

module.exports = {
  // Add a price alert
  addAlert(userId, alert) {
    const userAlerts = alerts.get(userId) || [];
    const newAlert = { id: `alert-${Date.now()}`, userId, ...alert, createdAt: new Date(), status: 'active' };
    userAlerts.push(newAlert);
    alerts.set(userId, userAlerts);
    return newAlert;
  },

  // Get user alerts
  getAlerts(userId) {
    return alerts.get(userId) || [];
  },

  // Remove alert
  removeAlert(userId, alertId) {
    const userAlerts = alerts.get(userId) || [];
    alerts.set(userId, userAlerts.filter(a => a.id !== alertId));
  },

  // Check all alerts against current prices (called by price refresh job)
  async checkAlerts(currentPrices) {
    const triggered = [];
    for (const [userId, userAlerts] of alerts.entries()) {
      for (const alert of userAlerts.filter(a => a.status === 'active')) {
        const hotelPrices = currentPrices.find(p => p.hotelId === alert.hotelId);
        if (hotelPrices && hotelPrices.bestPrice.pricePerNight <= alert.maxPrice) {
          triggered.push({ userId, alert, currentPrice: hotelPrices.bestPrice.pricePerNight });
          triggeredAlerts.push({ ...alert, triggeredAt: new Date(), price: hotelPrices.bestPrice.pricePerNight });
          console.log(`🔔 [Alert] User ${userId}: ${alert.hotelId} dropped to ${hotelPrices.bestPrice.pricePerNight} TND (target: ${alert.maxPrice})`);
        }
      }
    }
    return triggered;
  },

  // Get mock alerts for demo
  getMockAlerts() {
    return [
      { id: 'alert-1', hotelId: 'hotel-001', hotelName: 'The Palace Hotel Tunis', maxPrice: 300, currentPrice: 285, status: 'triggered', checkIn: '2026-07-15', checkOut: '2026-07-18', createdAt: new Date(Date.now() - 2*86400000) },
      { id: 'alert-2', hotelId: 'hotel-002', hotelName: 'Djerba Beach Resort', maxPrice: 250, currentPrice: 285, status: 'active', checkIn: '2026-08-01', checkOut: '2026-08-07', createdAt: new Date(Date.now() - 86400000) },
      { id: 'alert-3', hotelId: 'hotel-ma-001', hotelName: 'La Mamounia Marrakech', maxPrice: 1200, currentPrice: 1450, status: 'active', checkIn: '2026-09-10', checkOut: '2026-09-13', createdAt: new Date() },
    ];
  },

  getStats() {
    let total = 0;
    alerts.forEach(v => total += v.length);
    return { activeAlerts: total, triggeredToday: triggeredAlerts.filter(a => new Date(a.triggeredAt).toDateString() === new Date().toDateString()).length, totalTriggered: triggeredAlerts.length };
  }
};
