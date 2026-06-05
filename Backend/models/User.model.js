const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: false, // Optional — Google OAuth users have no password
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password in queries
    },
    phone: {
        type: String,
        trim: true
    },
    college: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: '' // Populated from Google profile picture for OAuth users
    },
    // ─── OAuth Fields ────────────────────────────────────────────────────
    googleId: {
        type: String,
        unique: true,
        sparse: true // sparse: true allows multiple documents to have null/undefined
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local' // 'local' = email/password, 'google' = Google OAuth
    },
    // ─────────────────────────────────────────────────────────────────────
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // ─── Profile Completion ──────────────────────────────────────────────
    profileCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Auto-check profile completion before saving
userSchema.pre('save', function () {
    // If phone and college exist and are not empty strings
    if (this.phone && typeof this.phone === 'string' && this.phone.trim() !== '' && 
        this.college && typeof this.college === 'string' && this.college.trim() !== '') {
        this.profileCompleted = true;
    } else {
        this.profileCompleted = false;
    }
});

module.exports = mongoose.model('User', userSchema);
