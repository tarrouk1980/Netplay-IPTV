/**
 * Google Analytics 4 integration for EasyHotels Maghreb
 * GA4 Measurement ID placeholder: G-XXXXXXXXXX
 * GDPR-compliant: only fires events if window.__gdpr_analytics_enabled === true
 */

const GA4_SCRIPT_ID = 'ga4-gtag-script'

/**
 * Load the gtag.js script and initialise GA4.
 * Call this only after the user has given analytics consent.
 * @param {string} measurementId - e.g. 'G-XXXXXXXXXX'
 */
export function initGA4(measurementId) {
  if (typeof window === 'undefined') return
  if (document.getElementById(GA4_SCRIPT_ID)) return // already loaded

  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  })

  const script = document.createElement('script')
  script.id = GA4_SCRIPT_ID
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.__ga4_measurement_id = measurementId
  window.__gdpr_analytics_enabled = true
}

/** Guard: only execute if GDPR consent has been granted */
function isConsentGranted() {
  return typeof window !== 'undefined' && window.__gdpr_analytics_enabled === true
}

/** Fire a gtag event safely */
function gtagEvent(eventName, params = {}) {
  if (!isConsentGranted()) return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

/**
 * Track a page view (call on route change).
 * @param {string} path  - e.g. '/fr/blog/marrakech'
 * @param {string} title - document title
 */
export function trackPageView(path, title) {
  if (!isConsentGranted()) return
  if (typeof window.gtag !== 'function') return
  window.gtag('config', window.__ga4_measurement_id, {
    page_path: path,
    page_title: title,
  })
}

/**
 * Track when a user clicks on a hotel listing.
 * @param {string} hotelId
 * @param {string} hotelName
 * @param {string} provider   - e.g. 'booking', 'expedia'
 * @param {number} price
 * @param {string} currency   - e.g. 'EUR', 'MAD'
 */
export function trackHotelClick(hotelId, hotelName, provider, price, currency) {
  gtagEvent('hotel_click', {
    hotel_id: hotelId,
    hotel_name: hotelName,
    provider,
    value: price,
    currency,
  })
}

/**
 * Track a search action.
 * @param {string} destination
 * @param {string} checkin    - ISO date string
 * @param {string} checkout   - ISO date string
 * @param {number} guests
 */
export function trackSearch(destination, checkin, checkout, guests) {
  gtagEvent('search', {
    search_term: destination,
    checkin_date: checkin,
    checkout_date: checkout,
    guests,
  })
}

/**
 * Track a CPC (cost-per-click) outbound click.
 * @param {string} hotelId
 * @param {string} provider
 * @param {number} cpcAmount - the CPC bid amount in EUR
 */
export function trackCPCClick(hotelId, provider, cpcAmount) {
  gtagEvent('cpc_click', {
    hotel_id: hotelId,
    provider,
    cpc_amount: cpcAmount,
    currency: 'EUR',
  })
}

/**
 * Track when a flash deal is viewed.
 * @param {string} hotelId
 * @param {number} discount - percentage discount (e.g. 30 for 30%)
 */
export function trackFlashDealView(hotelId, discount) {
  gtagEvent('flash_deal_view', {
    hotel_id: hotelId,
    discount_percent: discount,
  })
}

/**
 * Listen for the custom GDPR consent event and auto-initialise GA4.
 * Dispatch this event from your GDPRBanner component on consent.
 * Usage: window.dispatchEvent(new CustomEvent('gdpr:consent', { detail: { analytics: true } }))
 */
if (typeof window !== 'undefined') {
  window.addEventListener('gdpr:consent', (event) => {
    const detail = (event && event.detail) || {}
    if (detail.analytics === true) {
      const measurementId = window.__ga4_measurement_id_pending || 'G-XXXXXXXXXX'
      initGA4(measurementId)
    }
  })
}
