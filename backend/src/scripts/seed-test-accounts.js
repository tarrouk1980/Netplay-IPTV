'use strict';

/**
 * Seed comptes de test EASYWAY
 * Usage: node backend/src/scripts/seed-test-accounts.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TEST_ACCOUNTS = [
  // CLIENTS (3)
  { name: 'Client Test 1', phone: '+21611000001', email: 'client1@test.com', password: 'test123', role: 'CLIENT', kycStatus: 'NOT_REQUIRED' },
  { name: 'Client Test 2', phone: '+21611000002', email: 'client2@test.com', password: 'test123', role: 'CLIENT', kycStatus: 'NOT_REQUIRED' },
  { name: 'Client Test 3', phone: '+21611000003', email: 'client3@test.com', password: 'test123', role: 'CLIENT', kycStatus: 'NOT_REQUIRED' },

  // CHAUFFEURS (3)
  { name: 'Chauffeur Test 1', phone: '+21622000001', email: 'chauffeur1@test.com', password: 'test123', role: 'CHAUFFEUR', kycStatus: 'APPROVED' },
  { name: 'Chauffeur Test 2', phone: '+21622000002', email: 'chauffeur2@test.com', password: 'test123', role: 'CHAUFFEUR', kycStatus: 'APPROVED' },
  { name: 'Chauffeur Test 3', phone: '+21622000003', email: 'chauffeur3@test.com', password: 'test123', role: 'CHAUFFEUR', kycStatus: 'APPROVED' },

  // LIVREURS (3)
  { name: 'Livreur Test 1', phone: '+21633000001', email: 'livreur1@test.com', password: 'test123', role: 'LIVREUR', kycStatus: 'APPROVED' },
  { name: 'Livreur Test 2', phone: '+21633000002', email: 'livreur2@test.com', password: 'test123', role: 'LIVREUR', kycStatus: 'APPROVED' },
  { name: 'Livreur Test 3', phone: '+21633000003', email: 'livreur3@test.com', password: 'test123', role: 'LIVREUR', kycStatus: 'APPROVED' },

  // DEPANNEURS (3)
  { name: 'Dépanneur Test 1', phone: '+21644000001', email: 'depanneur1@test.com', password: 'test123', role: 'DEPANNEUR', kycStatus: 'APPROVED' },
  { name: 'Dépanneur Test 2', phone: '+21644000002', email: 'depanneur2@test.com', password: 'test123', role: 'DEPANNEUR', kycStatus: 'APPROVED' },
  { name: 'Dépanneur Test 3', phone: '+21644000003', email: 'depanneur3@test.com', password: 'test123', role: 'DEPANNEUR', kycStatus: 'APPROVED' },

  // MARCHANDS (3)
  { name: 'Marchand Test 1', phone: '+21655000001', email: 'marchand1@test.com', password: 'test123', role: 'MARCHAND', kycStatus: 'APPROVED' },
  { name: 'Marchand Test 2', phone: '+21655000002', email: 'marchand2@test.com', password: 'test123', role: 'MARCHAND', kycStatus: 'APPROVED' },
  { name: 'Marchand Test 3', phone: '+21655000003', email: 'marchand3@test.com', password: 'test123', role: 'MARCHAND', kycStatus: 'APPROVED' },

  // ADMIN (1 seul)
  { name: 'Admin EASYWAY', phone: '+21600000000', email: 'admin@test.com', password: 'admin123', role: 'ADMIN', kycStatus: 'NOT_REQUIRED' },
];

async function main() {
  console.log('🌱 Création des comptes de test EASYWAY...\n');

  for (const account of TEST_ACCOUNTS) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone: account.phone }, { email: account.email }] },
    });

    if (existing) {
      console.log(`⚠️  Existe déjà: ${account.email} — mise à jour du mot de passe`);
      const hashed = await bcrypt.hash(account.password, 10);
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash: hashed, kycStatus: account.kycStatus },
      });
      continue;
    }

    const hashed = await bcrypt.hash(account.password, 10);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = await prisma.user.create({
      data: {
        name: account.name,
        phone: account.phone,
        email: account.email,
        passwordHash: hashed,
        role: account.role,
        kycStatus: account.kycStatus,
        referralCode,
      },
    });

    if (['CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'].includes(account.role)) {
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await prisma.subscription.create({
        data: {
          providerId: user.id,
          planType: 'MENSUEL',
          ridesTotal: 9999,
          ridesRemaining: 9999,
          ridesConsumed: 0,
          startDate: now,
          endDate: expires,
          expiresAt: expires,
          amount: 30,
          status: 'ACTIVE',
        },
      });
      console.log(`✅ ${account.role.padEnd(10)} ${account.email} — pass 30j créé`);
    } else {
      console.log(`✅ ${account.role.padEnd(10)} ${account.email}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Comptes de test créés (mot de passe: test123 / admin123):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CLIENT     client1@test.com      +21611000001');
  console.log('           client2@test.com      +21611000002');
  console.log('           client3@test.com      +21611000003');
  console.log('─────────────────────────────────────────────────────');
  console.log('CHAUFFEUR  chauffeur1@test.com   +21622000001');
  console.log('           chauffeur2@test.com   +21622000002');
  console.log('           chauffeur3@test.com   +21622000003');
  console.log('─────────────────────────────────────────────────────');
  console.log('LIVREUR    livreur1@test.com     +21633000001');
  console.log('           livreur2@test.com     +21633000002');
  console.log('           livreur3@test.com     +21633000003');
  console.log('─────────────────────────────────────────────────────');
  console.log('DÉPANNEUR  depanneur1@test.com   +21644000001');
  console.log('           depanneur2@test.com   +21644000002');
  console.log('           depanneur3@test.com   +21644000003');
  console.log('─────────────────────────────────────────────────────');
  console.log('MARCHAND   marchand1@test.com    +21655000001');
  console.log('           marchand2@test.com    +21655000002');
  console.log('           marchand3@test.com    +21655000003');
  console.log('─────────────────────────────────────────────────────');
  console.log('ADMIN      admin@test.com        +21600000000  / admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nTous les prestataires ont un pass MENSUEL actif (30 jours).');
}

main()
  .catch((e) => { console.error('❌ Erreur:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
