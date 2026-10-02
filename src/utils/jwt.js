const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_crm_nergy_secret_key_step1';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate signed JWT for authenticated user session.
 * @param {Object} payload - { userId, tenantId, role }
 * @returns {string}
 */
const generateToken = (payload) => {
  const safePayload = {
    userId: payload.userId,
    tenantId: payload.tenantId,
    role: payload.role,
  };
  return jwt.sign(safePayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode JWT token.
 * @param {string} token
 * @returns {Object}
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
