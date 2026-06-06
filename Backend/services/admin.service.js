const User = require('../models/User.model');
const Product = require('../models/Product.model');
const AppError = require('../utils/AppError');

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

/**
 * Aggregates platform-wide stats for the admin dashboard.
 * Uses Promise.all for concurrent DB queries instead of sequential awaits.
 */
const getStats = async () => {
    const [
        totalUsers,
        totalListings,
        activeListings,
        oauthUsers,
        localUsers
    ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Product.countDocuments({ status: 'available' }),
        User.countDocuments({ provider: 'google' }),
        User.countDocuments({ provider: 'local' })
    ]);

    return {
        totalUsers,
        totalListings,
        activeListings,
        oauthUsers,
        localUsers
    };
};

// ─── User Management ──────────────────────────────────────────────────────────

/**
 * Returns a paginated list of all users.
 * Excludes password field. Sorted by newest first.
 */
const getAllUsers = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        User.countDocuments()
    ]);

    return {
        users,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
    };
};

/**
 * Returns a single user by ID along with all their listings.
 * Throws 404 if user not found or invalid ID.
 */
const getUserById = async (userId) => {
    if (!OBJECT_ID_PATTERN.test(userId)) {
        throw new AppError('User not found', 404);
    }

    const [user, listings] = await Promise.all([
        User.findById(userId).select('-password'),
        Product.find({ seller: userId }).sort({ createdAt: -1 })
    ]);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return { user, listings };
};

/**
 * Deletes a user and cascade-deletes all their listings.
 * Admin cannot delete another admin account.
 */
const deleteUser = async (userId) => {
    if (!OBJECT_ID_PATTERN.test(userId)) {
        throw new AppError('User not found', 404);
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
        throw new AppError('Cannot delete an admin account', 403);
    }

    // Cascade delete all their products
    await Product.deleteMany({ seller: userId });
    await user.deleteOne();

    return { deletedUserId: userId };
};

// ─── Listing Management ───────────────────────────────────────────────────────

/**
 * Returns a paginated list of ALL listings regardless of status.
 * Populates seller name, email, and college for the table view.
 */
const getAllListings = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
        Product.find()
            .populate('seller', 'name email college')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Product.countDocuments()
    ]);

    return {
        listings,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
    };
};

/**
 * Returns a single listing with full seller details.
 */
const getListingById = async (listingId) => {
    if (!OBJECT_ID_PATTERN.test(listingId)) {
        throw new AppError('Listing not found', 404);
    }

    const listing = await Product.findById(listingId)
        .populate('seller', 'name email phone college provider createdAt');

    if (!listing) {
        throw new AppError('Listing not found', 404);
    }

    return listing;
};

/**
 * Admin force-deletes a listing — no ownership check needed.
 */
const deleteListing = async (listingId) => {
    if (!OBJECT_ID_PATTERN.test(listingId)) {
        throw new AppError('Listing not found', 404);
    }

    const listing = await Product.findById(listingId);

    if (!listing) {
        throw new AppError('Listing not found', 404);
    }

    await listing.deleteOne();

    return { deletedListingId: listingId };
};

module.exports = {
    getStats,
    getAllUsers,
    getUserById,
    deleteUser,
    getAllListings,
    getListingById,
    deleteListing
};
