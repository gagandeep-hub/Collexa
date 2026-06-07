const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');

// ─── Helper — profileCompleted calculate karo ─────────────────────────────────
// Mongoose mein yeh pre('save') hook karta tha
// Prisma mein hook nahi hota — isliye helper function banaya

const calcProfileCompleted = (phone, college) => {
    return !!(
        phone && typeof phone === 'string' && phone.trim() !== '' &&
        college && typeof college === 'string' && college.trim() !== ''
    );
};

// ─── Helper — clean response banao ───────────────────────────────────────────
// Mongoose mein user._id tha, Prisma mein user.id hai
// Yeh helper baar baar same object likhne se bachata hai

const formatUser = (user) => ({
    id: user.id,                    // Prisma mein .id — MongoDB wala ._id nahi
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    college: user.college || '',
    avatar: user.avatar,
    provider: user.provider,
    profileCompleted: user.profileCompleted
});

// ─── Feature 2: Edit Profile ──────────────────────────────────────────────────

/**
 * Fetches the full user profile.
 * Used by the Edit Profile page to populate the form.
 */
const getProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) throw new AppError('User not found', 404);

    return formatUser(user);
};

/**
 * Updates a user's profile (name, phone, college).
 * Works for ALL users regardless of profileCompleted.
 * profileCompleted manually recalculate hoga — Prisma mein pre-save hook nahi hota.
 */
const updateProfile = async (userId, updateData) => {
    const { name, phone, college } = updateData;

    // Pehle user exist karta hai ya nahi check karo
    const existing = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!existing) throw new AppError('User not found', 404);

    // Sirf woh fields update karo jo provide ki gayi hain
    // Mongoose wala pattern: if (name) user.name = name
    const dataToUpdate = {};

    if (name && name.trim()) dataToUpdate.name = name.trim();
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (college !== undefined) dataToUpdate.college = college;

    // profileCompleted recalculate karo
    // updated values ya existing values use karo
    const finalPhone = phone !== undefined ? phone : existing.phone;
    const finalCollege = college !== undefined ? college : existing.college;
    dataToUpdate.profileCompleted = calcProfileCompleted(finalPhone, finalCollege);

    const user = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate
    });

    return formatUser(user);
};

// ─── Feature 1: Profile Completion (Onboarding) ───────────────────────────────

/**
 * Completes an incomplete profile.
 * Sirf phone aur college accept karta hai — Google OAuth users ke liye onboarding step.
 */
const completeProfile = async (userId, { phone, college }) => {
    if (!phone || !phone.trim()) {
        throw new AppError('Phone number is required', 400);
    }
    if (!college || !college.trim()) {
        throw new AppError('College name is required', 400);
    }

    // User exist karta hai check karo
    const existing = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!existing) throw new AppError('User not found', 404);

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            phone: phone.trim(),
            college: college.trim(),
            profileCompleted: true   // dono fields fill hain toh guaranteed true
        }
    });

    return formatUser(user);
};

module.exports = {
    getProfile,
    updateProfile,
    completeProfile
};