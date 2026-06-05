import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './CompleteProfile.css';

/**
 * FEATURE 1: Profile Completion (Onboarding)
 * ─────────────────────────────────────────
 * This page is shown ONLY when a Google OAuth user
 * tries to sell an item but hasn't set their phone/college yet.
 * It does NOT exist in the normal navigation.
 * After saving, the user is sent directly to the Sell Item page.
 */
const CompleteProfile = () => {
    const { user, updateUserContext } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: '',
        college: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.phone.trim()) {
            toast.error('Phone number is required');
            return;
        }
        if (!formData.college.trim()) {
            toast.error('College name is required');
            return;
        }

        setLoading(true);
        try {
            const res = await profileAPI.completeProfile(formData);
            updateUserContext(res.data.user); // Update global state
            toast.success('Profile completed! You can now create listings.');
            navigate('/add-product'); // Send them where they originally wanted to go
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="complete-profile-page">
            <div className="complete-profile-card">
                {/* Icon */}
                <div className="cp-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>

                <h1>One Last Step</h1>
                <p className="cp-subtitle">
                    Hi <strong>{user?.name?.split(' ')[0]}</strong>! To start selling on Collexa,
                    we need a few more details.
                </p>

                <form onSubmit={handleSubmit} className="cp-form">
                    <div className="cp-form-group">
                        <label htmlFor="cp-phone">Phone Number</label>
                        <input
                            type="tel"
                            id="cp-phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g. 9876543210"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="cp-form-group">
                        <label htmlFor="cp-college">College / University</label>
                        <input
                            type="text"
                            id="cp-college"
                            name="college"
                            value={formData.college}
                            onChange={handleChange}
                            placeholder="e.g. IIT Delhi"
                            required
                        />
                    </div>

                    <button type="submit" className="cp-submit-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Complete Profile & Continue →'}
                    </button>
                </form>

                <p className="cp-skip-note">
                    You can update this later from your <strong>Edit Profile</strong> page.
                </p>
            </div>
        </div>
    );
};

export default CompleteProfile;
