import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Admin.css';

const Avatar = ({ user, size = 32 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.34, fontWeight: 700, color: '#fff',
        flexShrink: 0, overflow: 'hidden'
    }}>
        {user.avatar
            ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : user.name?.charAt(0).toUpperCase()
        }
    </div>
);

const ProviderBadge = ({ provider }) =>
    provider === 'google'
        ? <span className="badge badge-purple">Google</span>
        : <span className="badge badge-gray">Local</span>;

const AdminUsers = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchUsers = async (p = 1) => {
        setLoading(true);
        try {
            const res = await adminAPI.getAllUsers({ page: p, limit: 20 });
            setData(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(page); }, [page]);

    const handleDelete = async () => {
        if (!deleteModal) return;
        setDeleting(true);
        try {
            await adminAPI.deleteUser(deleteModal.id);
            toast.success(`User "${deleteModal.name}" deleted`);
            setDeleteModal(null);
            fetchUsers(page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-title">Users</h1>
                <p className="admin-page-subtitle">Manage all registered users on the platform</p>
            </div>

            <div className="admin-table-card">
                <div className="admin-table-card-header">
                    <span className="admin-table-card-title">All Users</span>
                    <span className="admin-table-count">{data.total} total</span>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-spinner" />
                        Loading users...
                    </div>
                ) : data.users.length === 0 ? (
                    <div className="admin-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                        <p>No users found</p>
                    </div>
                ) : (
                    <>
                        {/* ── Desktop Table ── */}
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>College</th>
                                        <th>Provider</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.users.map((user) => (
                                        <tr key={user._id} onClick={() => navigate(`/admin/users/${user._id}`)}>
                                            <td className="td-name">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <Avatar user={user} size={32} />
                                                    <span>
                                                        {user.name}
                                                        {user.role === 'admin' && (
                                                            <span className="badge badge-purple" style={{ marginLeft: 6 }}>Admin</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#6b7280', fontSize: '0.82rem' }}>{user.email}</td>
                                            <td>{user.phone || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                                            <td>{user.college || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                                            <td><ProviderBadge provider={user.provider} /></td>
                                            <td style={{ color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                            </td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="admin-btn admin-btn-view" onClick={() => navigate(`/admin/users/${user._id}`)}>View</button>
                                                    {user.role !== 'admin' && (
                                                        <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal({ id: user._id, name: user.name })}>Delete</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards ── */}
                        <div className="mobile-cards">
                            {data.users.map((user) => (
                                <div key={user._id} className="m-card" onClick={() => navigate(`/admin/users/${user._id}`)}>
                                    <div className="m-card-header">
                                        <Avatar user={user} size={38} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="m-card-title">
                                                {user.name}
                                                {user.role === 'admin' && <span className="badge badge-purple" style={{ marginLeft: 6 }}>Admin</span>}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>{user.email}</div>
                                        </div>
                                        <ProviderBadge provider={user.provider} />
                                    </div>
                                    <div className="m-card-meta">
                                        {user.phone && <span className="m-card-meta-item">📞 <strong>{user.phone}</strong></span>}
                                        {user.college && <span className="m-card-meta-item">🎓 <strong>{user.college}</strong></span>}
                                        <span className="m-card-meta-item">
                                            Joined <strong>{new Date(user.createdAt).toLocaleDateString('en-IN')}</strong>
                                        </span>
                                    </div>
                                    <div className="m-card-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="admin-btn admin-btn-view" onClick={() => navigate(`/admin/users/${user._id}`)}>View Details</button>
                                        {user.role !== 'admin' && (
                                            <button className="admin-btn admin-btn-danger" onClick={() => setDeleteModal({ id: user._id, name: user.name })}>Delete</button>
                                        )}
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
                        <h3>Delete User</h3>
                        <p>
                            Are you sure you want to delete <strong style={{ color: '#111827' }}>{deleteModal.name}</strong>?
                            This will also delete all their listings permanently.
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

export default AdminUsers;
