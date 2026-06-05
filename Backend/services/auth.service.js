const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');

// ─── Google OAuth Client ────────────────────────────────────────────────────
// One client instance is created per process. Reusing it is more efficient
// than instantiating inside every request.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generates a signed JWT for a given MongoDB user _id.
 * The token is self-contained — no DB lookup needed on protected routes.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * Strips sensitive fields before sending user data to the frontend.
 * Always return a consistent shape regardless of auth provider.
 */
const formatAuthUser = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        avatar: user.avatar,   // Google profile picture URL (empty string for local users)
        provider: user.provider, // 'local' | 'google' — lets frontend know login method
        profileCompleted: user.profileCompleted // Used to enforce profile completion checks
    };
};

// ─── Email / Password Auth ────────────────────────────────────────────────────

/**
 * Registers a new local user.
 * Hashing is done here in the service — not in a Mongoose hook — to keep
 * the responsibility explicit and avoid double-hashing risks.
 */
const register = async ({ name, email, password, phone, college }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError('User already exists with this email', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        college,
        provider: 'local'
    });

    return {
        token: generateToken(user._id),
        user: formatAuthUser(user)
    };
};

/**
 * Authenticates a local user with email + password.
 * Returns the same {token, user} shape as register() and googleAuth().
 */
const login = async ({ email, password }) => {
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');

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
        token: generateToken(user._id),
        user: formatAuthUser(user)
    };
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * Authenticates or registers a user via Google OAuth ID Token.
 *
 * Flow:
 *  1. Verify the ID token with Google's servers (prevents token forgery)
 *  2. Extract user info from the verified payload
 *  3. Look up existing user by googleId (most efficient — stable identifier)
 *  4. If not found by googleId, look up by email (handles pre-existing local accounts)
 *     → If found: link the Google account to the existing user
 *     → If not found: create a brand-new Google-only user
 *  5. Return {token, user} — identical shape to login() / register()
 *
 * @param {string} idToken - The credential string returned by Google's popup
 */
const googleAuth = async (idToken) => {
    if (!idToken) {
        throw new AppError('Google ID token is required', 400);
    }

    // Step 1: Verify the token with Google
    // This makes an HTTPS call to Google's public key endpoint.
    // It will throw if the token is expired, malformed, or for a different app.
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

    // Step 2: Extract user info from verified payload
    const { sub: googleId, email, name, picture: avatar } = payload;

    if (!email) {
        throw new AppError('Could not retrieve email from Google account', 400);
    }

    // Step 3: Find by googleId first (fastest path for returning users)
    let user = await User.findOne({ googleId });

    if (!user) {
        // Step 4a: Check if a local account with this email already exists
        user = await User.findOne({ email });

        if (user) {
            // Link Google to the existing local account
            // The user can now sign in with either method
            user.googleId = googleId;
            user.provider = 'google'; // Upgrade to Google provider
            if (!user.avatar) user.avatar = avatar; // Set avatar only if not already set
            await user.save();
        } else {
            // Step 4b: Brand new user — create with Google info
            user = await User.create({
                name,
                email,
                googleId,
                avatar: avatar || '',
                provider: 'google'
                // No password field — intentionally left undefined
            });
        }
    }

    // Step 5: Return our own JWT (not Google's token)
    // From this point, the auth flow is identical to email/password login
    return {
        token: generateToken(user._id),
        user: formatAuthUser(user)
    };
};

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Returns the full user document for the /me endpoint.
 * The select('-password') ensures the password hash is never sent to the client.
 */
const getCurrentUser = async (userId) => {
    return User.findById(userId).select('-password');
};

module.exports = {
    register,
    login,
    googleAuth,
    getCurrentUser
};
