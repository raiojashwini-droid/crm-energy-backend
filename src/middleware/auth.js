const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');
const { toPrismaRole } = require('../utils/roleMapper');

/**
 * Middleware: Authenticates JWT token from Authorization header.
 * Attaches verified user context to `req.user`.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token not provided.',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication token has expired. Please sign in again.',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
        code: 'INVALID_TOKEN',
      });
    }

    // Attach trusted identity to req.user
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication verification.',
      error: error.message,
    });
  }
};

/**
 * Middleware: Authorizes request based on user role.
 * @param  {...string} allowedRoles - List of allowed roles (Prisma enum or mapped aliases)
 */
const authorizeRoles = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => toPrismaRole(r));

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User session not found.',
      });
    }

    // SUPER_ADMIN has master governance override
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const userRole = toPrismaRole(req.user.role);
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
