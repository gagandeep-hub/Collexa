import { Link } from 'react-router-dom';
import './ProductCard.css';

const API_URL = 'https://collexa-backend-c7cu.onrender.com';

const ProductCard = ({ product }) => {
    const conditionColors = {
        'new': '#10b981',
        'like-new': '#3b82f6',
        'good': '#8b5cf6',
        'fair': '#f59e0b',
        'poor': '#ef4444'
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    return (
        <Link to={`/products/${product._id}`} className="product-card">
            <div className="product-image">
                {product.images?.[0] ? (
                    <>
                        <div
                            className="card-blur-bg"
                            style={{ backgroundImage: `url(${getImageUrl(product.images[0])})` }}
                        />
                        <img src={getImageUrl(product.images[0])} alt={product.title} className="card-main-img" />
                    </>
                ) : (
                    <div className="no-image">📦</div>
                )}
                <span
                    className="condition-badge"
                    style={{ background: conditionColors[product.condition] }}
                >
                    {product.condition}
                </span>
            </div>
            <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-category">{product.category}</p>
                <div className="product-price-row">
                    <span className="product-price">₹{product.price}</span>
                    {product.originalPrice && (
                        <span className="original-price">₹{product.originalPrice}</span>
                    )}
                </div>
                <p className="product-seller">
                    {product.seller?.name || 'Unknown'}
                </p>
                {product.location && (
                    <p className="product-location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        {product.location}
                    </p>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
