import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home">
            {/* Hero Section with Floating Items */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="floating-item item-1">📚</div>
                    <div className="floating-item item-2">💻</div>
                    <div className="floating-item item-3">🪑</div>
                    <div className="floating-item item-4">👕</div>
                    <div className="floating-item item-5">⚽</div>
                    <div className="floating-item item-6">🎸</div>
                    <div className="floating-item item-7">📱</div>
                    <div className="floating-item item-8">🎧</div>
                </div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        Buy & Sell <span className="gradient-text">Campus Items</span>
                    </h1>
                    <p className="hero-subtitle">
                        Buy and sell pre-loved items within your campus community.
                        Save money, reduce waste, and connect with fellow students—all in one place.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/products" className="btn-primary">
                            Explore Products →
                        </Link>
                        {isAuthenticated ? (
                            <Link to="/add-product" className="btn-secondary">
                                Start Selling
                            </Link>
                        ) : (
                            <Link to="/register" className="btn-secondary">
                                Create Account
                            </Link>
                        )}
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">₹50K+</span>
                            <span className="stat-label">Saved by Students</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">200+</span>
                            <span className="stat-label">Successful Deals</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">98%</span>
                            <span className="stat-label">Satisfaction Rate</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">24hrs</span>
                            <span className="stat-label">Avg. Sell Time</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Categories with Real Images */}
            <section className="categories">
                <h2 className="section-title">Popular Categories</h2>
                <p className="section-subtitle">Find what you're looking for</p>
                <div className="categories-grid">
                    <Link to="/products?category=books" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop" alt="Books" />
                        </div>
                        <div className="category-info">
                            <h3>Books</h3>
                            <p>Textbooks & Novels</p>
                        </div>
                    </Link>
                    <Link to="/products?category=electronics" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop" alt="Electronics" />
                        </div>
                        <div className="category-info">
                            <h3>Electronics</h3>
                            <p>Laptops & Gadgets</p>
                        </div>
                    </Link>
                    <Link to="/products?category=furniture" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop" alt="Furniture" />
                        </div>
                        <div className="category-info">
                            <h3>Furniture</h3>
                            <p>Desks & Chairs</p>
                        </div>
                    </Link>
                    <Link to="/products?category=clothing" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop" alt="Clothing" />
                        </div>
                        <div className="category-info">
                            <h3>Clothing</h3>
                            <p>Fashion & Accessories</p>
                        </div>
                    </Link>
                    <Link to="/products?category=sports" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop" alt="Sports" />
                        </div>
                        <div className="category-info">
                            <h3>Sports</h3>
                            <p>Equipment & Gear</p>
                        </div>
                    </Link>
                    <Link to="/products?category=stationery" className="category-card">
                        <div className="category-image">
                            <img src="https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=300&fit=crop" alt="Stationery" />
                        </div>
                        <div className="category-info">
                            <h3>Stationery</h3>
                            <p>Art & Supplies</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Why CampusResell */}
            <section className="features">
                <h2 className="section-title">Why Collexa?</h2>
                <p className="section-subtitle">The smart way to buy and sell on campus</p>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                        </div>
                        <h3>Campus Verified</h3>
                        <p>All sellers are verified students from your campus community</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                                <path d="M12 18V6" />
                            </svg>
                        </div>
                        <h3>Best Prices</h3>
                        <p>Get quality items at student-friendly prices with great deals</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <h3>Easy Meet-ups</h3>
                        <p>Coordinate easily with on-campus meetups, no shipping needed</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
                            </svg>
                        </div>
                        <h3>Sustainable</h3>
                        <p>Reduce waste by giving items a second life on campus</p>
                    </div>
                </div>
            </section>

            {/* Developer Section */}
            <section className="developer">
                <h2 className="section-title"> Developer</h2>
                <div className="developer-card">
                    <div className="developer-avatar">
                        <img src="/gagan.png" alt="Gagandeep Kushwah" />
                    </div>
                    <div className="developer-info">
                        <h3>Gagandeep Kushwah</h3>
                        <p className="developer-role">Full Stack Developer</p>
                        <p className="developer-bio">
                            Passionate about building solutions that make campus life easier.
                            Collexa was created to help students save money and reduce waste.
                        </p>
                        <div className="developer-links">
                            <a href="http://github.com/gagandeep-hub" target="_blank" rel="noopener noreferrer" className="dev-link" title="GitHub">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/in/gagandeepkushwah730221b" target="_blank" rel="noopener noreferrer" className="dev-link" title="LinkedIn">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a href="https://gagandeepdev.xyz" target="_blank" rel="noopener noreferrer" className="dev-link" title="Portfolio">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
