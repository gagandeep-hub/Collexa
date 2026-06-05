import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

/**
 * FEATURE 2: Edit Profile
 * ───────────────────────
 * Permanent account management for ALL authenticated users.
 * Accessible from the Navbar dropdown.
 * Has NO dependency on profileCompleted — any user can edit their info anytime.
 */
const Profile = () => {
    const { user, updateUserContext } = useAuth();

    // isEditing = false by default — form starts as read-only
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        college: ''
    });

    // Sync form with user data whenever user state changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                college: user.college || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = () => setIsEditing(true);

    const handleCancel = () => {
        // Revert changes
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            college: user?.college || ''
        });
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }
        setLoading(true);
        try {
            const res = await profileAPI.updateProfile(formData);
            updateUserContext(res.data.user); // Update global auth state instantly
            toast.success('Profile updated successfully!');
            setIsEditing(false); // Lock form again
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    {/* Avatar */}
                    <div className="profile-avatar">
                        {user?.avatar
                            ? <img src={user.avatar} alt="Profile" className="avatar-img" />
                            : <span className="avatar-initials">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                        }
                    </div>
                    <h1>Edit Profile</h1>
                    <p>Manage your personal information</p>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    {/* Name */}
                    <div className="form-group">
                        <label htmlFor="prof-name">Full Name</label>
                        <input
                            type="text"
                            id="prof-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={!isEditing ? 'input-disabled' : ''}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    {/* Email — always readonly */}
                    <div className="form-group">
                        <label htmlFor="prof-email">Email</label>
                        <input
                            type="email"
                            id="prof-email"
                            value={user?.email || ''}
                            disabled
                            className="input-disabled"
                        />
                        <span className="field-hint">Email is linked to your account and cannot be changed.</span>
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label htmlFor="prof-phone">Phone Number</label>
                        <input
                            type="tel"
                            id="prof-phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={!isEditing ? 'input-disabled' : ''}
                            placeholder="e.g. 9876543210"
                        />
                    </div>

                    {/* College */}
                    <div className="form-group">
                        <label htmlFor="prof-college">College / University</label>
                        <input
                            type="text"
                            id="prof-college"
                            name="college"
                            value={formData.college}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={!isEditing ? 'input-disabled' : ''}
                            placeholder="e.g. IIT Delhi"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="profile-actions">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="profile-btn cancel-btn"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="profile-btn save-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="profile-btn edit-btn"
                                onClick={handleEditClick}
                            >
                                ✏️ Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
