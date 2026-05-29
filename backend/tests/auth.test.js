'use strict';

// Mock dependencies before requiring app
jest.mock('@prisma/client');
jest.mock('ioredis');

const mockPrismaUser = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockPrismaInstance = {
  user: mockPrismaUser,
  $disconnect: jest.fn(),
};

const { PrismaClient } = require('@prisma/client');
PrismaClient.mockImplementation(() => mockPrismaInstance);

// Mock ioredis
const mockRedis = {
  setex: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
  set: jest.fn().mockResolvedValue('OK'),
  exists: jest.fn().mockResolvedValue(0),
  on: jest.fn(),
  subscribe: jest.fn(),
};

const Redis = require('ioredis');
Redis.mockImplementation(() => mockRedis);

// Set env vars before loading app
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_characters_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters_long';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES = '30d';

const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('bcryptjs');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: token doesn't exist in Redis (no valid refresh tokens)
    mockRedis.exists.mockResolvedValue(0);
    mockRedis.get.mockResolvedValue(null);
  });

  describe('POST /api/auth/register', () => {
    it('creates a user and returns tokens', async () => {
      const newUser = {
        id: 'user_001',
        name: 'Test User',
        phone: '+21612345678',
        email: null,
        role: 'CLIENT',
        kycStatus: 'NOT_REQUIRED',
        createdAt: new Date().toISOString(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue(newUser);
      mockRedis.setex.mockResolvedValue('OK');

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', phone: '+21612345678', password: 'secret123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.phone).toBe('+21612345678');
    });

    it('returns 409 when phone already exists', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({ id: 'existing', phone: '+21612345678' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', phone: '+21612345678', password: 'secret123' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('PHONE_EXISTS');
    });

    it('returns 422 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' }); // missing phone

      expect(res.status).toBe(422);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('sets kycStatus PENDING for CHAUFFEUR role', async () => {
      const newUser = {
        id: 'driver_001',
        name: 'Driver',
        phone: '+21698765432',
        role: 'CHAUFFEUR',
        kycStatus: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue(newUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Driver', phone: '+21698765432', role: 'CHAUFFEUR', password: 'pass123' });

      expect(res.status).toBe(201);
      expect(res.body.user.kycStatus).toBe('PENDING');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns tokens for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('correctpass', 10);
      const user = {
        id: 'user_001',
        name: 'Test User',
        phone: '+21612345678',
        email: null,
        role: 'CLIENT',
        kycStatus: 'NOT_REQUIRED',
        password: hashedPassword,
      };

      mockPrismaUser.findUnique.mockResolvedValue(user);
      mockRedis.setex.mockResolvedValue('OK');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ phone: '+21612345678', password: 'correctpass' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.id).toBe('user_001');
    });

    it('returns 401 for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpass', 10);
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'user_001',
        phone: '+21612345678',
        password: hashedPassword,
        role: 'CLIENT',
        kycStatus: 'NOT_REQUIRED',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ phone: '+21612345678', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 401 for non-existent user', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ phone: '+21699999999', password: 'anypass' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('rotates tokens with valid refresh token', async () => {
      // First, get a valid refresh token via login
      const hashedPassword = await bcrypt.hash('testpass', 10);
      const user = {
        id: 'user_001', name: 'Test', phone: '+21612345678',
        role: 'CLIENT', kycStatus: 'NOT_REQUIRED', password: hashedPassword,
      };

      mockPrismaUser.findUnique.mockResolvedValue(user);
      mockRedis.setex.mockResolvedValue('OK');

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ phone: '+21612345678', password: 'testpass' });

      const { refreshToken } = loginRes.body;

      // Mock Redis to say the refresh token is valid
      mockRedis.exists.mockResolvedValue(1);
      mockRedis.del.mockResolvedValue(1);
      mockRedis.setex.mockResolvedValue('OK');

      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body).toHaveProperty('accessToken');
      expect(refreshRes.body).toHaveProperty('refreshToken');
      // New refresh token should be different from old one
      expect(refreshRes.body.refreshToken).not.toBe(refreshToken);
    });

    it('returns 401 for revoked refresh token', async () => {
      const hashedPassword = await bcrypt.hash('testpass', 10);
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'user_001', phone: '+21612345678',
        role: 'CLIENT', kycStatus: 'NOT_REQUIRED', password: hashedPassword,
      });
      mockRedis.setex.mockResolvedValue('OK');

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ phone: '+21612345678', password: 'testpass' });

      const { refreshToken } = loginRes.body;

      // Token NOT in Redis (revoked)
      mockRedis.exists.mockResolvedValue(0);

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('TOKEN_REVOKED');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('invalidates refresh token', async () => {
      // Login first to get tokens
      const hashedPassword = await bcrypt.hash('testpass', 10);
      mockPrismaUser.findUnique.mockResolvedValue({
        id: 'user_001', name: 'Test', phone: '+21612345678',
        role: 'CLIENT', kycStatus: 'NOT_REQUIRED', password: hashedPassword,
      });
      mockRedis.setex.mockResolvedValue('OK');

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ phone: '+21612345678', password: 'testpass' });

      const { accessToken, refreshToken } = loginRes.body;

      mockRedis.exists.mockResolvedValue(1);
      mockRedis.del.mockResolvedValue(1);

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(logoutRes.status).toBe(200);
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });
});
