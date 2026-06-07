import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Admin.css';

const StatusBadge = ({ status }) => {
    const map = { available: 'badge-green', sold: 'badge-red', reserved: 'badge-orange' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

const ListingThumb = ({ images, title }) => (
    images?.[0]
        ? <img src={images[0]} alt={title} style={{ width: 36, height: 36, borderRadius: 7, objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }} />
        : <div style={{ width: 36, height: 36, borderRadius: 7, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #e5e7eb' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        </div>
);

const AdminListings = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({ listings: [], total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchListings = async (p = 1) => {
        setLoading(true);
        try {
            const res = await adminAPI.getAllListings({ page: p, limit: 20 });
            setData(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchListings(page); }, [page]);

    const handleDelete = async () => {
        if (!deleteModal) return;
        setDeleting(true);
        try {
            await adminAPI.deleteListing(deleteModal.id);
            toast.success(`"${deleteModal.title}" deleted`);
            setDeleteModal(null);
            fetchListings(page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-title">Listings</h1>
                <p className="admin-page-subtitle">Manage all marketplace listings</p>
            </div>

            <div className="admin-table-card">
                <div className="admin-table-card-header">
                    <span className="admin-table-card-title">All Listings</span>
                    <span className="admin-table-count">{data.total} total</span>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-spinner" />
                        Loading listings...
                    </div>
                ) : data.listings.length === 0 ? (
                    <div className="admin-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        </svg>
                        <p>No listings found</p>
                    </div>
                ) : (
                    <>
                        {/* ── Desktop Table ── */}
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Listing</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                        <th>Seller</th>
                                        <th>College</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.listings.map((listing) => (
                                        <tr key={listing.id} onClick={() => navigate(`/admin/listings/${listing.id}`)}>
                                            <td className="td-name">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <ListingThumb images={listing.images} title={listing.title} />
                                                    <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                        {listing.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#16a34a', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                ₹{listing.price?.toLocaleString('en-IN')}
                                            </td>
                                            <td><span className="badge badge-blue">{listing.category}</span></td>
                                            <td style={{ color: '#6b7280' }}>{listing.seller?.name || '—'}</td>
                                            <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                                                {listing.seller?.college || listing.college || '—'}
                                            </td>
                                            <td><StatusBadge status={listing.status} /></td>
                                            <td style={{ color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                                            </td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="admin-btn admin-btn-view" onClick={() => navigate(`/admin/listings/${listing.id}`)}>View</button>
                                                    <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal({ id: listing.id, title: listing.title })}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards ── */}
                        <div className="mobile-cards">
                            {data.listings.map((listing) => (
                                <div key={listing.id} className="m-card" onClick={() => navigate(`/admin/listings/${listing.id}`)}>
                                    <div className="m-card-header">
                                        <ListingThumb images={listing.images} title={listing.title} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="m-card-title">{listing.title}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>
                                                    ₹{listing.price?.toLocaleString('en-IN')}
                                                </span>
                                                <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{listing.category}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={listing.status} />
                                    </div>
                                    <div className="m-card-meta">
                                        {listing.seller?.name && (
                                            <span className="m-card-meta-item">👤 <strong>{listing.seller.name}</strong></span>
                                        )}
                                        {(listing.seller?.college || listing.college) && (
                                            <span className="m-card-meta-item">🎓 <strong>{listing.seller?.college || listing.college}</strong></span>
                                        )}
                                        <span className="m-card-meta-item">
                                            📅 <strong>{new Date(listing.createdAt).toLocaleDateString('en-IN')}</strong>
                                        </span>
                                    </div>
                                    <div className="m-card-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="admin-btn admin-btn-view" onClick={() => navigate(`/admin/listings/${listing.id}`)}>View Details</button>
                                        <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal({ id: listing.id, title: listing.title })}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {data.pages > 1 && (
                            <div className="admin-pagination">
                                <button className="admin-pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
                                <span className="admin-pagination-info">Page {data.page} of {data.pages}</span>
                                <button className="admin-pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page === data.pages}>Next →</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {deleteModal && (
                <div className="admin-modal-overlay" onClick={() => !deleting && setDeleteModal(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                        </div>
                        <h3>Delete Listing</h3>
                        <p>
                            Permanently delete <strong style={{ color: '#111827' }}>"{deleteModal.title}"</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="admin-modal-actions">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteModal(null)} disabled={deleting}>Cancel</button>
                            <button className="admin-btn admin-btn-danger" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminListings;
