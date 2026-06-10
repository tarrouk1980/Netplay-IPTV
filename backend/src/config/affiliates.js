'use strict';

/**
 * Affiliate Programs Configuration
 *
 * Real program details for each OTA partner.
 * Replace the placeholder IDs with your actual affiliate IDs after registration.
 */

module.exports = {
  BOOKING: {
    name: 'Booking.com',
    affiliateProgram: 'https://affiliate.booking.com',
    baseAffiliateUrl: 'https://www.booking.com/hotel/',
    // Real format: https://www.booking.com/hotel/tn/hotel-name.fr.html?aid=YOUR_AID&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&group_adults=2
    urlBuilder: (hotelSlug, checkIn, checkOut, guests, affiliateId) =>
      `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(hotelSlug)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${guests}&aid=${affiliateId || 'REPLACE_WITH_YOUR_AID'}`,
    cpcRange: '0.50 - 2.00 USD per click',
    signupUrl: 'https://affiliate.booking.com/affiliateadmin/registernewpartner.html',
  },

  EXPEDIA: {
    name: 'Expedia',
    affiliateProgram: 'https://expediagroup.com/solutions/advertising',
    urlBuilder: (hotelSlug, checkIn, checkOut, guests, affiliateId) =>
      `https://www.expedia.fr/Hotel-Search?destination=${encodeURIComponent(hotelSlug)}&d1=${checkIn}&d2=${checkOut}&adults=${guests}&AFFCID=${affiliateId || 'REPLACE_WITH_YOUR_AFFCID'}`,
    cpcRange: '0.40 - 1.50 USD per click',
    signupUrl: 'https://expediagroup.com/solutions/advertising/travel-ads/',
  },

  HOTELS_COM: {
    name: 'Hotels.com',
    affiliateProgram: 'https://fr.hotels.com/affiliates',
    urlBuilder: (hotelSlug, checkIn, checkOut, guests, affiliateId) =>
      `https://fr.hotels.com/search.do?q-destination=${encodeURIComponent(hotelSlug)}&q-check-in=${checkIn}&q-check-out=${checkOut}&q-rooms=1&q-room-0-adults=${guests}&pos=${affiliateId || 'REPLACE_YOUR_POS'}`,
    cpcRange: '0.35 - 1.20 USD per click',
    signupUrl: 'https://fr.hotels.com/affiliates/',
  },

  AIRBNB: {
    name: 'Airbnb',
    affiliateProgram: 'https://www.airbnb.fr/associates',
    urlBuilder: (location, checkIn, checkOut, guests, affiliateId) =>
      `https://www.airbnb.fr/s/${encodeURIComponent(location)}/homes?checkin=${checkIn}&checkout=${checkOut}&adults=${guests}&af=${affiliateId || 'REPLACE_YOUR_AF_ID'}`,
    cpcRange: 'Commission sur réservation: 4-8%',
    signupUrl: 'https://www.airbnb.fr/associates/joining',
  },
};
