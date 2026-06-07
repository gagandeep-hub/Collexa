import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminUserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await adminAPI.getUser(id);
                setUser(res.data.user);
                setListings(res.data.listings);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to fetch user');
                navigate('/admin/users');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, navigate]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await adminAPI.deleteUser(id);
            toast.success('User deleted successfully');
            navigate('/admin/users');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
            setDeleting(false);
            setDeleteModal(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            available: 'badge-green',
            sold: 'badge-red',
            reserved: 'badge-orange'
        };
        return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
    };

    if (loading) {
        return (
            <div className="admin-loading" style={{ height: '60vh' }}>
                <div className="admin-spinner" />
                Loading user...
            </div>
        );
    }

    if (!user) return null;

    return (
        <div>
            {/* Back */}
            <button className="admin-back-btn" onClick={() => navigate('/admin/users')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Users
            </button>

            {/* Header */}
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                        overflow: 'hidden', boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                    }}>
                        {user.avatar
                            ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : user.name?.charAt(0).toUpperCase()
                        }
                    </div>
                    <div>
                        <h1 className="admin-page-title" style={{ marginBottom: 4 }}>{user.name}</h1>
                        <p className="admin-page-subtitle">{user.email}</p>
                    </div>
                </div>
                    {user.role !== 'admin' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {user.isVerified ? (
                                <button
                                    className="admin-btn admin-btn-secondary"
                                    disabled
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Verified
                                </button>
                            ) : (
                                <button
                                    className="admin-btn admin-btn-primary"
                                    style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }}
                                    onClick={async () => {
                                        try {
                                            await adminAPI.verifyUser(id);
                                            setUser({ ...user, isVerified: true });
                                            toast.success('User verified successfully');
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || 'Failed to verify user');
                                        }
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Verify User
                                </button>
                            )}
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={() => setDeleteModal(true)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                                Delete User
                            </button>
                        </div>
                    )}
                </div>

            {/* Detail grid */}
            <div className="admin-detail-grid">
                {/* Account Info */}
                <div className="admin-detail-card">
                    <p className="admin-detail-card-title">Account Information</p>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Full Name</span>
                        <span className="admin-detail-value">{user.name}</span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Email</span>
                        <span className="admin-detail-value" style={{ fontSize: '0.8rem' }}>{user.email}</span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Phone</span>
                        <span className="admin-detail-value">{user.phone || '—'}</span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">College</span>
                        <span className="admin-detail-value">{user.college || '—'}</span>
                    </div>
                </div>

                {/* Status */}
                <div className="admin-detail-card">
                    <p className="admin-detail-card-title">Account Status</p>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Provider</span>
                        <span className="admin-detail-value">
                            {user.provider === 'google'
                                ? <span className="badge badge-purple">Google OAuth</span>
                                : <span className="badge badge-gray">Local</span>
                            }
                        </span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Role</span>
                        <span className="admin-detail-value">
                            {user.role === 'admin'
                                ? <span className="badge badge-orange">Admin</span>
                                : <span className="badge badge-blue">User</span>
                            }
                        </span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Profile</span>
                        <span className="admin-detail-value">
                            {user.profileCompleted
                                ? <span className="badge badge-green">Complete</span>
                                : <span className="badge badge-gray">Incomplete</span>
                            }
                        </span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Joined</span>
                        <span className="admin-detail-value">
                            {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Total Listings</span>
                        <span className="admin-detail-value" style={{ color: '#16a34a', fontWeight: 700 }}>
                            {listings.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Listings Table */}
            <div className="admin-table-card">
                <div className="admin-table-card-header">
                    <span className="admin-table-card-title">User's Listings</span>
                    <span className="admin-table-count">{listings.length} total</span>
                </div>

                {listings.length === 0 ? (
                    <div className="admin-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        </svg>
                        <p>No listings yet</p>
                    </div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map((listing) => (
                                    <tr
                                        key={listing.id}
                                        onClick={() => navigate(`/admin/listings/${listing.id}`)}
                                    >
                                        <td className="td-name">{listing.title}</td>
                                        <td>
                                            <span className="badge badge-blue">{listing.category}</span>
                                        </td>
                                        <td style={{ color: '#10b981', fontWeight: 600 }}>
                                            ₹{listing.price?.toLocaleString('en-IN')}
                                        </td>
                                        <td>{getStatusBadge(listing.status)}</td>
                                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                            {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="admin-btn admin-btn-view"
                                                onClick={() => navigate(`/admin/listings/${listing.id}`)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirm Modal */}
            {deleteModal && (
                <div className="admin-modal-overlay" onClick={() => !deleting && setDeleteModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                        </div>
                        <h3>Delete User</h3>
                        <p>
                            Are you sure you want to delete <strong style={{ color: '#111827' }}>{user.name}</strong>?
                            This will also permanently delete all <strong style={{ color: '#dc2626' }}>{listings.length} listing{listings.length !== 1 ? 's' : ''}</strong> belonging to this user.
                        </p>
                        <div className="admin-modal-actions">
                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setDeleteModal(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserDetail;
