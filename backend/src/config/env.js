'use strict';

require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('30d'),
  // Optional — warn if missing
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

const env = parsed.data;

// Warn about missing optional services
if (!env.FIREBASE_PROJECT_ID) {
  console.warn('[Config] Warning: FIREBASE_PROJECT_ID not set — push notifications will be mocked.');
}
if (!env.STRIPE_SECRET_KEY) {
  console.warn('[Config] Warning: STRIPE_SECRET_KEY not set — payments will be mocked.');
}
if (!env.TWILIO_ACCOUNT_SID) {
  console.warn('[Config] Warning: TWILIO_ACCOUNT_SID not set — OTP will be logged to console only.');
}

module.exports = {
  nodeEnv: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  databaseUrl: env.DATABASE_URL,
  redisUrl: env.REDIS_URL,
  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtAccessExpires: env.JWT_ACCESS_EXPIRES,
  jwtRefreshExpires: env.JWT_REFRESH_EXPIRES,
  firebaseProjectId: env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: env.FIREBASE_PRIVATE_KEY,
  stripeSecretKey: env.STRIPE_SECRET_KEY,
  twilioAccountSid: env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: env.TWILIO_PHONE_NUMBER,
};
