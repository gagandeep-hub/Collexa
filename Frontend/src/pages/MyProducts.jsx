import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';
import './MyProducts.css';

const API_URL = 'https://collexa-backend-c7cu.onrender.com';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            await productAPI.delete(id);
            toast.success('Listing deleted successfully');
            setProducts(products.filter(p => p._id !== id));
        } catch (error) {
            toast.error('Failed to delete listing');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    const statusColors = {
        'available': '#10b981',
        'sold': '#ef4444',
        'reserved': '#f59e0b'
    };

    if (loading) {
        return <div className="loading-page">Loading your listings...</div>;
    }

    return (
        <div className="my-products-page">
            <div className="my-products-header">
                <div>
                    <h1>My Listings</h1>
                   
                </div>
                <Link to="/add-product" className="add-new-btn">
                    + Add New Listing
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="no-listings">
                    <span>📦</span>
                    <h3>No listings yet</h3>
                    <p>Start selling by adding your first item</p>
                    <Link to="/add-product" className="start-selling-btn">
                        Start Selling
                    </Link>
                </div>
            ) : (
                <div className="my-products-list">
                    {products.map((product) => (
                        <div key={product._id} className="my-product-card">
                            <div className="product-thumb">
                                {product.images?.[0] ? (
                                    <img src={getImageUrl(product.images[0])} alt={product.title} />
                                ) : (
                                    <span>📦</span>
                                )}
                            </div>
                            <div className="product-details">
                                <h3>{product.title}</h3>
                                <p className="product-meta">
                                    <span className="category">{product.category}</span>
                                    <span
                                        className="status"
                                        style={{ color: statusColors[product.status] }}
                                    >
                                        {product.status}
                                    </span>
                                </p>
                                <p className="price">₹{product.price}</p>
                            </div>
                            <div className="product-actions">
                                <Link to={`/products/${product._id}`} className="btn-view">
                                    View
                                </Link>
                                <Link to={`/edit-product/${product._id}`} className="btn-edit">
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="btn-delete"
                                >
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
