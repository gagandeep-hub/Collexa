const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// ─── Protect Middleware ───────────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Mongoose: User.findById(decoded.id)
        // Prisma:   prisma.user.findUnique({ where: { id: decoded.id } })
        req.user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// ─── Admin Middleware ─────────────────────────────────────────────────────────
exports.admin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
    next();
};

// ─── Profile Completion Middleware ────────────────────────────────────────────
exports.checkProfileCompletion = (req, res, next) => {
    if (!req.user || !req.user.profileCompleted) {
        return res.status(403).json({
            success: false,
            message: 'Please complete your profile first.',
            isProfileIncomplete: true
        });
    }
    next();
};
