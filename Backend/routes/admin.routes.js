const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/auth.middleware');
const {
    getStats,
    getAllUsers,
    getUser,
    deleteUser,
    getAllListings,
    getListing,
    deleteListing
} = require('../controllers/admin.controller');

// ─── All admin routes require: JWT verification → admin role check ─────────────
// protect: verifies the JWT and attaches req.user
// admin:   checks req.user.role === 'admin', returns 403 if not

router.use(protect, admin);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/stats', getStats);

// ─── User Management ──────────────────────────────────────────────────────────
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.delete('/users/:id', deleteUser);

// ─── Listing Management ───────────────────────────────────────────────────────
router.get('/listings', getAllListings);
router.get('/listings/:id', getListing);
router.delete('/listings/:id', deleteListing);

module.exports = router;
