const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * Authenticate - verifies JWT access token
 * Attaches user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access token required. Please log in.');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Access token expired. Please refresh your token.');
      }
      return sendError(res, 401, 'Invalid access token. Please log in again.');
    }

    // Fetch fresh user from DB to check if still active / not deleted
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return sendError(res, 401, 'User no longer exists.');
    }

    if (!user.isActive || user.isDeleted) {
      return sendError(res, 401, 'Account is deactivated. Contact administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendError(res, 500, 'Authentication error');
  }
};

module.exports = { authenticate };
