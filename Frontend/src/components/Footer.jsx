import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-main">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="logo-text">Collexa</span>
                        </Link>
                        <p className="footer-tagline">
                            The trusted marketplace for students to buy and sell second-hand items on campus.
                        </p>
                    </div>

                    <div className="footer-links-group">
                        <h4>Categories</h4>
                        <ul>
                            <li><Link to="/products?category=books">Books</Link></li>
                            <li><Link to="/products?category=electronics">Electronics</Link></li>
                            <li><Link to="/products?category=furniture">Furniture</Link></li>
                            <li><Link to="/products?category=clothing">Clothing</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/products">Browse All</Link></li>
                            <li><Link to="/add-product">Sell Item</Link></li>
                            <li><Link to="/my-products">My Listings</Link></li>
                            <li><Link to="/register">Create Account</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/how-it-works">How It Works</Link></li>
                            <li><Link to="/safety-tips">Safety Tips</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/faqs">FAQs</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Collexa. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Help</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
