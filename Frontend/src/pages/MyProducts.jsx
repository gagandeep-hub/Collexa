import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';
import './MyProducts.css';

const API_URL = 'https://collexa-backend-c7cu.onrender.com';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('available'); // 'available' or 'sold'
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            const res = await productAPI.getMyProducts();
            setProducts(res.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent card click when clicking delete
        if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;

        try {
            await productAPI.delete(id);
            toast.success('Listing deleted successfully');
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            toast.error('Failed to delete listing');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    if (loading) {
        return (
            <div className="my-products-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#6b7280' }}>Loading your listings...</div>
            </div>
        );
    }

    const availableCount = products.filter(p => p.status === 'available').length;
    const soldCount = products.filter(p => p.status === 'sold' || p.status === 'reserved').length;

    const filteredProducts = products.filter(p => {
        if (activeTab === 'available') return p.status === 'available';
        if (activeTab === 'sold') return p.status === 'sold' || p.status === 'reserved';
        return true;
    });

    return (
        <div className="my-products-page">
            <div className="my-products-header">
                <div>
                    <h1>My Listings</h1>
                    <p>Manage your marketplace activity and sales</p>
                </div>
                <Link to="/add-product" className="add-new-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Post New Item
                </Link>
            </div>

            {/* ─── Tabs Bar ─── */}
            <div className="my-products-tabs">
                <button 
                    className={`tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    Active ({availableCount})
                </button>
                <button 
                    className={`tab ${activeTab === 'sold' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sold')}
                >
                    Sold ({soldCount})
                </button>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="no-listings">
                    <span>📦</span>
                    <h3>No {activeTab} listings</h3>
                    <p>You don't have any {activeTab} items right now.</p>
                </div>
            ) : (
                <div className="my-products-list">
                    {filteredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className="my-product-card"
                            onClick={() => navigate(`/products/${product.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="product-thumb">
                                <span className={`status-badge ${product.status}`}>
                                    {product.status === 'available' ? 'Active' : product.status}
                                </span>
                                {product.images?.[0] ? (
                                    <img src={getImageUrl(product.images[0])} alt={product.title} />
                                ) : (
                                    <span>📦</span>
                                )}
                            </div>
                            
                            <div className="product-details">
                                <div className="product-title-row">
                                    <h3>{product.title}</h3>
                                    <span className="price">₹{product.price?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="product-meta">
                                    <span className="category">{product.category}</span>
                                    <span style={{ fontSize: '0.8rem' }}>
                                        {new Date(product.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                                <Link to={`/edit-product/${product.id}`} className="btn-edit">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Edit
                                </Link>
                                <button onClick={(e) => handleDelete(product.id, e)} className="btn-delete">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProducts;
