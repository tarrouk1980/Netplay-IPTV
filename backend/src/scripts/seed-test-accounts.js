'use strict';

/**
 * Seed comptes de test EASYWAY
 * Usage: node backend/src/scripts/seed-test-accounts.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TEST_ACCOUNTS = [
  {
    name: 'Client Test',
    phone: '+21600000001',
    email: 'client@test.com',
    password: 'test123',
    role: 'CLIENT',
    kycStatus: 'NOT_REQUIRED',
  },
  {
    name: 'Chauffeur Test',
    phone: '+21600000002',
    email: 'chauffeur@test.com',
    password: 'test123',
    role: 'CHAUFFEUR',
    kycStatus: 'APPROVED',
  },
  {
    name: 'Livreur Test',
    phone: '+21600000003',
    email: 'livreur@test.com',
    password: 'test123',
    role: 'LIVREUR',
    kycStatus: 'APPROVED',
  },
  {
    name: 'Dépanneur Test',
    phone: '+21600000004',
    email: 'depanneur@test.com',
    password: 'test123',
    role: 'DEPANNEUR',
    kycStatus: 'APPROVED',
  },
  {
    name: 'Marchand Test',
    phone: '+21600000005',
    email: 'marchand@test.com',
    password: 'test123',
    role: 'MARCHAND',
    kycStatus: 'APPROVED',
  },
  {
    name: 'Admin EASYWAY',
    phone: '+21600000000',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'ADMIN',
    kycStatus: 'NOT_REQUIRED',
  },
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

    // Abonnement actif pour les prestataires
    if (['CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'].includes(account.role)) {
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours
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

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Comptes de test créés :');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CLIENT     client@test.com      / test123');
  console.log('CHAUFFEUR  chauffeur@test.com   / test123');
  console.log('LIVREUR    livreur@test.com     / test123');
  console.log('DÉPANNEUR  depanneur@test.com   / test123');
  console.log('MARCHAND   marchand@test.com    / test123');
  console.log('ADMIN      admin@test.com       / admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nTous les prestataires ont un pass MENSUEL actif (30 jours).');
  console.log('Connexion par téléphone: +21600000001 à +21600000005 / +21600000000\n');
}

main()
  .catch((e) => { console.error('❌ Erreur:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
