import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import toast from 'react-hot-toast';
import './AddProduct.css';

const API_URL = 'https://collexa-backend-c7cu.onrender.com';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        condition: '',
        location: '',
        status: 'available'
    });

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await productAPI.getOne(id);
            const product = res.data.product;
            setFormData({
                title: product.title || '',
                description: product.description || '',
                price: product.price || '',
                originalPrice: product.originalPrice || '',
                category: product.category || '',
                condition: product.condition || '',
                location: product.location || '',
                status: product.status || 'available'
            });
            setExistingImages(product.images || []);
        } catch (error) {
            toast.error('Failed to fetch product');
            navigate('/my-products');
        } finally {
            setFetching(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + images.length + files.length;
        if (totalImages > 5) {
            toast.error('You can have maximum 5 images');
            return;
        }
        setImages([...images, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeExistingImage = (index) => {
        const newImages = [...existingImages];
        newImages.splice(index, 1);
        setExistingImages(newImages);
    };

    const removeNewImage = (index) => {
        const newImages = [...images];
        const newPreviews = [...previews];
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);
        setImages(newImages);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            if (formData.originalPrice) {
                data.append('originalPrice', formData.originalPrice);
            }
            data.append('category', formData.category);
            data.append('condition', formData.condition);
            data.append('status', formData.status);
            if (formData.location) {
                data.append('location', formData.location);
            }

            // Keep existing images
            existingImages.forEach(img => {
                data.append('existingImages', img);
            });

            // Add new images
            images.forEach(image => {
                data.append('images', image);
            });

            await productAPI.updateWithImages(id, data);
            toast.success('Listing updated successfully!');
            navigate('/my-products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update listing');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="add-product-page"><div className="add-product-container">Loading...</div></div>;
    }

    return (
        <div className="add-product-page">
            <div className="add-product-container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h1>Edit Listing</h1>
                <p className="subtitle">Update your product details</p>

                <form onSubmit={handleSubmit} className="add-product-form">
                    {/* Image Upload */}
                    <div className="form-group">
                        <label>Product Images (Max 5)</label>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="image-previews" style={{ marginBottom: '1rem' }}>
                                {existingImages.map((img, index) => (
                                    <div key={`existing-${index}`} className="preview-item">
                                        <img src={getImageUrl(img)} alt={`Existing ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeExistingImage(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="image-upload-area">
                            <input
                                type="file"
                                id="images"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="file-input"
                            />
                            <label htmlFor="images" className="upload-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17,8 12,3 7,8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span>Add more images</span>
                            </label>
                        </div>

                        {previews.length > 0 && (
                            <div className="image-previews">
                                {previews.map((preview, index) => (
                                    <div key={`new-${index}`} className="preview-item">
                                        <img src={preview} alt={`New ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeNewImage(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="What are you selling?"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your item in detail..."
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="price">Price (₹) *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Selling price"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="originalPrice">Original Price (₹)</label>
                            <input
                                type="number"
                                id="originalPrice"
                                name="originalPrice"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                placeholder="Optional"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select category</option>
                                <option value="books">Books</option>
                                <option value="electronics">Electronics</option>
                                <option value="furniture">Furniture</option>
                                <option value="clothing">Clothing</option>
                                <option value="sports">Sports</option>
                                <option value="stationery">Stationery</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="condition">Condition *</label>
                            <select
                                id="condition"
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select condition</option>
                                <option value="new">New</option>
                                <option value="like-new">Like New</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">


                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="available">Available</option>
                                <option value="reserved">Reserved</option>
                                <option value="sold">Sold</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
