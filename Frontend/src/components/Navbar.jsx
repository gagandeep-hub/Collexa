import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-text">Collexa</span>
                </Link>

                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    <span className={`hamburger ${menuOpen ? 'active' : ''}`}></span>
                </button>

                <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
                    <Link to="/products" className="nav-link" onClick={() => setMenuOpen(false)}>
                        Explore Campus Deals
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/add-product" className="nav-link" onClick={() => setMenuOpen(false)}>
                                Sell Item
                            </Link>
                            <Link to="/my-products" className="nav-link" onClick={() => setMenuOpen(false)}>
                                My Listings
                            </Link>

                            {/* ─── User Avatar + Dropdown ───────────────────── */}
                            <div className="user-menu" ref={dropdownRef}>
                                <button
                                    className="user-avatar-btn"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    aria-label="User menu"
                                >
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="avatar" className="nav-avatar-img" />
                                    ) : (
                                        <span className="nav-avatar-initials">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    )}
                                    <span className="user-name">{user?.name?.split(' ')[0]}</span>
                                    <svg className={`dropdown-chevron ${dropdownOpen ? 'open' : ''}`} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-item" style={{ cursor: 'default', backgroundColor: 'transparent' }}>
                                            {user?.isVerified ? (
                                                <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    ✅ Verified User
                                                </span>
                                            ) : (
                                                <span style={{ color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    ⏳ Verification Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="dropdown-divider" />
                                        <Link
                                            to="/profile"
                                            className="dropdown-item"
                                            onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            Edit Profile
                                        </Link>
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="btn-register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
