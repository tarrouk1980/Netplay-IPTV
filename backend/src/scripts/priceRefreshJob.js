'use strict';

const { MOCK_HOTELS } = require('../services/hotelService');
const scraper = require('../services/scraperService');

function startPriceRefreshJob() {
  const INTERVAL = 15 * 60 * 1000; // 15 minutes

  async function runRefresh() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    console.log('[PriceJob] Starting scheduled price refresh...');
    await scraper.refreshAllPrices(MOCK_HOTELS.slice(0, 10), today, tomorrow, 2);
  }

  // Run immediately then every 15 min
  runRefresh();
  setInterval(runRefresh, INTERVAL);
  console.log('[PriceJob] Price refresh job started (every 15 minutes)');
}

module.exports = { startPriceRefreshJob };
