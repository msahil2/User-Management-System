const userService = require('../services/user.service');
const { sendSuccess, sendError } = require('../utils/response');
const { ROLES } = require('../models/User');

/**
 * GET /api/users
 * Admin & Manager - paginated user list
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, isActive, sort } = req.query;
    const result = await userService.getUsers({ page, limit, search, role, isActive, sort });
    return sendSuccess(res, 200, 'Users fetched successfully', result.users, result.pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 * Admin/Manager: any user | User: own profile only
 */
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    // Regular users can only see their own profile
    if (requester.role === ROLES.USER && requester._id.toString() !== id) {
      return sendError(res, 403, 'Access denied. You can only view your own profile.');
    }

    const user = await userService.getUserById(id);
    return sendSuccess(res, 200, 'User fetched successfully', user);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    next(err);
  }
};

/**
 * POST /api/users
 * Admin only - create new user
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req.user._id);
    return sendSuccess(res, 201, 'User created successfully', user);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    next(err);
  }
};

/**
 * PUT /api/users/:id
 * Admin: full update | Manager: update non-admin users | User: own profile (name, password)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    // Users can only update themselves
    if (requester.role === ROLES.USER && requester._id.toString() !== id) {
      return sendError(res, 403, 'Access denied. You can only update your own profile.');
    }

    const updated = await userService.updateUser(id, req.body, requester);
    return sendSuccess(res, 200, 'User updated successfully', updated);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 * Admin only - soft delete (deactivate) user
 */
const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.softDeleteUser(req.params.id, req.user._id);
    return sendSuccess(res, 200, result.message);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.statusCode, err.message);
    next(err);
  }
};

/**
 * GET /api/users/me/profile
 * Any authenticated user - returns own profile
 */
const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user._id.toString());
    return sendSuccess(res, 200, 'Profile fetched successfully', user);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser, getMyProfile };
