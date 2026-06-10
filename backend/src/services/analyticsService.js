'use strict';

// In-memory analytics (in production: use database)
const analytics = {
  searches: [],
  clicks: [],
  pageViews: [],
  conversions: [],
};

module.exports = {
  trackSearch(data) {
    analytics.searches.push({ ...data, timestamp: new Date() });
    if (analytics.searches.length > 10000) analytics.searches.shift();
  },

  trackClick(data) {
    analytics.clicks.push({ ...data, timestamp: new Date() });
    if (analytics.clicks.length > 10000) analytics.clicks.shift();
  },

  trackPageView(data) {
    analytics.pageViews.push({ ...data, timestamp: new Date() });
    if (analytics.pageViews.length > 10000) analytics.pageViews.shift();
  },

  getSearchStats(days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const recent = analytics.searches.filter(s => s.timestamp > since);
    const byDest = {};
    recent.forEach(s => { if (s.destination) byDest[s.destination] = (byDest[s.destination] || 0) + 1; });
    const topDest = Object.entries(byDest).sort((a,b) => b[1]-a[1]).slice(0,10).map(([d,c]) => ({ destination: d, count: c }));
    return { total: recent.length, topDestinations: topDest, daily: this._dailyBreakdown(recent, days) };
  },

  getClickStats(days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const recent = analytics.clicks.filter(c => c.timestamp > since);
    const byProvider = {};
    recent.forEach(c => { byProvider[c.provider] = (byProvider[c.provider] || 0) + 1; });
    return { total: recent.length, byProvider, daily: this._dailyBreakdown(recent, days) };
  },

  getRevenueStats(days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const recentClicks = analytics.clicks.filter(c => c.timestamp > since);
    const CPC = { BOOKING: 1.2, EXPEDIA: 0.95, HOTELS_COM: 0.85, AIRBNB: 0.75, DIRECT: 0.5 };
    let totalRevenue = 0;
    const byProvider = {};
    recentClicks.forEach(c => {
      const rev = CPC[c.provider] || 0.5;
      totalRevenue += rev;
      byProvider[c.provider] = (byProvider[c.provider] || 0) + rev;
    });
    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalClicks: recentClicks.length,
      byProvider,
      avgCPC: recentClicks.length > 0 ? (totalRevenue/recentClicks.length).toFixed(2) : 0,
      daily: this._dailyBreakdown(recentClicks, days, CPC),
    };
  },

  _dailyBreakdown(items, days, cpcMap = null) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const dayItems = items.filter(x => x.timestamp.toISOString().split('T')[0] === date);
      const entry = { date, count: dayItems.length };
      if (cpcMap) entry.revenue = dayItems.reduce((s, c) => s + (cpcMap[c.provider] || 0.5), 0).toFixed(2);
      result.push(entry);
    }
    return result;
  },

  // Generate mock historical data for demo
  generateMockData() {
    const providers = ['BOOKING', 'EXPEDIA', 'HOTELS_COM', 'AIRBNB', 'DIRECT'];
    const destinations = ['Djerba', 'Hammamet', 'Tunis', 'Marrakech', 'Sousse', 'Le Caire', 'Hurghada'];
    for (let i = 30; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dailyClicks = Math.floor(50 + Math.random() * 200);
      for (let j = 0; j < dailyClicks; j++) {
        const provider = providers[Math.floor(Math.random() * providers.length)];
        analytics.clicks.push({ provider, hotelId: `hotel-${Math.floor(Math.random()*20)+1}`, timestamp: date });
      }
      const dailySearches = Math.floor(200 + Math.random() * 500);
      for (let j = 0; j < dailySearches; j++) {
        analytics.searches.push({ destination: destinations[Math.floor(Math.random()*destinations.length)], timestamp: date });
      }
    }
    console.log('[Analytics] Mock data generated');
  },
};

// Generate mock data on startup
module.exports.generateMockData();
