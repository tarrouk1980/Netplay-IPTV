'use strict';

/**
 * Seed script for hotel data.
 * Run: node src/scripts/seedHotels.js
 */

let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (e) {
  console.error('Prisma not available:', e.message);
  process.exit(1);
}

const { MOCK_HOTELS } = require('../services/hotelService');

async function seed() {
  console.log('Seeding hotels...');

  for (const hotel of MOCK_HOTELS) {
    try {
      await prisma.hotel.upsert({
        where: { slug: hotel.slug },
        update: {
          name: hotel.name,
          description: hotel.description,
          rating: hotel.rating,
          reviewCount: hotel.reviewCount,
          isFeatured: hotel.isFeatured,
        },
        create: {
          id: hotel.id,
          name: hotel.name,
          slug: hotel.slug,
          description: hotel.description,
          address: hotel.address,
          city: hotel.city,
          country: hotel.country,
          lat: hotel.lat,
          lng: hotel.lng,
          stars: hotel.stars,
          category: hotel.category,
          mainImage: hotel.mainImage,
          images: hotel.images,
          amenities: hotel.amenities,
          rating: hotel.rating,
          reviewCount: hotel.reviewCount,
          isActive: hotel.isActive,
          isFeatured: hotel.isFeatured,
        },
      });
      console.log(`  ✓ ${hotel.name}`);
    } catch (e) {
      console.error(`  ✗ ${hotel.name}:`, e.message);
    }
  }

  // Seed rooms for first hotel
  const rooms = [
    { hotelId: 'hotel-1', name: 'Chambre Standard', type: 'DOUBLE', maxGuests: 2, beds: 1, bathrooms: 1, size: 28, amenities: ['WiFi', 'TV', 'Climatisation'], images: ['https://picsum.photos/600/400?random=70'], isAvailable: true },
    { hotelId: 'hotel-1', name: 'Chambre Supérieure', type: 'DELUXE', maxGuests: 2, beds: 1, bathrooms: 1, size: 36, amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'], images: ['https://picsum.photos/600/400?random=71'], isAvailable: true },
    { hotelId: 'hotel-1', name: 'Suite Junior', type: 'SUITE', maxGuests: 2, beds: 1, bathrooms: 1, size: 55, amenities: ['WiFi', 'TV', 'Climatisation', 'Salon', 'Jacuzzi'], images: ['https://picsum.photos/600/400?random=72'], isAvailable: true },
  ];

  for (const room of rooms) {
    try {
      const existing = await prisma.hotelRoom.findFirst({ where: { hotelId: room.hotelId, name: room.name } });
      if (!existing) {
        await prisma.hotelRoom.create({ data: room });
        console.log(`  ✓ Room: ${room.name}`);
      }
    } catch (e) {
      console.error(`  ✗ Room ${room.name}:`, e.message);
    }
  }

  // Seed some reviews
  const reviews = [
    { hotelId: 'hotel-1', authorName: 'Sami Bouzid', rating: 9.0, title: 'Superbe hôtel', comment: 'Excellent séjour!', travelType: 'BUSINESS', pros: ['Personnel accueillant', 'Vue panoramique'], cons: ['Stationnement payant'] },
    { hotelId: 'hotel-2', authorName: 'Leila Mansouri', rating: 9.5, title: 'Parfait', comment: 'Le summum du luxe à Tunis.', travelType: 'COUPLE', pros: ['Piscine magnifique', 'Spa'], cons: [] },
    { hotelId: 'hotel-3', authorName: 'Famille Gharbi', rating: 8.0, title: 'Vacances en famille réussies', comment: 'Les enfants ont adoré!', travelType: 'FAMILY', pros: ['Club enfants', 'Plage propre'], cons: ['Chambres un peu petites'] },
  ];

  for (const rev of reviews) {
    try {
      await prisma.hotelReview.create({ data: rev });
      console.log(`  ✓ Review by ${rev.authorName}`);
    } catch (e) {
      if (!e.message.includes('Unique')) console.error(`  ✗ Review:`, e.message);
    }
  }

  console.log('\nSeed complete!');
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
