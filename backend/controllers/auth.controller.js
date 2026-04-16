const { loginUser, refreshAccessToken, logoutUser } = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/auth/login
 * Public route - authenticate user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    return sendSuccess(res, 200, 'Login successful', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshAccessToken(refreshToken);
    return sendSuccess(res, 200, 'Token refreshed', tokens);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Protected route - clears refresh token
 */
const logout = async (req, res, next) => {
  try {
    await logoutUser(req.user._id);
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Protected route - returns current user profile
 */
const getMe = async (req, res) => {
  // req.user is already set by authenticate middleware (no password)
  return sendSuccess(res, 200, 'Profile fetched', req.user);
};

module.exports = { login, refresh, logout, getMe };
