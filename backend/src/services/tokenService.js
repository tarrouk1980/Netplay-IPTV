'use strict';

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');
const { redisClient } = require('../config/redis');

function signAccess(payload) {
  const jti = uuidv4();
  return jwt.sign(
    { ...payload, jti },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpires }
  );
}

function signRefresh(payload) {
  const jti = uuidv4();
  return jwt.sign(
    { ...payload, jti },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpires }
  );
}

function verifyAccess(token) {
  return jwt.verify(token, config.jwtAccessSecret);
}

function verifyRefresh(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}

async function storeRefreshToken(jti, userId, expiresInSeconds) {
  await redisClient.setex(`refresh:${jti}`, expiresInSeconds, userId);
}

async function revokeRefreshToken(jti) {
  await redisClient.del(`refresh:${jti}`);
}

async function isRefreshTokenValid(jti) {
  const exists = await redisClient.exists(`refresh:${jti}`);
  return exists === 1;
}

module.exports = {
  signAccess,
  signRefresh,
  verifyAccess,
  verifyRefresh,
  storeRefreshToken,
  revokeRefreshToken,
  isRefreshTokenValid,
};
