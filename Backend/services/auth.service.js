const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');

// ─── Google OAuth Client ────────────────────────────────────────────────────
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a signed JWT for a given user id (UUID string in Prisma).
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * Strips sensitive fields before sending user data to the frontend.
 * Mongoose ka ._id → Prisma ka .id
 */
const formatAuthUser = (user) => {
    return {
        id: user.id,             // Prisma uses .id (UUID), not ._id
        name: user.name,
        email: user.email,
        college: user.college,
        avatar: user.avatar,
        provider: user.provider,
        profileCompleted: user.profileCompleted,
        role: user.role
    };
};

// ─── Email / Password Auth ────────────────────────────────────────────────────

/**
 * Registers a new local user.
 */
const register = async ({ name, email, password, phone, college }) => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new AppError('User already exists with this email', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isProfileComplete = !!(
        phone && typeof phone === 'string' && phone.trim() !== '' &&
        college && typeof college === 'string' && college.trim() !== ''
    );

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            college,
            provider: 'local',
            profileCompleted: isProfileComplete
        }
    });

    return {
        token: generateToken(user.id),
        user: formatAuthUser(user)
    };
};

/**
 * Authenticates a local user with email + password.
 */
const login = async ({ email, password }) => {
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    // Prisma mein .select('+password') nahi hota — password field always included hai
    // schema mein password optional hai, toh null check zaruri hai
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    // Prevent Google-only users from logging in with a password
    if (user.provider === 'google' && !user.password) {
        throw new AppError(
            'This account uses Google Sign-In. Please continue with Google.',
            400
        );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError('Invalid credentials', 401);
    }

    return {
        token: generateToken(user.id),
        user: formatAuthUser(user)
    };
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * Authenticates or registers a user via Google OAuth ID Token.
 *
 * Flow:
 *  1. Verify the ID token with Google's servers
 *  2. Extract user info from the verified payload
 *  3. Look up by googleId (returning users)
 *  4a. If not found by googleId → check by email (link existing local account)
 *  4b. If no email match → create brand new Google user
 *  5. Return {token, user}
 */
const googleAuth = async (idToken) => {
    if (!idToken) {
        throw new AppError('Google ID token is required', 400);
    }

    // Step 1: Verify with Google
    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
    } catch (err) {
        throw new AppError('Invalid or expired Google token', 401);
    }

    // Step 2: Extract user info
    const { sub: googleId, email, name, picture: avatar } = payload;

    if (!email) {
        throw new AppError('Could not retrieve email from Google account', 400);
    }

    // Step 3: Find by googleId (fastest path for returning users)
    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
        // Step 4a: Check if a local account with this email exists
        user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // Link Google to the existing local account
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId,
                    provider: 'google',
                    // Only set avatar if not already set
                    ...((!user.avatar || user.avatar === '') && { avatar: avatar || '' })
                }
            });
        } else {
            // Step 4b: Brand new user — create with Google info
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    googleId,
                    avatar: avatar || '',
                    provider: 'google'
                    // No password — intentionally omitted
                }
            });
        }
    }

    // Step 5: Return our own JWT
    return {
        token: generateToken(user.id),
        user: formatAuthUser(user)
    };
};

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Returns the full user for the /me endpoint (without password).
 */
const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
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
            // password intentionally excluded
        }
    });

    return user;
};

module.exports = {
    register,
    login,
    googleAuth,
    getCurrentUser
};
