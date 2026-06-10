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
    rating: 9.2, reviewCount: 847, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false,
  },
  {
    id: 'hotel-002', name: 'Djerba Beach Resort & Spa', slug: 'djerba-beach-resort',
    description: 'Resort tout inclus face à la mer turquoise de Djerba avec plage privée, animations et restaurants variés.',
    address: 'Zone Touristique Midoun, Djerba', city: 'Djerba', country: 'Tunisie',
    lat: 33.8076, lng: 10.9854, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=5',
    images: ['https://picsum.photos/800/600?random=5','https://picsum.photos/800/600?random=6','https://picsum.photos/800/600?random=7','https://picsum.photos/800/600?random=8'],
    amenities: ['Plage Privée','3 Piscines','Spa','Club Enfants','5 Restaurants','Animation Journée','Sports Nautiques','WiFi Gratuit','Tout Inclus'],
    rating: 8.8, reviewCount: 1243, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: true,
  },
  {
    id: 'hotel-003', name: 'Hasdrubal Thalassa Hammamet', slug: 'hasdrubal-hammamet',
    description: 'Hôtel thalasso de prestige à Hammamet avec soins marins, plage et gastronomie tunisienne authentique.',
    address: 'Route Touristique, Hammamet Nord', city: 'Hammamet', country: 'Tunisie',
    lat: 36.3958, lng: 10.5835, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=9',
    images: ['https://picsum.photos/800/600?random=9','https://picsum.photos/800/600?random=10','https://picsum.photos/800/600?random=11'],
    amenities: ['Thalassothérapie','Plage Privée','2 Piscines','Restaurant','WiFi','Spa','Tennis','Parking'],
    rating: 8.6, reviewCount: 632, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: true,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: true,
  },
  {
    id: 'hotel-004', name: 'Marhaba Royal Salem Sousse', slug: 'marhaba-royal-sousse',
    description: 'Grand hôtel familial à Sousse avec accès direct à la plage, piscines et centre de divertissement.',
    address: 'Route Touristique Sousse', city: 'Sousse', country: 'Tunisie',
    lat: 35.8245, lng: 10.6346, stars: 4, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=12',
    images: ['https://picsum.photos/800/600?random=12','https://picsum.photos/800/600?random=13','https://picsum.photos/800/600?random=14'],
    amenities: ['Plage','Piscine','Restaurant','Bar','WiFi','Parking','Spa','Animation'],
    rating: 8.1, reviewCount: 521, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: true, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: false, isBeachfront: true,
  },
  {
    id: 'hotel-005', name: 'Novotel Tunis', slug: 'novotel-tunis',
    description: 'Hôtel moderne d\'affaires et loisirs en plein cœur de Tunis, idéal pour voyageurs professionnels.',
    address: 'Avenue Mohammed V, Tunis', city: 'Tunis', country: 'Tunisie',
    lat: 36.8172, lng: 10.1795, stars: 4, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=15',
    images: ['https://picsum.photos/800/600?random=15','https://picsum.photos/800/600?random=16'],
    amenities: ['WiFi Gratuit','Restaurant','Bar','Salle Conférence','Gym','Parking','Climatisation'],
    rating: 8.4, reviewCount: 389, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: false, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: false, isBeachfront: false,
  },
  {
    id: 'hotel-006', name: 'Radisson Blu Monastir', slug: 'radisson-monastir',
    description: 'Hôtel luxueux proche de l\'aéroport de Monastir avec vue mer et complexe balnéaire complet.',
    address: 'Boulevard de l\'Environnement, Monastir', city: 'Monastir', country: 'Tunisie',
    lat: 35.7649, lng: 10.8116, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=17',
    images: ['https://picsum.photos/800/600?random=17','https://picsum.photos/800/600?random=18','https://picsum.photos/800/600?random=19'],
    amenities: ['Plage','Piscine Chauffée','Spa','Restaurant Panoramique','Bar','WiFi','Navette Aéroport','Salle Gym'],
    rating: 8.9, reviewCount: 712, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: true,
  },
  {
    id: 'hotel-007', name: 'Dar Ben Gacem Tunis', slug: 'dar-ben-gacem',
    description: 'Maison d\'hôtes authentique dans la médina de Tunis, architecture andalouse traditionnelle avec patio fleuri.',
    address: 'Médina, Tunis 1008', city: 'Tunis', country: 'Tunisie',
    lat: 36.7992, lng: 10.1714, stars: 4, category: 'VILLA',
    mainImage: 'https://picsum.photos/800/600?random=20',
    images: ['https://picsum.photos/800/600?random=20','https://picsum.photos/800/600?random=21'],
    amenities: ['WiFi','Petit-Déjeuner','Terrasse','Climatisation','Visite Guidée','Service Conciergerie'],
    rating: 9.0, reviewCount: 215, isActive: true, isFeatured: false,
    isAlcoholFree: true, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: false, isBeachfront: false,
  },
  {
    id: 'hotel-008', name: 'El Mouradi Palm Marina Port El Kantaoui', slug: 'el-mouradi-port-kantaoui',
    description: 'Resort tout inclus sur le port de plaisance d\'El Kantaoui avec marina et club nautique.',
    address: 'Port El Kantaoui, Sousse', city: 'Sousse', country: 'Tunisie',
    lat: 35.8917, lng: 10.5948, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=22',
    images: ['https://picsum.photos/800/600?random=22','https://picsum.photos/800/600?random=23','https://picsum.photos/800/600?random=24'],
    amenities: ['Marina','4 Piscines','Plage','Spa','5 Restaurants','Tennis','Golf à Proximité','WiFi','Tout Inclus'],
    rating: 8.7, reviewCount: 934, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: true, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: true,
  },
  {
    id: 'hotel-009', name: 'Loews Hotel Le Concorde Tunis', slug: 'loews-concorde-tunis',
    description: 'Hôtel iconique de Tunis avec vue panoramique sur la ville depuis ses 28 étages, bar rooftop spectaculaire.',
    address: 'Avenue de Paris, Tunis', city: 'Tunis', country: 'Tunisie',
    lat: 36.8156, lng: 10.1813, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=25',
    images: ['https://picsum.photos/800/600?random=25','https://picsum.photos/800/600?random=26'],
    amenities: ['Bar Rooftop','Restaurant','Piscine','Spa','Salle Conférence','WiFi','Valet','Gym'],
    rating: 8.5, reviewCount: 678, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: false, isHalalCertified: false, hasRamadanServices: false,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false,
  },
  {
    id: 'hotel-010', name: 'Iberostar Selection Kantaoui Bay', slug: 'iberostar-kantaoui-bay',
    description: 'Complexe hôtelier premium 5 étoiles en bord de mer avec cuisine internationale et animations variées.',
    address: 'El Kantaoui, Hammam Sousse', city: 'Sousse', country: 'Tunisie',
    lat: 35.9010, lng: 10.5965, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=27',
    images: ['https://picsum.photos/800/600?random=27','https://picsum.photos/800/600?random=28'],
    amenities: ['Plage Privée','Piscines','Spa Thalasso','Casino','7 Restaurants','Discothèque','Boutiques','WiFi'],
    rating: 8.3, reviewCount: 1102, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: false, isHalalCertified: false, hasRamadanServices: false,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: true,
  },
  {
    id: 'hotel-011', name: 'Four Seasons Hotel Paris George V', slug: 'four-seasons-paris',
    description: 'L\'un des hôtels les plus prestigieux au monde, situé sur l\'avenue George V à deux pas des Champs-Élysées.',
    address: '31 Avenue George V, Paris 75008', city: 'Paris', country: 'France',
    lat: 48.8671, lng: 2.3006, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=29',
    images: ['https://picsum.photos/800/600?random=29','https://picsum.photos/800/600?random=30','https://picsum.photos/800/600?random=31'],
    amenities: ['Restaurant Étoilé','Piscine Intérieure','Spa Luxe','Bar','Conciergerie','Service Chambre 24h','Parking'],
    rating: 9.6, reviewCount: 2134, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: false, isHalalCertified: false, hasRamadanServices: false,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: false,
  },
  {
    id: 'hotel-012', name: 'Atlantis The Palm Dubai', slug: 'atlantis-palm-dubai',
    description: 'Hôtel de villégiature extraordinaire sur l\'île artificielle Palm Jumeirah avec parc aquatique Aquaventure.',
    address: 'Crescent Road, Palm Jumeirah, Dubai', city: 'Dubai', country: 'Émirats Arabes Unis',
    lat: 25.1304, lng: 55.1172, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=32',
    images: ['https://picsum.photos/800/600?random=32','https://picsum.photos/800/600?random=33','https://picsum.photos/800/600?random=34'],
    amenities: ['Parc Aquatique','Plage Privée','17 Restaurants','Spa Aquaventure','Aquarium','Casino','Boutiques Luxe','WiFi'],
    rating: 9.1, reviewCount: 3456, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: false, isHalalCertified: false, hasRamadanServices: false,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: true,
  },
  {
    id: 'hotel-013', name: 'Hotel Arts Barcelona', slug: 'hotel-arts-barcelona',
    description: 'Gratte-ciel emblématique de 44 étages sur le front de mer de Barcelone avec vue mer et ville époustouflante.',
    address: 'Carrer de la Marina 19-21, Barcelone', city: 'Barcelone', country: 'Espagne',
    lat: 41.3877, lng: 2.1967, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=35',
    images: ['https://picsum.photos/800/600?random=35','https://picsum.photos/800/600?random=36'],
    amenities: ['Piscine Rooftop','2 Restaurants Étoilés','Spa','Bar','Fitness','Vue Mer','Plage à Proximité'],
    rating: 9.3, reviewCount: 1876, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: false, isHalalCertified: false, hasRamadanServices: false,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: false,
  },
  {
    id: 'hotel-014', name: 'Novotel Hammamet', slug: 'novotel-hammamet',
    description: 'Hôtel confortable à Hammamet avec accès à la plage et services modernes pour famille et affaires.',
    address: 'Avenue des Nations Unies, Hammamet', city: 'Hammamet', country: 'Tunisie',
    lat: 36.3878, lng: 10.5672, stars: 4, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=36',
    images: ['https://picsum.photos/800/600?random=36','https://picsum.photos/800/600?random=37'],
    amenities: ['Plage','Piscine','Restaurant','Bar','WiFi','Parking','Climatisation','Tennis'],
    rating: 7.9, reviewCount: 445, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: false, isBeachfront: true,
  },
  {
    id: 'hotel-015', name: 'Hôtel Sindbad Hammamet', slug: 'sindbad-hammamet',
    description: 'Hôtel familial bien situé à Hammamet avec jardin tropical, piscine et ambiance détendue.',
    address: 'Zone Touristique, Hammamet', city: 'Hammamet', country: 'Tunisie',
    lat: 36.4012, lng: 10.5789, stars: 3, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=38',
    images: ['https://picsum.photos/800/600?random=38','https://picsum.photos/800/600?random=39'],
    amenities: ['Piscine','Restaurant','WiFi','Parking','Plage à 200m','Animation'],
    rating: 7.4, reviewCount: 298, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: false, isBeachfront: false,
  },

  // MOROCCO HOTELS (8 hotels)
  { id: 'hotel-ma-001', name: 'La Mamounia Marrakech', slug: 'mamounia-marrakech',
    description: 'Palace légendaire au cœur de Marrakech, l\'un des plus beaux hôtels au monde avec ses jardins d\'orangers centenaires.',
    address: 'Avenue Bab Jdid, Marrakech 40040', city: 'Marrakech', country: 'Maroc',
    lat: 31.6247, lng: -7.9992, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=60',
    images: ['https://picsum.photos/800/600?random=60','https://picsum.photos/800/600?random=61','https://picsum.photos/800/600?random=62'],
    amenities: ['Jardins Centenaires','3 Piscines','Spa','Casino','5 Restaurants','Bar Churchill','WiFi','Hammam Royal','Tennis'],
    currency: 'MAD', rating: 9.5, reviewCount: 2341, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-ma-002', name: 'Four Seasons Resort Marrakech', slug: 'four-seasons-marrakech',
    description: 'Resort luxueux en plein cœur de Marrakech avec jardins andalous et vue sur l\'Atlas.',
    address: '1 Boulevard de la Menara, Marrakech', city: 'Marrakech', country: 'Maroc',
    lat: 31.6089, lng: -8.0083, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=63',
    images: ['https://picsum.photos/800/600?random=63','https://picsum.photos/800/600?random=64'],
    amenities: ['2 Piscines','Spa','Restaurant','Bar','Gym','WiFi','Hammam','Navette Médina'],
    currency: 'MAD', rating: 9.3, reviewCount: 1876, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-ma-003', name: 'Sofitel Casablanca Tour Blanche', slug: 'sofitel-casablanca',
    description: 'Hôtel d\'affaires et loisirs au cœur économique du Maroc, design contemporain et cuisine française.',
    address: 'Rue Sidi Belyout, Casablanca 20000', city: 'Casablanca', country: 'Maroc',
    lat: 33.5914, lng: -7.6207, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=65',
    images: ['https://picsum.photos/800/600?random=65','https://picsum.photos/800/600?random=66'],
    amenities: ['Piscine','Spa','2 Restaurants','Bar','Salle Conférence','WiFi','Gym','Parking'],
    currency: 'MAD', rating: 8.8, reviewCount: 1102, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-ma-004', name: 'Riad Fès - Relais & Châteaux', slug: 'riad-fes',
    description: 'Riad authentique du XIXe siècle en plein cœur de la médina de Fès, patrimoine mondial UNESCO.',
    address: 'Medina, Fès 30000', city: 'Fès', country: 'Maroc',
    lat: 34.0643, lng: -4.9773, stars: 5, category: 'VILLA',
    mainImage: 'https://picsum.photos/800/600?random=67',
    images: ['https://picsum.photos/800/600?random=67','https://picsum.photos/800/600?random=68'],
    amenities: ['Patio Andalou','Piscine','Spa','Restaurant Marocain','WiFi','Hammam','Rooftop','Guide Médina'],
    currency: 'MAD', rating: 9.1, reviewCount: 543, isActive: true, isFeatured: true,
    isAlcoholFree: true, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: false, isBeachfront: false },

  { id: 'hotel-ma-005', name: 'Mazagan Beach & Golf Resort', slug: 'mazagan-resort',
    description: 'Resort balnéaire et golfique unique en son genre sur la côte atlantique marocaine.',
    address: 'El Jadida, Route de Casablanca', city: 'El Jadida', country: 'Maroc',
    lat: 33.2316, lng: -8.5007, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=69',
    images: ['https://picsum.photos/800/600?random=69','https://picsum.photos/800/600?random=70'],
    amenities: ['Golf 18 Trous','Casino','Plage Océan','5 Piscines','Spa','7 Restaurants','Centre Équestre','WiFi'],
    currency: 'MAD', rating: 8.9, reviewCount: 789, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: false,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: true },

  { id: 'hotel-ma-006', name: 'Movenpick Hotel Mansour Eddahbi', slug: 'movenpick-marrakech',
    description: 'Complexe hôtelier 5 étoiles à Marrakech avec palmeraie et spa marocain traditionnel.',
    address: 'Avenue de France, Marrakech', city: 'Marrakech', country: 'Maroc',
    lat: 31.6375, lng: -7.9901, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=71',
    images: ['https://picsum.photos/800/600?random=71','https://picsum.photos/800/600?random=72'],
    amenities: ['Palmeraie','Piscine Olympique','Spa','Casino','4 Restaurants','Tennis','WiFi'],
    currency: 'MAD', rating: 8.6, reviewCount: 934, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-ma-007', name: 'Hyatt Regency Casablanca', slug: 'hyatt-casablanca',
    description: 'Hôtel d\'affaires premium en plein centre de Casablanca, idéal pour voyageurs professionnels.',
    address: 'Place des Nations Unies, Casablanca', city: 'Casablanca', country: 'Maroc',
    lat: 33.5918, lng: -7.6135, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=73',
    images: ['https://picsum.photos/800/600?random=73','https://picsum.photos/800/600?random=74'],
    amenities: ['Restaurant','Bar','Piscine','Spa','Salle Conférence 1000 pers','WiFi','Gym','Valet'],
    currency: 'MAD', rating: 8.7, reviewCount: 1456, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: false, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-ma-008', name: 'Kenzi Agdal Resort Marrakech', slug: 'kenzi-agdal',
    description: 'Resort marocain authentique avec architecture traditionnelle et jardins parfumés.',
    address: 'Avenue Mohamed VI, Marrakech', city: 'Marrakech', country: 'Maroc',
    lat: 31.5960, lng: -8.0144, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=75',
    images: ['https://picsum.photos/800/600?random=75','https://picsum.photos/800/600?random=76'],
    amenities: ['Jardins','3 Piscines','Spa Marocain','Hammam','3 Restaurants','Tennis','WiFi','Animation'],
    currency: 'MAD', rating: 8.4, reviewCount: 678, isActive: true, isFeatured: false,
    isAlcoholFree: true, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: true, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  // ALGERIA HOTELS (5 hotels)
  { id: 'hotel-dz-001', name: 'Sheraton Club des Pins Resort', slug: 'sheraton-club-des-pins',
    description: 'Resort luxueux sur le front de mer d\'Alger, dans le quartier prisé du Club des Pins.',
    address: 'Club des Pins, Staoueli, Alger', city: 'Alger', country: 'Algérie',
    lat: 36.7291, lng: 2.8981, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=77',
    images: ['https://picsum.photos/800/600?random=77','https://picsum.photos/800/600?random=78'],
    amenities: ['Plage Privée','2 Piscines','Spa','3 Restaurants','Tennis','WiFi','Casino','Gym'],
    currency: 'DZD', rating: 8.6, reviewCount: 423, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: true },

  { id: 'hotel-dz-002', name: 'Sofitel Alger Hamma Garden', slug: 'sofitel-alger',
    description: 'Hôtel de luxe dans le quartier des ambassades d\'Alger, vue sur la baie d\'Alger.',
    address: 'Riad El Feth, Alger 16000', city: 'Alger', country: 'Algérie',
    lat: 36.7525, lng: 3.0589, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=79',
    images: ['https://picsum.photos/800/600?random=79','https://picsum.photos/800/600?random=80'],
    amenities: ['Vue Baie','Restaurant Gastronomique','Bar','Piscine','Spa','WiFi','Salle Conférence','Gym'],
    currency: 'DZD', rating: 8.8, reviewCount: 312, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-dz-003', name: 'El Aurassi Hotel Alger', slug: 'el-aurassi-alger',
    description: 'Hôtel emblématique d\'Alger offrant une vue panoramique exceptionnelle sur la Méditerranée.',
    address: 'Ave Frantz Fanon, Alger', city: 'Alger', country: 'Algérie',
    lat: 36.7432, lng: 3.0591, stars: 4, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=81',
    images: ['https://picsum.photos/800/600?random=81','https://picsum.photos/800/600?random=82'],
    amenities: ['Vue Méditerranée','2 Restaurants','Bar','Piscine','Salle Conférence','WiFi','Parking'],
    currency: 'DZD', rating: 7.9, reviewCount: 567, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: false, isBeachfront: false },

  { id: 'hotel-dz-004', name: 'Marriott Oran Hotel', slug: 'marriott-oran',
    description: 'Première enseigne Marriott en Algérie dans la ville d\'Oran, standards internationaux.',
    address: 'Boulvard Maata Mohamed, Oran', city: 'Oran', country: 'Algérie',
    lat: 35.6969, lng: -0.6341, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=83',
    images: ['https://picsum.photos/800/600?random=83','https://picsum.photos/800/600?random=84'],
    amenities: ['Piscine','Spa','2 Restaurants','Bar Rooftop','WiFi','Gym','Salle Conférence','Parking'],
    currency: 'DZD', rating: 8.5, reviewCount: 234, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-dz-005', name: 'Hilton Alger', slug: 'hilton-alger',
    description: 'Hôtel international de standing dans le quartier d\'affaires d\'Alger.',
    address: 'Pins Maritimes, Alger', city: 'Alger', country: 'Algérie',
    lat: 36.7389, lng: 3.0534, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=85',
    images: ['https://picsum.photos/800/600?random=85','https://picsum.photos/800/600?random=86'],
    amenities: ['Vue Mer','Restaurant','Bar','Piscine','Spa','WiFi','Gym','Navette Aéroport'],
    currency: 'DZD', rating: 8.7, reviewCount: 189, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  // EGYPT HOTELS (10 hotels)
  { id: 'hotel-eg-001', name: 'Four Seasons Resort Sharm El Sheikh', slug: 'four-seasons-sharm',
    description: 'Resort de luxe avec vue sur la Mer Rouge, accès direct au récif corallien et plongée sous-marine.',
    address: 'South Sinai, Sharm El Sheikh', city: 'Sharm El Sheikh', country: 'Égypte',
    lat: 27.9158, lng: 34.3299, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=100',
    images: ['https://picsum.photos/800/600?random=100','https://picsum.photos/800/600?random=101'],
    amenities: ['Plage Privée Mer Rouge','Centre Plongée','3 Piscines','Spa','4 Restaurants','Tennis','WiFi','Reef Club'],
    currency: 'EGP', rating: 9.1, reviewCount: 1876, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: true },

  { id: 'hotel-eg-002', name: 'Marriott Mena House Cairo', slug: 'marriott-mena-house',
    description: 'Hôtel historique de 1869 avec vue directe sur les Pyramides de Gizeh, jardin de 40 acres.',
    address: '6 Pyramids Road, Giza, Cairo', city: 'Le Caire', country: 'Égypte',
    lat: 29.9878, lng: 31.1340, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=102',
    images: ['https://picsum.photos/800/600?random=102','https://picsum.photos/800/600?random=103'],
    amenities: ['Vue Pyramides','Piscine Historique','Spa','3 Restaurants','Bar','Golf','WiFi','Salle Conférence'],
    currency: 'EGP', rating: 9.0, reviewCount: 2341, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-eg-003', name: 'Kempinski Nile Hotel Cairo', slug: 'kempinski-cairo',
    description: 'Hôtel de luxe sur les rives du Nil avec vue panoramique sur le fleuve sacré.',
    address: '12 Ahmed Ragheb Street, Garden City, Cairo', city: 'Le Caire', country: 'Égypte',
    lat: 30.0381, lng: 31.2268, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=104',
    images: ['https://picsum.photos/800/600?random=104','https://picsum.photos/800/600?random=105'],
    amenities: ['Vue Nil','Piscine','Spa','Restaurant Français','Bar Rooftop','WiFi','Gym','Concierge'],
    currency: 'EGP', rating: 8.9, reviewCount: 1102, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-eg-004', name: 'Baron Palace Sahl Hasheesh', slug: 'baron-palace-hurghada',
    description: 'Magnifique palais balnéaire tout inclus sur la Mer Rouge avec plage de sable blanc immaculé.',
    address: 'Sahl Hasheesh Bay, Hurghada', city: 'Hurghada', country: 'Égypte',
    lat: 27.1461, lng: 33.8744, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=106',
    images: ['https://picsum.photos/800/600?random=106','https://picsum.photos/800/600?random=107'],
    amenities: ['Plage Privée','5 Piscines','Sports Nautiques','Spa','7 Restaurants','Animation','Club Enfants','Tout Inclus'],
    currency: 'EGP', rating: 8.7, reviewCount: 3210, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: true, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: true },

  { id: 'hotel-eg-005', name: 'Steigenberger Al Dau Beach Hotel', slug: 'steigenberger-hurghada',
    description: 'Complexe balnéaire allemand de renommée mondiale avec services halal complets.',
    address: 'Al Dau Bay, Hurghada', city: 'Hurghada', country: 'Égypte',
    lat: 27.2042, lng: 33.8372, stars: 5, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=108',
    images: ['https://picsum.photos/800/600?random=108','https://picsum.photos/800/600?random=109'],
    amenities: ['Plage Privée','4 Piscines','Plongée','Spa','6 Restaurants','Bar Sans Alcool','WiFi','Animation Famille'],
    currency: 'EGP', rating: 8.8, reviewCount: 1567, isActive: true, isFeatured: true,
    isAlcoholFree: true, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: true, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: true },

  { id: 'hotel-eg-006', name: 'Sofitel Legend Old Cataract Aswan', slug: 'sofitel-aswan',
    description: "Palace victorien légendaire d'Assouan inspiré d'Agatha Christie, vue sur le Nil et l'île Éléphantine.",
    address: 'Abtal El Tahrir Street, Aswan', city: 'Assouan', country: 'Égypte',
    lat: 24.0756, lng: 32.8987, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=110',
    images: ['https://picsum.photos/800/600?random=110','https://picsum.photos/800/600?random=111'],
    amenities: ['Vue Nil','Piscine Historique','Spa','2 Restaurants','Bar','Felouque Privée','WiFi','Jardin Nubian'],
    currency: 'EGP', rating: 9.3, reviewCount: 789, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-eg-007', name: 'Winter Palace Hotel Luxor', slug: 'winter-palace-luxor',
    description: "Hôtel historique de 1886 face aux temples de Karnak, ambiance coloniale et jardins tropicaux.",
    address: 'Corniche El Nil, Luxor', city: 'Louxor', country: 'Égypte',
    lat: 25.6918, lng: 32.6421, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=112',
    images: ['https://picsum.photos/800/600?random=112','https://picsum.photos/800/600?random=113'],
    amenities: ['Vue Nil','Jardin Tropical','Piscine','Restaurant','Bar','WiFi','Visite Temples','Tennis'],
    currency: 'EGP', rating: 8.6, reviewCount: 934, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-eg-008', name: 'Albatros Aqua Park Sharm', slug: 'albatros-aquapark-sharm',
    description: 'Complexe familial tout inclus avec parc aquatique géant et plage privée Mer Rouge.',
    address: 'Nabq Bay, Sharm El Sheikh', city: 'Sharm El Sheikh', country: 'Égypte',
    lat: 27.9756, lng: 34.4178, stars: 4, category: 'RESORT',
    mainImage: 'https://picsum.photos/800/600?random=114',
    images: ['https://picsum.photos/800/600?random=114','https://picsum.photos/800/600?random=115'],
    amenities: ['Parc Aquatique','Plage Privée','4 Piscines','Club Enfants','5 Restaurants','Animation','Tout Inclus','WiFi'],
    currency: 'EGP', rating: 8.3, reviewCount: 4521, isActive: true, isFeatured: true,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: true, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: true },

  { id: 'hotel-eg-009', name: 'Conrad Cairo Hotel & Casino', slug: 'conrad-cairo',
    description: "Hôtel business premium sur l'île de Zamalek au Nil, quartier diplomatique du Caire.",
    address: '1191 Nile Corniche, Zamalek, Cairo', city: 'Le Caire', country: 'Égypte',
    lat: 30.0618, lng: 31.2242, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=116',
    images: ['https://picsum.photos/800/600?random=116','https://picsum.photos/800/600?random=117'],
    amenities: ['Vue Nil','Casino','Piscine','Spa','3 Restaurants','Bar','WiFi','Gym','Salle Conférence'],
    currency: 'EGP', rating: 8.8, reviewCount: 1234, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: false, isHalalCertified: false, hasRamadanServices: true,
    hasPrayerRoom: false, hasSeparatePool: false, isFamilyConservative: false, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-eg-010', name: 'Helnan Palestine Hotel Alexandria', slug: 'helnan-palestine-alex',
    description: "Hôtel historique d'Alexandrie sur la corniche méditerranéenne, hérita de l'époque royale.",
    address: 'Montazah Palace Grounds, Alexandria', city: 'Alexandrie', country: 'Égypte',
    lat: 31.2973, lng: 30.0280, stars: 5, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=118',
    images: ['https://picsum.photos/800/600?random=118','https://picsum.photos/800/600?random=119'],
    amenities: ['Jardins Royaux','Plage Méditerranée','Piscine','2 Restaurants','WiFi','Tennis','Vue Mer'],
    currency: 'EGP', rating: 8.4, reviewCount: 678, isActive: true, isFeatured: false,
    isAlcoholFree: false, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: true, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: true },

  // MAURITANIA HOTELS (4 hotels)
  { id: 'hotel-mr-001', name: 'Azalaï Hotel Nouakchott', slug: 'azalai-nouakchott',
    description: 'Meilleur hôtel de Nouakchott, référence business et diplomatique de Mauritanie avec cuisine africaine authentique.',
    address: 'Avenue Gamal Abdel Nasser, Nouakchott', city: 'Nouakchott', country: 'Mauritanie',
    lat: 18.0735, lng: -15.9582, stars: 4, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=120',
    images: ['https://picsum.photos/800/600?random=120','https://picsum.photos/800/600?random=121'],
    amenities: ['Piscine','Restaurant Africain','WiFi','Climatisation','Parking','Salle Conférence','Bar Sans Alcool','Mosquée'],
    currency: 'MRU', rating: 7.8, reviewCount: 234, isActive: true, isFeatured: true,
    isAlcoholFree: true, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-mr-002', name: 'Auberge Sahara Atar', slug: 'auberge-sahara-atar',
    description: "Lodge désertique authentique dans la région d'Atar, porte d'entrée de l'Adrar, coucher de soleil sur les dunes.",
    address: "Route d'Atar, Adrar", city: 'Atar', country: 'Mauritanie',
    lat: 20.5167, lng: -13.0500, stars: 3, category: 'VILLA',
    mainImage: 'https://picsum.photos/800/600?random=122',
    images: ['https://picsum.photos/800/600?random=122','https://picsum.photos/800/600?random=123'],
    amenities: ['Vue Désert','Tentes Sahariennes','Cuisine Mauritanienne','Excursions Dunes','Thé Traditionnel','Ciel Étoilé','WiFi'],
    currency: 'MRU', rating: 8.5, reviewCount: 89, isActive: true, isFeatured: true,
    isAlcoholFree: true, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: false, isBeachfront: false },

  { id: 'hotel-mr-003', name: 'Novotel Nouakchott', slug: 'novotel-nouakchott',
    description: "Hôtel international standard dans la capitale mauritanienne, idéal pour voyageurs d'affaires.",
    address: 'Ilot K, Tevragh-Zeina, Nouakchott', city: 'Nouakchott', country: 'Mauritanie',
    lat: 18.0860, lng: -15.9644, stars: 4, category: 'HOTEL',
    mainImage: 'https://picsum.photos/800/600?random=124',
    images: ['https://picsum.photos/800/600?random=124','https://picsum.photos/800/600?random=125'],
    amenities: ['Piscine','Restaurant','WiFi','Gym','Parking','Salle Conférence','Navette Aéroport'],
    currency: 'MRU', rating: 7.6, reviewCount: 156, isActive: true, isFeatured: false,
    isAlcoholFree: true, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: false, hasAirportShuttle: true, isBeachfront: false },

  { id: 'hotel-mr-004', name: 'Lodge Terjit Oasis', slug: 'lodge-terjit-oasis',
    description: 'Oasis paradisiaque dans le désert mauritanien avec sources d\'eau chaude naturelles et palmiers centenaires.',
    address: 'Oasis de Terjit, Adrar', city: 'Terjit', country: 'Mauritanie',
    lat: 19.8833, lng: -13.3167, stars: 3, category: 'VILLA',
    mainImage: 'https://picsum.photos/800/600?random=126',
    images: ['https://picsum.photos/800/600?random=126','https://picsum.photos/800/600?random=127'],
    amenities: ['Sources Chaudes','Palmiers','Cuisine Traditionnelle','Chamelles','Excursions','Artisanat Local','Silence Absolu'],
    currency: 'MRU', rating: 9.0, reviewCount: 67, isActive: true, isFeatured: true,
    isAlcoholFree: true, isBurkiniAccepted: true, isHalalCertified: true, hasRamadanServices: true,
    hasPrayerRoom: true, hasSeparatePool: false, isFamilyConservative: true, isMedicalTourism: false,
    isHoneymoonPackage: true, hasAirportShuttle: false, isBeachfront: false },
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
  { city: 'Marrakech', country: 'Maroc', image: 'https://picsum.photos/400/300?random=90', hotelsCount: 8 },
  { city: 'Casablanca', country: 'Maroc', image: 'https://picsum.photos/400/300?random=91', hotelsCount: 6 },
  { city: 'Alger', country: 'Algérie', image: 'https://picsum.photos/400/300?random=92', hotelsCount: 5 },
  { city: 'Fès', country: 'Maroc', image: 'https://picsum.photos/400/300?random=93', hotelsCount: 3 },
  { city: 'Le Caire', country: 'Égypte', image: 'https://picsum.photos/400/300?random=130', hotelsCount: 10, emoji: '🏛️' },
  { city: 'Hurghada', country: 'Égypte', image: 'https://picsum.photos/400/300?random=131', hotelsCount: 8, emoji: '🤿' },
  { city: 'Sharm El Sheikh', country: 'Égypte', image: 'https://picsum.photos/400/300?random=132', hotelsCount: 6, emoji: '🐠' },
  { city: 'Nouakchott', country: 'Mauritanie', image: 'https://picsum.photos/400/300?random=133', hotelsCount: 4, emoji: '🌅' },
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

    const currency = hotel.currency || 'TND';
    let basePrice = pricePerNight;
    if (currency === 'EGP') basePrice *= 10;
    if (currency === 'MRU') basePrice *= 12;
    const currencyMultiplier = currency === 'MAD' ? 3.5 : currency === 'DZD' ? 40 : currency === 'EGP' ? 10 : currency === 'MRU' ? 12 : 1;
    const pricePerNightConverted = Math.round(pricePerNight * currencyMultiplier);
    const totalPriceConverted = pricePerNightConverted * nights;
    const originalTotalConverted = hasDiscount ? Math.round(totalPriceConverted / (1 - discountPct / 100)) : totalPriceConverted;

    offers.push({
      id: `offer-${hotel.id}-${provider.key}`,
      hotelId: hotel.id,
      sourceProvider: provider.key,
      providerName: provider.name,
      providerColor: provider.color,
      providerLogo: provider.logo,
      originalPrice: originalTotalConverted,
      discountedPrice: totalPriceConverted,
      pricePerNight: pricePerNightConverted,
      priceTND: pricePerNight,
      currency,
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

function searchHotels({ destination, stars, category, minPrice, maxPrice, amenities, sortBy, guests = 1,
  isAlcoholFree, isBurkiniAccepted, isHalalCertified, hasRamadanServices, hasPrayerRoom,
  hasSeparatePool, isFamilyConservative, isMedicalTourism, isHoneymoonPackage, hasAirportShuttle, isBeachfront, country }) {
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
  if (isAlcoholFree === 'true') results = results.filter(h => h.isAlcoholFree);
  if (isBurkiniAccepted === 'true') results = results.filter(h => h.isBurkiniAccepted);
  if (isHalalCertified === 'true') results = results.filter(h => h.isHalalCertified);
  if (hasRamadanServices === 'true') results = results.filter(h => h.hasRamadanServices);
  if (hasPrayerRoom === 'true') results = results.filter(h => h.hasPrayerRoom);
  if (hasSeparatePool === 'true') results = results.filter(h => h.hasSeparatePool);
  if (isFamilyConservative === 'true') results = results.filter(h => h.isFamilyConservative);
  if (isMedicalTourism === 'true') results = results.filter(h => h.isMedicalTourism);
  if (isHoneymoonPackage === 'true') results = results.filter(h => h.isHoneymoonPackage);
  if (hasAirportShuttle === 'true') results = results.filter(h => h.hasAirportShuttle);
  if (isBeachfront === 'true') results = results.filter(h => h.isBeachfront);
  if (country) results = results.filter(h => h.country.toLowerCase().includes(country.toLowerCase()));

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

// ─── New functions ────────────────────────────────────────────────────────────

function getFeaturedHotels() {
  return MOCK_HOTELS.filter(h => h.isFeatured && h.isActive);
}

function getPopularDestinations() {
  return POPULAR_DESTINATIONS;
}

function getHotelReviews(hotelId) {
  return MOCK_REVIEWS.map(r => ({ ...r, hotelId }));
}

async function addReview(hotelId, reviewData) {
  const review = { id: 'rev-' + Date.now(), hotelId, ...reviewData, createdAt: new Date().toISOString() };
  return review;
}

async function toggleFavorite(userId, hotelId) {
  return { userId, hotelId, isFavorite: true };
}

async function getUserFavorites(userId) {
  return MOCK_HOTELS.filter(h => h.isFeatured).map(h => ({ ...h, userId }));
}

function getFlashDeals() {
  const now = Date.now();
  const deals = MOCK_HOTELS.slice(0, 12).map((hotel, idx) => {
    const discountPct = 25 + Math.floor(Math.random() * 36); // 25–60%
    const basePrice = getBasePrice(hotel);
    const originalPrice = Math.round(basePrice * (1 + Math.random() * 0.3));
    const newPrice = Math.round(originalPrice * (1 - discountPct / 100));
    const hoursLeft = 2 + Math.floor(Math.random() * 22);
    return {
      id: 'flash-' + hotel.id,
      hotelId: hotel.id,
      hotelName: hotel.name,
      image: hotel.mainImage,
      stars: hotel.stars,
      city: hotel.city,
      country: hotel.country,
      category: hotel.category,
      originalPrice,
      newPrice,
      discountPct,
      providerName: ['Booking.com', 'Expedia', 'Hotels.com', 'Direct'][idx % 4],
      expiryTs: now + hoursLeft * 3600 * 1000,
      hoursLeft,
    };
  });
  return deals.sort((a, b) => b.discountPct - a.discountPct);
}

function getPriceCalendar(hotelId, month, year, guests) {
  const hotel = getHotelById(hotelId);
  const base = hotel ? getBasePrice(hotel) : 200;
  const daysInMonth = new Date(year, month, 0).getDate();
  const result = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow = new Date(dateStr).getDay();
    const isWeekend = dow === 0 || dow === 6;
    const variation = 0.75 + Math.random() * 0.5;
    const weekendMult = isWeekend ? 1.2 : 1;
    const price = Math.round(base * variation * weekendMult * (guests / 2));
    const avail = Math.random() > 0.1;
    result.push({ date: dateStr, price: avail ? price : null, availability: avail });
  }
  return result;
}

function getSimilarHotels(hotelId, limit = 4) {
  const hotel = getHotelById(hotelId);
  if (!hotel) return [];
  return MOCK_HOTELS
    .filter(h => h.id !== hotelId && h.isActive && (h.city === hotel.city || h.stars === hotel.stars))
    .slice(0, limit)
    .map(h => {
      const ci = new Date().toISOString().split('T')[0];
      const co = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const prices = generateMockPrices(h, ci, co, 2);
      return { ...h, bestOffer: prices[0], bestPrice: prices[0].discountedPrice };
    });
}

function getTrendingHotels() {
  const TREND_BADGES = ['🔥 Populaire', '⭐ Top noté', '💎 Luxe', '🏖 Plage', '🌟 Tendance', '🎯 Meilleur rapport'];
  return MOCK_HOTELS
    .filter(h => h.isActive)
    .slice(0, 6)
    .map((h, i) => {
      const ci = new Date().toISOString().split('T')[0];
      const co = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const prices = generateMockPrices(h, ci, co, 2);
      return {
        ...h,
        bestOffer: prices[0],
        bestPrice: prices[0].discountedPrice,
        trendBadge: TREND_BADGES[i % TREND_BADGES.length],
        viewsThisWeek: 150 + Math.floor(Math.random() * 500),
      };
    });
}

function getLastMinuteDeals() {
  const now = Date.now();
  return MOCK_HOTELS.slice(0, 6).map((hotel, i) => {
    const discountPct = 15 + Math.floor(Math.random() * 25);
    const baseP = getBasePrice(hotel);
    const originalPrice = Math.round(baseP * 1.2);
    const newPrice = Math.round(originalPrice * (1 - discountPct / 100));
    const hoursLeft = 6 + Math.floor(Math.random() * 42);
    return {
      id: 'lm-' + hotel.id,
      hotelId: hotel.id,
      hotelName: hotel.name,
      image: hotel.mainImage,
      stars: hotel.stars,
      city: hotel.city,
      country: hotel.country,
      originalPrice,
      newPrice,
      discountPct,
      expiryTs: now + hoursLeft * 3600 * 1000,
    };
  });
}

module.exports = {
  MOCK_HOTELS,
  POPULAR_DESTINATIONS,
  MOCK_REVIEWS,
  generateMockPrices,
  searchHotels,
  getHotelById,
  getHotelRooms,
  getFeaturedHotels,
  getPopularDestinations,
  getHotelReviews,
  addReview,
  toggleFavorite,
  getUserFavorites,
  getFlashDeals,
  getPriceCalendar,
  getSimilarHotels,
  getTrendingHotels,
  getLastMinuteDeals,
};
