const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMyProfile,
} = require('../controllers/user.controller');

const { authenticate } = require('../middleware/auth');
const { authorize, authorizeOwnerOrAdmin } = require('../middleware/rbac');
const {
  validateCreateUser,
  validateUpdateUser,
  validateMongoId,
  validateUserListQuery,
} = require('../middleware/validate');

// All routes below require authentication
router.use(authenticate);

// GET /api/users/me - own profile (any role)
router.get('/me', getMyProfile);

// GET /api/users - admin & manager only, with pagination/search/filter
router.get('/', authorize('admin', 'manager'), validateUserListQuery, getUsers);

// POST /api/users - admin only
router.post('/', authorize('admin'), validateCreateUser, createUser);

// GET /api/users/:id - admin/manager: any user | user: own only
router.get('/:id', validateMongoId, getUser);

// PUT /api/users/:id - admin: full | manager: non-admin | user: own profile
router.put('/:id', validateMongoId, validateUpdateUser, updateUser);

// DELETE /api/users/:id - admin only (soft delete)
router.delete('/:id', authorize('admin'), validateMongoId, deleteUser);

module.exports = router;
