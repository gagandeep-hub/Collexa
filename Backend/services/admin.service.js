const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

/**
 * Aggregates platform-wide stats for the admin dashboard.
 * Mongoose countDocuments() → Prisma count()
 */
const getStats = async () => {
    const [
        totalUsers,
        totalListings,
        activeListings,
        oauthUsers,
        localUsers
    ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.product.count({ where: { status: 'available' } }),
        prisma.user.count({ where: { provider: 'google' } }),
        prisma.user.count({ where: { provider: 'local' } })
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
 * Returns a paginated list of all users (without password).
 * Mongoose .select('-password') + .skip().limit() → Prisma select + skip/take
 */
const getAllUsers = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                college: true,
                avatar: true,
                provider: true,
                role: true,
                isVerified: true,
                profileCompleted: true,
                createdAt: true,
                updatedAt: true
                // password excluded
            }
        }),
        prisma.user.count()
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
 * UUID format validation instead of MongoDB ObjectId pattern.
 */
const getUserById = async (userId) => {
    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_PATTERN.test(userId)) {
        throw new AppError('User not found', 404);
    }

    const [user, listings] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                college: true,
                avatar: true,
                provider: true,
                role: true,
                isVerified: true,
                profileCompleted: true,
                createdAt: true,
                updatedAt: true
            }
        }),
        prisma.product.findMany({
            where: { sellerId: userId },
            orderBy: { createdAt: 'desc' }
        })
    ]);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return { user, listings };
};

/**
 * Deletes a user. Cascade delete of products is handled automatically
 * via onDelete: Cascade in schema.prisma (Product → User relation).
 */
const deleteUser = async (userId) => {
    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_PATTERN.test(userId)) {
        throw new AppError('User not found', 404);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
        throw new AppError('Cannot delete an admin account', 403);
    }

    // Note: products auto-cascade delete because of onDelete: Cascade in schema
    await prisma.user.delete({ where: { id: userId } });

    return { deletedUserId: userId };
};

// ─── Listing Management ───────────────────────────────────────────────────────

/**
 * Returns a paginated list of ALL listings with seller info.
 * Mongoose .populate() → Prisma include
 */
const getAllListings = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
        prisma.product.findMany({
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: { id: true, name: true, email: true, college: true }
                }
            }
        }),
        prisma.product.count()
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
    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_PATTERN.test(listingId)) {
        throw new AppError('Listing not found', 404);
    }

    const listing = await prisma.product.findUnique({
        where: { id: listingId },
        include: {
            seller: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    college: true,
                    provider: true,
                    createdAt: true
                }
            }
        }
    });

    if (!listing) {
        throw new AppError('Listing not found', 404);
    }

    return listing;
};

/**
 * Admin force-deletes a listing — no ownership check.
 */
const deleteListing = async (listingId) => {
    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_PATTERN.test(listingId)) {
        throw new AppError('Listing not found', 404);
    }

    const listing = await prisma.product.findUnique({ where: { id: listingId } });

    if (!listing) {
        throw new AppError('Listing not found', 404);
    }

    await prisma.product.delete({ where: { id: listingId } });

    return { deletedListingId: listingId };
};

const verifyUser = async (userId) => {
    const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_PATTERN.test(userId)) {
        throw new AppError('User not found', 404);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
        throw new AppError('User is already verified', 400);
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
        select: {
            id: true,
            name: true,
            email: true,
            isVerified: true
        }
    });

    return updatedUser;
};

module.exports = {
    getStats,
    getAllUsers,
    getUserById,
    deleteUser,
    verifyUser,
    getAllListings,
    getListingById,
    deleteListing
};
