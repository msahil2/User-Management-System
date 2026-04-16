const express = require('express');
const router = express.Router();

const { login, refresh, logout, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/refresh
router.post('/refresh', refresh);

// POST /api/auth/logout  (protected)
router.post('/logout', authenticate, logout);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, getMe);

module.exports = router;
