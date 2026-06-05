const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/register', register);       // Email/password registration
router.post('/login', login);             // Email/password login
router.post('/google', googleAuth);       // Google OAuth (ID Token flow)

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/me', protect, getMe);        // Get current logged-in user

module.exports = router;
