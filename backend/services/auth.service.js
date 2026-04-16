const { User } = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  buildTokenPayload,
} = require('../utils/jwt');

/**
 * Login service - validates credentials and issues tokens
 */
const loginUser = async (email, password) => {
  // Fetch user with password field explicitly (it's select: false in schema)
  const user = await User.findOne({ email, isDeleted: false }).select('+password');

  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  if (!user.isActive) {
    throw { statusCode: 401, message: 'Your account has been deactivated. Contact an administrator.' };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  const payload = buildTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Persist refresh token to DB
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: user.toSafeObject(),
  };
};

/**
 * Refresh token service - issues a new access token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw { statusCode: 401, message: 'Refresh token required' };
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw { statusCode: 401, message: 'Invalid or expired refresh token' };
  }

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    throw { statusCode: 401, message: 'Refresh token reuse detected. Please log in again.' };
  }

  if (!user.isActive || user.isDeleted) {
    throw { statusCode: 401, message: 'Account is deactivated.' };
  }

  const payload = buildTokenPayload(user);
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Logout service - clears refresh token from DB
 */
const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
};

module.exports = { loginUser, refreshAccessToken, logoutUser };
