/**
 * SEO Keyword Research — Spanish Market
 * Target: Spanish tourists going to North Africa + Moroccan/Algerian/Tunisian diaspora in Spain
 *
 * Data sources: Google Keyword Planner estimates, SEMrush, Ahrefs
 * Last updated: June 2026
 */
module.exports = {
  spanish: {
    highVolume: [
      'hoteles marruecos',        // 18,000 búsquedas/mes
      'hoteles tunez',            // 12,000 búsquedas/mes
      'hoteles marrakech',        // 22,000 búsquedas/mes
      'hotel djerba',             // 8,000 búsquedas/mes
      'hoteles hurghada',         // 15,000 búsquedas/mes
      'hotel hammamet',           // 6,000 búsquedas/mes
      'hoteles casablanca',       // 9,000 búsquedas/mes
      'sharm el sheikh hotel',    // 20,000 búsquedas/mes
      'hotel halal marruecos',    // 3,500 búsquedas/mes
      'hotel sin alcohol tunez',  // 2,000 búsquedas/mes
    ],

    diaspora: [
      'hoteles marruecos verano',
      'hotel marrakech familia',
      'vacaciones marruecos',
      'hotel agadir precio',
      'hotel fez marruecos',
      'hoteles tanger marruecos',
      'hotel casablanca barato',
      'hotel agadir todo incluido',
      'vacaciones argelia verano',
      'hotel tunez familia',
    ],

    longTail: [
      'mejor hotel djerba todo incluido',
      'hotel marrakech con piscina barato',
      'hotel halal tunez playa',
      'hoteles sharm el sheikh todo incluido español',
      'hotel sin alcohol marrakech',
      'hotel burkini ok tunez',
      'hotel djerba primera linea playa',
      'hotel marrakech familia islamica',
      'hotel hammamet todo incluido espanol',
      'hotel argel aeropuerto',
      'hoteles hurghada todo incluido español',
      'hotel agadir sin alcohol piscina',
    ],

    seasonal: {
      summer: [
        'hoteles marruecos agosto',
        'hotel tunez julio agosto',
        'vacaciones norte africa verano 2026',
        'hotel marrakech verano precio',
      ],
      ramadan: [
        'hotel halal ramadan 2026',
        'hotel iftar suhoor tunez',
        'hotel sin alcohol ramadan marruecos',
      ],
      winter: [
        'hotel marrakech navidad',
        'escapada tunez invierno',
        'hotel agadir noviembre',
      ],
    },

    geo: {
      // By city of departure in Spain
      madrid: ['hoteles marruecos desde madrid', 'vuelo hotel marrakech madrid'],
      barcelona: ['hoteles tunez desde barcelona', 'vuelo hotel djerba barcelona'],
      valencia: ['hotel agadir desde valencia', 'vuelo marruecos valencia'],
      sevilla: ['vuelo tunez sevilla hotel', 'hoteles marruecos sevilla'],
      malaga: ['hotel marrakech malaga', 'vuelo marruecos malaga'],
    },

    cpcEstimates: {
      'hoteles marruecos': '2.50€',
      'hoteles marrakech': '3.20€',
      'hotel djerba': '2.80€',
      'hoteles hurghada': '2.10€',
      'hotel halal marruecos': '1.80€',
      'hoteles tunez': '2.30€',
      'hotel hammamet': '2.60€',
      'sharm el sheikh hotel': '3.50€',
      'hoteles casablanca': '1.90€',
      'hotel agadir precio': '2.20€',
    },

    competitors: [
      'booking.com marruecos',
      'expedia hoteles tunez',
      'tripadvisor marrakech',
      'trivago hoteles norte africa',
    ],
  },

  // French keywords (existing market)
  french: {
    highVolume: [
      'hôtels maroc',
      'hôtels tunisie',
      'hôtel djerba',
      'hôtel marrakech',
      'hôtels hurghada',
      'hôtel halal tunisie',
    ],
  },

  // Arabic keywords (diaspora)
  arabic: {
    highVolume: [
      'فنادق المغرب',
      'فنادق تونس',
      'فندق مراكش',
      'فنادق الجزائر',
    ],
  },
}
