'use strict';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('ioredis');

// Setup process.env before loading modules
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_characters_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_long';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES = '30d';

const mockRedis = {
  setex: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
  set: jest.fn().mockResolvedValue('OK'),
  exists: jest.fn().mockResolvedValue(1),
  on: jest.fn(),
  subscribe: jest.fn(),
  publish: jest.fn().mockResolvedValue(1),
  geoadd: jest.fn().mockResolvedValue(1),
  georadius: jest.fn().mockResolvedValue([]),
};

const Redis = require('ioredis');
Redis.mockImplementation(() => mockRedis);

// Track $transaction calls and subscription state
let mockSubscriptionState = null;
let transactionCallCount = 0;

const mockTx = {
  $queryRaw: jest.fn(),
  subscription: {
    update: jest.fn(),
  },
  order: {
    update: jest.fn(),
  },
};

const mockPrismaInstance = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  subscription: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  order: {
    update: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
};

const { PrismaClient } = require('@prisma/client');
PrismaClient.mockImplementation(() => mockPrismaInstance);

const request = require('supertest');
const app = require('../src/app');
const tokenService = require('../src/services/tokenService');

// Helper to generate a valid token for a provider user
function makeProviderToken(userId = 'provider_001', role = 'CHAUFFEUR') {
  return tokenService.signAccess({ id: userId, role, kycStatus: 'APPROVED' });
}

describe('Pass Consume - Subscription Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedis.exists.mockResolvedValue(1); // tokens are valid in Redis
    transactionCallCount = 0;
  });

  describe('Atomic consume transaction', () => {
    it('successfully consumes a ride from active subscription', async () => {
      const activeSub = {
        id: 'sub_001',
        providerId: 'provider_001',
        planType: 'MENSUEL',
        ridesTotal: 30,
        ridesConsumed: 5,
        ridesRemaining: 25,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      };

      mockTx.$queryRaw.mockResolvedValue([activeSub]);
      mockTx.subscription.update.mockResolvedValue({ ...activeSub, ridesConsumed: 6, ridesRemaining: 24 });
      mockTx.order.update.mockResolvedValue({ id: 'order_001', passConsumed: true });

      mockPrismaInstance.$transaction.mockImplementation(async (fn) => {
        return fn(mockTx);
      });

      const token = makeProviderToken();
      const res = await request(app)
        .post('/api/subscriptions/consume')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: 'order_001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockTx.$queryRaw).toHaveBeenCalled();
      expect(mockTx.subscription.update).toHaveBeenCalled();
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order_001' },
        data: { passConsumed: true },
      });
    });

    it('marks subscription as EXHAUSTED when last ride is consumed', async () => {
      const activeSub = {
        id: 'sub_001',
        providerId: 'provider_001',
        planType: 'SEMAINE',
        ridesTotal: 7,
        ridesConsumed: 6,
        ridesRemaining: 1, // Last ride
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      };

      mockTx.$queryRaw.mockResolvedValue([activeSub]);
      mockTx.subscription.update
        .mockResolvedValueOnce({ ...activeSub, ridesConsumed: 7, ridesRemaining: 0 })
        .mockResolvedValueOnce({ ...activeSub, status: 'EXHAUSTED', ridesRemaining: 0 });
      mockTx.order.update.mockResolvedValue({ id: 'order_002', passConsumed: true });

      mockPrismaInstance.$transaction.mockImplementation(async (fn) => {
        return fn(mockTx);
      });

      const token = makeProviderToken();
      const res = await request(app)
        .post('/api/subscriptions/consume')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: 'order_002' });

      expect(res.status).toBe(200);
      // Should have called update twice: once to decrement, once to mark EXHAUSTED
      expect(mockTx.subscription.update).toHaveBeenCalledTimes(2);
      expect(mockTx.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub_001' },
        data: { status: 'EXHAUSTED' },
      });
    });

    it('returns 402 when no active subscription', async () => {
      mockTx.$queryRaw.mockResolvedValue([]); // no subscription

      mockPrismaInstance.$transaction.mockImplementation(async (fn) => {
        return fn(mockTx);
      });

      const token = makeProviderToken();
      const res = await request(app)
        .post('/api/subscriptions/consume')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: 'order_003' });

      expect(res.status).toBe(402);
      expect(res.body.code).toBe('NO_ACTIVE_SUBSCRIPTION');
    });

    it('returns 402 when no rides remaining', async () => {
      const exhaustedSub = {
        id: 'sub_002',
        providerId: 'provider_001',
        planType: 'DECOUVERTE',
        ridesTotal: 1,
        ridesConsumed: 1,
        ridesRemaining: 0, // No rides left
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      };

      mockTx.$queryRaw.mockResolvedValue([exhaustedSub]);

      mockPrismaInstance.$transaction.mockImplementation(async (fn) => {
        return fn(mockTx);
      });

      const token = makeProviderToken();
      const res = await request(app)
        .post('/api/subscriptions/consume')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: 'order_004' });

      expect(res.status).toBe(402);
      expect(res.body.code).toBe('NO_RIDES_REMAINING');
    });
  });

  describe('PRO plan - unlimited rides', () => {
    it('PRO plan consume always succeeds regardless of ridesRemaining', async () => {
      const proSub = {
        id: 'sub_pro_001',
        providerId: 'provider_001',
        planType: 'PRO', // PRO plan
        ridesTotal: 9999,
        ridesConsumed: 9998,
        ridesRemaining: 0, // Even at 0 remaining, PRO should succeed
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      };

      mockTx.$queryRaw.mockResolvedValue([proSub]);
      mockTx.order.update.mockResolvedValue({ id: 'order_pro', passConsumed: true });

      mockPrismaInstance.$transaction.mockImplementation(async (fn) => {
        return fn(mockTx);
      });

      const token = makeProviderToken();
      const res = await request(app)
        .post('/api/subscriptions/consume')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: 'order_pro' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // PRO plan: subscription.update should NOT be called for ride decrement
      expect(mockTx.subscription.update).not.toHaveBeenCalled();
      // But order should be updated
      expect(mockTx.order.update).toHaveBeenCalledWith({
        where: { id: 'order_pro' },
        data: { passConsumed: true },
      });
    });

    it('PRO plan consume succeeds 5 concurrent times', async () => {
      const proSub = {
        id: 'sub_pro_002',
        providerId: 'provider_concurrent',
        planType: 'PRO',
        ridesTotal: 9999,
        ridesConsumed: 0,
        ridesRemaining: 9999,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      };

      mockTx.$queryRaw.mockResolvedValue([proSub]);
      mockTx.order.update.mockResolvedValue({ passConsumed: true });

      mockPrismaInstance.$transaction.mockImplementation(async (fn) => {
        return fn(mockTx);
      });

      const token = makeProviderToken('provider_concurrent');

      // Simulate 5 concurrent consume calls
      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/subscriptions/consume')
          .set('Authorization', `Bearer ${token}`)
          .send({ orderId: `concurrent_order_${i}` })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.status === 200).length;
      expect(successCount).toBe(5); // All 5 should succeed for PRO plan
    });
  });

  describe('Expired subscription', () => {
    it('returns 402 for expired subscription (query returns empty due to expiresAt filter)', async () => {
      // The SELECT FOR UPDATE query filters expiresAt > NOW(), so expired subs won't appear
      mockTx.$queryRaw.mockResolvedValue([]); // expired sub filtered out

      mockPrismaInstance.$transaction.mockImplementation(async (fn) => {
        return fn(mockTx);
      });

      const token = makeProviderToken('provider_expired');
      const res = await request(app)
        .post('/api/subscriptions/consume')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: 'order_expired' });

      expect(res.status).toBe(402);
      expect(res.body.code).toBe('NO_ACTIVE_SUBSCRIPTION');
    });
  });

  describe('Concurrent consume - non-PRO plans (race condition prevention)', () => {
    it('only valid decrements succeed with transaction isolation', async () => {
      let ridesRemaining = 3; // Only 3 rides left

      // Each transaction gets the current state
      mockPrismaInstance.$transaction.mockImplementation(async (fn) => {
        const currentRemaining = ridesRemaining;
        const localMockTx = {
          $queryRaw: jest.fn().mockResolvedValue([{
            id: 'sub_race_001',
            providerId: 'provider_race',
            planType: 'MENSUEL',
            ridesTotal: 30,
            ridesConsumed: 27,
            ridesRemaining: currentRemaining,
            status: currentRemaining > 0 ? 'ACTIVE' : 'EXHAUSTED',
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          }]),
          subscription: {
            update: jest.fn().mockImplementation(({ data }) => {
              if (data.ridesRemaining !== undefined) {
                ridesRemaining = Math.max(0, ridesRemaining - 1);
              }
              return Promise.resolve({});
            }),
          },
          order: {
            update: jest.fn().mockResolvedValue({ passConsumed: true }),
          },
        };
        return fn(localMockTx);
      });

      const token = makeProviderToken('provider_race');

      // 5 concurrent requests but only 3 rides available
      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/subscriptions/consume')
          .set('Authorization', `Bearer ${token}`)
          .send({ orderId: `race_order_${i}` })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((r) => r.status === 200).length;
      const failCount = results.filter((r) => r.status === 402).length;

      // With proper transaction isolation, exactly 3 should succeed
      expect(successCount).toBe(3);
      expect(failCount).toBe(2);
    });
  });
});
