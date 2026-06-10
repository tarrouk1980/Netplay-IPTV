'use strict';

const MOCK_HOTELS = [
  {
    id: 'hotel-001', name: 'The Palace Hotel Tunis', slug: 'palace-hotel-tunis',
    description: 'Un hôtel 5 étoiles luxueux au cœur de Tunis, offrant une vue imprenable sur la médina et des installations de classe mondiale.',
    address: 'Avenue Habib Bourguiba, Tunis', city: 'Tunis', country: 'Tunisie',
    lat: 36.8189, lng: 10.1657, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=1',
    images: ['https://picsum.photos/800/600?random=1','https://picsum.photos/800/600?random=2','https://picsum.photos/800/600?random=3','https://picsum.photos/800/600?random=4'],
    amenities: ['WiFi Gratuit','Piscine','Spa','Salle de Sport','Restaurant Gastronomique','Bar','Parking Valet','Navette Aéroport','Climatisation','Conciergerie 24h/24'],
    rating: 9.2, reviewCount: 847, isActive: true, isFeatured: true
  },
  {
    id: 'hotel-002', name: 'Djerba Beach Resort & Spa', slug: 'djerba-beach-resort',
    description: 'Resort tout inclus face à la mer turquoise de Djerba avec plage privée, animations et restaurants variés.',
    address: 'Zone Touristique Midoun, Djerba', city: 'Djerba', country: 'Tunisie',
    lat: 33.8076, lng: 10.9854, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=5',
    images: ['https://picsum.photos/800/600?random=5','https://picsum.photos/800/600?random=6','https://picsum.photos/800/600?random=7','https://picsum.photos/800/600?random=8'],
    amenities: ['Plage Privée','3 Piscines','Spa','Club Enfants','5 Restaurants','Animation Journée','Sports Nautiques','WiFi Gratuit','Tout Inclus'],
    rating: 8.8, reviewCount: 1243, isActive: true, isFeatured: true
  },
  {
    id: 'hotel-003', name: 'Hasdrubal Thalassa Hammamet', slug: 'hasdrubal-hammamet',
    description: 'Hôtel thalasso de prestige à Hammamet avec soins marins, plage et gastronomie tunisienne authentique.',
    address: 'Route Touristique, Hammamet Nord', city: 'Hammamet', country: 'Tunisie',
    lat: 36.3958, lng: 10.5835, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=9',
    images: ['https://picsum.photos/800/600?random=9','https://picsum.photos/800/600?random=10','https://picsum.photos/800/600?random=11'],
    amenities: ['Thalassothérapie','Plage Privée','2 Piscines','Restaurant','WiFi','Spa','Tennis','Parking'],
    rating: 8.6, reviewCount: 632, isActive: true, isFeatured: true
  },
  {
    id: 'hotel-004', name: 'Marhaba Royal Salem Sousse', slug: 'marhaba-royal-sousse',
    description: 'Grand hôtel familial à Sousse avec accès direct à la plage, piscines et centre de divertissement.',
    address: 'Route Touristique Sousse', city: 'Sousse', country: 'Tunisie',
    lat: 35.8245, lng: 10.6346, stars: 4, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=12',
    images: ['https://picsum.photos/800/600?random=12','https://picsum.photos/800/600?random=13','https://picsum.photos/800/600?random=14'],
    amenities: ['Plage','Piscine','Restaurant','Bar','WiFi','Parking','Spa','Animation'],
    rating: 8.1, reviewCount: 521, isActive: true, isFeatured: false
  },
  {
    id: 'hotel-005', name: 'Novotel Tunis', slug: 'novotel-tunis',
    description: 'Hôtel moderne d\'affaires et loisirs en plein cœur de Tunis, idéal pour voyageurs professionnels.',
    address: 'Avenue Mohammed V, Tunis', city: 'Tunis', country: 'Tunisie',
    lat: 36.8172, lng: 10.1795, stars: 4, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=15',
    images: ['https://picsum.photos/800/600?random=15','https://picsum.photos/800/600?random=16'],
    amenities: ['WiFi Gratuit','Restaurant','Bar','Salle Conférence','Gym','Parking','Climatisation'],
    rating: 8.4, reviewCount: 389, isActive: true, isFeatured: false
  },
  {
    id: 'hotel-006', name: 'Radisson Blu Monastir', slug: 'radisson-monastir',
    description: 'Hôtel luxueux proche de l\'aéroport de Monastir avec vue mer et complexe balnéaire complet.',
    address: 'Boulevard de l\'Environnement, Monastir', city: 'Monastir', country: 'Tunisie',
    lat: 35.7649, lng: 10.8116, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=17',
    images: ['https://picsum.photos/800/600?random=17','https://picsum.photos/800/600?random=18','https://picsum.photos/800/600?random=19'],
    amenities: ['Plage','Piscine Chauffée','Spa','Restaurant Panoramique','Bar','WiFi','Navette Aéroport','Salle Gym'],
    rating: 8.9, reviewCount: 712, isActive: true, isFeatured: true
  },
  {
    id: 'hotel-007', name: 'Dar Ben Gacem Tunis', slug: 'dar-ben-gacem',
    description: 'Maison d\'hôtes authentique dans la médina de Tunis, architecture andalouse traditionnelle avec patio fleuri.',
    address: 'Médina, Tunis 1008', city: 'Tunis', country: 'Tunisie',
    lat: 36.7992, lng: 10.1714, stars: 4, category: 'VILLA',
    mainImage: 'https://picsum.photos/800/600?random=20',
    images: ['https://picsum.photos/800/600?random=20','https://picsum.photos/800/600?random=21'],
    amenities: ['WiFi','Petit-Déjeuner','Terrasse','Climatisation','Visite Guidée','Service Conciergerie'],
    rating: 9.0, reviewCount: 215, isActive: true, isFeatured: false
  },
  {
    id: 'hotel-008', name: 'El Mouradi Palm Marina Port El Kantaoui', slug: 'el-mouradi-port-kantaoui',
    description: 'Resort tout inclus sur le port de plaisance d\'El Kantaoui avec marina et club nautique.',
    address: 'Port El Kantaoui, Sousse', city: 'Sousse', country: 'Tunisie',
    lat: 35.8917, lng: 10.5948, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=22',
    images: ['https://picsum.photos/800/600?random=22','https://picsum.photos/800/600?random=23','https://picsum.photos/800/600?random=24'],
    amenities: ['Marina','4 Piscines','Plage','Spa','5 Restaurants','Tennis','Golf à Proximité','WiFi','Tout Inclus'],
    rating: 8.7, reviewCount: 934, isActive: true, isFeatured: true
  },
  {
    id: 'hotel-009', name: 'Loews Hotel Le Concorde Tunis', slug: 'loews-concorde-tunis',
    description: 'Hôtel iconique de Tunis avec vue panoramique sur la ville depuis ses 28 étages, bar rooftop spectaculaire.',
    address: 'Avenue de Paris, Tunis', city: 'Tunis', country: 'Tunisie',
    lat: 36.8156, lng: 10.1813, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=25',
    images: ['https://picsum.photos/800/600?random=25','https://picsum.photos/800/600?random=26'],
    amenities: ['Bar Rooftop','Restaurant','Piscine','Spa','Salle Conférence','WiFi','Valet','Gym'],
    rating: 8.5, reviewCount: 678, isActive: true, isFeatured: false
  },
  {
    id: 'hotel-010', name: 'Iberostar Selection Kantaoui Bay', slug: 'iberostar-kantaoui-bay',
    description: 'Complexe hôtelier premium 5 étoiles en bord de mer avec cuisine internationale et animations variées.',
    address: 'El Kantaoui, Hammam Sousse', city: 'Sousse', country: 'Tunisie',
    lat: 35.9010, lng: 10.5965, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=27',
    images: ['https://picsum.photos/800/600?random=27','https://picsum.photos/800/600?random=28'],
    amenities: ['Plage Privée','Piscines','Spa Thalasso','Casino','7 Restaurants','Discothèque','Boutiques','WiFi'],
    rating: 8.3, reviewCount: 1102, isActive: true, isFeatured: true
  },
  {
    id: 'hotel-011', name: 'Four Seasons Hotel Paris George V', slug: 'four-seasons-paris',
    description: 'L\'un des hôtels les plus prestigieux au monde, situé sur l\'avenue George V à deux pas des Champs-Élysées.',
    address: '31 Avenue George V, Paris 75008', city: 'Paris', country: 'France',
    lat: 48.8671, lng: 2.3006, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=29',
    images: ['https://picsum.photos/800/600?random=29','https://picsum.photos/800/600?random=30','https://picsum.photos/800/600?random=31'],
    amenities: ['Restaurant Étoilé','Piscine Intérieure','Spa Luxe','Bar','Conciergerie','Service Chambre 24h','Parking'],
    rating: 9.6, reviewCount: 2134, isActive: true, isFeatured: true
  },
  {
    id: 'hotel-012', name: 'Atlantis The Palm Dubai', slug: 'atlantis-palm-dubai',
    description: 'Hôtel de villégiature extraordinaire sur l\'île artificielle Palm Jumeirah avec parc aquatique Aquaventure.',
    address: 'Crescent Road, Palm Jumeirah, Dubai', city: 'Dubai', country: 'Émirats Arabes Unis',
    lat: 25.1304, lng: 55.1172, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=32',
    images: ['https://picsum.photos/800/600?random=32','https://picsum.photos/800/600?random=33','https://picsum.photos/800/600?random=34'],
    amenities: ['Parc Aquatique','Plage Privée','17 Restaurants','Spa Aquaventure','Aquarium','Casino','Boutiques Luxe','WiFi'],
    rating: 9.1, reviewCount: 3456, isActive: true, isFeatured: true
  },
  {
    id: 'hotel-013', name: 'Hotel Arts Barcelona', slug: 'hotel-arts-barcelona',
    description: 'Gratte-ciel emblématique de 44 étages sur le front de mer de Barcelone avec vue mer et ville époustouflante.',
    address: 'Carrer de la Marina 19-21, Barcelone', city: 'Barcelone', country: 'Espagne',
    lat: 41.3877, lng: 2.1967, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=35',
    images: ['https://picsum.photos/800/600?random=35','https://picsum.photos/800/600?random=36'],
    amenities: ['Piscine Rooftop','2 Restaurants Étoilés','Spa','Bar','Fitness','Vue Mer','Plage à Proximité'],
    rating: 9.3, reviewCount: 1876, isActive: true, isFeatured: true
  },
  {
    id: 'hotel-014', name: 'Novotel Hammamet', slug: 'novotel-hammamet',
    description: 'Hôtel confortable à Hammamet avec accès à la plage et services modernes pour famille et affaires.',
    address: 'Avenue des Nations Unies, Hammamet', city: 'Hammamet', country: 'Tunisie',
    lat: 36.3878, lng: 10.5672, stars: 4, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=36',
    images: ['https://picsum.photos/800/600?random=36','https://picsum.photos/800/600?random=37'],
    amenities: ['Plage','Piscine','Restaurant','Bar','WiFi','Parking','Climatisation','Tennis'],
    rating: 7.9, reviewCount: 445, isActive: true, isFeatured: false
  },
  {
    id: 'hotel-015', name: 'Hôtel Sindbad Hammamet', slug: 'sindbad-hammamet',
    description: 'Hôtel familial bien situé à Hammamet avec jardin tropical, piscine et ambiance détendue.',
    address: 'Zone Touristique, Hammamet', city: 'Hammamet', country: 'Tunisie',
    lat: 36.4012, lng: 10.5789, stars: 3, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=38',
    images: ['https://picsum.photos/800/600?random=38','https://picsum.photos/800/600?random=39'],
    amenities: ['Piscine','Restaurant','WiFi','Parking','Plage à 200m','Animation'],
    rating: 7.4, reviewCount: 298, isActive: true, isFeatured: false
  },
];

const MOCK_ROOMS = {
  'hotel-001': [
    { id: 'r001-1', name: 'Chambre Deluxe Vue Ville', type: 'DOUBLE', maxGuests: 2, beds: 1, size: 42, amenities: ['Minibar','Coffre-fort','TV 55"','Baignoire'] },
    { id: 'r001-2', name: 'Suite Junior', type: 'SUITE', maxGuests: 2, beds: 1, size: 65, amenities: ['Salon','Jacuzzi','Minibar','Vue Panoramique'] },
    { id: 'r001-3', name: 'Suite Présidentielle', type: 'SUITE', maxGuests: 4, beds: 2, size: 120, amenities: ['2 Salons','Cuisine Équipée','Jacuzzi Privatif','Butler Service'] },
  ],
};

const PROVIDERS = [
  { key: 'BOOKING', name: 'Booking.com', color: '#003580', logo: 'B' },
  { key: 'EXPEDIA', name: 'Expedia', color: '#FFC107', logo: 'E' },
  { key: 'HOTELS_COM', name: 'Hotels.com', color: '#C0392B', logo: 'H' },
  { key: 'AIRBNB', name: 'Airbnb', color: '#FF5A5F', logo: 'A' },
  { key: 'DIRECT', name: 'Réservation Directe', color: '#27AE60', logo: 'D' },
];

const MOCK_REVIEWS = [
  { id: 'rev-1', authorName: 'Sophie M.', rating: 9.5, title: 'Séjour exceptionnel!', comment: 'Hôtel magnifique, personnel aux petits soins. La vue depuis la chambre est à couper le souffle. Nous reviendrons sans hésitation.', travelType: 'COUPLE', stayDate: '2024-11-15' },
  { id: 'rev-2', authorName: 'Ahmed B.', rating: 8.0, title: 'Très bon rapport qualité-prix', comment: 'Bon hôtel dans l\'ensemble, chambre propre et confortable. Petit-déjeuner excellent. Quelques améliorations possibles au niveau du spa.', travelType: 'FAMILY', stayDate: '2024-10-20' },
  { id: 'rev-3', authorName: 'Marie-Claire D.', rating: 9.0, title: 'Parfait pour un voyage d\'affaires', comment: 'Emplacement idéal, connexion internet rapide, salle de réunion bien équipée. Le restaurant de l\'hôtel est délicieux.', travelType: 'BUSINESS', stayDate: '2024-12-05' },
];

const POPULAR_DESTINATIONS = [
  { city: 'Tunis', country: 'Tunisie', image: 'https://picsum.photos/400/300?random=50', hotelCount: 45 },
  { city: 'Djerba', country: 'Tunisie', image: 'https://picsum.photos/400/300?random=51', hotelCount: 38 },
  { city: 'Hammamet', country: 'Tunisie', image: 'https://picsum.photos/400/300?random=52', hotelCount: 52 },
  { city: 'Sousse', country: 'Tunisie', image: 'https://picsum.photos/400/300?random=53', hotelCount: 41 },
  { city: 'Paris', country: 'France', image: 'https://picsum.photos/400/300?random=54', hotelCount: 320 },
  { city: 'Dubai', country: 'EAU', image: 'https://picsum.photos/400/300?random=55', hotelCount: 185 },
];

function generateMockPrices(hotel, checkIn, checkOut, guests) {
  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1);
  const basePrice = getBasePrice(hotel);
  const offers = [];

  PROVIDERS.forEach((provider, idx) => {
    const variation = 0.9 + (idx * 0.06) + (Math.random() * 0.08);
    const pricePerNight = Math.round(basePrice * variation);
    const totalPrice = pricePerNight * nights;
    const hasDiscount = Math.random() > 0.5;
    const discountPct = hasDiscount ? Math.floor(Math.random() * 20) + 5 : 0;
    const originalTotal = hasDiscount ? Math.round(totalPrice / (1 - discountPct / 100)) : totalPrice;

    offers.push({
      id: `offer-${hotel.id}-${provider.key}`,
      hotelId: hotel.id,
      sourceProvider: provider.key,
      providerName: provider.name,
      providerColor: provider.color,
      providerLogo: provider.logo,
      originalPrice: originalTotal,
      discountedPrice: totalPrice,
      pricePerNight,
      currency: 'TND',
      nights,
      checkIn,
      checkOut,
      guestsCount: guests,
      availability: Math.floor(Math.random() * 5) + 1,
      dealLabel: hasDiscount ? `-${discountPct}%` : null,
      isFreeCancellation: Math.random() > 0.4,
      includesBreakfast: Math.random() > 0.6,
      deepLink: `https://example.com/${provider.key.toLowerCase()}/${hotel.slug}`,
    });
  });

  offers.sort((a, b) => a.discountedPrice - b.discountedPrice);
  offers[0].isBestPrice = true;

  return offers;
}

function getBasePrice(hotel) {
  const starPrices = { 2: 80, 3: 150, 4: 280, 5: 520 };
  const base = starPrices[hotel.stars] || 200;
  const cityMultiplier = hotel.city === 'Paris' ? 5 : hotel.city === 'Dubai' ? 4 : hotel.city === 'Barcelone' ? 3.5 : 1;
  return Math.round(base * cityMultiplier);
}

function searchHotels({ destination, stars, category, minPrice, maxPrice, amenities, sortBy, guests = 1 }) {
  let results = [...MOCK_HOTELS].filter(h => h.isActive);

  if (destination) {
    const q = destination.toLowerCase();
    results = results.filter(h =>
      h.city.toLowerCase().includes(q) ||
      h.country.toLowerCase().includes(q) ||
      h.name.toLowerCase().includes(q)
    );
  }
  if (stars) {
    const starsArr = String(stars).split(',').map(Number);
    results = results.filter(h => starsArr.includes(h.stars));
  }
  if (category) results = results.filter(h => h.category === category);
  if (amenities) {
    const amenArr = String(amenities).split(',').map(s => s.toLowerCase());
    results = results.filter(h => amenArr.every(a => h.amenities.some(ha => ha.toLowerCase().includes(a))));
  }

  const checkIn = new Date().toISOString().split('T')[0];
  const checkOut = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  results = results.map(hotel => {
    const prices = generateMockPrices(hotel, checkIn, checkOut, guests);
    const bestOffer = prices[0];
    return { ...hotel, bestPrice: bestOffer.discountedPrice, bestOffer, pricePerNight: bestOffer.pricePerNight };
  });

  if (minPrice) results = results.filter(h => h.bestPrice >= Number(minPrice));
  if (maxPrice) results = results.filter(h => h.bestPrice <= Number(maxPrice));

  switch (sortBy) {
    case 'price_asc': results.sort((a, b) => a.bestPrice - b.bestPrice); break;
    case 'price_desc': results.sort((a, b) => b.bestPrice - a.bestPrice); break;
    case 'stars': results.sort((a, b) => b.stars - a.stars); break;
    case 'rating': results.sort((a, b) => b.rating - a.rating); break;
    default: results.sort((a, b) => (b.isFeatured - a.isFeatured) || (b.rating - a.rating));
  }

  return results;
}

function getHotelById(id) {
  return MOCK_HOTELS.find(h => h.id === id || h.slug === id) || null;
}

function getHotelRooms(hotelId) {
  return MOCK_ROOMS[hotelId] || [
    { id: `${hotelId}-r1`, name: 'Chambre Standard', type: 'DOUBLE', maxGuests: 2, beds: 1, size: 28, amenities: ['WiFi','TV','Climatisation'] },
    { id: `${hotelId}-r2`, name: 'Chambre Supérieure', type: 'DELUXE', maxGuests: 2, beds: 1, size: 36, amenities: ['WiFi','TV','Climatisation','Minibar'] },
    { id: `${hotelId}-r3`, name: 'Suite Familiale', type: 'FAMILY', maxGuests: 4, beds: 2, size: 55, amenities: ['WiFi','TV','Climatisation','Salon','Baignoire'] },
  ];
}

module.exports = {
  MOCK_HOTELS,
  POPULAR_DESTINATIONS,
  MOCK_REVIEWS,
  generateMockPrices,
  searchHotels,
  getHotelById,
  getHotelRooms,
};
