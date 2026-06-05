const User = require('../models/User.model');
const AppError = require('../utils/AppError');

// ─── Feature 2: Edit Profile ──────────────────────────────────────────────────

/**
 * Fetches the full user profile.
 * Used by the Edit Profile page to populate the form.
 */
const getProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        college: user.college || '',
        avatar: user.avatar,
        provider: user.provider,
        profileCompleted: user.profileCompleted
    };
};

/**
 * Updates a user's profile (name, phone, college).
 * Used by the Edit Profile page — works for ALL users regardless of profileCompleted.
 * The pre('save') hook recalculates profileCompleted automatically.
 */
const updateProfile = async (userId, updateData) => {
    const { name, phone, college } = updateData;

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Only update fields that were provided
    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (college !== undefined) user.college = college;

    await user.save(); // pre('save') hook recalculates profileCompleted

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        college: user.college || '',
        avatar: user.avatar,
        provider: user.provider,
        profileCompleted: user.profileCompleted
    };
};

// ─── Feature 1: Profile Completion (Onboarding) ───────────────────────────────

/**
 * Completes an incomplete profile.
 * Accepts ONLY phone and college — this is the onboarding step for Google OAuth users.
 * The pre('save') hook will set profileCompleted = true if both fields are filled.
 */
const completeProfile = async (userId, { phone, college }) => {
    if (!phone || !phone.trim()) {
        throw new AppError('Phone number is required', 400);
    }
    if (!college || !college.trim()) {
        throw new AppError('College name is required', 400);
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.phone = phone.trim();
    user.college = college.trim();

    await user.save(); // pre('save') hook sets profileCompleted = true

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        avatar: user.avatar,
        provider: user.provider,
        profileCompleted: user.profileCompleted
    };
};

module.exports = {
    getProfile,
    updateProfile,
    completeProfile
};
