'use strict';
/**
 * subscriptionBilling — débite automatiquement le wallet des prestataires actifs.
 * Tarif : 1 TND/jour.
 * - Si wallet >= 1 TND → débit + log
 * - Si wallet < 1 TND → suspend l'abonnement + notification push
 *
 * Lancé une fois par jour à minuit (ou au démarrage si pas encore lancé aujourd'hui).
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DAILY_RATE = 1.0; // TND
const PROVIDER_ROLES = ['CHAUFFEUR', 'LIVREUR', 'DEPANNEUR'];

async function runDailyBilling() {
  const startedAt = new Date();
  console.log(`[Billing] Starting daily billing run — ${startedAt.toISOString()}`);

  try {
    // Fetch all active providers with active subscription
    const providers = await prisma.user.findMany({
      where: {
        role: { in: PROVIDER_ROLES },
        subscriptionActive: true,
        suspended: false,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        walletBalance: true,
        fcmToken: true,
        role: true,
      },
    });

    let billed = 0;
    let suspended = 0;

    for (const provider of providers) {
      const balance = Number(provider.walletBalance || 0);

      if (balance >= DAILY_RATE) {
        // Debit wallet
        await prisma.user.update({
          where: { id: provider.id },
          data: { walletBalance: { decrement: DAILY_RATE } },
        });

        // Log transaction
        await prisma.walletTransaction.create({
          data: {
            userId: provider.id,
            amount: -DAILY_RATE,
            type: 'SUBSCRIPTION',
            description: `Abonnement EASYWAY — ${new Date().toLocaleDateString('fr-TN')}`,
          },
        }).catch(() => {});

        billed++;
      } else {
        // Insufficient balance — suspend subscription
        await prisma.user.update({
          where: { id: provider.id },
          data: { subscriptionActive: false },
        });

        // Send push notification via Expo
        if (provider.fcmToken) {
          const axios = require('axios');
          axios.post('https://exp.host/--/api/v2/push/send', {
            to: provider.fcmToken,
            title: '⚠️ Abonnement suspendu',
            body: 'Votre wallet EASYWAY est insuffisant. Rechargez pour continuer à recevoir des courses.',
            data: { screen: 'Wallet', type: 'SUBSCRIPTION_SUSPENDED' },
            sound: 'default',
          }).catch(() => {});
        }

        suspended++;
        console.log(`[Billing] Suspended ${provider.role} ${provider.id} — balance: ${balance} TND`);
      }
    }

    console.log(`[Billing] Done — ${billed} billed, ${suspended} suspended (${providers.length} total)`);
    return { billed, suspended, total: providers.length };
  } catch (err) {
    console.error('[Billing] Error:', err.message);
    return { error: err.message };
  }
}

function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
}

function startBillingScheduler() {
  // Run immediately once, then schedule daily at midnight
  const delay = msUntilMidnight();
  console.log(`[Billing] Scheduler started — next run in ${Math.round(delay / 3600000)}h`);

  setTimeout(() => {
    runDailyBilling();
    // Then repeat every 24h
    setInterval(runDailyBilling, 24 * 60 * 60 * 1000);
  }, delay);
}

module.exports = { startBillingScheduler, runDailyBilling };
