const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, completeProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

// ─── Feature 2: Edit Profile (all authenticated users) ───────────────────────
router.get('/', protect, getProfile);       // GET  /api/profile
router.put('/', protect, updateProfile);    // PUT  /api/profile

// ─── Feature 1: Profile Completion (onboarding only) ─────────────────────────
router.put('/complete', protect, completeProfile); // PUT  /api/profile/complete

module.exports = router;
