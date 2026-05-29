'use strict';

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated',
        code: 'UNAUTHORIZED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access restricted to: ${roles.join(', ')}`,
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

module.exports = { requireRole };
