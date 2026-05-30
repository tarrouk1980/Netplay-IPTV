'use strict';
const { prisma } = require('../config/db');

async function seed() {
  const demos = [
    { name: 'Pizza Roma', category: 'RESTAURANT', address: 'Avenue Habib Bourguiba, Tunis' },
    { name: 'Pharmacie Centrale', category: 'PHARMACY', address: 'Rue de la Liberté, Tunis' },
    { name: 'Monoprix Lac', category: 'SUPERMARKET', address: 'Les Berges du Lac, Tunis' },
    { name: 'Beauty Studio', category: 'BEAUTY', address: 'La Marsa, Tunis' },
    { name: 'Pet Shop Minou', category: 'PETS', address: 'Ariana, Tunis' },
    { name: 'TechWorld', category: 'HIGHTECH', address: 'Centre Urbain Nord, Tunis' },
  ];
  // Create demo user for merchants if not exists
  for (const m of demos) {
    const phone = `+21699${Math.floor(100000 + Math.random()*900000)}`;
    try {
      const user = await prisma.user.create({
        data: { name: m.name, phone, role: 'MARCHAND', kycStatus: 'APPROVED' }
      });
      await prisma.merchant.create({
        data: { userId: user.id, name: m.name, category: m.category, address: m.address, priceAgreementSigned: true }
      });
      console.log('Created:', m.name);
    } catch(e) { console.log('Skip (exists):', m.name); }
  }
  await prisma.$disconnect();
}
seed();
