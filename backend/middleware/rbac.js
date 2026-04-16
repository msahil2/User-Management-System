const { ROLES } = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * Role-Based Access Control (RBAC) middleware factory
 * Usage: authorize('admin') or authorize('admin', 'manager')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

/**
 * Self or Admin - allows user to access their own resource OR admin to access any
 * Usage: on routes where users manage their own profile
 */
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, 'Authentication required.');
  }

  const targetId = req.params.id;
  const requesterId = req.user._id.toString();
  const requesterRole = req.user.role;

  // Admins can access any resource
  if (requesterRole === ROLES.ADMIN) return next();

  // Managers can access (handled separately in controller)
  if (requesterRole === ROLES.MANAGER) return next();

  // Regular users can only access their own resource
  if (requesterId === targetId) return next();

  return sendError(res, 403, 'Access denied. You can only manage your own profile.');
};

module.exports = { authorize, authorizeOwnerOrAdmin, ROLES };
