'use strict';
const { prisma } = require('../config/db');

// One-off cleanup for duplicate demo merchants created by repeated runs of
// seedDemo.js before it became idempotent (one row per name is kept, the
// rest — and their now-orphan MARCHAND user accounts — are deleted).
async function dedupe() {
  const merchants = await prisma.merchant.findMany({ orderBy: { createdAt: 'asc' } });
  const seenNames = new Set();
  const toDelete = [];

  for (const m of merchants) {
    if (seenNames.has(m.name)) {
      toDelete.push(m);
    } else {
      seenNames.add(m.name);
    }
  }

  for (const m of toDelete) {
    await prisma.merchant.delete({ where: { id: m.id } });
    await prisma.user.delete({ where: { id: m.userId } }).catch(() => {});
    console.log('Deleted duplicate:', m.name, m.id);
  }

  console.log(`Done. Removed ${toDelete.length} duplicate merchant(s).`);
  await prisma.$disconnect();
}
dedupe();
