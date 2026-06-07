import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await adminAPI.getListing(id);
                setListing(res.data.listing);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to fetch listing');
                navigate('/admin/listings');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id, navigate]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await adminAPI.deleteListing(id);
            toast.success('Listing deleted successfully');
            navigate('/admin/listings');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete listing');
            setDeleting(false);
            setDeleteModal(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = { available: 'badge-green', sold: 'badge-red', reserved: 'badge-orange' };
        return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
    };

    const getConditionBadge = (condition) => {
        const map = {
            new: 'badge-green',
            'like-new': 'badge-cyan',
            good: 'badge-blue',
            fair: 'badge-orange',
            poor: 'badge-red'
        };
        return <span className={`badge ${map[condition] || 'badge-gray'}`}>{condition}</span>;
    };

    if (loading) {
        return (
            <div className="admin-loading" style={{ height: '60vh' }}>
                <div className="admin-spinner" />
                Loading listing...
            </div>
        );
    }

    if (!listing) return null;

    return (
        <div>
            {/* Back */}
            <button className="admin-back-btn" onClick={() => navigate('/admin/listings')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Listings
            </button>

            {/* Header */}
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                    <h1 className="admin-page-title" style={{ marginBottom: 8 }}>{listing.title}</h1>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {getStatusBadge(listing.status)}
                        <span className="badge badge-blue">{listing.category}</span>
                        {getConditionBadge(listing.condition)}
                    </div>
                </div>
                <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => setDeleteModal(true)}
                    style={{ flexShrink: 0 }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    Delete Listing
                </button>
            </div>

            {/* Images */}
            {listing.images?.length > 0 && (
                <div className="admin-detail-card" style={{ marginBottom: 20 }}>
                    <p className="admin-detail-card-title">Images ({listing.images.length})</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {/* Main image */}
                        <img
                            src={listing.images[activeImg]}
                            alt="Main"
                            style={{
                                width: 280, height: 200, objectFit: 'cover',
                                borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                                flexShrink: 0
                            }}
                        />
                        {/* Thumbnails */}
                        {listing.images.length > 1 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {listing.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt={`img-${i}`}
                                        onClick={() => setActiveImg(i)}
                                        style={{
                                            width: 72, height: 72, objectFit: 'cover',
                                            borderRadius: 8, cursor: 'pointer',
                                            border: i === activeImg
                                                ? '2px solid #10b981'
                                                : '1px solid rgba(255,255,255,0.08)',
                                            opacity: i === activeImg ? 1 : 0.6,
                                            transition: 'all 0.2s ease'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Detail grid */}
            <div className="admin-detail-grid">
                {/* Listing Info */}
                <div className="admin-detail-card">
                    <p className="admin-detail-card-title">Listing Details</p>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Price</span>
                        <span className="admin-detail-value" style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>
                            ₹{listing.price?.toLocaleString('en-IN')}
                        </span>
                    </div>
                    {listing.originalPrice && (
                        <div className="admin-detail-row">
                            <span className="admin-detail-label">Original</span>
                            <span className="admin-detail-value" style={{ textDecoration: 'line-through', color: '#475569' }}>
                                ₹{listing.originalPrice?.toLocaleString('en-IN')}
                            </span>
                        </div>
                    )}
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Category</span>
                        <span className="admin-detail-value">{listing.category}</span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Condition</span>
                        <span className="admin-detail-value">{getConditionBadge(listing.condition)}</span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Status</span>
                        <span className="admin-detail-value">{getStatusBadge(listing.status)}</span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Location</span>
                        <span className="admin-detail-value">{listing.location || '—'}</span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Views</span>
                        <span className="admin-detail-value">{listing.views}</span>
                    </div>
                    <div className="admin-detail-row">
                        <span className="admin-detail-label">Posted</span>
                        <span className="admin-detail-value">
                            {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                {/* Seller Info */}
                <div className="admin-detail-card">
                    <p className="admin-detail-card-title">Seller Information</p>
                    {listing.seller ? (
                        <>
                            <div className="admin-detail-row">
                                <span className="admin-detail-label">Name</span>
                                <span className="admin-detail-value">
                                    <button
                                        style={{
                                            background: 'none', border: 'none', color: '#60a5fa',
                                            cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                                            padding: 0, textDecoration: 'underline'
                                        }}
                                        onClick={() => navigate(`/admin/users/${listing.seller.id}`)}
                                    >
                                        {listing.seller.name}
                                    </button>
                                </span>
                            </div>
                            <div className="admin-detail-row">
                                <span className="admin-detail-label">Email</span>
                                <span className="admin-detail-value" style={{ fontSize: '0.8rem' }}>
                                    {listing.seller.email}
                                </span>
                            </div>
                            <div className="admin-detail-row">
                                <span className="admin-detail-label">Phone</span>
                                <span className="admin-detail-value">{listing.seller.phone || '—'}</span>
                            </div>
                            <div className="admin-detail-row">
                                <span className="admin-detail-label">College</span>
                                <span className="admin-detail-value">{listing.seller.college || '—'}</span>
                            </div>
                            <div className="admin-detail-row">
                                <span className="admin-detail-label">Provider</span>
                                <span className="admin-detail-value">
                                    {listing.seller.provider === 'google'
                                        ? <span className="badge badge-purple">Google</span>
                                        : <span className="badge badge-gray">Local</span>
                                    }
                                </span>
                            </div>
                        </>
                    ) : (
                        <p style={{ color: '#475569', fontSize: '0.875rem' }}>Seller info not available</p>
                    )}
                </div>

                {/* Description */}
                <div className="admin-detail-card full-width">
                    <p className="admin-detail-card-title">Description</p>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.7 }}>
                        {listing.description || 'No description provided.'}
                    </p>
                </div>
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
                        <h3>Delete Listing</h3>
                        <p>
                            Are you sure you want to permanently delete{' '}
                            <strong style={{ color: '#f1f5f9' }}>"{listing.title}"</strong>?
                            This action cannot be undone.
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

export default AdminListingDetail;
