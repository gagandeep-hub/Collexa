const adminService = require('../services/admin.service');

/**
 * Centralized error formatter — mirrors the same pattern used across all
 * other controllers (auth.controller.js, product.controller.js).
 */
const sendErrorResponse = (res, error, fallbackMessage) => {
    const response = {
        success: false,
        message: error.isOperational ? error.message : fallbackMessage
    };

    if (!error.isOperational) {
        response.error = error.message;
    }

    return res.status(error.statusCode || 500).json(response);
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        const stats = await adminService.getStats();
        return res.status(200).json({ success: true, stats });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching stats');
    }
};

// ─── User Management ──────────────────────────────────────────────────────────

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const data = await adminService.getAllUsers(page, limit);
        return res.status(200).json({ success: true, ...data });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching users');
    }
};

// @desc    Get single user details + their listings
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const data = await adminService.getUserById(req.params.id);
        return res.status(200).json({ success: true, ...data });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching user');
    }
};

// @desc    Delete a user + cascade delete their listings
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        // Prevent admin from deleting their own account
        if (req.params.id === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own admin account'
            });
        }

        await adminService.deleteUser(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'User and their listings deleted successfully'
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error deleting user');
    }
};

// @desc    Verify a user account
// @route   PATCH /api/admin/users/:id/verify
// @access  Private/Admin
exports.verifyUser = async (req, res) => {
    try {
        const user = await adminService.verifyUser(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'User verified successfully',
            user
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error verifying user');
    }
};

// ─── Listing Management ───────────────────────────────────────────────────────

// @desc    Get all listings (paginated)
// @route   GET /api/admin/listings
// @access  Private/Admin
exports.getAllListings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const data = await adminService.getAllListings(page, limit);
        return res.status(200).json({ success: true, ...data });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching listings');
    }
};

// @desc    Get single listing details
// @route   GET /api/admin/listings/:id
// @access  Private/Admin
exports.getListing = async (req, res) => {
    try {
        const listing = await adminService.getListingById(req.params.id);
        return res.status(200).json({ success: true, listing });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching listing');
    }
};

// @desc    Admin force-delete a listing
// @route   DELETE /api/admin/listings/:id
// @access  Private/Admin
exports.deleteListing = async (req, res) => {
    try {
        await adminService.deleteListing(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error deleting listing');
    }
};
