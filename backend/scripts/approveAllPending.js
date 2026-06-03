'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      kycStatus: 'PENDING',
      role: { in: ['CHAUFFEUR', 'LIVREUR', 'DEPANNEUR', 'MARCHAND'] },
    },
    data: { kycStatus: 'APPROVED' },
  });
  console.log(`✅ ${result.count} comptes approuvés.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
