'use strict';

const { verifyAccess } = require('../services/tokenService');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header',
      code: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyAccess(token);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      kycStatus: decoded.kycStatus,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      error: 'Invalid access token',
      code: 'INVALID_TOKEN',
    });
  }
}

module.exports = { authenticate };
