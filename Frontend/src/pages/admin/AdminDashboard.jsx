import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import './Admin.css';

const STAT_CARDS = [
    {
        key: 'totalUsers',
        label: 'Total Users',
        iconColor: 'green',
        cardColor: 'color-green',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        )
    },
    {
        key: 'totalListings',
        label: 'Total Listings',
        iconColor: 'blue',
        cardColor: 'color-blue',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        )
    },
    {
        key: 'activeListings',
        label: 'Active Listings',
        iconColor: 'cyan',
        cardColor: 'color-cyan',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        )
    },
    {
        key: 'oauthUsers',
        label: 'Google OAuth',
        iconColor: 'purple',
        cardColor: 'color-purple',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
            </svg>
        )
    },
    {
        key: 'localUsers',
        label: 'Local Users',
        iconColor: 'orange',
        cardColor: 'color-orange',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        )
    }
];

const MetricRow = ({ label, value, sub }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{value}</p>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{sub}</p>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminAPI.getStats();
                setStats(res.data.stats);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-title">Dashboard</h1>
                <p className="admin-page-subtitle">{now}</p>
            </div>

            {loading ? (
                <div className="admin-loading">
                    <div className="admin-spinner" />
                    Loading stats...
                </div>
            ) : error ? (
                <div className="admin-empty" style={{ color: '#dc2626' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p>{error}</p>
                </div>
            ) : (
                <>
                    {/* Stat cards */}
                    <div className="admin-stats-grid">
                        {STAT_CARDS.map((card, i) => (
                            <div
                                key={card.key}
                                className={`admin-stat-card ${card.cardColor}`}
                                style={{ animationDelay: `${i * 0.07}s` }}
                            >
                                <div className={`stat-icon ${card.iconColor}`}>{card.icon}</div>
                                <div className="stat-value">{stats?.[card.key]?.toLocaleString() ?? '—'}</div>
                                <div className="stat-label">{card.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Summary metrics */}
                    <div className="admin-table-card" style={{ marginTop: 4 }}>
                        <div className="admin-table-card-header">
                            <span className="admin-table-card-title">Platform Summary</span>
                        </div>
                        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px 32px' }}>
                            <MetricRow
                                label="Active Rate"
                                value={`${stats.totalListings > 0 ? Math.round((stats.activeListings / stats.totalListings) * 100) : 0}%`}
                                sub="of listings are active"
                            />
                            <MetricRow
                                label="OAuth Rate"
                                value={`${stats.totalUsers > 0 ? Math.round((stats.oauthUsers / stats.totalUsers) * 100) : 0}%`}
                                sub="users via Google"
                            />
                            <MetricRow
                                label="Avg Listings / User"
                                value={stats.totalUsers > 0 ? (stats.totalListings / stats.totalUsers).toFixed(1) : '0'}
                                sub="listings per user"
                            />
                            <MetricRow
                                label="Sold / Reserved"
                                value={stats.totalListings - stats.activeListings}
                                sub="listings inactive"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
