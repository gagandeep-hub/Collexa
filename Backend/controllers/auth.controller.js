const authService = require('../services/auth.service');

/**
 * Centralized error response formatter.
 * Operational errors (AppError instances) expose their message to the client.
 * Programming/unexpected errors show a generic message to avoid leaking internals.
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

// @desc    Register user with email & password
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { token, user } = await authService.register(req.body);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error registering user');
    }
};

// @desc    Login user with email & password
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { token, user } = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error logging in');
    }
};

// @desc    Authenticate or register user via Google OAuth
// @route   POST /api/auth/google
// @access  Public
//
// How it works:
//  - Frontend sends the raw Google ID token (credential) from the Google popup
//  - This controller passes it to the service layer for verification & upsert
//  - Returns the same {token, user} shape as regular login/register
//  - The client stores the JWT in localStorage and proceeds normally
exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential token is required'
            });
        }

        const { token, user } = await authService.googleAuth(credential);

        return res.status(200).json({
            success: true,
            message: 'Google authentication successful',
            token,
            user
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error authenticating with Google');
    }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching user');
    }
};
