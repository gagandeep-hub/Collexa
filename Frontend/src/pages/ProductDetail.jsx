import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const API_URL = 'https://collexa-backend-c7cu.onrender.com';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await productAPI.getOne(id);
            setProduct(res.data.product);
        } catch (error) {
            console.error('Error fetching product:', error);
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    const conditionColors = {
        'new': '#10b981',
        'like-new': '#3b82f6',
        'good': '#8b5cf6',
        'fair': '#f59e0b',
        'poor': '#ef4444'
    };

    if (loading) {
        return <div className="loading-page">Loading...</div>;
    }

    if (!product) {
        return <div className="loading-page">Product not found</div>;
    }

    return (
        <div className="product-detail-page">
            <div className="product-detail-container">
                <div className="product-images">
                    {product.images?.[0] ? (
                        <>
                            <div
                                className="blur-background"
                                style={{ backgroundImage: `url(${getImageUrl(product.images[0])})` }}
                            />
                            <img src={getImageUrl(product.images[0])} alt={product.title} className="main-image" />
                        </>
                    ) : (
                        <div className="no-image-large">📦</div>
                    )}
                </div>

                <div className="product-info-detail">
                    <span
                        className="condition-tag"
                        style={{ background: conditionColors[product.condition] }}
                    >
                        {product.condition}
                    </span>

                    <h1>{product.title}</h1>

                    <div className="price-section">
                        <span className="price">₹{product.price}</span>
                        {product.originalPrice && (
                            <>
                                <span className="original">₹{product.originalPrice}</span>
                                <span className="discount">
                                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    <div className="meta-info">
                        <span className="category">{product.category}</span>
                        <span className="views">{product.views} views</span>
                    </div>

                    <div className="description">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>

                    <div className="seller-info">
                        <h3>Seller Information</h3>
                        <div className="seller-card">
                            <div className="seller-avatar">
                                {product.seller?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div className="seller-details">
                                <p className="seller-name">{product.seller?.name}</p>
                                <p className="seller-college">{product.seller?.college || 'Campus Student'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-buttons">
                        {product.seller?.phone && (
                            <a href={`tel:${product.seller.phone}`} className="btn-call">
                                Call Seller
                            </a>
                        )}
                        {product.seller?.phone && (
                            <a
                                href={`https://wa.me/${product.seller.phone.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in your ${product.title} on Collexa`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-whatsapp"
                            >
                                WhatsApp Seller
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
