import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
                            <div className="user-menu">
                                <div className="user-avatar">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="user-name">{user?.name}</span>
                                <button onClick={handleLogout} className="btn-logout">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-login">Login</Link>
                            <Link to="/register" className="btn-register">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
