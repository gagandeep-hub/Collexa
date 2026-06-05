const profileService = require('../services/profile.service');

const sendErrorResponse = (res, error, fallbackMessage) => {
    const response = {
        success: false,
        message: error.isOperational ? error.message : fallbackMessage
    };
    if (!error.isOperational) response.error = error.message;
    return res.status(error.statusCode || 500).json(response);
};

// ─── Feature 2: Edit Profile ──────────────────────────────────────────────────

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await profileService.getProfile(req.user.id);
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error fetching profile');
    }
};

// @desc    Update user profile (name, phone, college)
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const updatedUser = await profileService.updateProfile(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error updating profile');
    }
};

// ─── Feature 1: Profile Completion (Onboarding) ───────────────────────────────

// @desc    Complete profile (phone + college only — for Google OAuth onboarding)
// @route   PUT /api/profile/complete
// @access  Private
exports.completeProfile = async (req, res) => {
    try {
        const updatedUser = await profileService.completeProfile(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Profile completed successfully',
            user: updatedUser
        });
    } catch (error) {
        return sendErrorResponse(res, error, 'Error completing profile');
    }
};
