'use strict';

const KYC_REQUIRED_ROLES = ['CHAUFFEUR', 'DEPANNEUR'];

function kycGuard(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated', code: 'UNAUTHORIZED' });
  }

  if (KYC_REQUIRED_ROLES.includes(req.user.role)) {
    if (req.user.kycStatus !== 'APPROVED') {
      return res.status(403).json({
        error: 'KYC verification required before accessing this service',
        code: 'KYC_REQUIRED',
      });
    }
  }

  next();
}

module.exports = { kycGuard };
